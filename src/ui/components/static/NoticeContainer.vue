<template>
	<Dialog v-if="notice" :key="noticeId" title="Notice!" class-name="noticeDialog" :box="UIEventsType.NOTICE">
		<div class="noticeMessage">{{ notice.message }}</div>
		<div class="noticeButtons">
			<button class="noticeOk" @click="next()">Ok</button>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { EventManager } from "../../../game/core/events/EventManager"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { NoticeData } from "../../../game/engine/events/ui/data/general/NoticeData"
import { DialogEventData } from "../../../game/engine/events/ui/data/general/Dialog"

/** The notices still to read: one window at a time, Ok shows the next one. */
const queue = ref<NoticeData[]>([])
const noticeId = ref(0)
const notice = computed(() => queue.value[0])

EventManager.read(UIEvents.NOTICE, (data: NoticeData) => {
	queue.value.push(data)
})

// the close icon of the window
EventManager.read(UIEvents.CLOSE, (data: DialogEventData) => {
	if (data.type === UIEventsType.NOTICE) next()
})

function next() {
	queue.value.shift()
	noticeId.value++
}
</script>

<style lang="scss">
#dialog.noticeDialog {
	position: fixed;
	z-index: 30;
	top: 30%;
	left: calc(50% - 140px);
	width: 280px;
	/* a fixed height: the content of the Dialog is as tall as the window minus the title */
	height: 140px;

	> .content {
		display: flex;
		flex-direction: column;
		padding: 14px 16px 12px;
		box-sizing: border-box;
	}
}

.noticeDialog {
	.noticeMessage {
		flex: 1;
		font-size: 13px;
		color: #000;
		text-align: center;
		line-height: 1.4;
	}

	.noticeButtons {
		display: flex;
		justify-content: center;
		margin-top: 18px;
	}

	.noticeOk {
		min-width: 64px;
		padding: 4px 16px;
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
</style>
