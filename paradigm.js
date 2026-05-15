const dgram = require('node:dgram')
const EventEmitter = require('node:events')

const DEFAULT_PORT = 4703
const TERMINATORS = {
	cr: '\r',
	crlf: '\r\n',
	lf: '\n',
}

/**
 * Paradigm Serial Access Protocol (PSAP) client over UDP.
 *
 * Wire format is plain ASCII commands terminated by a configurable end-of-message
 * character (CR by default). Replies arrive on the same socket — Paradigm sends them
 * back to the source port the command came from.
 *
 * Emits:
 *   'reply'  (parsed reply object) — see _parseReply for the shape
 *   'raw'    (string)              — every received line, before parsing
 *   'error'  (Error)
 */
class Paradigm extends EventEmitter {
	constructor({ host, port = DEFAULT_PORT, terminator = 'cr' } = {}) {
		super()
		this.host = host
		this.port = port
		this.terminator = TERMINATORS[terminator] ?? TERMINATORS.cr
		this.socket = null
		this.buffer = ''
	}

	open() {
		return new Promise((resolve, reject) => {
			const sock = dgram.createSocket({ type: 'udp4', reuseAddr: true })
			sock.on('message', (msg, rinfo) => {
				this.emit('debug', `recv ${rinfo.address}:${rinfo.port} ${msg.length}B`)
				this._onMessage(msg)
			})
			sock.on('error', (err) => this.emit('error', err))
			sock.once('listening', () => {
				this.socket = sock
				const addr = sock.address()
				this.emit('debug', `bound ${addr.address}:${addr.port}`)
				resolve()
			})
			sock.bind(0, '0.0.0.0', (err) => {
				if (err) reject(err)
			})
		})
	}

	close() {
		if (this.socket) {
			try { this.socket.close() } catch { /* already closed */ }
			this.socket = null
		}
		this.buffer = ''
	}

	send(cmd) {
		if (!this.socket) throw new Error('PSAP socket is not open')
		const payload = Buffer.from(cmd + this.terminator, 'utf8')
		if (payload.length > 512) {
			this.emit('error', new Error(`PSAP packet exceeds 512 bytes: ${cmd}`))
			return
		}
		this.emit('debug', `send ${this.host}:${this.port} ${JSON.stringify(cmd)}`)
		this.socket.send(payload, this.port, this.host, (err) => {
			if (err) this.emit('error', err)
		})
	}

	_onMessage(msg) {
		this.buffer += msg.toString('utf8')
		let idx
		while ((idx = this.buffer.search(/[\r\n]/)) !== -1) {
			const line = this.buffer.slice(0, idx).trim()
			this.buffer = this.buffer.slice(idx + 1)
			if (this.buffer.startsWith('\n')) this.buffer = this.buffer.slice(1)
			if (!line.length) continue
			this.emit('raw', line)
			const parsed = Paradigm._parseReply(line)
			if (parsed) this.emit('reply', parsed)
		}
	}

	/**
	 * Parse a PSAP reply line into a normalized object.
	 *
	 * Returns one of:
	 *   { type: 'macro',    state: 'on'|'off'|'running', name }
	 *   { type: 'preset',   state: 'act'|'dact'|'alt'|'acth'|'dacth'|'alth', name, space }
	 *   { type: 'wall',     state: 'open'|'close', name, space }
	 *   { type: 'sequence', state: 'start'|'stop'|'pause', name, space }
	 *   { type: 'override', state: 'enab'|'disab', name }
	 *   { type: 'channel',  level: 0..255, name, space }
	 *   { type: 'group',    level: 0..255, name, space }
	 *   null if unrecognized
	 */
	static _parseReply(line) {
		const m = line.match(/^([A-Za-z]+)\s+(.+)$/)
		if (!m) return null
		const head = m[1].toLowerCase()
		const rest = m[2]

		if (head === 'macro' || head === 'macroon' || head === 'macrooff' || head === 'macrorunning') {
			// "Macro on macroname", "Macro off macroname", "Macro running macroname"
			const sub = rest.match(/^(on|off|running)\s+(.+)$/i)
			if (!sub) return null
			return { type: 'macro', state: sub[1].toLowerCase(), name: sub[2].trim() }
		}

		if (head === 'wall') {
			const sub = rest.match(/^(open|close)\s+(.+)$/i)
			if (!sub) return null
			const [name, space] = splitCommaTail(sub[2])
			return { type: 'wall', state: sub[1].toLowerCase(), name, space }
		}

		if (head === 'pst') {
			const sub = rest.match(/^(acth|dacth|alth|act|dact|alt)\s+(.+)$/i)
			if (!sub) return null
			const [name, space] = splitCommaTail(sub[2])
			return { type: 'preset', state: sub[1].toLowerCase(), name, space }
		}

		if (head === 'seq') {
			const sub = rest.match(/^(start|stop|pause)\s+(.+)$/i)
			if (!sub) return null
			const [name, space] = splitCommaTail(sub[2])
			return { type: 'sequence', state: sub[1].toLowerCase(), name, space }
		}

		if (head === 'ovr') {
			const sub = rest.match(/^(enab|disab)\s+(.+)$/i)
			if (!sub) return null
			return { type: 'override', state: sub[1].toLowerCase(), name: sub[2].trim() }
		}

		if (head === 'chan' || head === 'grp') {
			// "chan int:128 Dimmer 2, Primary Space 1"
			const sub = rest.match(/^int:(\d+)\s+(.+)$/i)
			if (!sub) return null
			const level = parseInt(sub[1], 10)
			const [name, space] = splitCommaTail(sub[2])
			return { type: head === 'chan' ? 'channel' : 'group', level, name, space }
		}

		return null
	}

