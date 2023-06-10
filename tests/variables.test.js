const setupModule = require('../variables');
const { buildVariables, buildVariablesValues } = setupModule

describe('Variables Tests', () => {
  let self;

  beforeEach(() => {
    self = {
      deviceInfo: {},
      setVariableDefinitions: jest.fn(),
      setVariableValues: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set default variables and values when device is not loaded', async () => {
    await setupModule(self);

    expect(self.setVariableDefinitions).toHaveBeenCalled()

    expect(self.setVariableValues).toHaveBeenCalledWith({
      processor_name: '',
      processor_number: '',
      current_time: '',
      uptime: '',
      rack_status: '',
      station_count: ''
    });
  });

  it('should set variables and values from device when it is loaded', async () => {
    self.deviceInfo = {
      system: {
        "processor_name": "Processor 1",
        "processor_number": 1,
        "ip_address": 174393957,
        "current_time": "06/09/2023 10:00am (UTC-5)",
        "uptime": 995721,
        "rack_status": "ERn",
        "stations": [{
            "number": "1",
            "name": "HOUSE LEFT",
            "status": "Online"
        }, {
            "number": "2",
            "name": "HOUSE RIGHT",
            "status": "Online"
        }, {
            "number": "3",
            "name": "SL ENTRANCE",
            "status": "Online"
        }, {
            "number": "4",
            "name": "SR ENTRANCE",
            "status": "Online"
        }, {
            "number": "5",
            "name": "Touchscreen 1",
            "status": "Online"
        }],
        "mosaics": [],
    },
      macros: [{
        "id": 0,
        "name": "OVERRIDE",
        "state": 0
    }, {
        "id": 1,
        "name": "HOUSE 100",
        "state": 0
    }, {
        "id": 2,
        "name": "HOUSE 75",
        "state": 0
    }, {
        "id": 3,
        "name": "HOUSE 50",
        "state": 1
    }, {
        "id": 4,
        "name": "HOUSE 25",
        "state": 0
    }, {
        "id": 5,
        "name": "HOUSE OFF",
        "state": 0
    }, {
        "id": 6,
        "name": "STATION LOCKOUT",
        "state": 1
    }, {
        "id": 7,
        "name": "GLOBAL OFF",
        "state": 0
    }, {
        "id": 8,
        "name": "PRESET11",
        "state": 0
    }, {
        "id": 9,
        "name": "PRESET 13",
        "state": 0
    }, {
        "id": 10,
        "name": "PRESET 12",
        "state": 0
    }, {
        "id": 11,
        "name": "PRESET 14",
        "state": 0
    }, {
        "id": 12,
        "name": "PRESET 15",
        "state": 0
    }, {
        "id": 13,
        "name": "PRESET 16",
        "state": 0
    }, {
        "id": 14,
        "name": "PRESET 17",
        "state": 0
    }, {
        "id": 15,
        "name": "PRESET 18",
        "state": 0
    }, {
        "id": 16,
        "name": "PRESET 19",
        "state": 0
    }, {
        "id": 17,
        "name": "PRESET 20",
        "state": 0
    }, {
        "id": 18,
        "name": "PRESET 21",
        "state": 0
    }, {
        "id": 19,
        "name": "PRESET 22",
        "state": 0
    }, {
        "id": 20,
        "name": "PRESET 23",
        "state": 0
    }, {
        "id": 21,
        "name": "PRESET 24",
        "state": 0
    }, {
        "id": 22,
        "name": "PRESET 25",
        "state": 0
    }, {
        "id": 23,
        "name": "PRESET 26",
        "state": 0
    }, {
        "id": 24,
        "name": "PRESET 27",
        "state": 0
    }, {
        "id": 25,
        "name": "PRESET 28",
        "state": 0
    }, {
        "id": 26,
        "name": "VARALITE DOUSE",
        "state": 0
    }, {
        "id": 29,
        "name": "DIMMER RELAY",
        "state": 0
    }, {
        "id": 30,
        "name": "primary delay",
        "state": 0
    }, {
        "id": 33,
        "name": "SCONCE RELAY",
        "state": 0
    }],
      presets: [{
        "id": 40,
        "name": "preset100",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 41,
        "name": "primary off",
        "space": 1,
        "state": "Altered"
    }, {
        "id": 2,
        "name": "Preset 3",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 3,
        "name": "Preset 4",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 4,
        "name": "HOUSE FULL",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 5,
        "name": "HOUSE 75%",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 6,
        "name": "HOUSE 50%",
        "space": 1,
        "state": "Activated"
    }, {
        "id": 7,
        "name": "HOUSE 25%",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 8,
        "name": "Preset 5",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 9,
        "name": "Preset 6",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 10,
        "name": "Preset 7",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 11,
        "name": "Preset 8",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 12,
        "name": "Preset 9",
        "space": 3,
        "state": "Deactivated"
    }, {
        "id": 13,
        "name": "Preset 10",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 14,
        "name": "Preset 11",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 15,
        "name": "Preset 12",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 16,
        "name": "Preset 13",
        "space": 0,
        "state": "Altered"
    }, {
        "id": 17,
        "name": "Preset 14",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 18,
        "name": "Preset 15",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 19,
        "name": "Preset 16",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 20,
        "name": "Preset 17",
        "space": 0,
        "state": "Altered"
    }, {
        "id": 21,
        "name": "Preset 18",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 22,
        "name": "Preset 19",
        "space": 0,
        "state": "Altered"
    }, {
        "id": 23,
        "name": "Preset 20",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 24,
        "name": "Preset 21",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 25,
        "name": "Preset 22",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 26,
        "name": "Preset 23",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 27,
        "name": "Preset 24",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 28,
        "name": "Preset 25",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 29,
        "name": "Preset 26",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 30,
        "name": "Preset 27",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 31,
        "name": "Preset 28",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 32,
        "name": "Preset 29",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 33,
        "name": "Preset 30",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 34,
        "name": "Preset 31",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 35,
        "name": "Preset 32",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 36,
        "name": "Preset 33",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 37,
        "name": "Preset 34",
        "space": 0,
        "state": "Deactivated"
    }, {
        "id": 39,
        "name": "HOUSE OFF",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 42,
        "name": "houseth relays",
        "space": 1,
        "state": "Deactivated"
    }, {
        "id": 43,
        "name": "entrance100",
        "space": 1,
        "state": "Deactivated"
    }],
      walls: [{ id: 0, name: 'Wall 1', state: 1 }, { id: 1, name: 'Wall 2', state: 0 }],
      sequences: [{ id: 0, name: 'Sequence 1', state: 1 }, { id: 1, name: 'Sequence 2', state: 0 }],
      channels: [{
        "id": 0,
        "name": "Zone 1",
        "space": 1,
        "level": 47
    }, {
        "id": 1,
        "name": "Zone 2",
        "space": 1,
        "level": 47
    }, {
        "id": 2,
        "name": "Zone 3",
        "space": 1,
        "level": 47
    }, {
        "id": 3,
        "name": "Zone 4",
        "space": 1,
        "level": 47
    }, {
        "id": 4,
        "name": "Zone 5",
        "space": 1,
        "level": 47
    }, {
        "id": 5,
        "name": "Zone 6",
        "space": 1,
        "level": 47
    }, {
        "id": 6,
        "name": "Zone 7",
        "space": 1,
        "level": 47
    }, {
        "id": 7,
        "name": "Zone 8",
        "space": 1,
        "level": 47
    }, {
        "id": 8,
        "name": "Zone 9",
        "space": 1,
        "level": 47
    }, {
        "id": 9,
        "name": "Zone 10",
        "space": 1,
        "level": 47
    }, {
        "id": 10,
        "name": "Zone 11",
        "space": 1,
        "level": 47
    }, {
        "id": 194,
        "name": "Zone 195",
        "space": 1,
        "level": 0
    }, {
        "id": 1068,
        "name": "Zone 45",
        "space": 3,
        "level": 0
    }, {
        "id": 1069,
        "name": "Zone 46",
        "space": 3,
        "level": 0
    }, {
        "id": 1070,
        "name": "Zone 47",
        "space": 3,
        "level": 0
    }, {
        "id": 1071,
        "name": "Zone 48",
        "space": 3,
        "level": 0
    }, {
        "id": 1072,
        "name": "Zone 49",
        "space": 3,
        "level": 0
    }, {
        "id": 1073,
        "name": "Zone 50",
        "space": 3,
        "level": 0
    }, {
        "id": 1074,
        "name": "Zone 51",
        "space": 3,
        "level": 0
    }, {
        "id": 1075,
        "name": "Zone 52",
        "space": 3,
        "level": 0
    }, {
        "id": 1076,
        "name": "Zone 53",
        "space": 3,
        "level": 0
    }, {
        "id": 1077,
        "name": "Zone 54",
        "space": 3,
        "level": 0
    }, {
        "id": 1078,
        "name": "Zone 55",
        "space": 3,
        "level": 0
    }, {
        "id": 1079,
        "name": "Zone 56",
        "space": 3,
        "level": 0
    }, {
        "id": 1080,
        "name": "Zone 57",
        "space": 3,
        "level": 0
    }, {
        "id": 1081,
        "name": "Zone 58",
        "space": 3,
        "level": 0
    }, {
        "id": 1082,
        "name": "Zone 59",
        "space": 3,
        "level": 0
    }, {
        "id": 1083,
        "name": "Zone 60",
        "space": 3,
        "level": 0
    }, {
        "id": 1084,
        "name": "Zone 61",
        "space": 3,
        "level": 0
    }, {
        "id": 1085,
        "name": "Zone 62",
        "space": 3,
        "level": 0
    }, {
        "id": 1086,
        "name": "Zone 63",
        "space": 3,
        "level": 0
    }, {
        "id": 1087,
        "name": "Zone 64",
        "space": 3,
        "level": 0
    }, {
        "id": 1088,
        "name": "Zone 65",
        "space": 3,
        "level": 0
    }, {
        "id": 1089,
        "name": "Zone 66",
        "space": 3,
        "level": 0
    }, {
        "id": 1525,
        "name": "Zone 502",
        "space": 3,
        "level": 0
    }, {
        "id": 1526,
        "name": "Zone 503",
        "space": 3,
        "level": 0
    }, {
        "id": 1527,
        "name": "Zone 504",
        "space": 3,
        "level": 0
    }]
    ,
      overrides: [{
        "id": 0,
        "name": "Override 1",
        "state": false
    }]
    ,
    };

    await setupModule(self);

    expect(self.setVariableDefinitions).toHaveBeenCalledWith([
  {
    "name": "Processor Name",
    "variableId": "processor_name",
  },
  {
    "name": "Processor Number",
    "variableId": "processor_number",
  },
  {
    "name": "Current Time",
    "variableId": "current_time",
  },
  {
    "name": "Uptime",
    "variableId": "uptime",
  },
  {
    "name": "Dimmer Rack",
    "variableId": "rack_status",
  },
  {
    "name": "Stations",
    "variableId": "station_count",
  },
  {
    "name": "Macro 1 name",
    "variableId": "macro_0_label",
  },
  {
    "name": "Macro 2 name",
    "variableId": "macro_1_label",
  },
  {
    "name": "Macro 3 name",
    "variableId": "macro_2_label",
  },
  {
    "name": "Macro 4 name",
    "variableId": "macro_3_label",
  },
  {
    "name": "Macro 5 name",
    "variableId": "macro_4_label",
  },
  {
    "name": "Macro 6 name",
    "variableId": "macro_5_label",
  },
  {
    "name": "Macro 7 name",
    "variableId": "macro_6_label",
  },
  {
    "name": "Macro 8 name",
    "variableId": "macro_7_label",
  },
  {
    "name": "Macro 9 name",
    "variableId": "macro_8_label",
  },
  {
    "name": "Macro 10 name",
    "variableId": "macro_9_label",
  },
  {
    "name": "Macro 11 name",
    "variableId": "macro_10_label",
  },
  {
    "name": "Macro 12 name",
    "variableId": "macro_11_label",
  },
  {
    "name": "Macro 13 name",
    "variableId": "macro_12_label",
  },
  {
    "name": "Macro 14 name",
    "variableId": "macro_13_label",
  },
  {
    "name": "Macro 15 name",
    "variableId": "macro_14_label",
  },
  {
    "name": "Macro 16 name",
    "variableId": "macro_15_label",
  },
  {
    "name": "Macro 17 name",
    "variableId": "macro_16_label",
  },
  {
    "name": "Macro 18 name",
    "variableId": "macro_17_label",
  },
  {
    "name": "Macro 19 name",
    "variableId": "macro_18_label",
  },
  {
    "name": "Macro 20 name",
    "variableId": "macro_19_label",
  },
  {
    "name": "Macro 21 name",
    "variableId": "macro_20_label",
  },
  {
    "name": "Macro 22 name",
    "variableId": "macro_21_label",
  },
  {
    "name": "Macro 23 name",
    "variableId": "macro_22_label",
  },
  {
    "name": "Macro 24 name",
    "variableId": "macro_23_label",
  },
  {
    "name": "Macro 25 name",
    "variableId": "macro_24_label",
  },
  {
    "name": "Macro 26 name",
    "variableId": "macro_25_label",
  },
  {
    "name": "Macro 27 name",
    "variableId": "macro_26_label",
  },
  {
    "name": "Macro 30 name",
    "variableId": "macro_29_label",
  },
  {
    "name": "Macro 31 name",
    "variableId": "macro_30_label",
  },
  {
    "name": "Macro 34 name",
    "variableId": "macro_33_label",
  },
  {
    "name": "Macro 1 state",
    "variableId": "macro_0_state",
  },
  {
    "name": "Macro 2 state",
    "variableId": "macro_1_state",
  },
  {
    "name": "Macro 3 state",
    "variableId": "macro_2_state",
  },
  {
    "name": "Macro 4 state",
    "variableId": "macro_3_state",
  },
  {
    "name": "Macro 5 state",
    "variableId": "macro_4_state",
  },
  {
    "name": "Macro 6 state",
    "variableId": "macro_5_state",
  },
  {
    "name": "Macro 7 state",
    "variableId": "macro_6_state",
  },
  {
    "name": "Macro 8 state",
    "variableId": "macro_7_state",
  },
  {
    "name": "Macro 9 state",
    "variableId": "macro_8_state",
  },
  {
    "name": "Macro 10 state",
    "variableId": "macro_9_state",
  },
  {
    "name": "Macro 11 state",
    "variableId": "macro_10_state",
  },
  {
    "name": "Macro 12 state",
    "variableId": "macro_11_state",
  },
  {
    "name": "Macro 13 state",
    "variableId": "macro_12_state",
  },
  {
    "name": "Macro 14 state",
    "variableId": "macro_13_state",
  },
  {
    "name": "Macro 15 state",
    "variableId": "macro_14_state",
  },
  {
    "name": "Macro 16 state",
    "variableId": "macro_15_state",
  },
  {
    "name": "Macro 17 state",
    "variableId": "macro_16_state",
  },
  {
    "name": "Macro 18 state",
    "variableId": "macro_17_state",
  },
  {
    "name": "Macro 19 state",
    "variableId": "macro_18_state",
  },
  {
    "name": "Macro 20 state",
    "variableId": "macro_19_state",
  },
  {
    "name": "Macro 21 state",
    "variableId": "macro_20_state",
  },
  {
    "name": "Macro 22 state",
    "variableId": "macro_21_state",
  },
  {
    "name": "Macro 23 state",
    "variableId": "macro_22_state",
  },
  {
    "name": "Macro 24 state",
    "variableId": "macro_23_state",
  },
  {
    "name": "Macro 25 state",
    "variableId": "macro_24_state",
  },
  {
    "name": "Macro 26 state",
    "variableId": "macro_25_state",
  },
  {
    "name": "Macro 27 state",
    "variableId": "macro_26_state",
  },
  {
    "name": "Macro 30 state",
    "variableId": "macro_29_state",
  },
  {
    "name": "Macro 31 state",
    "variableId": "macro_30_state",
  },
  {
    "name": "Macro 34 state",
    "variableId": "macro_33_state",
  },
  {
    "name": "Preset 41 name",
    "variableId": "preset_40_label",
  },
  {
    "name": "Preset 42 name",
    "variableId": "preset_41_label",
  },
  {
    "name": "Preset 3 name",
    "variableId": "preset_2_label",
  },
  {
    "name": "Preset 4 name",
    "variableId": "preset_3_label",
  },
  {
    "name": "Preset 5 name",
    "variableId": "preset_4_label",
  },
  {
    "name": "Preset 6 name",
    "variableId": "preset_5_label",
  },
  {
    "name": "Preset 7 name",
    "variableId": "preset_6_label",
  },
  {
    "name": "Preset 8 name",
    "variableId": "preset_7_label",
  },
  {
    "name": "Preset 9 name",
    "variableId": "preset_8_label",
  },
  {
    "name": "Preset 10 name",
    "variableId": "preset_9_label",
  },
  {
    "name": "Preset 11 name",
    "variableId": "preset_10_label",
  },
  {
    "name": "Preset 12 name",
    "variableId": "preset_11_label",
  },
  {
    "name": "Preset 13 name",
    "variableId": "preset_12_label",
  },
  {
    "name": "Preset 14 name",
    "variableId": "preset_13_label",
  },
  {
    "name": "Preset 15 name",
    "variableId": "preset_14_label",
  },
  {
    "name": "Preset 16 name",
    "variableId": "preset_15_label",
  },
  {
    "name": "Preset 17 name",
    "variableId": "preset_16_label",
  },
  {
    "name": "Preset 18 name",
    "variableId": "preset_17_label",
  },
  {
    "name": "Preset 19 name",
    "variableId": "preset_18_label",
  },
  {
    "name": "Preset 20 name",
    "variableId": "preset_19_label",
  },
  {
    "name": "Preset 21 name",
    "variableId": "preset_20_label",
  },
  {
    "name": "Preset 22 name",
    "variableId": "preset_21_label",
  },
  {
    "name": "Preset 23 name",
    "variableId": "preset_22_label",
  },
  {
    "name": "Preset 24 name",
    "variableId": "preset_23_label",
  },
  {
    "name": "Preset 25 name",
    "variableId": "preset_24_label",
  },
  {
    "name": "Preset 26 name",
    "variableId": "preset_25_label",
  },
  {
    "name": "Preset 27 name",
    "variableId": "preset_26_label",
  },
  {
    "name": "Preset 28 name",
    "variableId": "preset_27_label",
  },
  {
    "name": "Preset 29 name",
    "variableId": "preset_28_label",
  },
  {
    "name": "Preset 30 name",
    "variableId": "preset_29_label",
  },
  {
    "name": "Preset 31 name",
    "variableId": "preset_30_label",
  },
  {
    "name": "Preset 32 name",
    "variableId": "preset_31_label",
  },
  {
    "name": "Preset 33 name",
    "variableId": "preset_32_label",
  },
  {
    "name": "Preset 34 name",
    "variableId": "preset_33_label",
  },
  {
    "name": "Preset 35 name",
    "variableId": "preset_34_label",
  },
  {
    "name": "Preset 36 name",
    "variableId": "preset_35_label",
  },
  {
    "name": "Preset 37 name",
    "variableId": "preset_36_label",
  },
  {
    "name": "Preset 38 name",
    "variableId": "preset_37_label",
  },
  {
    "name": "Preset 40 name",
    "variableId": "preset_39_label",
  },
  {
    "name": "Preset 43 name",
    "variableId": "preset_42_label",
  },
  {
    "name": "Preset 44 name",
    "variableId": "preset_43_label",
  },
  {
    "name": "Preset 41 state",
    "variableId": "preset_40_state",
  },
  {
    "name": "Preset 42 state",
    "variableId": "preset_41_state",
  },
  {
    "name": "Preset 3 state",
    "variableId": "preset_2_state",
  },
  {
    "name": "Preset 4 state",
    "variableId": "preset_3_state",
  },
  {
    "name": "Preset 5 state",
    "variableId": "preset_4_state",
  },
  {
    "name": "Preset 6 state",
    "variableId": "preset_5_state",
  },
  {
    "name": "Preset 7 state",
    "variableId": "preset_6_state",
  },
  {
    "name": "Preset 8 state",
    "variableId": "preset_7_state",
  },
  {
    "name": "Preset 9 state",
    "variableId": "preset_8_state",
  },
  {
    "name": "Preset 10 state",
    "variableId": "preset_9_state",
  },
  {
    "name": "Preset 11 state",
    "variableId": "preset_10_state",
  },
  {
    "name": "Preset 12 state",
    "variableId": "preset_11_state",
  },
  {
    "name": "Preset 13 state",
    "variableId": "preset_12_state",
  },
  {
    "name": "Preset 14 state",
    "variableId": "preset_13_state",
  },
  {
    "name": "Preset 15 state",
    "variableId": "preset_14_state",
  },
  {
    "name": "Preset 16 state",
    "variableId": "preset_15_state",
  },
  {
    "name": "Preset 17 state",
    "variableId": "preset_16_state",
  },
  {
    "name": "Preset 18 state",
    "variableId": "preset_17_state",
  },
  {
    "name": "Preset 19 state",
    "variableId": "preset_18_state",
  },
  {
    "name": "Preset 20 state",
    "variableId": "preset_19_state",
  },
  {
    "name": "Preset 21 state",
    "variableId": "preset_20_state",
  },
  {
    "name": "Preset 22 state",
    "variableId": "preset_21_state",
  },
  {
    "name": "Preset 23 state",
    "variableId": "preset_22_state",
  },
  {
    "name": "Preset 24 state",
    "variableId": "preset_23_state",
  },
  {
    "name": "Preset 25 state",
    "variableId": "preset_24_state",
  },
  {
    "name": "Preset 26 state",
    "variableId": "preset_25_state",
  },
  {
    "name": "Preset 27 state",
    "variableId": "preset_26_state",
  },
  {
    "name": "Preset 28 state",
    "variableId": "preset_27_state",
  },
  {
    "name": "Preset 29 state",
    "variableId": "preset_28_state",
  },
  {
    "name": "Preset 30 state",
    "variableId": "preset_29_state",
  },
  {
    "name": "Preset 31 state",
    "variableId": "preset_30_state",
  },
  {
    "name": "Preset 32 state",
    "variableId": "preset_31_state",
  },
  {
    "name": "Preset 33 state",
    "variableId": "preset_32_state",
  },
  {
    "name": "Preset 34 state",
    "variableId": "preset_33_state",
  },
  {
    "name": "Preset 35 state",
    "variableId": "preset_34_state",
  },
  {
    "name": "Preset 36 state",
    "variableId": "preset_35_state",
  },
  {
    "name": "Preset 37 state",
    "variableId": "preset_36_state",
  },
  {
    "name": "Preset 38 state",
    "variableId": "preset_37_state",
  },
  {
    "name": "Preset 40 state",
    "variableId": "preset_39_state",
  },
  {
    "name": "Preset 43 state",
    "variableId": "preset_42_state",
  },
  {
    "name": "Preset 44 state",
    "variableId": "preset_43_state",
  },
  {
    "name": "Sequence 1 name",
    "variableId": "sequence_0_label",
  },
  {
    "name": "Sequence 2 name",
    "variableId": "sequence_1_label",
  },
  {
    "name": "Sequence 1 state",
    "variableId": "sequence_0_state",
  },
  {
    "name": "Sequence 2 state",
    "variableId": "sequence_1_state",
  },
  {
    "name": "Wall 1 name",
    "variableId": "wall_0_label",
  },
  {
    "name": "Wall 2 name",
    "variableId": "wall_1_label",
  },
  {
    "name": "Wall 1 state",
    "variableId": "wall_0_state",
  },
  {
    "name": "Wall 2 state",
    "variableId": "wall_1_state",
  },
  {
    "name": "Override 1 name",
    "variableId": "override_0_label",
  },
  {
    "name": "Override 1 state",
    "variableId": "override_0_state",
  },
  {
    "name": "Channel 1 name",
    "variableId": "channel_0_label",
  },
  {
    "name": "Channel 2 name",
    "variableId": "channel_1_label",
  },
  {
    "name": "Channel 3 name",
    "variableId": "channel_2_label",
  },
  {
    "name": "Channel 4 name",
    "variableId": "channel_3_label",
  },
  {
    "name": "Channel 5 name",
    "variableId": "channel_4_label",
  },
  {
    "name": "Channel 6 name",
    "variableId": "channel_5_label",
  },
  {
    "name": "Channel 7 name",
    "variableId": "channel_6_label",
  },
  {
    "name": "Channel 8 name",
    "variableId": "channel_7_label",
  },
  {
    "name": "Channel 9 name",
    "variableId": "channel_8_label",
  },
  {
    "name": "Channel 10 name",
    "variableId": "channel_9_label",
  },
  {
    "name": "Channel 11 name",
    "variableId": "channel_10_label",
  },
  {
    "name": "Channel 195 name",
    "variableId": "channel_194_label",
  },
  {
    "name": "Channel 1069 name",
    "variableId": "channel_1068_label",
  },
  {
    "name": "Channel 1070 name",
    "variableId": "channel_1069_label",
  },
  {
    "name": "Channel 1071 name",
    "variableId": "channel_1070_label",
  },
  {
    "name": "Channel 1072 name",
    "variableId": "channel_1071_label",
  },
  {
    "name": "Channel 1073 name",
    "variableId": "channel_1072_label",
  },
  {
    "name": "Channel 1074 name",
    "variableId": "channel_1073_label",
  },
  {
    "name": "Channel 1075 name",
    "variableId": "channel_1074_label",
  },
  {
    "name": "Channel 1076 name",
    "variableId": "channel_1075_label",
  },
  {
    "name": "Channel 1077 name",
    "variableId": "channel_1076_label",
  },
  {
    "name": "Channel 1078 name",
    "variableId": "channel_1077_label",
  },
  {
    "name": "Channel 1079 name",
    "variableId": "channel_1078_label",
  },
  {
    "name": "Channel 1080 name",
    "variableId": "channel_1079_label",
  },
  {
    "name": "Channel 1081 name",
    "variableId": "channel_1080_label",
  },
  {
    "name": "Channel 1082 name",
    "variableId": "channel_1081_label",
  },
  {
    "name": "Channel 1083 name",
    "variableId": "channel_1082_label",
  },
  {
    "name": "Channel 1084 name",
    "variableId": "channel_1083_label",
  },
  {
    "name": "Channel 1085 name",
    "variableId": "channel_1084_label",
  },
  {
    "name": "Channel 1086 name",
    "variableId": "channel_1085_label",
  },
  {
    "name": "Channel 1087 name",
    "variableId": "channel_1086_label",
  },
  {
    "name": "Channel 1088 name",
    "variableId": "channel_1087_label",
  },
  {
    "name": "Channel 1089 name",
    "variableId": "channel_1088_label",
  },
  {
    "name": "Channel 1090 name",
    "variableId": "channel_1089_label",
  },
  {
    "name": "Channel 1526 name",
    "variableId": "channel_1525_label",
  },
  {
    "name": "Channel 1527 name",
    "variableId": "channel_1526_label",
  },
  {
    "name": "Channel 1528 name",
    "variableId": "channel_1527_label",
  },
  {
    "name": "Channel 1 level",
    "variableId": "channel_0_level",
  },
  {
    "name": "Channel 2 level",
    "variableId": "channel_1_level",
  },
  {
    "name": "Channel 3 level",
    "variableId": "channel_2_level",
  },
  {
    "name": "Channel 4 level",
    "variableId": "channel_3_level",
  },
  {
    "name": "Channel 5 level",
    "variableId": "channel_4_level",
  },
  {
    "name": "Channel 6 level",
    "variableId": "channel_5_level",
  },
  {
    "name": "Channel 7 level",
    "variableId": "channel_6_level",
  },
  {
    "name": "Channel 8 level",
    "variableId": "channel_7_level",
  },
  {
    "name": "Channel 9 level",
    "variableId": "channel_8_level",
  },
  {
    "name": "Channel 10 level",
    "variableId": "channel_9_level",
  },
  {
    "name": "Channel 11 level",
    "variableId": "channel_10_level",
  },
  {
    "name": "Channel 195 level",
    "variableId": "channel_194_level",
  },
  {
    "name": "Channel 1069 level",
    "variableId": "channel_1068_level",
  },
  {
    "name": "Channel 1070 level",
    "variableId": "channel_1069_level",
  },
  {
    "name": "Channel 1071 level",
    "variableId": "channel_1070_level",
  },
  {
    "name": "Channel 1072 level",
    "variableId": "channel_1071_level",
  },
  {
    "name": "Channel 1073 level",
    "variableId": "channel_1072_level",
  },
  {
    "name": "Channel 1074 level",
    "variableId": "channel_1073_level",
  },
  {
    "name": "Channel 1075 level",
    "variableId": "channel_1074_level",
  },
  {
    "name": "Channel 1076 level",
    "variableId": "channel_1075_level",
  },
  {
    "name": "Channel 1077 level",
    "variableId": "channel_1076_level",
  },
  {
    "name": "Channel 1078 level",
    "variableId": "channel_1077_level",
  },
  {
    "name": "Channel 1079 level",
    "variableId": "channel_1078_level",
  },
  {
    "name": "Channel 1080 level",
    "variableId": "channel_1079_level",
  },
  {
    "name": "Channel 1081 level",
    "variableId": "channel_1080_level",
  },
  {
    "name": "Channel 1082 level",
    "variableId": "channel_1081_level",
  },
  {
    "name": "Channel 1083 level",
    "variableId": "channel_1082_level",
  },
  {
    "name": "Channel 1084 level",
    "variableId": "channel_1083_level",
  },
  {
    "name": "Channel 1085 level",
    "variableId": "channel_1084_level",
  },
  {
    "name": "Channel 1086 level",
    "variableId": "channel_1085_level",
  },
  {
    "name": "Channel 1087 level",
    "variableId": "channel_1086_level",
  },
  {
    "name": "Channel 1088 level",
    "variableId": "channel_1087_level",
  },
  {
    "name": "Channel 1089 level",
    "variableId": "channel_1088_level",
  },
  {
    "name": "Channel 1090 level",
    "variableId": "channel_1089_level",
  },
  {
    "name": "Channel 1526 level",
    "variableId": "channel_1525_level",
  },
  {
    "name": "Channel 1527 level",
    "variableId": "channel_1526_level",
  },
  {
    "name": "Channel 1528 level",
    "variableId": "channel_1527_level",
  },
    ]);

    expect(self.setVariableValues).toHaveBeenCalledWith({
        "processor_name": "Processor 1",
        "processor_number": 1,
        "current_time": "06/09/2023 10:00am (UTC-5)",
        "uptime": 995721,
        "rack_status": "ERn",
      station_count: 5,
      "channel_0_label": "Zone 1",
      "channel_0_level": 47,
      "channel_1068_label": "Zone 45",
      "channel_1068_level": 0,
      "channel_1069_label": "Zone 46",
      "channel_1069_level": 0,
      "channel_1070_label": "Zone 47",
      "channel_1070_level": 0,
      "channel_1071_label": "Zone 48",
      "channel_1071_level": 0,
      "channel_1072_label": "Zone 49",
      "channel_1072_level": 0,
      "channel_1073_label": "Zone 50",
      "channel_1073_level": 0,
      "channel_1074_label": "Zone 51",
      "channel_1074_level": 0,
      "channel_1075_label": "Zone 52",
      "channel_1075_level": 0,
      "channel_1076_label": "Zone 53",
      "channel_1076_level": 0,
      "channel_1077_label": "Zone 54",
      "channel_1077_level": 0,
      "channel_1078_label": "Zone 55",
      "channel_1078_level": 0,
      "channel_1079_label": "Zone 56",
      "channel_1079_level": 0,
      "channel_1080_label": "Zone 57",
      "channel_1080_level": 0,
      "channel_1081_label": "Zone 58",
      "channel_1081_level": 0,
      "channel_1082_label": "Zone 59",
      "channel_1082_level": 0,
      "channel_1083_label": "Zone 60",
      "channel_1083_level": 0,
      "channel_1084_label": "Zone 61",
      "channel_1084_level": 0,
      "channel_1085_label": "Zone 62",
      "channel_1085_level": 0,
      "channel_1086_label": "Zone 63",
      "channel_1086_level": 0,
      "channel_1087_label": "Zone 64",
      "channel_1087_level": 0,
      "channel_1088_label": "Zone 65",
      "channel_1088_level": 0,
      "channel_1089_label": "Zone 66",
      "channel_1089_level": 0,
      "channel_10_label": "Zone 11",
      "channel_10_level": 47,
      "channel_1525_label": "Zone 502",
      "channel_1525_level": 0,
      "channel_1526_label": "Zone 503",
      "channel_1526_level": 0,
      "channel_1527_label": "Zone 504",
      "channel_1527_level": 0,
      "channel_194_label": "Zone 195",
      "channel_194_level": 0,
      "channel_1_label": "Zone 2",
      "channel_1_level": 47,
      "channel_2_label": "Zone 3",
      "channel_2_level": 47,
      "channel_3_label": "Zone 4",
      "channel_3_level": 47,
      "channel_4_label": "Zone 5",
      "channel_4_level": 47,
      "channel_5_label": "Zone 6",
      "channel_5_level": 47,
      "channel_6_label": "Zone 7",
      "channel_6_level": 47,
      "channel_7_label": "Zone 8",
      "channel_7_level": 47,
      "channel_8_label": "Zone 9",
      "channel_8_level": 47,
      "channel_9_label": "Zone 10",
      "channel_9_level": 47,
      "macro_0_label": "OVERRIDE",
      "macro_0_state": 0,
      "macro_10_label": "PRESET 12",
      "macro_10_state": 0,
      "macro_11_label": "PRESET 14",
      "macro_11_state": 0,
      "macro_12_label": "PRESET 15",
      "macro_12_state": 0,
      "macro_13_label": "PRESET 16",
      "macro_13_state": 0,
      "macro_14_label": "PRESET 17",
      "macro_14_state": 0,
      "macro_15_label": "PRESET 18",
      "macro_15_state": 0,
      "macro_16_label": "PRESET 19",
      "macro_16_state": 0,
      "macro_17_label": "PRESET 20",
      "macro_17_state": 0,
      "macro_18_label": "PRESET 21",
      "macro_18_state": 0,
      "macro_19_label": "PRESET 22",
      "macro_19_state": 0,
      "macro_1_label": "HOUSE 100",
      "macro_1_state": 0,
      "macro_20_label": "PRESET 23",
      "macro_20_state": 0,
      "macro_21_label": "PRESET 24",
      "macro_21_state": 0,
      "macro_22_label": "PRESET 25",
      "macro_22_state": 0,
      "macro_23_label": "PRESET 26",
      "macro_23_state": 0,
      "macro_24_label": "PRESET 27",
      "macro_24_state": 0,
      "macro_25_label": "PRESET 28",
      "macro_25_state": 0,
      "macro_26_label": "VARALITE DOUSE",
      "macro_26_state": 0,
      "macro_29_label": "DIMMER RELAY",
      "macro_29_state": 0,
      "macro_2_label": "HOUSE 75",
      "macro_2_state": 0,
      "macro_30_label": "primary delay",
      "macro_30_state": 0,
      "macro_33_label": "SCONCE RELAY",
      "macro_33_state": 0,
      "macro_3_label": "HOUSE 50",
      "macro_3_state": 1,
      "macro_4_label": "HOUSE 25",
      "macro_4_state": 0,
      "macro_5_label": "HOUSE OFF",
      "macro_5_state": 0,
      "macro_6_label": "STATION LOCKOUT",
      "macro_6_state": 1,
      "macro_7_label": "GLOBAL OFF",
      "macro_7_state": 0,
      "macro_8_label": "PRESET11",
      "macro_8_state": 0,
      "macro_9_label": "PRESET 13",
      "macro_9_state": 0,
      "override_0_label": "Override 1",
      "override_0_state": false,
      "preset_10_label": "Preset 7",
      "preset_10_state": "Deactivated",
      "preset_11_label": "Preset 8",
      "preset_11_state": "Deactivated",
      "preset_12_label": "Preset 9",
      "preset_12_state": "Deactivated",
      "preset_13_label": "Preset 10",
      "preset_13_state": "Deactivated",
      "preset_14_label": "Preset 11",
      "preset_14_state": "Deactivated",
      "preset_15_label": "Preset 12",
      "preset_15_state": "Deactivated",
      "preset_16_label": "Preset 13",
      "preset_16_state": "Altered",
      "preset_17_label": "Preset 14",
      "preset_17_state": "Deactivated",
      "preset_18_label": "Preset 15",
      "preset_18_state": "Deactivated",
      "preset_19_label": "Preset 16",
      "preset_19_state": "Deactivated",
      "preset_20_label": "Preset 17",
      "preset_20_state": "Altered",
      "preset_21_label": "Preset 18",
      "preset_21_state": "Deactivated",
      "preset_22_label": "Preset 19",
      "preset_22_state": "Altered",
      "preset_23_label": "Preset 20",
      "preset_23_state": "Deactivated",
      "preset_24_label": "Preset 21",
      "preset_24_state": "Deactivated",
      "preset_25_label": "Preset 22",
      "preset_25_state": "Deactivated",
      "preset_26_label": "Preset 23",
      "preset_26_state": "Deactivated",
      "preset_27_label": "Preset 24",
      "preset_27_state": "Deactivated",
      "preset_28_label": "Preset 25",
      "preset_28_state": "Deactivated",
      "preset_29_label": "Preset 26",
      "preset_29_state": "Deactivated",
      "preset_2_label": "Preset 3",
      "preset_2_state": "Deactivated",
      "preset_30_label": "Preset 27",
      "preset_30_state": "Deactivated",
      "preset_31_label": "Preset 28",
      "preset_31_state": "Deactivated",
      "preset_32_label": "Preset 29",
      "preset_32_state": "Deactivated",
      "preset_33_label": "Preset 30",
      "preset_33_state": "Deactivated",
      "preset_34_label": "Preset 31",
      "preset_34_state": "Deactivated",
      "preset_35_label": "Preset 32",
      "preset_35_state": "Deactivated",
      "preset_36_label": "Preset 33",
      "preset_36_state": "Deactivated",
      "preset_37_label": "Preset 34",
      "preset_37_state": "Deactivated",
      "preset_39_label": "HOUSE OFF",
      "preset_39_state": "Deactivated",
      "preset_3_label": "Preset 4",
      "preset_3_state": "Deactivated",
      "preset_40_label": "preset100",
      "preset_40_state": "Deactivated",
      "preset_41_label": "primary off",
      "preset_41_state": "Altered",
      "preset_42_label": "houseth relays",
      "preset_42_state": "Deactivated",
      "preset_43_label": "entrance100",
      "preset_43_state": "Deactivated",
      "preset_4_label": "HOUSE FULL",
      "preset_4_state": "Deactivated",
      "preset_5_label": "HOUSE 75%",
      "preset_5_state": "Deactivated",
      "preset_6_label": "HOUSE 50%",
      "preset_6_state": "Activated",
      "preset_7_label": "HOUSE 25%",
      "preset_7_state": "Deactivated",
      "preset_8_label": "Preset 5",
      "preset_8_state": "Deactivated",
      "preset_9_label": "Preset 6",
      "preset_9_state": "Deactivated",
      "sequence_0_label": "Sequence 1",
      "sequence_0_state": 1,
      "sequence_1_label": "Sequence 2",
      "sequence_1_state": 0,
      "wall_0_label": "Wall 1",
      "wall_0_state": 1,
      "wall_1_label": "Wall 2",
      "wall_1_state": 0,
    });
  });
});

describe('buildVariables', () => {
    test('should build variables for an array of info', () => {
      const infoArray = [{
        "id": 0,
        "name": "Zone 1",
        "space": 1,
        "level": 47
    }, {
        "id": 1,
        "name": "Zone 2",
        "space": 1,
        "level": 47
    }, {
        "id": 2,
        "name": "Zone 3",
        "space": 1,
        "level": 47
    }];
      const featureArray = 'feature';
      const resultArray = buildVariables(infoArray, featureArray);
      const expectedArray = [
        { name: 'Feature 1 name', variableId: 'feature_0_label' },
        { name: 'Feature 2 name', variableId: 'feature_1_label' },
        { name: 'Feature 3 name', variableId: 'feature_2_label' }
      ];
      expect(resultArray).toEqual(expectedArray);
    });
  
    test('should build variables for an of info', () => {
      const infoObject = {
        "0": "Global",
        "1": "Primary Space 1",
        "2": "Primary Space 2",
        "3": "Space 1"
    }
      const featureObject = 'feature';
      const resultObject = buildVariables(infoObject, featureObject);
      const expectedObject = [
        { name: 'Feature 1 name', variableId: 'feature_0_label' },
        { name: 'Feature 2 name', variableId: 'feature_1_label' },
        { name: 'Feature 3 name', variableId: 'feature_2_label' },
        { name: 'Feature 4 name', variableId: 'feature_3_label' }
      ];
      expect(resultObject).toEqual(expectedObject);
    });
  
    test('should build variables using the count parameter', () => {
      const featureCount = 'feature';
      const resultCount = buildVariables(null, featureCount, '', '_desc', 3);
      const expectedCount = [
        { name: 'Feature 1', variableId: 'feature_0_desc' },
        { name: 'Feature 2', variableId: 'feature_1_desc' },
        { name: 'Feature 3', variableId: 'feature_2_desc' }
      ];
      expect(resultCount).toEqual(expectedCount);
    });
  });

// Test suite
describe('buildVariablesValues', () => {
  // Test case 1
  test('should build variables and values for an array input', () => {
    const info = [
        {
            "id": 0,
            "name": "Zone 1",
            "space": 1,
            "level": 47
        }, {
            "id": 1,
            "name": "Zone 2",
            "space": 1,
            "level": 47
        }, {
            "id": 2,
            "name": "Zone 3",
            "space": 1,
            "level": 47
        }
    ];
    const variables = {};
    const feature = 'feature';
    const text = 'name';
    const ending = '_label';

    const result = buildVariablesValues(info, variables, feature, text, ending);

    expect(result).toEqual({
      feature_0_label: 'Zone 1',
      feature_1_label: 'Zone 2',
      feature_2_label: 'Zone 3'
    });
  });

  // Test case 2
  test('should build variables and values for an object input', () => {
    const info = {
        "0": "Global",
        "1": "Primary Space 1",
        "2": "Primary Space 2",
        "3": "Space 1"
    };
    const variables = {};
    const feature = 'feature';
    const text = 'name';
    const ending = '_label';

    const result = buildVariablesValues(info, variables, feature, text, ending);

    expect(result).toEqual({
      feature_0_label: 'Global',
      feature_1_label: 'Primary Space 1',
      feature_2_label: 'Primary Space 2',
      feature_3_label: 'Space 1'
    });
  });

  // Additional test cases...
});
