<template>
    <BubbleAlertContainer />
    <div id="staticContainer" v-if="hotelView" :class="{ hidden: !hotelView }">
        <HotelView />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HotelView from './HotelView.vue'
import { EventManager } from '../../../game/core/events/EventManager'
import BubbleAlertContainer from './BubbleAlertContainer.vue'
import { HotelViewData } from '../../../game/engine/events/ui/data/static/HotelView'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'

let hotelView = ref(true)

EventManager.read(UIEvents.HOTEL_VIEW, (payload: HotelViewData) => {
    hotelView.value = payload.mode
})
</script>

<style lang="scss">
#staticContainer {
    background: url('') no-repeat center;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    pointer-events: none;
}
</style>