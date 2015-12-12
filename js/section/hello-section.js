'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var SPRITE3D = require('../sprite');
var TextureManager = require('../texture-manager');
var Lamp = require('../o3d/lamp');

var helloSection = new Section('hello');

var obj = (function () {
	var texture = TextureManager.load('assets/misc/hello.png');
	var textureParams = {
		horizontal: 4,
		vertical: 10
	};
	texture.flipY = true;
	texture.generateMipmaps = false;
	texture.minFilter = THREE.LinearFilter;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1 / textureParams.horizontal, 1 / textureParams.vertical);
	texture.offset.x = texture.offset.y = 1;
	var sprite = new SPRITE3D.Sprite(texture, textureParams, { duration: 70 });
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		depthWrite: false,
		transparent: true
	});
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), material);
	// tween
	var cache = { opacity: 0 };
	var tween = TweenLite.to(cache, 5, { opacity: 1, paused: true,
		onUpdate: function () {
			material.opacity = cache.opacity
		}
	});
	// lamps
	var lamp = new Lamp({ color: '#ffffff', width: 4, cubeSize: 1, delay: 0.1 });
	lamp.el.position.y = 15;
	var lampL = new Lamp({ color: '#808080', delay: 0.2 });
	lampL.el.position.set(15, 25, -10);
	var lampR = new Lamp({ color: '#4c4c4c', delay: 0.4 });
	lampR.el.position.set(-20, 30, -20);
	return {
		hello: plane,
		sprite: sprite,
		tween: tween,
		lamps: [lamp, lampL, lampR]
	};
})();

helloSection.add(obj.hello,
	obj.lamps[0].el, obj.lamps[1].el, obj.lamps[2].el);

helloSection.onStart(function () {
	obj.sprite.start();
	for (var i = 0; i < obj.lamps.length; i++) {
		obj.lamps[i].start();
	}
});

helloSection.onIn(function () {
	obj.tween.restart();
	for (var i = 0; i < obj.lamps.length; i++) {
		obj.lamps[i].in();
	}
});

helloSection.onOut(function (way) {
	//obj.tween.reverse();
	for (var i = 0; i < obj.lamps.length; i++) {
		obj.lamps[i].out(way);
	}
});

helloSection.onStop(function () {
	//obj.tween.pause();
	obj.sprite.stop();
});

helloSection.load = function (callback) {
	callback();
};

module.exports = helloSection;