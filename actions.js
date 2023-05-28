module.exports = function (self) {
	// self.setupChoices()

	self.setActionDefinitions(
		{
			sendCommand: {
				name: 'Send Command',
				options: [
					{
						type: 'textinput',
						label: 'Command',
						id: 'id_command',
						default: '',
						tooltip: 'Which input would you like sent to All outputs?',
						useVariables: true,
					}
				],
				callback: async (event) => {
					const value = await self.parseVariablesInString(event.options.id_command)
					self.sendToDevice(`${value}`)
				},
			},
			// routeInd: {
			// 	name: 'Route input x to audio and video output y',
			// 	options: [
			// 		{
			// 			type: 'dropdown',
			// 			label: 'Input',
			// 			id: 'id_input',
			// 			default: '1',
			// 			tooltip: 'Which input would you like sent to a specific output?',
			// 			choices: self.CHOICES_INPUTS,
			// 			minChoicesForSearch: 0
			// 		},
			// 		{
			// 			type: 'multidropdown',
			// 			label: 'Output',
			// 			id: 'id_output',
			// 			default: '1',
			// 			tooltip: 'Which output?',
			// 			choices: self.CHOICES_OUTPUTS,
			// 			minChoicesForSearch: 0
			// 		}
			// 	],
			// 	callback: async (event) => {
			// 		const value = await self.parseVariablesInString(event.options.id_input)
			// 		if (event.options.id_output.length !== 0) {
			// 			const outputs = event.options.id_output.join(',')
			// 			self.sendToDevice(`${value}B${outputs}.`)
			// 		}
			// 	},
			// },
			// routeThrough: {
			// 	name: 'Route inputs to corresponding video outputs',
			// 	options: [],
			// 	callback: async (event) => {
			// 		self.sendToDevice(`All#.`)
			// 	},
			// },
			// lockPanel: {
			// 	name: 'Lock the front panel keys',
			// 	options: [],
			// 	callback: async (event) => {
			// 		self.sendToDevice(`/%Lock;`)
			// 	},
			// },
			// unlockPanel: {
			// 	name: 'Unlock the front panel keys',
			// 	options: [],
			// 	callback: async (event) => {
			// 		self.sendToDevice(`/%Unlock;`)
			// 	},
			// },
		}
	)
}
