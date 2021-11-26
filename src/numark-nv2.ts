import { Button } from "@controls/button";
import { Deck } from "@/deck";
import { activate } from "@/utils";
import { MidiControl } from "./controls/midiControl";
import { MidiMapping } from "./midiMapping";
import { DeckButton } from "./controls/deckButton";
import { FineMidiControl } from "./controls/fineMidiControl";

const requestControlsSysex = [0xF0, 0x00, 0x01, 0x3f, 0x7f, 0x3b, 0x60, 0x00, 0x01, 0x49, 0x01, 0x00, 0x00, 0x00, 0x00, 0xf7];

let decks: Deck[];
let deckIndependentControls: MidiControl[];

const controls: MidiControl[] = [];

export function init(): void {
    
    MidiMapping.initReversedMapping();

    decks = [1, 2].map(channel => new Deck(channel));

    let ignoreCrossfader = true;

    deckIndependentControls = [
        new FineMidiControl("Crossfader", {
            onValueChanged: value => {
                if (ignoreCrossfader) return;
                engine.setParameter("[Master]", "crossfader", value);
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
        // new DeckButton(0, "SyncShifted", {
        //     onPressed: () => {
        //         engine.setParameter("[Master]", "crossfader", 0.5);
        //         ignoreCrossfader = !ignoreCrossfader;
        //     }
        // })
    ];

    function traxControl(name: string, factor: number): MidiControl {
        return new MidiControl(name, false, {
            onNewValue: value => {
                engine.setValue("[Library]", "MoveVertical", (value == 0x01 ? -1 : 1) * factor);
            }
        });
    }
    deckIndependentControls.push(traxControl("TraxEncoder", 1));
    //deckIndependentControls.push(traxControl("TraxEncoderShifted", 5));

    registerControls(deckIndependentControls);
    for (const deck of decks) {
        registerControls(deck.controls);
    }

    midi.sendSysexMsg(requestControlsSysex, requestControlsSysex.length);
}

export function midiInput(channel: number, midiNo: number, value: number, status: number, group: string): void {
    //engine.log(`Channel ${channel}, MidiNo: ${midiNo}, Value: ${value}, Status: ${status}, Group: ${group}`);

    const controlName = MidiMapping.mapping[status][midiNo];
    if (controlName == null) return;
    //engine.log(`${controlName}: ${value}`);

    for (const control of controls) {
        control.offerValue(controlName, value);
    }
}

function registerControls(this: any, newControls: MidiControl[]): void {
    controls.push(...newControls);
}
