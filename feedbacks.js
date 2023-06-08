const { combineRgb } = require('@companion-module/base')

module.exports = async function(self) {
	self.setupChoices()

	self.setFeedbackDefinitions({
		overRideState: {
			name: 'Override State',
			type: 'boolean',
			label: 'If an Override is active.',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0)
			},
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
					label: 'Activated or Deactivated',
					id: 'checkState',
					default: true,
					tooltip: '',
					choices: [
						{ id: true, label: 'Activated' },
						{ id: false, label: 'Deactivated' }
					],
					minChoicesForSearch: 0
				}
			],
			callback: (feedback) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				try {
					return self.getVariableValue(`override_${feedback.options.overrideID}_state`) == feedback.options.checkState
				} catch (error) {
					self.log('error', 'Feedback error: ' + error.message)
					return false
				}
			}
		},
		presetState: {
			name: 'Preset State',
			type: 'boolean',
			label: 'If a Preset is activated, deactivated, or altered.',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0)
			},
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
					label: 'State',
					id: 'checkState',
					default: 'Activated',
					tooltip: '',
					choices: [
						{ id: 'Activated', label: 'Activated' },
						{ id: 'Deactivated', label: 'Deactivated' },
						{ id: 'Altered', label: 'Altered' }
					],
					minChoicesForSearch: 0
				}
			],
			callback: (feedback) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				try {
					return self.getVariableValue(`preset_${feedback.options.presetID}_state`) == feedback.options.checkState
				} catch (error) {
					self.log('error', 'Feedback error: ' + error.message)
					return false
				}
			}
		},
		wallState: {
			name: 'Wall State',
			type: 'boolean',
			label: 'If a Wall is open or closed.',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0)
			},
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
					label: 'Open or Closed',
					id: 'checkState',
					default: 1,
					tooltip: '',
					choices: [
						{ id: 1, label: 'Open' },
						{ id: 0, label: 'Closed' }
					],
					minChoicesForSearch: 0
				}
			],
			callback: (feedback) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				try {
					return self.getVariableValue(`wall_${feedback.options.wallID}_state`) == feedback.options.checkState
				} catch (error) {
					self.log('error', 'Feedback error: ' + error.message)
					return false
				}
			}
		},
		macroState: {
			name: 'Macro State',
			type: 'boolean',
			label: 'If a Macro is on, off, running on, or running off.',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0)
			},
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
					label: 'Macro State',
					id: 'checkState',
					default: 0,
					tooltip: '',
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
						{ id: 2, label: 'Running On' },
						{ id: 3, label: 'Running Off' }
					],
					minChoicesForSearch: 0
				}
			],
			callback: (feedback) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				try {
					return self.getVariableValue(`macro_${feedback.options.macroID}_state`) == feedback.options.checkState
				} catch (error) {
					self.log('error', 'Feedback error: ' + error.message)
					return false
				}
			}
		},
		channelState: {
			name: 'Channel Level',
			type: 'boolean',
			label: 'Check channel level.',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0)
			},
			options: [
				{
					type: 'dropdown',
					label: 'Channels',
					id: 'channelID',
					default: '1',
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'Operation',
					id: 'operation',
					default: '=',
					choices: [
						{ id: '=', label: '=' },
						{ id: '!=', label: '!=' },
						{ id: '>', label: '>' },
						{ id: '<', label: '<' }
					],
					minChoicesForSearch: 0
				},
				{
					type: 'number',
					label: 'From 0 to 100',
					id: 'checkState',
					default: 0,
					min: 0,
					max: 100
				}
			],
			callback: (feedback) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				try {
					if (feedback.options.operation === '=') {
						return self.getVariableValue(`channel_${feedback.options.channelID}_level`) == feedback.options.checkState
					} else if (feedback.options.operation === '!=') {
						return self.getVariableValue(`channel_${feedback.options.channelID}_level`) != feedback.options.checkState
					} else if (feedback.options.operation === '>') {
						return self.getVariableValue(`channel_${feedback.options.channelID}_level`) > feedback.options.checkState
					} else if (feedback.options.operation === '<') {
						return self.getVariableValue(`channel_${feedback.options.channelID}_level`) < feedback.options.checkState
					}
					return false
				} catch (error) {
					self.log('error', 'Feedback error: ' + error.message)
					return false
				}
			}
		},
	})
}
