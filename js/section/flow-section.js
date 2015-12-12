'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var Flow = require('../o3d/flow');
var Ruby = require('../o3d/ruby');
var Text3D = require('../o3d/text3d');

var flowSection = new Section('flow');

var obj = (function () {
	var points = [
		new THREE.Vector3(0, 50, 20),
		new THREE.Vector3(20, 5, -10),
		new THREE.Vector3(-20, -40, 0),
		new THREE.Vector3(-25, -80, 8),
	];
	var field = new Flow(points, {
		subsAmplitude: 50,
		subsNumber: 8
	});
	var ruby = new Ruby();
	ruby.el.position.x = -7;
	ruby.el.rotation.x = 0.3;
	var textGroup = new THREE.Object3D();
	var vText = new Text3D('T\nO\n \nL\nA\nY', {
		size: 40,
	});
	var hText = new Text3D('T O  B E  P L A Y E D', {
		size: 45,
	});
	textGroup.add(vText.el, hText.el);
	vText.el.position.set(4.6, -3, 10);
	textGroup.position.set(-18, 5, 0);
	return {
		flow: field,
		ruby: ruby,
		text: textGroup,
		texts: [vText, hText]
	};
})();

flowSection.add(obj.flow.el, obj.ruby.el, obj.text);

flowSection.onStart(function () {
	obj.flow.start();
	obj.ruby.start();
});

var flowIn = false;
flowSection.onIn(function () {
	var i, texts = obj.texts;
	for (i = 0; i < texts.length; i++) {
		texts[i].in();
	}
	if (flowIn) {
		return false;
	}
	flowIn = true;
	obj.flow.in();
});

flowSection.onOut(function () {
	var i, texts = obj.texts;
	for (i = 0; i < texts.length; i++) {
		texts[i].out();
	}
});

flowSection.onStop(function () {
	obj.ruby.stop();
});

flowSection.load = function (callback) {
	callback();
};

module.exports = flowSection;