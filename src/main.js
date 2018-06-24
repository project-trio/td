import Vue from 'vue'
import App from './App.vue'

import router from '@/xjs/router'
import store from '@/xjs/store'

import UtilPlugin from '@/xjs/util'

Vue.config.productionTip = false

Vue.use(UtilPlugin)

Vue.prototype.$store = store

new Vue({
	router,
	data: store,
	render: h => h(App),
}).$mount('#app')

if (router.currentRoute.query.token) {
	store.state.signin.attempted = true
	router.replace({ query: null })
}
