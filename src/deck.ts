import { MidiControl } from "@controls/midiControl";
import { DeckMidiControl } from "@controls/deckMidiControl";
import { DeckFineMidiControl } from "@controls/deckFineMidiControl";
import { DeckButton } from "@controls/deckButton";
import { toggleControl, activate, makeLedConnection, clamp } from "@/utils";
import { MidiMapping } from "./midiMapping";
import { ENCODER_CENTER } from "./numark-nv2";

export class Deck {
    public readonly index: number;
    public readonly controls: MidiControl[];
    private readonly connections: Connection[] = [];
    private readonly group: string;

    constructor(readonly channel: number) {
        this.index = channel - 1;
        this.group = `[Channel${channel}]`;

        const eqGroup = `[EqualizerRack1_${this.group}_Effect1]`;
        const filterEffectGroup = `[QuickEffectRack1_${this.group}]`;

        this.controls = [
            new DeckButton(this.index, "Play", {
                onPressed: () => {
                    this.toggleControl("play");
                }
            }),
            new DeckButton(this.index, "Sync", {
                onPressed: () => {
                    this.activate("beatsync");
                }
            }),
            new DeckButton(this.index, "Pfl", {
                onPressed: () => {
                    // TODO: turn off all other pfls
                    this.toggleControl("pfl");
                }
            }),
            new DeckButton(this.index, "Back", {
                onPressed: () => {
                    activate("[Library]", "MoveFocusForward");
                }
            }),

            // Loop
            new DeckButton(this.index, "Loop", {
                onPressed: () => {
                    this.activate(`beatloop_${this.getValue("beatloop_size")}_toggle`);
                }
            }),

            // Loop size
            // new DeckButton(this.index, "LoopEncoder", {
            //     onNewValue: value => {
            //         const forward = value > ENCODER_CENTER;
            //         this.activate(forward ? "loop_double" : "loop_halve");
            //     }
            // }),

            // Gain
            new DeckFineMidiControl(this.index, "Gain", {
                onValueChanged: value => {
                    this.setParameter("pregain", value);
                }
            }),

            // EQ
            new DeckFineMidiControl(this.index, "EqLow", {
                onValueChanged: value => {
                    engine.setParameter(eqGroup, "parameter1", value);
                }
            }),
            new DeckFineMidiControl(this.index, "EqMid", {
                onValueChanged: value => {
                    engine.setParameter(eqGroup, "parameter2", value);
                }
            }),
            new DeckFineMidiControl(this.index, "EqHigh", {
                onValueChanged: value => {
                    engine.setParameter(eqGroup, "parameter3", value);
                }
            }),

            // Quick Effect / Filter
            new DeckFineMidiControl(this.index, "Filter", {
                onValueChanged: value => {
                    engine.setParameter(filterEffectGroup, "super1", value);
                }
            }),

            new DeckFineMidiControl(this.index, "Volume", {
                onValueChanged: value => {
                    this.setParameter("volume", value);
                }
            }),

            // Beatjump
            // new DeckButton(this.index, "FxSelectEncoder", {
            //     onNewValue: value => {
            //         const forward = value > ENCODER_CENTER;
            //         this.activate(forward ? "beatjump_forward" : "beatjump_backward");
            //     }
            // }),

            // Beatjump size
            // new DeckButton(this.index, "FxSelectEncoderShifted", {
            //     onNewValue: value => {
            //         const forward = value > ENCODER_CENTER;
            //         this.modifyAndClampBeatjumpSize(forward ? 2 : 0.5);
            //     }
            // }),

            new DeckFineMidiControl(this.index, "Tempo", {
                onValueChanged: value => {
                    this.setParameter("rate", 1 - value);
                }
            }),

            // Jog wheel
            new DeckButton(this.index, "JogTouchButton", {
                onPressed: () => {                    
                    const alpha = 1.0 / 8;
                    const beta = alpha / 32;
                    engine.scratchEnable(channel, 512, 33 + 1 / 3, alpha, beta, true);
                },
                onReleased: () => {
                    engine.scratchDisable(channel, true);
                }
            }),

            new DeckMidiControl(this.index, "JogEncoder", false, {
                onNewValue: value => {
                    if (engine.isScratching(this.channel)) {
                        engine.scratchTick(this.channel, value - ENCODER_CENTER);
                    } else {
                        this.setParameter("jog", (value - ENCODER_CENTER) / 10.0);
                    }
                }
            })
        ];

        // Hotcues
        const hotcueIndices = [0, 4];
        hotcueIndices.forEach((padIndex, hotcueIndex) => {
            const hotcueNumber = hotcueIndex + 1;

            this.controls.push(new DeckButton(this.index, `Hotcue${padIndex}`, {
                onValueChanged: pressed => {
                    this.setValue(`hotcue_${hotcueNumber}_activate`, pressed);
                }
            }));
            // this.controls.push(new DeckButton(this.index, `Hotcue${padIndex}Shifted`, {
            //     onPressed: () => {
            //         this.activate(`hotcue_${hotcueNumber}_clear`);
            //     }
            // }));
            this.makeLedConnection(`hotcue_${hotcueNumber}_enabled`, `Hotcue${padIndex}`);
        });

        // Load track
        this.controls.push(new DeckButton(this.index, "TraxButton", {
            onPressed: () => {
                this.activate("LoadSelectedTrack");
            }
        }));

        // Eject track
        // this.controls.push(new DeckButton(this.index, "LoadShifted", {
        //     onPressed: () => {
        //         if (!this.getValue("play")) this.activate("eject");
        //     }
        // }));

        // SoftTakeover
        engine.softTakeover(this.group, "rate", true);

        // Leds
        this.makeLedConnection("play", "Play");
        this.makeLedConnection("loop_enabled", "Loop");

        this.triggerConnections();
    }

    private triggerConnections() {
        for (const connection of this.connections) {
            connection.trigger();
        }
    }

    private modifyAndClampBeatjumpSize(factor: number) {
        this.setValue("beatjump_size", clamp(this.getValue("beatjump_size") as number * factor, 0.03125, 128));
    }

    private getParameter(key: string): number {
        return engine.getParameter(this.group, key);
    }

    private setParameter(key: string, value: number) {
        engine.setParameter(this.group, key, value);
    }

    private getValue(key: string): number | boolean {
        return engine.getValue(this.group, key);
    }

    private setValue(key: string, value: number | boolean) {
        engine.setValue(this.group, key, value);
    }

    private activate(key: string) {
        activate(this.group, key);
    }

    private toggleControl(key: string) {
        toggleControl(this.group, key);
    }

    private makeConnection(key: string, callback: ConnectionCallback) {
        this.connections.push(engine.makeConnection(this.group, key, callback));
    }

    private makeLedConnection(key: string, controlName: string) {
        const [status, midiNo] = MidiMapping.getMidiForControl(`${this.index}${controlName}`);
        this.connections.push(makeLedConnection(this.group, key, status, midiNo));
    }
}
