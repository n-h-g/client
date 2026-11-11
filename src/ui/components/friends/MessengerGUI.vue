<template>
    <Dialog title="Messenger" className="messenger" :box="UIEventsType.MESSENGER">
        <div class="messengerContent">
            <!-- one tab per open chat, as Habbo's messenger -->
            <div class="messengerTabs">
                <div
                    v-for="conversation in state.conversations"
                    :key="conversation.friendId"
                    class="messengerTab"
                    :class="{ active: conversation.friendId === state.activeId, unread: conversation.unread }"
                    :title="friendOf(conversation.friendId)?.username"
                    @click="store.select(conversation.friendId)"
                >
                    <img v-if="headOf(conversation.friendId)" :src="headOf(conversation.friendId)" />
                    <div v-else class="messengerHead empty"></div>
                </div>
            </div>

            <template v-if="active">
                <div class="messengerHeader">
                    <span class="friendStatus" :class="{ online: activeFriend?.online }"></span>
                    <span class="messengerName">{{ activeFriend?.username ?? 'Former friend' }}</span>
                    <button class="messengerIcon follow" title="Follow" :disabled="!activeFriend?.online" @click="friends.follow(active.friendId)"></button>
                    <button class="messengerIcon profile" title="Profile" :disabled="!activeFriend" @click="friends.openProfile(active.friendId)"></button>
                    <button class="messengerClose" title="Close the chat" @click="store.closeChat(active.friendId)">✕</button>
                </div>

                <div class="messengerMessages" ref="messagesBox">
                    <div class="messengerEmpty" v-if="active.messages.length === 0">
                        Write a message to {{ activeFriend?.username }}.
                    </div>
                    <div
                        v-for="(message, index) in active.messages"
                        :key="index"
                        class="messengerMessage"
                        :class="{ own: message.own }"
                    >
                        <span class="messengerText">{{ message.text }}</span>
                        <span class="messengerTime">{{ time(message.time) }}</span>
                    </div>
                </div>

                <form class="messengerInput" @submit.prevent="send">
                    <input
                        v-model="text"
                        ref="input"
                        type="text"
                        maxlength="255"
                        :disabled="!activeFriend?.online"
                        :placeholder="activeFriend?.online ? 'Write a message...' : `${activeFriend?.username ?? 'Your friend'} is offline`"
                    />
                </form>
            </template>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, reactive, ref, shallowRef, watch, watchEffect } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { FriendsState, FriendsStore } from "../../../game/engine/friends/FriendsStore"
import { MessengerState, MessengerStore } from "../../../game/engine/friends/MessengerStore"
import { AvatarHeadImage } from "../../../game/engine/ui/imagers/avatars/AvatarHeadImage"

const store = MessengerStore.getInstance()
const friends = FriendsStore.getInstance()

const state = shallowRef<MessengerState>(store.current)
const friendsState = shallowRef<FriendsState>(friends.current)
const heads = reactive<Record<string, string>>({})
const text = ref("")
const messagesBox = ref<HTMLDivElement | null>(null)
const input = ref<HTMLInputElement | null>(null)

const active = computed(() => state.value.conversations.find(c => c.friendId === state.value.activeId))
const activeFriend = computed(() => friendOf(state.value.activeId))

function friendOf(friendId: number | null) {
    return friendsState.value.friends.find(friend => friend.id === friendId)
}

function headOf(friendId: number) {
    const look = friendOf(friendId)?.look
    return look ? heads[look] : ""
}

// the heads of the friends in the tabs
watchEffect(() => {
    for (const conversation of state.value.conversations) {
        const look = friendOf(conversation.friendId)?.look
        if (!look || heads[look] !== undefined) continue

        heads[look] = ""
        AvatarHeadImage.get(look).then(image => {
            if (image) heads[look] = image
            else delete heads[look]
        })
    }
})

const unsubscribe = store.subscribe(newState => state.value = newState)
const unsubscribeFriends = friends.subscribe(newState => friendsState.value = newState)
onUnmounted(() => {
    unsubscribe()
    unsubscribeFriends()
})

// the last message in view, the input ready for the chat shown
watch(
    () => [state.value.activeId, active.value?.messages.length],
    async () => {
        await nextTick()
        if (messagesBox.value) messagesBox.value.scrollTop = messagesBox.value.scrollHeight
        input.value?.focus()
    },
    { immediate: true }
)

function send() {
    if (!active.value || !text.value.trim()) return

    store.send(active.value.friendId, text.value)
    text.value = ""
}

function time(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
</script>

<style lang="scss">
.messenger {
    position: fixed;
    top: 120px;
    left: calc(50% - 170px);
    width: 340px;
    height: 380px;

    .messengerContent {
        display: flex;
        flex-direction: column;
        gap: 6px;
        height: 100%;
        padding: 6px 0;
        box-sizing: border-box;
        font-family: 'Ubuntu', sans-serif;
        font-size: 0.8rem;
    }

    .messengerTabs {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        flex: none;

        .messengerTab {
            position: relative;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            width: 38px;
            height: 38px;
            border: 1px solid #999;
            border-radius: 4px;
            background-color: #d8d8d0;
            cursor: pointer;
            overflow: hidden;
            flex: none;

            img {
                image-rendering: pixelated;
            }

            &.active {
                border-color: #333;
                background-color: #fff;
            }

            &.unread {
                animation: messengerBlink 1s steps(1) infinite;
            }
        }
    }

    .messengerHead.empty {
        width: 31px;
        height: 34px;
        background: url("@/assets/images/bottom-bar/friend_head.png") no-repeat center bottom;
        opacity: 0.5;
    }

    .messengerHeader {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: none;
        padding: 2px 4px;
        border-bottom: 1px solid #ccc;

        .messengerName {
            flex: 1;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .friendStatus {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #999;
        flex: none;

        &.online {
            background-color: #3fbf3f;
        }
    }

    .messengerIcon {
        width: 22px;
        height: 22px;
        border: 0;
        background: no-repeat center;
        cursor: pointer;

        &.follow {
            background-image: url("@/assets/images/bottom-bar/joinroom.png");
        }

        &.profile {
            background-image: url("@/assets/images/bottom-bar/profile.png");
        }

        &:disabled {
            opacity: 0.35;
            cursor: default;
        }
    }

    .messengerClose {
        border: 0;
        background: none;
        font-weight: bold;
        cursor: pointer;
    }

    .messengerMessages {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow-y: auto;
        padding: 4px;
        background-color: #fff;
        border: 1px solid #999;
        border-radius: 4px;
    }

    .messengerEmpty {
        color: #777;
        margin: auto;
    }

    .messengerMessage {
        display: flex;
        flex-direction: column;
        align-self: flex-start;
        max-width: 80%;
        padding: 4px 8px;
        border-radius: 8px;
        background-color: #e4e4e4;
        word-break: break-word;

        &.own {
            align-self: flex-end;
            background-color: #cfe3f0;
        }

        .messengerTime {
            align-self: flex-end;
            font-size: 0.65rem;
            color: #777;
        }
    }

    .messengerInput {
        flex: none;

        input {
            width: 100%;
            box-sizing: border-box;
            padding: 6px 8px;
            border: 1px solid #333;
            border-radius: 4px;
            outline: none;
        }
    }
}

@keyframes messengerBlink {
    50% {
        background-color: #f6d36b;
    }
}
</style>
