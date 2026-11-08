<template>
    <Dialog title="Regolatore luci" className="roomDimmer" :box="UIEventsType.ROOM_DIMMER">
        <!-- the dimmer is off: as Nitro, only the button to switch it on -->
        <div class="dimmerContent off" v-if="!state.enabled">
            <div class="dimmerPanel dimmerOff">
                <div class="dimmerOffTitle">Il regolatore luci è spento.</div>
                <div class="dimmerInfo">Accendilo per scegliere il colore e l'intensità della luce della stanza.</div>
            </div>
            <div class="dimmerButtons end">
                <button class="ui-button small" @click="store.toggle()">Accendi</button>
            </div>
        </div>

        <div class="dimmerContent" v-else>
            <div class="dimmerTabs">
                <div
                    v-for="index in RoomDimmerStore.PRESET_COUNT"
                    :key="index"
                    class="dimmerTab"
                    :class="{ active: state.selected === index - 1 }"
                    @click="store.selectPreset(index - 1)"
                >
                    Preset {{ index }}
                </div>
            </div>

            <div class="dimmerPanel">
                <div class="dimmerColors">
                    <div
                        v-for="color in RoomDimmerStore.COLORS"
                        :key="color"
                        class="dimmerColor"
                        :class="{ selected: preset.color === color, black: color === '#000000' }"
                        :style="{ backgroundColor: color }"
                        :title="color"
                        @click="store.setColor(color)"
                    ></div>
                </div>

                <input
                    type="range"
                    class="dimmerSlider"
                    :min="RoomDimmerStore.MIN_BRIGHTNESS"
                    :max="RoomDimmerStore.MAX_BRIGHTNESS"
                    :value="preset.brightness"
                    @input="store.setBrightness(Number(($event.target as HTMLInputElement).value))"
                />

                <label class="dimmerCheck">
                    <input
                        type="checkbox"
                        :checked="preset.backgroundOnly"
                        @change="store.setBackgroundOnly(($event.target as HTMLInputElement).checked)"
                    />
                    Solo sfondo
                </label>

                <div class="dimmerInfo">
                    L'effetto delle luci è un'anteprima che vedi solo tu. Applicalo alla stanza perché lo vedano
                    anche gli altri.
                </div>
            </div>

            <div class="dimmerButtons">
                <button class="ui-button small" @click="store.apply()">Applica alla stanza</button>
                <button class="ui-button small" @click="store.toggle()">Spegni</button>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { RoomDimmerStore } from "../../../game/engine/room/dimmer/RoomDimmerStore"

const store = RoomDimmerStore.getInstance()
const state = store.state
const preset = computed(() => state.presets[state.selected])

// closed: the preview ends, the room has the light of the dimmer again
onUnmounted(() => store.onClosed())
</script>

<style lang="scss">
.roomDimmer {
    position: fixed;
    right: 16px;
    bottom: 90px;
    width: 268px;
    height: 236px;

    .dimmerContent {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 6px 2px 6px;
        box-sizing: border-box;
        font-family: 'Ubuntu', sans-serif;
        font-size: 12px;
    }

    .dimmerTabs {
        display: flex;
        gap: 2px;
        padding-left: 4px;
    }

    .dimmerTab {
        position: relative;
        top: 1px;
        padding: 3px 10px 2px;
        border: 1px solid #7f7f7f;
        border-bottom: none;
        border-radius: 5px 5px 0 0;
        background: linear-gradient(to bottom, #e4e4e4 0%, #cfcfcf 100%);
        color: #333;
        cursor: pointer;
        user-select: none;

        &:hover {
            background: linear-gradient(to bottom, #f0f0f0 0%, #dadada 100%);
        }

        &.active {
            z-index: 1;
            background: #fff;
            color: #000;
            font-weight: bold;
        }
    }

    .dimmerPanel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        padding: 10px 10px 8px;
        background: #fff;
        border: 1px solid #7f7f7f;
        border-radius: 0 6px 6px 6px;
    }

    .dimmerColors {
        display: flex;
        gap: 4px;
    }

    .dimmerColor {
        width: 26px;
        height: 20px;
        border: 1px solid #555;
        border-radius: 3px;
        box-sizing: border-box;
        cursor: pointer;

        // the black is drawn as in Habbo: a black square with a white frame
        &.black {
            box-shadow: inset 0 0 0 2px #fff;
        }

        &.selected {
            outline: 2px solid #1e7cd1;
            outline-offset: 1px;
        }

        &:hover:not(.selected) {
            outline: 1px solid #1e7cd1;
            outline-offset: 1px;
        }
    }

    // the track with the notches of the Habbo slider
    .dimmerSlider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 14px;
        margin: 2px 0 0;
        background:
            repeating-linear-gradient(to right, #999 0 1px, transparent 1px calc((100% - 1px) / 10)) 0 9px / 100% 5px no-repeat,
            linear-gradient(#999, #999) 0 5px / 100% 2px no-repeat;
        cursor: pointer;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 14px;
            border: 1px solid #333;
            border-radius: 3px;
            background: linear-gradient(to bottom, #b6dcf0 0%, #5fa8d3 100%);
        }

        &::-moz-range-thumb {
            width: 10px;
            height: 14px;
            border: 1px solid #333;
            border-radius: 3px;
            background: linear-gradient(to bottom, #b6dcf0 0%, #5fa8d3 100%);
        }
    }

    .dimmerCheck {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        user-select: none;

        input {
            margin: 0;
        }
    }

    .dimmerOff {
        justify-content: center;
        border-radius: 6px;
    }

    .dimmerOffTitle {
        font-weight: bold;
    }

    .dimmerInfo {
        color: #888;
        font-size: 11px;
        line-height: 1.25;
    }

    .dimmerButtons {
        display: flex;
        justify-content: space-between;
        padding-top: 6px;

        &.end {
            justify-content: flex-end;
        }

        .ui-button {
            padding: 2px 8px;
        }
    }
}
</style>
