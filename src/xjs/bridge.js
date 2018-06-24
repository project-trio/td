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
	storage.clear()
	if (error.startsWith('http')) {
		window.location.replace(`${error}?signin=1`)
	} else {
		window.alert(error)
	}
})

//QUEUE

socket.on('queue join', (name) => {
	store.state.queue.names.push(name)
})
socket.on('queue leave', (name) => {
	const index = store.state.queue.names.indexOf(name)
	if (index !== -1) {
		store.state.queue.names.splice(index, 1)
	}
})

export default socket
