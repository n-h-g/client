<template>
    <div class="bottomBar">
        <div class="leftOptions">
            <div class="menuButton avatar">
                <img src="~@/assets/images/bottom-bar/avatar.png" style="width: 100%;"/>
            </div>
            <div class="menuButton inventory" @click="toggle('inventory')">
                 <img src="~@/assets/images/bottom-bar/inventory.png" style="width: 100%;"/>
            </div>
            <div class="menuButton navigator" @click="toggle('navigator')">
                <img src="~@/assets/images/bottom-bar/navigator.png"/>
            </div>
            <div class="menuButton catalog" @click="toggle('catalog')">
                 <img src="~@/assets/images/bottom-bar/catalog.png"/>
            </div>
            <div class="menuButton friends" @click="toggle('friends')">
                 <img src="~@/assets/images/bottom-bar/friends.png" style="width: 95%;"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { EventManager } from '../../../game/engine/ui/events/EventManager'
import { OpenBoxEvent } from '../../../game/engine/ui/events/OpenBoxEvent'

function toggle(ui: string) {
    console.log(ui);
}

EventManager.read('init', (event: OpenBoxEvent) => {
    console.log(event)
})
</script>