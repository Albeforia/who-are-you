'use strict';

var jQuery = require('jquery');
(require('./jquery.drawPieChart'))(jQuery);

jQuery(function () {
	var $main = jQuery('.main');
	// scene
	var SCENE = require('./scene');
	SCENE.setViewport(jQuery('.viewport'));
	// sections
	var helloSection = require('./section/hello-section');
	var ringSection = require('./section/ring-section');
	var ballSection = require('./section/ball-section');
	var flowSection = require('./section/flow-section');
	var morphSection = require('./section/morph-section');
	var solarSection = require('./section/solar-section');
	var rocksSection = require('./section/rocks-section');
	var endSection = require('./section/end-section');
	var sections = [
		helloSection,
		ringSection,
		ballSection,
		flowSection,
		morphSection,
		solarSection,
		rocksSection,
		endSection
	];
	// map
	var map = (function () {
		var Map = require('./map');
		var map = new Map();
		for (var i = 0; i < sections.length; i++) {
			map.addNode(i);
		}
		map.init();
		return map;
	})();
	$main.prepend(map.$el);
	map.onClick(function (index) {
		SCENE.goTo(index);
	});
	map.$el.on('sectionChange', function (e, index) {
		map.setActive(index);
	});
	//
	var loaded = 0, i;
	for (i = 0; i < sections.length; i++) {
		sections[i].load(sectionLoaded);
	}
	function sectionLoaded() {
		if (++loaded === sections.length) {
			SCENE.setSections(sections);
			SCENE.start();
			map.in();
		}
	};
});