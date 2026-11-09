<template>
	<Dialog title="Shop" className="catalogue" :box="UIEventsType.CATALOGUE">
		<!-- TABS: the root pages -->
		<div class="catalogueTabs">
			<div
				v-for="root in catalogMenu"
				:key="root.id"
				class="catalogueTab"
				:class="{ active: currentRoot?.id === root.id }"
				@click="selectRoot(root)"
			>
				{{ root.title }}
			</div>
		</div>

		<!-- HEADER -->
		<div class="catalogueHeader">
			<div class="catalogueHeaderIcon">
				<img v-if="currentPage?.iconName" :src="getIconUrl(currentPage.iconName)" alt="" />
			</div>
			<div class="catalogueHeaderTitle">{{ searchActive ? "La tua ricerca" : currentPage?.title ?? "" }}</div>
			<div class="catalogueHeaderWatermark">SHOP</div>
		</div>

		<div class="catalogueMain">
			<!-- MENU -->
			<div class="catalogueSide">
				<div class="catalogueSearch">
					<input v-model="search" type="text" placeholder="Cerca un furni..." />
					<span v-if="search" class="catalogueSearchClear" @click="search = ''">×</span>
				</div>

				<div class="catalogueNav">
					<TreeMenu
						v-if="search.trim()"
						:pages="searchResults"
						:currentId="currentPage?.id ?? -1"
						@openPage="openPage"
					/>
					<TreeMenu
						v-else
						:pages="currentRoot?.subPages ?? []"
						:currentId="currentPage?.id ?? -1"
						@openPage="openPage"
					/>

					<div v-if="search.trim() && searchResults.length === 0" class="catalogueNavEmpty">
						Nessuna pagina trovata
					</div>
				</div>
			</div>

			<!-- PAGE -->
			<div class="cataloguePage">
				<!-- preview of the selected item, or the page description -->
				<div class="catalogueInfo">
					<template v-if="petOffer">
						<div class="catalogueInfoPreview catalogueInfoPet">
							<img v-if="petImages[petKey(selectedRace)]" :src="petImages[petKey(selectedRace)]" alt="" />
						</div>
						<div class="catalogueInfoText">
							<div class="catalogueInfoName">{{ petTypeName(petType!) }}</div>
							<div class="catalogueInfoDescription">{{ currentPage?.description }}</div>
						</div>
					</template>
					<template v-else-if="selectedItem">
						<div
							class="catalogueInfoPreview"
							:class="{ dragging: previewDragging }"
							@pointerdown="startPreviewDrag"
							@pointermove="movePreviewDrag"
							@pointerup="stopPreviewDrag"
							@pointercancel="stopPreviewDrag"
						>
							<img
								v-if="preview"
								:src="preview"
								class="catalogueRoomPreviewImage"
								:style="{ transform: `translate(${previewPan.x}px, ${previewPan.y}px)` }"
								draggable="false"
								alt=""
							/>
							<img v-else :src="getIconUrl(selectedItem.name)" class="catalogueInfoIcon" alt="" />
						</div>
						<div class="catalogueInfoText">
							<div class="catalogueInfoName">{{ getFurniName(selectedItem.name) }}</div>
							<div class="catalogueInfoDescription">{{ getFurniDescription(selectedItem.name) }}</div>
						</div>
					</template>
					<template v-else>
						<div class="catalogueInfoPreview">
							<img src="@/assets/images/catalogue/empty_catalogue.png" alt="" />
						</div>
						<div class="catalogueInfoText">
							<div class="catalogueInfoName">{{ currentPage?.title ?? "" }}</div>
							<div class="catalogueInfoDescription">
								{{ currentPage?.description || (items.length ? "" : "Scegli una pagina dal menu.") }}
							</div>
						</div>
					</template>
				</div>

				<!-- PETS: the breeds and the name -->
				<div v-if="petOffer" class="catalogueItems cataloguePets">
					<div class="cataloguePetName">
						<label>Nome del tuo animale:</label>
						<input v-model="petName" type="text" :maxlength="PET_NAME_LENGTH" placeholder="Scegli un nome" />
					</div>
					<div class="cataloguePetBreeds">
						<div
							v-for="race in petBreeds"
							:key="race"
							class="catalogueItem catalogueBreed"
							:class="{ selected: selectedRace === race }"
							@click="selectedRace = race"
						>
							<span class="catalogueItemIcon">
								<img v-if="petImages[petKey(race)]" :src="petImages[petKey(race)]" alt="" />
							</span>
						</div>
					</div>
				</div>

				<!-- ITEMS (of the page, or found by the search) -->
				<div v-else class="catalogueItems">
					<div v-if="searchActive && displayItems.length === 0" class="catalogueNavEmpty">
						Nessun furni trovato
					</div>
					<div
						v-for="item in displayItems"
						:key="item.id"
						class="catalogueItem"
						:class="{ selected: selectedItem?.id === item.id }"
						:title="getFurniName(item.name)"
						@click="selectItem(item)"
					>
						<span class="catalogueItemIcon">
							<img :src="getIconUrl(item.name)" loading="lazy" alt="" />
						</span>
						<span class="catalogueItemPrice">
							{{ item.credits }}
							<img src="@/assets/images/catalogue/creditIcon.png" alt="" />
						</span>
						<span v-if="item.amount > 1" class="catalogueItemAmount">x{{ item.amount }}</span>
					</div>
				</div>

				<!-- BUY -->
				<div
					class="catalogueBuy"
					:class="{ disabled: petOffer ? !petNameValid : !selectedItem, bought: justBought }"
					@click="petOffer ? buyPet() : buyItem()"
				>
					<template v-if="justBought">Acquistato! È nel tuo inventario</template>
					<template v-else-if="petOffer">
						<template v-if="petNameValid">
							Compra per {{ petOffer.credits }}
							<img src="@/assets/images/catalogue/creditIcon.png" alt="" />
						</template>
						<template v-else>Scegli un nome!</template>
					</template>
					<template v-else-if="selectedItem">
						Compra per {{ selectedItem.credits }}
						<img src="@/assets/images/catalogue/creditIcon.png" alt="" />
					</template>
					<template v-else>Seleziona un oggetto!</template>
				</div>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue"
