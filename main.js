const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const Paradigm = require('./paradigm')

const http = require('http')
const querystring = require('querystring')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.deviceInfo = {}

		this.CHOICES_MACROS = []
		this.CHOICES_PRESETS = []
		this.CHOICES_WALLS = []
		this.CHOICES_SEQUENCES = []
		this.CHOICES_CHANNELS = []
		this.CHOICES_OVERRIDES = []


		this.updateStatus(InstanceStatus.Ok)


		await this.initDevice()
		await this.updateVariableDefinitions() // export variable definitions

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
	}

	async initDevice() {
		if (this.config.host === undefined) {
			return
		}
		try {
			this.updateStatus('connecting', 'Connecting')
			this.device = new Paradigm(this.config.host)

			this.deviceInfo = await this.device.getAllInfo()
			this.updateStatus('ok')

			// Start polling
			this.subscribeToDevice()
		} catch (error) {
			this.updateStatus('error', error.message)
			this.log('error', 'Network error: ' + error.message)
			this.device = undefined
			this.deviceInfo = {}
			this.unsubscribeToDevice()
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
		this.device = undefined
		this.deviceInfo = {}

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
			variableValues = this.buildVariablesValuesFromControlStatus(result[each], variableValues, each, 'state', '_state')
		})
		variableValues = this.buildVariablesValuesFromControlStatus(result.channels, variableValues, 'channels', 'level', '_level')
		this.setVariableValues(variableValues)
		this.checkFeedbacks()
	}

	//TODO: Refactor this
	buildVariablesValuesFromControlStatus(info, variables, feature, text = 'name', ending = '_label') {
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

	setupChoices() {
		this.CHOICES_MACROS = []
		this.CHOICES_PRESETS = []
		this.CHOICES_WALLS = []
		this.CHOICES_SEQUENCES = []
		this.CHOICES_CHANNELS = []
		this.CHOICES_OVERRIDES = []

		const isDeviceLoaded = Object.keys(this.deviceInfo).length

		if (isDeviceLoaded) {
			this.CHOICES_MACROS = this.buildChoices(this.deviceInfo.macros)
			this.CHOICES_PRESETS = this.buildChoicesWithSpaces(this.deviceInfo.presets, this.deviceInfo.spaces)
			this.CHOICES_WALLS = this.buildChoices(this.deviceInfo.walls)
			this.CHOICES_SEQUENCES = this.buildChoices(this.deviceInfo.sequences)
			this.CHOICES_CHANNELS = this.buildChoicesWithSpaces(this.deviceInfo.channels, this.deviceInfo.spaces)
			this.CHOICES_OVERRIDES = this.buildChoices(this.deviceInfo.overrides)
		} else {
			this.CHOICES_MACROS = this.buildChoices([], 'Macro', 1024 )
			this.CHOICES_PRESETS = this.buildChoices([], 'Preset', 1024 )
			this.CHOICES_WALLS = this.buildChoices([], 'Wall', 128 )
			this.CHOICES_SEQUENCES = this.buildChoices([], 'Sequence', 512 )
			this.CHOICES_CHANNELS = this.buildChoices([], 'Channel', 1024 )
			this.CHOICES_OVERRIDES = this.buildChoices([], 'Override', 1024 )
		}
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
					id: `${index}`,
					label: `${feature} ${index + 1}`,
				})
			}
		}
		
		
		return variables
	}

	buildChannelChoicesWithSpaces(info, spaces) {
		const variables = []
		let total = info.length

		for (let index = 0; index < total; index++) {
			variables.push({
				id: `${info[index].id}`,
				label: `${spaces[info[index].space]}: ${info[index].name}`,
			})
		}
		
		return variables
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
