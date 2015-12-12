'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var random = require('../utility').random;
var yoyo = require('../utility').yoyo;

function Grid(options) {
	this.parameters = jQuery.extend(Grid.defaultOptions, options);
	this.width = (this.parameters.divisionsX - 1) * this.parameters.divisionsSize;
	this.height = (this.parameters.divisionsY - 1) * this.parameters.divisionsSize;
	var group = new THREE.Object3D();
	var vertices = this.getVertices();
	if (this.parameters.points) {
		var pointsGeometry = new THREE.Geometry();
		for (var i = 0, j = vertices.length; i < j; i++) {
			pointsGeometry.vertices.push(vertices[i][0]);
			pointsGeometry.vertices.push(vertices[i][1]);
			pointsGeometry.vertices.push(vertices[i][2]);
		}
		var pointsMaterial = new THREE.PointsMaterial({ size: 0.2 });
		var points = new THREE.Points(pointsGeometry, pointsMaterial);
		group.add(points);
	}
	var lineMaterial = new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors,
		linewidth: 1
	});
	var colorsCache = {};
	var fromColor = new THREE.Color(this.parameters.fromColor);
	var toColor = new THREE.Color(this.parameters.toColor);
	var idleTweens = [];
	for (var k = 0, l = vertices.length; k < l; k++) {
		var lineGeometry = new THREE.Geometry();
		var firstTo = vertices[k][0].clone();
		var secondTo = vertices[k][2].clone();
		lineGeometry.vertices.push(vertices[k][1].clone());
		lineGeometry.vertices.push(vertices[k][1]);
		lineGeometry.vertices.push(vertices[k][1].clone());
		for (var m = 0, n = lineGeometry.vertices.length; m < n; m++) {
			var color = null;
			var percent = null;
			if (k >= this.parameters.divisionsX) {
				// horizontal
				var y = lineGeometry.vertices[m].y;
				percent = Math.abs((y * 100 / this.height) / 100);
			} else {
				// vertical
				var x = lineGeometry.vertices[m].x;
				percent = Math.abs((x * 100 / this.width) / 100);
			}
			if (!colorsCache[percent]) {
				color = fromColor.clone().lerp(toColor, percent + 0.2);
				colorsCache[percent] = color;
			} else {
				color = colorsCache[percent];
			}
			lineGeometry.colors.push(toColor);
			lineGeometry.colors.push(color);
			lineGeometry.colors.push(toColor);
		}
		var line = new THREE.Line(lineGeometry, lineMaterial);
		var tweens = this.getTween(line, firstTo, secondTo);
		idleTweens.push(tweens[0]);
		idleTweens.push(tweens[1]);
		group.add(line);
	}
	this.el = group;
	this.start = function () {
		for (var i = 0, j = idleTweens.length; i < j; i++) {
			idleTweens[i].resume();
		}
	};
	this.stop = function () {
		for (var i = 0, j = idleTweens.length; i < j; i++) {
			idleTweens[i].pause();
		}
	};
	this.in = function () {
		TweenLite.to(group.position, 1, { y: 0 });
	};
	this.out = function (way) {
		var y = way === 'up' ? -50 : 50;
		TweenLite.to(group.position, 1, { y: y });
	};
}

Grid.defaultOptions = {
	points: false,
	divisionsSize: 10,
	divisionsX: 11,
	divisionsY: 11,
	fromColor: '#ffffff',
	toColor: '#0a0a0a'
};

Grid.prototype.getVertices = function () {
	var vertices = [];
	var midY = this.height / 2;
	var midX = this.width / 2;
	// horizontal
	for (var x = 0; x < this.parameters.divisionsX; x++) {
		var xPosH = (x * this.parameters.divisionsSize) - midX;
		vertices.push([
			new THREE.Vector3(xPosH, -midY, 0),
			new THREE.Vector3(xPosH, 0, 0),
			new THREE.Vector3(xPosH, midY, 0)
		]);
	}
	// vertical
	for (var y = 0; y < this.parameters.divisionsY; y++) {
		var yPosV = (y * this.parameters.divisionsSize) - midY;
		vertices.push([
			new THREE.Vector3(-midX, yPosV, 0),
			new THREE.Vector3(0, yPosV, 0),
			new THREE.Vector3(midX, yPosV, 0)
		]);
	}
	return vertices;
};

Grid.prototype.getTween = function (line, to1, to2) {
	var from1 = line.geometry.vertices[0];
	var from2 = line.geometry.vertices[2];
	var delay = random(0, 2);
	var update = function () {
		line.geometry.verticesNeedUpdate = true;
		line.geometry.computeBoundingSphere();
	};
	var parameters = [
		{
			paused: true,
			ease: 'easeInOutPower2',
			delay: delay,
			onUpdate: update,
			onComplete: yoyo,
			onReverseComplete: yoyo,
			x: to1.x,
			y: to1.y,
			z: to1.z
		},
		{
			paused: true,
			ease: 'easeInOutPower2',
			delay: delay,
			onUpdate: update,
			onComplete: yoyo,
			onReverseComplete: yoyo,
			x: to2.x,
			y: to2.y,
			z: to2.z
		}
	];
	return [TweenLite.to(from1, 1.8, parameters[0]), TweenLite.to(from2, 1.8, parameters[1])];
};

module.exports = Grid;