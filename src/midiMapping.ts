export class MidiMapping {
    private constructor() { }

    public static mapping: { [statusGroupKey: number]: { [midiNo: number]: string } } = {
        0xB0: {
            0x07: "CrossfaderMsb",
            0x27: "CrossfaderLsb",
            0x44: "Headphone",
            0x12: "HeadphoneMix",
            0x03: "TraxEncoder",
            0x4D: "TraxEncoder",
            0x08: "0VolumeMsb",
            0x28: "0VolumeLsb",
            0x5B: "0FilterMsb",
            0x7B: "0FilterLsb",
            0x4B: "0VuLevel",
            0x09: "0EqLowMsb",
            0x29: "0EqLowLsb",
            0x0A: "0EqMidMsb",
            0x2A: "0EqMidLsb",
            0x0B: "0EqHighMsb",
            0x2B: "0EqHighLsb",
            0x0C: "0GainMsb",
            0x2C: "0GainLsb",
            0x0D: "1VolumeMsb",
            0x2D: "1VolumeLsb",
            0x5C: "1FilterMsb",
            0x7C: "1FilterLsb",
            0x4C: "1VuLevel",
            0x0E: "1EqLowMsb",
            0x2E: "1EqLowLsb",
            0x0F: "1EqMidMsb",
            0x2F: "1EqMidLsb",
            0x10: "1EqHighMsb",
            0x30: "1EqHighLsb",
            0x11: "1GainMsb",
            0x31: "1GainLsb"
        },
        0x81: {
            0x07: "0TraxButton",
            0x21: "0Play",
            0x20: "0Cue",
            0x1F: "0Sync",
            0x0D: "0Shift",
            0x08: "0Back",
            0x1B: "0Loop",
            0x5D: "0JogTouchButton",
            0x51: "0TempoLed0",
            0x10: "0PitchBendMinus",
            0x11: "0PitchBendPlus",
            0x0E: "0ParamAdjustLeft",
            0x0F: "0ParamAdjustRight",
            0x47: "0Hotcue0",
            0x48: "0Hotcue1",
            0x49: "0Hotcue2",
            0x4A: "0Hotcue3",
            0x4B: "0Hotcue4",
            0x4C: "0Hotcue5",
            0x4D: "0Hotcue6",
            0x4E: "0Hotcue7"
        },
        0x80: {
            0x35: "0Pfl",
            0x36: "1Pfl"
        },
        0x91: {
            0x07: "0TraxButton",
            0x21: "0Play",
            0x20: "0Cue",
            0x1F: "0Sync",
            0x0D: "0Shift",
            0x08: "0Back",
            0x1B: "0Loop",
            0x5D: "0JogTouchButton",
            0x51: "0TempoLed0",
            0x10: "0PitchBendMinus",
            0x11: "0PitchBendPlus",
            0x0E: "0ParamAdjustLeft",
            0x0F: "0ParamAdjustRight",
            0x47: "0Hotcue0",
            0x48: "0Hotcue1",
            0x49: "0Hotcue2",
            0x4A: "0Hotcue3",
            0x4B: "0Hotcue4",
            0x4C: "0Hotcue5",
            0x4D: "0Hotcue6",
            0x4E: "0Hotcue7"
        },
        0x90: {
            0x35: "0Pfl",
            0x36: "1Pfl"
        },
        0xB1: {
            0x01: "0TempoMsb",
            0x21: "0TempoLsb",
            0x20: "0JogEncoderMsb",
            0x00: "0JogEncoderLsb"
        },
        0x82: {
            0x07: "1TraxButton",
            0x21: "1Play",
            0x20: "1Cue",
            0x1F: "1Sync",
            0x0D: "1Shift",
            0x08: "1Back",
            0x1B: "1Loop",
            0x5D: "1JogTouchButton",
            0x51: "1TempoLed0",
            0x10: "1PitchBendMinus",
            0x11: "1PitchBendPlus",
            0x0E: "1ParamAdjustLeft",
            0x0F: "1ParamAdjustRight",
            0x47: "1Hotcue0",
            0x48: "1Hotcue1",
            0x49: "1Hotcue2",
            0x4A: "1Hotcue3",
            0x4B: "1Hotcue4",
            0x4C: "1Hotcue5",
            0x4D: "1Hotcue6",
            0x4E: "1Hotcue7"
        },
        0x92: {
            0x07: "1TraxButton",
            0x21: "1Play",
            0x20: "1Cue",
            0x1F: "1Sync",
            0x0D: "1Shift",
            0x08: "1Back",
            0x1B: "1Loop",
            0x5D: "1JogTouchButton",
            0x51: "1TempoLed0",
            0x10: "1PitchBendMinus",
            0x11: "1PitchBendPlus",
            0x0E: "1ParamAdjustLeft",
            0x0F: "1ParamAdjustRight",
            0x47: "1Hotcue0",
            0x48: "1Hotcue1",
            0x49: "1Hotcue2",
            0x4A: "1Hotcue3",
            0x4B: "1Hotcue4",
            0x4C: "1Hotcue5",
            0x4D: "1Hotcue6",
            0x4E: "1Hotcue7"
        },
        0xB2: {
            0x01: "1TempoMsb",
            0x21: "1TempoLsb",
            0x20: "1JogEncoderMsb",
            0x00: "1JogEncoderLsb"
        }
    };

    private static reversedMapping: { [a: string]: [number, number] } = {};

    public static initReversedMapping() {
        for (const statusGroupKey in MidiMapping.mapping) {
            const statusGroup = MidiMapping.mapping[statusGroupKey];
            for (const midiNo in statusGroup) {
                const controlName = statusGroup[midiNo];
                MidiMapping.reversedMapping[controlName] = [statusGroupKey as unknown as number, midiNo as unknown as number]; // idk
            }
        }
    }

    public static getMidiForControl(controlName: string): [number, number] {
        return MidiMapping.reversedMapping[controlName];
    }
}
