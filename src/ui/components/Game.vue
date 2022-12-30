<template>
    <div id="gameContainer">
        
    </div>
</template>
  
<script setup lang="ts">
import '@/assets/scss/game.scss'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Engine } from '../../game/Engine'

const route = useRoute()

const sso: string | string[] = route.params.sso

onMounted(() => {
    let engine = new Engine()

    engine.init()

    engine.sso = sso as string
})
</script>