import io from 'socket.io-client'

import storage from '@/xjs/storage'
import store from '@/xjs/store'

//INIT

const query = {}
const token = store.state.signin.token
if (token) {
	query.token = token
}

const socket = io('/td', { query })

//EVENTS

socket.on('connection', () => {
	console.log(socket)
})

socket.on('disconnect', () => {
	console.log('disconnected')
	store.state.signin.reconnect = 0
})
socket.on('reconnecting', (attemptNumber) => {
	store.state.signin.reconnect = attemptNumber
})
socket.on('reconnect', () => {
	store.state.signin.reconnect = null
})

socket.on('local', (user) => {
	store.state.signin.user = user
})

socket.on('error', (error) => {
	window.alert(error)
	storage.clear()
})

export default socket
