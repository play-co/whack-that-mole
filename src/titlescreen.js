/*
 * The title screen consists of a background image and a
 * start button. When this button is pressed, and event is
 * emitted to itself, which is listened for in the top application,
 * at that point, the title screen is removed, and the game
 * screen shown.
 */

import device;
import ui.View;
import ui.ImageView;

/* Since the start button is drawn to the background image,
 * we just need to create and position an overlay view that
 * will register input events and act as button.
 */
var startbutton = new ui.View({
	x: 58,
	y: 313,
	width: 200,
	height: 100
});

/* The title screen is added to the scene graph when it becomes
 * a child of the main application. When this class is instantiated,
 * it adds the start button as a child.
 */
var TitleScreen = Class(ui.ImageView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);
		
		this.addSubview(startbutton);

		/* Listening for a touch or click event, will dispatch a custom
		 * event to the title screen, which is listened for in the
		 * top-level application file.
		 */
		startbutton.on('InputSelect', (function () {
			this.emit('titlescreen:start');
		}).bind(this));
	};
});

/* Create a title screen singleton and export it as this module.
 */
exports = new TitleScreen({
	x: 0,
	y: 0,
	width: device.width,
	height: device.height,
	image: "resources/images/title_screen.png"
});
