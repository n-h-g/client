<template>
    <div class="chatBar" :class="{hidden: !enabled}">
      <input type="text" class="chatInput" autofocus :placeholder="placeHolder" v-model="message" v-on:keydown="onInput()" @keyup.enter="sendMessage">
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Engine } from "../../../../game/Engine";
import { RoomUIEventData } from "../../../../game/engine/ui/events/data/room/RoomUIEventData";
import { EventManager } from "../../../../game/engine/ui/events/EventManager";
import { UIEvents } from "../../../../game/engine/ui/events/UIEvents";
import { OutgoingPacket } from "../../../../game/networking/packets/outgoing/OutgoingPacket";

let placeHolder = ref("Type here to talk..")
let typed = ref(false)
let message = ref("")

let enabled = ref(false)

EventManager.read(UIEvents.ROOM_UI, (payload: RoomUIEventData) => {
    enabled.value = payload.enabled
})

function sendMessage(e) {
    let shout = false;

    if(e.shiftKey) {
        shout = true;
    }

    console.log(shout)

    Engine.getInstance().chatService.computeMessage(message.value, shout, false)
        Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserTypeStatus, {
        roomId: Engine.getInstance().roomService.CurrentRoom.Id,
        typing: false
    })

    typed.value = false
    message.value = ""

}

function onInput() {
    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserTypeStatus, {
        roomId: Engine.getInstance().roomService.CurrentRoom.Id,
        typing: false
    })

    this.typing = false;
}
</script>