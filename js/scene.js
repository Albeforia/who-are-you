'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var SPRITE3D = require('./sprite');
var BackgroundLines = require('./o3d/lines');
var BackgroundParticles = require('./o3d/particles');

var SCENE = SCENE || (function () {
	var parameters = {
		fogColor: '#0a0a0a',
		resolution: 1,
		sectionHeight: 50
	};
	// DOM element
	var $viewport;
	var $map;
	var width;
	var height;
	// THREE Scene
	var resolution;
	var renderer;
	var scene;
	var light;
	var camera;
	var frameId;
	// background
	var backgroundLines;
	// camera
	var mouseX = 0;
	var cameraShakeY = 0;
	var cameraCache = { speed: 0 };
	var isScrolling = false;
	// section
	var sections = [];
	var sectionsMap = {}; // map name with index
	var totalSections;
	var currentSection = -1;
	var previousSection = -1;
	function navigation() {
		function next() {
			if (currentSection === totalSections) {
				return false;
			}
			changeSection(currentSection + 1);
		};
		function prev() {
			if (currentSection === 0) {
				return false;
			}
			changeSection(currentSection - 1);
		};
		var oldTime = new Date().getTime();
		function onScroll(event) {
			var newTime = new Date().getTime();
			var elapsed = newTime - oldTime;
			oldTime = newTime;
			if (elapsed > 50 && !isScrolling) {
				if (event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0) {
					next();
				} else {
					prev();
				}
			}
			return false;
		};
		jQuery('.main').on('DOMMouseScroll mousewheel', onScroll);
	};
	function setup() {
		resolution = parameters.resolution;
		// for transparent bg, set alpha: true and renderer.setClearColor(0x000000, 0)
		renderer = new THREE.WebGLRenderer({
			alpha: false,
			antialias: false
		});
		renderer.setClearColor('#0a0a0a', 1);
		renderer.setSize(width * resolution, height * resolution);
		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(parameters.fogColor, 0.01);
		light = new THREE.DirectionalLight('#ffffff', 0.5);
		light.position.set(0.2, 1, 0.5);
		scene.add(light);
		camera = new THREE.PerspectiveCamera(60, width / height, 1, 100);
		camera.position.set(0, 0, 40);
		$viewport.append(renderer.domElement);
		$viewport.on('mousemove', function (event) {
			mouseX = (event.clientX / window.innerWidth) * 2 - 1;
		});
		jQuery(window).on('resize', function () {
			width = $viewport.width();
			height = $viewport.height();
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width * resolution, height * resolution);
		});
		navigation();
		draw();
	};
	function draw() {
		SPRITE3D.update();
		render();
		frameId = requestAnimationFrame(draw);
	};
	function render() {
		// camera noise
		camera.position.y += Math.cos(cameraShakeY) / 50;
		cameraShakeY += 0.02;
		// mouse camera move
		camera.position.x += ((mouseX * 5) - camera.position.x) * 0.03;
		renderer.render(scene, camera);
	};
	function setupBackground() {
		var rangeY = [
			(-sections.length * parameters.sectionHeight) - parameters.sectionHeight,
			parameters.sectionHeight
		];
		var backgroundParticles = new BackgroundParticles({ rangeY: rangeY });
		scene.add(backgroundParticles.el);
		backgroundLines = new BackgroundLines({ count: 150, rangeY: rangeY });
		scene.add(backgroundLines.el);
	};
	function changeSection(to) {
		var way = to < currentSection ? 'up' : 'down';
		if (Math.abs(to - currentSection) === 1) {
			previousSection = currentSection;
			currentSection = to;
			$map.trigger('sectionChange', [currentSection]);
			if (previousSection >= 0) {
				//sectionsMap[previousSection].stop();
				sectionsMap[previousSection].out(way);
			}
			sectionsMap[currentSection].start();
			sectionsMap[currentSection].in(way);
			animateCamera(currentSection, previousSection);
		}
		else {
			var d = way === 'up' ? - 1 : + 1;
			changeSection(currentSection + d);
			if (currentSection !== to) {
				changeSection(to);
			}
		}
	};
	function animateCamera(to, from) {
		var nextPosition = to * -parameters.sectionHeight;
		TweenLite.to(camera.position, 1.5, {
			y: nextPosition,
			ease: 'easeInOutPower3',
			onStart: function () {
				if (isScrolling) {
					sectionsMap[from].stop();
				}
				isScrolling = true;
			},
			onComplete: function () {
				isScrolling = false;
				if (from >= 0) {
					sectionsMap[from].stop();
				}
			}
		});
		TweenLite.to(cameraCache, 1.5, {
			bezier: { type: 'soft', values: [{ speed: 6 }, { speed: 0 }] },
			onUpdate: function () {
				backgroundLines.updateY(this.target.speed);
			}
		});
	};
	return {
		setViewport: function ($el) {
			$viewport = $el;
			width = $viewport.width();
			height = $viewport.height();
			setup();
		},
		setSections: function (_sections) {
			sections = _sections;
			totalSections = sections.length - 1;
			for (var i = 0; i < sections.length; i++) {
				var section = sections[i];
				sectionsMap[i] = section;
				var el = section.getContent();
				el.position.y = i * -parameters.sectionHeight;
				scene.add(el);
			}
			setupBackground();
			$map = jQuery('.map');
		},
		goTo: function (index) {
			if (index === currentSection) {
				return false;
			}
			changeSection(index);
		},
		start: function () {
			/*
			TweenLite.to({ fov: 200, speed: 0 }, 2, {
				bezier: { type: 'soft', values: [{ speed: 20 }, { speed: 0 }] },
				fov: 60,
				ease: 'easeOutCubic',
				onUpdate: function () {
					backgroundLines.updateZ(this.target.speed);
					camera.fov = this.target.fov;
					camera.updateProjectionMatrix();
				}
			});
			*/
			SCENE.goTo(0);
		}
	};
})();

module.exports = SCENE;