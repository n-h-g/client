<template>
    <div
      id="navigator"
      ref="navigator"
      :class="{ hidden: !visible }"
      draggable="false"
    >
      <div class="titleBar" ref="handler">
        <div class="titleBarBg">
          <div class="title">Navigator</div>
        </div>
        <div class="closeIcon" @click="hide">&times;</div>
      </div>
      <div class="content">
        <div class="searchContainer">
          <img
            src="https://cdn.discordapp.com/attachments/799750747281031228/800333126395232266/btn_search.png"
          />
          <input
            type="text"
            class="searchInput"
            placeholder="Type here the name of the room you want to search"
          />
        </div>
        <div class="roomContainer">
          <div class="roomContainerBg">
            <div class="navigatorTabs">
              <div
                class="tab"
                :class="{ active: currentTab == 'public' }"
                @click="changeTab('public')"
              >
                Public
              </div>
              <div
                class="tab"
                :class="{ active: currentTab == 'all' }"
                @click="changeTab('all')"
              >
                All
              </div>
              <div
                class="tab"
                :class="{ active: currentTab == 'my' }"
                @click="changeTab('my')"
              >
                My
              </div>
            </div>
            <div class="roomsListContainer">
              <ul
                class="easyRoomsListUl"
                v-if="currentTab == 'my' || currentTab == 'all'"
              >
                <li
                  class="roomLi"
                  v-for="room in rooms"
                  :key="room.id"
                  v-on:click="enterRoom(room.id)"
                >
                  <span class="title">{{ room.name }}</span>
                  <div class="icons_container">
                    <div
                      class="usersNowRoom"
                      :class="{
                        navigatorRoomFull: room.users_count >= room.maxUsers,
                        greenIcon:
                          room.users_count > 0 && room.users_count < room.maxUsers,
                      }"
                    >
                      {{ room.users_count }}
                    </div>
                  </div>
                </li>
              </ul>
  
              <ul class="roomsListUl" v-else>
                <li
                  class="roomLi"
                  v-for="room in rooms"
                  :key="room.id"
                  v-on:click="enterRoom(room.id)"
                >
                  <div
                    v-if="
                      room.type == 'public' ||
                      room.type == 'all' ||
                      room.type == 'my'
                    "
                  >
                    <div class="roomInfoPreview">
                      <div class="roomPreview">
                        <img src="@/assets/images/room/roomPreview.png" />
                      </div>
                      <div
                        class="usersNowRoom"
                        :class="{
                          navigatorRoomFull: room.usersnow >= room.maxusers,
                        }"
                      >
                        {{ room.usersnow }}
                      </div>
                    </div>
                    <div class="roomInfo">
                      <span class="title">{{ room.name }}</span>
                      <p>{{ room.owner }}</p>
                    </div>
                  </div>
                </li>
              </ul>
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
    </div>
  </template>
<script setup lang="ts">import { ref } from 'vue';
import { Engine } from '../../../game/Engine';
import { OutgoingPacket } from '../../../game/networking/packets/outgoing/OutgoingPacket';

let rooms = []
let currentTab = ref("public")

const visible = true

function hide() {

}

function enterRoom(id: number) {

}

function createRoom() {

}

