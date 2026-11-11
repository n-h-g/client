<template>
	<Dialog title="Help" class-name="helpDialog" :box="UIEventsType.HELP">
		<!-- the categories -->
		<div v-if="view === 'home'" class="helpHome">
			<div class="helpTitle">How can we help you?</div>

			<div class="helpIntro">
				<svg class="helpIllustration" viewBox="0 0 96 70" aria-hidden="true">
					<!-- the water -->
					<ellipse cx="46" cy="54" rx="42" ry="13" fill="#3fa9df" stroke="#1d6f9e" stroke-width="1.5" />
					<ellipse cx="44" cy="52" rx="30" ry="7" fill="#7fcdf2" />
					<!-- the lifebuoy -->
					<ellipse cx="46" cy="40" rx="30" ry="17" fill="#fff" stroke="#3c3c3c" stroke-width="1.5" />
					<path d="M20 31 A30 17 0 0 1 34 24.5 L38 33 A15 8 0 0 0 31 36 Z" fill="#f28a1c" stroke="#3c3c3c" stroke-width="1" />
					<path d="M58 24.5 A30 17 0 0 1 72 31 L61 36 A15 8 0 0 0 54 33 Z" fill="#f28a1c" stroke="#3c3c3c" stroke-width="1" />
					<path d="M18 47 A30 17 0 0 0 34 55.5 L37 47.5 A15 8 0 0 1 30 44 Z" fill="#f28a1c" stroke="#3c3c3c" stroke-width="1" />
					<path d="M58 55.5 A30 17 0 0 0 74 47 L62 44 A15 8 0 0 1 55 47.5 Z" fill="#f28a1c" stroke="#3c3c3c" stroke-width="1" />
					<ellipse cx="46" cy="40" rx="15" ry="8" fill="#3fa9df" stroke="#3c3c3c" stroke-width="1.5" />
					<!-- the rope -->
					<ellipse cx="46" cy="40" rx="23" ry="12.5" fill="none" stroke="#c9a26b" stroke-width="1.2" stroke-dasharray="3 2" />
					<!-- a duck on it -->
					<g transform="translate(36 7)">
						<ellipse cx="10" cy="15" rx="9" ry="6" fill="#ffd93b" stroke="#a67c00" stroke-width="1" />
						<circle cx="14" cy="7" r="5" fill="#ffd93b" stroke="#a67c00" stroke-width="1" />
						<path d="M18.5 7 L23 8 L18.5 9.5 Z" fill="#f28a1c" stroke="#a65a00" stroke-width="0.7" />
						<circle cx="15.5" cy="6" r="1" fill="#3c3c3c" />
					</g>
					<!-- a small duck swimming -->
					<g transform="translate(76 44) scale(0.6)">
						<ellipse cx="10" cy="15" rx="9" ry="6" fill="#ffd93b" stroke="#a67c00" stroke-width="1.5" />
						<circle cx="14" cy="7" r="5" fill="#ffd93b" stroke="#a67c00" stroke-width="1.5" />
						<path d="M18.5 7 L23 8 L18.5 9.5 Z" fill="#f28a1c" />
						<circle cx="15.5" cy="6" r="1.2" fill="#3c3c3c" />
					</g>
				</svg>
				<div class="helpSubtitle">Please pick a category!</div>
			</div>

			<div class="helpButtons">
				<button class="helpButton" @click="view = 'guide'">I need help in using something</button>
				<button class="helpButton" @click="comingSoon('Reports')">Someone is misbehaving</button>
				<button class="helpButton" @click="comingSoon('The Customer Support Center')">Customer Support Center</button>
			</div>

			<div class="helpLinks">
				<a class="helpLink" @click="comingSoon('The moderation page')">
					<span class="helpLinkIcon">➜</span>Read more about our moderation
				</a>
				<a class="helpLink" @click="comingSoon('The sanction status')">
					<span class="helpLinkIcon">➜</span>My sanction status
				</a>
			</div>
		</div>

		<!-- the guide: how to use the hotel -->
		<div v-else class="helpGuide">
			<a class="helpBack" @click="view = 'home'">‹ Back</a>
			<div class="helpTitle small">How do I...?</div>

			<div class="helpTopics">
				<div v-for="(topic, index) in topics" :key="topic.question" class="helpTopic">
					<div class="helpTopicQuestion" @click="openTopic = openTopic === index ? -1 : index">
						<span class="helpTopicToggle">{{ openTopic === index ? "−" : "+" }}</span>
						{{ topic.question }}
					</div>
					<div v-if="openTopic === index" class="helpTopicAnswer">{{ topic.answer }}</div>
				</div>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { EventManager } from "../../../game/core/events/EventManager"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { BubbleAlertData } from "../../../game/engine/events/ui/data/general/BubbleAlertData"

