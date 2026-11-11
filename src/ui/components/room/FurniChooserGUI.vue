<template>
	<Dialog title="Chooser" class-name="furniChooserDialog" :box="UIEventsType.FURNI_CHOOSER">
		<div class="furniChooser">
			<div
				v-for="furni in furniList"
				:key="furni.id"
				class="furniChooserRow"
				:title="furni.className"
				@click="select(furni.id)"
			>{{ furni.name }}</div>

			<div v-if="furniList.length === 0" class="furniChooserEmpty">No furni in this room.</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { onUnmounted, shallowRef } from "vue"
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

/** As a click on the furni in the room (its info, the double click uses it). */
function select(id: string) {
	const item = itemsOfRoom().find(entity => String(entity.id) === id)
	item?.logic?.onClick()
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
		padding: 8px;
		box-sizing: border-box;
	}
}

.furniChooser {
	height: 100%;
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
