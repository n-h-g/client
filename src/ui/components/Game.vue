<template>
    <div id="gameContainer" ref="game">

    </div>
</template>
  
<script setup lang="ts">
import { onMounted } from 'vue'
import { Engine } from '../../game/Engine'

onMounted(() => {
    new Engine().init()
})
</script>