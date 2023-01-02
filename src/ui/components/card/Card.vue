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
    border: 1px solid #000;
	border-radius: 8px;
	background-color: #367897;
	color: #000;
	text-align: center;
	font-size: 14px;
	z-index: 10;

    &::before {
        position: absolute;
        display: block;
        content: '';
        top: 2px;
        height: 100%;
        width: 100%;
        border-radius: 6px;
    }

    .title-bar {
        
        width: 100%;
        border: 2px solid #408CAF;
        color: #fff;
        padding: 10px;
        background-color: #367897;
        font-weight: 600;
        font-size: 14px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        text-align: center;


        .closeIcon {
            position: absolute;
            right: 8px;
            top: 10px;
            width: 19px;
            height: 20px;
            cursor: pointer;
            background: url("@/assets/images/closeIcon.png") no-repeat;

            &:hover {
                background: url("@/assets/images/closeIconHover.png") no-repeat;
            }
        }
    }
    .content {
        background-color: #ebebeb;
        width: calc(100% - 10px);
        margin: 0 auto;
    }
}
</style>