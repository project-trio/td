import Vue from 'vue'
import App from './App.vue'

import router from '@/router'
import store from '@/store'

import UtilPlugin from '@/util'

Vue.config.productionTip = false

Vue.use(UtilPlugin)

Vue.prototype.$store = store

new Vue({
	router,
	render: h => h(App),
}).$mount('#app')
