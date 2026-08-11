/**
 * Action definitions for the ETC Paradigm PSAP module.
 *
 * Each action maps to a PSAP command string. Object names are entered as text
 * (since PSAP has no enumeration endpoint) and must match LightDesigner exactly.
 */

const nameField = (label = 'Object Name') => ({
	type: 'textinput',
	id: 'name',
	label,
	default: '',
	useVariables: true,
	required: true,
})

const spaceField = {
	type: 'textinput',
	id: 'space',
	label: 'Space (optional)',
	default: '',
	useVariables: true,
}

const fadeField = {
	type: 'textinput',
	id: 'fade',
	label: 'Fade time (seconds, optional)',
	default: '',
	useVariables: true,
	tooltip: 'Decimal seconds, e.g. 2.5',
}

const priorityField = {
	type: 'textinput',
	id: 'priority',
	label: 'Priority (1-200, optional)',
	default: '',
	useVariables: true,
}

function getOpt(event, id) {
	const v = event.options?.[id]
	if (v === undefined || v === null) return undefined
	const s = String(v).trim()
	return s.length ? s : undefined
}

async function resolveOpt(self, event, id) {
	const v = event.options?.[id]
	if (v === undefined || v === null) return undefined
	const resolved = await self.parseVariablesInString(String(v))
	const s = resolved.trim()
	return s.length ? s : undefined
}

