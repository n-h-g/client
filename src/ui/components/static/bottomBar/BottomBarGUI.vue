<template>
    <div class="bottomBar">
        <div class="leftOptions">
            <div class="menuButton avatar">
                <img src="@/assets/images/bottom-bar/avatar.png" class="avatar-img">
            </div>
            <div class="menuButton inventory" @click="toggle('inventory')">
                <img src="@/assets/images/bottom-bar/inventory.png" class="img">
            </div>
            <div class="menuButton navigator" @click="toggle('navigator')">
                <img src="@/assets/images/bottom-bar/navigator.png" class="img">
            </div>
            <div class="menuButton catalog" @click="toggle('catalog')">
                <img src="@/assets/images/bottom-bar/catalog.png" class="img">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
function toggle(ui: string) {
    
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
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  height: 85px;
  background-color: transparent;
  z-index: 10000;

  & .chatInput {
    position: relative;
    display: block;
    padding: 10px 25px;
    font-size: 1.2rem;
    outline: 0;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    height: 53px;
    margin-top: 15px;
    width: calc(50% - 630px);
    border: 2px solid rgba(0, 0, 0, 0.2);
    box-shadow: 2px 3px 0 rgba(0, 0, 0, 0.15);
    pointer-events: all;
    color: #000;
  }

  .muted {
    color: red;
  }

  & .rightOptions {
    display: flex;
    right: 80px;
  }

  & .leftOptions {
    left: 10px;
  }

  & .rightOptions,
  .leftOptions {
    position: absolute;
    top: 0;
    min-width: 125px;
    text-align: center;
    margin-bottom: 30px;

    & .menuButton {
      height: 55px;
      width: 55px;
      display: inline-block;
      margin: 0 7px;
      border-radius: 50%;
      position: relative;
      pointer-events: all;
      text-align: center;
      padding: 8px;
      -webkit-box-shadow: 0px 0px 23px -2px rgba(0, 0, 0, 0.26);
      box-shadow: 0px 0px 23px -2px rgba(0, 0, 0, 0.26);
      border: 1px solid rgba(0, 0, 0, 0.35);
      background-color: rgb(90, 126, 215);
      cursor: pointer;
      outline: none;

      &:hover {
        border: 1px solid rgba(0, 0, 0, 0.65);
      }

      & .img {
        background-position: center;
        background-repeat: no-repeat;
        width: 40px;
        height: 36px;
        filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.15));
        box-shadow: 0px 0px 23px -2px rgba(0, 0, 0, 0.26);
      }

      &.inventory {
        background-color: rgb(63, 141, 222);
        position: absolute;
        transform: translate(-4.8em, -4.3em);
      }
      &.navigator {
        background-color: rgb(46, 148, 85);
        position: absolute;
        transform: translate(-0.8em, -3em);
      }
      &.catalog {
        background-color: rgb(217, 176, 32);
        padding-top: 5px;
        padding-left: 9px;
      }

      &.navigator .img {
        background-image: url("@/assets/images/bottom-bar/navigator.png");
      }

      &.catalog .img {
        background-image: url("@/assets/images/bottom-bar/catalog.png");
      }

      &.inventory .img {
        background-image: url("@/assets/images/bottom-bar/inventory.png");
      }

      &.friends {
        padding: 5px;
        line-height: 4.6;
      }

      &.settings .img {
        background-image: url("@/assets/images/bottom-bar/settings.png");
      }

      &.avatar {
        background-color: rgb(97, 80, 155);
        height: 75px;
        width: 75px;
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