<template>
    <div id="gameContainer">
        
    </div>
</template>
  
<script setup lang="ts">
import '@/assets/scss/game.scss'
import { onMounted } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router'
import { Engine } from '../../game/Engine'

const SSO_KEY = 'nhg_sso'

function rememberSso(sso: string) {
    try { localStorage.setItem(SSO_KEY, sso) } catch { /* private window: only this page */ }
}

function rememberedSso(): string | undefined {
    try { return localStorage.getItem(SSO_KEY) ?? undefined } catch { return undefined }
}

onMounted(() => {
    const route: RouteLocationNormalizedLoaded = useRoute()
    var sso: string;
    // a string ("/sso/1001"), an array only for a repeatable param: [0] of the string took its first character
    // (the user 1001 logged in as the user 1)
    const param = route.params?.sso
    if (param != null)
        sso = Array.isArray(param) ? param[0] : param

    // the link of a room has no SSO: the last one of this browser (the ticket is the user id for now; with a
    // one-time ticket this goes)
    if (sso != null) rememberSso(sso)
    else sso = rememberedSso()

    const roomParam = route.params?.roomId ?? route.query?.room
    const roomId = Number(Array.isArray(roomParam) ? roomParam[0] : roomParam)

    const engine: Engine = new Engine()
    engine.init()
    if (sso != null)
        engine.sso = sso
    if (Number.isInteger(roomId) && roomId > 0)
        engine.pendingRoomId = roomId
})
</script>