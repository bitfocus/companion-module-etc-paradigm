class Paradigm {
	constructor(host) {
		this.host = host
		this.url = `http://${this.host}`
		this.channelsActions = ['set_level']
		this.macrosActions = ['macro_on', 'macro_off', 'macro_cancel']
		this.presetsActions = ['preset_activate', 'preset_record']
		this.wallActions = ['toggle_wall']
		this.overridesActions = ['activate_override', 'deactivate_override']
		this.sequencesActions = ['start_sequence', 'stop_sequence', 'pause_sequence', 'resume_sequence']
		this.features = ['system', 'macros', 'presets', 'sequences', 'channels', 'walls', 'overrides', 'spaces']
		this.connectionTimeout = 5000
	}

	async sendRequest(url) {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), this.connectionTimeout)
		const options = { signal: controller.signal }

		try {
			const response = await fetch(url, options)
			if (response.status === 200) {
				const result = await response.text()
				const filtered = this.fixInvalidJSON(result)
				return JSON.parse(filtered)
			} else {
				throw new Error(`Error trying to send request: ${url}`)
			}
		} catch (error) {
			throw error
		}
	}

	destroy() {
		//not implemented
	}

	async getInfo(info) {
		const url = `${this.url}/get/${info}`
		return this.sendRequest(url)
	}

	async getAllInfo() {
		const allFeatures = this.features.map((feature) => this.getInfo(feature))
		const result = await Promise.all(allFeatures)
		const returnInfo = {}
		result.forEach((each, index) => {
			returnInfo[this.features[index]] = each
		})
		return returnInfo
	}

	fixInvalidJSON(jsonStr) {
        jsonStr = jsonStr.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":')
        jsonStr = jsonStr.replace(/,(?=[\]}])/g, '')
		jsonStr = jsonStr.replace(/\\\n/g, ' ')
        return jsonStr
	}

	async getControlStatus() {
		const url = `${this.url}/get/control_status`
		return this.sendRequest(url)
	}

	async runAction(feature, action, id, other = []) {
		const queryParams = new URLSearchParams({ id })
		other.forEach((each) => queryParams.append(each.name, each.value))
		const url = new URL(`/do/${action}`, this.url)
		url.search = queryParams.toString()

		try {
			return await this.sendRequest(url.toString())
		} catch (error) {
			throw new Error(`Error trying to run action: ${action}`)
		}
	}

	runChannelsAction(action, id, level) {
		if (level < 0 || level > 100) {
			throw new Error('Out of Range')
		}

		let actionText = ''
		if (action === 'set_level') {
			actionText = 'set_level'
		} else {
			return false
		}
		return this.runAction('channels', actionText, id, [
			{
				name: 'level',
				value: `${level}`,
			},
		])
	}

	runMacroAction(state, id) {
		let action = ''
		if (state === 'on') {
			action = 'macro_on'
		} else if (state === 'off') {
			action = 'macro_off'
		} else if (state === 'cancel') {
			action = 'macro_cancel'
		} else {
			return false
		}
		return this.runAction('macros', action, id)
	}

	runPresetAction(state, id) {
		let action = ''
		let options = []
		if (state === 'activate') {
			action = 'preset_activate'
			options.push({
				name: 'on',
				value: 1,
			})
		} else if (state === 'deactivate') {
			action = 'preset_activate'
			options.push({
				name: 'on',
				value: 0,
			})
		} else if (state === 'record') {
			action = 'preset_record'
		} else {
			return false
		}
		return this.runAction('presets', action, id, options)
	}

	runWallAction(state, id) {
		let action = ''
		if (state === 'toggle') {
			action = 'toggle_wall'
		} else {
			return false
		}
		return this.runAction('walls', action, id)
	}

	runOverridesAction(state, id) {
		let action = ''
		if (state === 'activate') {
			action = 'activate_override'
		} else if (state === 'deactivate') {
			action = 'deactivate_override'
		} else {
			return false
		}
		return this.runAction('overrides', action, id)
	}

	runSequencesAction(state, id) {
		let action = ''
		if (state === 'start') {
			action = 'start_sequence'
		} else if (state === 'stop') {
			action = 'stop_sequence'
		} else if (state === 'pause') {
			action = 'pause_sequence'
		} else if (state === 'resume') {
			action = 'resume_sequence'
		} else {
			return false
		}
		return this.runAction('sequences', action, id)
	}
}

module.exports = Paradigm
