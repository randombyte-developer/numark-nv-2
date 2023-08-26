import { MidiControl, MidiControlCallback } from "./midiControl";

export class DeckMidiControl extends MidiControl {
    constructor(deckIndex: number, name: string, readonly scaled: boolean, callback: MidiControlCallback) {
        super(deckIndex + name, scaled, callback);
    }
}