import { CataloguePageItem } from "../../../game/core/communication/incoming/catalogue/CataloguePageItem"
import { EventManager } from "../../../game/core/events/EventManager"
import { Engine } from "../../../game/Engine"
import { CataloguePageData } from "../../../game/engine/events/ui/data/catalogue/CataloguePageData"
import { CataloguePagesData } from "../../../game/engine/events/ui/data/catalogue/CataloguePagesData"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import { FurniPreview } from "../../../game/engine/ui/imagers/items/utils/FurniPreview"
import Dialog from "../dialog/Dialog.vue"
import TreeMenu from "./TreeMenu.vue"
import { PetFigureData } from "../../../game/engine/ui/imagers/pets/PetFigureData"
import { petOfferType, petTypeName } from "../../../game/engine/ui/imagers/pets/PetType"

const catalogMenu = ref<any[]>([])
const allPages = ref<any[]>([])
const currentRoot = ref<any | null>(null)
const currentPage = ref<any | null>(null)
const items = ref<CataloguePageItem[]>([])
const selectedItem = ref<CataloguePageItem | null>(null)
const preview = ref("")
const previewPan = ref({ x: 0, y: 0 })
const previewDragging = ref(false)
let previewDragStart = { pointerX: 0, pointerY: 0, panX: 0, panY: 0 }
const search = ref("")
const justBought = ref(false)
let justBoughtTimer: ReturnType<typeof setTimeout> | undefined
let previewAnimationTimer: ReturnType<typeof setInterval> | undefined

// =========================
// SEARCH (as Habbo: the furni, not only the pages)
// =========================
/** The furni found by the last search, null when the catalogue shows a page. */
const searchItems = ref<CataloguePageItem[] | null>(null)
const searchActive = computed(() => searchItems.value !== null)
const displayItems = computed(() => searchItems.value ?? items.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, value => {
	clearTimeout(searchTimer)
	const text = value.trim().toLowerCase()

	if (text.length < 2) {
		searchItems.value = null
		return
	}

	// asked when the user stops typing
	searchTimer = setTimeout(() => {
		Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.CatalogSearchEvent, {
			query: text,
			names: namesMatching(text),
		})
	}, 300)
})

// only the answer of the last search (an older one can arrive later)
EventManager.read(UIEvents.CATALOG_SEARCH_RESULTS, (data: { query: string; items: CataloguePageItem[] }) => {
	if (data.query !== search.value.trim().toLowerCase()) return

	stopPreviewAnimation()
	searchItems.value = data.items ?? []
	selectedItem.value = null
	preview.value = ""
})

/** The class names whose name in the FurnitureData contains the text (the server searches the class names). */
function namesMatching(text: string): string[] {
	getFurniData("")
	const names: string[] = []

	for (const [className, data] of furnidataByClassName ?? []) {
		if (String(data?.name ?? "").toLowerCase().includes(text) && !className.toLowerCase().includes(text)) {
			names.push(className)
			if (names.length >= 300) break
		}
	}
	return names
}

