<template>
    <Dialog title="Friends" className="friends" :box="UIEventsType.FRIENDS">
        <div class="friendsContent">
            <form class="friendsSearch" @submit.prevent="addByName">
                <input v-model="searchName" ref="searchInput" type="text" maxlength="32" placeholder="Find friends: username" />
                <button class="ui-button small" type="submit" :disabled="!searchName.trim()">Add</button>
            </form>

            <div class="friendsSection" v-if="state.requests.length > 0">
                <div class="friendsSectionTitle">Friend requests ({{ state.requests.length }})</div>
                <div class="friendRow" v-for="request in state.requests" :key="'r' + request.id">
                    <img class="friendHead" v-if="heads[request.look]" :src="heads[request.look]" />
                    <div class="friendHead empty" v-else></div>
                    <span class="friendName">{{ request.username }}</span>
                    <button class="friendButton accept" @click="store.acceptRequest(request.id)">Accept</button>
                    <button class="friendButton decline" @click="store.declineRequest(request.id)">Decline</button>
                </div>
            </div>

            <div class="friendsSection">
                <div class="friendsSectionTitle">Friends ({{ state.friends.length }})</div>
                <div class="friendsEmpty" v-if="state.friends.length === 0">
                    You have no friends yet: click a user in a room or search its name here above.
                </div>
                <div class="friendRow" :class="{ offline: !friend.online }" v-for="friend in state.friends" :key="'f' + friend.id">
                    <img class="friendHead" v-if="heads[friend.look]" :src="heads[friend.look]" />
                    <div class="friendHead empty" v-else></div>
                    <span class="friendStatus" :class="{ online: friend.online }"></span>
                    <span class="friendName" :title="friend.motto">{{ friend.username }}</span>
                    <button class="friendIcon message" title="Message" :disabled="!friend.online" @click="messenger.openChat(friend.id)"></button>
                    <button class="friendIcon follow" title="Follow" :disabled="!friend.online" @click="store.follow(friend.id)"></button>
                    <button class="friendIcon profile" title="Profile" @click="store.openProfile(friend.id)"></button>
                    <button class="friendButton decline" title="Remove friend" @click="remove(friend)">✕</button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { Friend, FriendsState, FriendsStore } from "../../../game/engine/friends/FriendsStore"
import { AvatarHeadImage } from "../../../game/engine/ui/imagers/avatars/AvatarHeadImage"
import { MessengerStore } from "../../../game/engine/friends/MessengerStore"

const store = FriendsStore.getInstance()
const messenger = MessengerStore.getInstance()
const state = ref<FriendsState>(store.current)
const heads = reactive<Record<string, string>>({})
const searchName = ref("")
const searchInput = ref<HTMLInputElement | null>(null)

function loadHeads(friends: Friend[]) {
    for (const friend of friends) {
        if (!friend.look || heads[friend.look] !== undefined) continue

        const look = friend.look
        heads[look] = ""
        AvatarHeadImage.get(look).then(image => {
            if (image) heads[look] = image
            else delete heads[look]
        })
    }
}

function onChange(newState: FriendsState) {
    state.value = newState
    loadHeads([...newState.friends, ...newState.requests])
}

const unsubscribe = store.subscribe(onChange)
onChange(store.current)

onMounted(() => searchInput.value?.focus())
onUnmounted(unsubscribe)

function addByName() {
    const username = searchName.value.trim()
    if (!username) return

    store.sendRequest({ username })
    searchName.value = ""
}

function remove(friend: Friend) {
    if (confirm(`Do you want to remove ${friend.username} from your friends?`)) store.removeFriend(friend.id)
}
</script>

<style lang="scss">
.friends {
    position: fixed;
    width: 320px;
    height: 400px;

    .friendsContent {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: calc(100% - 40px);
        padding: 8px;
        overflow-y: auto;
        font-family: 'Ubuntu', sans-serif;
        font-size: 0.8rem;
    }

    .friendsSearch {
        display: flex;
        gap: 6px;

        input {
            flex: 1;
            min-width: 0;
            padding: 4px 6px;
            border: 1px solid #333;
            border-radius: 4px;
            outline: none;
        }
    }

    .friendsSection {
        background-color: #ebebeb;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 4px;
    }

    .friendsSectionTitle {
        font-weight: bold;
        padding: 2px 4px 4px;
        border-bottom: 1px solid #ccc;
        margin-bottom: 4px;
    }

    .friendsEmpty {
        color: #666;
        padding: 4px;
    }

    .friendRow {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 4px;
        border-radius: 4px;

        &:hover {
            background-color: #dcdcdc;
        }

        &.offline .friendHead {
            filter: grayscale(1);
            opacity: 0.6;
        }
    }

    .friendHead {
        width: 28px;
        height: 28px;
        object-fit: contain;
        image-rendering: pixelated;

        &.empty {
            background: url("@/assets/images/bottom-bar/friend_head.png") no-repeat center / contain;
            opacity: 0.4;
        }
    }

    .friendStatus {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #999;

        &.online {
            background-color: #3fbf3f;
        }
    }

    .friendName {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .friendIcon {
        width: 22px;
        height: 22px;
        padding: 0;
        border: 0;
        background: no-repeat center;
        cursor: pointer;
        flex: none;

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

    .friendButton {
        border: 0;
        border-radius: 4px;
        padding: 3px 8px;
        cursor: pointer;
        color: #fff;
        font-weight: bold;

        &.accept {
            background-color: #3a8b2e;
        }

        &.decline {
            background-color: #8b2e2e;
        }
    }
}
</style>
