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
		durationMultiplier: 2,
		data: {
			to: 0.1,
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
		spawn,
		leak,
		kill,
	},

	fast: {
		spawn,
		leak,
		kill,
	},

	dark: {
		spawn,
		leak,
		kill,
	},

	spawn: {
		spawn,
		leak,
		kill,
	},

	flying: {
		spawn,
		leak,
		kill,
	},

}
