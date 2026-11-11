<template>
    <div class="topBar">
        <div class="topBarPurse">
            <!-- the currencies -->
            <div class="topBarCurrencies">
                <div class="topBarCurrency diamonds" title="Diamonds">
                    <span>{{ diamonds }}</span>
                    <svg viewBox="0 0 14 12" class="topBarCurrencyIcon">
                        <path d="M3 1 H11 L13.5 4.5 L7 11 L0.5 4.5 Z" fill="#7fe3f2" stroke="#1d7f93" stroke-width="1" stroke-linejoin="round" />
                        <path d="M0.5 4.5 H13.5 M5 1 L4 4.5 L7 11 L10 4.5 L9 1" fill="none" stroke="#1d7f93" stroke-width="0.7" />
                    </svg>
                </div>
                <div class="topBarCurrency credits" title="Credits" @click="open(UIComponent.CatalogueUI)">
                    <span>{{ credits }}</span>
                    <img src="@/assets/images/catalogue/creditIcon.png" alt="" class="topBarCurrencyIcon" />
                </div>
                <div class="topBarCurrency duckets" title="Duckets">
                    <span>{{ duckets }}</span>
                    <svg viewBox="0 0 14 14" class="topBarCurrencyIcon">
                        <circle cx="7" cy="7" r="6" fill="#c08ce8" stroke="#5b2f86" stroke-width="1" />
                        <circle cx="7" cy="7" r="3" fill="none" stroke="#fff" stroke-width="1.4" />
                    </svg>
                </div>
            </div>

            <!-- the club -->
            <div class="topBarClub" title="Join the club" @click="open(UIComponent.CatalogueUI)">
                <span class="topBarClubIcon">HC</span>
                <span>Join</span>
            </div>

            <!-- help, exit, settings -->
            <div class="topBarButtons">
                <button class="topBarButton help" @click="toggle(UIComponent.HelpUI)">Help</button>
                <button class="topBarButton exit" :disabled="!inRoom" title="Leave the room" @click="leaveRoom()">
                    <svg viewBox="0 0 16 12">
                        <path d="M1 1 H8 V3 M8 9 V11 H1 Z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
                        <path d="M5 6 H14 M11 3 L14 6 L11 9" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <button class="topBarButton settings" title="Settings" @click="comingSoon('Settings')">
                    <svg viewBox="0 0 14 14">
                        <circle cx="7" cy="7" r="4.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="1.9 1.7" />
                        <circle cx="7" cy="7" r="3.4" fill="#fff" />
                        <circle cx="7" cy="7" r="1.4" fill="#6c5ca8" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- the seasonal currency -->
        <div class="topBarSeasonal" title="Seashells">
            <span class="topBarSeasonalName">Seashells</span>
            <span class="topBarSeasonalValue">{{ seashells }}</span>
            <span class="topBarSeasonalIcon">
                <svg viewBox="0 0 16 14">
                    <path d="M8 13 L1.5 6 Q2 1 8 1 Q14 1 14.5 6 Z" fill="#f2d7e6" stroke="#7a4a6a" stroke-width="1" stroke-linejoin="round" />
                    <path d="M8 13 L4 3 M8 13 L8 1.5 M8 13 L12 3" fill="none" stroke="#7a4a6a" stroke-width="0.8" />
                </svg>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Engine } from '../../../../game/Engine'
import { EventManager } from '../../../../game/core/events/EventManager'
import { IComponentShowableUI } from '../../../../game/core/ui/IComponentShowableUI'
import { TopbarEventData } from '../../../../game/engine/events/ui/data/static/Topbar'
import { RoomUIEventData } from '../../../../game/engine/events/ui/data/room/RoomUIEventData'
import { BubbleAlertData } from '../../../../game/engine/events/ui/data/general/BubbleAlertData'
import { UIEvents } from '../../../../game/engine/events/ui/UIEvents'
import { UIComponent } from '../../../../game/engine/ui/components/UIComponent'
import { OutgoingPacket } from '../../../../game/networking/packets/outgoing/OutgoingPacket'

const credits = ref(0)
// the server sends only the credits: the other currencies stay at 0 until it sends them
const diamonds = ref(0)
const duckets = ref(0)
const seashells = ref(0)

