/*
 * The main application file, your game code begins here.
 */

import sound;
import src.titlescreen as titlescreen;
import src.gamescreen as gamescreen;

/* Your application inherits from GC.Application, which is
 * exported and instantiated when the game is run.
 */
exports = Class(GC.Application, function () {

	/* Preload the audio files so they're ready to go.
	 */
	this.initUI = function () {
		sound.preload('effect', 'pop');
		sound.preload('effect', 'whack');
		sound.preload('background', 'levelmusic');
	};
	
	/* Once the scene graph has been initialized and is ready
	 * to go, you can add children to it so they can be seen.
	 */
	this.launchUI = function () {
		this.view.addSubview(titlescreen);
		this.view.addSubview(gamescreen);

		//sound won't play at this point
		//sound.play('background', 'levelmusic');
	};
});

/* Listen for an event dispatched by the title screen when
 * the start button has been pressed. Hide the title screen,
 * show the game screen, then dispatch a custom event to the
 * game screen to start the game.
 */
titlescreen.on('titlescreen:start', function () {
	gamescreen.show();
	titlescreen.hide();
	gamescreen.emit('app:start');
});

/* When the game screen has signalled that the game is over,
 * show the title screen so that the user may play the game again.
 */
gamescreen.on('gamescreen:end', function () {
	titlescreen.show();
	gamescreen.hide();
});
