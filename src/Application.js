import src.titlescreen as titlescreen;
import src.gamescreen as gamescreen;

exports = Class(GC.Application, function () {
	this.launchUI = function () {
		this.view.addSubview(titlescreen);
		this.view.addSubview(gamescreen);
	};
});

titlescreen.on('startgame', function () {
	gamescreen.show();
	titlescreen.hide();
	gamescreen.emit('startgame');
});

gamescreen.on('endgame', function () {
	titlescreen.show();
	gamescreen.hide();
});
