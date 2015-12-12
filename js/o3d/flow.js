'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var random = require('../utility').random;
var noise = require('../utility').noise;
var map = require('../utility').map;

function Flow (points, options) {
  this.parameters = jQuery.extend(Flow.defaultOptions, options);
  var group = new THREE.Object3D();
  var curves = this.getCurves(points);
  var main = curves.main;
  var subs = curves.subs;
  var lines = this.getLines(main, subs);
  var inTweens = [];
  for (var i = 0, j = lines.length; i < j; i++) {
    group.add(lines[i]);
    inTweens.push(this.getInTween(lines[i]));
  }
  var triangleGeometry = new THREE.TetrahedronGeometry(3);
  var triangleMaterial = new THREE.MeshPhongMaterial({ shading: THREE.FlatShading });
  var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
  var follow = this.getFollow(triangleMesh, subs);
  for (var k = 0, l = follow.meshes.length; k < l; k++) {
    group.add(follow.meshes[k]);
  }
  this.el = group;
  this.in = function () {
    for (var i = 0, j = inTweens.length; i < j; i++) {
      inTweens[i].restart();
    }
  };
  this.out = function () {
    for (var i = 0, j = inTweens.length; i < j; i++) {
      inTweens[i].reverse();
    }
  };
  this.start = function () {
    for (var i = 0, j = follow.tweens.length; i < j; i++) {
      follow.tweens[i].resume();
    }
  };
  this.stop = function () {
    for (var i = 0, j = follow.tweens.length; i < j; i++) {
      follow.tweens[i].pause();
    }
  };
}

Flow.defaultOptions = {
  subsNumber: 3,
  subsAmplitude: 30,
  subsPrecision: 10,
  noiseXincrement: 0.1,
  noiseYincrement: 0.1,
  noiseZincrement: 0.1,
  renderResolution: 100,
  mainColor: '#ffffff',
  subsColor: '#4c4c4c',
};

Flow.prototype.getCurves = function (points) {
  var main = new THREE.CatmullRomCurve3(points);
  var subsPoints = main.getPoints(this.parameters.subsPrecision);
  var subs = [];
	var amplitudeRange = [-this.parameters.subsAmplitude, this.parameters.subsAmplitude];
  for (var i = 0; i < this.parameters.subsNumber; i++) {
    var noiseX = random(0, 10);
    var noiseY = random(0, 10);
    var noiseZ = random(0, 10);
    var newPoints = [];
    for (var j = 0, k = subsPoints.length; j < k; j++) {
      var point = subsPoints[j].clone();
      point.x += map(noise(noiseX), [0, 1], amplitudeRange);
      point.y += map(noise(noiseY), [0, 1], amplitudeRange);
      point.z += map(noise(noiseZ), [0, 1], amplitudeRange);
      noiseX += this.parameters.noiseXincrement;
      noiseY += this.parameters.noiseYincrement;
      noiseZ += this.parameters.noiseZincrement;
      newPoints.push(point);
    }
    subs.push(new THREE.CatmullRomCurve3(newPoints));
  }
  return {
    main: main,
    subs: subs
  };
};

Flow.prototype.getLines = function (main, subs) {
  var lines = [];
  var mainMaterial = new THREE.LineBasicMaterial({ color: this.parameters.mainColor });
  var mainGeometry = new THREE.Geometry();
  var mainPoints = main.getPoints(this.parameters.renderResolution);
  mainGeometry.vertices = mainPoints;
  var mainLine = new THREE.Line(mainGeometry, mainMaterial);
  mainLine.visible = false;
  lines.push(mainLine);
  var subMaterial = new THREE.LineBasicMaterial({ color: this.parameters.subsColor });
  for (var i = 0, j = subs.length; i < j; i++) {
    var subGeometry = new THREE.Geometry();
    var subPoints = subs[i].getPoints(this.parameters.renderResolution);
    subGeometry.vertices = subPoints;
    var subLine = new THREE.Line(subGeometry, subMaterial);
    subLine.visible = false;
    lines.push(subLine);
  }
  return lines;
};

Flow.prototype.getInTween = function (line) {
  return TweenLite.to({}, random(1, 3), { paused: true,
      onComplete: function () {
        line.visible = true;
        TweenLite.delayedCall(0.2, function () {
          line.visible = false;
        });
        TweenLite.delayedCall(0.3, function () {
          line.visible = true;
        });
      },
      onReverseComplete: function () {
        line.visible = false;
      }
    });
};

Flow.prototype.getFollow = function (mesh, curves) {
  var meshes = [];
  var tweens = [];
  function getTween (mesh, sub) {
    return TweenLite.to({ i: 0 }, random(4, 8), { i: 1, paused: true,
        onUpdate: function () {
          var position = sub.getPoint(this.target.i);
          var rotation = sub.getTangent(this.target.i);
          mesh.position.set(position.x, position.y, position.z);
          mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        },
        onComplete: function () {
          this.restart();
        }
      });
  }
  for (var i = 0, j = curves.length; i < j; i++) {
    var meshCopy = mesh.clone();
    var curve = curves[i];
    meshes.push(meshCopy);
    tweens.push(getTween(meshCopy, curve));
  }
  return {
    tweens: tweens,
    meshes: meshes
  };
};

module.exports = Flow;