<template>
    <div id="gameContainer">
        
    </div>
</template>
  
<script setup lang="ts">
import '@/assets/scss/game.scss'
import { onMounted } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router'
import { Engine } from '../../game/Engine'
import { config } from '../../game/configuration/Configuration'
import { getLegacySso, getToken, rememberLegacySso } from '../../game/auth/session'

onMounted(() => {
    const route: RouteLocationNormalizedLoaded = useRoute()
    // a string ("/sso/1001"), an array only for a repeatable param: [0] of the string took its first character
    // (the user 1001 logged in as the user 1)
    const param = route.params?.sso
    const ssoParam = param == null ? undefined : (Array.isArray(param) ? param[0] : param)

    const roomParam = route.params?.roomId ?? route.query?.room
    const roomId = Number(Array.isArray(roomParam) ? roomParam[0] : roomParam)

    const engine: Engine = new Engine()

    // the credentials before the connection (made in init): /sso/<id> if allowed, else the token of the account,
    // else the last legacy SSO of this browser (the link of a room has none)
    if (ssoParam && config.auth.legacySso) {
        rememberLegacySso(ssoParam)
        engine.sso = ssoParam
    } else {
        const token = getToken()
        if (token) engine.token = token
        else {
            const sso = getLegacySso()
            if (sso) engine.sso = sso
        }
    }

    engine.init()
    if (Number.isInteger(roomId) && roomId > 0)
        engine.pendingRoomId = roomId
})
</script>
