import { MidiControl, MidiControlCallback } from "@controls/midiControl";

export class FineMidiControl extends MidiControl {

    readonly nameMsb: string;
    readonly nameLsb: string;

    private lastValueMsb: number = 0;
    private lastValueLsb: number = 0;

    constructor(readonly name: string, callback: MidiControlCallback) {
        super(name, true, callback); // scaled parameter doesn't matter here, because this overrides the offerValue function anyway

        this.nameMsb = name + "Msb";
        this.nameLsb = name + "Lsb";
    }

    public offerValue(name: string, value: number) {
        let newValue: number;

        if (name === this.nameMsb) {
            // tslint:disable-next-line: no-bitwise
            newValue = ((value << 7) + this.lastValueLsb) / 0x3FFF;
            this.lastValueMsb = value;
        } else if (name === this.nameLsb) {
            // tslint:disable-next-line: no-bitwise
            newValue = ((this.lastValueMsb << 7) + value) / 0x3FFF;
            this.lastValueLsb = value;
        } else {
            return;
        }

        if (this.callback.onNewValue) this.callback.onNewValue(newValue);

        if (newValue === this.lastValue) return;

        if (this.callback.onValueChanged) this.callback.onValueChanged(newValue);
        this.lastValue = newValue;
    }
}
