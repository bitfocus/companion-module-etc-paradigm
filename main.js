const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
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

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.watchEntries = []
		this.watchIndex = new Map() // `${type}|${name.toLowerCase()}` -> entry
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

		this.watchEntries = parseWatchList(this.config.watchList || '')
		this.watchIndex.clear()
		for (const entry of this.watchEntries) {
			this.watchIndex.set(watchKey(entry.type, entry.name), entry)
		}

		this.updateStatus(InstanceStatus.Connecting)

		try {
			this.device = new Paradigm({
				host: this.config.host,
				port: Number(this.config.port) || Paradigm.DEFAULT_PORT,
				terminator: this.config.terminator || 'cr',
			})
			this.device.on('reply', (reply) => this._onReply(reply))
			this.device.on('raw', (line) => this.log('info', `PSAP <-- ${line}`))
			this.device.on('debug', (msg) => this.log('info', `PSAP ${msg}`))
			this.device.on('error', (err) => {
				this.log('error', `PSAP socket error: ${err.message}`)
				this.updateStatus(InstanceStatus.UnknownError, err.message)
			})
			await this.device.open()
			this.updateStatus(InstanceStatus.Ok)
			this._startPolling()
		} catch (err) {
			this.log('error', `Failed to open PSAP socket: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		}
	}

	async _disconnect() {
		this._stopPolling()
		if (this.device) {
			this.device.removeAllListeners()
			this.device.close()
			this.device = undefined
		}
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

	_pollOnce() {
		if (!this.device || !this.watchEntries.length) return
		for (const entry of this.watchEntries) {
			try {
				switch (entry.type) {
					case 'macro': this.device.queryMacro(entry.name); break
					case 'preset': this.device.queryPreset(entry.name, entry.space, entry.htp); break
					case 'channel': this.device.queryChannel(entry.name, entry.space); break
					case 'wall': this.device.queryWall(entry.name, entry.space); break
					case 'sequence': this.device.querySequence(entry.name, entry.space); break
					case 'override': this.device.queryOverride(entry.name); break
					case 'group': this.device.queryGroup(entry.name, entry.space); break
				}
			} catch (err) {
				this.log('error', `Poll error for ${entry.type} ${entry.name}: ${err.message}`)
			}
		}
	}

	_onReply(reply) {
		const entry = this.watchIndex.get(watchKey(reply.type, reply.name))
		if (!entry) return
		const values = {}
		if (reply.type === 'channel' || reply.type === 'group') {
			values[entry.variableId] = reply.level
		} else {
			values[entry.variableId] = reply.state
		}
		this.setVariableValues(values)
		this.checkFeedbacks()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Paradigm Processor IP',
				width: 6,
				regex: Regex.IP,
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
					'<p>One object per line. Each line drives a variable + feedback.<br>' +
					'Format: <code>type Name [@ Space]</code>. Types: <code>pst</code>, <code>macro</code>, <code>chan</code>, <code>wall</code>, <code>seq</code>, <code>ovr</code>, <code>grp</code>.<br>' +
					'Example:<br><code>pst Houselight 3 -OFF @ Primary Space 1<br>macro Macro 1<br>chan Dimmer 2 @ Primary Space 1</code></p>' +
					'<p>Names are case-sensitive and must match LightDesigner exactly.</p>',
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

/**
 * Parse the watch-list textinput into structured entries.
 *
 * Each non-empty, non-comment line is: `type Name [@ Space]`.
 * Returns: array of { type, name, space, htp, variableId, label }.
 */
function parseWatchList(text) {
	const out = []
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
		const variableId = makeVariableId(type, name, space)
		const label = space ? `${name} @ ${space}` : name
		out.push({ type, name, space, htp, variableId, label })
	}
	return out
}

function watchKey(type, name) {
	return `${type}|${String(name).toLowerCase()}`
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
