'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var Rocks = require('../o3d/rocks');
var Text3D = require('../o3d/text3d');

var rocksSection = new Section('rocks');

var rocks = new Rocks();
var text = new Text3D(
	'I  N\nS  O  L  I  T  U  D  E',
	{
		align: 'center',
		size: 45,
		lineSpacing: 40
	});

rocksSection.add(rocks.el, text.el);

rocksSection.onIn(function () {
	rocks.in();
	text.in();
});

rocksSection.onStart(function () {
	rocks.start();
});

rocksSection.onStop(function () {
	rocks.stop();
});

rocksSection.onOut(function (way) {
	rocks.out(way);
	text.out();
});

rocksSection.load = function (callback) {
	callback();
};

module.exports = rocksSection;