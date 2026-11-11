<template>
    <div class="site">
        <header class="site-header">
            <nav class="site-nav">
                <router-link to="/login">Home</router-link>
                <a href="#" @click.prevent>Community</a>
                <a href="#" @click.prevent>Forum</a>
                <a href="#" class="has-caret" @click.prevent>More</a>
            </nav>

            <div class="site-social">
                <a href="#" aria-label="Facebook" @click.prevent>
                    <svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="currentColor"/><path d="M16.5 24v-9h3l.5-3.5h-3.5V9.3c0-1 .3-1.7 1.8-1.7h1.8V4.5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.4 1.6-4.4 4.6v2.5h-3V15h3v9z" fill="#333"/></svg>
                </a>
                <a href="#" aria-label="Instagram" @click.prevent>
                    <svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="currentColor"/><rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="#333" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="#333" stroke-width="2"/><circle cx="16.6" cy="7.4" r="1.1" fill="#333"/></svg>
                </a>
            </div>

            <router-link to="/login" class="site-logo" aria-label="NHG - new hotel generation">
                <span class="site-logo-mark"></span>
                <span class="site-logo-text">new hotel generation</span>
            </router-link>
        </header>

        <main class="site-hero">
            <svg class="clouds" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
                <g fill="#323232">
                    <circle cx="40" cy="170" r="90"/><circle cx="150" cy="200" r="70"/><circle cx="250" cy="230" r="70"/>
                    <circle cx="660" cy="240" r="60"/><circle cx="760" cy="215" r="55"/><circle cx="860" cy="240" r="60"/>
                    <circle cx="1040" cy="210" r="70"/><circle cx="1150" cy="170" r="90"/>
                </g>
            </svg>

            <section class="card" :aria-label="title">
                <div class="card-title">
                    <svg class="card-icon" viewBox="0 0 48 48" aria-hidden="true">
                        <rect x="4" y="4" width="40" height="40" rx="5" fill="#fff"/>
                        <rect x="8" y="8" width="32" height="32" rx="3" fill="#3a3a3a"/>
                        <path d="M17 14h15v20H17" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/>
                        <path d="M9 24h17m-6-6 6 6-6 6" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h1>{{ title }}</h1>
                </div>

                <form class="card-body" novalidate @submit.prevent="submit">
                    <p v-if="notice" class="form-notice">{{ notice }}</p>

                    <input v-model.trim="username" class="field" type="text" name="username" placeholder="Username"
                           autocomplete="username" maxlength="15" required :disabled="busy">
                    <input v-if="isRegister" v-model.trim="email" class="field" type="email" name="email"
                           placeholder="Email" autocomplete="email" maxlength="255" required :disabled="busy">
                    <input v-model="password" class="field" type="password" name="password" placeholder="Password"
                           :autocomplete="isRegister ? 'new-password' : 'current-password'" maxlength="72" required
                           :disabled="busy">
                    <input v-if="isRegister" v-model="passwordConfirm" class="field" type="password"
                           name="passwordConfirm" placeholder="Confirm password" autocomplete="new-password"
                           maxlength="72" required :disabled="busy">

                    <label class="remember">
                        <input v-model="remember" type="checkbox" :disabled="busy">
                        <span class="remember-box" aria-hidden="true"></span>
                        Remember me
                    </label>

                    <p v-if="error" class="form-error" role="alert">{{ error }}</p>

                    <button class="btn btn-primary" type="submit" :disabled="busy">
                        {{ busy ? '...' : (isRegister ? 'Register' : 'Login') }}
                    </button>

                    <div class="divider"><span>{{ isRegister ? 'Already have an account?' : "Don't have an account?" }}</span></div>

                    <router-link class="btn btn-secondary" :to="{ path: isRegister ? '/login' : '/register', query: route.query }">
                        {{ isRegister ? 'Login' : 'Register' }}
                    </router-link>
                </form>
            </section>
        </main>

        <footer class="site-footer">
            <div class="footer-columns">
                <div v-for="column in footer" :key="column.title" class="footer-column">
                    <h2>{{ column.title }}</h2>
                    <a v-for="link in column.links" :key="link" href="#" @click.prevent>{{ link }}</a>
                </div>
            </div>
        </footer>

        <div class="site-bottom">
            <div class="cta">
                <div class="cta-text">
                    <strong>Sign up, it's free!</strong>
                    <span>Join thousands of users</span>
                </div>
                <router-link class="btn btn-cta" :to="{ path: '/register', query: route.query }" @click="scrollTop">
                    Create an account
                </router-link>
            </div>
            <p class="copyright">© {{ year }} NHG Project</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AuthError, login, register, saveToken } from '../../../game/auth/session'

