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
    top:10px;
    right:0;
    height: 85px;
    background-color: transparent;
    z-index: 10000;
    float: right;

    & .coinsBox {
        background-color: $baseColor;
        
        padding:5px 15px;
        width: 200px;
        border-radius: 25px;
        font-size: 1.2rem;
        //border:1px solid rgba(0,0,0,.25);
        border-bottom-width: 3px;
        margin:5px 10px;
        color:#fff;
        box-shadow: 1px 2px 0 rgba(0,0,0,.15);
        font-weight: bold;
        letter-spacing: 1.5px;
        pointer-events: all;
        text-align:right;

        &.credits {
            color: #e7bb1a;
        }
        
        &.points {
            color: #a60e73;
        }
    }
}

</style>