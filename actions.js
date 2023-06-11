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
						id: 'presetID',
						default: '1',
						choices: self.CHOICES_PRESETS,
						minChoicesForSearch: 0
					},
					{
						type: 'dropdown',
						label: 'Activate or Deactivate2',
						id: 'wantedState',
						default: 'activate',
						choices: [
							{ id: 'activate', label: 'Activate' },
							{ id: 'deactivate', label: 'Deactivate' }
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runPresetAction(event.options.wantedState, event.options.presetID)
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
						id: 'presetID',
						default: '1',
						choices: self.CHOICES_PRESETS,
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runPresetAction('record', event.options.presetID)
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
						id: 'overrideID',
						default: '1',
						choices: self.CHOICES_OVERRIDES,
						minChoicesForSearch: 0
					},
					{
						type: 'dropdown',
						label: 'Activate or Deactivate',
						id: 'wantedState',
						default: 'activate',
						choices: [
							{ id: 'activate', label: 'Activate' },
							{ id: 'deactivate', label: 'Deactivate' }
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						await self.device.runOverridesAction(event.options.wantedState, event.options.overrideID)
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
						id: 'macroID',
						default: '1',
						choices: self.CHOICES_MACROS
					},
					{
						type: 'dropdown',
						label: 'ON/OFF/Cancel',
						id: 'wantedState',
						default: 'on',
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
						const result = await self.device.runMacroAction(event.options.wantedState, event.options.macroID)
						// set the macro variable state // this is the only one that gets a state returned with it
						const variableID = `macro_${event.options.macroID}_state`
						const returnVariable = {}
						returnVariable[variableID] = result.state
						self.setVariableValues(returnVariable)
					} catch (error) {
						self.log('error', error.message)
					}
				},
			},
			changeWallState: {
				name: 'Change Wall State',
				options: [
					{
						type: 'dropdown',
						label: 'Wall',
						id: 'wallID',
						default: '1',
						tooltip: 'Which wall would you like to toggle?',
						choices: self.CHOICES_WALLS
					},
					{
						type: 'dropdown',
						label: 'Action',
						id: 'wantedState',
						default: '1',
						choices: [
							{ id: '1', label: 'Open' },
							{ id: '0', label: 'Close' },
							{ id: 'toggle', label: 'Toggle' }
						],
						minChoicesForSearch: 0
					}
				],
				callback: async (event) => {
					try {
						// get current state
						const currentState = self.getVariableValue(`wall_${event.options.wallID}_state`)
						if (event.options.wantedState != currentState || event.options.wantedState === 'toggle') {
							await self.device.runWallAction('toggle', event.options.wallID)
						}
						
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
						id: 'sequenceID',
						default: '1',
						choices: self.CHOICES_SEQUENCES
					},
					{
						type: 'dropdown',
						label: 'Action',
						id: 'wantedState',
						default: 'start',
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
						await self.device.runSequencesAction(event.options.wantedState, event.options.sequenceID)
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
						id: 'channelID',
						default: '1',
						choices: self.CHOICES_CHANNELS
					},
					{
						type: 'number',
						label: 'Level from 0-100%',
						id: 'wantedState',
						default: 0,
						min: 0,
						max: 100
					}
				],
				callback: async (event) => {
					try {
						await self.device.runChannelsAction('set_level', event.options.channelID, event.options.wantedState)
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
						id: 'channelID',
						default: '1',
						choices: self.CHOICES_CHANNELS
					},
					{
						type: 'number',
						label: 'Adjust level in increments from -100 to 100',
						id: 'wantedState',
						default: 1,
						tooltip: 'This is helpful for Rotary Actions.',
						min: -100,
						max: 100
					}
				],
				callback: async (event) => {
					try {
						// get the current state and add the level to it
						const variableID = `channel_${event.options.channelID}_level`
						const currentValue = self.getVariableValue(variableID)

						const newValue = clamp(currentValue + event.options.wantedState, 0, 100)

						// Update the value of this variable directly to have better performance
						const returnVariable = {}
						returnVariable[variableID] = newValue
						self.setVariableValues(returnVariable)

						await self.device.runChannelsAction('set_level', event.options.channelID, newValue)
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

  module.exports.clamp = clamp;