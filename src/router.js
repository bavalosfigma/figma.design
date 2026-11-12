import { createRouter, createWebHistory } from 'vue-router'
import CanvasApp from './prototypes/canvas/CanvasApp.vue'
import WipApp from './prototypes/wip/WipApp.vue'
import Wip01App from './prototypes/wip-01/WipApp.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/canvas' },
    { path: '/canvas', name: 'canvas', component: CanvasApp },
    { path: '/wip-01', name: 'wip-01', component: Wip01App },
    { path: '/wip', name: 'wip', component: WipApp },
  ],
})

export default router
