import TrioClient from '@ky-is/trio-client'

import store from '@/xjs/store'

const socket = TrioClient.connectTo('td', store.state.signin.token, (token) => {
	store.signinToken(token)
}, (user) => {
	store.state.signin.user = user
}, (reconnectAttempts) => {
	store.state.signin.reconnect = reconnectAttempts
}, (error) => {
	console.log(error)
})

export default socket
