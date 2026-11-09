<template>
    <div v-if="visible" class="avatar-name-tooltip" :style="{ left: `${x}px`, top: `${y}px` }">
        {{ name }}
        <div class="avatar-name-tooltip-arrow"></div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { Engine } from '../../../game/Engine'
import { AvatarHoverData } from '../../../game/engine/events/ui/data/avatar/AvatarHoverData'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'

/** Pixels between the top of the avatar and the arrow of the tooltip. */
const GAP = 4

const visible = ref(false)
const name = ref('')
const x = ref(0)
const y = ref(0)

/** The room entity of the avatar under the mouse (see RoomLogic), null: no avatar. */
let avatarId: string | null = null
let frame: number | null = null

EventManager.read(UIEvents.AVATAR_HOVER, (payload: AvatarHoverData) => {
    avatarId = payload?.id ?? null
    name.value = payload?.name ?? ''

    if (avatarId) follow()
    else hide()
})

// the menu of the avatar is open over it: the name is already in the menu
EventManager.read(UIEvents.AVATAR_CONTEXT_MENU, () => {
    avatarId = null
    hide()
})

/** The tooltip stays over the head of the avatar while it walks, dances... (its position at every frame). */
function follow() {
    const container = avatarId
        ? Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.get(avatarId)?.visualization?.container
        : null

    if (!container || container.destroyed) {
        hide()
        return
    }

    const bounds = container.getBounds()
    x.value = Math.round(bounds.x + bounds.width / 2)
    y.value = Math.round(bounds.y - GAP)
    visible.value = true

    if (frame === null) frame = requestAnimationFrame(onFrame)
}

function onFrame() {
    frame = null
    if (avatarId) follow()
}

function hide() {
    visible.value = false
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
}

onBeforeUnmount(hide)
</script>

<style lang="scss">
.avatar-name-tooltip {
    position: fixed;
    z-index: 99999;
    transform: translate(-50%, calc(-100% - 6px));
    padding: 5px 9px;
    color: #fff;
    background: #2c2b2a;
    border-radius: 5px;
    font-family: Ubuntu, Arial, sans-serif;
    font-size: 12px;
    line-height: 14px;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;

    .avatar-name-tooltip-arrow {
        position: absolute;
        left: 50%;
        bottom: -6px;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #2c2b2a;
    }
}
</style>
