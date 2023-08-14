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
    if (route.params != null && route.params.sso != null)
        sso = route.params.sso[0]
    const engine: Engine = new Engine()
    engine.init()
    if (sso != null)
        engine.sso = sso
})
</script>