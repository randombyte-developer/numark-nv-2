import { MidiControl, MidiControlCallback } from "./midiControl";

export class Button extends MidiControl {
    constructor(name: string, callback: ButtonCallback) {
        super(name, false, {
            onNewValue: (value) => {
                if (callback.onNewValue) callback.onNewValue(value);
            },
            onValueChanged: (value) => {
                if (value > 0) {
                    if (callback.onPressed) callback.onPressed();
                } else {
                    if (callback.onReleased) callback.onReleased();
                }
                if (callback.onValueChanged) callback.onValueChanged(value);
            }
        });
    }
}

export interface ButtonCallback extends MidiControlCallback {
    onPressed?(): void;
    onReleased?(): void;
}
