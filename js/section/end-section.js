'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
var Velocity = require('velocity');
var Section = require('./_section');

var endSection = new Section('end');

var svg = jQuery('.info-svg');
var chart = jQuery("#chart");
var firstTime = true;

endSection.onIn(function () {
	svg.css('z-index', 10);
	if (firstTime) {
		init();
		firstTime = false;
	}
	else {
		svg.velocity({ opacity: 1 }, {
			duration: 800,
			delay: 1000
		});
		chart.velocity({ opacity: 1 }, {
			duration: 800,
			delay: 1000,
			display: 'block'
		});
	}
});

endSection.onOut(function () {
	svg.velocity({ 'z-index': -1, opacity: 0 });
	chart.velocity({ opacity: 0 }, { display: 'none' });
	jQuery('.pieTip').css('display', 'none');
});

endSection.load = function (callback) {
	callback();
};

function init() {
	var pattern = jQuery('#patternLine line');
	var fill = jQuery('.info-svg #fill');
	var profile = jQuery('.info-svg #profile');
	svg.velocity({ opacity: 1 });
	fill.velocity({ opacity: 1 }, {
		duration: 800,
		delay: 1500,
		complete: function () {
			pattern.velocity({ strokeWidth: 1 }, 800);
			showProfile();
		}
	});
	function showProfile() {
		(function () {
			var lines = jQuery(profile.children('#border')).children();
			var lineTo = [
				[400, 0], [0, 540], [0, 540], [400, 0]
			];
			for (var i = 0; i < lines.length; i++) {
				jQuery(lines[i]).velocity({ x2: lineTo[i][0], y2: lineTo[i][1] }, 800)
					.velocity({ opacity: 0.6 }, 600);
			}
		})();
		(function () {
			var path = jQuery(profile.children('#path'));
			TweenLite.to({ l: 0 }, 2.4, {
				l: 180, delay: 0.2,
				onUpdate: function () {
					path.attr('d', 'M 110 80 h ' + this.target.l);
				},
				onComplete: function () {
					var infos = jQuery(profile.children('#info')).children();
					for (var i = 0; i < infos.length; i++) {
						jQuery(infos[i]).velocity({ opacity: 1 }, {
							duration: 600,
							delay: i * 550
						});
					}
					TweenLite.delayedCall(2, showLanguage);
				}
			});
		})();
		TweenLite.delayedCall(6, showTip);
		function showLanguage() {
			var pointer = jQuery(profile.children('#pointer'));
			TweenLite.to({ l: 0 }, 0.8, {
				l: 200,
				onUpdate: function () {
					pointer.attr('d', 'M 310 325 h ' + this.target.l);
				},
				onComplete: function () {
					TweenLite.to({ s: 0 }, 0.6, {
						s: 90,
						onUpdate: function () {
							pointer.attr('d', 'M 310 325 h 200 t ' + this.target.s + " -" + this.target.s);
						}
					});
				}
			});
			chart.css('display', 'block');
			chart.drawPieChart(
				[
					{
						title: "C",
						value: 10,
					},
					{
						title: "C++",
						value: 22,
					}, {
						title: "C#",
						value: 32,
					}, {
						title: "Java",
						value: 27,
					}, {
						title: "JS",
						value: 30,
					}, {
						title: "PHP",
						value: 3,
					}, {
						title: "Python",
						value: 2,
					}, {
						title: "Ruby",
						value: 5,
					}
				],
				{
					width: 300,
					height: 300,
					lightPiesOffset: 0
				});
		};
		function showTip() {
			var tip = jQuery('.info-svg #tip');
			tip.velocity({ opacity: 1 }, 600);
			jQuery(tip.children('line')).velocity({ x2: 320 }, 1000);
		};
	};
};

module.exports = endSection;