const props = defineProps<{ mode: 'login' | 'register' }>()
const route = useRoute()

const USERNAME = /^[A-Za-z0-9\-=?!@:.,]{3,15}$/

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const remember = ref(false)
const busy = ref(false)
const error = ref('')

const isRegister = computed(() => props.mode === 'register')
const title = computed(() => isRegister.value ? 'Create your account' : 'Login to your account')
const notice = computed(() => route.query.expired && !isRegister.value
    ? 'Your session has expired or is not valid, please log in again'
    : '')
const year = new Date().getFullYear()

const footer = [
    { title: 'Product', links: ['Features', 'Download', 'Branding'] },
    { title: 'Developers', links: ['My apps', 'Documentation', 'Status'] },
    { title: 'Resources', links: ['Support', 'Terms of service', 'Privacy', 'Guidelines', 'Suggestions'] },
    { title: 'Project', links: ['Blog', 'About us', 'Careers'] },
    { title: 'More', links: ['Partners', 'Forum', 'Contact'] },
]

watch(() => props.mode, () => {
    error.value = ''
    password.value = ''
    passwordConfirm.value = ''
})

function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** The checks of the account service, here to answer at once (the service checks again). */
function validate(): string {
    if (!isRegister.value)
        return username.value && password.value ? '' : 'Enter your username and password'

    if (!USERNAME.test(username.value))
        return 'The username must be 3 to 15 characters: letters, numbers and - = ? ! @ : . ,'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
        return 'The email address is not valid'
    if (password.value.length < 6)
        return 'The password must be at least 6 characters'
    if (password.value !== passwordConfirm.value)
        return 'The passwords do not match'
    return ''
}

/** Back to the page asked before the login (e.g. the link of a room), only a path of this site. */
function destination(): string {
    const redirect = route.query.redirect
    const path = Array.isArray(redirect) ? redirect[0] : redirect
    return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/'
}

