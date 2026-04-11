<template>
  <div
    id="dialog"
    ref="dialog"
    :class="props.className"
    :style="style"
  >
    <div class="title-bar drag-handler" @pointerdown="dragStart">
      {{ props.title }}
      <div class="closeIcon" @click="hide"></div>
    </div>

    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { EventManager } from "../../../game/core/events/EventManager";
import { DialogEventData } from "../../../game/engine/events/ui/data/general/Dialog";
import { UIEvents } from "../../../game/engine/events/ui/UIEvents";
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType";

const props = defineProps<{
  title: string;
  box: UIEventsType;
  className: string;
}>();

function hide() {
  EventManager.emit<DialogEventData>(UIEvents.CLOSE, {
    type: props.box,
  });
}

const dialog = ref<HTMLDivElement | null>(null);

const position = ref({
  x: 0,
  y: 0,
});

const dragging = ref(false);
const offset = ref({ x: 0, y: 0 });

const style = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
}));

function dragStart(ev: PointerEvent) {
  dragging.value = true;

  offset.value.x = ev.clientX - position.value.x;
  offset.value.y = ev.clientY - position.value.y;

  window.addEventListener("pointermove", drag);
  window.addEventListener("pointerup", dragEnd);
}

function drag(ev: PointerEvent) {
  if (!dragging.value) return;

  position.value.x = ev.clientX - offset.value.x;
  position.value.y = ev.clientY - offset.value.y;
}

function dragEnd() {
  dragging.value = false;

  window.removeEventListener("pointermove", drag);
  window.removeEventListener("pointerup", dragEnd);

  localStorage.setItem(
    `position_${props.box}`,
    JSON.stringify(position.value)
  );
}

onMounted(() => {
  const saved = localStorage.getItem(`position_${props.box}`);

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    position.value.x = parsed.x ?? 0;
    position.value.y = parsed.y ?? 0;
  } catch (e) {
    console.warn("Invalid saved dialog position");
  }
});
</script>

<style lang="scss">
#dialog {
    border-radius: 6px;
    border: 6px solid #367897;
    box-shadow: #408caf 5px 5px inset, #408caf -5px -5px inset;
    pointer-events: all;
    z-index: 1;

    .title-bar {
        position: relative;
        height: 31px;
        background-color: #367897;
        color: #FFF;
        font-size: 17px;
        font-weight: bold;
        line-height: 31px;
        text-align: center;
        cursor: default;

        .closeIcon {
            float: right;
            width: 19px;
            height: 20px;
            top: 5px;
            right: 5px;
            position: relative;
            cursor: pointer;
            background: url("@/assets/images/closeIcon.png") no-repeat;

            &:hover {
                background: url("@/assets/images/closeIconHover.png") no-repeat;
            }
        }
    }

    .sub {
        position: relative;
        display: table;
        margin: auto;
        letter-spacing: -1px;

        .item {
            color: #000;
            text-shadow: none;
            background-color: #E2E2E2;
            box-shadow: inset 0 3px 0 #fff, inset 0 -15px 0px #cdcdcd;
            position: relative;
            display: inline-block;
            padding: 5px 10px;
            font-size: 19px;
            line-height: 19px;
            text-decoration: none;
            border-radius: 6px 6px 0 0;
            cursor: pointer;

            &.active {
                border: 1px solid #000;
            }
        }
    }

    .content {
        position: relative;
        font-size: 13px;
        background-color: #e9e9e1;
        border-radius: 6px;
        padding: 0 5px 0 5px;
        height: calc(100% - 31px);
        bottom: 0px;
        cursor: default;
    }
}
</style>