	// --- Command helpers -----------------------------------------------------

	macro(action, name) {
		this.send(`macro ${action} ${name}`)
	}

	preset({ action, name, space, fade, priority }) {
		const verb = priority != null && action !== 'rec' && action !== 'dact' && action !== 'dacth'
			? `${action}:${priority}`
			: action
		let arg = name
		if (space) arg += `, ${space}`
		if (fade != null && action !== 'rec') arg += `, ${fade}`
		this.send(`pst ${verb} ${arg}`)
	}

	channel({ action, name, space, fade, value }) {
		// action: int|ras|low|tog|min|max
		const verb = (action === 'tog') ? 'tog' : `${action}:${value}`
		let arg = name
		if (space) arg += `, ${space}`
		if (fade != null && action !== 'min' && action !== 'max') arg += `, ${fade}`
		this.send(`chan ${verb} ${arg}`)
	}

	wall({ action, name, space }) {
		let arg = name
		if (space) arg += `, ${space}`
		this.send(`wall ${action} ${arg}`)
	}

	sequence({ action, name, space, priority, value }) {
		let verb
		if (action === 'start' && priority != null) verb = `start:${priority}`
		else if (action === 'ras' || action === 'low' || action === 'rate') verb = `${action}:${value}`
		else verb = action
		let arg = name
		if (space && (action === 'start' || action === 'stop')) arg += `, ${space}`
		this.send(`seq ${verb} ${arg}`)
	}

	override({ action, name }) {
		this.send(`ovr ${action} ${name}`)
	}

	space({ action, name, fade, value }) {
		// action: off | ras | low | master
		const verb = (action === 'off') ? 'off' : `${action}:${value}`
		let arg = name
		if (fade != null) arg += `, ${fade}`
		this.send(`spc ${verb} ${arg}`)
	}

	// --- Status queries ------------------------------------------------------

	queryChannel(name, space) {
		this.send(`chan get ${commaJoin(name, space)}`)
	}
	queryPreset(name, space, htp = false) {
		this.send(`${htp ? 'pst geth' : 'pst get'} ${commaJoin(name, space)}`)
	}
	queryMacro(name) {
		this.send(`macro get ${name}`)
	}
	queryWall(name, space) {
		this.send(`wall get ${commaJoin(name, space)}`)
	}
	querySequence(name, space) {
		this.send(`seq get ${commaJoin(name, space)}`)
	}
	queryOverride(name) {
		this.send(`ovr get ${name}`)
	}
	queryGroup(name, space) {
		this.send(`grp get ${commaJoin(name, space)}`)
	}
}

function commaJoin(name, space) {
	return space ? `${name}, ${space}` : name
}

/**
 * Split a "name[, space]" tail into [name, space]. Returns space as undefined
 * if not present.
 */
function splitCommaTail(s) {
	const i = s.indexOf(',')
	if (i === -1) return [s.trim(), undefined]
	return [s.slice(0, i).trim(), s.slice(i + 1).trim()]
}

module.exports = Paradigm
module.exports.DEFAULT_PORT = DEFAULT_PORT
module.exports.TERMINATORS = TERMINATORS
module.exports._splitCommaTail = splitCommaTail
