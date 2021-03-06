export default {

	names: [ 'pellet', 'squirt', 'dart', 'swarm', 'frost', 'bash', 'snap', 'boost' ],

	pellet: {
		wire: 0x000000,
		targets: true,
		color: 0x555555,
		cost:   [ 5,   10, 10, 10, 10, 160 ],
		damage: [ 10,  10, 20, 20, 20, 320 ],
		range:  [ 60,  0,  0,  0,  0,  120 ],
		speed:  [ 1.5, 0,  0,  0,  0,  -0.4 ],
		attackBit: 3,
		bulletSpeed: 12,
		description: 'Upgrades into a long-range sniper.',
	},

	squirt: {
		wire: 0x222222,
		targets: true,
		color: 0x3355cc,
		cost:   [ 15, 12, 23, 35, 75, 190 ],
		damage: [ 5,  5,  8,  16, 31, 55 ],
		range:  [ 70, 0,  0,  0,  0,  20 ],
		speed:  [ 6,  0,  0,  0,  0,  3 ],
		attackBit: 3,
		bulletSpeed: 15,
		description: 'Rapid-firing tower.',
	},

	dart: {
		wire: 0x222222,
		targets: true,
		color: 0xbb4444,
		cost:   [ 20, 15, 35, 60, 90, 120 ],
		damage: [ 8,  8,  16, 32, 64, 172 ],
		range:  [ 90, 10, 10, 10, 10, 10 ],
		speed:  [ 1,  0,  0,  0,  0,  0 ],
		radius: [ 25, 5,  5,  5,  5,  5 ],
		attackBit: 1,
		bulletSpeed: 5,
		bulletAcceleration: 1,
		bulletSize: 8,
		description: 'Surface-to-surface missile launcher with splash damage.',
	},

	swarm: {
		wire: 0x444444,
		targets: false,
		multi: 4,
		color: 0x66aa44,
		cost:   [ 50, 30, 50, 75, 125, 310 ],
		damage: [ 20, 20, 40, 80, 160, 160 ],
		range:  [ 60, 0,  5,  0,  5,   5 ],
		speed:  [ 4,  0,  0,  0,  0,   2 ],
		radius: [ 0,  0,  0,  0,  0,   25 ],
		attackBit: 2,
		bulletSpeed: 10,
		description: 'Anti-air tower that fires 4 bullets at once.',
	},

	frost: {
		wire: 0x222222,
		targets: true,
		color: 0x2299cc,
		cost:   [ 50,  25, 25, 25, 25, 50 ],
		damage: [ 10,  5,  5,  5,  5,  10 ],
		range:  [ 50,  0,  0,  0,  0,  25 ],
		speed:  [ 1.5, 0,  0,  0,  0,  0 ],
		slow:   [ 15,  5,  5,  5,  5,  5 ],
		radius: [ 30,  0,  0,  0,  0,  20 ],
		attackBit: 3,
		bulletSpeed: 10,
		bulletSize: 10,
		description: 'Low damage, but slows all enemies near its target.',
	},

	bash: {
		wire: 0x000000,
		targets: false,
		multi: 9001,
		color: 0xaa44dd,
		cost:   [ 80,  120, 145, 175,  260, 450 ],
		damage: [ 60,  60,  120, 240,  480, 1040 ],
		range:  [ 40,  0,   0,   0,    0,   5 ],
		speed:  [ 1.3, 0,   0,   0.25, 0,   0.25 ],
		stun:   [ 1.5, 0.5, 0.5, 0.5,  0.5, 0.5 ],
		chance: [ 5,   2.5, 2.5, 2.5,  2.5, 5 ],
		attackBit: 1,
		description: 'AoE pulse with a chance to stun.',
	},

	snap: {
		wire: 0x666666,
		targets: false,
		color: 0x000000,
		cost:   [ 15,  15,  15,  30,  45,  60 ],
		damage: [ 100, 100, 200, 400, 800, 1600 ],
		range:  [ 100, 0,   0,   0,   0,   0 ],
		speed:  [ 0,   0,   0,   0,   0,   0 ],
		stun:   [ 1,   1,   1,   2,   2,   3 ],
		attackBit: 3,
		bulletSpeed: 10,
		bulletTriangle: true,
		description: 'Press "F" or double click to self-destruct the tower, damaging all enemies in range.',
	},

	boost: {
		wire: 0x000000,
		targets: false,
		color: 0xccbb33,
		cost:   [ 100, 100, 100, 100, 100 ],
		damage: [ 10,  10,  10,  10,  10 ],
		range:  [ 42,  0,   0,   0,   0 ],
		speed:  [ 0,   0,   0,   0,   0 ],
		attackBit: 0,
		description: 'Does not attack, but increases the damage of adjacent towers.',
	},

}
