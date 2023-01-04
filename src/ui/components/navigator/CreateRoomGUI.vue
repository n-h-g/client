<template>
  <Dialog title="Create Room" class="createRoom" :box="UIEventsType.NAVIGATOR">
    <div class="createRoomContainer">
      <h2>Choose the model</h2>
      <div class="roomGrid">
        <div class="roomDiv" v-for="model in roomModels" :key="model.id" @click="selectModel(model)"
          :class="{ selected: selectedModel.id == model.id }">
          <img :src="getRoomImage(model.name)" :alt="model.name" />
          <div class="tile_count">
            <img src="@/assets/images/createroom/tile_icon_black.png" />
            <span>{{ model.tileCount }}
              Tiles</span>
          </div>
        </div>
      </div>
      <div class="roomInfo">
        <h2>Name</h2>
        <input maxlength="50" type="text" placeholder="Nome" v-model="roomName" :class="{ error: errorCreate }" />
        <div class="button_container">
          <button @click="checkAndCreateRoom()">
            Create
          </button>
          <button @click="toggle()">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { IComponentShowableUI } from "../../../game/core/ui/IComponentShowableUI";
import { Engine } from "../../../game/Engine";
import { UIComponent } from "../../../game/engine/ui/components/UIComponent";
import { UIEventsType } from "../../../game/engine/ui/events/UIEventsType"
import { OutgoingPacket } from '../../../game/networking/packets/outgoing/OutgoingPacket';
import Dialog from "../dialog/Dialog.vue";

const roomName = ref()
const errorCreate = ref()

let roomModels = [
  {
    tileCount: 104,
    name: "model_0",
    id: 1,
    door_x: 3,
    door_y: 1,
    door_dir: 0,
    layout: "000000000000000000000000000000000000000000000000000000000000000000000/011111111001111111100111111110000000000000000000000000000000000000000/011111111001111111100111111110000000000000000000000000000000000000000/011111111001111111100111111110000000000000000000000000000000000001111/111111111001111111100111111110000000000000000000000000000000000001111/011111111001111111100111111110000000000000000000000000000000000001111/011111111001111111100111111110000000000000000000000000000000000001111/011111111001111111100111111110000000000000000000000000000000000000000/011111111001111111100111111110000000000000000000000000000000000000000/000000000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    tileCount: 104,
    name: "model_a",
    id: 2,
    door_x: 5,
    door_y: 3,
    door_dir: 2,
    layout: "000000000000/000011111111/000011111111/000011111111/000011111111/000111111111/000011111111/000011111111/000011111111/000011111111/000011111111/000011111111/000011111111/000011111111/000000000000/000000000000"
  },
  {
    tileCount: 94,
    name: "model_b",
    id: 3,
    door_x: 4,
    door_y: 0,
    door_dir: 2,
    layout: "111111111111/1111111100011/11111111000/1111100000111/111110000000/000000000000/100000000000/111111111/111111111/111111111/111111111/111111111/111111111"
  }
]

let selectedModel = ref(roomModels[0])

function selectModel(model) {
  selectedModel.value = model
}

function getRoomImage(name: string): string {
  return "/../../src/assets/images/createroom/" + name + ".png";
}

function checkAndCreateRoom() {
  let body = {
    name: roomName.value,
    desc: "",
    maxUsers: 20,
    door_x: selectedModel.value.door_x,
    door_y: selectedModel.value.door_y,
    door_dir: selectedModel.value.door_dir,
    layout: selectedModel.value.layout,
    mold: selectedModel.value
  }
  Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.CreateNewRoom, body);
}

function toggle() {
  Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.CreateRoomUI).hide()
}
</script>

<style lang="scss">
.createRoom {
  position: fixed;
  height: 435px;
  width: 320px;

  .createRoomContainer {
    background-color: #fff;
    height: 400px;
    padding: 2px 8px;
    box-sizing: border-box;

    border-top: none;
    width: 100%;

    h2 {
      font: inherit;
      text-align: left;
      font-weight: 700;
      color: #000;
      margin: 0;
      margin-top: 3px;
    }

    .roomGrid {
      width: 100%;
      height: 290px;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      overflow-y: scroll;
      overflow-x: hidden;
      margin-top: 5px;

      .roomDiv {
        width: 133px;
        height: 133px;
        background: #cbcbcb;
        border: 1px solid #979797;
        border-radius: 5px;
        box-sizing: border-box;
        margin: 1px;
        font: inherit;
        position: relative;
        overflow: hidden;
        display: flex;

        &:hover,
        &.selected {
          background: #6e8184;
        }

        img {
          object-fit: none;
          margin: auto;
        }

        .tile_count {
          position: absolute;
          bottom: 3px;
          display: flex;
          width: 80%;

          img {
            margin: auto;
          }

          span {
            margin: auto;
          }
        }
      }
    }

    .roomInfo {
      display: block;
      width: calc(100% - 10px);
      margin-top: 5px;
      margin-left: 5px;

      h2 {
        font: inherit;
        text-align: left;
        font-weight: 700;
        color: #000;
        margin-top: 3px;
      }

      input {
        width: 100%;
        background: none;
        font: inherit;
        margin-top: 5px;
        height: 20px;
        border: 1px solid #000;
        box-sizing: border-box;
        padding: 5px;

        &.error {
          border: 1px solid #c62828;
        }
      }

      .button_container {
        width: 100%;
        display: flex;
        margin-top: 7px;

        button {
          margin: auto;
          background: none;
          border: 1px solid #000;
          border-radius: 3px;
          height: 20px;
          font: inherit;
          padding: 0 8px;
          cursor: pointer;

          &:hover {
            background-color: #cbcbcb;
          }
        }
      }
    }
  }
}
</style>