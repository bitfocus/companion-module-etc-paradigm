const { InstanceBase, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const Paradigm = require('./paradigm')

const TYPE_ALIASES = {
	pst: 'preset', preset: 'preset',
	chan: 'channel', channel: 'channel',
	macro: 'macro',
	wall: 'wall',
	seq: 'sequence', sequence: 'sequence',
	ovr: 'override', override: 'override',
	grp: 'group', group: 'group',
}

const RECONNECT_DELAY_MS = 5000
const PING_TIMEOUT_MS = 2000

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.watchEntries = []
		// Composite map keyed by `${type}|${name}|${space ?? ''}` (case-insensitive).
		// A bare-name fallback lookup happens at reply time when the reply's space
		// doesn't match any specific entry.
		this.watchIndex = new Map()
		this.watchByName = new Map() // `${type}|${name}` -> [entries]
	}

	async init(config) {
		this.config = config
		await this._connect()
		UpdateVariableDefinitions(this)
		UpdateActions(this)
		UpdateFeedbacks(this)
	}

	async configUpdated(config) {
		this.config = config
		await this._disconnect()
		await this._connect()
		UpdateVariableDefinitions(this)
		UpdateActions(this)
		UpdateFeedbacks(this)
	}

	async destroy() {
		await this._disconnect()
	}

	async _connect() {
		if (!this.config?.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
			return
		}

		this._rebuildWatchIndex()
		this.updateStatus(InstanceStatus.Connecting)

		try {
			this.device = new Paradigm({
				host: this.config.host,
				port: Number(this.config.port) || Paradigm.DEFAULT_PORT,
				terminator: this.config.terminator || 'cr',
			})
			this.device.on('reply', (reply) => this._onReply(reply))
			this.device.on('raw', (line) => this.log('debug', `PSAP <-- ${line}`))
			this.device.on('debug', (msg) => this.log('debug', `PSAP ${msg}`))
			this.device.on('psapError', (line) => this.log('warn', `PSAP error: ${line}`))
			this.device.on('error', (err) => this._onSocketError(err))
			await this.device.open()
			this.updateStatus(InstanceStatus.Ok)
			await this._ping()
			this._startPolling()
		} catch (err) {
			this.log('error', `Failed to open PSAP socket: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			this._scheduleReconnect()
		}
	}

	async _disconnect() {
		this._stopPolling()
		this._clearReconnect()
		if (this.device) {
			this.device.removeAllListeners()
			this.device.close()
			this.device = undefined
		}
	}

	_onSocketError(err) {
		this.log('error', `PSAP socket error: ${err.message}`)
		this.updateStatus(InstanceStatus.UnknownError, err.message)
		this._scheduleReconnect()
	}

	_scheduleReconnect() {
		this._clearReconnect()
		this.reconnectTimer = setTimeout(async () => {
			this.log('info', 'Reconnecting to Paradigm…')
			await this._disconnect()
			await this._connect()
		}, RECONNECT_DELAY_MS)
	}

	_clearReconnect() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}
	}

	/**
	 * Send `help` and wait briefly for any reply. Logs a warning if nothing arrives
	 * within PING_TIMEOUT_MS — catches firewall/wrong-port issues at startup rather
	 * than via silent polling.
	 */
	_ping() {
		return new Promise((resolve) => {
			let settled = false
			const onAny = () => {
				if (settled) return
				settled = true
				this.device.off('raw', onAny)
				clearTimeout(timer)
				resolve()
			}
			const timer = setTimeout(() => {
				if (settled) return
				settled = true
				this.device.off('raw', onAny)
				this.log(
					'warn',
					`No PSAP reply within ${PING_TIMEOUT_MS}ms. Check that PSAP is enabled in LightDesigner (Input UDP Port + PSAP Input Handler), the port and terminator match, and that nothing is firewalling inbound UDP to this host.`,
				)
				resolve()
			}, PING_TIMEOUT_MS)
			this.device.on('raw', onAny)
			try {
				this.device.send('help')
			} catch (err) {
				clearTimeout(timer)
				this.device.off('raw', onAny)
				resolve()
			}
		})
	}

	_startPolling() {
		this._stopPolling()
		const interval = Math.max(200, Number(this.config.pollFrequency) || 5000)
		const tick = () => {
			this._pollOnce()
			this.pollTimer = setTimeout(tick, interval)
		}
		this.pollTimer = setTimeout(tick, interval)
	}

	_stopPolling() {
		if (this.pollTimer) {
			clearTimeout(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	_rebuildWatchIndex() {
		this.watchEntries = parseWatchList(this.config.watchList || '')
		this.watchIndex.clear()
		this.watchByName.clear()
		for (const entry of this.watchEntries) {
			this.watchIndex.set(watchKey(entry.type, entry.name, entry.space), entry)
			const k = watchKey(entry.type, entry.name)
			const bucket = this.watchByName.get(k) ?? []
			bucket.push(entry)
			this.watchByName.set(k, bucket)
		}
	}

	_pollOnce() {
		if (!this.device || !this.watchEntries.length) return
		for (const entry of this.watchEntries) {
			try {
				const dispatch = QUERIES[entry.type]
				if (dispatch) dispatch(this.device, entry)
			} catch (err) {
				this.log('error', `Poll error for ${entry.type} ${entry.name}: ${err.message}`)
			}
		}
	}

	/**
	 * Route an incoming reply to the matching watch entry, preferring an exact
	 * (type, name, space) match over a bare-name fallback.
	 */
	_onReply(reply) {
		const exact = this.watchIndex.get(watchKey(reply.type, reply.name, reply.space))
		const bucket = this.watchByName.get(watchKey(reply.type, reply.name)) ?? []
		const entries = exact ? [exact] : bucket.filter((e) => !e.space)
		if (!entries.length) return
		const values = {}
		const value = reply.type === 'channel' || reply.type === 'group' ? reply.level : reply.state
		for (const e of entries) values[e.variableId] = value
		this.setVariableValues(values)
		this.checkFeedbacks()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Paradigm Processor IP / Hostname',
				width: 6,
				regex: '/^[a-zA-Z0-9.\\-]+$/',
				tooltip: 'IPv4 address or DNS name reachable from this Companion host.',
			},
			{
				type: 'number',
				id: 'port',
				label: 'PSAP UDP Port',
				width: 3,
				default: 4703,
				min: 1,
				max: 65535,
			},
			{
				type: 'dropdown',
				id: 'terminator',
				label: 'End of Message',
				width: 3,
				default: 'cr',
				choices: [
					{ id: 'cr', label: 'CR' },
					{ id: 'crlf', label: 'CR + LF' },
					{ id: 'lf', label: 'LF' },
				],
			},
			{
				type: 'number',
				id: 'pollFrequency',
				label: 'Polling Interval (ms)',
				width: 3,
				default: 5000,
				min: 200,
				max: 60000,
			},
			{
				type: 'static-text',
				id: 'watchListHelp',
				label: 'Watched Objects',
				width: 12,
				value:
					'<p>One object per line: <code>type Name [@ Space]</code>. Types: <code>pst macro chan wall seq ovr grp</code>. ' +
					'Names are matched case-insensitively here but must match LightDesigner exactly. See <a href="../HELP.md">HELP</a> for details and troubleshooting.</p>',
			},
			{
				type: 'textinput',
				id: 'watchList',
				label: 'Watched Objects (one per line)',
				width: 12,
				default: '',
				useVariables: false,
			},
		]
	}
}

const QUERIES = {
	macro: (d, e) => d.queryMacro(e.name),
	preset: (d, e) => d.queryPreset(e.name, e.space, e.htp),
	channel: (d, e) => d.queryChannel(e.name, e.space),
	wall: (d, e) => d.queryWall(e.name, e.space),
	sequence: (d, e) => d.querySequence(e.name, e.space),
	override: (d, e) => d.queryOverride(e.name),
	group: (d, e) => d.queryGroup(e.name, e.space),
}

/**
 * Parse the watch-list textinput into structured entries.
 *
 * Each non-empty, non-comment line is: `type Name [@ Space]`. Lines starting
 * with `#` are ignored. Duplicate variable IDs are disambiguated with `_2`,
 * `_3`, … suffixes so two watch entries that slug identically don't overwrite
 * each other.
 *
 * @returns {Array<{type,name,space,htp,variableId,label}>}
 */
function parseWatchList(text) {
	const out = []
	const usedIds = new Set()
	const lines = String(text).split(/\r?\n|;/)
	for (const raw of lines) {
		const line = raw.trim()
		if (!line || line.startsWith('#')) continue
		const m = line.match(/^(\S+)\s+(.+)$/)
		if (!m) continue
		const typeKey = m[1].toLowerCase().replace(/:.*/, '')
		const type = TYPE_ALIASES[typeKey]
		if (!type) continue
		const htp = m[1].toLowerCase().endsWith(':htp')
		let name = m[2].trim()
		let space
		const atIdx = name.indexOf('@')
		if (atIdx !== -1) {
			space = name.slice(atIdx + 1).trim()
			name = name.slice(0, atIdx).trim()
		}
		if (!name) continue
		let variableId = makeVariableId(type, name, space)
		if (usedIds.has(variableId)) {
			let suffix = 2
			while (usedIds.has(`${variableId}_${suffix}`)) suffix++
			variableId = `${variableId}_${suffix}`
		}
		usedIds.add(variableId)
		const label = space ? `${name} @ ${space}` : name
		out.push({ type, name, space, htp, variableId, label })
	}
	return out
}

function watchKey(type, name, space) {
	const base = `${type}|${String(name).toLowerCase()}`
	return space === undefined ? base : `${base}|${String(space).toLowerCase()}`
}

function makeVariableId(type, name, space) {
	const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
	const suffix = type === 'channel' || type === 'group' ? 'level' : 'state'
	const parts = [type, slug(name)]
	if (space) parts.push(slug(space))
	return `${parts.join('_')}_${suffix}`
}

runEntrypoint(ModuleInstance, UpgradeScripts)

module.exports = ModuleInstance
module.exports.parseWatchList = parseWatchList
module.exports.makeVariableId = makeVariableId
module.exports.watchKey = watchKey