const inRoom = ref(Engine.getInstance()?.roomService?.currentRoom != null)

function onTopbar(event: TopbarEventData) {
    credits.value = event.credits
}

function onRoomUI(event: RoomUIEventData) {
    inRoom.value = event.enabled
}

EventManager.read(UIEvents.SET_TOPBAR, onTopbar)
EventManager.read(UIEvents.ROOM_UI, onRoomUI)
onUnmounted(() => {
    EventManager.off(UIEvents.SET_TOPBAR, onTopbar)
    EventManager.off(UIEvents.ROOM_UI, onRoomUI)
})

function open(component: UIComponent) {
    Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(component)?.show()
}

function toggle(component: UIComponent) {
    Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(component)?.toggle()
}

/** Out of the room, to the hotel view (the server removes the avatar from the room). */
function leaveRoom() {
    const engine = Engine.getInstance()
    const room = engine?.roomService?.currentRoom
    if (!room) return

    engine.networkingManager?.packetManager.applyOut(OutgoingPacket.UserExitRoom, { id: room.id })
    engine.roomService.leaveRoom()
}

function comingSoon(feature: string) {
    EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, { message: `${feature}: coming soon!` })
}
</script>

<style lang="scss">
.topBar {
    position: fixed;
    top: 0;
    right: 10px;
    z-index: 10;
    width: 192px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-family: "Ubuntu", sans-serif;
    user-select: none;

    // the boxes: dark, with a brown border; clickable (#root lets the clicks go to the game)
    .topBarPurse,
    .topBarSeasonal {
        pointer-events: all;
        background: #3b3631;
        border: 2px solid #6e5a48;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px #24201d;
    }

    .topBarPurse {
        display: flex;
        gap: 4px;
        padding: 4px;
        border-top: 0;
        border-radius: 0 0 6px 6px;
    }

    // ---------------- currencies
    .topBarCurrencies {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        gap: 2px;
    }

    .topBarCurrency {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        height: 18px;
        font-size: 12px;
        font-weight: 700;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);

        &.diamonds {
            color: #7fe3f2;
        }

        &.credits {
            color: #f2c12e;
            cursor: pointer;
        }

        &.duckets {
            color: #c99be8;
        }
    }

    .topBarCurrencyIcon {
        flex: 0 0 14px;
        width: 14px;
        height: 14px;
    }

    // ---------------- club
    .topBarClub {
        flex: 0 0 46px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-radius: 5px;
        background: #2f3533;
        box-shadow: inset 0 0 0 1px #262a29;
        color: #00c0c3;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;

        &:hover {
            background: #36403d;
        }
    }

    .topBarClubIcon {
        padding: 1px 3px;
        border: 1px solid #a0780e;
        border-radius: 3px;
        background: linear-gradient(#ffe066, #e2a915);
        color: #6b4a00;
        font-size: 8px;
        line-height: 10px;
        text-shadow: none;
    }

    // ---------------- buttons
    .topBarButtons {
        flex: 0 0 62px;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .topBarButton {
        height: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 1px solid rgba(0, 0, 0, 0.6);
        border-radius: 3px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.15);
        color: #fff;
        font-family: inherit;
        font-size: 12px;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
        cursor: pointer;
        outline: none;

        svg {
            height: 12px;
        }

        &:hover {
            filter: brightness(1.12);
        }

        &:active {
            translate: 0 1px;
        }

        &:disabled {
            filter: grayscale(0.7) brightness(0.8);
            cursor: default;
            translate: none;
        }

        &.help {
            background: #1f86d0;
        }

        &.exit {
            background: #e0383b;
        }

        &.settings {
            background: #6c5ca8;
        }
    }

    // ---------------- seasonal currency
    .topBarSeasonal {
        display: flex;
        align-items: center;
        height: 24px;
        padding-left: 6px;
        border-radius: 5px;
        overflow: hidden;
        font-size: 12px;
        font-weight: 700;
    }

    .topBarSeasonalName {
        flex: 1;
        color: #c58fd8;
    }

    .topBarSeasonalValue {
        padding-right: 8px;
        color: #fff;
    }

    .topBarSeasonalIcon {
        flex: 0 0 26px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #8a6fb6;
        border-left: 1px solid #24201d;

        svg {
            width: 16px;
            height: 14px;
        }
    }
}
</style>
