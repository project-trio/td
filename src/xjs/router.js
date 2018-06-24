import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'

Vue.use(Router)

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'Home',
			component: Home,
		},
		{
			path: '/play/:gid',
			name: 'Game',
			component: Game,
			props (route) {
				return {
					gid: route.params.gid,
				}
			},
		},
	],
})
