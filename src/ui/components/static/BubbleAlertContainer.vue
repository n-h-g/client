
<template>
    <div class="bubbleAlertContainer">
            <div class="bubbleAlert" v-for="bubbleAlert in bubbleMessages" v-bind:key="bubbleAlert.id">
                <img src="~@/assets/images/bottom-bar/avatar.png"/>
                {{ bubbleAlert.message }}
                <div class="bubbleAlertButtons" v-if="isClickable(bubbleAlert)">
                    <button class="button-accept" @click.stop="() => {
                        bubbleAlert.action.onConfirm()
                        bubbleMessages.shift()
                    }">Accetta</button>
                    <button class="button-decline" @click.stop="() => {
                        bubbleAlert.action.onDecline()
                        bubbleMessages.shift()
                    }">Rifiuta</button>
                </div>
            </div>  
        </div>
</template>
<script setup lang="ts">

import { ref } from "vue"
import { BubbleAlertData } from "../../../game/core/communication/incoming/generic/BubbleAlertData"
import BubbleMessage from "../../../game/core/game/BubbleMessage"


let bubbleMessages = ref([])

function isClickable(bubbleAlert) {
    return true
}

</script>