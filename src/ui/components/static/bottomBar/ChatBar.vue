
<template>
    <div class="chatBar" :class="{hidden: !enabled}">
      <input type="text" class="chatInput" autofocus :placeholder="placeHolder" :v-model="message" @input="onInput()">
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Engine } from "../../../../game/Engine";
import { RoomUIEventData } from "../../../../game/engine/ui/events/data/room/RoomUIEventData";
import { EventManager } from "../../../../game/engine/ui/events/EventManager";
import { UIEvents } from "../../../../game/engine/ui/events/UIEvents";
import { OutgoingPacket } from "../../../../game/networking/packets/outgoing/OutgoingPacket";


let placeHolder = ref("Type here to talk..")
let typed = ref(false)
let message = ""

let enabled = ref(false)

EventManager.read(UIEvents.ROOM_UI, (payload: RoomUIEventData) => {
    enabled.value = payload.enabled
})

function onInput() {
    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserTypeStatus, {
        roomId: Engine.getInstance().roomService.CurrentRoom.Id,
        typing: false
    })

    this.typing = false;
}

onMounted(() => {

})
</script>