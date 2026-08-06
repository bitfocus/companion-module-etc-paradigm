const setupVariables = require('../variables')

function makeSelf(watchEntries = []) {
	return {
		watchEntries,
		setVariableDefinitions: jest.fn(),
	}
}

describe('variables.js', () => {
	it('defines one variable per watch entry', () => {
		const self = makeSelf([
			{ type: 'macro', variableId: 'macro_macro_1_state', label: 'Macro 1' },
			{ type: 'channel', variableId: 'channel_dimmer_2_level', label: 'Dimmer 2' },
		])
		setupVariables(self)
		expect(self.setVariableDefinitions).toHaveBeenCalledWith([
			{ variableId: 'macro_macro_1_state', name: 'Macro "Macro 1" state' },
			{ variableId: 'channel_dimmer_2_level', name: 'Channel "Dimmer 2" level' },
		])
	})

	it('uses "level" for channel and group types, "state" for everything else', () => {
		const self = makeSelf([
			{ type: 'preset', variableId: 'preset_preset_1_state', label: 'Preset 1' },
			{ type: 'wall', variableId: 'wall_wall_1_state', label: 'Wall 1' },
			{ type: 'sequence', variableId: 'sequence_seq_1_state', label: 'Seq 1' },
			{ type: 'override', variableId: 'override_override_1_state', label: 'Override 1' },
			{ type: 'group', variableId: 'group_group_1_level', label: 'Group 1' },
		])
		setupVariables(self)
		const names = self.setVariableDefinitions.mock.calls[0][0].map((d) => d.name)
		expect(names).toEqual([
			'Preset "Preset 1" state',
			'Wall "Wall 1" state',
			'Sequence "Seq 1" state',
			'Override "Override 1" state',
			'Group "Group 1" level',
		])
	})

	it('capitalizes only the first letter of the type label', () => {
		const self = makeSelf([{ type: 'sequence', variableId: 'sequence_seq_1_state', label: 'Seq 1' }])
		setupVariables(self)
		expect(self.setVariableDefinitions.mock.calls[0][0][0].name).toBe('Sequence "Seq 1" state')
	})

	it('includes the space in the label when the watch entry has one', () => {
		const self = makeSelf([
			{ type: 'preset', variableId: 'preset_houselight_3_off_primary_space_1_state', label: 'Houselight 3 -OFF @ Primary Space 1' },
		])
		setupVariables(self)
		expect(self.setVariableDefinitions.mock.calls[0][0][0].name).toBe(
			'Preset "Houselight 3 -OFF @ Primary Space 1" state',
		)
	})

	it('sets an empty definitions array when there is nothing to watch', () => {
		const self = makeSelf([])
		setupVariables(self)
		expect(self.setVariableDefinitions).toHaveBeenCalledWith([])
	})
})
