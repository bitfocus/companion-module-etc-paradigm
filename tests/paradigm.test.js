const EventEmitter = require('node:events')

jest.mock('node:dgram', () => ({
	createSocket: jest.fn(),
}))

const dgram = require('node:dgram')
const Paradigm = require('../paradigm')

const FAKE_RINFO = { address: '10.0.0.1', port: 4703 }

function emitMessage(sock, str) {
	sock.emit('message', Buffer.from(str), FAKE_RINFO)
}

function makeFakeSocket() {
	const sock = new EventEmitter()
	sock.bind = jest.fn((port, addr, cb) => {
		setImmediate(() => sock.emit('listening'))
		if (cb) setImmediate(cb)
	})
	sock.address = jest.fn(() => ({ address: '0.0.0.0', port: 55000 }))
	sock.send = jest.fn((payload, port, host, cb) => cb && cb())
	sock.close = jest.fn()
	return sock
}

describe('Paradigm', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('_parseReply', () => {
		it.each([
			['macro on Macro 1', { type: 'macro', state: 'on', name: 'Macro 1' }],
			['Macro Off Macro 2', { type: 'macro', state: 'off', name: 'Macro 2' }],
			['macro running Macro 3', { type: 'macro', state: 'running', name: 'Macro 3' }],
			['wall open Wall 1, Primary Space 1', { type: 'wall', state: 'open', name: 'Wall 1', space: 'Primary Space 1' }],
			['wall close Wall 1', { type: 'wall', state: 'close', name: 'Wall 1', space: undefined }],
			['pst act Preset 1, Space 1', { type: 'preset', state: 'act', name: 'Preset 1', space: 'Space 1' }],
			['pst acth Preset 1', { type: 'preset', state: 'acth', name: 'Preset 1', space: undefined }],
			['seq start Seq 1, Space 1', { type: 'sequence', state: 'start', name: 'Seq 1', space: 'Space 1' }],
			['seq pause Seq 1', { type: 'sequence', state: 'pause', name: 'Seq 1', space: undefined }],
			['ovr enab Override 1', { type: 'override', state: 'enab', name: 'Override 1' }],
			['chan int:128 Dimmer 2, Space 1', { type: 'channel', level: 128, name: 'Dimmer 2', space: 'Space 1' }],
			['grp int:64 Group 1', { type: 'group', level: 64, name: 'Group 1', space: undefined }],
		])('parses %s', (line, expected) => {
			expect(Paradigm._parseReply(line)).toEqual(expected)
		})

		it('returns null for unrecognized head tokens', () => {
			expect(Paradigm._parseReply('garbage line here')).toBeNull()
		})

		it('returns null when the sub-state does not match a known verb', () => {
			expect(Paradigm._parseReply('macro nonsense Macro 1')).toBeNull()
			expect(Paradigm._parseReply('chan foo:128 Dimmer 2')).toBeNull()
		})
	})

	describe('_splitCommaTail', () => {
		it('splits a name and space', () => {
			expect(Paradigm._splitCommaTail('Dimmer 2, Primary Space 1')).toEqual(['Dimmer 2', 'Primary Space 1'])
		})

		it('returns an undefined space when no comma is present', () => {
			expect(Paradigm._splitCommaTail('Dimmer 2')).toEqual(['Dimmer 2', undefined])
		})
	})

	describe('open / close / send', () => {
		let sock

		beforeEach(() => {
			sock = makeFakeSocket()
			dgram.createSocket.mockReturnValue(sock)
		})

		it('resolves once the socket starts listening and stores it', async () => {
			const p = new Paradigm({ host: '10.0.0.1' })
			await p.open()
			expect(p.socket).toBe(sock)
			expect(sock.bind).toHaveBeenCalledWith(0, '0.0.0.0', expect.any(Function))
		})

		it('rejects if bind reports an error', async () => {
			sock.bind = jest.fn((port, addr, cb) => cb(new Error('EADDRINUSE')))
			const p = new Paradigm({ host: '10.0.0.1' })
			await expect(p.open()).rejects.toThrow('EADDRINUSE')
		})

		it('throws synchronously when sending without an open socket', () => {
			const p = new Paradigm({ host: '10.0.0.1' })
			expect(() => p.send('help')).toThrow('PSAP socket is not open')
		})

		it('sends the command plus terminator to host:port', async () => {
			const p = new Paradigm({ host: '10.0.0.1', port: 4703 })
			await p.open()
			p.send('help')
			expect(sock.send).toHaveBeenCalledWith(Buffer.from('help\r', 'utf8'), 4703, '10.0.0.1', expect.any(Function))
		})

		it('uses the configured terminator', async () => {
			const p = new Paradigm({ host: '10.0.0.1', terminator: 'crlf' })
			await p.open()
			p.send('help')
			expect(sock.send.mock.calls[0][0]).toEqual(Buffer.from('help\r\n', 'utf8'))
		})

		it('emits an error and skips sending when the payload exceeds 512 bytes', async () => {
			const p = new Paradigm({ host: '10.0.0.1' })
			await p.open()
			const onError = jest.fn()
			p.on('error', onError)
			p.send('x'.repeat(600))
			expect(onError).toHaveBeenCalledWith(expect.any(Error))
			expect(sock.send).not.toHaveBeenCalled()
		})

		it('emits an error when the underlying socket.send reports one', async () => {
			sock.send = jest.fn((payload, port, host, cb) => cb(new Error('boom')))
			const p = new Paradigm({ host: '10.0.0.1' })
			await p.open()
			const onError = jest.fn()
			p.on('error', onError)
			p.send('help')
			expect(onError).toHaveBeenCalledWith(expect.any(Error))
		})

		it('forwards socket error events', async () => {
			const p = new Paradigm({ host: '10.0.0.1' })
			const onError = jest.fn()
			p.on('error', onError)
			await p.open()
			sock.emit('error', new Error('socket died'))
			expect(onError).toHaveBeenCalledWith(expect.any(Error))
		})

		it('close() closes the socket and clears state', async () => {
			const p = new Paradigm({ host: '10.0.0.1' })
			await p.open()
			p.buffer = 'partial'
			p.close()
			expect(sock.close).toHaveBeenCalled()
			expect(p.socket).toBeNull()
			expect(p.buffer).toBe('')
		})
	})

	describe('incoming message handling', () => {
		let sock, p

		beforeEach(async () => {
			sock = makeFakeSocket()
			dgram.createSocket.mockReturnValue(sock)
			p = new Paradigm({ host: '10.0.0.1' })
			await p.open()
		})

		it('emits raw + reply for a single complete line', () => {
			const raw = jest.fn()
			const reply = jest.fn()
			p.on('raw', raw)
			p.on('reply', reply)
			emitMessage(sock, 'macro on Macro 1\r')
			expect(raw).toHaveBeenCalledWith('macro on Macro 1')
			expect(reply).toHaveBeenCalledWith({ type: 'macro', state: 'on', name: 'Macro 1' })
		})

		it('buffers a line split across multiple UDP packets', () => {
			const reply = jest.fn()
			p.on('reply', reply)
			emitMessage(sock, 'macro on Mac')
			expect(reply).not.toHaveBeenCalled()
			emitMessage(sock, 'ro 1\r')
			expect(reply).toHaveBeenCalledWith({ type: 'macro', state: 'on', name: 'Macro 1' })
		})

		it('handles multiple lines delivered in a single packet', () => {
			const reply = jest.fn()
			p.on('reply', reply)
			emitMessage(sock, 'macro on A\rmacro off B\r')
			expect(reply).toHaveBeenNthCalledWith(1, { type: 'macro', state: 'on', name: 'A' })
			expect(reply).toHaveBeenNthCalledWith(2, { type: 'macro', state: 'off', name: 'B' })
		})

		it('treats CRLF as a single terminator, not a blank extra line', () => {
			const raw = jest.fn()
			p.on('raw', raw)
			emitMessage(sock, 'macro on A\r\n')
			expect(raw).toHaveBeenCalledTimes(1)
			expect(raw).toHaveBeenCalledWith('macro on A')
		})

		it('emits psapError for error lines and skips the reply event', () => {
			const reply = jest.fn()
			const psapError = jest.fn()
			p.on('reply', reply)
			p.on('psapError', psapError)
			emitMessage(sock, 'error invalid macro "Macro 1"\r')
			expect(psapError).toHaveBeenCalledWith('error invalid macro "Macro 1"')
			expect(reply).not.toHaveBeenCalled()
		})

		it('ignores blank lines', () => {
			const raw = jest.fn()
			p.on('raw', raw)
			emitMessage(sock, '\r\r')
			expect(raw).not.toHaveBeenCalled()
		})
	})

	describe('command helpers', () => {
		let p

		beforeEach(() => {
			p = new Paradigm({ host: '10.0.0.1' })
			p.send = jest.fn()
		})

		it('macro()', () => {
			p.macro('on', 'Macro 1')
			expect(p.send).toHaveBeenCalledWith('macro on Macro 1')
		})

		describe('preset()', () => {
			it('sends a bare activate', () => {
				p.preset({ action: 'act', name: 'Preset 1' })
				expect(p.send).toHaveBeenCalledWith('pst act Preset 1')
			})

			it('appends space and fade', () => {
				p.preset({ action: 'act', name: 'Preset 1', space: 'Space 1', fade: 2.5 })
				expect(p.send).toHaveBeenCalledWith('pst act Preset 1, Space 1, 2.5')
			})

			it('appends priority to the verb', () => {
				p.preset({ action: 'act', name: 'Preset 1', priority: 100 })
				expect(p.send).toHaveBeenCalledWith('pst act:100 Preset 1')
			})

			it('ignores priority for rec/dact/dacth', () => {
				p.preset({ action: 'rec', name: 'Preset 1', priority: 100 })
				expect(p.send).toHaveBeenLastCalledWith('pst rec Preset 1')
				p.preset({ action: 'dact', name: 'Preset 1', priority: 100 })
				expect(p.send).toHaveBeenLastCalledWith('pst dact Preset 1')
				p.preset({ action: 'dacth', name: 'Preset 1', priority: 100 })
				expect(p.send).toHaveBeenLastCalledWith('pst dacth Preset 1')
			})

			it('omits fade for rec', () => {
				p.preset({ action: 'rec', name: 'Preset 1', fade: 2 })
				expect(p.send).toHaveBeenCalledWith('pst rec Preset 1')
			})
		})

		describe('channel()', () => {
			it('sends int with a value', () => {
				p.channel({ action: 'int', name: 'Dimmer 2', value: '50%' })
				expect(p.send).toHaveBeenCalledWith('chan int:50% Dimmer 2')
			})

			it('toggle ignores the value', () => {
				p.channel({ action: 'tog', name: 'Dimmer 2', value: '50%' })
				expect(p.send).toHaveBeenCalledWith('chan tog Dimmer 2')
			})

			it('appends space and fade', () => {
				p.channel({ action: 'ras', name: 'Dimmer 2', value: '5%', space: 'Space 1', fade: 1 })
				expect(p.send).toHaveBeenCalledWith('chan ras:5% Dimmer 2, Space 1, 1')
			})

			it('omits fade for min/max', () => {
				p.channel({ action: 'max', name: 'Dimmer 2', value: '100%', fade: 2 })
				expect(p.send).toHaveBeenCalledWith('chan max:100% Dimmer 2')
			})
		})

		it('wall()', () => {
			p.wall({ action: 'open', name: 'Wall 1', space: 'Space 1' })
			expect(p.send).toHaveBeenCalledWith('wall open Wall 1, Space 1')
		})

		describe('sequence()', () => {
			it('start with priority and space', () => {
				p.sequence({ action: 'start', name: 'Seq 1', space: 'Space 1', priority: 50 })
				expect(p.send).toHaveBeenCalledWith('seq start:50 Seq 1, Space 1')
			})

			it('stop includes space', () => {
				p.sequence({ action: 'stop', name: 'Seq 1', space: 'Space 1' })
				expect(p.send).toHaveBeenCalledWith('seq stop Seq 1, Space 1')
			})

			it('pause omits space even if provided', () => {
				p.sequence({ action: 'pause', name: 'Seq 1', space: 'Space 1' })
				expect(p.send).toHaveBeenCalledWith('seq pause Seq 1')
			})

			it('rate uses the value', () => {
				p.sequence({ action: 'rate', name: 'Seq 1', value: 2 })
				expect(p.send).toHaveBeenCalledWith('seq rate:2 Seq 1')
			})
		})

		it('override()', () => {
			p.override({ action: 'enab', name: 'Override 1' })
			expect(p.send).toHaveBeenCalledWith('ovr enab Override 1')
		})

		describe('space()', () => {
			it('off ignores the value', () => {
				p.space({ action: 'off', name: 'Space 1', value: '50%' })
				expect(p.send).toHaveBeenCalledWith('spc off Space 1')
			})

			it('master appends value and fade', () => {
				p.space({ action: 'master', name: 'Space 1', value: '50%', fade: 3 })
				expect(p.send).toHaveBeenCalledWith('spc master:50% Space 1, 3')
			})
		})
	})

	describe('status queries', () => {
		let p

		beforeEach(() => {
			p = new Paradigm({ host: '10.0.0.1' })
			p.send = jest.fn()
		})

		it('queryChannel with and without space', () => {
			p.queryChannel('Dimmer 2', 'Space 1')
			expect(p.send).toHaveBeenLastCalledWith('chan get Dimmer 2, Space 1')
			p.queryChannel('Dimmer 2')
			expect(p.send).toHaveBeenLastCalledWith('chan get Dimmer 2')
		})

		it('queryPreset defaults to LTP, geth for HTP', () => {
			p.queryPreset('Preset 1', 'Space 1')
			expect(p.send).toHaveBeenLastCalledWith('pst get Preset 1, Space 1')
			p.queryPreset('Preset 1', undefined, true)
			expect(p.send).toHaveBeenLastCalledWith('pst geth Preset 1')
		})

		it('queryMacro', () => {
			p.queryMacro('Macro 1')
			expect(p.send).toHaveBeenCalledWith('macro get Macro 1')
		})

		it('queryWall', () => {
			p.queryWall('Wall 1', 'Space 1')
			expect(p.send).toHaveBeenCalledWith('wall get Wall 1, Space 1')
		})

		it('querySequence', () => {
			p.querySequence('Seq 1')
			expect(p.send).toHaveBeenCalledWith('seq get Seq 1')
		})

		it('queryOverride', () => {
			p.queryOverride('Override 1')
			expect(p.send).toHaveBeenCalledWith('ovr get Override 1')
		})

		it('queryGroup', () => {
			p.queryGroup('Group 1', 'Space 1')
			expect(p.send).toHaveBeenCalledWith('grp get Group 1, Space 1')
		})
	})
})
