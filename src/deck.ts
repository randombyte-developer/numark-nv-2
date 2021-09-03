import { MidiControl } from "@controls/midiControl";
import { DeckMidiControl } from "@controls/deckMidiControl";
import { DeckFineMidiControl } from "@controls/deckFineMidiControl";
import { DeckButton } from "@controls/deckButton";
import { toggleControl, activate, makeLedConnection, clamp, setLed } from "@/utils";
import { MidiMapping } from "./midiMapping";
import { FineMidiControl } from "./controls/fineMidiControl";

export class Deck {
    public readonly index: number;
    public readonly controls: MidiControl[];
    private readonly connections: Connection[] = [];
    private readonly group: string;

    private readonly rateControl: FineMidiControl;
    private readonly shiftControl: DeckButton;

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
                    this.updateRateTakeoverLeds();
                }
            }),
            new DeckButton(this.index, "Pfl", {
                onValueChanged: value => {
                    // implemented like this because the controller internally keeps a radio-button-like state
                    engine.setValue(this.group, "pfl", value > 0);
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
            new DeckButton(this.index, "PitchBendPlus", {
                onPressed: () => {
                    this.activate("loop_double");
                }
            }),
            new DeckButton(this.index, "PitchBendMinus", {
                onPressed: () => {
                    this.activate("loop_halve");
                }
            }),

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
            new DeckButton(this.index, "Hotcue6", {
                onPressed: () => {
                    this.activate("beatjump_backward");
                }
            }),
            new DeckButton(this.index, "Hotcue7", {
                onPressed: () => {
                    this.activate("beatjump_forward");
                }
            }),

            // Beatjump size
            new DeckButton(this.index, "ParamAdjustRight", {
                onPressed: () => {
                    this.modifyAndClampBeatjumpSize(2);
                }
            }),
            new DeckButton(this.index, "ParamAdjustLeft", {
                onPressed: () => {
                    this.modifyAndClampBeatjumpSize(0.5);
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

            new DeckButton(this.index, "TraxButton", {
                onPressed: () => {
                    if (this.shiftControl.lastValue > 0) {
                        if (!this.getValue("play")) this.activate("eject");
                    } else {
                        this.activate("LoadSelectedTrack");
                    }
                }
            })
        ];

        this.shiftControl = new DeckButton(this.index, "Shift", {}); // the lastValue is accessed somewhere else
        this.controls.push(this.shiftControl);

        this.rateControl = new DeckFineMidiControl(this.index, "Tempo", {
            onValueChanged: value => {
                const hardwareValue = 1 - value;
                this.setParameter("rate", hardwareValue);
                this.updateRateTakeoverLeds(hardwareValue);
            }
        });
        this.controls.push(this.rateControl);

        const jogEncoder = new DeckFineMidiControl(this.index, "JogEncoder", {
            onValueChanged: newValue => {
                const valueDiff = Math.round((newValue - jogEncoder.lastValue) * 0x3FFF);

                // the jog wheel is an absolute-position encoder, which wraps around at some point
                // the absolute  value when it wraps around is something like 127
                // no fancy math is done here. it just ignores the wrap around
                if (Math.abs(valueDiff) > 100) return;

                if (engine.isScratching(this.channel)) {
                    engine.scratchTick(this.channel, valueDiff);
                } else {
                    this.setParameter("jog", valueDiff / 10.0);
                }
            }
        });
        this.controls.push(jogEncoder);

        // Hotcues
        const hotcueIndices = [0, 4];
        hotcueIndices.forEach((padIndex, hotcueIndex) => {
            const hotcueNumber = hotcueIndex + 1;

            this.controls.push(new DeckButton(this.index, `Hotcue${padIndex}`, {
                onValueChanged: pressed => {
                    if (pressed && this.shiftControl.lastValue > 0) {
                        this.activate(`hotcue_${hotcueNumber}_clear`);
                        return;
                    };
                    this.setValue(`hotcue_${hotcueNumber}_activate`, pressed);
                }
            }));
            this.makeLedConnection(`hotcue_${hotcueNumber}_enabled`, `Hotcue${padIndex}`, 0x0C); // green
        });

        // SoftTakeover
        engine.softTakeover(this.group, "rate", true);

        // Leds
        this.makeLedConnection("play", "Play");
        this.makeLedConnection("loop_enabled", "Loop");
        setLed(`${this.index}Hotcue6`, 0x11); // dark purple
        setLed(`${this.index}Hotcue7`, 0x11);

        this.triggerConnections();
    }

    private triggerConnections() {
        for (const connection of this.connections) {
            connection.trigger();
        }
    }

    private updateRateTakeoverLeds(hardwareValue: number = 1 - this.rateControl.lastValue) {
        const softwareValue = this.getParameter("rate");
        setLed(`${this.index}PitchBendPlus`, +(hardwareValue < softwareValue));
        setLed(`${this.index}PitchBendMinus`, +(hardwareValue > softwareValue));
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

    private makeLedConnection(key: string, controlName: string, ledValue: number = 0x7F) {
        const [status, midiNo] = MidiMapping.getMidiForControl(`${this.index}${controlName}`);
        this.connections.push(makeLedConnection(this.group, key, status, midiNo, ledValue));
    }
}
