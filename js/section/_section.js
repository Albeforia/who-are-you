'use strict';

var THREE = require('three');

function Section(name) {
	this.name = name;
	this.el = new THREE.Object3D();
	this.playing = false;
	this._in = function () { };
	this._out = function () { };
	this._start = function () { };
	this._stop = function () { };
}

Section.prototype.add = function (o3d) {
	this.el.add.apply(this.el, arguments);
};

Section.prototype.getContent = function () {
	return this.el;
}

/*
	start -> in / out -> (tween) -> stop
*/
Section.prototype.in = function (way) {
	this._in(way);
};

Section.prototype.out = function (way) {
	this._out(way);
};

Section.prototype.start = function () {
	if (this.playing) {
		return false;
	}
	this._start();
	this.playing = true;
};

Section.prototype.stop = function () {
	if (!this.playing) {
		return false;
	}
	this._stop();
	this.playing = false;
};

Section.prototype.onIn = function (callback) {
	this._in = callback;
};

Section.prototype.onOut = function (callback) {
	this._out = callback;
};

Section.prototype.onStart = function (callback) {
	this._start = callback;
};

Section.prototype.onStop = function (callback) {
	this._stop = callback;
};

module.exports = Section;