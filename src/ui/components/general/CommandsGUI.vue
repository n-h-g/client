<template>
	<Dialog title="Commands" class-name="commandsDialog" :box="UIEventsType.COMMANDS">
		<div class="commands">
			<div class="commandsList">
				<div class="commandsHeader">The commands you can write in the chat.</div>
				<div v-for="command in commands" :key="command.usage" class="commandsRow">
					<span class="commandsUsage">{{ command.usage }}</span> – {{ command.description }}
				</div>
			</div>
			<div class="commandsFooter">
				<button class="commandsOk" @click="close()">OK</button>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import Dialog from "../dialog/Dialog.vue"
import { EventManager } from "../../../game/core/events/EventManager"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { DialogEventData } from "../../../game/engine/events/ui/data/general/Dialog"
import { CommandsList } from "../../../game/engine/game/commands/CommandsList"

const commands = CommandsList.all()

function close() {
	EventManager.emit<DialogEventData>(UIEvents.CLOSE, { type: UIEventsType.COMMANDS })
}
</script>

<style lang="scss">
#dialog.commandsDialog {
	position: absolute;
	z-index: 4;
	top: 22%;
	left: calc(50% - 220px);
	width: 440px;
	height: 290px;

	> .content {
		padding: 10px;
		box-sizing: border-box;
	}
}

.commands {
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;

	.commandsList {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 6px 8px;
		background: #fff;
		border: 1px solid #9a9a9a;
		border-radius: 6px;
		font-size: 12px;
		line-height: 1.45;
		color: #000;
		user-select: text;
	}

	.commandsHeader {
		margin-bottom: 4px;
		padding-bottom: 4px;
		border-bottom: 2px solid #c8c8c8;
	}

	.commandsUsage {
		font-weight: 700;
	}

	.commandsFooter {
		display: flex;
		justify-content: center;
	}

	.commandsOk {
		min-width: 60px;
		padding: 4px 14px;
		background: linear-gradient(#fff, #e3e3e3);
		border: 2px solid #000;
		border-radius: 6px;
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		color: #000;
		cursor: pointer;
		outline: none;

		&:hover {
			background: linear-gradient(#fff, #f0f0f0);
		}
	}
}
</style>
