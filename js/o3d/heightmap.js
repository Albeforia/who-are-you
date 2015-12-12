'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var random = require('../utility').random;
var map = require('../utility').map;

function HeightMap(options) {
	this.parameters = jQuery.extend(HeightMap.defaultOptions, options);
	this.fromColor = new THREE.Color(this.parameters.fromColor);
	this.toColor = new THREE.Color(this.parameters.toColor);
	this.colorsCache = {};
	this.ready = false;
	this.data = null;
	this.total = this.parameters.maps.length;
	this.previous = undefined;
	this.current = undefined;
	this.geometry = new THREE.PlaneGeometry(50, 50, this.parameters.divisionsX, this.parameters.divisionsY);
	var group = new THREE.Object3D();
	if (this.parameters.horizontal || this.parameters.vertical) {
		this.lines = this.getLines();
		group.add(this.lines);
	}
	this.loadMaps();
	this.el = group;
	this.start = function () { };
	this.stop = this.start;
	this.ready = function () {
		this.ready = true;
		var idleTween = this.getIdleTween();
		this.start = function () {
			idleTween.resume();
		};
		this.stop = function () {
			idleTween.pause();
		};
	};
}

HeightMap.defaultOptions = {
	horizontal: true,
	vertical: false,
	divisionsX: 30,
	divisionsY: 30,
	fromColor: '#4c4c4c',
	toColor: '#ffffff',
	maps: []
};

HeightMap.prototype.getLines = function () {
	var material = new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors
	});
	var lines = new THREE.Object3D();
	var lineGeometry, vertex, line, x, y;
	if (this.parameters.vertical) {
		for (x = 0; x < this.parameters.divisionsX + 1; x++) {
			lineGeometry = new THREE.Geometry();
			for (y = 0; y < this.parameters.divisionsY + 1; y++) {
				vertex = this.geometry.vertices[x + ((y * this.parameters.divisionsX) + y)];
				lineGeometry.vertices.push(vertex);
			}
			line = new THREE.Line(lineGeometry, material);
			lines.add(line);
		}
	}
	if (this.parameters.horizontal) {
		for (y = 0; y < this.parameters.divisionsY + 1; y++) {
			lineGeometry = new THREE.Geometry();
			for (x = 0; x < this.parameters.divisionsX + 1; x++) {
				vertex = this.geometry.vertices[(y * (this.parameters.divisionsX + 1)) + x];
				lineGeometry.vertices.push(vertex);
				if (x === 0) {
					vertex.x -= random(0, 20);
				}
				if (x === this.parameters.divisionsX) {
					vertex.x += random(0, 20);
				}
			}
			line = new THREE.Line(lineGeometry, material);
			lines.add(line);
		}
	}
	return lines;
};

HeightMap.prototype.getIdleTween = function () {
	var _this = this;
	return TweenLite.to({}, 2, {
		paused: true,
		onComplete: function () {
			_this.current++;
			if (_this.current === _this.total) {
				_this.current = 0;
			}
			_this.applyMap();
			this.duration(random(1.5, 5));
			this.restart();
		}
	});
};

HeightMap.prototype.loadMaps = function () {
	var totalData = (this.parameters.divisionsX + 1) * (this.parameters.divisionsY + 1);
	this.data = {
		default: new Float32Array(totalData)
	};
	var loader = new THREE.ImageLoader();
	var total = this.parameters.maps.length;
	var loaded = 0;
	var _this = this;
	function loadMap(map, index) {
		loader.load(map.url, function (image) {
			addMap(map.name, image);
			loaded++;
			if (loaded === 1) {
				_this.current = index;
				_this.applyMap();
			}
			if (loaded === total) {
				_this.ready();
			}
		});
	}
	var addMap = function (name, image) {
		var width = image.width;
		var height = image.height;
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		var stepX = width / _this.parameters.divisionsX;
		var stepY = height / _this.parameters.divisionsY;
		var data = new Float32Array(totalData);
		var i = 0;
		for (var y = 0; y < height; y += stepY) {
			for (var x = 0; x < width; x += stepX) {
				var pixelData = context.getImageData(x, y, 1, 1).data;
				// [0, 7.65]
				data[i++] = (pixelData[0] + pixelData[1] + pixelData[2]) / 100;
			}
		}
		_this.data[name] = data;
	};
	for (var i = 0; i < total; i++) {
		var map = this.parameters.maps[i];
		loadMap(map, i);
	}
};

HeightMap.prototype.applyMap = function () {
	var previousName = typeof this.previous === 'undefined' ? 'default'
		: this.parameters.maps[this.previous].name;
	var currentName = this.parameters.maps[this.current].name;
	var previousData = this.data[previousName];
	var currentData = this.data[currentName];
	var _this = this;
	TweenLite.to({ factor: 1 }, 1, {
		factor: 0,
		ease: 'easeOutElastic',
		onUpdate: function () {
			for (var i = 0, j = _this.geometry.vertices.length; i < j; i++) {
				var vertex = _this.geometry.vertices[i];
				var offset = currentData[i] + ((previousData[i] - currentData[i]) * this.target.factor);
				vertex.z = offset;
			}
			_this.geometry.verticesNeedUpdate = true;
			if (_this.lines) {
				for (var k = 0, l = _this.lines.children.length; k < l; k++) {
					_this.lines.children[k].geometry.verticesNeedUpdate = true;
				}
			}
			_this.setColors();
		}
	});
	this.previous = this.current;
};

HeightMap.prototype.setColors = function () {
	if (this.lines) {
		var i, j, k, l, line, vertex, percent;
		for (i = 0, j = this.lines.children.length; i < j; i++) {
			line = this.lines.children[i];
			for (k = 0, l = line.geometry.vertices.length; k < l; k++) {
				vertex = line.geometry.vertices[k];
				percent = map(vertex.z, [0, 7.65], [0, 2]);
				percent = Math.round(percent * 10) / 10;
				if (!this.colorsCache[percent]) {
					this.colorsCache[percent] = this.fromColor.clone().lerp(this.toColor, percent);
				}
				line.geometry.colors[k] = this.colorsCache[percent];
			}
			line.geometry.colorsNeedUpdate = true;
		}
	}
};

module.exports = HeightMap;