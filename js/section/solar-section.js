'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var Solar = require('../o3d/solar');
var Text3D = require('../o3d/text3d');

var solarSection = new Section('solar');

var obj = (function () {
	var solar = new Solar();
	solar.el.rotation.x = -1;
	var text = new Text3D(
		'B  I  G  G  E  R\nD R E A M',
		{
			align: 'right',
			size: 50,
			lineSpacing: 30
		});
	text.el.position.set(20, 10, 0);
	return {
		solar: solar,
		text: text
	};
})();

solarSection.add(obj.solar.el, obj.solar.sun, obj.text.el);

solarSection.onStart(function () {
	obj.solar.start();
});

solarSection.onIn(function (way) {
	obj.solar.in(way);
	obj.text.in();
});

solarSection.onOut(function (way) {
	obj.solar.out(way);
	obj.text.out();
});

solarSection.onStop(function () {
	obj.solar.stop();
});

solarSection.load = function (callback) {
	callback();
};

module.exports = solarSection;