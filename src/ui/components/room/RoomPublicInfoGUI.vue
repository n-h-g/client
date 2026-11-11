<template>
	<Dialog title="Room info" class-name="roomPublicInfoDialog" :box="UIEventsType.ROOM_PUBLIC_INFO">
		<div class="roomPublicInfo">
			<div class="roomPublicInfoName">{{ info.name }}</div>
			<div class="roomPublicInfoRow"><span class="label">Owner:</span> {{ info.owner }}</div>
			<div v-if="info.description" class="roomPublicInfoDescription">{{ info.description }}</div>

			<img class="roomPublicInfoThumbnail" src="@/assets/images/room/thumbnail_placeholder.png" alt="" />

			<a class="roomPublicInfoLink" @click="openLink()"><span class="arrows">»</span>Link to this room</a>

			<button class="roomPublicInfoReport" @click="report()">Report room</button>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { Engine } from "../../../game/Engine"
import { EventManager } from "../../../game/core/events/EventManager"
import { IComponentShowableUI } from "../../../game/core/ui/IComponentShowableUI"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { UIComponent } from "../../../game/engine/ui/components/UIComponent"
import { BubbleAlertData } from "../../../game/engine/events/ui/data/general/BubbleAlertData"
import { EnterRoomUIEventData } from "../../../game/engine/events/ui/data/room/EnterRoomUIEventData"

const roomInfo = Engine.getInstance()?.roomService?.currentRoom?.roomInfo
const info = ref({
	name: roomInfo?.roomName ?? "",
	owner: roomInfo?.authorName ?? "",
	description: roomInfo?.description ?? "",
})

// e.g. the owner renames it meanwhile
function onRoomInfo(event: EnterRoomUIEventData) {
	info.value = { name: event.name, owner: event.owner, description: event.description ?? "" }
}
EventManager.read(UIEvents.ENTER_ROOM_INFO, onRoomInfo)
onUnmounted(() => EventManager.off(UIEvents.ENTER_ROOM_INFO, onRoomInfo))

function openLink() {
	Engine.getInstance()?.userInterfaceManager?.componentsManager
		?.getComponent<IComponentShowableUI>(UIComponent.RoomLinkUI)?.show()
}

/** No reports on the server yet (the moderation service only reads the tickets). */
function report() {
	EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, { message: "Report room: coming soon!" })
}
</script>

<style lang="scss">
#dialog.roomPublicInfoDialog {
	position: absolute;
	z-index: 3;
	top: 25%;
	left: calc(50% - 130px);
	width: 260px;
	height: 330px;

	> .content {
		padding: 10px;
		box-sizing: border-box;
	}
}

.roomPublicInfo {
	height: 100%;
	display: flex;
	flex-direction: column;
	color: #000;
	font-size: 12px;
	user-select: none;

	.roomPublicInfoName {
		font-size: 13px;
		font-weight: 700;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.roomPublicInfoRow {
		margin-top: 2px;

		.label {
			color: #7a7a7a;
		}
	}

	.roomPublicInfoDescription {
		margin-top: 4px;
		max-height: 32px;
		overflow: hidden;
		color: #333;
		word-break: break-word;
	}

	.roomPublicInfoThumbnail {
		align-self: center;
		width: 108px;
		height: 100px;
		margin: 10px 0;
		object-fit: none;
		background: #c8c8c8;
		border: 1px solid #44617a;
		image-rendering: pixelated;
	}

	.roomPublicInfoLink {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #000;
		text-decoration: underline;
		cursor: pointer;

		.arrows {
			color: #2f6fa7;
			font-size: 16px;
			font-weight: 700;
			text-decoration: none;
		}

		&:hover {
			color: #2f6fa7;
		}
	}

	.roomPublicInfoReport {
		margin-top: auto;
		height: 30px;
		background: linear-gradient(#c22b1c 0 50%, #a8170c 50%);
		border: 1px solid #3d0904;
		border-radius: 4px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
		color: #fff;
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		outline: none;

		&:hover {
			filter: brightness(1.1);
		}
	}
}
</style>
