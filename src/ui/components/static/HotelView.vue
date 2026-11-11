<template>
	<div id="hotel-view">
		<div class="bg-right"></div>
		<div class="bg-left"></div>

		<!-- the logo, on a banner hanging from the top -->
		<div class="hotelViewBanner">
			<img src="@/assets/images/nhg_logo_white.png" alt="NHG" />
		</div>

		<div class="hotelViewWidgets">
			<!-- the credits: how many are missing to the next bonus -->
			<div class="hotelViewPromo">
				<div class="hotelViewPromoIcon">
					<img src="@/assets/images/catalogue/creditBigIcon.png" alt="" />
				</div>
				<div class="hotelViewPromoBody">
					<div class="hotelViewPromoTitle">Bonus Bag every {{ BONUS_STEP }} credits!</div>
					<div class="hotelViewProgress">
						<div class="hotelViewProgressFill" :style="{ width: bonusPercent + '%' }"></div>
						<span class="hotelViewProgressText">Only {{ bonusCredits }}/{{ BONUS_STEP }} credits to go!</span>
					</div>
				</div>
				<button class="hotelViewButton" @click="open(UIComponent.CatalogueUI)">Get Credits</button>
			</div>

			<!-- the news -->
			<div class="hotelViewNews">
				<div class="hotelViewNewsHeader">
					<span>What's new?</span>
				</div>
				<div class="hotelViewNewsDots">
					<span
						v-for="(item, index) in news"
						:key="item.title"
						class="hotelViewNewsDot"
						:class="{ active: index === newsIndex }"
						@click="showNews(index)"
					></span>
				</div>
				<div class="hotelViewNewsItem" :key="newsIndex">
					<div class="hotelViewNewsImage">
						<img :src="currentNews.image" :style="{ width: currentNews.imageWidth + 'px' }" alt="" />
					</div>
					<div class="hotelViewNewsText">
						<div class="hotelViewNewsTitle">{{ currentNews.title }}</div>
						<div class="hotelViewNewsDescription">{{ currentNews.text }}</div>
						<button class="hotelViewButton" @click="open(currentNews.opens)">{{ currentNews.button }}</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { EventManager } from '../../../game/core/events/EventManager'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { TopbarEventData } from '../../../game/engine/events/ui/data/static/Topbar'

/**
 * The credits of the user, kept outside the component: the hotel view is mounted again when the user leaves
 * a room, after the server sent them.
 */
let lastCredits = 0
EventManager.read(UIEvents.SET_TOPBAR, (event: TopbarEventData) => lastCredits = event.credits ?? 0)
</script>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { Engine } from '../../../game/Engine'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import shopImage from '@/assets/images/catalogue/empty_catalogue.png'
import roomImage from '@/assets/images/createroom/model_a.png'
import avatarImage from '@/assets/images/bottom-bar/avatar.png'

interface News {
	title: string
	text: string
	button: string
	opens: UIComponent
	image: string
	/** The width the image is drawn at (the small pixel images are drawn bigger). */
	imageWidth: number
}

/** A bonus every this many credits. */
const BONUS_STEP = 500
/** The news change by themselves after this time. */
const NEWS_INTERVAL_MS = 8000

const news: News[] = [
	{
		title: "Welcome to NHG!",
		text: "Explore the rooms of the hotel, meet new friends and build your own place.",
		button: "Find a room",
		opens: UIComponent.NavigatorUI,
		image: roomImage,
		imageWidth: 142,
	},
	{
		title: "Pets are here!",
		text: "Adopt a pet in the Shop, give it a name and take it to your room.",
		button: "Open the Shop",
		opens: UIComponent.CatalogueUI,
		image: shopImage,
		imageWidth: 92,
	},
	{
		title: "A new look",
		text: "The Wardrobe has been redone: choose your hair, clothes and colors.",
		button: "Change your look",
		opens: UIComponent.ChangeLookUI,
		image: avatarImage,
		imageWidth: 110,
	},
]

const credits = ref(lastCredits)

function onCredits(event: TopbarEventData) {
	credits.value = event.credits ?? 0
}

EventManager.read(UIEvents.SET_TOPBAR, onCredits)
onUnmounted(() => EventManager.off(UIEvents.SET_TOPBAR, onCredits))

/** The credits of the user toward the next bonus. */
const bonusCredits = computed(() => Math.max(0, credits.value) % BONUS_STEP)
const bonusPercent = computed(() => (bonusCredits.value / BONUS_STEP) * 100)

const newsIndex = ref(0)
const currentNews = computed(() => news[newsIndex.value])

let newsTimer = window.setInterval(nextNews, NEWS_INTERVAL_MS)
onUnmounted(() => window.clearInterval(newsTimer))

function nextNews() {
	newsIndex.value = (newsIndex.value + 1) % news.length
}

/** A news chosen by the user: the timer starts again, so it stays for the whole interval. */
function showNews(index: number) {
	newsIndex.value = index
	window.clearInterval(newsTimer)
	newsTimer = window.setInterval(nextNews, NEWS_INTERVAL_MS)
}

