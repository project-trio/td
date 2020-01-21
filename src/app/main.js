import Vue from 'vue'
import TrioClient from '@ky-is/trio-client'

import store from '@/app/store'

import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
	router,
	data: store,
	render: h => h(App),
}).$mount('#app')

TrioClient.init(router)
