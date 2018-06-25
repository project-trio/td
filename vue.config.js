module.exports = {
	lintOnSave: true,
	productionSourceMap: false,

	devServer: {
		open: true,
		port: 8030,
		proxy: {
			'/socket.io': {
				target: 'http://192.168.0.11:8031',
				changeOrigin: true,
			},
		},
	},

	pages: {
		index: { entry: 'src/app/main.js' },
	},
}
