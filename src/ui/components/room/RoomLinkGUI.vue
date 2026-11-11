<template>
	<Dialog title="More friends, more fun!" class-name="roomLinkDialog" :box="UIEventsType.ROOM_LINK">
		<div class="roomLink">
			<img class="roomLinkThumbnail" src="@/assets/images/room/thumbnail_placeholder.png" alt="" />
			<div class="roomLinkText">
				<div class="roomLinkTitle">Share your room!</div>
				<p>Take a look at this room and share it with your friends!</p>
				<p>Copy and paste this URL so they get straight into the room:</p>
				<div class="roomLinkButtons">
					<button class="roomLinkButton" :disabled="roomId == null" @click="copy(roomUrl, 'The URL')">Copy the URL</button>
					<button class="roomLinkButton" :disabled="roomId == null" @click="copy(String(roomId), 'The room ID')">Copy the room ID</button>
				</div>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { Engine } from "../../../game/Engine"
import { EventManager } from "../../../game/core/events/EventManager"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { BubbleAlertData } from "../../../game/engine/events/ui/data/general/BubbleAlertData"

const roomId = Engine.getInstance()?.roomService?.currentRoom?.id ?? null
/** The client opens it in the room (router: /room/:roomId). */
const roomUrl = computed(() => `${window.location.origin}/room/${roomId}`)

async function copy(text: string, what: string) {
	let copied = false
	try {
		// only on https or localhost
		await navigator.clipboard.writeText(text)
		copied = true
	} catch {
		// e.g. the site on http: the old way
		const field = document.createElement("textarea")
		field.value = text
		field.style.position = "fixed"
		field.style.opacity = "0"
		document.body.appendChild(field)
		field.select()
		try { copied = document.execCommand("copy") } catch { copied = false }
		field.remove()
	}

	EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, {
		message: copied ? `${what} is copied: ${text}` : `Copy it by hand: ${text}`,
	})
}
</script>

<style lang="scss">
#dialog.roomLinkDialog {
	position: absolute;
	z-index: 4;
	top: 30%;
	left: calc(50% - 200px);
	width: 400px;
	height: 172px;

	> .content {
		padding: 10px;
		box-sizing: border-box;
	}
}

.roomLink {
	display: flex;
	gap: 12px;
	height: 100%;
	color: #000;
	user-select: none;

	.roomLinkThumbnail {
		flex: 0 0 auto;
		width: 108px;
		height: 100px;
		object-fit: none;
		background: #c8c8c8;
		border: 1px solid #7d7d7d;
		image-rendering: pixelated;
	}

	.roomLinkText {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;

		p {
			margin: 0 0 6px;
			font-size: 12px;
			line-height: 1.3;
		}
	}

	.roomLinkTitle {
		margin-bottom: 6px;
		font-size: 15px;
		font-weight: 700;
	}

	.roomLinkButtons {
		display: flex;
		gap: 6px;
		margin-top: auto;
	}

	.roomLinkButton {
		flex: 1;
		padding: 3px 6px;
		background: linear-gradient(#fff, #e3e3e3);
		border: 1px solid #000;
		border-radius: 4px;
		font-family: inherit;
		font-size: 12px;
		color: #000;
		white-space: nowrap;
		cursor: pointer;
		outline: none;

		&:hover:not(:disabled) {
			background: linear-gradient(#fff, #f0f0f0);
		}

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}
}
</style>
