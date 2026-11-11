<template>
	<Dialog title="Navigator" class-name="navigator" :box="UIEventsType.NAVIGATOR">
		<!-- TABS -->
		<div class="navigatorTabs">
			<div class="navigatorRefresh" title="Refresh" @click="refresh()">
				<span>⚡</span>
			</div>
			<div
				v-for="tab in tabs"
				:key="tab.id"
				class="navigatorTab"
				:class="{ active: currentTab === tab.id }"
				@click="changeTab(tab.id)"
			>
				{{ tab.label }}
			</div>
		</div>

		<div class="navigatorBody">
			<!-- SEARCH -->
			<div class="navigatorSearch">
				<select v-model="filterType" class="navigatorFilterType">
					<option value="anything">Anything</option>
					<option value="name">Room name</option>
					<option value="owner">Owner</option>
				</select>
				<div class="navigatorFilter">
					<input v-model="filter" type="text" placeholder="filter rooms by..." />
					<span v-if="filter" class="navigatorFilterClear" @click="filter = ''">×</span>
					<span v-else class="navigatorFilterIcon">✎</span>
				</div>
			</div>

			<!-- CATEGORIES -->
			<div class="navigatorList">
				<div v-for="category in categories" :key="category.id" class="navigatorCategory">
					<div class="navigatorCategoryHeader" @click="toggleCategory(category.id)">
						<span class="navigatorCategoryToggle">{{ isOpen(category.id) ? "−" : "+" }}</span>
						<span class="navigatorCategoryTitle">{{ category.title }}</span>
						<span v-if="category.rooms.length" class="navigatorCategoryCount">{{ category.rooms.length }}</span>
					</div>

					<div v-if="isOpen(category.id)" class="navigatorCategoryRooms">
						<div
							v-for="room in category.rooms"
							:key="room.id"
							class="navigatorRoom"
							@click="enterRoom(room.id)"
						>
							<span
								class="navigatorRoomUsers"
								:class="{ busy: room.users_count > 0 }"
							>{{ room.users_count }}</span>
							<span class="navigatorRoomName">{{ room.name }}</span>
							<span v-if="room.owner_name" class="navigatorRoomOwner">{{ room.owner_name }}</span>
						</div>

						<div v-if="category.rooms.length === 0" class="navigatorEmpty">
							{{ filter.trim() ? "No rooms match your search." : category.empty }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- FOOTER -->
		<div class="navigatorFooter">
			<div class="navigatorBigButton navigatorCreateRoom" @click="createRoom()">
				<span class="navigatorBigButtonIcon">
					<img src="@/assets/images/navigator/create_room.png" alt="" />
				</span>
				<span class="navigatorBigButtonLabel">Create Room</span>
			</div>
			<div class="navigatorBigButton navigatorSomewhereNew" @click="somewhereNew()">
				<span class="navigatorBigButtonIcon">?</span>
				<span class="navigatorBigButtonLabel">Somewhere new</span>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef } from "vue"
import { Engine } from "../../../game/Engine"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import Dialog from '../dialog/Dialog.vue'
import { NavigatorRoomsEventData } from "../../../game/engine/events/ui/data/navigator/NavigatorRooms"
import { NavigatorRoom } from "../../../game/core/communication/incoming/navigator/NavigatorRoom"
import { NavigatorRoomType } from "../../../game/core/communication/incoming/navigator/NavigatorRoomType"
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import { EventManager } from "../../../game/core/events/EventManager"
import { FriendsStore } from "../../../game/engine/friends/FriendsStore"

type TabId = "public" | "all" | "events" | "my"
type FilterType = "anything" | "name" | "owner"

interface Category {
	id: string
	title: string
	rooms: NavigatorRoom[]
	/** The text shown when the open category has no rooms. */
	empty: string
}

const tabs: { id: TabId; label: string }[] = [
	{ id: "public", label: "Public" },
	{ id: "all", label: "All Rooms" },
	{ id: "events", label: "Events" },
	{ id: "my", label: "My World" },
]

/** How many rooms the "New" category shows. */
const NEW_ROOMS_COUNT = 10

const currentTab = ref<TabId>("public")
const filter = ref("")
const filterType = ref<FilterType>("anything")

const allRooms = shallowRef<NavigatorRoom[]>([])
const myRooms = shallowRef<NavigatorRoom[]>([])
const friendIds = shallowRef<Set<number>>(friendIdsOf())

/** The categories opened by the user, for each tab (the ones in the list are open by default). */
const opened = ref<Record<TabId, Set<string>>>({
	public: new Set(),
	all: new Set(["popular"]),
	events: new Set(["events"]),
	my: new Set(["myRooms"]),
})

/** "Somewhere new" was clicked before the list of all the rooms arrived. */
let pendingRandomRoom = false

function friendIdsOf(): Set<number> {
	return new Set(FriendsStore.getInstance().current.friends.map(friend => friend.id))
}

