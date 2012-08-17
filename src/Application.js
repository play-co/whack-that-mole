/*
 * The main application file, your game code begins here.
 */

import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
import src.soundcontroller as soundcontroller;

/* Your application inherits from GC.Application, which is
 * exported and instantiated when the game is run.
 */
exports = Class(GC.Application, function () {

	/* Run after the engine is created and the scene graph is in
	 * place, but before the resources have been loaded.
	 */
	this.initUI = function () {
		var titlescreen = new TitleScreen(),
				gamescreen = new GameScreen();
		
		//GC.app.view (or this.view here) is a StackView at the root of the scene graph
		this.view.push(titlescreen);

		var sound = soundcontroller.getSound();
		
		/* Listen for an event dispatched by the title screen when
		 * the start button has been pressed. Hide the title screen,
		 * show the game screen, then dispatch a custom event to the
		 * game screen to start the game.
		 */
		titlescreen.on('titlescreen:start', function () {
			sound.play('levelmusic');
			GC.app.view.push(gamescreen);
			gamescreen.emit('app:start');
		});
		
		/* When the game screen has signalled that the game is over,
		 * show the title screen so that the user may play the game again.
		 */
		gamescreen.on('gamescreen:end', function () {
			sound.stop('levelmusic');
			GC.app.view.pop();
		});
	};
	
	/* Executed after the asset resources have been loaded.
	 * If there is a splash screen, it's removed.
	 */
	this.launchUI = function () {};
});
