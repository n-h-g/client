<template>
  <Dialog title="Navigator" :box="UIEventsType.NAVIGATOR">
    <div class="sub">
      <div class="item" :class="{ active: currentTab == 'public' }" @click="changeTab('public')">
        Public
      </div>
      <div class="item" :class="{ active: currentTab == 'all' }" @click="changeTab('all')">
        All
      </div>
      <div class="item" :class="{ active: currentTab == 'my' }" @click="changeTab('my')">
        My
      </div>
    </div>
    <div class="searchContainer">
      <img src="https://cdn.discordapp.com/attachments/799750747281031228/800333126395232266/btn_search.png" />
      <input type="text" class="searchInput" placeholder="Type here the name of the room you want to search" />
    </div>
    <div class="roomContainer" v-if="currentTab == 'my' || currentTab == 'all'">
      <div class="room" v-for="room in rooms" :key="room.id" @click="enterRoom(room.id)">
        <span class="title">{{ room.name }}</span>
        <div class="icons_container">
          <div class="usersNowRoom" :class="{
  navigatorRoomFull: room.users_count >= room.maxUsers,
  greenIcon: room.users_count > 0 && room.users_count < room.maxUsers,
}">
            {{ room.users_count }}
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <button type="submit" class="navigatorBtn newRoom" @click="createRoom()">
        New Room
      </button>
      <button type="submit" class="navigatorBtn randomRoom">
        Random Room
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Engine } from "../../../game/Engine"
import { EventManager } from "../../../game/engine/ui/events/EventManager"
import { UIEvents } from "../../../game/engine/ui/events/UIEvents"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import { UIEventsType } from "../../../game/engine/ui/events/UIEventsType"
import Dialog from '../dialog/Dialog.vue'
import { NavigatorRoomsEventData } from "../../../game/engine/ui/events/data/navigator/NavigatorRooms"
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'

let rooms = ref([])
let currentTab = ref("public");

EventManager.read(UIEvents.NAVIGATOR_ROOMS_ADDED, (event: NavigatorRoomsEventData) => {
  rooms.value = event.rooms
})

function hide() {
  Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.NavigatorUI).hide()
}

function enterRoom(roomId: number) {
  hide()
  Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserEnterRoom, {
    id: roomId
  })
}

function createRoom() { 
  Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.CreateRoomUI).toggle()
}

function changeTab(tab: string) {
  switch (tab) {
    case "public":
      this.currentTab = tab
      Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.NavigatorPublicRooms)
      break;
    case "my":
      this.currentTab = tab;
      Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.NavigatorMyRooms)
      break;
    case "all":
      this.currentTab = tab;
      Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.NavigatorAllRooms)
      break;
  }
}
</script>

<style lang="scss">
#navigator {
  position: fixed;
  height: 500px;
  width: 425px;
  left: 20vw;
  top: 10vh;
  pointer-events: all;
  z-index: 100;

  .searchContainer {
    margin-top: 10px;
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    img {
      width: 8%;
      position: relative;
    }

    .searchInput {
      width: 88%;
      float: right;
      outline: none;
      border: none;
      background-color: #d5d5d5;
      border-radius: 12px;
      height: 35px;
      padding: 5px;
      pointer-events: all;
    }
  }

  .roomContainer {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    height: auto;
    margin-top: 20px;

    .room {
      width: 100%;
      padding: 5px 0 5px 0;
      font-size: 16px;
      outline: none;
      border: none;
      background-color: #d5d5d5;
      border-radius: 12px;
      width: 100%;
      color: #272727;
      margin: 0 auto;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      cursor: pointer;
      position: relative;
      left: 0;

      .title {
        width: auto;
        text-align: left;
        margin: auto 0;
        color: #000;
        font-family: "Ubuntu", sans-serif;
        font-size: 16px;
        font-weight: 400;
        font-stretch: 100%;
        font-style: normal;
      }

      .icons_container {
        width: 34px;
        height: 13px;
        font-family: Volter;
        font-size: 9px;

        .usersNowRoom {
          font: inherit;
          text-align: right;
          color: #fff;
          width: 34px;
          height: 13px;
          border: none;
          background: none;
          margin: auto 0 auto 2px;
          line-height: 13px;
          padding: 1px 6px;
          background-image: url("@/assets/images/navigator/icon_g.png");
          background-repeat: no-repeat;
          background-position-x: 10px;

          &.greenIcon {
            background-image: url("@/assets/images/navigator/icon_g.png");
          }

          &.navigatorRoomFull {
            background-image: url("@/assets/images/navigator/icon_r.png");
          }
        }
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 4px;
    width: 100%;
    display: flex;
    justify-content: center;

    .navigatorBtn {
      outline: none;
      border-radius: 8px;
      width: 44%;
      height: 30px;
      box-shadow: 1px #000;
      border: 0px;
      cursor: pointer;

      &.newRoom {
        background: #057199;
        border: 2px solid#057199;
        color: #eeeeee;
      }

      &.randomRoom {
        background: #079847;
        border: 2px solid#079847;
        color: #eeeeee;
      }
    }
  }
}
</style>
