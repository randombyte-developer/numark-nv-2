export class MidiMapping {
    private constructor() { }

    public static mapping: Record<number, Record<number, string>> = {
        0xB4: {
            0x53: "Crossfader",
            0x51: "Headphone",
            0x52: "HeadphoneMix",
            0x18: "TraxEncoder",
            0x19: "TraxEncoderShifted"
        },
        0x94: {
            0x20: "TraxButton",
            0x40: "TraxButtonShifted"
        },
        0x90: {
            0x2F: "0Play",
            0x0F: "0PlayShifted",
            0x2E: "0Cue",
            0x0E: "0CueShifted",
            0x2C: "0Sync",
            0x0C: "0SyncShifted",
            0x28: "0Shift",
            0x32: "0Load",
            0x12: "0LoadShifted",
            0x23: "0Pfl",
            0x03: "0PflShifted",
            0x30: "0FxSelectButton",
            0x10: "0FxSelectButtonShifted",
            0x31: "0LoopButton",
            0x11: "0LoopButtonShifted",
            0x20: "0FxOn",
            0x00: "0FxOnShifted",
            0x21: "0BeatMash",
            0x01: "0BeatMashShifted",
            0x22: "0AutoLoop",
            0x02: "0AutoLoopShifted",
            0x3F: "0JogTouchButton",
            0x5F: "0JogTouchButtonShifted",
            0x26: "0PitchBendMinus",
            0x06: "0PitchBendMinusShifted",
            0x27: "0PitchBendPlus",
            0x07: "0PitchBendPlusShifted",
            0x29: "0Hotcue0",
            0x09: "0Hotcue0Shifted",
            0x2A: "0Hotcue1",
            0x0A: "0Hotcue1Shifted",
            0x2B: "0Hotcue2",
            0x0B: "0Hotcue2Shifted"
        },
        0xB0: {
            0x37: "0Volume",
            0x10: "0FxSelectEncoder",
            0x11: "0FxSelectEncoderShifted",
            0x30: "0Param2",
            0x38: "0Param2Shifted",
            0x31: "0Filter",
            0x39: "0FilterShifted",
            0x12: "0LoopEncoder",
            0x13: "0LoopEncoderShifted",
            0x36: "0TempoMsb",
            0x76: "0TempoLsb",
            0x3E: "0TempoMsbShifted",
            0x7E: "0TempoLsbShifted",
            0x20: "0JogEncoder",
            0x21: "0JogEncoderShifted",
            0x33: "0EqHigh",
            0x3B: "0EqHighShifted",
            0x34: "0EqMid",
            0x3C: "0EqMidShifted",
            0x35: "0EqLow",
            0x3D: "0EqLowShifted",
            0x32: "0Gain",
            0x3A: "0GainShifted"
        },
        0x91: {
            0x2F: "1Play",
            0x0F: "1PlayShifted",
            0x2E: "1Cue",
            0x0E: "1CueShifted",
            0x2C: "1Sync",
            0x0C: "1SyncShifted",
            0x28: "1Shift",
            0x32: "1Load",
            0x12: "1LoadShifted",
            0x23: "1Pfl",
            0x03: "1PflShifted",
            0x30: "1FxSelectButton",
            0x10: "1FxSelectButtonShifted",
            0x31: "1LoopButton",
            0x11: "1LoopButtonShifted",
            0x20: "1FxOn",
            0x00: "1FxOnShifted",
            0x22: "1BeatMash",
            0x02: "1BeatMashShifted",
            0x21: "1AutoLoop",
            0x01: "1AutoLoopShifted",
            0x3F: "1JogTouchButton",
            0x5F: "1JogTouchButtonShifted",
            0x26: "1PitchBendMinus",
            0x06: "1PitchBendMinusShifted",
            0x27: "1PitchBendPlus",
            0x07: "1PitchBendPlusShifted",
            0x29: "1Hotcue0",
            0x09: "1Hotcue0Shifted",
            0x2A: "1Hotcue1",
            0x0A: "1Hotcue1Shifted",
            0x2B: "1Hotcue2",
            0x0B: "1Hotcue2Shifted"
        },
        0xB1: {
            0x47: "1Volume",
            0x14: "1FxSelectEncoder",
            0x15: "1FxSelectEncoderShifted",
            0x41: "1Param2",
            0x49: "1Param2Shifted",
            0x40: "1Filter",
            0x48: "1FilterShifted",
            0x16: "1LoopEncoder",
            0x17: "1LoopEncoderShifted",
            0x46: "1TempoMsb",
            0x76: "1TempoLsb",
            0x4E: "1TempoMsbShifted",
            0x7E: "1TempoLsbShifted",
            0x22: "1JogEncoder",
            0x23: "1JogEncoderShifted",
            0x43: "1EqHigh",
            0x4B: "1EqHighShifted",
            0x44: "1EqMid",
            0x4C: "1EqMidShifted",
            0x45: "1EqLow",
            0x4D: "1EqLowShifted",
            0x42: "1Gain",
            0x4A: "1GainShifted"
        }
    };

    private static reversedMapping: Record<string, [number, number]> = {};

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
