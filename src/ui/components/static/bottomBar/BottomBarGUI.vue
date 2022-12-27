<template>
    <div class="bottomBar">
        <div class="leftOptions">
            <div class="menuButton avatar">
                <img src="@/assets/images/bottom-bar/avatar.png" class="avatar-img">
            </div>
            <div class="menuButton inventory" @click="toggle('inventory')">
                <img src="@/assets/images/bottom-bar/inventory.png" class="img">
            </div>
            <div class="menuButton navigator" @click="toggle('navigator')">
                <img src="@/assets/images/bottom-bar/navigator.png" class="img">
            </div>
            <div class="menuButton catalog" @click="toggle('catalog')">
                <img src="@/assets/images/bottom-bar/catalog.png" class="img">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import '@/assets/scss/bottom-bar/bottom-bar.scss'
import { EventManager } from '../../../../game/engine/ui/events/EventManager';
import { OpenBoxEvent } from '../../../../game/engine/ui/events/OpenBoxEvent';

function toggle(ui: string) {
    console.log(ui);
}

EventManager.read('init', (event: OpenBoxEvent) => {
    console.log(event)
})
</script>