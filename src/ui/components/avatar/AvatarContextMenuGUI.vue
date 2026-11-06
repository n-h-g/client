<template>
    <div
        v-if="visible"
        ref="menu"
        class="avatar-context-menu"
        :class="{ 'opens-below': opensBelow }"
        :style="menuStyle"
        @pointerdown.stop
        @click.stop
    >
        <div class="avatar-menu-title">{{ avatar.name }}</div>
        <template v-if="avatar.isSelf">
            <template v-if="menuView === 'main'">
                <button class="avatar-menu-row" @click="changeLook">Look</button>
                <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('dance')">Balla <span>›</span></button>
                <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('actions')">Azioni <span>›</span></button>
            </template>
            <template v-else-if="menuView === 'dance'">
                <button class="avatar-menu-row menu-back" @click="setMenuView('main')">‹ Indietro</button>
                <div class="avatar-menu-section">Balla</div>
                <button class="avatar-menu-row" @click="runAction('dance', 1)">Pogo Mogo</button>
                <button class="avatar-menu-row" @click="runAction('dance', 2)">Duft Punk</button>
                <button class="avatar-menu-row" @click="runAction('dance', 3)">Dance 3</button>
                <button class="avatar-menu-row" @click="runAction('dance', 4)">Dance 4</button>
            </template>
            <template v-else-if="menuView === 'actions'">
                <button class="avatar-menu-row menu-back" @click="setMenuView('main')">‹ Indietro</button>
                <div class="avatar-menu-section">Azioni</div>
                <button class="avatar-menu-row" @click="runAction('sit')">{{ avatar.sitting ? 'Alzati' : 'Siediti' }}</button>
                <button class="avatar-menu-row" @click="runAction('wave')">Saluta</button>
                <button class="avatar-menu-row" @click="runAction('laugh')">Ridi</button>
                <button class="avatar-menu-row" @click="runAction('blow')">Manda un bacio</button>
                <button class="avatar-menu-row" @click="runAction('sleep')">Rilassati</button>
                <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('signs')">Segnali <span>›</span></button>
            </template>
            <template v-else>
                <button class="avatar-menu-row menu-back" @click="setMenuView('actions')">‹ Indietro</button>
                <div class="avatar-menu-section">Cartellini</div>
                <button v-for="number in signNumbers" :key="number" class="avatar-menu-row sign-row" @click="runAction('sign', 1, number)">
                    Cartellino <span class="sign-card">{{ number }}</span>
                </button>
            </template>
        </template>
        <template v-else>
            <template v-if="avatar.userId != null && !friendship.isFriend">
                <button v-if="friendship.hasRequestFrom" class="avatar-menu-row" @click="acceptFriend">Accetta amicizia</button>
                <button v-else-if="friendship.hasSent" class="avatar-menu-row unavailable" disabled>Richiesta inviata</button>
                <button v-else class="avatar-menu-row" @click="addFriend">Aggiungi amico</button>
            </template>
            <button class="avatar-menu-row unavailable" disabled>Trade</button>
            <button class="avatar-menu-row unavailable" disabled>Whisper</button>
            <button class="avatar-menu-row unavailable" disabled>Give a gem <span class="gem">💎</span></button>
            <button class="avatar-menu-row unavailable" disabled>Ignore</button>
            <button class="avatar-menu-row unavailable" disabled>Report</button>
            <button class="avatar-menu-row unavailable" disabled>Moderate</button>
        </template>
        <div class="avatar-menu-arrow"></div>
    </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {EventManager} from '../../../game/core/events/EventManager'
import {HumanVisualization} from '../../../game/core/room/object/human/visualization/HumanVisualization'
import {Engine} from '../../../game/Engine'
import {AvatarContextMenuData} from '../../../game/engine/events/ui/data/avatar/AvatarContextMenuData'
import {UIEvents} from '../../../game/engine/events/ui/UIEvents'
import {ActionId} from '../../../game/engine/ui/imagers/avatars/enum/actions/ActionId'
import {UIComponent} from '../../../game/engine/ui/components/UIComponent'
import {IComponentShowableUI} from '../../../game/core/ui/IComponentShowableUI'
import {OutgoingPacket} from '../../../game/networking/packets/outgoing/OutgoingPacket'
import {FriendsStore} from '../../../game/engine/friends/FriendsStore'

const visible = ref(false)
const menu = ref<HTMLElement | null>(null)
const avatar = ref<AvatarContextMenuData>({id: '', name: '', x: 0, y: 0, sitting: false, isSelf: false})
const left = ref(0)
const top = ref(0)
const arrowLeft = ref(138)
const opensBelow = ref(false)
const menuView = ref<'main' | 'dance' | 'actions' | 'signs'>('main')
const signNumbers = Array.from({length: 10}, (_, index) => index + 1)

// the friendship with the user of the avatar, updated when the friend list changes (e.g. request sent)
const friendsVersion = ref(0)
FriendsStore.getInstance().subscribe(() => friendsVersion.value++)

const friendship = computed(() => {
    friendsVersion.value
    const store = FriendsStore.getInstance()
    const userId = avatar.value.userId

    return {
        isFriend: store.isFriend(userId),
        hasSent: store.hasSentRequest(userId),
        hasRequestFrom: store.hasRequestFrom(userId),
    }
})

function addFriend() {
    if (avatar.value.userId == null) return
    FriendsStore.getInstance().sendRequest({userId: avatar.value.userId})
    close()
}

function acceptFriend() {
    if (avatar.value.userId == null) return
    FriendsStore.getInstance().acceptRequest(avatar.value.userId)
    close()
}
let ignoreOutsideUntil = 0

