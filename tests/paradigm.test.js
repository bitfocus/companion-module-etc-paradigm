const Paradigm = require('../paradigm');

require('jest-fetch-mock').enableMocks()

describe('Paradigm Tests', () => {
  let paradigm;
  const host = '10.101.10.101';

  beforeEach(() => {
    paradigm = new Paradigm(host);
    fetch.resetMocks();
    jest.useFakeTimers()
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers()
  });

  describe('getInfo', () => {
    const info = 'system';
    const url = `http://${host}/get/${info}`;

    it('should return parsed JSON when response status is 200', async () => {

        fetch.mockResponseOnce(JSON.stringify({ "processor_name": "Processor 1",
        "processor_number": 1 }));

      const result = await paradigm.getInfo(info);

      expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
      expect(result).toEqual({ "processor_name": "Processor 1",
      "processor_number": 1 });
    });

    it('should throw an error when response status is not 200', async () => {
        fetch.mockResponses(
            [
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 204 }
          ]
        )

      await expect(paradigm.getInfo(info)).rejects.toThrowError(
        `Error trying to send request: http://10.101.10.101/get/system`
      );
    });

    it('should throw an error when an error occurs during the request', async () => {
      const error = new Error('Network error');
      fetch.mockRejectedValue(error);

      await expect(paradigm.getInfo(info)).rejects.toThrowError(error);
    });

    // test the abort controller
    it('should throw an error when taking too long', async () => {
        const error = new Error('The operation was aborted. ');
        fetch.mockAbort()
  
        await expect(paradigm.getInfo(info)).rejects.toThrowError(error);
      });
  });

  describe('getAllInfo', () => {
    it('should return an object with information for each feature', async () => {
      const features = ['system', 'macros', 'presets', 'sequences', 'channels', 'walls', 'overrides', 'spaces'];
      const responses = {
        system: { name: 'Paradigm System' },
        macros: [{ id: 0, name: 'Macro 1' }],
        presets: [{ id: 0, name: 'Preset 1' }],
        sequences: [{ id: 0, name: 'Sequence 1' }],
        channels: [{ id: 0, name: 'Channel 1' }],
        walls: [{ id: 0, name: 'Wall 1' }],
        overrides: [{ id: 0, name: 'Override 1' }],
        spaces: { "0": "Global"},
      };
      const expectedInfo = {
        system: { name: 'Paradigm System' },
        macros: [{ id: 0, name: 'Macro 1' }],
        presets: [{ id: 0, name: 'Preset 1' }],
        sequences: [{ id: 0, name: 'Sequence 1' }],
        channels: [{ id: 0, name: 'Channel 1' }],
        walls: [{ id: 0, name: 'Wall 1' }],
        overrides: [{ id: 0, name: 'Override 1' }],
        spaces: { "0": "Global"},
      };

      features.forEach((feature) => {
        fetch.mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue(JSON.stringify(responses[feature])),
        });
      });

      const result = await paradigm.getAllInfo();

      expect(result).toEqual(expectedInfo);
      features.forEach((feature) => {
        expect(fetch).toHaveBeenCalledWith(`http://${host}/get/${feature}`, expect.any(Object));
      });
    });
  });

  describe('getControlStatus', () => {
    const url = `http://${host}/get/control_status`;

    it('should return parsed JSON when response status is 200', async () => {
      const response = {
        status: 200,
        text: jest.fn().mockResolvedValue('{"power": true, "volume": 50}'),
      };
      fetch.mockResolvedValue(response);

      const result = await paradigm.getControlStatus();

      expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
      expect(response.text).toHaveBeenCalled();
      expect(result).toEqual({ power: true, volume: 50 });
    });

    it('should throw an error when response status is not 200', async () => {
        fetch.mockResponses(
            [
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 204 }
          ]
        )

      await expect(paradigm.getControlStatus()).rejects.toThrowError(
        'Error trying to send request: http://10.101.10.101/get/control_status'
      );
    });

    it('should throw an error when an error occurs during the request', async () => {
      const error = new Error('Network error');
      fetch.mockRejectedValue(error);

      await expect(paradigm.getControlStatus()).rejects.toThrowError(error);
    });
  });

  describe('runAction', () => {
    const feature = 'channels';
    const action = 'set_level';
    const id = 1;
    const url = `http://${host}/do/${action}?id=${id}&level=100`;
    const options = [
        {
            name: 'level',
            value: `100`,
        },
      ]

    it('should return parsed JSON when response status is 200', async () => {
        fetch.mockResponses(
            [
            JSON.stringify({}),
            { status: 200 }
          ]
        )

      const result = await paradigm.runAction(feature, action, id, options);

      expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
      expect(result).toEqual({});
    });

    it('should throw an error when response status is not 200', async () => {
        fetch.mockResponses(
            [
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 204 }
          ]
        )

      await expect(paradigm.runAction(feature, action, id, options)).rejects.toThrowError(
        'Error trying to run action: set_level'
      );
    });

    it('should throw an error when an error occurs during the request', async () => {
      const error = new Error('Error trying to run action: set_level');
      fetch.mockRejectedValue(error);

      await expect(paradigm.runAction(feature, action, id)).rejects.toThrowError(error);
    });
  });

  describe('runChannelsAction', () => {
    // beforeEach(() => {
    //     jest.spyOn(paradigm, 'runAction').mockImplementation(() => {
    //       // Mock implementation of `paradigm.runAction`
    //       // You can return a specific value or perform custom logic here
    //     });
    //   });
    const action = 'set_level';
    const id = 1;
    const level = 50;

    it('should throw an error when level is out of range', async () => {
      expect(() => {paradigm.runChannelsAction(action, id, -10)}).toThrow(new Error('Out of Range'));
      expect(() => {paradigm.runChannelsAction(action, id, 110)}).toThrow(new Error('Out of Range'));
    });

    it('should call runAction with the correct parameters', async () => {
        fetch.mockResponses(
            [
            JSON.stringify({}),
            { status: 200 }
          ]
        )
      const expectedOptions = [
        {
          name: 'level',
          value: '50',
        },
      ];
      const expectedUrl = `http://${host}/do/${action}?id=${id}&level=50`;

      await paradigm.runChannelsAction(action, id, level);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });
  });

  describe('runMacroAction', () => {
    const id = 1;

    it('should call runAction with the correct parameters when state is "on"', async () => {
      const state = 'on';
      const expectedUrl = `http://${host}/do/macro_on?id=${id}`;

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": 1,
            "state": 2
        }),
        { status: 200 }
      ]
    )

      const result = await paradigm.runMacroAction(state, id);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(result).toEqual({
        "id": 1,
        "state": 2
    })
    });

    it('should call runAction with the correct parameters when state is "off"', async () => {
      const state = 'off';
      const expectedUrl = `http://${host}/do/macro_off?id=${id}`;

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": 1,
            "state": 2
        }),
        { status: 200 }
      ]
    )

      const result = await paradigm.runMacroAction(state, id);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(result).toEqual({
        "id": 1,
        "state": 2
    })
    });

    it('should call runAction with the correct parameters when state is "cancel"', async () => {
      const state = 'cancel';
      const expectedUrl = `http://${host}/do/macro_cancel?id=${id}`;

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": 1,
            "state": 0
        }),
        { status: 200 }
      ]
    )

      const result = await paradigm.runMacroAction(state, id);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(result).toEqual({
        "id": 1,
        "state": 0
    })
    });

    it('should return the result from runAction', async () => {
      const state = 'on';
      fetch.mockResponses(
        [
        JSON.stringify({
            "id": 1,
            "state": 2
        }),
        { status: 200 }
      ]
    )

      const result = await paradigm.runMacroAction(state, id);

      expect(result).toEqual({
        "id": 1,
        "state": 2
    });
    });
  });

  describe('runPresetAction', () => {
    const id = 1;
  
    it('should call runAction with the correct parameters when state is "activate"', async () => {
      const state = 'activate';
      const expectedAction = 'preset_activate';
      const expectedOptions = [
        {
          name: 'on',
          value: 1,
        },
      ];

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runPresetAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('presets', expectedAction, id, expectedOptions);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should call runAction with the correct parameters when state is "deactivate"', async () => {
      const state = 'deactivate';
      const expectedAction = 'preset_activate';
      const expectedOptions = [
        {
          name: 'on',
          value: 0,
        },
      ];

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runPresetAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('presets', expectedAction, id, expectedOptions);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should call runAction with the correct parameters when state is "record"', async () => {
      const state = 'record';
      const expectedAction = 'preset_record';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runPresetAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('presets', expectedAction, id, []);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should return false for unknown state', () => {
      const state = 'unknown';
  
      const result = paradigm.runPresetAction(state, id);
  
      expect(result).toBe(false);
    });
  });
  
  describe('runWallAction', () => {
    const id = 1;
  
    it('should call runAction with the correct parameters when state is "toggle"', async () => {
      const state = 'toggle';
      const expectedAction = 'toggle_wall';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runWallAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('walls', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should return false for unknown state', () => {
      const state = 'unknown';
  
      const result = paradigm.runWallAction(state, id);
  
      expect(result).toBe(false);
    });
  });
  
  describe('runOverridesAction', () => {
    const id = 1;
  
    it('should call runAction with the correct parameters when state is "activate"', async () => {
      const state = 'activate';
      const expectedAction = 'activate_override';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runOverridesAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('overrides', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should call runAction with the correct parameters when state is "deactivate"', async () => {
      const state = 'deactivate';
      const expectedAction = 'deactivate_override';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runOverridesAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('overrides', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should return false for unknown state', () => {
      const state = 'unknown';
  
      const result = paradigm.runOverridesAction(state, id);
  
      expect(result).toBe(false);
    });
  });
  
  describe('runSequencesAction', () => {
    const id = 1;
  
    it('should call runAction with the correct parameters when state is "start"', async () => {
      const state = 'start';
      const expectedAction = 'start_sequence';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runSequencesAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('sequences', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should call runAction with the correct parameters when state is "stop"', async () => {
      const state = 'stop';
      const expectedAction = 'stop_sequence';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runSequencesAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('sequences', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should call runAction with the correct parameters when state is "pause"', async () => {
      const state = 'pause';
      const expectedAction = 'pause_sequence';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runSequencesAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('sequences', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should call runAction with the correct parameters when state is "resume"', async () => {
      const state = 'resume';
      const expectedAction = 'resume_sequence';

      fetch.mockResponses(
        [
        JSON.stringify({
            "id": id
        }),
        { status: 200 }
      ]
    )
  
      const runActionMock = jest.spyOn(paradigm, 'runAction');
      const result = await paradigm.runSequencesAction(state, id);
  
      expect(runActionMock).toHaveBeenCalledWith('sequences', expectedAction, id);
      expect(result).toEqual({
        "id": id
    });
  
      runActionMock.mockRestore();
    });
  
    it('should return false for unknown state', () => {
      const state = 'unknown';
  
      const result = paradigm.runSequencesAction(state, id);
  
      expect(result).toBe(false);
    });
  });
  
});
