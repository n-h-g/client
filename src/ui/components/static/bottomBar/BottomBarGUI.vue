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
        <span class="badge" v-if="friends.requests.length > 0">{{ friends.requests.length }}</span>
      </div>
      <!-- the open private chats, blinking when there is a new message -->
      <div
        v-if="messenger.conversations.length > 0"
        class="menuButton messenger"
        :class="{ unread: messengerUnread }"
        title="Messenger"
        @click="toggleMessenger"
      ></div>
    </div>
    <div class="separator"></div>
    <ChatBar />
    <div class="rightOptions">
      <div class="menuButton search_friends" title="Trova amici" @click="toggle('friends')"></div>

      <!-- the friend bar: the friends, and "Trova Amici" in the empty places (as Habbo) -->
      <div class="friendBar" ref="friendBar">
        <button class="friendBarArrow" :disabled="page === 0" @click="page--">‹</button>
        <div
          v-for="(slot, index) in slots"
          :key="slot ? 'f' + slot.id : 'empty' + index"
          class="friendBarItem"
          :class="{ offline: slot && !slot.online, findFriends: !slot, expanded: slot && slot.id === expandedId }"
          :title="slot ? (slot.online ? slot.username + ' (online)' : slot.username + ' (offline)') : 'Trova amici'"
        >
          <!-- a friend opens its actions (as Habbo), an empty place the friends window -->
          <div class="friendBarMain" @click="slot ? toggleExpanded(slot.id) : toggle('friends')">
            <img v-if="slot && heads[slot.look]" class="friendBarHead" :src="heads[slot.look]" />
            <div v-else class="friendBarHead placeholder"></div>
            <span class="friendBarName">{{ slot ? slot.username : 'Trova Amici' }}</span>
          </div>
          <div class="friendBarActions" v-if="slot && slot.id === expandedId">
            <button class="friendBarAction message" title="Messaggio" :disabled="!slot.online" @click="openChat(slot.id)"></button>
            <button class="friendBarAction follow" title="Segui" :disabled="!slot.online" @click="follow(slot.id)"></button>
            <button class="friendBarAction profile" title="Profilo" @click="openProfile(slot.id)"></button>
          </div>
        </div>
        <button class="friendBarArrow" :disabled="page >= pageCount - 1" @click="page++">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from 'vue'
import { Engine } from '../../../../game/Engine'
import { Friend, FriendsState, FriendsStore } from '../../../../game/engine/friends/FriendsStore'
import { MessengerState, MessengerStore } from '../../../../game/engine/friends/MessengerStore'
import { AvatarHeadImage } from '../../../../game/engine/ui/imagers/avatars/AvatarHeadImage'
import { UIComponent } from '../../../../game/engine/ui/components/UIComponent'
import { IComponentShowableUI } from '../../../../game/core/ui/IComponentShowableUI'
import ChatBar from './ChatBar.vue'

/** Places of the friend bar: the friends, else "Trova Amici". */
const FRIEND_BAR_SIZE = 3

const friends = ref<FriendsState>(FriendsStore.getInstance().current)
const heads = reactive<Record<string, string>>({})
const page = ref(0)

const pageCount = computed(() => Math.max(1, Math.ceil(friends.value.friends.length / FRIEND_BAR_SIZE)))

const slots = computed<(Friend | null)[]>(() => {
  const shown: (Friend | null)[] = friends.value.friends.slice(page.value * FRIEND_BAR_SIZE, (page.value + 1) * FRIEND_BAR_SIZE)
  while (shown.length < FRIEND_BAR_SIZE) shown.push(null)
  return shown
})

// e.g. a friend removed from the last page
watch(pageCount, count => { if (page.value > count - 1) page.value = count - 1 })

/** The friend of the bar whose actions (message, follow, profile) are shown. */
const expandedId = ref<number | null>(null)
const friendBar = ref<HTMLElement | null>(null)

function onFriendsChanged(state: FriendsState) {
  friends.value = state

  // e.g. the friend was removed
  if (expandedId.value != null && !state.friends.some(friend => friend.id === expandedId.value)) expandedId.value = null

  for (const friend of state.friends) {
    const look = friend.look
    if (!look || heads[look] !== undefined) continue

    heads[look] = ''
    AvatarHeadImage.get(look).then(image => {
      // not drawn (e.g. the avatars were not loaded yet): drawn again at the next change
      if (image) heads[look] = image
      else delete heads[look]
    })
  }
}

onUnmounted(FriendsStore.getInstance().subscribe(onFriendsChanged))
onFriendsChanged(FriendsStore.getInstance().current)

watch(page, () => expandedId.value = null)