const view = ref<"home" | "guide">("home")
const openTopic = ref(-1)

const topics = [
	{
		question: "...walk around the room?",
		answer: "Click on a tile of the floor and your avatar walks there.",
	},
	{
		question: "...talk to the other users?",
		answer: "Write in the chat bar at the bottom of the screen and press Enter.",
	},
	{
		question: "...find a room?",
		answer: "Open the Navigator from the bottom bar: you can look at the rooms by category or search them by name or owner.",
	},
	{
		question: "...make my own room?",
		answer: "In the Navigator click \"Create Room\", choose a layout and a name. You find it again under My World.",
	},
	{
		question: "...buy furni and pets?",
		answer: "Open the Shop from the bottom bar. What you buy goes in your Inventory, from where you can place it in your room.",
	},
	{
		question: "...change my look?",
		answer: "Click on your avatar and choose \"Look\": pick the clothes and the colors, then click \"Save changes\".",
	},
	{
		question: "...make friends?",
		answer: "Click on an avatar to ask for its friendship, or look for a user with the Friends button. Your friends appear in the bar at the bottom right.",
	},
]

function comingSoon(feature: string) {
	EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, { message: `${feature}: coming soon!` })
}
</script>

<style lang="scss">
#dialog.helpDialog {
	position: absolute;
	z-index: 2;
	top: 90px;
	right: 220px;
	width: 300px;
	height: 360px;
	max-width: calc(100vw - 24px);

	> .content {
		padding: 10px 14px;
		box-sizing: border-box;
		overflow-y: auto;
		user-select: none;
	}
}

.helpDialog {
	.helpTitle {
		font-size: 20px;
		font-weight: 700;
		color: #000;

		&.small {
			font-size: 16px;
			margin: 6px 0 8px;
		}
	}

	.helpIntro {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		margin-top: 4px;
	}

	.helpIllustration {
		flex: 0 0 96px;
		height: 70px;
	}

	.helpSubtitle {
		flex: 1;
		margin-top: 4px;
		text-align: center;
		font-size: 11px;
		color: #222;
	}

	.helpButtons {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 30px;
	}

	.helpButton {
		height: 28px;
		border: 1px solid #0d4d12;
		border-radius: 3px;
		background: linear-gradient(#3fbf3a 0 50%, #2aa52a 50%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.15);
		color: #fff;
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
		cursor: pointer;
		outline: none;

		&:hover {
			filter: brightness(1.08);
		}

		&:active {
			translate: 0 1px;
		}
	}

	.helpLinks {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 14px;
	}

	.helpLink,
	.helpBack {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 700;
		color: #000;
		text-decoration: underline;
		cursor: pointer;

		&:hover {
			color: #1f6f2a;
		}
	}

	.helpLinkIcon {
		width: 14px;
		height: 14px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #2aa52a;
		box-shadow: inset 0 0 0 1px #0d4d12;
		color: #fff;
		font-size: 9px;
		text-decoration: none;
		transform: rotate(-45deg);
	}

	// ---------------- the guide
	.helpTopics {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.helpTopic {
		background: #fff;
		border-radius: 3px;
	}

	.helpTopicQuestion {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		font-size: 12px;
		font-weight: 700;
		color: #1b4c6b;
		cursor: pointer;

		&:hover {
			background: #f3f8fb;
		}
	}

	.helpTopicToggle {
		flex: 0 0 10px;
		color: #63b6d9;
		font-size: 15px;
		text-align: center;
	}

	.helpTopicAnswer {
		padding: 0 10px 8px 24px;
		font-size: 12px;
		line-height: 1.4;
		color: #333;
	}
}
</style>
