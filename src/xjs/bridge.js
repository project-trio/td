import io from 'socket.io-client'

import storage from '@/xjs/storage'
import store from '@/xjs/store'
import util from '@/xjs/util'

//INIT

const query = {}
let token = store.state.signin.token
if (!token) {
	const query = window.location.search
	if (query) {
		console.log(query.split('?token='))
		token = query.split('?token=')[1]
		if (token) {
			store.signinToken(token)
		}
	}
}
if (token) {
	query.token = token
}

const socket = io(`${util.HOST_URL}/td`, { query })

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
	if (!error) {
		return console.log('Undefined error')
	}
	if (error.startsWith('http')) {
		if (!store.state.signin.attempted) {
			storage.clear()
			window.location.replace(`${error}?signin=1`)
		} else {
			console.log(error)
			window.alert('Unable to sign in')
		}
	} else {
		window.alert(error)
	}
})

export default socket