// =========================
// PETS (the pages with layout "pets": the breed and the name, as Habbo)
// =========================
const PET_NAME_LENGTH = 15
const petName = ref("")
const selectedRace = ref(0)
/** The images of the breeds of the page, by figure. */
const petImages = reactive<Record<string, string>>({})

const petOffer = computed(() =>
	!searchActive.value && currentPage.value?.layout === "pets"
		? items.value.find(item => petOfferType(item.name) != null) ?? null
		: null
)
const petType = computed(() => petOfferType(petOffer.value?.name))
/** The races the offer sells (its extraData, "0,1,2"). */
const petBreeds = computed(() =>
	String(petOffer.value?.extraData ?? "0")
		.split(",")
		.map(value => parseInt(value))
		.filter(value => !isNaN(value))
)
const petNameValid = computed(() => /^[\p{L}\p{N} ._-]{1,15}$/u.test(petName.value.trim()))

function petKey(race: number): string {
	return PetFigureData.from(petType.value ?? 0, race, "ffffff").figureString
}

watch(petOffer, offer => {
	if (!offer) return

	selectedRace.value = petBreeds.value[0] ?? 0

	const imager = Engine.getInstance()?.userInterfaceManager?.petImager
	for (const race of petBreeds.value) {
		const key = petKey(race)
		if (!imager || petImages[key] !== undefined) continue

		petImages[key] = ""
		imager.getImage(key).then(image => {
			if (image) petImages[key] = image
			else delete petImages[key]
		})
	}
})

function buyPet() {
	if (!petOffer.value || !petNameValid.value) return

	Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.CatalogBuyItemEvent, {
		id: petOffer.value.id,
		pageId: currentPage.value?.id,
		petName: petName.value.trim(),
		race: selectedRace.value,
	})
}

function stopPreviewAnimation() {
	if (previewAnimationTimer) clearInterval(previewAnimationTimer)
	previewAnimationTimer = undefined
}

onBeforeUnmount(() => {
	stopPreviewAnimation()
	clearTimeout(justBoughtTimer)
	clearTimeout(searchTimer)
})

// purchase confirmed by the server: short feedback on the buy button
EventManager.read(UIEvents.CATALOG_ITEM_BOUGHT, () => {
	// a pet bought: the next one needs its own name
	if (petOffer.value) petName.value = ""
	justBought.value = true
	clearTimeout(justBoughtTimer)
	justBoughtTimer = setTimeout(() => (justBought.value = false), 2000)
})

// =========================
// PAGES
// =========================
// the server sends all the pages as a flat list (each one with its parentId): it becomes the menu tree
EventManager.read(UIEvents.CATALOGUE_PAGES_UPDATED, (data: CataloguePagesData) => {
	catalogMenu.value = buildPagesTree(data.pages ?? [])

	if (!currentRoot.value && catalogMenu.value.length > 0) selectRoot(catalogMenu.value[0])
})

function buildPagesTree(pages: any[]): any[] {
	const nodes = new Map<number, any>()

	for (const page of pages) {
		nodes.set(page.id, { ...page, subPages: [], openSubMenu: false })
	}

	const roots: any[] = []

	for (const node of nodes.values()) {
		const parent = node.parentId != null && node.parentId !== -1 ? nodes.get(node.parentId) : null

		if (parent) parent.subPages.push(node)
		else roots.push(node)
	}

	const sortPages = (list: any[]) => {
		list.sort((a, b) => a.sequence - b.sequence || a.id - b.id)
		list.forEach(node => sortPages(node.subPages))
	}

	sortPages(roots)
	allPages.value = Array.from(nodes.values())

	return roots
}

// the pages whose title contains the searched text, in all the tabs (shown as a flat list)
const searchResults = computed(() => {
	const text = search.value.trim().toLowerCase()
	if (!text) return []

	return allPages.value
		.filter(page => page.parentId !== -1 && page.title?.toLowerCase().includes(text))
		.slice(0, 100)
		.map(page => ({ ...page, subPages: [] }))
})

function selectRoot(root: any) {
	currentRoot.value = root
	search.value = ""
	openPage(root)
}

function openPage(page: any) {
	stopPreviewAnimation()
	// a page opened from the menu: the search results go away (the text stays to find the other pages)
	searchItems.value = null
	clearTimeout(searchTimer)
	currentPage.value = page
	items.value = []
	selectedItem.value = null
	preview.value = ""

	Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RequestCatalogPageEvent, {
		id: page.id,
	})
}

