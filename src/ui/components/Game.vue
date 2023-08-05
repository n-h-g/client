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
    const sso: string = route.params.sso[0]
    const engine: Engine = new Engine()
    engine.init()
    engine.sso = sso
})
</script>