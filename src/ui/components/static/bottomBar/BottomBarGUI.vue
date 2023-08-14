<template>
  <div class="bottomBar">
    <div class="leftOptions">
      <div class="menuButton home"></div>
      <div class="menuButton inventory" @click="toggle('inventory')">
      </div>
      <div class="menuButton navigator" @click="toggle('navigator')">
      </div>
      <div class="menuButton catalog" @click="toggle('catalogue')">
      </div>
      <div class="menuButton friends" @click="toggle('friends')">
      </div>
    </div>
    <ChatBar />
    <div class="rightOptions">
      <div class="menuButton search_friends" @click="toggle('search_friends')"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Engine } from '../../../../game/Engine'
import { UIComponent } from '../../../../game/engine/ui/components/UIComponent'
import { IComponentShowableUI } from '../../../../game/core/ui/IComponentShowableUI'
import ChatBar from './ChatBar.vue'

function toggle(ui: string) {
  switch (ui) {
    case 'navigator':
      Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.NavigatorUI).toggle()
      break
    case 'inventory':
      Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.InventoryUI).toggle()
      break
    case 'catalogue':
      Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.CatalogueUI).toggle()
      break
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/game.scss';

@-moz-keyframes spin {
  100% {
    -moz-transform: rotate(360deg);
  }
}

@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.bottomBar {
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 2px 0;
  height: 50px;
  border-top: 2px solid #53524f;
  border-bottom: 1px solid #53524f;
  background-color: #2e2e2c;
  box-shadow: 0 -1px 0 0 rgba(0, 0, 0, .6);

  .chatBar {
    position: fixed;
    width: 100%;
    bottom: 0;
    height: auto;

    .chatInput {
      font-family: 'Ubuntu';
      width: 580px;
      height: 38px;
      border: 2px solid #000;
      border-radius: 8px;
      margin: auto 0;
      background-color: #e4e4e4;
      display: flex;
      flex-direction: row;
      position: absolute;
      left: 50%;
      bottom: 5px;
      transform: translateX(-50%);
      z-index: 10000;
      outline: none;
      pointer-events: all !important;

      .chatInput::before {
        height: 40px;
        width: 50px;
        background-color: red;
        position: absolute;
      }
    }
  }

  .muted {
    color: red;
  }

  & .rightOptions {
    display: flex;
    right: -40px;
  }

  & .leftOptions {
    left: 10px;
  }

  & .rightOptions, .leftOptions {
    position: absolute;
    top: 0;
    min-width: 125px;
    text-align: center;
    margin-bottom: 30px;

    & .menuButton {
      display: inline-block;
      position: relative;
      pointer-events: all;
      text-align: center;
      cursor: pointer;
      outline: none;
      filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, .30));
      margin: 0 9px;

      &:hover {
        top: -1px;
        left: -1px;
        filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, .50))
      }

      &.navigator {
        background-image: url("@/assets/images/bottom-bar/rooms.png");
        width: 44px;
        height: 30px;
      }

      &.inventory {
        background-image: url("@/assets/images/bottom-bar/inventory.png");
        width: 44px;
        height: 41px;
        top: 5px;
      }

      &.catalog {
        background-image: url("@/assets/images/bottom-bar/catalog.png");
        width: 37px;
        height: 36px
      }

      &.friends {
        background-image: url("@/assets/images/bottom-bar/friend_all.png");
        height: 33px;
        width: 32px;
      }

      &.home {
        background-image: url("@/assets/images/bottom-bar/home.png");
        height: 30px;
        width: 32px;
      }

      &.search_friends {
        background-image: url("@/assets/images/bottom-bar/friend_search.png");
        width: 29px;
        height: 33px;
        top: 10px;
      }

    }
  }

  & .rightOptions .friend {
    width: 500px;
    padding: 10px 15px;
    text-align: center;
    margin-bottom: auto;
    max-width: 150px;
    background-color: rgba(11, 36, 56, 0.78);
    border-bottom: 2px solid rgba(11, 36, 56, 0.98);
    color: #fff;
    font-weight: bold;
    border-radius: 16px;
    cursor: pointer;
    pointer-events: all;
    margin-left: 5px;
  }

  & .rightOptions .friend .optionVisible {
    margin: 0 auto;
    text-align: center;
  }

  & .rightOptions .friend .optionVisible button {
    display: block;
    margin-top: 2px;
    outline: none;
    padding: 10px;
    border-radius: 8px;
    width: 120px;
    box-shadow: 1px #000;
    border: 0px;
    cursor: pointer;
    color: #000;
    box-shadow: 1px #ccc;
  }

  .roomInfo {
    height: 108px;
    position: absolute;
    left: 0;
    bottom: 184px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    pointer-events: all;

    .roomInfoIconContainer {
      height: 100%;
      width: 14px;
      cursor: pointer;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      background-color: #3a3832;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2;

      .roomInfoIcon {
        background-image: url("~@/assets/images/bottom-bar/settings.png");
        background-repeat: no-repeat;
        height: 8px;
        width: 6px;
        display: block;
      }
    }

    .roomInfoButtonsContainer {
      z-index: 1;
      left: 0;
      position: absolute;
      top: 0;
      height: 100%;
      width: 160px;
      background-color: #1b1b17;
      display: none;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      padding-left: 24px;
      padding-top: 8px;
      overflow: hidden;
      pointer-events: all;

      .roomInfoList {
        color: #a7a7a6;
        text-decoration: underline;

        li {
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          justify-content: flex-start;

          flex-direction: row;

          .icon {
            vertical-align: middle;
            display: inline-block;
            margin-right: 2px;
            width: 25px;
            height: 25px;
            justify-content: center;
            background-position: center;

            &.settings {
              background-image: url("~@/assets/images/bottom-bar/settings.png");
              background-repeat: no-repeat;
            }

            &.zoom {
              background-image: url("~@/assets/images/bottom-bar/zoom.png");
              background-repeat: no-repeat;
            }
          }

          &:hover {
            .icon {
              &.settings {
                background-image: url("~@/assets/images/bottom-bar/settings_hover.png");
              }

              &.zoom {
                background-image: url("~@/assets/images/bottom-bar/zoom_hover.png");
              }
            }
          }
        }
      }
    }

    &.open {
      height: 147px;

      .roomInfoIconContainer {
        .roomInfoIcon {
          background-image: url("~@/assets/images/bottom-bar/room_infoIconLeft.png");
        }
      }

      .roomInfoButtonsContainer {
        display: block;
      }
    }
  }
}
</style>