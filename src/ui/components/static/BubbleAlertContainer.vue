<template>
    <div class="bubbleAlertContainer">
        <div class="bubbleAlert" v-for="bubbleAlert in bubbleMessages" :key="bubbleAlert.id">
            <div class="bubbleAlertMessage">
                <img src="~@/assets/images/bottom-bar/avatar.png" />
                <span>{{ bubbleAlert.message }}</span>
            </div>
            <div class="bubbleAlertButtons" v-if="bubbleAlert.action">
                <button class="button-accept" @click.stop="answer(bubbleAlert, true)">Accept</button>
                <button class="button-decline" @click.stop="answer(bubbleAlert, false)">Decline</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { EventManager } from "../../../game/core/events/EventManager"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { BubbleAlertData } from "../../../game/engine/events/ui/data/general/BubbleAlertData"

type BubbleAlert = BubbleAlertData & { id: number }

/** An alert without buttons goes away by itself after this time. */
const INFO_DURATION_MS = 5000

const bubbleMessages = ref<BubbleAlert[]>([])
let nextId = 1

EventManager.read(UIEvents.BUBBLE_ALERT, (data: BubbleAlertData) => {
    const alert: BubbleAlert = { ...data, id: nextId++ }
    bubbleMessages.value.push(alert)

    if (!alert.action) setTimeout(() => remove(alert), INFO_DURATION_MS)
})

function answer(alert: BubbleAlert, confirm: boolean) {
    if (confirm) alert.action?.onConfirm()
    else alert.action?.onDecline()

    remove(alert)
}

// the alert that was answered, not the first one
function remove(alert: BubbleAlert) {
    bubbleMessages.value = bubbleMessages.value.filter(other => other.id !== alert.id)
}
</script>

<style lang="scss">
.bubbleAlertContainer {
    position: fixed;
    /* under the top bar */
    top: 112px;
    right: 12px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none;

    .bubbleAlert {
        pointer-events: all;
        width: 260px;
        padding: 8px 10px;
        border-radius: 8px;
        background-color: rgba(28, 28, 26, 0.92);
        border: 1px solid #53524f;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
        color: #fff;
        font-family: 'Ubuntu', sans-serif;
        font-size: 0.8rem;

        .bubbleAlertMessage {
            display: flex;
            align-items: center;
            gap: 8px;

            img {
                flex: none;
            }
        }

        .bubbleAlertButtons {
            display: flex;
            justify-content: flex-end;
            gap: 6px;
            margin-top: 6px;

            button {
                border: 0;
                border-radius: 6px;
                padding: 4px 10px;
                cursor: pointer;
                font-weight: bold;
                color: #fff;
            }

            .button-accept {
                background-color: #3a8b2e;
            }

            .button-decline {
                background-color: #8b2e2e;
            }
        }
    }
}
</style>
