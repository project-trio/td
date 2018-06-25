module.exports = {
	lintOnSave: true,
	productionSourceMap: false,

	devServer: {
		open: true,
		port: 8030,
	},

	pages: {
		index: { entry: 'src/app/main.js' },
	},
}
