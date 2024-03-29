<template>
    <div class="loaderContainer">
        <div class="loader">
            <div class="logo"></div>
            <div class="progressBar">
                <div :style="{ width: progress }" class="progressStriped"></div>
            </div>
            <div id="progressDescription" class="progressDescription">{{ message }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { LoadingProgressEventData } from '../../../game/engine/events/ui/data/loader/LoadingProgress'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'

const progress = ref('0%')
const message = ref('Loading...')

EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
    progress.value = event.width + '%'
    message.value = event.message
})
</script>

<style lang="scss">
.loaderContainer {
    width: 100%;
    height: 100%;
    background-color: #12436d;
    position: absolute;
    z-index: 10000;

    & .loader {
        padding:5px;
        width:100%;
        position: relative;
        text-align: center;
        text-shadow: 1px 2px 0 rgba(0,0,0,.15);
        margin: 0 auto;
        top: 50%;
        transform: translateY(-50%);

        @media screen and (min-width: 1000px) {
            & {
                width:1000px;
                padding:0;
            }
          }

        & .logo {
            background-image: url('@/assets/images/nhg_logo_white.png');
            background-size: cover;
            background-repeat: no-repeat;
            width:305px;
            height:225px;
            display: block;
            margin: 0 auto;
            filter: drop-shadow(2px 3px 0 rgba(0,0,0,.15));
            margin-bottom: 10px;
        }

        & .progressBar {
            width: 69%;
            margin: 0 auto;
            height: 50px;
            margin-bottom: 50px;
            position: relative;
            background-color: rgba(0,0,0,.2);
            border: 1px solid rgba(0,0,0,.05);
            border-radius: 15px;
            overflow: hidden;
            margin-top: 60px;

            & .progressStriped {
                width: 0%;
                border-radius: 15px;
                float: left;
                height: 100%;
                font-size: 12px;
                line-height: 20px;
                color: #fff;
                text-align: center;
                background-color: #fa0;
                background-size: 100px 100px;
                transition: width .6s ease;
                border: 2px solid #ffbb33;
                animation: progressBar 2s linear infinite;
            }
        }

        & .progressDescription {
            color:#fff;
            font-size: 2rem
        }
    }
}

@keyframes progressBar {
    0% {
        background-position: 100px 0;
    }
    100% {
        background-position: 0 0;
    }
  }
</style>
