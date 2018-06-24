let storage = false
{
	const sampleDate = new Date()
	try {
		window.localStorage.setItem(sampleDate, sampleDate)
		window.localStorage.removeItem(sampleDate)
		storage = window.localStorage
	} catch (e) {
		window.alert('Local Storage unavailable\nYour progress data cannot be loaded or saved. Please ensure Private Browsing mode is off, and that Storage is enabled in your browser settings.')
	}
}

export default {

	get (key, defaultValue = null) {
		if (storage) {
			const value = storage.getItem(key)
			if (value !== undefined && value !== 'null') {
				return value
			}
		}
		return defaultValue
	},

	set (key, value) {
		return storage && storage.setItem(key, value)
	},

	remove (key) {
		return storage && storage.removeItem(key)
	},

	clear () {
		return storage && storage.clear()
	},

	//PRIMITIVES

	getBool (key, defaultValue = null) {
		return this.get(key, defaultValue) == 'true'
	},

	getInt (key, defaultValue = null) {
		const parsed = parseInt(this.get(key), 10)
		return !isNaN(parsed) ? parsed : defaultValue
	},

	getFloat (key, defaultValue = null) {
		const parsed = parseFloat(this.get(key))
		return !isNaN(parsed) ? parsed : defaultValue
	},

	//OBJECTS

	getList (key) {
		const raw = this.get(key)
		return raw ? raw.split(',') : null
	},
	setList (key, value) {
		this.set(key, value.join(','))
	},

	getJSON (key) {
		const raw = this.get(key)
		if (raw) {
			try {
				return JSON.parse(raw)
			} catch (e) {
				console.log('Invalid json', key, raw)
				storage.removeItem(key)
			}
		}
		return null
	},
	setJSON (key, value) {
		return this.set(key, JSON.stringify(value))
	},

}
