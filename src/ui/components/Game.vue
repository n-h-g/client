<template>
    <div id="gameContainer">
        
    </div>
</template>
  
<script setup lang="ts">
import '@/assets/scss/game.scss'
import { onMounted } from 'vue'
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router'
import { Engine } from '../../game/Engine'

onMounted(() => {
    const route: RouteLocationNormalizedLoaded = useRoute()
    var sso: string;
    // a string ("/sso/1001"), an array only for a repeatable param: [0] of the string took its first character
    // (the user 1001 logged in as the user 1)
    const param = route.params?.sso
    if (param != null)
        sso = Array.isArray(param) ? param[0] : param
    const engine: Engine = new Engine()
    engine.init()
    if (sso != null)
        engine.sso = sso
})
</script>