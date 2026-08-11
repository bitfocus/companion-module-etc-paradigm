const EventEmitter = require('node:events')

jest.mock('@companion-module/base', () => {
	const original = jest.requireActual('@companion-module/base')
	return {
		...original,
		InstanceBase: jest.fn(),
		runEntrypoint: jest.fn(),
	}
})
jest.mock('../paradigm')
jest.mock('../variables', () => jest.fn())
jest.mock('../actions', () => jest.fn())
jest.mock('../feedbacks', () => jest.fn())

const { InstanceStatus } = require('@companion-module/base')
const Paradigm = require('../paradigm')
const UpdateVariableDefinitions = require('../variables')
const UpdateActions = require('../actions')
const UpdateFeedbacks = require('../feedbacks')
const ModuleInstance = require('../main')
const { parseWatchList, makeVariableId, watchKey } = ModuleInstance

async function flushMicrotasks(times = 5) {
	for (let i = 0; i < times; i++) await Promise.resolve()
}

function makeFakeDevice() {
	const dev = new EventEmitter()
	dev.open = jest.fn(() => Promise.resolve())
	dev.close = jest.fn()
	dev.send = jest.fn()
	dev.queryMacro = jest.fn()
	dev.queryPreset = jest.fn()
	dev.queryChannel = jest.fn()
	dev.queryWall = jest.fn()
	dev.querySequence = jest.fn()
	dev.queryOverride = jest.fn()
	dev.queryGroup = jest.fn()
	return dev
}

