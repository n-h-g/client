<template>
    <div id="card">
        <div class="title-bar" ref="handler">
            {{ props.title }}
            <div class="closeIcon" @click="hide()"></div>
        </div>
        <div class="content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { EventManager } from "../../../game/engine/ui/events/EventManager"
import { BoxEvent } from '../../../game/engine/ui/events/general/BoxEvent'
import { UIEvents } from "../../../game/engine/ui/events/UIEvents"
import { UIEventsType } from "../../../game/engine/ui/events/UIEventsType"

const props = defineProps<{
    title: String,
    box: UIEventsType
}>()

function hide() {
    EventManager.emit<BoxEvent>(UIEvents.CLOSE, {
        type: props.box,
    })
}
</script>

<style lang="scss">
#card {
    position: relative;
    pointer-events: all;
    display: flex;
    width: 100%;
    background-color: #F1EEE7;
    overflow: hidden;
    border-radius: 8px;
    flex-flow: column;
    font-family: 'Ubuntu', sans-serif;
    z-index: 10000;

    .title-bar {
        background-color: transparent;
        height: 30px;
        display: flex;
        flex-flow: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        font-weight: 700;
        color: #272727;

        .closeIcon {
            position: absolute;
            right: 8px;
            top: 6px;
            width: 19px;
            height: 20px;
            cursor: pointer;
            background: url("@/assets/images/closeIcon.png") no-repeat;

            &:hover {
                background: url("@/assets/images/closeIconHover.png") no-repeat;
            }
        }
    }
}
</style>