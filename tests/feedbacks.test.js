const { combineRgb } = require('@companion-module/base')
const setupFeedbacks = require('../feedbacks')

function makeSelf(watchEntries = []) {
	return {
		watchEntries,
		getVariableValue: jest.fn(),
		setFeedbackDefinitions: jest.fn(),
	}
}

function getDefinitions(self) {
	setupFeedbacks(self)
	return self.setFeedbackDefinitions.mock.calls[0][0]
}

function targetChoices(defs, feedbackId) {
	return defs[feedbackId].options.find((o) => o.id === 'target').choices
}

describe('feedbacks.js', () => {
	it('defines the expected feedback ids', () => {
		const self = makeSelf()
		const defs = getDefinitions(self)
		expect(Object.keys(defs)).toEqual([
			'macroState',
			'presetState',
			'wallState',
			'sequenceState',
			'overrideState',
			'channelLevel',
		])
	})

	it('uses a red background as the default style', () => {
		const self = makeSelf()
		const defs = getDefinitions(self)
		expect(defs.macroState.defaultStyle).toEqual({
			bgcolor: combineRgb(255, 0, 0),
			color: combineRgb(0, 0, 0),
		})
	})

	describe('watched-object dropdown choices', () => {
		const watchEntries = [
			{ type: 'macro', variableId: 'macro_macro_1_state', label: 'Macro 1' },
			{ type: 'preset', variableId: 'preset_preset_1_state', label: 'Preset 1' },
			{ type: 'wall', variableId: 'wall_wall_1_state', label: 'Wall 1' },
			{ type: 'sequence', variableId: 'sequence_seq_1_state', label: 'Seq 1' },
			{ type: 'override', variableId: 'override_override_1_state', label: 'Override 1' },
			{ type: 'channel', variableId: 'channel_dimmer_2_level', label: 'Dimmer 2' },
			{ type: 'group', variableId: 'group_group_1_level', label: 'Group 1' },
		]

		it('filters the target dropdown to entries of the matching type', () => {
			const self = makeSelf(watchEntries)
			const defs = getDefinitions(self)
			expect(targetChoices(defs, 'macroState')).toEqual([{ id: 'macro_macro_1_state', label: 'Macro 1' }])
			expect(targetChoices(defs, 'presetState')).toEqual([{ id: 'preset_preset_1_state', label: 'Preset 1' }])
			expect(targetChoices(defs, 'wallState')).toEqual([{ id: 'wall_wall_1_state', label: 'Wall 1' }])
			expect(targetChoices(defs, 'sequenceState')).toEqual([{ id: 'sequence_seq_1_state', label: 'Seq 1' }])
			expect(targetChoices(defs, 'overrideState')).toEqual([{ id: 'override_override_1_state', label: 'Override 1' }])
		})

		it('channelLevel includes both channel and group watch entries', () => {
			const self = makeSelf(watchEntries)
			const defs = getDefinitions(self)
			expect(targetChoices(defs, 'channelLevel')).toEqual([
				{ id: 'channel_dimmer_2_level', label: 'Dimmer 2' },
				{ id: 'group_group_1_level', label: 'Group 1' },
			])
		})

		it('shows a placeholder when nothing of that type is watched', () => {
			const self = makeSelf([])
			const defs = getDefinitions(self)
			expect(targetChoices(defs, 'macroState')).toEqual([
				{ id: '', label: '— add to Watched Objects in config —' },
			])
		})
	})

	describe('boolean state feedbacks (macroState/presetState/wallState/sequenceState/overrideState)', () => {
		it('returns true when the variable value matches the expected state', () => {
			const self = makeSelf()
			self.getVariableValue.mockReturnValue('on')
			const defs = getDefinitions(self)
			expect(defs.macroState.callback({ options: { target: 'macro_macro_1_state', state: 'on' } })).toBe(true)
		})

		it('returns false when the variable value does not match', () => {
			const self = makeSelf()
			self.getVariableValue.mockReturnValue('off')
			const defs = getDefinitions(self)
			expect(defs.macroState.callback({ options: { target: 'macro_macro_1_state', state: 'on' } })).toBe(false)
		})

		it('returns false when no target is selected', () => {
			const self = makeSelf()
			const defs = getDefinitions(self)
			expect(defs.macroState.callback({ options: { target: '', state: 'on' } })).toBe(false)
			expect(self.getVariableValue).not.toHaveBeenCalled()
		})

		it('returns false when the variable has never been set', () => {
			const self = makeSelf()
			self.getVariableValue.mockReturnValue(undefined)
			const defs = getDefinitions(self)
			expect(defs.presetState.callback({ options: { target: 'preset_preset_1_state', state: 'act' } })).toBe(false)
		})
	})

	describe('channelLevel', () => {
		it.each([
			['=', 128, 128, true],
			['=', 128, 100, false],
			['!=', 128, 100, true],
			['!=', 128, 128, false],
			['>', 128, 100, true],
			['>', 128, 128, false],
			['>=', 128, 128, true],
			['<', 100, 128, true],
			['<=', 128, 128, true],
		])('%s compares the variable value against the target', (op, varValue, target, expected) => {
			const self = makeSelf()
			self.getVariableValue.mockReturnValue(varValue)
			const defs = getDefinitions(self)
			expect(
				defs.channelLevel.callback({ options: { target: 'channel_dimmer_2_level', op, value: target } }),
			).toBe(expected)
		})

		it('returns false when the variable value is not numeric', () => {
			const self = makeSelf()
			self.getVariableValue.mockReturnValue(undefined)
			const defs = getDefinitions(self)
			expect(
				defs.channelLevel.callback({ options: { target: 'channel_dimmer_2_level', op: '>=', value: 128 } }),
			).toBe(false)
		})
	})
})