// =========================
// ITEMS
// =========================
// the server sends all the items of the opened page: they replace the ones of the previous page
EventManager.read(UIEvents.CATALOG_ITEMS_UPDATED, (data: CataloguePageData) => {
	stopPreviewAnimation()
	items.value = data.items ?? []
	selectedItem.value = null
	preview.value = ""
})

// Nitro icons: <name>_icon.png, the color after an underscore (chair_plasto*2 -> chair_plasto_2_icon.png)
function getIconUrl(name: string): string {
	return Engine.getInstance()?.config?.itemsIconsUrl + name.replace("*", "_") + "_icon.png"
}

// name and description of the furni from the furnidata (the catalogue only has the class name),
// indexed once: a page can have more than a thousand items
let furnidataByClassName: Map<string, any> | null = null

function getFurniData(className: string): any {
	if (!furnidataByClassName) {
		const furnidata = Engine.getInstance()?.userInterfaceManager?.furniImager?.getFurnidata()
		if (!furnidata) return null

		furnidataByClassName = new Map()
		for (const list of [furnidata.floorItems, furnidata.wallItems]) {
			for (const id in list) furnidataByClassName.set(list[id].className, list[id])
		}
	}

	return furnidataByClassName.get(className) ?? null
}

function getFurniName(className: string): string {
	return getFurniData(className)?.name || className
}

function getFurniDescription(className: string): string {
	return getFurniData(className)?.description || ""
}

async function selectItem(item: CataloguePageItem) {
	stopPreviewAnimation()
	selectedItem.value = item
	preview.value = ""
	previewPan.value = { x: 0, y: 0 }

	// Render the offer in a room: decoration offers recolor the walls/floor,
	// while regular furni is placed in the room. The icon stays as a fallback.
	try {
		const result = await FurniPreview.renderRoom(item.name, item.extraData)

		if (result && selectedItem.value?.id === item.id) {
			preview.value = result.image
			previewPan.value = {
				x: result.width / 2 - result.focusX,
				y: result.height / 2 - result.focusY,
			}
			if (result.frames && result.frames.length > 1) {
				let frameIndex = 1
				previewAnimationTimer = setInterval(() => {
					preview.value = result.frames![frameIndex]
					frameIndex = (frameIndex + 1) % result.frames!.length
				}, 140)
			}
		}
	} catch (e) {
		// no render: the icon stays
	}
}

function startPreviewDrag(event: PointerEvent) {
	if (!preview.value) return
	previewDragging.value = true
	previewDragStart = {
		pointerX: event.clientX,
		pointerY: event.clientY,
		panX: previewPan.value.x,
		panY: previewPan.value.y,
	}
	;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function movePreviewDrag(event: PointerEvent) {
	if (!previewDragging.value) return
	previewPan.value = {
		x: previewDragStart.panX + event.clientX - previewDragStart.pointerX,
		y: previewDragStart.panY + event.clientY - previewDragStart.pointerY,
	}
}

function stopPreviewDrag() {
	previewDragging.value = false
}

// =========================
// BUY
// =========================
function buyItem() {
	if (!selectedItem.value) return

	Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.CatalogBuyItemEvent, {
		id: selectedItem.value.id,
		pageId: currentPage.value?.id,
	})
}

// =========================
// INIT
// =========================
Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.CatalogPagesListEvent)
</script>

