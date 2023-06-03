
class Paradigm {
	constructor(host) {
		this.host = host
		// this.port = 502
		this.connection = undefined
		this.system = {}
		this.macros = []
		this.walls = []
        this.spaces = []
        this.overrides = []
        this.channels = []
        this.sequences = []
        this.url = `http://${this.host}/`
        this.actions = ['get', 'do']
        this.channelsActions = ['set_level']
        this.macrosActions = ['macro_on', 'macro_off', 'macro_cancel']
        this.presetsActions = ['preset_activate', 'preset_record']
        this.wallActions = ['toggle_wall']
        this.overridesActions = ['activate_override', 'deactivate_override']
        this.sequencesActions = ['start_sequence', 'stop_sequence', 'pause_sequence', 'resume_sequence']
        this.features = ['system', 'macros', 'presets', 'sequences', 'channels', 'walls', 'overrides', 'spaces']
        this.featuresList = ['macros', 'presets', 'sequences', 'channels', 'walls', 'overrides']
		// this.buildBuses()
	}

    async getInfo(info) {
        const url = this.url + this.actions[0] + '/' + info
        const options = {}
        let response

        try {
            response = await fetch(url, options)
            if (response.status === 200) {
                const result = await response.text();
                const filtered = result.replace(/,(?=[\]}])/g, '')
                this[info] = JSON.parse(filtered)
              } else {
                throw new Error("Something went wrong on API server!");
              }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    fixInvalidJSON(jsonStr) {
        const regex = /(['"])?([a-zA-Z0-9_]+)(['"])?:/g;
        const fixedJSON = jsonStr.replace(regex, '"$2":');
        return fixedJSON;
      }
      

    async getControlStatus() {
        const url = this.url + this.actions[0] + '/control_status'
        const options = {}
        let response

        try {
            response = await fetch(url, options)
            if (response.status === 200) {
                const result = await response.text();
                const filtered = this.fixInvalidJSON(result).replace(/,(?=[\]}])/g, '')
                console.log('json:', filtered);
                return JSON.parse(filtered)
              } else {
                throw new Error("Something went wrong on API server!");
              }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async connect() {
        // get system info
        try {
            
            const allFeatures = this.features.map(feature => this.getInfo(feature))
            await Promise.all(allFeatures)
            // order all the items
            this.featuresList.forEach(each => {
                this[each].sort((a, b) => a.id - b.id)
            })
            console.log(this)
            return this

        // this.connection =
        } catch(error) {
            console.log(error);
            return undefined
        }
    }

	async init() {
		this.connection = await this.connect(this.host)
	}

    async runAction(feature, action, id, other = []) {
        //do/macro_on?id=5
        const queryParams = new URLSearchParams('')
        queryParams.set('id', id)
        other.forEach(each => queryParams.append(each.name, each.value))
        const url = `${this.url}do/${action}?${queryParams.toString()}`
        console.log('url:', url);
        const options = {}
        let response

        try {
            response = await fetch(url, options)
            if (response.status === 200) {
                const result = await response.text();
                const filtered = result.replace(/,(?=[\]}])/g, '')
                const info = JSON.parse(filtered)
                console.log('info:', info);
                // this needs to return and update the store
                // this.updateFeatureState(feature, id, info.state)
                // this[feature][id].state = info // I can't quite get the feature by id like that
                return info
              } else {
                throw new Error("Something went wrong on API server!");
              }
        } catch (error) {
            console.log(error);
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
        return this.runAction('channels', actionText, id, [{
            name: 'level',
            value: `${level}`
        }])
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
                value: 1
            })
        } else if (state === 'deactivate') {
            action = 'preset_activate'
            options.push({
                name: 'on',
                value: 0
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

    updateFeatureState(feature, id, state) {
        const indexOfItem = this[feature].findIndex(each => each.id === id)
        if (indexOfItem !== -1) {
            this[feature][indexOfItem].state = state
            return true
        }
        return false
    }

	close() {
		if (this.connection) {
			this.connection.close()
			this.connection = undefined
		}
	}
}


module.exports = Paradigm