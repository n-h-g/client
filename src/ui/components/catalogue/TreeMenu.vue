<template>
	<li class="treeView" v-if="catalogMenu">
		<div v-for="menu in filteredMenu()" class="catalogLi" :class="{ active: currentMenu.id == menu.id }" :key="menu.id"
			@click="openEvent(menu)">
			<div class="description">
				<span class="catalogLiIcon">
					<img :src="resourceUrl +
						menu.id +
						'.png'
						" />
				</span>
				<span class="catalogMenuLabel">{{ menu.title }}</span>
			</div>
			<ul class="menuUlCatalog" :class="{ hidden: !menu.openSubMenu }">
				<TreeMenu v-if="menu.subPages && menu.subPages.length > 0" :catalogMenu="menu.subPages"
					:currentMenu="props.currentMenu" />
			</ul>
		</div>
	</li>
</template>

<script setup lang="ts">
import { Engine } from "../../../game/Engine"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"

const props = defineProps<{
	catalogMenu: any
	currentMenu: any
}>()
const emits = defineEmits(["openPage"])

const resourceUrl = Engine.getInstance().config.catalogueResourcesUrl + "icons/"

function openEvent(menu) {
	if (menu.subPages && menu.subPages.length > 0)
		menu.openSubMenu = !menu.openSubMenu

	Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.RequestCatalogPageEvent, {
		id: menu.id
	})

	emits("openPage", menu);
}

function filteredMenu() {
	return props.catalogMenu.filter((menu) => menu.isEnabled !== -1);
}
</script>

<style lang="scss">
.treeView {
	list-style-type: none;
	pointer-events: all !important;

	.catalogLi {
		cursor: pointer;

		.description {
			border-top: 2px solid #d2d1cb;
			border-bottom: 2px solid #d2d1cb;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			width: 100%;
			justify-content: flex-start;
			align-items: center;
		}

		.description:hover {
			background-color: darken(#d2d1cb, 10%);
		}

		&.active {
			&>.description {
				color: #fff;
				background-color: #63c5e9;
				font-style: italic;
				border-top: 2px solid #82d1ed;
				border-bottom: 2px solid #82d1ed;

				&>.catalogMenuLabel {
					color: #fff;
				}
			}
		}

		.catalogLiIcon {
			width: 23px;
			height: 20px;
			display: flex;
			flex-grow: 0;
			justify-content: center;
			align-items: center;
		}

		.catalogMenuLabel {
			flex-grow: 2;
			margin: auto 0;
			padding: 0 7px;
			font-weight: 700;
			color: #565656;
		}
	}

	.menuUlCatalog {
		margin-left: 10px;
	}
}
</style>