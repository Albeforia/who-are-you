'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var TextureManager = require('../texture-manager');
var random = require('../utility').random;
var yoyo = require('../utility').yoyo;

function Ball() {
	var texture = TextureManager.load('assets/texture/ball.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.x = 0;
	texture.repeat.y = 0;
	var materialStripe = new THREE.MeshLambertMaterial({
		map: texture,
		transparent: true
	});
	var materialWire = new THREE.MeshBasicMaterial({
		color: '#dedede',
		wireframe: true
	});
	var wrap = new THREE.Object3D(), mesh;
	// tweens
	var idleTweens = {
		rotate: TweenLite.to({ textureRepeat: 3 }, 5, {
			textureRepeat: 8,
			paused: true,
			onUpdate: function () {
				texture.repeat.set(1, this.target.textureRepeat);
				mesh.rotation.y += 0.01;
				mesh.rotation.x += 0.02;
			},
			onComplete: yoyo,
			onReverseComplete: yoyo
		}),
		glitch: TweenLite.to({}, random(0.1, 5), {
			paused: true,
			onComplete: function () {
				glitch();
				this.duration(random(0.1, 5));
				this.restart();
			}
		})
	};
	var inTween = TweenLite.to({ y: 40, opacity: 0 }, 1.5, {
		y: 0, opacity: 1,
		paused: true,
		onUpdate: function () {
			mesh.position.y = this.target.y;
			materialStripe.opacity = this.target.opacity;
		},
		onComplete: function () {
			idleTweens.glitch.resume();
		}
	});
	//
	var loader = new THREE.JSONLoader();
	loader.load('assets/obj/ball.json', function (geometry) {
		mesh = new THREE.Mesh(geometry, materialStripe);
		wrap.add(mesh);
		this.in = function () {
			inTween.play();
		};
		this.out = function () {
			idleTweens.glitch.pause();
			mesh.material = materialStripe;
			inTween.reverse();
		};
		this.start = function () {
			idleTweens.rotate.resume();
			wrap.visible = true;
		};
		this.stop = function () {
			idleTweens.rotate.pause();
			wrap.visible = false;
		};
	}.bind(this));
	this.el = wrap;
	function glitch() {
		mesh.material = materialWire;
		TweenLite.delayedCall(random(0.2, 1), function () {
			mesh.material = materialStripe;
		});
	}
}

module.exports = Ball;