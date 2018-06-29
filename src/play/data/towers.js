export default {

	names: [ 'pellet', 'squirt', 'dart', 'swarm', 'frost', 'bash', 'snap', 'boost' ],

	pellet: {
		targets: true,
		color: 0x222222,
		cost:   [ 5,   5,  10, 20, 40, 120 ],
		damage: [ 10,  10, 20, 40, 80, 240 ],
		range:  [ 60,  0,  0,  0,  0,  120 ],
		speed:  [ 1.5, 0,  0,  0,  0,  -0.4 ],
		attackBit: 3,
		bulletSpeed: 10,
	},

	squirt: {
		targets: true,
		color: 0x4444cc,
		cost:   [ 15, 12, 23, 35, 75, 290 ],
		damage: [ 5,  5,  8,  16, 31, 255 ],
		range:  [ 70, 0,  0,  0,  0,  20 ],
		speed:  [ 6,  0,  0,  0,  0,  3 ],
		attackBit: 3,
		bulletSpeed: 10,
	},

	dart: {
		targets: true,
		color: 0xdd4444,
		cost:   [ 20, 15, 35, 60, 110, 160 ],
		damage: [ 8,  8,  16, 32, 64,  128 ],
		range:  [ 90, 10, 10, 10, 10,  10 ],
		speed:  [ 1,  0,  0,  0,  0,   0 ],
		radius: [ 20, 5,  5,  5,  5,   5 ],
		attackBit: 1,
		bulletSpeed: 5,
		bulletAcceleration: 1,
		bulletSize: 8,
	},

	swarm: {
		targets: true,
		color: 0x66aa44,
		cost:   [ 50, 30, 50, 75, 125, 310 ],
		damage: [ 20, 20, 40, 80, 160, 160 ],
		range:  [ 60, 0,  5,  0,  5,   5 ],
		speed:  [ 4,  0,  0,  0,  0,   2 ],
		radius: [ 0,  0,  0,  0,  0,   25 ],
		attackBit: 2,
		bulletSpeed: 10,
	},

	frost: {
		targets: true,
		color: 0x00aaee,
		cost:   [ 50,  25, 25, 25, 25, 50 ],
		damage: [ 10,  5,  5,  5,  5,  10 ],
		range:  [ 50,  0,  0,  0,  0,  25 ],
		speed:  [ 1.5, 0,  0,  0,  0,  0 ],
		slow:   [ 20,  5,  5,  5,  5,  10 ],
		radius: [ 30,  0,  0,  0,  0,  20 ],
		attackBit: 3,
		bulletSpeed: 10,
	},

	bash: {
		targets: false,
		color: 0xbb44ee,
		cost:   [ 100, 120, 145, 175, 260, 450 ],
		damage: [ 60,  60,  120, 240, 480, 1040 ],
		range:  [ 40,  0,   0,   0,   5,   5 ],
		radius:  [ 40,  0,   0,   0,   5,   5 ],
		speed:  [ 1.3, 0,   0,   0,   0,   0.3 ],
		stun:   [ 25,  5,   5,   5,   5,   5 ],
		attackBit: 1,
	},

	snap: {
		targets: false,
		color: 0x000000,
		cost:   [ 15,  15,  15,  30,  45,  60 ],
		damage: [ 100, 100, 200, 400, 800, 1600 ],
		range:  [ 100, 0,   0,   0,   0,   0 ],
		speed:  [ 0,   0,   0,   0,   0,   0 ],
		attackBit: 3,
		bulletSpeed: 10,
		bulletTriangle: true,
	},

	boost: {
		targets: false,
		color: 0xccbb33,
		cost:   [ 100, 100, 100, 100, 100 ],
		damage: [ 10,  10,  10,  10,  10 ],
		range:  [ 42,  0,   0,   0,   0 ],
		speed:  [ 0,   0,   0,   0,   0 ],
		attackBit: 0,
	},

}