describe('main.js', () => {
	afterEach(() => {
		jest.clearAllMocks()
		jest.useRealTimers()
	})

	describe('parseWatchList', () => {
		it('parses a basic macro entry', () => {
			expect(parseWatchList('macro Macro 1')).toEqual([
				{ type: 'macro', name: 'Macro 1', space: undefined, htp: false, variableId: 'macro_macro_1_state', label: 'Macro 1' },
			])
		})

		it('resolves type aliases (pst/chan/seq/ovr/grp)', () => {
			const out = parseWatchList(['pst Preset 1', 'chan Dimmer 2', 'seq Seq 1', 'ovr Override 1', 'grp Group 1'].join('\n'))
			expect(out.map((e) => e.type)).toEqual(['preset', 'channel', 'sequence', 'override', 'group'])
		})

		it('parses an optional space after @', () => {
			const [entry] = parseWatchList('pst Houselight 3 -OFF @ Primary Space 1')
			expect(entry).toEqual({
				type: 'preset',
				name: 'Houselight 3 -OFF',
				space: 'Primary Space 1',
				htp: false,
				variableId: 'preset_houselight_3_off_primary_space_1_state',
				label: 'Houselight 3 -OFF @ Primary Space 1',
			})
		})

		it('flags :htp suffix on the type token', () => {
			const [entry] = parseWatchList('pst:htp Preset 1')
			expect(entry.type).toBe('preset')
			expect(entry.htp).toBe(true)
		})

		it('uses "level" suffix for channel/group and "state" for everything else', () => {
			const out = parseWatchList('chan Dimmer 2\ngrp Group 1\nmacro Macro 1')
			expect(out[0].variableId).toBe('channel_dimmer_2_level')
			expect(out[1].variableId).toBe('group_group_1_level')
			expect(out[2].variableId).toBe('macro_macro_1_state')
		})

		it('ignores blank lines and comments', () => {
			const out = parseWatchList('\n# a comment\n  \nmacro Macro 1\n')
			expect(out).toHaveLength(1)
			expect(out[0].name).toBe('Macro 1')
		})

		it('ignores lines with an unknown type', () => {
			expect(parseWatchList('bogus Something')).toHaveLength(0)
		})

		it('ignores lines with no name after the type', () => {
			expect(parseWatchList('macro   ')).toHaveLength(0)
		})

		it('splits entries on semicolons as well as newlines', () => {
			const out = parseWatchList('macro Macro 1; macro Macro 2')
			expect(out.map((e) => e.name)).toEqual(['Macro 1', 'Macro 2'])
		})

		it('disambiguates colliding variable IDs with _2, _3, …', () => {
			const out = parseWatchList('macro Macro!1\nmacro Macro?1\nmacro Macro#1')
			expect(out.map((e) => e.variableId)).toEqual([
				'macro_macro_1_state',
				'macro_macro_1_state_2',
				'macro_macro_1_state_3',
			])
		})
	})

	describe('makeVariableId', () => {
		it('slugifies name and space, joined with the type', () => {
			expect(makeVariableId('preset', 'Houselight 3 -OFF', 'Primary Space 1')).toBe(
				'preset_houselight_3_off_primary_space_1_state',
			)
		})

		it('omits the space segment when space is falsy', () => {
			expect(makeVariableId('macro', 'Macro 1')).toBe('macro_macro_1_state')
		})

		it('uses "level" suffix for channel and group types', () => {
			expect(makeVariableId('channel', 'Dimmer 2')).toBe('channel_dimmer_2_level')
			expect(makeVariableId('group', 'Group 1')).toBe('group_group_1_level')
		})

		it('trims leading/trailing separators produced by slugification', () => {
			expect(makeVariableId('macro', '  Macro 1!!')).toBe('macro_macro_1_state')
		})
	})

	describe('watchKey', () => {
		it('lowercases the name but passes the type through as given', () => {
			expect(watchKey('macro', 'Macro 1')).toBe('macro|macro 1')
			expect(watchKey('Macro', 'Macro 1')).toBe('Macro|macro 1')
		})

		it('appends a lowercased space segment when provided', () => {
			expect(watchKey('preset', 'Preset 1', 'Space 1')).toBe('preset|preset 1|space 1')
		})

		it('omits the space segment entirely when space is undefined', () => {
			expect(watchKey('preset', 'Preset 1', undefined)).toBe('preset|preset 1')
		})
	})

	describe('ModuleInstance', () => {
		let instance
		let device

		beforeEach(() => {
			device = makeFakeDevice()
			Paradigm.mockImplementation(() => device)

			instance = new ModuleInstance('')
			instance.updateStatus = jest.fn()
			instance.log = jest.fn()
			instance.setVariableDefinitions = jest.fn()
			instance.setVariableValues = jest.fn()
			instance.checkFeedbacks = jest.fn()
			instance.getVariableValue = jest.fn()
			instance.parseVariablesInString = jest.fn(async (s) => s)
		})

		afterEach(async () => {
			await instance._disconnect()
		})

		describe('getConfigFields', () => {
			it('returns the expected config field ids', () => {
				const ids = instance.getConfigFields().map((f) => f.id)
				expect(ids).toEqual(['host', 'port', 'terminator', 'pollFrequency', 'watchListHelp', 'watchList'])
			})
		})

		describe('_connect', () => {
			it('reports BadConfig and does not open a device when host is missing', async () => {
				instance.config = {}
				await instance._connect()
				expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.BadConfig, 'No host configured')
				expect(Paradigm).not.toHaveBeenCalled()
			})

			it('opens the device with configured host/port/terminator and reports Ok', async () => {
				instance.config = { host: '10.0.0.5', port: 4703, terminator: 'crlf', watchList: '' }
				const connectPromise = instance._connect()
				// let _connect() reach _ping()'s listener registration before firing 'raw'
				await flushMicrotasks()
				device.emit('raw', 'help')
				await connectPromise
				expect(Paradigm).toHaveBeenCalledWith({ host: '10.0.0.5', port: 4703, terminator: 'crlf' })
				expect(device.open).toHaveBeenCalled()
				expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.Ok)
			})

			it('falls back to the default PSAP port and cr terminator', async () => {
				instance.config = { host: '10.0.0.5', watchList: '' }
				const connectPromise = instance._connect()
				await flushMicrotasks()
				device.emit('raw', 'help')
				await connectPromise
				expect(Paradigm).toHaveBeenCalledWith({ host: '10.0.0.5', port: Paradigm.DEFAULT_PORT, terminator: 'cr' })
			})

			it('reports ConnectionFailure and schedules a reconnect when open() rejects', async () => {
				jest.useFakeTimers()
				device.open = jest.fn(() => Promise.reject(new Error('EHOSTUNREACH')))
				instance.config = { host: '10.0.0.5', watchList: '' }
				await instance._connect()
				expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.ConnectionFailure, 'EHOSTUNREACH')
				expect(instance.reconnectTimer).toBeDefined()
			})
		})

		describe('_onSocketError', () => {
			it('reports UnknownError and schedules a reconnect', () => {
				jest.useFakeTimers()
				instance._onSocketError(new Error('boom'))
				expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.UnknownError, 'boom')
				expect(instance.reconnectTimer).toBeDefined()
			})
		})

		describe('_ping', () => {
			it('resolves as soon as any raw line arrives, without warning', async () => {
				instance.device = device
				const pingPromise = instance._ping()
				device.emit('raw', 'help')
				await pingPromise
				expect(instance.log).not.toHaveBeenCalledWith('warn', expect.anything())
			})

			it('warns if nothing arrives within the timeout', async () => {
				jest.useFakeTimers()
				instance.device = device
				const pingPromise = instance._ping()
				jest.advanceTimersByTime(2000)
				await pingPromise
				expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('No PSAP reply'))
			})
		})

		describe('_rebuildWatchIndex / _pollOnce', () => {
			it('does nothing when there is no device or watch list', () => {
				instance.config = { watchList: '' }
				instance._rebuildWatchIndex()
				instance.device = undefined
				instance._pollOnce()
				expect(device.queryMacro).not.toHaveBeenCalled()
			})

			it('dispatches the correct query per watched type', () => {
				instance.config = {
					watchList: [
						'macro Macro 1',
						'pst Preset 1 @ Space 1',
						'chan Dimmer 2',
						'wall Wall 1',
						'seq Seq 1',
						'ovr Override 1',
						'grp Group 1',
					].join('\n'),
				}
				instance._rebuildWatchIndex()
				instance.device = device
				instance._pollOnce()

				expect(device.queryMacro).toHaveBeenCalledWith('Macro 1')
				expect(device.queryPreset).toHaveBeenCalledWith('Preset 1', 'Space 1', false)
				expect(device.queryChannel).toHaveBeenCalledWith('Dimmer 2', undefined)
				expect(device.queryWall).toHaveBeenCalledWith('Wall 1', undefined)
				expect(device.querySequence).toHaveBeenCalledWith('Seq 1', undefined)
				expect(device.queryOverride).toHaveBeenCalledWith('Override 1')
				expect(device.queryGroup).toHaveBeenCalledWith('Group 1', undefined)
			})

			it('logs and continues when a dispatch throws', () => {
				instance.config = { watchList: 'macro Macro 1' }
				instance._rebuildWatchIndex()
				instance.device = device
				device.queryMacro.mockImplementation(() => {
					throw new Error('send failed')
				})
				expect(() => instance._pollOnce()).not.toThrow()
				expect(instance.log).toHaveBeenCalledWith('error', expect.stringContaining('send failed'))
			})
		})

		describe('_onReply', () => {
			beforeEach(() => {
				instance.config = { watchList: 'pst Preset 1 @ Space 1\nchan Dimmer 2' }
				instance._rebuildWatchIndex()
			})

			it('sets the variable value and checks feedbacks on an exact (type,name,space) match', () => {
				instance._onReply({ type: 'preset', state: 'act', name: 'Preset 1', space: 'Space 1' })
				expect(instance.setVariableValues).toHaveBeenCalledWith({ preset_preset_1_space_1_state: 'act' })
				expect(instance.checkFeedbacks).toHaveBeenCalled()
			})

			it('uses level (not state) for channel replies', () => {
				instance._onReply({ type: 'channel', level: 128, name: 'Dimmer 2', space: undefined })
				expect(instance.setVariableValues).toHaveBeenCalledWith({ channel_dimmer_2_level: 128 })
			})

			it('ignores replies that match nothing in the watch list', () => {
				instance._onReply({ type: 'preset', state: 'act', name: 'Unwatched Preset', space: undefined })
				expect(instance.setVariableValues).not.toHaveBeenCalled()
			})

			it('falls back to a bare-name entry when the reply carries an unwatched space', () => {
				instance.config = { watchList: 'macro Macro 1' }
				instance._rebuildWatchIndex()
				instance._onReply({ type: 'macro', state: 'on', name: 'Macro 1' })
				expect(instance.setVariableValues).toHaveBeenCalledWith({ macro_macro_1_state: 'on' })
			})
		})

		describe('init / configUpdated / destroy', () => {
			it('init connects and (re)builds variables/actions/feedbacks', async () => {
				instance.config = undefined
				const config = { host: '10.0.0.5', watchList: '' }
				const initPromise = instance.init(config)
				await flushMicrotasks()
				device.emit('raw', 'help')
				await initPromise

				expect(instance.config).toEqual(config)
				expect(UpdateVariableDefinitions).toHaveBeenCalledWith(instance)
				expect(UpdateActions).toHaveBeenCalledWith(instance)
				expect(UpdateFeedbacks).toHaveBeenCalledWith(instance)
			})

			it('configUpdated reconnects with the new config', async () => {
				instance.config = { host: '10.0.0.5', watchList: '' }
				const firstConnect = instance.init(instance.config)
				await flushMicrotasks()
				device.emit('raw', 'help')
				await firstConnect

				const newDevice = makeFakeDevice()
				Paradigm.mockImplementation(() => newDevice)
				const newConfig = { host: '10.0.0.9', watchList: '' }
				const updatePromise = instance.configUpdated(newConfig)
				await flushMicrotasks()
				newDevice.emit('raw', 'help')
				await updatePromise

				expect(instance.config).toEqual(newConfig)
				expect(Paradigm).toHaveBeenLastCalledWith(expect.objectContaining({ host: '10.0.0.9' }))
			})

			it('destroy tears down the connection', async () => {
				instance.config = { host: '10.0.0.5', watchList: '' }
				const connectPromise = instance._connect()
				await flushMicrotasks()
				device.emit('raw', 'help')
				await connectPromise

				await instance.destroy()
				expect(device.close).toHaveBeenCalled()
				expect(instance.device).toBeUndefined()
			})
		})
	})
})
