export default {

	names: [ 'pellet', 'squirt', 'dart', 'swarm', 'frost', 'bash', 'snap', 'boost' ],

	pellet: {
		cost:   [ 5,   5,  10, 20, 40, 120 ],
		damage: [ 10,  10, 20, 40, 80, 240 ],
		range:  [ 60,  0,  0,  0,  0,  120 ],
		speed:  [ 1.5, 0,  0,  0,  0,  -0.4 ],
		attacks: 3,
		bulletSpeed: 1,
	},

	squirt: {
		cost:   [ 15, 12, 23, 35, 75, 290 ],
		damage: [ 5,  5,  8,  16, 31, 255 ],
		range:  [ 70, 0,  0,  0,  0,  20 ],
		speed:  [ 6,  0,  0,  0,  0,  3 ],
		attacks: 3,
		bulletSpeed: 2,
		bulletColor: 0x4444cc,
	},

	dart: {
		cost:   [ 20, 15, 35, 60, 110, 160 ],
		damage: [ 8,  8,  16, 32, 64,  128 ],
		range:  [ 90, 10, 10, 10, 10,  10 ],
		speed:  [ 1,  0,  0,  0,  0,   0 ],
		attacks: 1,
		bulletSpeed: 1,
		bulletAcceleration: 1,
		bulletColor: 0xdd4444,
		bulletSize: 8,
	},

	swarm: {
		cost:   [ 50, 30, 50, 75, 125, 310 ],
		damage: [ 20, 20, 40, 80, 160, 160 ],
		range:  [ 60, 0,  5,  0,  5,   5 ],
		speed:  [ 4,  0,  0,  0,  0,   2 ],
		attacks: 2,
		bulletSpeed: 1,
	},

	frost: {
		cost:   [ 50,  25, 25, 25, 25, 50 ],
		damage: [ 10,  5,  5,  5,  5,  10 ],
		range:  [ 50,  0,  0,  0,  0,  25 ],
		speed:  [ 1.5, 0,  0,  0,  0,  0 ],
		slow:   [ 20,  5,  5,  5,  5,  10 ],
		attacks: 3,
		bulletSpeed: 1,
		bulletColor: 0x00aaff,
	},

	bash: {
		cost:   [ 100, 120, 145, 175, 260, 450 ],
		damage: [ 60,  60,  120, 240, 480, 1040 ],
		range:  [ 40,  0,   0,   0,   5,   5 ],
		speed:  [ 1.3, 0,   0,   0,   0,   0.3 ],
		stun:   [ 25,  5,   5,   5,   5,  5 ],
		attacks: 1,
	},

	snap: {
		cost:   [ 15,  15,  15,  30,  45,  60 ],
		damage: [ 100, 100, 200, 400, 800, 1600 ],
		range:  [ 100, 0,   0,   0,   0,   0 ],
		speed:  [ 0,   0,   0,   0,   0,   0 ],
		attacks: 3,
		bulletSpeed: 1,
		bulletTriangle: true,
	},

	boost: {
		cost:   [ 100, 100, 100, 100, 100 ],
		damage: [ 10,  10,  10,  10,  10 ],
		range:  [ 42,  0,   0,   0,   0 ],
		speed:  [ 0,   0,   0,   0,   0 ],
		attacks: 0,
	},

}
