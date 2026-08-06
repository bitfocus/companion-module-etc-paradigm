const setupActions = require('../actions')

function makeSelf() {
	return {
		device: {
			macro: jest.fn(),
			preset: jest.fn(),
			channel: jest.fn(),
			wall: jest.fn(),
			sequence: jest.fn(),
			override: jest.fn(),
			space: jest.fn(),
			send: jest.fn(),
		},
		log: jest.fn(),
		setActionDefinitions: jest.fn(),
		parseVariablesInString: jest.fn(async (s) => s),
	}
}

function getDefinitions(self) {
	setupActions(self)
	return self.setActionDefinitions.mock.calls[0][0]
}

describe('actions.js', () => {
	let self
	let defs

	beforeEach(() => {
		self = makeSelf()
		defs = getDefinitions(self)
	})

	it('defines the expected action ids', () => {
		expect(Object.keys(defs)).toEqual([
			'macro',
			'preset',
			'channelSet',
			'channelAdjust',
			'channelToggle',
			'wall',
			'sequence',
			'sequenceRate',
			'override',
			'space',
			'rawCommand',
		])
	})

	describe('guard behavior shared by every action', () => {
		it('warns and skips the action when there is no open device', async () => {
			self.device = null
			await defs.macro.callback({ options: { name: 'Macro 1', action: 'on' } })
			expect(self.log).toHaveBeenCalledWith('warn', 'PSAP socket not open — action skipped')
		})

		it('catches and logs errors thrown by the callback', async () => {
			self.device.macro.mockImplementation(() => {
				throw new Error('send failed')
			})
			await defs.macro.callback({ options: { name: 'Macro 1', action: 'on' } })
			expect(self.log).toHaveBeenCalledWith('error', 'Action error: send failed')
		})
	})

	describe('macro', () => {
		it('sends the resolved name and raw action', async () => {
			await defs.macro.callback({ options: { name: 'Macro 1', action: 'on' } })
			expect(self.device.macro).toHaveBeenCalledWith('on', 'Macro 1')
		})

		it('does nothing when the resolved name is blank', async () => {
			await defs.macro.callback({ options: { name: '   ', action: 'on' } })
			expect(self.device.macro).not.toHaveBeenCalled()
		})
	})

	describe('preset', () => {
		it('passes action, name, space, fade and priority through', async () => {
			await defs.preset.callback({
				options: { name: 'Preset 1', action: 'act', space: 'Space 1', fade: '2.5', priority: '100' },
			})
			expect(self.device.preset).toHaveBeenCalledWith({
				action: 'act',
				name: 'Preset 1',
				space: 'Space 1',
				fade: '2.5',
				priority: '100',
			})
		})

		it('leaves space/fade/priority undefined when blank', async () => {
			await defs.preset.callback({ options: { name: 'Preset 1', action: 'act' } })
			expect(self.device.preset).toHaveBeenCalledWith({
				action: 'act',
				name: 'Preset 1',
				space: undefined,
				fade: undefined,
				priority: undefined,
			})
		})
	})

	describe('channelSet', () => {
		it('sends an int action with the level as a percentage', async () => {
			await defs.channelSet.callback({ options: { name: 'Dimmer 2', level: 75, space: 'Space 1', fade: '1' } })
			expect(self.device.channel).toHaveBeenCalledWith({
				action: 'int',
				name: 'Dimmer 2',
				value: '75%',
				space: 'Space 1',
				fade: '1',
			})
		})
	})

	describe('channelAdjust', () => {
		it('sends the chosen direction with the amount as a percentage', async () => {
			await defs.channelAdjust.callback({ options: { name: 'Dimmer 2', direction: 'ras', amount: 10 } })
			expect(self.device.channel).toHaveBeenCalledWith({
				action: 'ras',
				name: 'Dimmer 2',
				value: '10%',
				space: undefined,
				fade: undefined,
			})
		})
	})

	describe('channelToggle', () => {
		it('sends a tog action without a value', async () => {
			await defs.channelToggle.callback({ options: { name: 'Dimmer 2', space: 'Space 1' } })
			expect(self.device.channel).toHaveBeenCalledWith({
				action: 'tog',
				name: 'Dimmer 2',
				space: 'Space 1',
				fade: undefined,
			})
		})
	})

	describe('wall', () => {
		it('sends the chosen action with name and space', async () => {
			await defs.wall.callback({ options: { name: 'Wall 1', action: 'open', space: 'Space 1' } })
			expect(self.device.wall).toHaveBeenCalledWith({ action: 'open', name: 'Wall 1', space: 'Space 1' })
		})
	})

	describe('sequence', () => {
		it('sends the chosen action with name, space and priority', async () => {
			await defs.sequence.callback({ options: { name: 'Seq 1', action: 'start', space: 'Space 1', priority: '50' } })
			expect(self.device.sequence).toHaveBeenCalledWith({
				action: 'start',
				name: 'Seq 1',
				space: 'Space 1',
				priority: '50',
			})
		})
	})

	describe('sequenceRate', () => {
		it('sends a rate action with the raw numeric rate', async () => {
			await defs.sequenceRate.callback({ options: { name: 'Seq 1', rate: 2 } })
			expect(self.device.sequence).toHaveBeenCalledWith({ action: 'rate', name: 'Seq 1', value: 2 })
		})
	})

	describe('override', () => {
		it('sends the chosen action with name', async () => {
			await defs.override.callback({ options: { name: 'Override 1', action: 'enab' } })
			expect(self.device.override).toHaveBeenCalledWith({ action: 'enab', name: 'Override 1' })
		})
	})

	describe('space', () => {
		it('sends the chosen action with value as a percentage and fade', async () => {
			await defs.space.callback({ options: { name: 'Space 1', action: 'master', value: 50, fade: '3' } })
			expect(self.device.space).toHaveBeenCalledWith({
				action: 'master',
				name: 'Space 1',
				value: '50%',
				fade: '3',
			})
		})
	})

	describe('rawCommand', () => {
		it('sends the resolved raw command', async () => {
			await defs.rawCommand.callback({ options: { cmd: 'help' } })
			expect(self.device.send).toHaveBeenCalledWith('help')
		})

		it('does not send when the resolved command is blank', async () => {
			await defs.rawCommand.callback({ options: { cmd: '   ' } })
			expect(self.device.send).not.toHaveBeenCalled()
		})
	})
})
