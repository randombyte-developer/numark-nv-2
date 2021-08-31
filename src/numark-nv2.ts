import { Button } from "@controls/button";
import { Deck } from "@/deck";
import { activate } from "@/utils";
import { MidiControl } from "./controls/midiControl";
import { MidiMapping } from "./midiMapping";
import { DeckButton } from "./controls/deckButton";

let decks: Deck[];
let deckIndependentControls: MidiControl[];

const controls: MidiControl[] = [];

export const ENCODER_CENTER = 0x40;

export function init(): void {
    
    MidiMapping.initReversedMapping();

    decks = [1, 2].map(channel => new Deck(channel));

    let ignoreCrossfader = true;

    deckIndependentControls = [
        new MidiControl("Crossfader", true, {
            onValueChanged: value => {
                if (ignoreCrossfader) return;
                engine.setParameter("[Master]", "crossfader", value);
            }
        }),
        new Button("TraxButton", {
            onPressed: () => {
                activate("[Library]", "MoveFocusForward");
            }
        }),
        new MidiControl("Headphone", true, {
            onValueChanged: value => {
                engine.setParameter("[Master]", "headGain", value * 0.5);
            }
        }),
        new MidiControl("HeadphoneMix", true, {
            onValueChanged: value => {
                engine.setParameter("[Master]", "headMix", value);
            }
        }),
        // Center and ignore crossfader
        new DeckButton(0, "SyncShifted", {
            onPressed: () => {
                engine.setParameter("[Master]", "crossfader", 0.5);
                ignoreCrossfader = !ignoreCrossfader;
            }
        })
    ];

    function traxControl(name: string, factor: number): MidiControl {
        return new MidiControl(name, false, {
            onNewValue: value => {
                engine.setValue("[Library]", "MoveVertical", (value - ENCODER_CENTER) * factor);
            }
        });
    }
    deckIndependentControls.push(traxControl("TraxEncoder", 1));
    deckIndependentControls.push(traxControl("TraxEncoderShifted", 5));

    registerControls(deckIndependentControls);
    for (const deck of decks) {
        registerControls(deck.controls);
    }
}

export function midiInput(channel: number, midiNo: number, value: number, status: number, group: string): void {
    //engine.log(`Channel ${channel}, MidiNo: ${midiNo}, Value: ${value}, Status: ${status}, Group: ${group}`);

    const controlName = MidiMapping.mapping[status][midiNo];
    if (controlName == null) return;
    engine.log(`${controlName}: ${value}`);

    for (const control of controls) {
        control.offerValue(controlName, value);
    }
}

function registerControls(this: any, newControls: MidiControl[]): void {
    controls.push(...newControls);
}
