<template>
	<Dialog title="Chooser" class-name="furniChooserDialog" :box="UIEventsType.FURNI_CHOOSER">
		<div class="furniChooserSearch">
			<input v-model="search" type="text" placeholder="Search..." />
			<span v-if="search" class="furniChooserSearchClear" @click="search = ''">×</span>
		</div>

		<div class="furniChooser">
			<div
				v-for="furni in shownList"
				:key="furni.id"
				class="furniChooserRow"
				:title="furni.className"
				@click="select(furni.id)"
			>{{ furni.name }}</div>

			<div v-if="furniList.length === 0" class="furniChooserEmpty">No furni in this room.</div>
			<div v-else-if="shownList.length === 0" class="furniChooserEmpty">No furni found.</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { Engine } from "../../../game/Engine"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { Item } from "../../../game/engine/room/objects/items/Item"

interface ChooserFurni {
	id: string
	name: string
	className: string
}

/** The furni of the room, by name (as Habbo's :furni). */
const furniList = shallowRef<ChooserFurni[]>([])

/** The text of the search: the furni whose name or class name contains it. */
const search = ref("")

const shownList = computed(() => {
	const text = search.value.trim().toLowerCase()
	if (!text) return furniList.value

	return furniList.value.filter(furni =>
		furni.name.toLowerCase().includes(text) || furni.className.toLowerCase().includes(text))
})

// the names of the furnidata (the items have the class name), indexed once
let furniNames: Map<string, string> | null = null

function furniName(className: string): string {
	if (!furniNames) {
		const furnidata = Engine.getInstance()?.userInterfaceManager?.furniImager?.getFurnidata()
		if (!furnidata) return className

		furniNames = new Map()
		for (const list of [furnidata.floorItems, furnidata.wallItems]) {
			for (const id in list) furniNames.set(list[id].className, list[id].name || list[id].className)
		}
	}

	return furniNames.get(className) ?? className
}

function itemsOfRoom(): Item[] {
	const entities = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository.getAll()
	if (!entities) return []

	return Array.from(entities.values()).filter((entity): entity is Item => entity instanceof Item)
}

/** The list again (furni placed, picked up, another room): only when it changed. */
function refresh() {
	const list = itemsOfRoom()
		.map(item => ({ id: String(item.id), name: furniName(item.name), className: item.name }))
		.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id, undefined, { numeric: true }))

	const current = furniList.value
	const changed = list.length !== current.length || list.some((furni, index) => furni.id !== current[index].id)
	if (changed) furniList.value = list
}

refresh()
const refreshTimer = setInterval(refresh, 1000)
onUnmounted(() => clearInterval(refreshTimer))

/**
 * Selects the furni: its info (the infostand), as Habbo's chooser. Not its click: e.g. a billboard would open its
 * link, a room background can't be clicked by who doesn't own the room.
 */
function select(id: string) {
	const item = itemsOfRoom().find(entity => String(entity.id) === id)
	item?.logic?.togglePreview()
}
</script>

<style lang="scss">
#dialog.furniChooserDialog {
	position: absolute;
	z-index: 3;
	top: 60px;
	left: 12px;
	width: 220px;
	height: 260px;

	> .content {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 8px;
		box-sizing: border-box;
	}
}

.furniChooserSearch {
	flex: 0 0 auto;
	position: relative;

	input {
		width: 100%;
		box-sizing: border-box;
		height: 24px;
		padding: 0 22px 0 6px;
		border: 1px solid #8f8f8f;
		border-radius: 4px;
		font-size: 12px;
		background: #fff;
		outline: none;

		&:focus {
			border-color: #63c5e9;
		}
	}

	.furniChooserSearchClear {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		font-weight: 700;
		color: #777;
	}
}

.furniChooser {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	background: #fff;
	border: 1px solid #b9b9b9;
	user-select: none;

	.furniChooserRow {
		padding: 3px 6px;
		font-size: 12px;
		color: #000;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: pointer;

		&:nth-child(odd) {
			background: #ececec;
		}

		&:hover {
			background: #d6e7f3;
		}
	}

	.furniChooserEmpty {
		padding: 8px 6px;
		font-size: 12px;
		font-style: italic;
		color: #888;
	}
}
</style>
