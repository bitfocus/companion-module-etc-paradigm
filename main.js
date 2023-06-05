const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const Paradigm = require('./paradigm')

// const fetch = require('node-fetch')
const http = require('http')
const querystring = require('querystring')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		// this.matrixInfo = {}
		this.CHOICES_MACROS = []
		this.CHOICES_PRESETS = []
		this.CHOICES_WALLS = []
		this.CHOICES_SEQUENCES = []
		this.CHOICES_CHANNELS = []
		this.CHOICES_OVERRIDES = []

		this.pollFrequency = 5000

		this.updateStatus(InstanceStatus.Ok)


		await this.initDevice()
		await this.updateVariableDefinitions() // export variable definitions
		// await this.getMatrixInfo()

		this.updateActions() // export actions
		// this.updateFeedbacks() // export feedbacks
	}

	async initDevice() {
		if (this.config.host === undefined) {
			return
		}
		try {
			this.updateStatus('connecting', 'Connecting')
			this.device = new Paradigm(this.config.host)

			await this.device.init()
			this.updateStatus('ok')

			// Start polling
			this.subscribeToDevice()
		} catch (error) {
			console.log('here');
			this.updateStatus('error', error.message)
			this.log('error', 'Network error: ' + error.message)
			console.log(error)
			this.device = undefined
			return
		}
	}

	async subscribeToDevice() {
		try {
			await this.getStates()

			this.poll = setTimeout(() => this.subscribeToDevice(), this.config.pollFrequency);
		} catch (error) {
			this.updateStatus('error', error.message)
		}
	}

	unsubscribeToDevice() {
		clearTimeout(this.poll)
	}

	// When module gets deleted
	async destroy() {
		this.unsubscribeToDevice()

		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config

		this.unsubscribeToDevice()
		await this.initDevice()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP
			},
			{
				id: 'pollFrequency',
				type: 'number',
				label: 'Polling Time (ms)',
				default: 5000,
				min: 200,
				max: 10000
			}
		]
	}

	async getStates() {
		const result = await this.device.getControlStatus()

		let variableValues = {}
		this.device.features.filter(each => each !== 'channels' && each !== 'system' && each !== 'spaces').forEach(each => {
			console.log('feauture: ', each);
			variableValues = this.buildVariablesValuesFromControlStatus(result[each], variableValues, each, 'state', '_state')
		})
		variableValues = this.buildVariablesValuesFromControlStatus(result.channels, variableValues, 'channels', 'level', '_level')
		console.log('values:',variableValues);
		this.setVariableValues(variableValues)

	}

	//TODO: Refactor this
	buildVariablesValuesFromControlStatus(info, variables, feature, text = 'name', ending = '_label') {
		// const variables = {}
		let total
		if (Array.isArray(info)) {
			total = info.length
		} else {
			total = Object.keys(info).length
		}

		const keys = Object.keys(info)

		for (let index = 0; index < total; index++) {
			// variables[`${feature}_${index + 1}${ending}`] = info[index][text]
			variables[`${feature}_${keys[index]}${ending}`] = info[keys[index]]
		}
		return variables
	}

	/**
	 * Send the TCP command to the device.
	 * @param  {string} cmd  TCP Command
	 * @return {void}
	 */
	sendToDevice(cmd) {
		// const end = '\r\n'
		const end = '\r'
		let cmdBuf = Buffer.from(cmd, 'latin1')
		let endBuf = Buffer.from( '0D', 'hex')
		let sendBuf = Buffer.concat([cmdBuf, endBuf])

		if (sendBuf != '') {
			this.log('debug', `sending ${sendBuf} to ${this.config.host}`)

			// if (this.socket !== undefined && this.socket.isConnected) {
			if (this.socket !== undefined) {
				this.socket.send(sendBuf).catch((e) => this.log('error', `Could not connect to device. ${e}`))
			} else {
				this.log('debug', 'Socket not connected :(')
			}
		}
	}

	/**
	 * This computes all the Inputs and Outputs of the device using the names recieved
	 * from the matrix. This sets the global variables CHOICES_INPUTS and CHOICES_OUTPUTS.
	 * @return {void}
	 */
	setupChoices() {
		// const totalInputs = parseInt(this.config?.model)
		let totalMacros = 1024
		this.CHOICES_MACROS = []
		this.CHOICES_PRESETS = []
		this.CHOICES_WALLS = []
		this.CHOICES_SEQUENCES = []
		this.CHOICES_CHANNELS = []
		this.CHOICES_OVERRIDES = []

		if (this.device.connection !== undefined) {
			this.CHOICES_MACROS = this.buildChoices(this.device.macros)
			this.CHOICES_PRESETS = this.buildChoices(this.device.presets)
			this.CHOICES_WALLS = this.buildChoices(this.device.walls)
			this.CHOICES_SEQUENCES = this.buildChoices(this.device.sequences)
			this.CHOICES_CHANNELS = this.buildChoices(this.device.channels)
			this.CHOICES_OVERRIDES = this.buildChoices(this.device.overrides)
		} else {
			this.CHOICES_MACROS = this.buildChoices([], 'Macro', 1024 )
			this.CHOICES_PRESETS = this.buildChoices([], 'Preset', 1024 )
			this.CHOICES_WALLS = this.buildChoices([], 'Wall', 128 )
			this.CHOICES_SEQUENCES = this.buildChoices([], 'Sequence', 512 )
			this.CHOICES_CHANNELS = this.buildChoices([], 'Channels', 1024 )
			this.CHOICES_OVERRIDES = this.buildChoices([], 'Override', 1024 )
		}
		console.log(this.CHOICES_CHANNELS);
	}

	buildChoices(info, feature = '', count = 0) {
		const variables = []
		let total
		if (Array.isArray(info)) {
			total = info.length
		} else {
			total = Object.keys(info).length
		}

		if (count) {
			total = count
		}

		if (feature === '') {
			for (let index = 0; index < total; index++) {
				variables.push({
					id: `${info[index].id}`,
					label: info[index].name,
				})
			}
		} else {
			for (let index = 0; index < total; index++) {
				variables.push({
					id: `${index + 1}`,
					label: `${feature} ${index + 1}`,
				})
			}
		}
		
		
		return variables
	}

	/**
	 * This is a workaround for a fetch request because Node 18 has a bug and can't
	 * process the headers correctly.
	 * @param  {url} url               The URL to request
	 * @param  {JSON Object} body      The POST Body
	 * @return {string}      The response as a string
	 */
	makeRequest(url, body) {
		return new Promise((resolve, reject) => {
			const postData = querystring.stringify(body)

			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/javascript',
					'Content-Length': Buffer.byteLength(postData)
				},
				insecureHTTPParser: true
			}

			const req = http.request(url, options, (res) => {
				let data = ''
				res.on('data', (chunk) => {
					data += chunk
				})
				res.on('end', () => {
					resolve(data)
				})
			})

			req.on('error', (error) => {
				reject(error)
			})

			req.write(postData)
			req.end()
		})
	}

	/**
	 * Get Device info from Matrix. This uses the device's web server to get information.
	 * It then stores it as this.matrixInfo
	 * @return {Promise} Returns the received data as json object.
	 */
	// async getMatrixInfo() {
	// 	if (this.config?.model === undefined) {
	// 		return
	// 	}
	// 	const model = this.config.model + this.config.model
	// 	const body = {
	// 		tag: 'ptn'
	// 	}

	// 	try {
	// 		const url = `http://${this.config.host}/cgi-bin/MUH${model}TP_getsetparams.cgi`
	// 		const response = await this.makeRequest(url, body)

	// 		// This section doesn't work due to a bug with Node 18
	// 		// const response = await fetch(`http://${this.config.host}/cgi-bin/MUH${model}TP_getsetparams.cgi`,
	// 		// 	{
	// 		// 	method: 'post',
	// 		// 	body: JSON.stringify(body),
	// 		// 	headers: {
	// 		// 		'content-type': 'application/json'
	// 		// 	},
	// 		// 	insecureHTTPParser: true
	// 		// }
	// 		// )
	// 		// const dataText = await response.text()

	// 		const data = JSON.parse(response.substring(2, response.length - 1).replace(/'/g, '"'))
	// 		this.matrixInfo = data

	// 		this.updateActions()
	// 		this.checkFeedbacks('output_has_input')

	// 		const totalInputs = parseInt(model)
	// 		const outputVariables = {}
	// 		for (let index = 0; index < totalInputs; index++) {
	// 			outputVariables[`output_${index + 1}`] = data[`CH${index + 1}Output`]
	// 			outputVariables[`input_${index + 1}_label`] = data[`Input${index + 1}Table`]
	// 			outputVariables[`output_${index + 1}_label`] = data[`Output${index + 1}Table`]
	// 			outputVariables[`input_${index + 1}_hdcp`] = data[`Input${index + 1}HDCP`]
	// 		}

	// 		this.setVariableValues(outputVariables)

	// 		if (data.LockKey) {
	// 			this.setVariableValues({ lock_state: 'Unlocked' })
	// 		} else {
	// 			this.setVariableValues({ lock_state: 'Locked' })
	// 		}

	// 		this.setVariableValues({
	// 			title_label: data['TitleLabelTable'],
	// 			lcd_readout_1: data['LCDReadout1'],
	// 			lcd_readout_2: data['LCDReadout2']
	// 		})

	// 		return this.matrixInfo
	// 	} catch (error) {
	// 		this.log('error', 'Network error: ' + error.message)
	// 		console.error(error)
	// 	}
	// }

	/**
	 * Handle all the TCP data from the device. This sets variables and checks feedbacks.
	 * @param  {string} data   This is the data from the device.
	 * @return {void}
	 */
	parseData(data) {
		// Get model info INT-66HDX
		// 4x4: "INT-44HD"
		// 6x6: "INT-66HD"
		if (data.substring(0, 3) === 'INT') {
			this.config.model = data.substring(5, 6)
			// this.setVariable('model', data.substring(0, 9))
			this.saveConfig({ model: data.substring(5, 6), host: this.config.host })
			return
		}
		// Get Version
		if (data.substring(0, 1) === 'V') {
			this.setVariableValues({ version: data })
			return
		}
		// Get if system front panel is locked System Locked!
		if (data.substring(0, 6) === 'System') {
			if (data.substring(7, 8) === 'L') {
				this.matrixInfo['LockKey'] = '2'
				this.setVariableValues({ lock_state: 'Locked' })
			} else {
				this.matrixInfo['LockKey'] = '1'
				this.setVariableValues({ lock_state: 'Unlocked' })
			}
			this.checkFeedbacks()
			return
		}
		// Get Status of individual output AV:  2-> 2 AV: input-> output
		// 6x6 "AV:  2-> 2"
		// 4x4 "AV:01->02"
		if (data.substring(0, 2) === 'AV') {
			//AV:  3-> 1
			const i = parseInt(data.slice(3, -4), 10)
			const o = parseInt(data.substring(8), 10)
			const outputVar = {}
			outputVar[`output_${o}`] = `${i}`
			this.setVariableValues(outputVar)
			this.checkFeedbacks()
			return
		}
		// Process switch command 4 To All
		const inputNumber = parseInt(data.substring(0, 2), 10)
		const totalInputs = parseInt(this.config?.model)
		if (inputNumber >= 0 && inputNumber <= 8) {
			// Process All
			// On the 6x6 it returns "2 To All"
			// On the 4x4 it returns "02 To Al"
			if (data.substring(5, 8) === 'All' || data.substring(3, 8) === 'To Al') {
				const outputVar = {}
				for (let index = 0; index < totalInputs; index++) {
					outputVar[`output_${index + 1}`] = `${inputNumber}`
				}

				this.setVariableValues(outputVar)
				this.checkFeedbacks()
				return
			} else if (data.substring(1, 2 === 'B')) {
				// xBy
				const input = data.substring(0, 1)
				const output = data.substring(2, 3)
				const outputVar2 = {}
				outputVar2[`output_${output}`] = input
				this.setVariableValues(outputVar2)
				this.checkFeedbacks()
				return
			}
		}
		// Process All through // All Through.
		if (data.substring(0, 5) === 'All T') {
			const allThroughVars = {}
			for (let index = 0; index < totalInputs; index++) {
				allThroughVars[`output_${index + 1}`] = index + 1
			}
			this.setVariableValues(allThroughVars)
			this.checkFeedbacks()
			return
		}

		// if nothing matches but this was triggered then get everything just in case
		// This probably is unnecessary but might be helpful with updating input naming
		this.getMatrixInfo()
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