function onRooms(event: NavigatorRoomsEventData) {
	if (event.tab === NavigatorRoomType.MY) {
		myRooms.value = event.rooms
		return
	}

	allRooms.value = event.rooms

	if (pendingRandomRoom) {
		pendingRandomRoom = false
		enterRandomRoom()
	}
}

EventManager.read(UIEvents.NAVIGATOR_ROOMS_ADDED, onRooms)
onUnmounted(() => EventManager.off(UIEvents.NAVIGATOR_ROOMS_ADDED, onRooms))
onUnmounted(FriendsStore.getInstance().subscribe(() => friendIds.value = friendIdsOf()))

function matches(room: NavigatorRoom): boolean {
	const text = filter.value.trim().toLowerCase()
	if (!text) return true

	const name = room.name.toLowerCase().includes(text)
	const owner = (room.owner_name ?? "").toLowerCase().includes(text)

	switch (filterType.value) {
		case "name": return name
		case "owner": return owner
		default: return name || owner
	}
}

const byUsers = (a: NavigatorRoom, b: NavigatorRoom) => b.users_count - a.users_count || a.name.localeCompare(b.name)

const categories = computed<Category[]>(() => {
	const all = allRooms.value.filter(matches)
	const my = myRooms.value.filter(matches)

	switch (currentTab.value) {
		case "public":
			return [
				{
					id: "new",
					title: "New",
					rooms: [...all].sort((a, b) => b.id - a.id).slice(0, NEW_ROOMS_COUNT),
					empty: "No new rooms.",
				},
				{ id: "official", title: "Official Rooms", rooms: [], empty: "No official rooms yet." },
				{ id: "bundles", title: "Room Bundles", rooms: [], empty: "No room bundles yet." },
				{ id: "games", title: "Games", rooms: [], empty: "No game rooms yet." },
				{ id: "fansites", title: "Our Fansites", rooms: [], empty: "No fansites yet." },
				{ id: "help", title: "Help & Safety", rooms: [], empty: "No help rooms yet." },
			]
		case "all":
			return [
				{
					id: "popular",
					title: "Popular Rooms",
					rooms: all.filter(room => room.users_count > 0).sort(byUsers),
					empty: "Nobody is in a room right now.",
				},
				{
					id: "all",
					title: "All Rooms",
					rooms: [...all].sort(byUsers),
					empty: "There are no rooms.",
				},
			]
		case "events":
			return [{ id: "events", title: "Events", rooms: [], empty: "There are no events right now." }]
		case "my":
			return [
				{ id: "myRooms", title: "My Rooms", rooms: [...my].sort(byUsers), empty: "You don't have any room yet." },
				{
					id: "friendsRooms",
					title: "My Friends' Rooms",
					rooms: all.filter(room => room.owner_id != null && friendIds.value.has(room.owner_id)).sort(byUsers),
					empty: "Your friends have no open rooms.",
				},
			]
	}
})

function isOpen(id: string): boolean {
	// while searching, show every room that matches
	return filter.value.trim() !== "" || opened.value[currentTab.value].has(id)
}

function toggleCategory(id: string) {
	const set = opened.value[currentTab.value]
	set.has(id) ? set.delete(id) : set.add(id)
}

function send(packet: OutgoingPacket) {
	Engine.getInstance()?.networkingManager?.packetManager.applyOut(packet)
}

/** Asks the server the rooms of the current tab. */
function refresh() {
	send(OutgoingPacket.NavigatorAllRooms)
	if (currentTab.value === "my") send(OutgoingPacket.NavigatorMyRooms)
}

function changeTab(tab: TabId) {
	currentTab.value = tab
	refresh()
}

function hide() {
	Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.NavigatorUI).hide()
}

function enterRoom(roomId: number) {
	hide()
	Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserEnterRoom, {
		id: roomId
	})
}

function createRoom() {
	Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.CreateRoomUI).toggle()
}

function enterRandomRoom() {
	const rooms = allRooms.value
	if (rooms.length === 0) return

	enterRoom(rooms[Math.floor(Math.random() * rooms.length)].id)
}

/** Enters a random room, with a fresh list of the rooms. */
function somewhereNew() {
	pendingRandomRoom = true
	send(OutgoingPacket.NavigatorAllRooms)
}

refresh()
</script>

