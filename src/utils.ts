import { MidiMapping } from "./midiMapping";

export function log(msg: any) {
    engine.log(`Numark NV II Log: ${msg}`);
}

export function clamp(value: number, min: number, max: number): number {
    return value <= min ? min : value >= max ? max : value;
}

export function toggleControl(channel: string, key: string) {
    engine.setValue(channel, key, !engine.getValue(channel, key));
}

export function activate(channel: string, key: string) {
    engine.setValue(channel, key, 1);
}

export function makeLedConnection(channel: string, key: string, midiLedStatus: number, midiLedNo: number, ledValue: number = 0x7F): Connection {
    return engine.makeConnection(channel, key, value => {
        midi.sendShortMsg(midiLedStatus, midiLedNo, value * ledValue);
    });
}

export function setLed(controlName: string, value: number) {
    const [status, midiNo] = MidiMapping.getMidiForControl(controlName);
    midi.sendShortMsg(status, midiNo, value);
}
