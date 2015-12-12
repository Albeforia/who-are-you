'use strict';

var TextureManager = TextureManager || (function () {
	var THREE = require('three');
	var loader = new THREE.TextureLoader();
	var textures = {};
	return {
		register: function (user, name, src, setTexture) {
			var entry = textures[name];
			if (!entry) {
				entry = {
					source: src,
					users: []
				};
				textures[name] = entry;
				loader.load(entry.source,
					function (tex) {
						entry.texture = tex;
						if (setTexture) setTexture(tex);
						for (var i = 0; i < entry.users.length; i++) {
							entry.users[i].onTextureLoaded(tex);
						}
					});
			}
			entry.users.push(user);
			if (entry.texture) {
				user.onTextureLoaded(entry.texture);
			}
		},
		load: function (url, onLoad, onProgress, onError) {
			return loader.load(url, onLoad, onProgress, onError);
		}
	};
})();

module.exports = TextureManager;