function changeTab(tab) {
    switch (tab) {
        case "public":
          this.currentTab = tab;
          Engine.getInstance()
            .networkingManager
            .packetManager
            .applyOut(OutgoingPacket.NavigatorPublicRooms);
          break;
        case "my":
          this.currentTab = tab;
          Engine.getInstance()
            .networkingManager
            .packetManager
            .applyOut(OutgoingPacket.NavigatorMyRooms);
          break;
        case "all":
          this.currentTab = tab;
          Engine.getInstance()
            .networkingManager
            .packetManager
            .applyOut(OutgoingPacket.NavigatorAllRooms);
          break;
    }
}
</script>  
<style lang="scss">
#navigator {
    position: fixed;
    min-height: 535px;
    width: 425px;
    background-color: #F1EEE7;
    border-radius: 16px;
    box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.35);
    left: 20vw;
    top: 10vh;
    overflow: hidden;
    pointer-events: all !important;
    font-family: 'Ubuntu', sans-serif;
    z-index: 10000;

    .footer {
      width: calc(100% - 40px);
      text-align:center;
      margin: 0 auto;
      padding-bottom: 20px;
      
      .navigatorBtn {
      outline:none;
      padding: 10px;
      border-radius: 8px;
      width: 44%;
      box-shadow: 1px #000;
      border: 0px;
      cursor:pointer;
      }
      .newRoom {
      
      background: #057199;
      border: 2px solid#057199;
      color: #eeeeee;
      }
     .randomRoom {
      background: #079847;
      border: 2px solid#079847;
      color: #eeeeee;
      }
    }

    .content {
        width: calc(100% - 50px);
        margin: 0 auto;
        height: auto;
      
        .searchContainer {
          margin-top: 10px;
          
          img {
            width: 8%;
            position:absolute;
            display: inline-block;
          }
          .searchInput {
          width: 88%;
          float: right;
          outline:none;
          border:none;
          margin-top: -1px;
          background-color: #D5D5D5;
          border-radius: 12px;
          height: 35px;
          padding: 5px;
          pointer-events: all !important;
          
          }
        }
      }
  
    .titleBar {
      width: 100%;
      height: 26px;
      padding: 10px 25px;
      padding-bottom: 25px;
      position: relative;     
  
      .titleBarBg {
        width: 100%;
        height: 100%;
        display: flex;
        margin: 0;
        padding: 0;
        align-items: center;
        flex-direction: column;
  
        .title {
          font-family: 'Quicksand', sans-serif;
          font-size: 16px;
          font-weight: bold;
          color: #272727;
          padding-left: 6px;
          padding-right: 6px;
        }
      }
  
      .closeIcon {
        position: absolute;
        right: 20px;
        top: 6px;
        color:  #272727;
        width: 13px;
        height: 13px;
        cursor: pointer;
        font-family: 'Quicksand', sans-serif;
        font-size: 20px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  
    .roomContainer {
      position: relative;
      margin-top: 0px;
      width: 100%;
      height: calc(100% - 26px);
  
      .roomContainerBg {
        $margin: 8px;
        border-radius: 12px;
        margin: $margin;
        width: calc(100% - #{$margin} * 2);
        height: calc(100% - #{$margin} * 2);
  
        .navigatorTabs {
          margin-top: 5px;
          /* margin-left: 6px; */
          margin-right: 5px;
          padding: 10px;
          display: flex;
          width: calc(100% - 5px * 2);
          width: 100%;
          justify-items: center;
          align-items: center;
          justify-content: center;
  
          .tab {
            text-align: center;
            padding: 4px 19px;
            background-color: #D5D5D5;
            color: #333;
            font-family: 'Ubuntu', sans-serif;
            font-size: 16px;
            min-height: 20px;
            border-radius: 12px;
  
            &.active {
              background-color: #fff;
              border-bottom: 1px solid #fff;
            }
          }
        }
  
        .roomsListContainer {
          margin-top: -1px;
          margin-left: 5px;
          margin-right: 5px;
  
          display: flex;
          width: calc(100% - 5px * 2);
          height: 363px;
  
          border-radius: 4px;
          overflow-y: auto;
  
          .easyRoomsListUl {
            width: 100%;
            margin-top: 5px;
            display: flex;
            flex-direction: column;
            overflow-y: scroll;
  
            .roomLi {
              font-size: 16px;
              width: 100%;
              outline: none;
              border: none;
              background-color: #D5D5D5;
              border-radius: 12px;
              padding: 5px;
              width: 100%;
              color: #272727;
              margin: 0 auto;
              margin-bottom: 6px;
              display: flex;
              cursor: pointer;

  
              &:hover {
                background: #C9F1F7;
              }
  
              .title {
                width: 70%;
                text-align: left;
                margin: auto 0;
                overflow: hidden;
                color: #000;
                font-family: 'Ubuntu', sans-serif;
                font-size: 16px;
                font-weight: 400;
                font-stretch: 100%;
                font-style: normal;
              }
  
              .icons_container {
                display: flex;
                width: 30%;
                justify-content: flex-end;
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
                  background-image: url("~@/assets/images/navigator/icon_g.png");
  
                  &.greenIcon {
                    background-image: url("~@/assets/images/navigator/icon_g.png");
                  }
  
                  &.navigatorRoomFull {
                    background-image: url("~@/assets/images/navigator/icon_r.png");
                  }
                }
              }
            }
          }
  
          .roomsListUl {
            width: 100%;
  
            .roomLi {
              width: 100%;
              padding: 4px;
  
              &:hover {
                background-color: darken(#fff, 10%);
              }
  
              & > div {
                display: flex;
                padding-bottom: 4px;
  
                .roomInfoPreview {
                  flex-grow: 0;
                  display: flex;
                  flex-direction: column;
  
                  .roomPreview {
                    width: 80px;
                    overflow: hidden;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                  }
  
                  .usersNowRoom {
                    font-family: Volter;
                    text-align: center;
                    color: #fff;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    background-color: #008149;
                    margin-top: -10px;
  
                    &.navigatorRoomFull {
                      background-color: #d3004d;
                    }
                  }
                }
  
                .roomInfo {
                  flex-grow: 1;
                  padding: 4px;
  
                  .title {
                    font-weight: 700;
                  }
  
                  p {
                    font-size: small;
                    font-style: italic;
                  }
                }
              }
            }
          }
        }
      }
    }
  
    .createRoomContainer {
      background-color: #cbcbcb;
      border: 1px solid #979797;
      border-radius: 4px;
      height: 27px;
      width: calc(100% - 10px);
      margin-top: 5px;
      margin-left: 5px;
      display: flex;
  
      .info {
        display: flex;
        margin: auto auto auto 5px;
  
        img {
          margin: auto 10px;
        }
  
        span {
          color: #000;
          margin: auto 10px;
          font-family: Volter;
          font-size: 9px;
        }
      }
  
      button {
        margin: auto 10px auto auto;
        background: #fff;
        border: 1px solid #000;
        height: 20px;
        padding: 0 8px;
        border-radius: 3px;
        font: inherit;
        font-family: Volter;
        font-size: 9px;
        font-weight: 400;
        cursor: pointer;
  
        &:hover {
          background-color: #cbcbcb;
        }
      }
    }
  }

</style>