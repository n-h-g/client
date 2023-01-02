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
    width: 210px;
	background-color: #33332F;
	border: 2px solid #424C4E;
	border-top: 0;
	position: fixed;
	border-bottom-left-radius: 6px;
	border-bottom-right-radius: 6px;
	right: 10px;
	z-index: 10;
	top: 0px;
	padding: 5px;
	box-shadow: 0px 2px 0px 0px #000;

    &* {
        float: left;
	    width: 33.3%;
    }
    

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

    & .hc {
        padding: 3px;
        width: 25%;
        background-color: #3B423F;
        border-radius: 6px;
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        height: 63px;
        padding-top: 10px;
        color: #00C0C3;
        cursor: pointer;
        display:inline-block;
    }
}

</style>