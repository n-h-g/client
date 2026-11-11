<template>
    <Dialog title="Profile" className="friendProfile" :box="UIEventsType.FRIEND_PROFILE">
        <div class="friendProfileContent" v-if="friend">
            <div class="friendProfileAvatar">
                <img v-if="avatarImage" :src="avatarImage" />
            </div>
            <div class="friendProfileInfo">
                <div class="friendProfileName">{{ friend.username }}</div>
                <div class="friendProfileMotto">{{ friend.motto || '...' }}</div>
                <div class="friendProfileStatus">
                    <span class="friendStatus" :class="{ online: friend.online }"></span>
                    {{ friend.online ? 'Online' : 'Offline' }}
                </div>
                <div class="friendProfileButtons">
                    <button class="ui-button small" :disabled="!friend.online" @click="messenger.openChat(friend.id)">Message</button>
                    <button class="ui-button small" :disabled="!friend.online" @click="friends.follow(friend.id)">Follow</button>
                </div>
            </div>
        </div>
        <div class="friendProfileContent empty" v-else>This user is not your friend anymore.</div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from "vue"
import Dialog from "../dialog/Dialog.vue"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import { FriendsStore } from "../../../game/engine/friends/FriendsStore"
import { MessengerStore } from "../../../game/engine/friends/MessengerStore"
import { AvatarHeadImage } from "../../../game/engine/ui/imagers/avatars/AvatarHeadImage"

const friends = FriendsStore.getInstance()
const messenger = MessengerStore.getInstance()

// the store tells when the friend (or the friend shown) changes
const version = shallowRef(0)
onUnmounted(friends.subscribe(() => version.value++))

const friend = computed(() => {
    version.value
    return friends.getFriend(friends.profileId)
})

const avatarImage = ref("")

watch(
    () => friend.value?.look,
    look => {
        avatarImage.value = ""
        if (!look) return

        AvatarHeadImage.full(look).then(image => {
            // still the same friend
            if (friend.value?.look === look) avatarImage.value = image
        })
    },
    { immediate: true }
)
</script>

<style lang="scss">
.friendProfile {
    position: fixed;
    top: 140px;
    left: calc(50% - 160px);
    width: 320px;
    height: 200px;

    .friendProfileContent {
        display: flex;
        gap: 10px;
        height: 100%;
        padding: 8px 4px;
        box-sizing: border-box;
        font-family: 'Ubuntu', sans-serif;
        font-size: 0.8rem;

        &.empty {
            align-items: center;
            justify-content: center;
            color: #666;
        }
    }

    .friendProfileAvatar {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        width: 90px;
        flex: none;
        background-color: #d8d8d0;
        border: 1px solid #999;
        border-radius: 4px;
        padding-bottom: 6px;

        img {
            image-rendering: pixelated;
        }
    }

    .friendProfileInfo {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
        min-width: 0;
    }

    .friendProfileName {
        font-size: 1rem;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .friendProfileMotto {
        font-style: italic;
        color: #444;
        word-break: break-word;
    }

    .friendProfileStatus {
        display: flex;
        align-items: center;
        gap: 6px;
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

    .friendProfileButtons {
        display: flex;
        gap: 6px;
        margin-top: auto;
    }
}
</style>
