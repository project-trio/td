module.exports = {
	lintOnSave: true,
	productionSourceMap: false,

	devServer: {
		open: true,
		port: 8032,
	},

	pages: {
		index: { entry: 'src/app/main.js' },
	},

	chainWebpack (config) {
		config.module
			.rule('vox')
			.test(/\.vox$/)
			.use('url')
			.loader('url-loader')
			.options({
				limit: 1024,
				esModule: false,
			})
			.end()
	},
}
