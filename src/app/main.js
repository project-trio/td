import Vue from 'vue'
import App from './App.vue'

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

if (router.currentRoute.query.token) {
	store.state.signin.attempted = true
	router.replace({ query: null })
}
