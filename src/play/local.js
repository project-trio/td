export default {
	gid: null,
	game: null,
	renderer: null,

	syncTowers: [],

	setGame (newGame) {
		this.game?.destroy()
		this.game = newGame
	},
}
