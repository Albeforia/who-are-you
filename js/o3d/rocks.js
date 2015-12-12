'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var yoyo = require('../utility').yoyo;

function Rocks() {
	var group = new THREE.Object3D();
	var light = this.getLight();
	group.add(light);
	// rocks
	var rocksMaterial = new THREE.MeshLambertMaterial({
		color: '#0a0a0a',
		side: THREE.DoubleSide
	});
	var loader = new THREE.JSONLoader();
	loader.load('assets/obj/rocks.json', function (geometry) {
		var rocks = new THREE.Mesh(geometry, rocksMaterial);
		rocks.position.set(-70, 0, -30);
		rocks.rotation.x = 0.35;
		group.add(rocks);
		var cache = {
			y: 11,
			intensity: 0
		};
		function update() {
			light.intensity = cache.intensity;
			light.position.y = cache.y;
		}
		this.in = function () {
			TweenLite.to(cache, 1, {
				y: 20,
				intensity: 15,
				onUpdate: update
			});
		};
		this.out = function (way) {
			var y = way === 'up' ? 11 : 20;
			TweenLite.to(cache, 1, {
				y: y,
				intensity: 0,
				onUpdate: update
			});
		};
		var idleTween = TweenLite.to({ x: -2, z: -45 }, 2, {
			x: 2, z: -35,
			paused: true,
			onUpdate: function () {
				light.position.z = this.target.z;
			},
			onComplete: yoyo,
			onReverseComplete: yoyo
		});
		this.start = function () {
			idleTween.resume();
		};
		this.stop = function () {
			idleTween.pause();
		};
	}.bind(this));
	this.el = group;
};

Rocks.prototype.getLight = function () {
	var light = new THREE.PointLight('#ffffff', 0, 50);
	light.position.set(0, 11, -40);
	return light;
};

module.exports = Rocks;