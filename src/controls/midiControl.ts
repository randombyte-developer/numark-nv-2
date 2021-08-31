export class MidiControl {

    public lastValue: number = 0;

    constructor(readonly name: string, readonly scaled: boolean, protected readonly callback: MidiControlCallback) {}

    public offerValue(name: string, value: number) {
        if (name != this.name) return;

        const scaledValue = this.scaled ? value / 0x7F : value;

        if (this.callback.onNewValue) this.callback.onNewValue(scaledValue);

        if (this.lastValue === scaledValue) return;

        if (this.callback.onValueChanged) this.callback.onValueChanged(scaledValue);
        this.lastValue = scaledValue;
    }
}

export interface MidiControlCallback {
    onNewValue?(value: number): void;
    onValueChanged?(value: number): void;
}
