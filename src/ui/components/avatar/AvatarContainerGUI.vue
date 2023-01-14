
<template>
    <div id="avatarContainerGui" ref="avatarContainerGui" v-bind:style="{top: bounds.y + 'px', left: bounds.x + 'px'}">
        <img src="~@/assets/images/chat/typing.png" :class="{hidden: !typing}" class="typing"/>
        <div class="label" :class="{hidden: !showLabel}">{{ label }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { EventManager } from "../../../game/core/events/EventManager";
import { AvatarContainerData } from "../../../game/engine/events/ui/data/avatar/AvatarContainerData";
import { UIEvents } from "../../../game/engine/events/ui/UIEvents";


const typing = ref(false)

const label = ref("")

const showLabel = ref(false)

const bounds = ref({
    x: 0,
    y: 0, 
    w: 0,
    h: 0
})

EventManager.read(UIEvents.AVATAR_CONTAINER_UPDATED, (event: AvatarContainerData) => {
  label.value = event.label
  typing.value = event.typing
  bounds.value = event.bounds
})

</script>
<style lang="scss">
#avatarContainer {
    z-index: 1000;
    pointer-events: all !important;
    position:absolute;

    #avatarContainerGui {
        position:absolute;
    
        .label {
            background-color: #333;
            padding: 2px 1px;
            color:#fff;
            margin: 0 auto;
            font-size: 12px;
            text-align:center;
        }
        .typing {
            position: absolute;
            right:-5px;
            bottom:-15px;
        }
    }
}
</style>