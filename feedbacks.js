const { combineRgb } = require('@companion-module/base')

const RED_BG = {
	bgcolor: combineRgb(255, 0, 0),
	color: combineRgb(0, 0, 0),
}

function watchedChoices(self, types) {
	const set = new Set(types)
	const entries = self.watchEntries.filter((e) => set.has(e.type))
	if (!entries.length) {
		return [{ id: '', label: '— add to Watched Objects in config —' }]
	}
	return entries.map((e) => ({ id: e.variableId, label: e.label }))
}

function variableEquals(self, varId, expected) {
	if (!varId) return false
	const v = self.getVariableValue(varId)
	if (v === undefined) return false
	return String(v) === String(expected)
}

module.exports = function (self) {
	self.setFeedbackDefinitions({
		macroState: {
			name: 'Macro State',
			type: 'boolean',
			defaultStyle: RED_BG,
			options: [
				{
					type: 'dropdown', id: 'target', label: 'Macro',
					default: '', choices: watchedChoices(self, ['macro']),
				},
				{
					type: 'dropdown', id: 'state', label: 'State', default: 'on',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'running', label: 'Running' },
					],
				},
			],
			callback: (fb) => variableEquals(self, fb.options.target, fb.options.state),
		},

		presetState: {
			name: 'Preset State',
			type: 'boolean',
			defaultStyle: RED_BG,
			options: [
				{
					type: 'dropdown', id: 'target', label: 'Preset',
					default: '', choices: watchedChoices(self, ['preset']),
				},
				{
					type: 'dropdown', id: 'state', label: 'State', default: 'act',
					choices: [
						{ id: 'act', label: 'Activated (LTP)' },
						{ id: 'dact', label: 'Deactivated (LTP)' },
						{ id: 'alt', label: 'Altered (LTP)' },
						{ id: 'acth', label: 'Activated (HTP)' },
						{ id: 'dacth', label: 'Deactivated (HTP)' },
						{ id: 'alth', label: 'Altered (HTP)' },
					],
				},
			],
			callback: (fb) => variableEquals(self, fb.options.target, fb.options.state),
		},

		wallState: {
			name: 'Wall State',
			type: 'boolean',
			defaultStyle: RED_BG,
			options: [
				{
					type: 'dropdown', id: 'target', label: 'Wall',
					default: '', choices: watchedChoices(self, ['wall']),
				},
				{
					type: 'dropdown', id: 'state', label: 'State', default: 'open',
					choices: [
						{ id: 'open', label: 'Open' },
						{ id: 'close', label: 'Closed' },
					],
				},
			],
			callback: (fb) => variableEquals(self, fb.options.target, fb.options.state),
		},

		sequenceState: {
			name: 'Sequence State',
			type: 'boolean',
			defaultStyle: RED_BG,
			options: [
				{
					type: 'dropdown', id: 'target', label: 'Sequence',
					default: '', choices: watchedChoices(self, ['sequence']),
				},
				{
					type: 'dropdown', id: 'state', label: 'State', default: 'start',
					choices: [
						{ id: 'start', label: 'Running' },
						{ id: 'stop', label: 'Stopped' },
						{ id: 'pause', label: 'Paused' },
					],
				},
			],
			callback: (fb) => variableEquals(self, fb.options.target, fb.options.state),
		},

		overrideState: {
			name: 'Override State',
			type: 'boolean',
			defaultStyle: RED_BG,
			options: [
				{
					type: 'dropdown', id: 'target', label: 'Override',
					default: '', choices: watchedChoices(self, ['override']),
				},
				{
					type: 'dropdown', id: 'state', label: 'State', default: 'enab',
					choices: [
						{ id: 'enab', label: 'Enabled' },
						{ id: 'disab', label: 'Disabled' },
					],
				},
			],
			callback: (fb) => variableEquals(self, fb.options.target, fb.options.state),
		},

		channelLevel: {
			name: 'Channel Level Comparison',
			type: 'boolean',
			defaultStyle: RED_BG,
			options: [
				{
					type: 'dropdown', id: 'target', label: 'Channel',
					default: '', choices: watchedChoices(self, ['channel', 'group']),
				},
				{
					type: 'dropdown', id: 'op', label: 'Operator', default: '>=',
					choices: [
						{ id: '=', label: '=' },
						{ id: '!=', label: '!=' },
						{ id: '>', label: '>' },
						{ id: '>=', label: '>=' },
						{ id: '<', label: '<' },
						{ id: '<=', label: '<=' },
					],
				},
				{
					type: 'number', id: 'value', label: 'Level (0-255, raw PSAP units)',
					default: 128, min: 0, max: 255,
				},
			],
			callback: (fb) => {
				const v = Number(self.getVariableValue(fb.options.target))
				if (Number.isNaN(v)) return false
				const target = Number(fb.options.value)
				switch (fb.options.op) {
					case '=': return v === target
					case '!=': return v !== target
					case '>': return v > target
					case '>=': return v >= target
					case '<': return v < target
					case '<=': return v <= target
					default: return false
				}
			},
		},
	})
}
