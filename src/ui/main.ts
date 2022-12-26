import { createApp } from 'vue'
import { Engine } from '../game/Engine'
import NHG from './NHG.vue'
import { router } from './router/router'

export function loadUI() {
  new Engine().init()

  const app = createApp(NHG)
  app.use(router)
  app.mount('#root')
}