<template>
    <BubbleAlertContainer />
    <div id="staticContainer" :class="{ hidden: !hotelView }">
        <HotelView />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { HotelViewData } from "../../../game/engine/ui/events/data/static/HotelView";
import { EventManager } from "../../../game/engine/ui/events/EventManager";
import { UIEvents } from "../../../game/engine/ui/events/UIEvents";
import HotelView from "./HotelView.vue"
import BubbleAlertContainer from "./BubbleAlertContainer.vue";

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