<style lang="scss">
.navigator {
	position: absolute;
	z-index: 2;
	width: 410px;
	height: 500px;
	max-width: calc(100vw - 24px);
	max-height: calc(100vh - 24px);

	&#dialog > .content {
		display: flex;
		flex-direction: column;
		padding: 8px 6px 6px 6px;
		box-sizing: border-box;
		user-select: none;
	}

	// ---------------- tabs
	.navigatorTabs {
		flex: 0 0 auto;
		display: flex;
		align-items: flex-end;
		gap: 2px;
		padding-left: 2px;
		border-bottom: 1px solid #8f8f8f;
	}

	.navigatorRefresh {
		flex: 0 0 22px;
		height: 22px;
		margin: 0 6px 4px 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		background: linear-gradient(#ffc93d, #f29b00);
		border: 1px solid #c77a00;
		color: #fff;
		font-size: 13px;
		cursor: pointer;

		&:hover {
			filter: brightness(1.08);
		}
	}

	.navigatorTab {
		flex: 1 1 0;
		padding: 6px 4px;
		text-align: center;
		font-size: 13px;
		color: #333;
		background: linear-gradient(#e8e8e8, #c9c9c9);
		border: 1px solid #8f8f8f;
		border-bottom: none;
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		white-space: nowrap;

		&:hover {
			background: linear-gradient(#f4f4f4, #d6d6d6);
		}

		&.active {
			background: #fff;
			color: #000;
			border-color: #000;
			border-width: 2px 2px 0 2px;
			margin-bottom: -1px;
			padding-bottom: 7px;
		}
	}

	// ---------------- body
	.navigatorBody {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 10px;
	}

	.navigatorSearch {
		flex: 0 0 auto;
		display: flex;
		gap: 10px;
	}

	.navigatorFilterType {
		flex: 0 0 118px;
		height: 24px;
		padding: 0 4px;
		border: 1px solid #000;
		border-radius: 4px;
		background: #fff;
		font-size: 11px;
		outline: none;
		cursor: pointer;
	}

	.navigatorFilter {
		flex: 1;
		position: relative;

		input {
			width: 100%;
			box-sizing: border-box;
			height: 24px;
			padding: 0 24px 0 8px;
			border: 1px solid #000;
			border-radius: 12px;
			background: #fff;
			font-size: 12px;
			font-style: italic;
			outline: none;

			&:focus {
				border-color: #1e7cb0;
				font-style: normal;
			}
		}
	}

	.navigatorFilterIcon,
	.navigatorFilterClear {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 14px;
		line-height: 1;
	}

	.navigatorFilterIcon {
		color: #d29a00;
		pointer-events: none;
	}

	.navigatorFilterClear {
		color: #777;
		font-weight: 700;
		cursor: pointer;
	}

	// ---------------- categories
	.navigatorList {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		padding-right: 2px;
	}

	.navigatorCategory {
		margin-bottom: 4px;
	}

	.navigatorCategoryHeader {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 26px;
		padding: 0 6px;
		background: #fff;
		color: #1b4c6b;
		font-size: 14px;
		cursor: pointer;

		&:hover {
			background: #f3f8fb;
		}
	}

	.navigatorCategoryToggle {
		flex: 0 0 12px;
		color: #63b6d9;
		font-size: 17px;
		font-weight: 700;
		text-align: center;
	}

	.navigatorCategoryTitle {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.navigatorCategoryCount {
		font-size: 11px;
		color: #888;
	}

	.navigatorCategoryRooms {
		background: #fff;
		border-top: 1px solid #e3e3e3;
	}

	.navigatorRoom {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 24px;
		padding: 0 6px 0 24px;
		font-size: 12px;
		color: #222;
		cursor: pointer;

		&:nth-child(even) {
			background: #f2f2f2;
		}

		&:hover {
			background: #d9eef8;
		}
	}

	.navigatorRoomUsers {
		flex: 0 0 34px;
		height: 13px;
		line-height: 13px;
		padding-right: 5px;
		box-sizing: border-box;
		text-align: right;
		font-size: 9px;
		color: #fff;
		background: url("@/assets/images/navigator/icon_0.png") no-repeat;

		&.busy {
			background-image: url("@/assets/images/navigator/icon_g.png");
		}
	}

	.navigatorRoomName {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.navigatorRoomOwner {
		flex: 0 1 auto;
		max-width: 35%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 11px;
		color: #888;
	}

	.navigatorEmpty {
		padding: 6px 6px 6px 24px;
		font-size: 12px;
		font-style: italic;
		color: #888;
	}

	// ---------------- footer
	.navigatorFooter {
		flex: 0 0 auto;
		height: 62px;
		display: flex;
		gap: 12px;
		margin-top: 8px;
	}

	.navigatorBigButton {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		overflow: hidden;
		border-radius: 6px;
		color: #fff;
		font-size: 13px;
		font-weight: 700;
		text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
		cursor: pointer;

		&:hover {
			filter: brightness(1.07);
		}

		&:active {
			transform: translateY(1px);
		}

		&.navigatorCreateRoom {
			background: linear-gradient(90deg, #46c3f0 0 34%, #12a3df 34%);
			border: 2px solid #0b78a6;
		}

		&.navigatorSomewhereNew {
			background: linear-gradient(90deg, #8ccf4d 0 34%, #5daf2a 34%);
			border: 2px solid #3f8a17;
		}
	}

	.navigatorBigButtonIcon {
		flex: 0 0 34%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30px;
		font-weight: 700;

		img {
			width: 34px;
			height: 34px;
			image-rendering: pixelated;
		}
	}

	.navigatorBigButtonLabel {
		flex: 1;
		text-align: center;
	}
}
</style>
