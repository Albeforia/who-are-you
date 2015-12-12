'use strict';

var jQuery = require('jquery');

function Map() {
	this.$el = jQuery('<div class="map"></div>');
	this.$nodes = null;
	this.callback = function () { };
}

Map.prototype.$node = jQuery('<div class="map-node"></div>');

Map.prototype.addNode = function (index) {
	var $node = this.$node.clone();
	$node.attr('data-index', index);
	this.$el.append($node);
};

Map.prototype.init = function () {
	var _this = this;
	// event
	this.$el.on('click', '.map-node', function () {
		var index = jQuery(this).data('index');
		_this.callback(index);
	});
	// center
	this.$el.css('margin-top', - this.$el.height() / 2);
	// nodes
	this.$nodes = this.$el.find('.map-node');
};

Map.prototype.onClick = function (callback) {
	this.callback = callback;
};

Map.prototype.setActive = function (index) {
	this.$nodes.removeClass('is-active');
	jQuery(this.$nodes[index]).addClass('is-active');
};

Map.prototype.in = function () {
	this.$nodes.each(function (i) {
		jQuery(this).delay(i * 50).animate({ right: 0, opacity: 1 }, 500);
	});
};

module.exports = Map;