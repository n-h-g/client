<template>
	<div class="chatBar" :class="{ hidden: !enabled }">
		<div v-if="whisperTo" class="chatWhisperTarget">
			Whisper to <b>{{ whisperTo }}</b>
			<button class="chatWhisperClose" title="Talk to the room (Esc)" @click="stopWhisper">✕</button>
		</div>
		<div class="chatInputWrap" ref="inputWrap">
			<!-- the style of the bubbles (as Habbo): the button opens the styles -->
			<button class="chatStyleButton" :class="{ open: stylesOpen }" title="Bubble style" @click="stylesOpen = !stylesOpen">
				<span class="chatStyleButtonArrow"></span>
				<span class="chatStyleButtonIcon"></span>
			</button>
			<div v-if="stylesOpen" class="chatStyles">
				<button v-for="style in ChatStyleStore.SELECTABLE" :key="style" class="chatStyle"
					:class="{ selected: style === chatStyle }" @click="pickStyle(style)">
					<span class="chatStyleIcon" :class="'bubble-' + style"></span>
				</button>
			</div>

			<input ref="input" type="text" class="chatInput" :class="{ chatInputWhisper: whisperTo }" autofocus
				:placeholder="whisperTo ? `Whisper to ${whisperTo}..` : placeHolder" v-model="message" @keydown="onKeyDown"
				@keyup.enter="sendMessage">
		</div>
	</div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { EventManager } from '../../../../game/core/events/EventManager'
import { Engine } from '../../../../game/Engine'
import { RoomUIEventData } from '../../../../game/engine/events/ui/data/room/RoomUIEventData'
import { WhisperData } from '../../../../game/engine/events/ui/data/room/WhisperData'
import { UIEvents } from '../../../../game/engine/events/ui/UIEvents'
import { OutgoingPacket } from '../../../../game/networking/packets/outgoing/OutgoingPacket'
import { ChatStyleStore } from '../../../../game/engine/game/chat/ChatStyleStore'

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
	// in the room: ready to talk
	else nextTick(() => input.value?.focus())
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
			// the style of the bubble (the picker next to the chat bar)
			style: ChatStyleStore.current,
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

/**
 * The keys typed while nothing else takes them (after a click on the room...) go to the chat:
 * there is no need to click on the input to talk again.
 */
function onWindowKeyDown(e: KeyboardEvent) {
	if (!enabled.value || !input.value || e.defaultPrevented) return
	if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return

	const target = e.target as HTMLElement | null
	if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return

	// while placing a furni the keys are for the room (R rotates, Esc cancels)
	if (Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.isEntityRolling()) return

	if (e.key === "Enter") {
		e.preventDefault()
		input.value.focus()
		return
	}

	// only the printable characters (no arrows, F keys, Esc...)
	if (e.key.length !== 1) return

	e.preventDefault()
	message.value += e.key
	input.value.focus()
	nextTick(() => {
		const el = input.value
		if (el) el.setSelectionRange(el.value.length, el.value.length)
	})

	sendTyping(!whisperTo.value)
}

onMounted(() => window.addEventListener('keydown', onWindowKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeyDown))

// ---------------- the style of the bubbles
const chatStyle = ref(ChatStyleStore.current)
const stylesOpen = ref(false)
const inputWrap = ref<HTMLElement | null>(null)

onBeforeUnmount(ChatStyleStore.subscribe(style => chatStyle.value = style))

function pickStyle(style: number) {
	ChatStyleStore.set(style)
	stylesOpen.value = false
	input.value?.focus()
}

// a click out of the styles closes them
function onDocumentPointerDown(event: PointerEvent) {
	if (stylesOpen.value && !inputWrap.value?.contains(event.target as Node)) stylesOpen.value = false
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))

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
@import "../../room/chatBubbles.scss";

.chatBar {
	.chatStyleButton {
		position: absolute;
		left: 4px;
		top: 50%;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 3px;
		height: 28px;
		padding: 0 5px;
		transform: translateY(-50%);
		background: #c9c9c9;
		border: 1px solid #8e8e8e;
		border-radius: 5px;
		cursor: pointer;
		outline: none;

		&:hover,
		&.open {
			background: #d8d8d8;
		}
	}

	.chatStyleButtonArrow {
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-top: 5px solid #333;
	}

	.chatStyleButtonIcon {
		width: 17px;
		height: 19px;
		background: url("@/assets/images/chat/styles-icon.png") no-repeat center;
	}

	/* the styles, over the chat bar (as Habbo) */
	.chatStyles {
		position: absolute;
		left: 0;
		bottom: calc(100% + 8px);
		z-index: 2;
		display: grid;
		grid-template-columns: repeat(6, 64px);
		gap: 4px;
		max-height: 220px;
		padding: 8px;
		overflow-y: auto;
		background: #121212;
		border: 2px solid #333;
		border-radius: 6px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, .5);
	}

	.chatStyle {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 34px;
		padding: 0;
		background: transparent;
		border: 2px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		outline: none;

		&:hover {
			background: #2a2a2a;
		}

		&.selected {
			background: #fff;
			border-color: #fff;
		}

		.chatStyleIcon {
			width: 56px;
			height: 30px;
		}
	}

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