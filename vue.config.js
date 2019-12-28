module.exports = {
	outputDir: '~$dist',
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
		config.optimization.minimizer('terser').tap((args) => {
			args[0].terserOptions.compress.drop_console = true
			return args
		})
	},
}