async function submit() {
    if (busy.value) return
    error.value = validate()
    if (error.value) return

    busy.value = true
    try {
        const result = isRegister.value
            ? await register(username.value, email.value, password.value)
            : await login(username.value, password.value)

        saveToken(result.token, remember.value)
        // a new page: the engine starts clean
        window.location.assign(destination())
    } catch (e) {
        error.value = e instanceof AuthError ? e.message : 'Something went wrong, please try again'
        busy.value = false
    }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Comfortaa:wght@400;500&family=Roboto:wght@300;400&display=swap');

$dark: #333;
$hero: #2a2a2a;
$title: #3c3c3c;
$blue: #3b8bf2;
$yellow: #f2e34b;

:global(body) {
    margin: 0;
    background: $hero;
}

.site {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: Roboto, sans-serif;
    color: #fff;
    background: $hero;
}

a {
    color: inherit;
    text-decoration: none;
}

/* ------------------------------------------------------------------ header */

.site-header {
    position: relative;
    background: $dark;
    padding: 24px 24px 28px;
    text-align: center;
}

.site-nav,
.site-social {
    position: absolute;
    top: 26px;
    display: flex;
    gap: 22px;
    align-items: center;
}

.site-nav {
    left: 24px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: .5px;

    a:hover {
        color: $yellow;
    }
}

.has-caret::after {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    margin: 0 0 5px 6px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.site-social {
    right: 24px;
    gap: 10px;

    svg {
        display: block;
        width: 22px;
        height: 22px;
        color: #fff;
    }

    a:hover svg {
        color: $yellow;
    }
}

.site-logo {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
}

.site-logo-mark {
    width: 240px;
    height: 174px;
    background: linear-gradient(160deg, #ffe14d 0%, #ff9c3a 22%, #ff4fa0 42%, #a35bff 58%, #3fa4ff 76%, #36e88a 100%);
    -webkit-mask: url('@/assets/images/nhg_logo_white.png') center / contain no-repeat;
    mask: url('@/assets/images/nhg_logo_white.png') center / contain no-repeat;
}

.site-logo-text {
    margin-top: 14px;
    font-family: Comfortaa, sans-serif;
    font-size: 44px;
    font-style: italic;
    letter-spacing: 1px;
    transform: skewX(-8deg);
}

/* ------------------------------------------------------------------ login card */

.site-hero {
    position: relative;
    flex: 1;
    padding: 60px 16px 130px;
    overflow: hidden;
}

.clouds {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 200px;
}

.card {
    position: relative;
    max-width: 505px;
    margin: 0 auto;
}

.card-title {
    position: relative;
    background: $title;
    border-radius: 4px 4px 0 0;
    margin: 0 -10px;
    padding: 6px 60px;
    text-align: center;

    h1 {
        margin: 0;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 36px;
        font-weight: 400;
        letter-spacing: .5px;
        line-height: 1.1;
    }
}

.card-icon {
    position: absolute;
    left: -6px;
    top: -6px;
    width: 54px;
    height: 54px;
    transform: rotate(-10deg);
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 8px 22px;
    background: #fff;
    border-radius: 0 0 6px 6px;
    color: #9a9a9a;
}

.form-notice,
.form-error {
    margin: 0;
    padding: 8px 12px;
    border-radius: 3px;
    font-size: 15px;
    text-align: center;
}

.form-notice {
    background: #fff6cc;
    color: #6b5a00;
}

.form-error {
    background: #fde3e3;
    color: #b42318;
}

.field {
    box-sizing: border-box;
    width: 100%;
    height: 37px;
    padding: 0 12px;
    border: 0;
    border-radius: 3px;
    background: #e6e6e6;
    font: 300 22px Roboto, sans-serif;
    text-align: center;
    color: #333;
    outline: none;

    &::placeholder {
        color: #a8a8a8;
    }

    &:focus {
        box-shadow: 0 0 0 2px $blue;
    }
}

.remember {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 300;
    color: #a8a8a8;
    cursor: pointer;

    input {
        position: absolute;
        opacity: 0;
    }
}

.remember-box {
    position: relative;
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    border: 2px solid #e2e2e2;
    border-radius: 3px;
}

.remember input:checked + .remember-box::after {
    content: '';
    position: absolute;
    left: 9px;
    top: 3px;
    width: 8px;
    height: 16px;
    border: solid $blue;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
}

.remember input:focus-visible + .remember-box {
    box-shadow: 0 0 0 2px $blue;
}

.btn {
    display: block;
    align-self: center;
    box-sizing: border-box;
    width: 196px;
    padding: 6px 0 3px;
    border: 0;
    border-radius: 4px;
    font: 400 26px 'Bebas Neue', sans-serif;
    letter-spacing: .5px;
    text-align: center;
    color: #fff;
    cursor: pointer;

    &:disabled {
        opacity: .7;
        cursor: default;
    }
}

.btn-primary {
    background: $blue;
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .15);

    &:hover:not(:disabled) {
        background: #2f7ee6;
    }
}

.btn-secondary {
    background: #b9b9b9;
    box-shadow: inset 0 -4px 0 #9d9d9d;

    &:hover {
        background: #aaa;
    }
}

.divider {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 22px;
    font-weight: 300;
    color: #b0b0b0;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e6e6e6;
    }
}

/* ------------------------------------------------------------------ footer */

.site-footer {
    background: #f5f5f5;
    border-top: 4px solid #e6e6e6;
    color: #2a2a2a;
    padding: 18px 16px 22px;
}

.footer-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 24px 80px;
    max-width: 1040px;
    margin: 0 auto;
    font-family: 'Bebas Neue', sans-serif;

    h2 {
        margin: 0 0 12px;
        font-size: 28px;
        font-weight: 400;
    }
}

.footer-column {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 130px;
    font-size: 20px;

    a:hover {
        color: $blue;
    }
}

.site-bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px 40px;
    padding: 24px max(16px, calc((100% - 1040px) / 2));
    background: $hero;
    font-family: 'Bebas Neue', sans-serif;
}

.cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 22px;
}

.cta-text {
    display: flex;
    flex-direction: column;
    line-height: 1;

    strong {
        font-size: 44px;
        font-weight: 400;
    }

    span {
        font-size: 26px;
    }
}

.btn-cta {
    width: auto;
    padding: 12px 22px 8px;
    background: $yellow;
    box-shadow: inset 0 -4px 0 #cfc032;
    color: #2a2a2a;
    font-size: 28px;

    &:hover {
        background: #f7ea63;
    }
}

.copyright {
    margin: 0;
    font-size: 22px;
    color: #9a9a9a;
}

/* ------------------------------------------------------------------ narrow screens */

@media (max-width: 760px) {
    .site-nav,
    .site-social {
        position: static;
        justify-content: center;
    }

    .site-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px 16px 24px;
    }

    .site-logo {
        margin-top: 8px;
    }

    .site-logo-mark {
        width: 160px;
        height: 116px;
    }

    .site-logo-text {
        font-size: 30px;
    }

    .site-hero {
        padding: 36px 16px 90px;
    }

    .card-title {
        margin: 0;
        padding: 6px 12px 6px 56px;

        h1 {
            font-size: 28px;
        }
    }

    .footer-columns {
        gap: 20px 32px;
    }
}
</style>
