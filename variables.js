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
	const isDeviceLoaded = Object.keys(self.deviceInfo).length

	if (isDeviceLoaded) {
		features.filter(each => each !== 'channels').forEach(each => {
			variables.push(buildVariables(self.deviceInfo[each], each.slice(0, -1), ' name', '_label'))
			variables.push(buildVariables(self.deviceInfo[each], each.slice(0, -1), ' state', '_state'))
		})
		variables.push(buildVariables(self.deviceInfo.channels, 'channel', ' name', '_label'))
		variables.push(buildVariables(self.deviceInfo.channels, 'channel', ' level', '_level'))

		variables = variables.flat()
	} else {
		// set the default variables
		variables.push(buildVariables([], 'Macro', ' name', '_label', 1024 ))
		variables.push(buildVariables([], 'Macro', ' state', '_state', 1024 ))
		variables.push(buildVariables([], 'Preset', ' name', '_label', 1024 ))
		variables.push(buildVariables([], 'Preset', ' state', '_state', 1024 ))
		variables.push(buildVariables([], 'Wall', ' name', '_label', 128 ))
		variables.push(buildVariables([], 'Wall', ' state', '_state', 128 ))
		variables.push(buildVariables([], 'Sequence', ' name', '_label', 512 ))
		variables.push(buildVariables([], 'Sequence', ' state', '_state', 512 ))
		variables.push(buildVariables([], 'Channel', ' name', '_label', 1024 ))
		variables.push(buildVariables([], 'Channel', ' level', '_level', 1024 ))
		variables.push(buildVariables([], 'Override', ' name', '_label', 1024 ))
		variables.push(buildVariables([], 'Override', ' state', '_state', 1024 ))
	}
	
	self.setVariableDefinitions(variables)

	if (!isDeviceLoaded) {
		// Set the default values
		self.setVariableValues({
			'processor_name': '',
			'processor_number': '',
			'current_time': '',
			'uptime': '',
			'rack_status': '',
			'station_count': '',
		})

	} else {
		// Set the values from the device
		const { system, channels } = self.deviceInfo
		let variableValues = {
			'processor_name': system?.processor_name,
			'processor_number': system?.processor_number,
			'current_time': system?.current_time,
			'uptime': system?.uptime,
			'rack_status': system?.rack_status,
			'station_count': system?.stations.length,
		}

		features.filter(each => each !== 'channels').forEach(each => {
			variableValues = buildVariablesValues(self.deviceInfo[each], variableValues, each.slice(0, -1), 'name', '_label')
			variableValues = buildVariablesValues(self.deviceInfo[each], variableValues, each.slice(0, -1), 'state', '_state')
		})
		variableValues = buildVariablesValues(channels, variableValues, 'channel', 'name', '_label')
		variableValues = buildVariablesValues(channels, variableValues, 'channel', 'level', '_level')

		self.setVariableValues(variableValues)
	}
}

function buildVariables(info, feature, text = ' name', ending = '_label', specificCount = 0) {
	const variables = []
	let total

	if (specificCount) {
		for (let index = 0; index < specificCount; index++) {
			variables.push({
				name: `${feature.charAt(0).toUpperCase() + feature.slice(1)} ${index + 1}${text}`,
				variableId: `${feature}_${index}${ending}`
			})
		}
	} else {

		if (Array.isArray(info)) {
			total = info.length
			for (let index = 0; index < total; index++) {
				variables.push({
					name: `${feature.charAt(0).toUpperCase()}${feature.slice(1)} ${info[index].id + 1}${text}`,
					variableId: `${feature}_${info[index].id}${ending}`
				})
			}
		} else {
			total = Object.keys(info).length
			const keys = Object.keys(info)
			for (let index = 0; index < total; index++) {
				variables.push({
					name: `${feature.charAt(0).toUpperCase()}${feature.slice(1)} ${parseInt(keys[index], 10) + 1}${text}`,
					variableId: `${feature}_${parseInt(keys[index], 10)}${ending}`
				})
			}
		}
		
	}
	
	
	return variables
}

function buildVariablesValues(info, variables, feature, text = 'name', ending = '_label') {
	// const variables = {}
	let total
	if (Array.isArray(info)) {
		total = info.length

		for (let index = 0; index < total; index++) {
			variables[`${feature}_${info[index].id}${ending}`] = info[index][text]
		}
	} else {
		total = Object.keys(info).length
		const keys = Object.keys(info)

		for (let index = 0; index < total; index++) {
			variables[`${feature}_${parseInt(keys[index], 10)}${ending}`] = info[keys[index]]
		}
	}
	
	return variables
}

module.exports.buildVariables = buildVariables;
module.exports.buildVariablesValues = buildVariablesValues;