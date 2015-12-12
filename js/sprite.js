'use strict';

var jQuery = require('jquery');
var THREE = require('three');

// singleton
var SPRITE3D = SPRITE3D || (function () {
	var sprites = [];
	var previousTime = Date.now();
	return {
		add: function (sprite) {
			// update previousTime to avoid frame jumping if inactive for too long
			if (sprites.length === 0) {
				previousTime = Date.now();
			}
			sprites.push(sprite);
		},
		remove: function (sprite) {
			var i = sprites.indexOf(sprite);
			if (i !== -1) {
				sprites.splice(i, 1);
			}
		},
		update: function () {
			if (!sprites.length) {
				return false;
			}
			var time = Date.now();
			var delta = time - previousTime;
			previousTime = time;
			for (var i = 0; i < sprites.length;) {
				if (sprites[i].update(delta)) {
					i++;
				} else {
					sprites.splice(i, 1);
				}
			}
		}
	};
})();

SPRITE3D.Sprite = function (texture, textureParams, spriteParams) {
	this.texture = texture;
	this.parameters = jQuery.extend({
		duration: 100,
		horizontal: textureParams.horizontal,
		vertical: textureParams.vertical,
		total: textureParams.horizontal * textureParams.vertical,
		loop: true
	}, spriteParams);
	this.isPlaying = false;
	this.currentSlice = 0;
	this.timer = 0;
};

SPRITE3D.Sprite.prototype.start = function () {
	if (this.isPlaying) {
		return false;
	}
	SPRITE3D.add(this);
	this.isPlaying = true;
};

SPRITE3D.Sprite.prototype.stop = function () {
	if (!this.isPlaying) {
		return false;
	}
	SPRITE3D.remove(this);
	this.isPlaying = false;
};

SPRITE3D.Sprite.prototype.update = function (delta) {
	this.timer += delta;
	while (this.timer > this.parameters.duration) {
		this.timer -= this.parameters.duration;
		this.currentSlice++;
		if (this.currentSlice === this.parameters.total - 1) {
			if (this.parameters.loop) {
				this.currentSlice = 0;
			} else {
				this.currentSlice = 0;
				this.stop();
				return false;
			}
		}
		var factor = this.parameters.total - this.currentSlice;
		var row = Math.floor(factor / this.parameters.horizontal);
		var col = Math.floor(factor % this.parameters.horizontal);
		this.texture.offset.x = col / this.parameters.horizontal;
		this.texture.offset.y = row / this.parameters.vertical;
	}
	return true;
};

module.exports = SPRITE3D;