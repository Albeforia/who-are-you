'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

function Text3D(text, options) {
	var parameters = jQuery.extend(Text3D.defaultOptions, options);
	text = text || '';
	// split and clean the words
	var words = text.split('\n');
	var wordsCount = words.length;
	for (var i = 0; i < wordsCount; i++) {
		words[i] = words[i].replace(/^\s+|\s+$/g, '');
	}
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	var font = parameters.style + ' ' + parameters.size + 'px' + ' ' + parameters.font;
	context.font = font;
	// max width
	var width;
	var maxWidth = 0;
	for (var j = 0; j < wordsCount; j++) {
		var tempWidth = context.measureText(words[j]).width;
		if (tempWidth > maxWidth) {
			maxWidth = tempWidth;
		}
	}
	width = maxWidth;
	// get the line height and the total height
	var lineHeight = parameters.size + parameters.lineSpacing;
	var height = lineHeight * wordsCount;
	// security margin
	canvas.width = width + 20;
	canvas.height = height + 20;
	// set the font once more to update the context
	context.font = font;
	context.fillStyle = parameters.color;
	context.textAlign = parameters.align;
	context.textBaseline = 'top';
	// draw text
	for (var k = 0; k < wordsCount; k++) {
		var word = words[k];
		var left;
		if (parameters.align === 'left') {
			left = 0;
		} else if (parameters.align === 'center') {
			left = canvas.width / 2;
		} else {
			left = canvas.width;
		}
		context.fillText(word, left, lineHeight * k);
	}
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide,
	});
	var geometry = new THREE.PlaneGeometry(canvas.width / 20, canvas.height / 20);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.visible = false;
	//
	var inTween = TweenLite.to({ opacity: 0 }, parameters.fadeTime, {
		opacity: 1, paused: true,
		onStart: function () {
			mesh.visible = true;
		},
		onUpdate: function () {
			material.opacity = this.target.opacity;
		},
		onReverseComplete: function () {
			mesh.visible = false;
		}
	});
	this.el = mesh;
	this.in = function () {
		inTween.play();
	};
	this.out = function () {
		inTween.reverse();
	};
}

Text3D.defaultOptions = {
	size: 100,
	font: 'Futura, Trebuchet MS, Arial, sans-serif',
	style: '',
	align: 'center',
	lineSpacing: 20,
	color: 'rgba(200, 200, 200, 1)',
	fadeTime: 2
};

module.exports = Text3D;