'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var random = require('../utility').random;

function BackgroundLines(options) {
	var parameters = jQuery.extend(BackgroundLines.defaultOptions, options);
	var group = new THREE.Object3D();
	var line = this.getLine();
	for (var i = 0; i < parameters.count; i++) {
		var lineCopy = line.clone();
		lineCopy.position.x = random(-20, 20);
		lineCopy.position.y = random(parameters.rangeY[0], parameters.rangeY[1]);
		lineCopy.position.z = random(-50, 50);
		group.add(lineCopy);
	}
	this.el = group;
	this.line = line;
}

BackgroundLines.defaultOptions = {
	count: 100,
	rangeY: [-100, 100]
};

BackgroundLines.prototype.getLine = function () {
	var material = new THREE.LineBasicMaterial();
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 0.2, 0));
	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	var line = new THREE.Line(geometry, material);
	return line;
};

BackgroundLines.prototype.updateY = function (speed) {
	this.line.geometry.vertices[0].y = speed + 0.2;
	this.line.geometry.verticesNeedUpdate = true;
	this.line.geometry.computeBoundingSphere();
};

BackgroundLines.prototype.updateZ = function (speed) {
	this.line.geometry.vertices[0].z = speed;
	this.line.geometry.verticesNeedUpdate = true;
	this.line.geometry.computeBoundingSphere();
};

module.exports = BackgroundLines;