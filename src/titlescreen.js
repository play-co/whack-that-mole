import device;
import ui.View;
import ui.ImageView;

var TitleScreen = Class(ui.ImageView, function (supr) {

	this.init = function (opts) {
		opts.image = "resources/images/title_screen.png";
		supr(this, 'init', arguments);

		var startbutton = new ui.View({
			superview: this,
			x: 58,
			y: 313,
			width: 200,
			height: 100
		});

		startbutton.on('InputSelect', (function () {
			this.emit('startgame');
		}).bind(this));
	};
});

exports = new TitleScreen({
	x: 0,
	y: 0,
	width: device.width,
	height: device.height
});
