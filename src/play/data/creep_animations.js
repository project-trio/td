const spawn = [
	{
		traverse: [ 'unitContainer', 'position' ],
		property: 'z',
		durationMultiplier: 2,
		data: {
			from: -300,
			pow: 2,
		},
	},
	{
		traverse: [ 'body' ],
		property: 'opacity',
		data: {
			from: 0.1,
			to: 1,
		},
	},
]

const kill = [
	{
		traverse: [ 'unitContainer', 'position' ],
		property: 'z',
		durationMultiplier: 2,
		data: {
			to: -28,
			pow: 2,
			removes: true,
		},
	},
	{
		traverse: [ 'healthBacking' ],
		property: 'opacity',
		data: {
			from: 1,
			to: 0,
			removes: true,
		},
	},
]

const leak = [
	{
		traverse: [ 'unitContainer', 'position' ],
		property: 'z',
		data: {
			to: -300,
			pow: 2,
			removes: true,
		},
	},
	{
		traverse: [ 'body', 'rotation' ],
		property: 'x',
		to: () => (Math.random() - 0.5) * Math.PI * 4,
		data: {
			removes: true,
		},
	},
	{
		traverse: [ 'body', 'rotation' ],
		property: 'y',
		to: () => (Math.random() - 0.5) * Math.PI * 2,
		data: {
			removes: true,
		},
	},
]

//CREEPS

export default {
	normal: {
		spawn,
		leak,
		kill,
	},

	immune: {
		spawn,
		leak,
		kill,
	},

	group: {
		spawn: [
			{
				traverse: [ 'body', 'scale' ],
				property: 'xyz',
				durationMultiplier: 2,
				data: {
					from: 0.01,
					to: 1,
					pow: 2,
				},
			},
		],
		leak,
		kill,
	},

	fast: {
		spawn: [
			{
				traverse: [ 'unitContainer', 'position' ],
				property: 'z',
				durationMultiplier: 2,
				data: {
					from: -300,
					pow: 2,
				},
			},
			{
				traverse: [ 'body', 'rotation' ],
				property: 'z',
				durationMultiplier: 2,
				data: {
					from: Math.PI,
				},
			},
			{
				traverse: [ 'body' ],
				property: 'opacity',
				data: {
					from: 0.1,
					to: 1,
				},
			},
		],
		leak: [
			{
				traverse: [ 'unitContainer', 'position' ],
				property: 'z',
				data: {
					to: -300,
					pow: 2,
					removes: true,
				},
			},
			{
				traverse: [ 'body', 'rotation' ],
				property: 'z',
				data: {
					to: -Math.PI,
					removes: true,
				},
			},
		],
		kill,
	},

	dark: {
		spawn: [
			{
				traverse: [ 'body' ],
				property: 'opacity',
				data: {
					from: 0.1,
				},
			},
			{
				traverse: [ 'body', 'rotation' ],
				property: 'x',
				durationMultiplier: 2,
				from: () => Math.PI * 4 * (Math.round(Math.random()) * 2 - 1),
				data: {
					pow: 2,
				},
			},
		],
		leak,
		kill,
	},

	spawn: {
		leak,
	},

	spawnlet: {
		leak,
		kill,
	},

	flying: {
		spawn: [
			{
				traverse: [ 'body', 'position' ],
				property: 'x',
				durationMultiplier: 2,
				data: {
					from: -100,
					delta: true,
					pow: 2,
				},
			},
		],
		leak: [
			{
				traverse: [ 'unitContainer', 'position' ],
				property: 'z',
				data: {
					to: 1024,
					pow: 0.67,
					removes: true,
				},
			},
		],
		kill,
	},

}
