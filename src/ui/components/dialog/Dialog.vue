<template>
    <div id="dialog" @mousedown="pointerDown" @mouseup="pointerUp" :style="style">
        <div class="title-bar">
            {{ props.title }}
            <div class="closeIcon" @click="hide()"></div>
        </div>
        <div class="content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { DialogEventData } from '../../../game/engine/events/ui/data/general/Dialog'
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"

let style = ref('');

const mouseMove = ev => {
    style.value = 'transform: translate('+ ev.clientX +'px, '+ ev.clientY + 'px)'
}

const pointerDown = ev => {
    document.getElementById('dialog').addEventListener('mousemove', mouseMove)
}

const pointerUp = ev => {
    document.getElementById('dialog').removeEventListener('mousemove', mouseMove)
}


const props = defineProps<{
    title: String,
    box: UIEventsType
}>()

function hide() {
    EventManager.emit<DialogEventData>(UIEvents.CLOSE, {
        type: props.box,
    })
}
</script>

<style lang="scss">
#dialog {
	border-radius: 6px;
    border: 6px solid #367897;
    box-shadow: #408caf 5px 5px inset,  #408caf -5px -5px inset;
    pointer-events: all;
    z-index: 1;

    .title-bar {
        position: relative;
        height: 31px;
        background-color: #367897;
        color: #FFF;
        font-size: 17px;
        font-weight: bold;
        line-height: 31px;
        text-align: center;
        cursor: default;

        .closeIcon {
            float: right;
            width: 19px;
            height: 20px;
            top: 5px;
            right: 5px;
            position: relative;
            cursor: pointer;
            background: url("@/assets/images/closeIcon.png") no-repeat;

            &:hover {
                background: url("@/assets/images/closeIconHover.png") no-repeat;
            }
        }
    }

    .sub {
        position: relative;
        display: table;
        margin: auto;
        letter-spacing: -1px;

        .item {
            color: #000;
            text-shadow: none;
            background-color: #E2E2E2;
            box-shadow: inset 0 3px 0 #fff, inset 0 -15px 0px #cdcdcd;
            position: relative;
            display: inline-block;
            padding: 5px 10px;
            font-size: 19px;
            line-height: 19px;
            text-decoration: none;
            border-radius: 6px 6px 0 0;

            &.active {
                border: 1px solid #000;
            }
        }
    }

    .content {
        position: relative;
        font-size: 13px;
        background-color: #e9e9e1;
        border-radius: 6px;
        padding: 0 5px 0 5px;
        height: calc(100% - 31px);
        bottom: 0px;
        cursor: default;
    }
}
</style>