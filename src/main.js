import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import 'dialkit/styles.css'
import './assets/base.css'
import './prototypes/canvas/styles/type.css'

createApp(App).use(router).mount('#app')
