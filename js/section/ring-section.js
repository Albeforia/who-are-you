'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var TextureManager = require('../texture-manager');
var Text3D = require('../o3d/text3d');

var ringSection = new Section('ring');

var obj = (function (numRings, amplitude) {
	var ringGroup = new THREE.Object3D();
	var i, idleTweens = [], ringCaches = [];
	var texture = TextureManager.load('assets/texture/ring.png');
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		depthWrite: false,
		transparent: true,
		blending: THREE.AdditiveBlending,
		side: THREE.DoubleSide
	});
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 1, 1), material);
	for (i = 0; i < numRings; i++) {
		var copy = plane.clone();
		copy.material = plane.material.clone();
		var tween = getTween(copy, i);
		var cache = { duration: (10 + i) / 10, z: (numRings - i) * 5 };
		ringGroup.add(copy);
		idleTweens.push(tween);
		ringCaches.push(cache);
	}
	ringGroup.rotation.x = -1.2;
	ringGroup.position.y = -10;
	function getTween(plane, index) {
		var cache = { scale: 0.1, opacity: 1 };
		var scale = (index + 1) * (amplitude) / numRings;
		return TweenLite.to(cache, 1.5, {
			scale: scale, opacity: 0, paused: true,
			delay: (index * 100) / 1000,
			ease: 'easeInOutPower1',
			onUpdate: function () {
				plane.scale.x = plane.scale.y = cache.scale;
				plane.material.opacity = cache.opacity;
			},
			onComplete: function () { this.restart(); }
		});
	};
	//
	var who = new Text3D('W H O', {
		size: 55,
	});
	var are = new Text3D('A R E', {
		size: 50,
	});
	var you = new Text3D('Y O U', {
		size: 75,
	});
	who.el.position.x = -13;
	who.el.rotation.y = Math.PI / 5;
	are.el.position.x = -5.5;
	are.el.rotation.y = Math.PI / 10;
	you.el.position.x = 10;
	you.el.rotation.y = -Math.PI / 6;
	var textCaches = [
		{ y: -20, dy: 1.5, delay: 0.2 },
		{ y: -20, dy: -3, delay: 0.2 },
		{ y: -20, dy: -1, delay: 1 }
	];
	return {
		rings: ringGroup,
		texts: [who, are, you],
		idleTweens: idleTweens,
		ringCaches: ringCaches,
		textCaches: textCaches
	};
})(6, 4);

ringSection.add(obj.rings,
	obj.texts[0].el, obj.texts[1].el, obj.texts[2].el);

ringSection.onStart(function () {
	for (var i = 0, j = obj.idleTweens.length; i < j; i++) {
		obj.idleTweens[i].resume();
    }
});

ringSection.onIn(function () {
	var i, j;
	var planes = obj.rings.children;
	for (i = 0, j = planes.length; i < j; i++) (function() {
		var p = planes[i];
		var c = obj.ringCaches[i];
		TweenLite.to(p.position, c.duration, { z: 0 });
	})();
	var texts = obj.texts;
	for (i = 0, j = texts.length; i < j; i++) (function(){
		var t = texts[i], c = obj.textCaches[i];
		TweenLite.delayedCall(c.delay, function() {
			t.in();
			TweenLite.to(c, 2, { y: c.dy,
			onUpdate: function() {
				t.el.position.y = c.y;
			}});
		});
	})();
});

ringSection.onOut(function (way) {
	var i, j;
	var factor = way === 'up' ? 1 : -1;
	var planes = obj.rings.children;
    for (i = 0, j = planes.length; i < j; i++) (function() {
		var el = planes[i];
		var cache = obj.ringCaches[i];
		TweenLite.to(el.position, cache.duration, { z: factor * cache.z });
	})();
	var texts = obj.texts;
	for (i = 0, j = texts.length; i < j; i++) (function(){
		var t = texts[i], c = obj.textCaches[i];
		t.out();
		TweenLite.to(c, 2, { y: -20});
	})();
});

ringSection.load = function (callback) {
	callback();
};

module.exports = ringSection;