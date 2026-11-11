<template>
	<Dialog title="Doorbell" class-name="doorbellDialog" :box="UIEventsType.DOORBELL">
		<div class="doorbell">
			<div class="doorbellList">
				<div v-for="request in requests" :key="request.id" class="doorbellRow">
					<span class="doorbellHead">
						<img v-if="heads[request.look]" :src="heads[request.look]" alt="" />
					</span>
					<span class="doorbellName">{{ request.username }}</span>
					<button class="doorbellButton decline" title="Leave out" @click="answer(request.id, false)">✕</button>
					<button class="doorbellButton accept" title="Let in" @click="answer(request.id, true)">✓</button>
				</div>

				<div v-if="requests.length === 0" class="doorbellEmpty">Nobody is waiting at the door.</div>
			</div>

			<div class="doorbellFooter">
				<label class="doorbellSound">
					<input v-model="soundOn" type="checkbox" />
					<span>Sound on</span>
				</label>
				<span class="doorbellAll">All requests</span>
				<button class="doorbellButton decline" :disabled="requests.length === 0" title="Leave out everybody" @click="answerAll(false)">✕</button>
				<button class="doorbellButton accept" :disabled="requests.length === 0" title="Let in everybody" @click="answerAll(true)">✓</button>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, shallowRef, watch, ref } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { DoorbellRequest, DoorbellStore } from "../../../game/engine/room/DoorbellStore"
import { AvatarHeadImage } from "../../../game/engine/ui/imagers/avatars/AvatarHeadImage"

const store = DoorbellStore.getInstance()

const requests = shallowRef<DoorbellRequest[]>(store.current)
const heads = reactive<Record<string, string>>({})
const soundOn = ref(store.soundOn)

watch(soundOn, on => store.soundOn = on)

/** The heads of the users that rang (drawn once per look). */
function loadHeads(list: DoorbellRequest[]) {
	for (const request of list) {
		if (!request.look || heads[request.look] !== undefined) continue

		heads[request.look] = ""
		AvatarHeadImage.get(request.look).then(head => heads[request.look] = head)
	}
}

loadHeads(requests.value)
onUnmounted(store.subscribe(list => {
	requests.value = list
	loadHeads(list)
}))

function answer(id: number, accept: boolean) {
	store.answer(id, accept)
}

function answerAll(accept: boolean) {
	store.answerAll(accept)
}
</script>

<style lang="scss">
#dialog.doorbellDialog {
	position: absolute;
	z-index: 3;
	top: 120px;
	left: calc(50% - 160px);
	width: 320px;
	height: 250px;

	> .content {
		padding: 10px 10px 8px;
		box-sizing: border-box;
	}
}

.doorbell {
	height: 100%;
	display: flex;
	flex-direction: column;
	user-select: none;

	.doorbellList {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.doorbellRow {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 30px;
		padding-left: 4px;
		background: #ccd9c6;
		border-radius: 3px;
	}

	.doorbellHead {
		flex: 0 0 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		img {
			max-width: 100%;
			max-height: 100%;
		}
	}

	.doorbellName {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 13px;
		color: #000;
	}

	.doorbellEmpty {
		padding: 10px 4px;
		font-size: 12px;
		font-style: italic;
		color: #888;
	}

	.doorbellButton {
		flex: 0 0 40px;
		height: 28px;
		border: 1px solid rgba(0, 0, 0, 0.35);
		border-radius: 3px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.15);
		color: #fff;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		outline: none;

		&.decline {
			background: #d0342c;
		}

		&.accept {
			background: #2ea52a;
		}

		&:hover {
			filter: brightness(1.1);
		}

		&:active {
			translate: 0 1px;
		}

		&:disabled {
			filter: grayscale(0.8) opacity(0.6);
			cursor: default;
			translate: none;
		}
	}

	.doorbellFooter {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 4px;
		padding-top: 8px;
	}

	.doorbellSound {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: #000;
		cursor: pointer;

		input {
			width: 16px;
			height: 16px;
			margin: 0;
			accent-color: #2ea52a;
			cursor: pointer;
		}
	}

	.doorbellAll {
		margin-right: 4px;
		font-size: 13px;
		color: #c0392b;
	}
}
</style>
