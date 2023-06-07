module.exports = function (self) {
	self.setupChoices()

	self.setActionDefinitions(
		{
			activateDeactivatePreset: {
				name: 'Activate/Deactivate Preset',
				options: [
					{
						type: 'dropdown',
						label: 'Presets',
						id: 'id_presets',
						default: '1',
						choices: self.CHOICES_PRESETS,
						minChoicesForSearch: 0
					},
					{
						type: 'dropdown',
						label: 'Activate or Deactivate',
						id: 'id_state',
						default: 'activate',
						tooltip: '',
						choices: [
							{ id: 'activate', label: 'Activate' },
							{ id: 'deactivate', label: 'Deactivate' }
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runPresetAction(event.options.id_state, event.options.id_presets)
						//update the value
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			recordPreset: {
				name: 'Record Preset',
				options: [
					{
						type: 'dropdown',
						label: 'Presets',
						id: 'id_presets',
						default: '1',
						choices: self.CHOICES_PRESETS,
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runOverridesAction('record', event.options.id_presets)
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			changeOverridesState: {
				name: 'Change Overrides State',
				options: [
					{
						type: 'dropdown',
						label: 'Overrides',
						id: 'id_overrides',
						default: '1',
						choices: self.CHOICES_OVERRIDES,
						minChoicesForSearch: 0
					},
					{
						type: 'dropdown',
						label: 'Activate or Deactivate',
						id: 'id_state',
						default: 'activate',
						tooltip: '',
						choices: [
							{ id: 'activate', label: 'Activate' },
							{ id: 'deactivate', label: 'Deactivate' }
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runOverridesAction(event.options.id_state, event.options.id_overrides)
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			changeMacroState: {
				name: 'Change Macro State',
				options: [
					{
						type: 'dropdown',
						label: 'Macro',
						id: 'id_macro',
						default: '1',
						tooltip: 'Which input would you like sent to a specific output?',
						choices: self.CHOICES_MACROS
					},
					{
						type: 'dropdown',
						label: 'ON/OFF/Cancel',
						id: 'id_state',
						default: 'on',
						tooltip: '',
						choices: [
							{ id: 'on', label: 'ON' },
							{ id: 'off', label: 'OFF' },
							{ id: 'cancel', label: 'Cancel' },
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runMacroAction(event.options.id_state, event.options.id_macro)
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			changeWallState: {
				name: 'Toggle Wall State',
				options: [
					{
						type: 'dropdown',
						label: 'Wall',
						id: 'id_wall',
						default: '1',
						tooltip: 'Which wall would you like to toggle?',
						choices: self.CHOICES_WALLS
					}
				],
				callback: async (event) => {
					try {
						await self.device.runWallAction(event.options.id_state, event.options.id_wall)
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			runSequenceAction: {
				name: 'Run Sequences Action',
				options: [
					{
						type: 'dropdown',
						label: 'Sequences',
						id: 'id_sequences',
						default: '1',
						tooltip: 'Which input would you like sent to a specific output?',
						choices: self.CHOICES_SEQUENCES
					},
					{
						type: 'dropdown',
						label: 'Action',
						id: 'id_state',
						default: 'start',
						tooltip: '',
						choices: [
							{ id: 'start', label: 'Start' },
							{ id: 'stop', label: 'Stop' },
							{ id: 'pause', label: 'Pause' },
							{ id: 'resume', label: 'Resume' }
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runSequencesAction(event.options.id_state, event.options.id_sequences)
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			setChannelLevel: {
				name: 'Set Channel Level',
				options: [
					{
						type: 'dropdown',
						label: 'Channels',
						id: 'id_channels',
						default: '1',
						tooltip: 'Which input would you like sent to a specific output?',
						choices: self.CHOICES_CHANNELS
					},
					{
						type: 'number',
						label: 'Level from 0-100%',
						id: 'id_state',
						default: 0,
						tooltip: '',
						min: 0,
						max: 100
					}
				],
				callback: async (event) => {
					try {
						await self.device.runChannelsAction('set_level', event.options.id_channels, event.options.id_state)
						await self.getStates()
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			adjustChannelLevel: {
				name: 'Adjust Channel Level',
				options: [
					{
						type: 'dropdown',
						label: 'Channels',
						id: 'id_channels',
						default: '1',
						tooltip: '',
						choices: self.CHOICES_CHANNELS
					},
					{
						type: 'number',
						label: 'Adjust level in increments from -100 to 100',
						id: 'id_state',
						default: 1,
						tooltip: 'This is helpful for Rotary Actions.',
						min: -100,
						max: 100
					}
				],
				callback: async (event) => {
					try {
						// get the current state and add the level to it
						const variableID = `channels_${event.options.id_channels}_level`
						const currentValue = await self.getVariableValue(variableID)

						const newValue = clamp(currentValue + event.options.id_state, 0, 100)

						// Update the value of this variable directly to have better performance
						const returnVariable = {}
						returnVariable[variableID] = newValue
						self.setVariableValues(returnVariable)

						await self.device.runChannelsAction('set_level', event.options.id_channels, newValue)
					} catch (error) {
						self.log('error', error.message)
					}
				},
			}
		}
	)
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
  }
