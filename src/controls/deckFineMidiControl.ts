import { FineMidiControl } from "./fineMidiControl";
import { MidiControlCallback } from "./midiControl";

export class DeckFineMidiControl extends FineMidiControl {
    constructor(deckIndex: number, name: string, callback: MidiControlCallback) {
        super(deckIndex + name, callback);
    }
}
