import Vue from 'vue'
import { createApp } from 'vue'
import NHG from './NHG.vue'
import { router } from './router/router'

import VueDraggable from 'vue-draggable'

export function loadUI() {
  const app = createApp(NHG)
  app.use(router)
  app.use(VueDraggable)
  app.mount('#root')
}