<template>
    <div id="previewBox" ref="previewBox" draggable="false">
        <div v-if="mode == 'user'" class="previewBoxContainer userPreview">
            <div class="previewBoxContainerInfo">
                <div class="titleBar">
                    <span class="title">
                        {{ user.username }}
                    </span>
                    <span class="closeIcon" @click="hide()">-</span>
                </div>
                <div class="userInfoContainer">
                    <div class="imageContainer">
                        <img ref="playerImage" :src="user.image" />
                    </div>
                    <div class="badgeContainer">

                    </div>
                </div>
                <div class="additionalInfoContainer">
                    <p>{{ user.motto }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EventManager } from '../../../game/engine/ui/events/EventManager';
import { BoxEvent } from '../../../game/engine/ui/events/general/BoxEvent';
import { PreviewUserModeEvent } from '../../../game/engine/ui/events/general/PreviewUserModeEvent';
import { UIEvents } from '../../../game/engine/ui/events/UIEvents';
import { UIEventsType } from '../../../game/engine/ui/events/UIEventsType';

const mode = ref('')
const user = ref({
    username: '',
    image: '',
    motto: ''
})

EventManager.read(UIEvents.PREVIEW_BOX_MODE, (evt: PreviewUserModeEvent) => {
    mode.value = evt.mode
    user.value.username = evt.username
    user.value.image = evt.look
    user.value.motto = evt.motto
})

function hide(): void {
    EventManager.emit<BoxEvent>(UIEvents.CLOSE, {
        type: UIEventsType.PREVIEWBOX
    })
}
</script>

<style lang="scss">
@import '@/assets/scss/game.scss';

#previewBox {
    position: fixed;
    right: 12px;
    bottom: 90px;
    pointer-events: all !important;

    .previewBoxContainer {
        display: flex;
        flex-direction: column;


        &.userPreview {
            .previewBoxContainerInfo {
                width: 190px;
                height: auto;
            }
        }

        .previewBoxContainerInfo {
            flex-grow: 3;
            //height: 300px;
            border-radius: 5px;
            background-color: #2E2E2C;
            width: 209px;
            padding: 4px;

            hr {
                border: 0;
                border-top: 1px solid #333;
            }

            .titleBar {
                display: flex;
                flex-direction: row;
                margin-bottom: 2px;
                font-size: 15px;


                .title {
                    text-align: center;
                    flex-grow: 5;
                    padding: 5px;
                    /*border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                        background-color: #424242;*/
                    font-size: 15px;
                    color: #eee;
                    margin-right: 4px;
                    font-weight: 700;
                    margin: 0;

                }

                .closeIcon {
                    position: absolute;
                    right: 10px;
                    top: 0;
                    font-size: 20px;
                    text-align: center;
                    padding: 1.5px;
                    /*border-top-right-radius: 12px;
                        border-bottom-right-radius: 12px;
                        background-color: #424242;*/
                    color: #ffb31a;
                    cursor: pointer;

                }
            }
        }

        .userInfoContainer {
            padding: 0px;
            display: inline;
            flex-direction: row;
            flex-grow: 6;
            width: 100%;
            justify-content: center;

            .imageContainer {
                width: 65px;
                padding-left: 5px;
                padding-top: 15px;
                z-index: -1;
                border-radius: 5px;
                margin: 0 auto;
            }

            .imageContainer img {
                width: 75%;
                background-color: transparent;
            }

            .badgeContainer {
                visibility: hidden;
                width: 100px;
                flex-wrap: wrap;
                align-content: flex-start;
                display: flex;
            }

            .mottoContainer {
                flex-grow: 1;
                color: #eee;

                font-size: 9px;
            }
        }

        .itemImageContainer {
            padding: 4px;
            display: flex;
            align-content: center;
            justify-content: center;
            flex-direction: row;

            img {
                height: auto;
                align-self: center;
            }
        }

        .additionalInfoContainer {

            flex-grow: 1;
            padding: 4px 4px 15px 0px;
            color: #eee;
            cursor: text;
            margin: 0;
            color: #fff;
            word-break: break-word;
            text-align: center;
            font-size: 14px;

            .infoTags {
                margin-top: 5px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-between;

                &>span {
                    padding: 0px 4px;
                    color: #eee;
                    background-color: #3d3d3d;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    box-sizing: border-box;
                }
            }
        }

        .previewBoxContainerButtons {
            margin-top: 10px;
            min-height: 20px;
            /* background-color: #fff;*/

            display: flex;
            flex-direction: row;
            user-select: none;

            .previewButton {
                margin: 3px;
                background-color: #2E2E2C;
                color: #fff;
                //padding-left: 3px;
                //padding-right: 3px;
                border-radius: 5px;
                font-family: Ubuntu, sans-serif;
                font-weight: 500;
                //font-size: 13px;
                cursor: pointer;
                user-select: none;
                font-size: 13px;
                padding: 10px 6px;
                line-height: 16px;

                &:hover {
                    background-color: #fa0;
                }
            }
        }
    }
}
</style>