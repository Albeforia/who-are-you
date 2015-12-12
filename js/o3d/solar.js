'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var random = require('../utility').random;
var map = require('../utility').map;

function Solar(options) {
	this.parameters = jQuery.extend(Solar.defaultOptions, options);
	var group = new THREE.Object3D();
	var ring = this.getRing();
	var planet = this.getPlanet();
	var sun = new THREE.Mesh(new THREE.SphereGeometry(5, 20, 20),
		new THREE.MeshBasicMaterial({
			fog: false
		}));
	var planets = [
		{
			radius: 8,
			planet: planet.clone(),
			text: this.getText('T'),
			scale: 0.2,
			increment: 0.03
		},
		{
			radius: 10,
			planet: planet.clone(),
			text: this.getText('S'),
			scale: 0.1,
			increment: 0.03
		},
		{
			radius: 16,
			planet: planet.clone(),
			text: this.getText('U'),
			scale: 0.5,
			increment: 0.02
		},
		{
			radius: 25,
			planet: planet.clone(),
			text: this.getText('J'),
			scale: 0.7
		},
		{
			radius: 31,
			planet: planet.clone(),
			text: this.getText('N'),
			scale: 0.5,
			increment: 0.04
		}
	];
	var i, j, ringRadius, ringCopy, scale, theta, x, y;
	for (i = 0, j = planets.length; i < j; i++) {
		ringRadius = planets[i].radius;
		ringCopy = ring.clone();
		ringCopy.scale.x = ringCopy.scale.y = ringRadius;
		ringCopy.rotation.z = random(0, Math.PI);
		group.add(ringCopy);
		//
		scale = planets[i].scale;
		planets[i].planet.scale.set(scale, scale, scale);
		planets[i].text.scale.set(scale, scale, scale);
		//
		theta = random(0, 2 * Math.PI);
		x = ringRadius * Math.cos(theta);
		y = ringRadius * Math.sin(theta);
		planets[i].thetaP = theta;
		planets[i].planet.position.set(x, y, 0);
		group.add(planets[i].planet);
		//
		theta = random(0, 2 * Math.PI);
		x = ringRadius * Math.cos(theta);
		y = ringRadius * Math.sin(theta);
		planets[i].thetaT = theta;
		planets[i].text.position.set(x, y, 0);
		group.add(planets[i].text);
	}
	group.visible = false;
	//
	var cache = {
		rotationX: 0,
		rotationY: 0
	};
	function update() {
		group.rotation.y = cache.rotationY;
		group.rotation.x = cache.rotationX;
	}
	this.el = group;
	this.sun = sun;
	this.in = function (way) {
		if (way === 'up') {
			cache = {
				rotationY: -0.6,
				rotationX: -0.5
			};
			TweenLite.to(sun.position, 2, {
				y: 0, z: 0
			});
		}
		else {
			cache = {
				rotationY: 0.6,
				rotationX: -1.5
			};
		}
		update();
		group.visible = true;
		TweenLite.to(cache, 2, {
			rotationX: -1,
			rotationY: 0.2,
			onUpdate: update
		});
	};
	this.out = function (way) {
		var to;
		if (way === 'up') {
			to = {
				rotationY: 0.6,
				rotationX: -1.5,
				onUpdate: update
			};
		}
		else {
			to = {
				rotationY: -0.6,
				rotationX: -0.5,
				onUpdate: update
			};
			TweenLite.to(sun.position, 2, {
				y: -30, z: -40
			});
		}
		TweenLite.to(cache, 1, to);
	};
	var idleTween = TweenLite.to({}, 10, {
		paused: true,
		onUpdate: function () {
			var i, theta, radius, x, y, increment;
			for (i = 0; i < planets.length; i++) {
				radius = planets[i].radius;
				increment = planets[i].increment || 0.01;
				theta = (planets[i].thetaP -= increment);
				x = radius * Math.cos(theta);
				y = radius * Math.sin(theta);
				planets[i].planet.position.x = x;
				planets[i].planet.position.y = y;
				theta = (planets[i].thetaT -= increment);
				x = radius * Math.cos(theta);
				y = radius * Math.sin(theta);
				planets[i].text.position.x = x;
				planets[i].text.position.y = y;
			}
			ring.geometry.colors = ring.geometry.colors.concat(ring.geometry.colors.splice(0, 1));
			ring.geometry.colorsNeedUpdate = true;
		},
		onComplete: function () {
			this.restart();
		}
	});
	this.start = function () {
		idleTween.resume();
	};
	this.stop = function () {
		idleTween.pause();
		group.visible = false;
	};
}

Solar.defaultOptions = {
	ringFromColor: '#ffffff',
	ringToColor: '#333333',
	ringDivisions: 100,
};

Solar.prototype.getPlanet = function () {
	var planetMaterial = new THREE.MeshDepthMaterial();
	var planetGeometry = new THREE.SphereGeometry(5, 20, 20);
	var planet = new THREE.Mesh(planetGeometry, planetMaterial);
	return planet;
};

Solar.prototype.getRing = function () {
	var material = new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors
	});
	var geometry = new THREE.Geometry();
	var step = 2 * Math.PI / this.parameters.ringDivisions, i;
	for (i = 0; i < this.parameters.ringDivisions + 1; i++) {
		var theta = i * step;
		var vertex = new THREE.Vector3(1 * Math.cos(theta), 1 * Math.sin(theta), 0);
		geometry.vertices.push(vertex);
	}
	var fromColor = new THREE.Color(this.parameters.ringFromColor);
	var toColor = new THREE.Color(this.parameters.ringToColor);
	var verticesColors = [], percent;
	for (i = 0; i < geometry.vertices.length; i++) {
		percent = map(i, [0, geometry.vertices.length - 1], [0, 1]);
		verticesColors.push(fromColor.clone().lerp(toColor, percent));
	}
	geometry.colors = verticesColors;
	var ring = new THREE.Line(geometry, material);
	return ring;
};

Solar.prototype.getText = function (text) {
	var textParams = {
		size: 5,
		height: 1,
		curveSegments: 2,
		font: "helvetiker"
	};
	var textMaterial = new THREE.MeshFaceMaterial([
		new THREE.MeshDepthMaterial(),
		new THREE.MeshDepthMaterial()
	]);
	var text3d = new THREE.TextGeometry(text, textParams);
	var mesh = new THREE.Mesh(text3d, textMaterial);
	//text3d.computeBoundingBox();
	//mesh.position.z = -0.5 * (text3d.boundingBox.max.z - text3d.boundingBox.min.z);
	return mesh;
};

module.exports = Solar;