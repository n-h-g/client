<template>
	<Dialog v-if="entry" title="Doorbell" class-name="doorbellEntryDialog" :box="UIEventsType.DOORBELL_ENTRY">
		<div class="doorbellEntry">
			<div class="doorbellEntryRoom">{{ entry.name }}</div>

			<div v-if="entry.state === 'locked'" class="doorbellEntryText">
				This room is locked. You need to ring the doorbell. If you do, you will leave the room you are in now.
			</div>
			<div v-else class="doorbellEntryText waiting">
				<span>You rang the doorbell. Waiting for someone to open the door</span><span class="doorbellEntryDots"></span>
			</div>

			<div class="doorbellEntryFooter">
				<a class="doorbellEntryCancel" @click="store.cancel()">Cancel</a>
				<button v-if="entry.state === 'locked'" class="doorbellEntryRing" @click="store.ring()">Ring</button>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { onUnmounted, shallowRef } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { DoorbellEntry, DoorbellEntryStore } from "../../../game/engine/room/DoorbellEntryStore"

const store = DoorbellEntryStore.getInstance()
const entry = shallowRef<DoorbellEntry | null>(store.current)

onUnmounted(store.subscribe(current => entry.value = current))
</script>

<style lang="scss">
#dialog.doorbellEntryDialog {
	position: absolute;
	z-index: 25;
	top: 30%;
	left: calc(50% - 160px);
	width: 320px;
	height: 170px;

	> .content {
		padding: 12px 14px 12px;
		box-sizing: border-box;
	}
}

.doorbellEntry {
	height: 100%;
	display: flex;
	flex-direction: column;
	user-select: none;
	color: #000;

	.doorbellEntryRoom {
		font-size: 13px;
		font-weight: 700;
		text-decoration: underline;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.doorbellEntryText {
		flex: 1;
		margin-top: 6px;
		font-size: 13px;
		line-height: 1.35;
	}

	// "..." that fills in while waiting
	.doorbellEntryDots::after {
		content: "";
		animation: doorbellEntryDots 1.5s steps(4, end) infinite;
	}

	.doorbellEntryFooter {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.doorbellEntryCancel {
		font-size: 13px;
		text-decoration: underline;
		cursor: pointer;

		&:hover {
			color: #1f6f2a;
		}
	}

	.doorbellEntryRing {
		min-width: 64px;
		padding: 4px 14px;
		background: linear-gradient(#fff, #e3e3e3);
		border: 2px solid #000;
		border-radius: 6px;
		box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		color: #000;
		cursor: pointer;
		outline: none;

		&:hover {
			background: linear-gradient(#fff, #f0f0f0);
		}

		&:active {
			translate: 0 1px;
		}
	}
}

@keyframes doorbellEntryDots {
	0% { content: ""; }
	25% { content: "."; }
	50% { content: ".."; }
	75% { content: "..."; }
}
</style>
