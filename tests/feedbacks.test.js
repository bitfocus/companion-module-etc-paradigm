const { combineRgb } = require('@companion-module/base');
const feebacks = require('../feedbacks');
const feedbacks = require('../feedbacks');

describe('Module Tests', () => {
  let self;

  beforeEach(() => {
    self = {
      CHOICES_OVERRIDES: [
        { id: '1', label: 'Override 1' },
        { id: '2', label: 'Override 2' },
      ],
      CHOICES_PRESETS: [
        { id: '1', label: 'Preset 1' },
        { id: '2', label: 'Preset 2' },
      ],
      CHOICES_WALLS: [
        { id: '1', label: 'Wall 1' },
        { id: '2', label: 'Wall 2' },
      ],
      CHOICES_MACROS: [
        { id: '1', label: 'Macro 1' },
        { id: '2', label: 'Macro 2' },
      ],
      CHOICES_CHANNELS: [
        { id: '1', label: 'Channel 1' },
        { id: '2', label: 'Channel 2' },
      ],
      getVariableValue: jest.fn(),
      log: jest.fn(),
      setupChoices: jest.fn(),
      setFeedbackDefinitions: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set feedbacks to companion', async () => {
    await feebacks(self)
    expect(self.setFeedbackDefinitions).toHaveBeenCalled()
  });

  it('should not have an empty tooltip.', async () => {

    await feedbacks(self)
    const moduleFeedbacks = self.setFeedbackDefinitions.mock.calls[0][0]

    // make sure each one doesn't have an empty tooltip
    for (const key in moduleFeedbacks) {
      if (Object.hasOwnProperty.call(moduleFeedbacks, key)) {
        const element = moduleFeedbacks[key];

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

  it('should check override state', async () => {
    const feedback = {
      options: {
        overrideID: '1',
        checkState: true,
      },
    };

    self.getVariableValue.mockReturnValue(true);
    await feedbacks(self)
    const overRideState = self.setFeedbackDefinitions.mock.calls[0][0].overRideState
    const result = overRideState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('override_1_state');
    expect(result).toBe(true);
  });

  it('should log when it has an error', async () => {
    const feedback = {
      options: {
        overrideID: '1',
        checkState: true,
      },
    };

    await feedbacks(self)
    const overRideState = self.setFeedbackDefinitions.mock.calls[0][0].overRideState
    // test the callback

    // set the mock to reject
    self.getVariableValue.mockImplementation(() => {
      throw new Error('Mocked error')
    })

    const result = overRideState.callback(feedback);
    expect(self.log).toHaveBeenCalledWith('error', 'Feedback error: Mocked error');
  });

  it('should check preset state', async () => {
    const feedback = {
      options: {
        presetID: '1',
        checkState: 'Activated',
      },
    };

    self.getVariableValue.mockReturnValue('Activated');
    await feedbacks(self)
    const presetState = self.setFeedbackDefinitions.mock.calls[0][0].presetState
    const result = presetState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('preset_1_state');
    expect(result).toBe(true);
  });

  it('should check wall state', async () => {
    const feedback = {
      options: {
        wallID: '1',
        checkState: 1,
      },
    };

    self.getVariableValue.mockReturnValue(1);
    await feedbacks(self)
    const wallState = self.setFeedbackDefinitions.mock.calls[0][0].wallState
    const result = wallState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('wall_1_state');
    expect(result).toBe(true);
  });

  it('should check macro state', async () => {
    const feedback = {
      options: {
        macroID: '1',
        checkState: 0,
      },
    };

    self.getVariableValue.mockReturnValue(0);
    await feedbacks(self)
    const macroState = self.setFeedbackDefinitions.mock.calls[0][0].macroState
    const result = macroState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('macro_1_state');
    expect(result).toBe(true);
  });

  it('should check channel state when equal', async () => {
    const feedback = {
      options: {
        channelID: '1',
        operation: '=',
        checkState: 50,
      },
    };

    self.getVariableValue.mockReturnValue(50);
    await feedbacks(self)
    const channelState = self.setFeedbackDefinitions.mock.calls[0][0].channelState
    const result = channelState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(result).toBe(true);
  });

  it('should check channel state when not equal', async () => {
    const feedback = {
      options: {
        channelID: '1',
        operation: '!=',
        checkState: 50,
      },
    };

    self.getVariableValue.mockReturnValue(50);
    await feedbacks(self)
    const channelState = self.setFeedbackDefinitions.mock.calls[0][0].channelState
    const result = channelState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(result).toBe(false);
  });

  it('should check channel state when current is > wanted and return true', async () => {
    const feedback = {
      options: {
        channelID: '1',
        operation: '>',
        checkState: 50,
      },
    };

    self.getVariableValue.mockReturnValue(75);
    await feedbacks(self)
    const channelState = self.setFeedbackDefinitions.mock.calls[0][0].channelState
    const result = channelState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(result).toBe(true);
  });

  it('should check channel state when current is > wanted and return false', async () => {
    const feedback = {
      options: {
        channelID: '1',
        operation: '>',
        checkState: 50,
      },
    };

    self.getVariableValue.mockReturnValue(25);
    await feedbacks(self)
    const channelState = self.setFeedbackDefinitions.mock.calls[0][0].channelState
    const result = channelState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(result).toBe(false);
  });

  it('should check channel state when current is < wanted and return true', async () => {
    const feedback = {
      options: {
        channelID: '1',
        operation: '<',
        checkState: 50,
      },
    };

    self.getVariableValue.mockReturnValue(25);
    await feedbacks(self)
    const channelState = self.setFeedbackDefinitions.mock.calls[0][0].channelState
    const result = channelState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(result).toBe(true);
  });

  it('should check channel state when current is < wanted and return false', async () => {
    const feedback = {
      options: {
        channelID: '1',
        operation: '<',
        checkState: 50,
      },
    };

    self.getVariableValue.mockReturnValue(75);
    await feedbacks(self)
    const channelState = self.setFeedbackDefinitions.mock.calls[0][0].channelState
    const result = channelState.callback(feedback);

    expect(self.getVariableValue).toHaveBeenCalledWith('channel_1_level');
    expect(result).toBe(false);
  });
});