function open(component: UIComponent) {
	Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(component)?.show()
}
</script>

<style lang="scss">
#hotel-view {
	position: absolute;
	top: 0;
	left: 0;
	min-width: 900px;
	height: 100%;
	width: 100%;
	overflow: hidden;
	background: linear-gradient(180deg, #e45814 0%, #e8792c 35%, #eba25e 100%);
	z-index: -1;
	font-family: "Ubuntu", sans-serif;
}

.hotelView {
	background-color: #e8792c;
}

#hotel-view .bg-left {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 413px;
	height: 124px;
	background-image: url("@/assets/images/hotelview/reception_flathotel_hotel.png");
}

#hotel-view .bg-right {
	position: absolute;
	right: 0;
	bottom: 0;
	z-index: 0;
	width: 484px;
	height: 463px;
	background-image: url("@/assets/images/hotelview/default_new_bg_right.png");
}

// ---------------- the banner with the logo
.hotelViewBanner {
	position: absolute;
	top: 0;
	left: 100px;
	width: 144px;
	height: 196px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding-bottom: 30px;
	box-sizing: border-box;
	background: linear-gradient(90deg, #f3d419 0 92%, #d9b70c 92%);
	clip-path: polygon(0 0, 100% 0, 100% 72%, 0 100%);
	filter: drop-shadow(-4px 4px 0 rgba(120, 40, 0, 0.35));

	img {
		width: 112px;
		transform: rotate(-24deg);
		// a dark outline, so the white logo stands out on the yellow
		filter:
			drop-shadow(2px 0 0 #6b3a00)
			drop-shadow(-2px 0 0 #6b3a00)
			drop-shadow(0 2px 0 #6b3a00)
			drop-shadow(0 -2px 0 #6b3a00)
			drop-shadow(2px 4px 0 #c0660a);
	}
}

// ---------------- the widgets
.hotelViewWidgets {
	position: absolute;
	top: 10px;
	left: 258px;
	width: 504px;
	display: flex;
	flex-direction: column;
	gap: 22px;
	pointer-events: all;
	user-select: none;
}

.hotelViewButton {
	padding: 4px 14px;
	min-height: 25px;
	background: linear-gradient(#ffffff, #dedede);
	border: 1px solid #000;
	border-radius: 5px;
	box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 0.3);
	font-family: inherit;
	font-size: 11px;
	font-weight: 700;
	color: #000;
	cursor: pointer;
	outline: none;
	white-space: nowrap;

	&:hover {
		background: linear-gradient(#ffffff, #ececec);
	}

	&:active {
		translate: 0 1px;
	}
}

.hotelViewPromo {
	display: flex;
	align-items: center;
	gap: 16px;
	min-height: 60px;
	padding: 0 10px 0 16px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.14);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.hotelViewPromoIcon {
	flex: 0 0 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: radial-gradient(circle at 40% 35%, #ffcf6b, #c9771c);
	box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.2);

	img {
		width: 31px;
		image-rendering: pixelated;
	}
}

.hotelViewPromoBody {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.hotelViewPromoTitle {
	font-size: 16px;
	font-weight: 700;
	color: #fff;
	text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
	white-space: nowrap;
}

.hotelViewProgress {
	position: relative;
	width: 100%;
	height: 18px;
	border: 2px solid #fff;
	border-radius: 4px;
	background: #4a4a4a;
	overflow: hidden;
	box-sizing: border-box;
}

.hotelViewProgressFill {
	height: 100%;
	background: linear-gradient(#2cc8d8, #13a3b5);
	transition: width 0.4s;
}

.hotelViewProgressText {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
}

// ---------------- the news
.hotelViewNews {
	position: relative;
}

.hotelViewNewsHeader {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 10px;
	font-weight: 700;
	color: #fff;
	text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);

	&::after {
		content: "";
		flex: 1;
		height: 1px;
		background: rgba(255, 255, 255, 0.55);
	}
}

.hotelViewNewsDots {
	position: absolute;
	top: 18px;
	left: 8px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.hotelViewNewsDot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.4);
	cursor: pointer;

	&.active {
		background: #fff;
	}
}

.hotelViewNewsItem {
	display: flex;
	gap: 26px;
	padding: 10px 0 0 4px;
	animation: hotelViewNewsIn 0.35s ease-out;
}

@keyframes hotelViewNewsIn {
	from {
		opacity: 0;
		transform: translateX(10px);
	}
}

.hotelViewNewsImage {
	flex: 0 0 150px;
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;

	img {
		max-height: 120px;
		image-rendering: pixelated;
		filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.15));
	}
}

.hotelViewNewsText {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 10px;
	color: #fff;
}

.hotelViewNewsTitle {
	font-size: 18px;
	font-weight: 700;
	text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
}

.hotelViewNewsDescription {
	font-size: 12px;
	line-height: 1.4;
	max-width: 300px;
}
</style>
