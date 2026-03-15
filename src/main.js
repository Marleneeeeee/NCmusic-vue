import './assets/css/reset.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { Search,Like,PlayTwo, HeadphoneSound, Play, Pause, PauseOne, ReplayMusic, GoStart, GoEnd, DoubleDown} from '@icon-park/vue-next'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('IconSearch', Search)
app.component('IconLike', Like)
app.component('IconPlayMv', PlayTwo)
app.component('IconHaedphone',HeadphoneSound)
app.component('IconPlay',Play)
app.component('IconPause',PauseOne)
app.component('IconReplay',ReplayMusic)
app.component('IconPreSong',GoStart)
app.component('IconNextSong',GoEnd)
app.component('IconDown',DoubleDown)

app.mount('#app')
