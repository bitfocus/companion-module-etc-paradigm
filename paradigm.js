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
        this.connectionTimeout = 500
	}

	async getInfo(info) {
		const url = `${this.url}/get/${info}`
		
		let response

        const controller = new AbortController()

        const timeoutId = setTimeout(() => controller.abort(), this.connectionTimeout)
        const options = {
            signal: controller.signal
        }
		try {
			response = await fetch(url, options)
			if (response.status === 200) {
				const result = await response.text()
				// the server responds with invalid JSON we must remove trailing commas
				const filtered = result.replace(/,(?=[\]}])/g, '')
				return JSON.parse(filtered)
			} else {
				throw new Error(`Error trying to get ${info}.`)
			}
		} catch (error) {
			console.log(error)
			throw error
		}
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
		const regex = /(['"])?([a-zA-Z0-9_]+)(['"])?:/g
		const fixedJSON = jsonStr.replace(regex, '"$2":')
		return fixedJSON
	}

	async getControlStatus() {
		const url = `${this.url}/get/control_status`
		const options = {}
		let response

		try {
			response = await fetch(url, options)
			if (response.status === 200) {
				const result = await response.text()
				const filtered = this.fixInvalidJSON(result).replace(/,(?=[\]}])/g, '')
				console.log('json:', filtered)
				return JSON.parse(filtered)
			} else {
				throw new Error('Error trying to get the control status.')
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	async runAction(feature, action, id, other = []) {
		const queryParams = new URLSearchParams('')
		queryParams.set('id', id)

		other.forEach((each) => queryParams.append(each.name, each.value))
		const url = `${this.url}/do/${action}?${queryParams.toString()}`
		const options = {}
		let response

		try {
			response = await fetch(url, options)
			if (response.status === 200) {
				const result = await response.text()
				// the server responds with invalid JSON we must remove trailing commas
				const filtered = result.replace(/,(?=[\]}])/g, '')
				return JSON.parse(filtered)
			} else {
				throw new Error('Error trying to run the action.')
			}
		} catch (error) {
			console.log(error)
			throw error
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

	close() {
		if (this.connection) {
			this.connection.close()
			this.connection = undefined
		}
	}
}

module.exports = Paradigm
