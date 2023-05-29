module.exports = async function (self) {

	let variables = [
		{
			name: 'Processor Name',
			variableId: 'processor_name'
		},
		{
			name: 'Processor Number',
			variableId: 'processor_number'
		},
		{
			name: 'Current Time',
			variableId: 'current_time'
		},
		{
			name: 'Uptime',
			variableId: 'uptime'
		},
		{
			name: 'Dimmer Rack',
			variableId: 'rack_status'
		},
		{
			name: 'Stations',
			variableId: 'station_count'
		},
	]

	const features = ['macros', 'presets', 'sequences', 'channels', 'walls', 'overrides']
	if (self.device.connection !== undefined) {
		

	features.filter(each => each !== 'channels').forEach(each => {
		variables.push(buildVariables(self.device, each, ' name', '_label'))
		variables.push(buildVariables(self.device, each, ' state', '_state'))
	})
	variables.push(buildVariables(self.device, 'channels', ' name', '_label'))
	variables.push(buildVariables(self.device, 'channels', ' level', '_level'))

	variables = variables.flat()
	}
	

	// // set the input names
	// const totalPresets = parseInt(self.connection.presets)
	// for (let index = 0; index < totalInputs; index++) {
	// 	variables.push({
	// 		name: `Input ${index + 1} name`,
	// 		variableId: `input_${index + 1}_label`
	// 	})
	// }
	// // set the output names
	// for (let index = 0; index < totalInputs; index++) {
	// 	variables.push({
	// 		name: `Output ${index + 1} name`,
	// 		variableId: `output_${index + 1}_label`
	// 	})
	// }

	// // set the HDCP info
	// for (let index = 0; index < totalInputs; index++) {
	// 	variables.push({
	// 		name: `Input ${index + 1} HDCP`,
	// 		variableId: `input_${index + 1}_hdcp`
	// 	})
	// }

	self.setVariableDefinitions(variables)

	if (self.device.connection === undefined) {
		self.setVariableValues({
			'processor_name': '',
			'processor_number': '',
			'current_time': '',
			'uptime': '',
			'rack_status': '',
			'station_count': '',
		})
	} else {
		self.setVariableValues({
			'processor_name': self.device.system.processor_name,
			'processor_number': self.device.system.processor_number,
			'current_time': self.device.system.current_time,
			'uptime': self.device.system.uptime,
			'rack_status': self.device.system.rack_status,
			'station_count': self.device.system.stations.length,
		})
		let variableValues = {}
		features.filter(each => each !== 'channels').forEach(each => {
			variableValues = buildVariablesValues(self.device, variableValues, each, 'name', '_label')
			variableValues = buildVariablesValues(self.device, variableValues, each, 'state', '_state')
		})
		variableValues = buildVariablesValues(self.device, variableValues, 'channels', 'name', '_label')
		variableValues = buildVariablesValues(self.device, variableValues, 'channels', 'level', '_level')

		self.setVariableValues(variableValues)
	}

	

	// const inputVariables = {}
	// for (let index = 0; index < totalInputs; index++) {
	// 	inputVariables[`output_${index + 1}`] = ''
	// 	inputVariables[`input_${index + 1}_label`] = `Input ${index + 1}`
	// 	inputVariables[`output_${index + 1}_label`] = `Output ${index + 1}`
	// }
	// self.setVariableValues(inputVariables)
}

function buildVariables(info, feature, text = ' name', ending = '_label') {
	const variables = []
	const total = info[feature].length
	for (let index = 0; index < total; index++) {
		variables.push({
			name: `${feature.charAt(0).toUpperCase() + feature.slice(1)} ${index + 1}${text}`,
			variableId: `${feature}_${index + 1}${ending}`
		})
	}
	return variables
}

function buildVariablesValues(info, variables, feature, text = 'name', ending = '_label') {
	// const variables = {}
	const total = info[feature].length
	for (let index = 0; index < total; index++) {
		variables[`${feature}_${index + 1}${ending}`] = info[feature][index][text]
	}
	return variables
}