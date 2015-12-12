'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var Ball = require('../o3d/ball');
var Grid = require('../o3d/grid');
var Text3D = require('../o3d/text3d');

var ballSection = new Section('ball');

var obj = (function () {
	var ball = new Ball();
	var grid = new Grid();
	grid.el.rotation.set(1.5, 1, 2);
	grid.el.position.x = -20;
	var text1 = new Text3D('P O K  M O N', {
		size: 60,
		fadeTime: 0.6
	});
	var text2 = new Text3D('T H E  F I R S T\nG A M é', {
		size: 55,
		align: 'left',
		fadeTime: 0.6
	});
	text2.el.position.x = 24;
	text2.el.position.y = -4;
	return {
		ball: ball,
		grid: grid,
		texts: [text1, text2]
	};
})();

ballSection.add(obj.ball.el, obj.grid.el, obj.texts[0].el, obj.texts[1].el);

ballSection.onStart(function () {
	obj.ball.start();
	obj.grid.start();
});

ballSection.onIn(function () {
	obj.ball.in();
	obj.grid.in();
	var texts = obj.texts;
	for (var i = 0; i < texts.length; i++) (function () {
		var t = texts[i];
		TweenLite.delayedCall(1, function () {
			t.in();
		});
	})();
});

ballSection.onOut(function (way) {
	obj.ball.out();
	obj.grid.out(way);
	var texts = obj.texts;
	for (var i = 0; i < texts.length; i++) {
		texts[i].out();
	}
});

ballSection.onStop(function () {
	obj.ball.stop();
	obj.grid.stop();
});

ballSection.load = function (callback) {
	callback();
};

module.exports = ballSection;