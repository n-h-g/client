<template>
	<div class="chatBar" :class="{ hidden: !enabled }">
		<div v-if="whisperTo" class="chatWhisperTarget">
			Sussurra a <b>{{ whisperTo }}</b>
			<button class="chatWhisperClose" title="Parla alla stanza (Esc)" @click="stopWhisper">✕</button>
		</div>
		<input ref="input" type="text" class="chatInput" :class="{ chatInputWhisper: whisperTo }" autofocus
			:placeholder="whisperTo ? `Sussurra a ${whisperTo}..` : placeHolder" v-model="message" @keydown="onKeyDown"
			@keyup.enter="sendMessage">
	</div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { EventManager } from '../../../../game/core/events/EventManager'
import { Engine } from '../../../../game/Engine'
import { RoomUIEventData } from '../../../../game/engine/events/ui/data/room/RoomUIEventData'
import { WhisperData } from '../../../../game/engine/events/ui/data/room/WhisperData'
import { UIEvents } from '../../../../game/engine/events/ui/UIEvents'
import { OutgoingPacket } from '../../../../game/networking/packets/outgoing/OutgoingPacket'

let placeHolder = ref("Type here to talk..")
let typed = ref(false)
let message = ref("")
let enabled = ref(false)
/** The user the chat whispers to (avatar menu > Sussurra), empty: the chat talks to the room. */
const whisperTo = ref("")
const input = ref<HTMLInputElement | null>(null)

EventManager.read(UIEvents.ROOM_UI, (payload: RoomUIEventData) => {
	enabled.value = payload.enabled

	// out of the room: no more whispers
	if (!payload.enabled) whisperTo.value = ""
})

EventManager.read(UIEvents.CHAT_WHISPER, (payload: WhisperData) => {
	whisperTo.value = payload.username ?? ""
	if (whisperTo.value) {
		// the others don't see that the user is writing a whisper
		sendTyping(false)
		nextTick(() => input.value?.focus())
	}
})

function stopWhisper() {
	whisperTo.value = ""
	nextTick(() => input.value?.focus())
}

function sendMessage(e) {
	let shout = false

	if (e.shiftKey)
		shout = true

	if (message.value.trim() !== "" && !Engine.getInstance().chatService.checkCommand(message.value)) {
		Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserSay, {
			text: message.value,
			shout: shout,
			// only the user and the recipient see it (the server checks that it's in the room)
			...(whisperTo.value ? { whisperTo: whisperTo.value } : {})
		})
	}

	typed.value = false
	message.value = ""

	// the others stop seeing the typing bubble
	sendTyping(false)
}

function onKeyDown(e: KeyboardEvent) {
	if (e.key === "Escape" && whisperTo.value) {
		stopWhisper()
		return
	}

	// a whisper is not shown as typing
	sendTyping(!whisperTo.value && message.value !== "")
}

function sendTyping(typing: boolean) {
	const roomId = Engine.getInstance().roomService.currentRoom?.id
	if (roomId == null) return

	Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserTypeStatus, {
		roomId,
		typing
	})
}
</script>

<style lang="scss">
.chatBar {
	.chatWhisperTarget {
		position: absolute;
		left: 50%;
		bottom: 49px;
		transform: translateX(-50%);
		z-index: 10000;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 3px 4px 3px 10px;
		color: #fff;
		background: #2d2a29;
		border: 1px solid #000;
		border-radius: 6px;
		font-family: 'Ubuntu', sans-serif;
		font-size: 12px;
		font-style: italic;
		pointer-events: all;

		b {
			font-style: normal;
		}

		.chatWhisperClose {
			padding: 0 5px;
			color: #fff;
			background: #514d4a;
			border: 0;
			border-radius: 4px;
			font-size: 11px;
			cursor: pointer;
		}
	}

	.chatInputWhisper {
		font-style: italic;
	}
}
</style>