<style lang="scss">
.catalogue {
	position: absolute;
	z-index: 2;
	margin-top: 28px;
	width: 840px;
	height: 700px;
	max-width: calc(100vw - 24px);
	max-height: calc(100vh - 24px);

	.content {
		display: flex;
		flex-direction: column;
		padding: 6px 6px 6px 6px;
		box-sizing: border-box;
	}

	// ---------------- tabs
	.catalogueTabs {
		display: flex;
		gap: 2px;
		flex: 0 0 auto;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: thin;
	}

	.catalogueTab {
		flex: 0 0 auto;
		padding: 5px 14px;
		font-size: 13px;
		font-weight: 700;
		color: #333;
		background: linear-gradient(#f4f4f4, #d6d6d6);
		border: 1px solid #8f8f8f;
		border-bottom: none;
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		white-space: nowrap;
		user-select: none;

		&:hover {
			background: linear-gradient(#fff, #e4e4e4);
		}

		&.active {
			background: #fff;
			color: #000;
			position: relative;
			top: 1px;
		}
	}

	// ---------------- header
	.catalogueHeader {
		flex: 0 0 64px;
		position: relative;
		display: flex;
		align-items: center;
		overflow: hidden;
		background: linear-gradient(#245f75, #174656);
		border: 1px solid #0d3341;
		border-radius: 0 6px 6px 6px;
		color: #fff;
	}

	.catalogueHeaderIcon {
		flex: 0 0 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;

		img {
			max-width: 48px;
			max-height: 48px;
			image-rendering: pixelated;
		}
	}

	.catalogueHeaderTitle {
		z-index: 1;
		font-size: 18px;
		font-weight: 700;
		text-transform: uppercase;
		text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-right: 12px;
	}

	.catalogueHeaderWatermark {
		position: absolute;
		right: 24px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 44px;
		font-weight: 700;
		letter-spacing: 14px;
		color: rgba(255, 255, 255, 0.08);
		pointer-events: none;
	}

	// ---------------- main area
	.catalogueMain {
		flex: 1;
		min-height: 0;
		display: flex;
		gap: 6px;
		margin-top: 6px;
	}

	.catalogueSide {
		flex: 0 0 190px;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.catalogueSearch {
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
	}

	.catalogueSearchClear {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		font-weight: 700;
		color: #777;
	}

	.catalogueNav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 3px;
		background-color: #d2d1cb;
		border: 1px solid #808080;
		border-radius: 6px;
		box-shadow: inset 0 0 0 2px #fff;
	}

	.catalogueNavEmpty {
		padding: 8px;
		color: #666;
		font-size: 12px;
		text-align: center;
	}

	// ---------------- page
	.cataloguePage {
		flex: 1;
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		color: #000;
	}

	.catalogueInfo {
		flex: 0 0 290px;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px;
		background: #fff;
		border: 1px solid #b5b5b0;
		border-radius: 6px;
		overflow: hidden;
	}

	.catalogueInfoPreview {
		flex: 0 0 350px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		background: #c8c8c8;
		cursor: grab;
		touch-action: none;

		&.dragging {
			cursor: grabbing;
		}

		img {
			max-width: 100%;
			max-height: 100%;
			image-rendering: pixelated;
		}

		.catalogueRoomPreviewImage {
			width: auto;
			height: auto;
			max-width: none;
			max-height: none;
			flex: none;
			image-rendering: auto;
			user-select: none;
		}

		.catalogueInfoIcon {
			transform: scale(2);
		}
	}

	.catalogueInfoText {
		flex: 1;
		min-width: 0;
		align-self: stretch;
		overflow-y: auto;
	}

	.catalogueInfoName {
		font-size: 14px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.catalogueInfoDescription {
		font-size: 12px;
		color: #444;
	}

	.catalogueItems {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		gap: 2px;
		padding: 4px;
		background-color: #d2d1cb;
		border: 1px solid #757571;
		border-radius: 6px;
		box-shadow: inset 0 0 0 2px #fff;
	}

	.catalogueItem {
		position: relative;
		width: 52px;
		height: 58px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 2px solid transparent;
		border-radius: 6px;
		cursor: pointer;

		&:hover {
			background-color: rgba(255, 255, 255, 0.5);
		}

		&.selected {
			border-color: #62c4e8;
			background-color: #fff;
		}
	}

	.catalogueItemIcon {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		img {
			max-width: 44px;
			max-height: 36px;
			image-rendering: auto;
		}
	}

	.catalogueItemPrice {
		font-size: 11px;
		font-weight: 700;

		img {
			vertical-align: middle;
		}
	}

	.catalogueItemAmount {
		position: absolute;
		top: 1px;
		left: 3px;
		font-size: 10px;
		font-weight: 700;
		color: #555;
	}

	// ---------------- pets
	.catalogueInfoPet {
		cursor: default;

		img {
			transform: scale(2);
		}
	}

	.cataloguePets {
		flex-direction: column;
		flex-wrap: nowrap;
		gap: 6px;
	}

	.cataloguePetName {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 700;

		input {
			flex: 1;
			padding: 3px 6px;
			border: 1px solid #757571;
			border-radius: 4px;
		}
	}

	.cataloguePetBreeds {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
	}

	.catalogueBreed {
		height: 52px;

		img {
			image-rendering: pixelated;
		}
	}

	// ---------------- buy
	.catalogueBuy {
		flex: 0 0 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-size: 14px;
		font-weight: 700;
		color: #fff;
		text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
		background-color: #58d63e;
		border: 1px solid #000;
		border-radius: 5px;
		box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.2), inset 2px 2px 0 rgba(255, 255, 255, 0.4);
		cursor: pointer;
		user-select: none;

		&:hover {
			background-color: #65e84a;
		}

		&:active {
			box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2);
		}

		&.bought {
			background-color: #3fa9d6;
		}

		&.disabled {
			cursor: default;
			color: #555;
			text-shadow: none;
			background-color: #dcdcd6;
			border-color: #9a9a95;
			box-shadow: inset 0 0 0 2px #fff;
		}
	}
}
</style>
