'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');
var Section = require('./_section');
var HeightMap = require('../o3d/heightmap');

var morphSection = new Section('morph');

var obj = (function () {
	var heightMap = new HeightMap({
		maps: [
			{ name: 'C', url: 'assets/misc/heightmap-c.jpg' },
			{ name: 'A', url: 'assets/misc/heightmap-a.jpg' },
			{ name: 'G', url: 'assets/misc/heightmap-g.jpg' }
		]
	});
	heightMap.el.position.z = -10;
	heightMap.el.rotation.y = -0.6;
	return {
		heightMap: heightMap
	};
})();

morphSection.add(obj.heightMap.el);

morphSection.onStart(function () {
	if (!obj.heightMap.ready) {
		return false;
	}
	obj.heightMap.start();
});

morphSection.onStop(function () {
	obj.heightMap.stop();
});

morphSection.load = function (callback) {
	callback();
};

module.exports = morphSection;