module.exports = function (self) {
	const guard = (fn) => async (event) => {
		if (!self.device) {
			self.log('warn', 'PSAP socket not open — action skipped')
			return
		}
		try { await fn(event) } catch (err) {
			self.log('error', `Action error: ${err.message}`)
		}
	}

	self.setActionDefinitions({
		macro: {
			name: 'Macro: On / Off / Toggle / Cancel',
			options: [
				nameField('Macro Name'),
				{
					type: 'dropdown', id: 'action', label: 'Action', default: 'on',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'tog', label: 'Toggle' },
						{ id: 'cancel', label: 'Cancel' },
					],
				},
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.macro(getOpt(event, 'action'), name)
			}),
		},

		preset: {
			name: 'Preset: Activate / Deactivate / Toggle / Record',
			options: [
				nameField('Preset Name'),
				spaceField,
				fadeField,
				priorityField,
				{
					type: 'dropdown', id: 'action', label: 'Action', default: 'act',
					choices: [
						{ id: 'act', label: 'Activate (LTP)' },
						{ id: 'dact', label: 'Deactivate (LTP)' },
						{ id: 'tog', label: 'Toggle (LTP)' },
						{ id: 'acth', label: 'Activate (HTP)' },
						{ id: 'dacth', label: 'Deactivate (HTP)' },
						{ id: 'togh', label: 'Toggle (HTP)' },
						{ id: 'rec', label: 'Record' },
					],
				},
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.preset({
					action: getOpt(event, 'action'),
					name,
					space: await resolveOpt(self, event, 'space'),
					fade: await resolveOpt(self, event, 'fade'),
					priority: await resolveOpt(self, event, 'priority'),
				})
			}),
		},

		channelSet: {
			name: 'Channel: Set Level',
			options: [
				nameField('Channel Name'),
				spaceField,
				{
					type: 'number', id: 'level', label: 'Level (0-100%)',
					default: 0, min: 0, max: 100,
				},
				fadeField,
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.channel({
					action: 'int',
					name,
					value: `${event.options.level}%`,
					space: await resolveOpt(self, event, 'space'),
					fade: await resolveOpt(self, event, 'fade'),
				})
			}),
		},

		channelAdjust: {
			name: 'Channel: Raise / Lower',
			options: [
				nameField('Channel Name'),
				spaceField,
				{
					type: 'dropdown', id: 'direction', label: 'Direction', default: 'ras',
					choices: [
						{ id: 'ras', label: 'Raise' },
						{ id: 'low', label: 'Lower' },
					],
				},
				{
					type: 'number', id: 'amount', label: 'Amount (0-100%)',
					default: 5, min: 0, max: 100,
				},
				fadeField,
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.channel({
					action: getOpt(event, 'direction'),
					name,
					value: `${event.options.amount}%`,
					space: await resolveOpt(self, event, 'space'),
					fade: await resolveOpt(self, event, 'fade'),
				})
			}),
		},

		channelToggle: {
			name: 'Channel: Toggle',
			options: [nameField('Channel Name'), spaceField, fadeField],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.channel({
					action: 'tog',
					name,
					space: await resolveOpt(self, event, 'space'),
					fade: await resolveOpt(self, event, 'fade'),
				})
			}),
		},

		wall: {
			name: 'Wall: Open / Close / Toggle',
			options: [
				nameField('Wall Name'),
				spaceField,
				{
					type: 'dropdown', id: 'action', label: 'Action', default: 'tog',
					choices: [
						{ id: 'open', label: 'Open' },
						{ id: 'close', label: 'Close' },
						{ id: 'tog', label: 'Toggle' },
					],
				},
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.wall({
					action: getOpt(event, 'action'),
					name,
					space: await resolveOpt(self, event, 'space'),
				})
			}),
		},

		sequence: {
			name: 'Sequence: Start / Stop / Pause / Resume',
			options: [
				nameField('Sequence Name'),
				spaceField,
				priorityField,
				{
					type: 'dropdown', id: 'action', label: 'Action', default: 'start',
					choices: [
						{ id: 'start', label: 'Start' },
						{ id: 'stop', label: 'Stop' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'resume', label: 'Resume' },
					],
				},
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.sequence({
					action: getOpt(event, 'action'),
					name,
					space: await resolveOpt(self, event, 'space'),
					priority: await resolveOpt(self, event, 'priority'),
				})
			}),
		},

		sequenceRate: {
			name: 'Sequence: Set Rate',
			options: [
				nameField('Sequence Name'),
				{
					type: 'number', id: 'rate', label: 'Rate (1 = default)',
					default: 1, min: 0, max: 10, step: 0.1,
				},
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.sequence({ action: 'rate', name, value: event.options.rate })
			}),
		},

		override: {
			name: 'Override: Enable / Disable / Toggle',
			options: [
				nameField('Override Name'),
				{
					type: 'dropdown', id: 'action', label: 'Action', default: 'enab',
					choices: [
						{ id: 'enab', label: 'Enable' },
						{ id: 'disab', label: 'Disable' },
						{ id: 'tog', label: 'Toggle' },
					],
				},
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.override({ action: getOpt(event, 'action'), name })
			}),
		},

		space: {
			name: 'Space: Off / Master / Raise / Lower',
			options: [
				nameField('Space Name'),
				{
					type: 'dropdown', id: 'action', label: 'Action', default: 'off',
					choices: [
						{ id: 'off', label: 'Off' },
						{ id: 'master', label: 'Set Master Level' },
						{ id: 'ras', label: 'Raise' },
						{ id: 'low', label: 'Lower' },
					],
				},
				{
					type: 'number', id: 'value', label: 'Level/Amount (0-100%, ignored for Off)',
					default: 50, min: 0, max: 100,
				},
				fadeField,
			],
			callback: guard(async (event) => {
				const name = await resolveOpt(self, event, 'name')
				if (!name) return
				self.device.space({
					action: getOpt(event, 'action'),
					name,
					value: `${event.options.value}%`,
					fade: await resolveOpt(self, event, 'fade'),
				})
			}),
		},

		rawCommand: {
			name: 'Send Raw PSAP Command',
			options: [
				{
					type: 'textinput', id: 'cmd', label: 'Command (no terminator)',
					default: '', useVariables: true, required: true,
				},
			],
			callback: guard(async (event) => {
				const cmd = await resolveOpt(self, event, 'cmd')
				if (cmd) self.device.send(cmd)
			}),
		},
	})
}
