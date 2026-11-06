<template>
	<ul class="catalogTree">
		<li v-for="page in pages" :key="page.id">
			<div
				class="catalogTreeRow"
				:class="{ active: currentId === page.id, open: page.openSubMenu }"
				:style="{ paddingLeft: 4 + depth * 12 + 'px' }"
				@click.stop="openPage(page)"
			>
				<span class="catalogTreeIcon">
					<img v-if="page.iconName" :src="getPageIconUrl(page)" loading="lazy" alt="" />
				</span>

				<span class="catalogTreeLabel">{{ page.title }}</span>

				<span v-if="hasSubPages(page)" class="catalogTreeArrow"></span>
			</div>

			<!-- the sub pages, shown when the page is open; their clicks are forwarded up to the catalogue -->
			<TreeMenu
				v-if="hasSubPages(page) && page.openSubMenu"
				:pages="page.subPages"
				:currentId="currentId"
				:depth="depth + 1"
				@openPage="(subPage) => emits('openPage', subPage)"
			/>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { Engine } from "../../../game/Engine"

const props = withDefaults(
	defineProps<{
		pages: any[]
		currentId: number
		depth?: number
	}>(),
	{ depth: 0 }
)

const emits = defineEmits(["openPage"])

function hasSubPages(page: any): boolean {
	return page.subPages && page.subPages.length > 0
}

// the page icon is the icon of one of its furni (the catalogue icons are not in the Nitro assets)
function getPageIconUrl(page: any): string {
	return Engine.getInstance().config.itemsIconsUrl + page.iconName.replace("*", "_") + "_icon.png"
}

function openPage(page: any) {
	// a folder opens/closes its sub pages; the page itself is opened anyway (it can have items)
	if (hasSubPages(page)) page.openSubMenu = !page.openSubMenu

	emits("openPage", page)
}
</script>

<style lang="scss" scoped>
.catalogTree {
	list-style: none;
	margin: 0;
	padding: 0;
}

.catalogTreeRow {
	display: flex;
	align-items: center;
	height: 22px;
	padding-right: 4px;
	margin-bottom: 1px;
	cursor: pointer;
	background-color: #fff;
	border-radius: 3px;
	user-select: none;

	&:hover {
		background-color: #e3f3fa;
	}

	&.active {
		background-color: #63c5e9;

		.catalogTreeLabel {
			color: #fff;
		}

		.catalogTreeArrow {
			border-left-color: #fff;
		}
	}

	&.open > .catalogTreeArrow {
		transform: rotate(90deg);
	}
}

.catalogTreeIcon {
	flex: 0 0 20px;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	img {
		max-width: 20px;
		max-height: 20px;
		image-rendering: pixelated;
	}
}

.catalogTreeLabel {
	flex: 1;
	min-width: 0;
	padding-left: 5px;
	font-size: 12px;
	font-weight: 700;
	color: #4a4a4a;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.catalogTreeArrow {
	flex: 0 0 auto;
	width: 0;
	height: 0;
	margin-left: 4px;
	border-top: 4px solid transparent;
	border-bottom: 4px solid transparent;
	border-left: 5px solid #8a8a8a;
	transition: transform 0.1s;
}
</style>
