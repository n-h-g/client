<template>
    <div class="topBar">
        <div class="coinsBox credits">{{  credits  }}</div>
        <div class="coinsBox points">0</div>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EventManager } from '../../../../game/engine/ui/events/EventManager'
import { TopBarEvent } from '../../../../game/engine/ui/events/static/TopBarEvent'
import { UIEvents } from '../../../../game/engine/ui/events/UIEvents'

const credits = ref(0)

EventManager.read(UIEvents.SET_TOPBAR, (event: TopBarEvent) => {
    credits.value = event.credits
})

</script>

<style lang="scss">
@import '@/assets/scss/game.scss';

.topBar {
    position: fixed;
    width: 190px;
	right: 4px;
	top: 0;
	z-index: 1;
	background-color: rgba(40,40,40,0.65);
	border: 2px solid rgba(255,255,255,0.2);
	border-radius: 6px;
	box-shadow: 0 2px 0 0 rgba(0,0,0,0.7), 1px 0 0 0 rgba(0,0,0,0.7), -1px 0 0 0 rgba(0,0,0,0.7);
	padding: 3px;
	border-top: 0;
	border-top-left-radius: 0;
	border-top-right-radius: 0;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	font-size: 11px;
	font-weight: 600;
    

    & .coinsBox {
        height: 19px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        text-shadow: 0 1px rgba(0,0,0,0.3);
        cursor: pointer;

        &.credits {
            color: #e7bb1a;
        }
        
        &.points {
            color: #a60e73;
        }
    }
}

</style>