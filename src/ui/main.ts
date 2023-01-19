import { createApp } from 'vue'
import NHG from './NHG.vue'
import { router } from './router/router'

export function loadUI() {
  const app = createApp(NHG)
  app.use(router)
  app.mount('#root')
}