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

//INIT

const signinToken = router.currentRoute.query.token
if (signinToken) {
	router.replace({ query: null })
	store.signinToken(signinToken)
}

require('@/xjs/bridge')
