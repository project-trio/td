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
				.test(/\.(vox|typeface)$/)
				.use('url')
					.loader('url-loader')
					.options({
						query: {
							limit: 1024,
						},
					})
	},
}
