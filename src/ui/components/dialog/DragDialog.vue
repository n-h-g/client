<template>
    <div ref="elementRef">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';

const elementRef = ref(null)
const start = ref({
    x: 0,
    y: 0
})
const delta = ref({
    x: 0,
    y: 0
})
const offset = ref({
    x: 0,
    y: 0
})
const dragging = ref(false)

onMounted(() => {
    elementRef.value.querySelector('.drag-handler').addEventListener('mousedown', onDragMouseDown)
    elementRef.value.querySelector('.drag-handler').addEventListener('mouseup', onDragMouseUp)
})

watchEffect(() => {
    if (dragging.value) {
        elementRef.value.addEventListener('mousemove', onDragMouseMove)
        elementRef.value.style.transform = `translate(${ offset.value.x + delta.value.x }px, ${ offset.value.y + delta.value.y }px)`
    }
})

const completeDrag = () => {
    let offsetX = (offset.value.x + delta.value.x)
    let offsetY = (offset.value.y + delta.value.y)

    delta.value.x = 0
    delta.value.y = 0
    offset.value.x = offsetX
    offset.value.y = offsetY
    dragging.value = false
}

const onDragMouseMove = (ev: MouseEvent) => {
    delta.value.x = (ev.clientX - start.value.x)
    delta.value.y = (ev.clientY - start.value.y)
}

const onDragMouseDown = (ev: MouseEvent) => {
    startDragging(ev.clientX, ev.clientY)
}

const onDragMouseUp = () => {
    completeDrag()
}

const startDragging = (startX: number, startY: number) => {
    start.value.x = startX
    start.value.y = startY
    dragging.value = true
}
</script>