function toggleExpanded(friendId: number) {
  expandedId.value = expandedId.value === friendId ? null : friendId
}

// a click out of the friend bar closes the actions
function onDocumentPointerDown(event: PointerEvent) {
  if (expandedId.value != null && !friendBar.value?.contains(event.target as Node)) expandedId.value = null
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', onDocumentPointerDown))

function toggleMessenger() {
  MessengerStore.getInstance().toggle()
}

function openChat(friendId: number) {
  MessengerStore.getInstance().openChat(friendId)
  expandedId.value = null
}

function follow(friendId: number) {
  FriendsStore.getInstance().follow(friendId)
  expandedId.value = null
}

function openProfile(friendId: number) {
  FriendsStore.getInstance().openProfile(friendId)
  expandedId.value = null
}

const messenger = shallowRef<MessengerState>(MessengerStore.getInstance().current)
const messengerUnread = computed(() => messenger.value.conversations.some(conversation => conversation.unread))
onUnmounted(MessengerStore.getInstance().subscribe(state => messenger.value = state))

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
    case 'friends':
      Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.FriendsMenuUI).toggle()
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

  &:before {
    content: "";
    position: absolute;
    width: 100%;
    height: 1px;
    top: -3px;
    background-color: rgba(0, 0, 0, 0.63);
  }

  & .separator {
    height: 40px;
    width: 1px;
    background-color: #454442;
    margin-left: 330px;
    margin-right: 330px;
  }

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
    align-items: center;
    right: 10px;
    height: 100%;
  }

  .menuButton .badge {
    position: absolute;
    top: -4px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background-color: #d63a3a;
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    line-height: 16px;
    box-sizing: border-box;
  }

  .friendBar {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 4px;
    border-radius: 16px;
    background-color: rgba(0, 0, 0, 0.35);
    pointer-events: all;

    .friendBarArrow {
      width: 18px;
      height: 26px;
      border: 0;
      background: none;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;

      &:disabled {
        opacity: 0.3;
        cursor: default;
      }
    }

    .friendBarItem {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 124px;
      border-radius: 8px;
      background-color: #3d4b5c;
      border-bottom: 2px solid #2a3542;
      color: #fff;
      font-family: 'Ubuntu', sans-serif;
      font-size: 0.8rem;
      cursor: pointer;
      box-sizing: border-box;

      &:hover {
        background-color: #4a5a6e;
      }

      &.offline {
        color: #b9c0c8;

        .friendBarHead {
          filter: grayscale(1);
        }
      }

      /* the actions under the name: the item grows up, over the room (as Habbo) */
      &.expanded {
        align-self: flex-end;
        margin-bottom: 1px;
        background-color: #4a5a6e;
      }
    }

    .friendBarMain {
      position: relative;
      display: flex;
      align-items: center;
      height: 26px;
      padding: 0 8px 0 34px;
    }

    .friendBarActions {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 2px 0 4px;

      .friendBarAction {
        width: 22px;
        height: 22px;
        padding: 0;
        border: 0;
        background: no-repeat center;
        cursor: pointer;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.35;
          cursor: default;
        }

        &.message {
          background-image: url("@/assets/images/bottom-bar/sendmessage.png");
        }

        &.follow {
          background-image: url("@/assets/images/bottom-bar/joinroom.png");
        }

        &.profile {
          background-image: url("@/assets/images/bottom-bar/profile.png");
        }
      }
    }

    .friendBarHead {
      position: absolute;
      left: 2px;
      bottom: 2px;
      max-height: 34px;
      max-width: 32px;
      object-fit: contain;
      object-position: bottom;
      image-rendering: pixelated;

      &.placeholder {
        width: 31px;
        height: 34px;
        background: url("@/assets/images/bottom-bar/friend_head.png") no-repeat center bottom;
      }
    }

    .friendBarName {
      flex: 1;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  /* the icons centered on the height of the bar, whatever their size */
  & .leftOptions {
    left: 10px;
    height: 100%;
    display: flex;
    align-items: center;
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
      flex-shrink: 0;
      background-repeat: no-repeat;
      background-position: center;

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
      }

      &.catalog {
        background-image: url("@/assets/images/bottom-bar/catalog.png");
        width: 37px;
        height: 37px;
      }

      &.friends {
        background-image: url("@/assets/images/bottom-bar/friend_all.png");
        height: 33px;
        width: 32px;
      }

      &.messenger {
        background-image: url("@/assets/images/bottom-bar/message.png");
        width: 26px;
        height: 31px;

        &.unread {
          background-image: url("@/assets/images/bottom-bar/message_unsee.gif");
          height: 32px;
        }
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
        /* centered by .rightOptions, next to the friend bar */
        top: 0;
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