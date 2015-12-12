'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var random = require('../utility').random;
var yoyo = require('../utility').yoyo;

function Ruby(options) {
	var parameters = jQuery.extend(Ruby.defaultOptions, options);
	var mainMat = new THREE.MeshBasicMaterial({
		color: parameters.color,
		wireframe: true
	});
	var pointMat = new THREE.PointsMaterial({
		color: parameters.color,
		size: parameters.pointSize,
		blending: THREE.AdditiveBlending,
		transparent: true,
		sizeAttenuation: false
	});
	var lineMat = new THREE.LineDashedMaterial({
		vertexColors: THREE.VertexColors,
		blending: THREE.AdditiveBlending,
		transparent: true
	});
	var wrap = new THREE.Object3D(), rubyMesh, box, pointCloud, linesMesh;
	var pointsBuffer = new THREE.BufferGeometry(),
		totalPoints, pointPositions, pointData = [];
	var linesBuffer = new THREE.BufferGeometry(),
		maxSegments, endPointPositions, endPointColors;
	var bounds = [];
	// tweens
	var idleTweens = {
		rotate: TweenLite.to({}, 4, {
			paused: true,
			onUpdate: function () {
				rubyMesh.rotation.y += 0.01;
			},
			onComplete: yoyo,
			onReverseComplete: yoyo
		}),
		move: TweenLite.to({ time: 0, last: 0 }, 1, {
			time: 1, paused: true,
			onUpdate: function () {
				var delta = Math.abs(this.target.time - this.target.last);
				this.target.last = this.target.time;
				animate(delta);
			},
			onComplete: yoyo,
			onReverseComplete: yoyo
		})
	};
	//
	var loader = new THREE.JSONLoader();
	loader.load('assets/obj/ruby.json', function (geometry) {
		rubyMesh = new THREE.Mesh(geometry, mainMat);
		box = new THREE.BoxHelper(rubyMesh);
		box.material.color.setHex(0x404040);
		box.material.blending = THREE.AdditiveBlending;
		box.material.transparent = true;
		wrap.add(rubyMesh, box);
		//
		totalPoints = geometry.vertices.length + parameters.pointCount;
		pointPositions = new Float32Array(totalPoints * 3);
		var i, x, y, z, data, speed = parameters.maxSpeed;
		geometry.computeBoundingBox();
		var bb = geometry.boundingBox;
		bounds[0] = [bb.min.x, bb.max.x];
		bounds[1] = [bb.min.y, bb.max.y];
		bounds[2] = [bb.min.z, bb.max.z];
		for (i = 0; i < totalPoints; i++) {
			data = {};
			if (i < geometry.vertices.length) {
				x = geometry.vertices[i].x;
				y = geometry.vertices[i].y;
				z = geometry.vertices[i].z;
				data.fixed = true;
				data.velocity = new THREE.Vector3();
			}
			else {
				x = random(bounds[0][0], bounds[0][1]);
				y = random(bounds[1][0], bounds[1][1]);
				z = random(bounds[2][0], bounds[2][1]);
				data.fixed = false;
				data.velocity = new THREE.Vector3(
					random(-speed, speed), random(-speed, speed), random(-speed, speed));
			}
			pointPositions[i * 3] = x;
			pointPositions[i * 3 + 1] = y;
			pointPositions[i * 3 + 2] = z;
			data.numConnections = 0;
			pointData.push(data);
		}
		pointsBuffer.setDrawRange(0, totalPoints);
		pointsBuffer.addAttribute('position',
			new THREE.BufferAttribute(pointPositions, 3).setDynamic(true));
		pointCloud = new THREE.Points(pointsBuffer, pointMat);
		wrap.add(pointCloud);
		//
		maxSegments = totalPoints * (totalPoints - 1) * 0.5;
		endPointPositions = new Float32Array(maxSegments * 2 * 3);
		endPointColors = new Float32Array(maxSegments * 2 * 3);
		linesBuffer.addAttribute('position',
			new THREE.BufferAttribute(endPointPositions, 3).setDynamic(true));
		linesBuffer.addAttribute('color',
			new THREE.BufferAttribute(endPointColors, 3).setDynamic(true));
		linesBuffer.computeBoundingSphere();
		linesBuffer.setDrawRange(0, 0);
		linesMesh = new THREE.LineSegments(linesBuffer, lineMat);
		wrap.add(linesMesh);
		// set tweens
		this.start = function () {
			idleTweens.rotate.resume();
			idleTweens.move.resume();
		};
		this.stop = function () {
			idleTweens.rotate.pause();
			idleTweens.move.pause();
		};
	}.bind(this));
	this.el = wrap;
	function animate(delta) {
		var vertexpos = 0, colorpos = 0, numConnected = 0;
		var i, x, y, z, xx, yy, zz, dx, dy, dz, data, dataB, dist, alpha;
		for (i = 0; i < totalPoints; i++) {
			pointData[i].numConnections = 0;
		}
		for (i = 0; i < totalPoints; i++) {
			data = pointData[i];
			x = (pointPositions[i * 3] += data.velocity.x * delta);
			y = (pointPositions[i * 3 + 1] += data.velocity.y * delta);
			z = (pointPositions[i * 3 + 2] += data.velocity.z * delta);
			// check bound
			if (x < bounds[0][0] || x > bounds[0][1]) {
				data.velocity.x = -data.velocity.x;
			}
			if (y < bounds[1][0] || y > bounds[1][1]) {
				data.velocity.y = -data.velocity.y;
			}
			if (z < bounds[2][0] || z > bounds[2][1]) {
				data.velocity.z = -data.velocity.z;
			}
			// check collision
			for (var j = i + 1; j < totalPoints; j++) {
				dataB = pointData[j];
				if (data.fixed && dataB.fixed) continue;
				xx = pointPositions[j * 3];
				yy = pointPositions[j * 3 + 1];
				zz = pointPositions[j * 3 + 2];
				dx = x - xx;
				dy = y - yy;
				dz = z - zz;
				dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
				if (dist < parameters.minDistance) {
					data.numConnections++;
					dataB.numConnections++;
					alpha = 1.0 - dist / parameters.minDistance;
					endPointPositions[vertexpos++] = x;
					endPointPositions[vertexpos++] = y;
					endPointPositions[vertexpos++] = z;
					endPointPositions[vertexpos++] = xx;
					endPointPositions[vertexpos++] = yy;
					endPointPositions[vertexpos++] = zz;
					endPointColors[colorpos++] = alpha;
					endPointColors[colorpos++] = alpha;
					endPointColors[colorpos++] = alpha;
					endPointColors[colorpos++] = alpha;
					endPointColors[colorpos++] = alpha;
					endPointColors[colorpos++] = alpha;
					numConnected++;
				}
			}
		}
		linesMesh.geometry.setDrawRange(0, numConnected * 2);
		linesMesh.geometry.attributes.position.needsUpdate = true;
		linesMesh.geometry.attributes.color.needsUpdate = true;
		pointCloud.geometry.attributes.position.needsUpdate = true;
	}
}

Ruby.defaultOptions = {
	color: 0xffffff,
	pointSize: 4,
	pointCount: 32,
	maxSpeed: 6,
	minDistance: 5
};

module.exports = Ruby;