const menuStyle = computed(() => ({
    left: `${left.value}px`,
    top: `${top.value}px`,
    '--avatar-menu-arrow-left': `${arrowLeft.value}px`,
}))

function placeMenu() {
    const bounds = menu.value?.getBoundingClientRect()
    if (!bounds) return

    const margin = 8
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = bounds.width
    const height = bounds.height
    left.value = Math.max(margin, Math.min(avatar.value.x - width / 2, viewportWidth - width - margin))
    arrowLeft.value = Math.max(18, Math.min(avatar.value.x - left.value, width - 18))

    const above = avatar.value.y - height - 14
    opensBelow.value = above < margin
    top.value = opensBelow.value
        ? Math.min(avatar.value.y + 14, viewportHeight - height - margin)
        : above
}

EventManager.read(UIEvents.AVATAR_CONTEXT_MENU, (payload: AvatarContextMenuData) => {
    avatar.value = payload
    menuView.value = 'main'
    visible.value = true
    ignoreOutsideUntil = Date.now() + 100
    nextTick(placeMenu)
})

function close() {
    visible.value = false
    menuView.value = 'main'
}

function setMenuView(view: 'main' | 'dance' | 'actions' | 'signs') {
    menuView.value = view
    nextTick(placeMenu)
}

function onWindowPointerDown(event: PointerEvent) {
    if (!visible.value || Date.now() < ignoreOutsideUntil) return
    if (menu.value?.contains(event.target as Node)) return
    close()
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
}

function runAction(action: 'dance' | 'sit' | 'wave' | 'laugh' | 'blow' | 'sleep' | 'sign', danceStyle = 1, signValue = 1) {
    const entity = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository.get(avatar.value.id)
    if (!entity?.visualization) return close()

    const visualization = entity.visualization as HumanVisualization
    const actionId = action === 'sit'
        ? (avatar.value.sitting ? ActionId.STAND : ActionId.SIT)
        : ({
            dance: ActionId.DANCE,
            wave: ActionId.WAVE,
            laugh: ActionId.LAUGH,
            blow: ActionId.BLOW,
            sleep: ActionId.SLEEP,
            sign: ActionId.SIGN,
        } as const)[action]

    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
        OutgoingPacket.UserActionEvent,
        {action: actionId, danceStyle, signValue}
    )
    visualization.actions.clear()
    if (action === 'sit') {
        visualization.addAction(actionId)
    } else if (action === 'dance') {
        visualization.danceStyle = danceStyle
        visualization.addAction(actionId)
    } else if (action === 'sign') {
        visualization.signValue = signValue
        visualization.addAction(actionId)
    } else {
        visualization.addAction(actionId)
    }

    visualization.needsUpdate = true
    visualization.draw()
    close()
}

function changeLook() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager
        .getComponent<IComponentShowableUI>(UIComponent.ChangeLookUI)?.show()
    close()
}

function onResize() {
    if (visible.value) nextTick(placeMenu)
}

onMounted(() => {
    window.addEventListener('pointerdown', onWindowPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onWindowPointerDown)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss">
.avatar-context-menu {
    position: fixed;
    z-index: 100000;
    width: 156px;
    box-sizing: border-box;
    padding: 1px;
    overflow: visible;
    color: #f4f2ef;
    background: #161514;
    border: 1px solid #171615;
    border-radius: 5px;
    box-shadow: 0 2px 0 rgba(0, 0, 0, .75);
    pointer-events: auto;
    font-family: Ubuntu, Arial, sans-serif;
    image-rendering: pixelated;

    .avatar-menu-title,
    .avatar-menu-row {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 25px;
        box-sizing: border-box;
        color: inherit;
        font-size: 11px;
        line-height: 1;
    }

    .avatar-menu-title {
        height: 24px;
        background: #45413e;
        border-radius: 3px 3px 0 0;
        font-weight: 700;
        letter-spacing: 0;
    }

    .avatar-menu-row {
        padding: 0 4px;
        background: #2d2a29;
        border: 0;
        border-top: 1px solid #514d4a;
        cursor: pointer;
        text-shadow: 0 1px 0 #111;
    }

    .avatar-menu-row:hover {
        background: #3b3735;
    }

    .avatar-menu-row.unavailable {
        cursor: default;
    }

    .avatar-menu-section {
        display: flex;
        align-items: center;
        height: 19px;
        padding: 0 7px;
        color: #bbb6b1;
        background: #45413e;
        border-top: 1px solid #514d4a;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .35px;
    }

    .menu-row-arrow {
        justify-content: space-between;
        padding: 0 8px;
    }

    .menu-row-arrow span {
        font-size: 17px;
    }

    .menu-back {
        justify-content: flex-start;
        padding-left: 7px;
        background: #45413e;
    }

    .sign-row {
        justify-content: space-between;
        padding: 0 12px;
    }

    .sign-card {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 13px;
        height: 13px;
        color: #26211b;
        background: #f2d96b;
        border: 1px solid #d5ae42;
        border-radius: 2px;
        font-size: 9px;
        font-weight: 700;
    }

    .gem {
        margin-left: 8px;
        font-size: 11px;
    }

    .avatar-menu-arrow {
        position: absolute;
        left: calc(var(--avatar-menu-arrow-left) - 6px);
        bottom: -9px;
        width: 10px;
        height: 10px;
        background: #45413e;
        border-right: 1px solid #171615;
        border-bottom: 1px solid #171615;
        transform: rotate(45deg);
        z-index: -1;
    }

    &.opens-below .avatar-menu-arrow {
        top: -6px;
        bottom: auto;
        transform: rotate(225deg);
    }
}
</style>
