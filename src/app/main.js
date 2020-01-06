import Vue from 'vue'
import App from './App.vue'

import TrioClient from '@ky-is/trio-client'

import router from '@/xjs/router'
import store from '@/xjs/store'
import util from '@/xjs/util'

Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$util = util

new Vue({
	router,
	data: store,
	render: h => h(App),
}).$mount('#app')

TrioClient.init(router)
