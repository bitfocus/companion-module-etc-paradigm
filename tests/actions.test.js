// Import the function and helper function
const actions = require('../actions')
const clamp = require('../actions').clamp
describe('Module Tests', () => {
  let self;

  beforeEach(() => {
    self = {
      CHOICES_PRESETS: [
        { id: '1', label: 'Preset 1' },
        { id: '2', label: 'Preset 2' },
      ],
      CHOICES_OVERRIDES: [
        { id: '1', label: 'Override 1' },
        { id: '2', label: 'Override 2' },
      ],
      CHOICES_MACROS: [
        { id: '1', label: 'Macro 1' },
        { id: '2', label: 'Macro 2' },
      ],
      CHOICES_WALLS: [
        { id: '1', label: 'Wall 1' },
        { id: '2', label: 'Wall 2' },
      ],
      CHOICES_SEQUENCES: [
        { id: '1', label: 'Sequence 1' },
        { id: '2', label: 'Sequence 2' },
      ],
      CHOICES_CHANNELS: [
        { id: '1', label: 'Channel 1' },
        { id: '2', label: 'Channel 2' },
      ],
      setupChoices: jest.fn(),
      setActionDefinitions: jest.fn(),
      device: {
        runPresetAction: jest.fn(),
        runOverridesAction: jest.fn(),
        runMacroAction: jest.fn(),
        runWallAction: jest.fn(),
        runSequencesAction: jest.fn(),
        runChannelsAction: jest.fn(),
      },
      getStates: jest.fn(),
      log: jest.fn(),
      getVariableValue: jest.fn(),
      setVariableValues: jest.fn(),
    };

    
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set actions to companion', () => {
    actions(self)
    expect(self.setActionDefinitions).toHaveBeenCalled()
  });

  it('should not have an empty tooltip.', async () => {

    // await actions(self);
    await actions(self)
    const moduleActions = self.setActionDefinitions.mock.calls[0][0]

    // make sure each one doesn't have an empty tooltip
    for (const key in moduleActions) {
      if (Object.hasOwnProperty.call(moduleActions, key)) {
        const element = moduleActions[key];

        // go through all the options
        element.options.forEach(each => {
          if (each.tooltip !== undefined) {
            expect(each.tooltip.length).toBeGreaterThan(0)
          } else {
            expect(each.tooltip).toBeUndefined()
          }
        })
      }
    }
  });

  it('should activate/deactivate a preset', async () => {
    const event = {
      options: {
        wantedState: 'activate',
        presetID: '0',
      },
    };

    // await actions(self);
    await actions(self)
    const activateDeactivatePreset = self.setActionDefinitions.mock.calls[0][0].activateDeactivatePreset
    // check to make sure everything looks right

    // test the callback
    expect(self.setActionDefinitions).toHaveBeenCalled()
    await activateDeactivatePreset.callback(event);

    expect(self.device.runPresetAction).toHaveBeenCalledWith('activate', '0');
    // expect(self.getStates).toHaveBeenCalled();
  });

  it('should log when it has an error', async () => {
    const event = {
      options: {
        wantedState: 'activate',
        presetID: '0',
      },
    };

    await actions(self)
    const activateDeactivatePreset = self.setActionDefinitions.mock.calls[0][0].activateDeactivatePreset
    // test the callback

    // set the mock to reject
    self.device.runPresetAction.mockRejectedValueOnce(new Error('Mocked error'));

    const result = await activateDeactivatePreset.callback(event);
    expect(self.log).toHaveBeenCalledWith('error', 'Mocked error');
    expect(self.device.runPresetAction).toHaveBeenCalledWith('activate', '0');
  });

  it('should record a preset', async () => {
    const event = {
      options: {
        presetID: '1',
      },
    };

    await actions(self)
    const recordPreset = self.setActionDefinitions.mock.calls[0][0].recordPreset
    await recordPreset.callback(event);

    expect(self.device.runPresetAction).toHaveBeenCalledWith('record', '1');
  });

  it('should log when it has an error with recording a preset', async () => {
    const event = {
      options: {
        presetID: '0',
      },
    };

    // set the mock to reject
    self.device.runPresetAction.mockRejectedValueOnce(new Error('Mocked error'));

    await actions(self)
    const recordPreset = self.setActionDefinitions.mock.calls[0][0].recordPreset
    await recordPreset.callback(event);

    
    expect(self.device.runPresetAction).toHaveBeenCalledWith('record', '0');
    expect(self.log).toHaveBeenCalledWith('error', 'Mocked error');
    // expect(self.getStates).toHaveBeenCalled();
  });

  it('should change overrides state', async () => {
    const event = {
      options: {
        wantedState: 'activate',
        overrideID: '1',
      },
    };

    await actions(self);
    const changeOverridesState = self.setActionDefinitions.mock.calls[0][0].changeOverridesState;
    await changeOverridesState.callback(event);

    expect(self.device.runOverridesAction).toHaveBeenCalledWith('activate', '1');
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should change macro state', async () => {
    const event = {
      options: {
        wantedState: 'on',
        macroID: '1',
      },
    };

    self.device.runMacroAction.mockReturnValueOnce({
      id: 1,
      state: 2
    })

    await actions(self);
    const changeMacroState = self.setActionDefinitions.mock.calls[0][0].changeMacroState;
    await changeMacroState.callback(event);

    expect(self.device.runMacroAction).toHaveBeenCalledWith('on', '1');
    expect(self.setVariableValues).toHaveBeenCalledWith({
      'macro_1_state': 2
    });
  });

  it('should open wall when wall is closed', async () => {
    const event = {
      options: {
        wantedState: '1',
        wallID: '1',
      },
    };

    await actions(self);
    const changeWallState = self.setActionDefinitions.mock.calls[0][0].changeWallState;

    // mock current wall state
    self.getVariableValue.mockReturnValueOnce(0)
    await changeWallState.callback(event);

    expect(self.getVariableValue).toHaveBeenCalledWith(`wall_${event.options.wallID}_state`);

    expect(self.device.runWallAction).toHaveBeenCalledWith('toggle', '1');
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should close wall when wall is open', async () => {
    const event = {
      options: {
        wantedState: '0',
        wallID: '1',
      },
    };

    // mock current wall state
    self.getVariableValue.mockReturnValueOnce(1)

    await actions(self);
    const changeWallState = self.setActionDefinitions.mock.calls[0][0].changeWallState;
    await changeWallState.callback(event);

    expect(self.getVariableValue).toHaveBeenCalledWith(`wall_${event.options.wallID}_state`);

    expect(self.device.runWallAction).toHaveBeenCalledWith('toggle', '1');
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should not close wall when wall is already closed', async () => {
    const event = {
      options: {
        wantedState: '0',
        wallID: '1',
      },
    };

    // mock current wall state
    self.getVariableValue.mockReturnValueOnce(0)

    await actions(self);
    const changeWallState = self.setActionDefinitions.mock.calls[0][0].changeWallState;
    await changeWallState.callback(event);

    expect(self.getVariableValue).toHaveBeenCalledWith(`wall_${event.options.wallID}_state`);

    expect(self.device.runWallAction).not.toHaveBeenCalled();
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should not open wall when wall is already already', async () => {
    const event = {
      options: {
        wantedState: '1',
        wallID: '1',
      },
    };

    // mock current wall state
    self.getVariableValue.mockReturnValueOnce(1)

    await actions(self);
    const changeWallState = self.setActionDefinitions.mock.calls[0][0].changeWallState;
    await changeWallState.callback(event);

    expect(self.getVariableValue).toHaveBeenCalledWith(`wall_${event.options.wallID}_state`);

    expect(self.device.runWallAction).not.toHaveBeenCalled();
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should toggle wall state', async () => {
    const event = {
      options: {
        wantedState: 'toggle',
        wallID: '1',
      },
    };

    

    await actions(self);
    // mock current wall state
    self.getVariableValue.mockReturnValueOnce(0)
    const changeWallState = self.setActionDefinitions.mock.calls[0][0].changeWallState;
    await changeWallState.callback(event);

    expect(self.getVariableValue).toHaveBeenCalledWith(`wall_${event.options.wallID}_state`);

    expect(self.device.runWallAction).toHaveBeenCalledWith('toggle', '1');
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should run sequences action', async () => {
    const event = {
      options: {
        wantedState: 'start',
        sequenceID: '1',
      },
    };

    await actions(self);
    const runSequenceAction = self.setActionDefinitions.mock.calls[0][0].runSequenceAction;
    await runSequenceAction.callback(event);

    expect(self.device.runSequencesAction).toHaveBeenCalledWith('start', '1');
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should set channel level', async () => {
    const event = {
      options: {
        wantedState: '1',
        channelID: '1',
      },
    };

    await actions(self);
    const setChannelLevel = self.setActionDefinitions.mock.calls[0][0].setChannelLevel;
    await setChannelLevel.callback(event);

    expect(self.device.runChannelsAction).toHaveBeenCalledWith('set_level', '1', '1');
    expect(self.getStates).toHaveBeenCalled();
  });

  it('should adjust channel level', async () => {
    const event = {
      options: {
        wantedState: 10,
        channelID: '1',
      },
    };
    self.getVariableValue.mockReturnValueOnce(50);

    await actions(self);
    const adjustChannelLevel = self.setActionDefinitions.mock.calls[0][0].adjustChannelLevel;
    await adjustChannelLevel.callback(event);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(self.setVariableValues).toHaveBeenCalledWith({ channel_1_level: 60 });
    expect(self.device.runChannelsAction).toHaveBeenCalledWith('set_level', '1', 60);
  });

  it('should clamp a value between min and max', () => {
    expect(clamp(10, 0, 100)).toBe(10);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(200, 0, 100)).toBe(100);
  });
});
