<template>
    <div class="chatBar" :class="{hidden: !enabled}">
      <input type="text" class="chatInput" autofocus :placeholder="placeHolder" v-model="message" v-on:keydown="onInput()" @keyup.enter="sendMessage">
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { EventManager } from "../../../../game/core/events/EventManager";
import { Engine } from "../../../../game/Engine";
import { RoomUIEventData } from "../../../../game/engine/events/ui/data/room/RoomUIEventData";
import { UIEvents } from "../../../../game/engine/events/ui/UIEvents";
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

    typed.value = false
    message.value = ""

}

function onInput() {

    this.typing = false;
}
</script>