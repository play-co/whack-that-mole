import animate;
import device;
import ui.View;
import ui.ImageView;
import ui.TextView;
import src.MoleHill as MoleHill;

var score = 0,
		high_score = 0,
		hit_value = 100,
		molehills = [];

/* The game screen is a singleton view that consists of
 * a scoreboard and a collection of molehills.
 */
var GameScreen = Class(ui.View, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this.addSubview(scoreboard);
		molehills.forEach((function (molehill) {
			this.addSubview(molehill);
			molehill.on('molehill:hit', function () {
				update_score(hit_value);
			});
		}).bind(this));
	};
});


/* The scoreboard displays the "ready, set, go" message and current score.
 */
var scoreboard = new ui.TextView({
	x: 10,
	y: 0,
	width: device.width,
	height: 50,
	autoSize: false,
	fontSize: 24,
	fontFamily: 'monospace',
	textAlign: 'left',
	color: '#fff'
});

function update_score (val) {
	score = score + val;
	scoreboard.setText("Score: " + score);
}


/* Create and position molehills.
 */
var x_offset = 5,
		y_offset = 160,
		y_pad = 25,
		layout = [[1, 0, 1],
							[0, 1, 0],
							[1, 0, 1]];

//set up mole holes
for (var row = 0, len = layout.length, molehill; row < len; row++) {
	for (var col = 0; col < len; col++) {
		if (layout[row][col] !== 0) {
			molehill = new MoleHill();
			molehill.style.x = x_offset + col * molehill.style.width;
			molehill.style.y = y_offset + row * (molehill.style.height + y_pad);
			molehills.push(molehill);
		}
	}
}




GLOBAL.holes = molehills;

/* Create a singleton game screen which is what this module exports.
 */
var gamescreen = exports = new GameScreen({
	tag: 'game-screen',
	x: 0,
	y: 0,
	width: device.width,
	height: device.height,
	backgroundColor: '#37B34A',
	visible: false
});

gamescreen.on('startgame', start_game_flow);


/* Manages the intro animation sequence before starting game.
 */
function start_game_flow () {
	animate(scoreboard).wait(500)
		.then(function () {
			scoreboard.setText("Ready ...");
		}).wait(1500).then(function () {
			scoreboard.setText("Set ...");
		}).wait(1500).then(function () {
			scoreboard.setText("Whack that Mole!");
			//keep text up for a bit longer
			setTimeout(function () {
				update_score(0);
			}, 3000);
			play_game();
		});
}

/* With everything in place, the actual game play is quite simple.
 * Summon a non-active mole every n seconds. If it's hit, an event
 * handler on the molehill updates the score. After a set timeout,
 * stop calling the moles and proceed to the end game.
 */
function play_game () {
	var game_length = 5000,
			mole_interval = 1000,
			i = setInterval(tick, mole_interval);
	
	setTimeout(function () {
		clearInterval(i);
		setTimeout(end_game_flow, mole_interval*2);
	}, game_length);
}

/* Pick a random, non-active, mole from our molehills.
 */
function tick () {
	var len = molehills.length,
			molehill = molehills[Math.random() * len | 0];
	
	while (molehill.activeMole) {
		molehill = molehills[Math.random() * len | 0];
	}
	molehill.showMole();
}

/* Check for high-score and play the ending animation.
 * Add a click-handler to the screen to return to the title
 * screen so we may play again.
 */
function end_game_flow () {
	//check for high-score and do appropriate animation
	if (score > high_score) {
		high_score = score;
		molehills.forEach(function (molehill) {
			molehill.endAnimation();
		});
		//scoreboard.setText(high_score + " is a new high score!\nTap to play again?");
	} else {
		molehills[(molehills.length-1) / 2 | 0].endAnimation(true);
		//scoreboard.setText("Game Over\nTap to play again?");
	}

	//slight delay before allowing a tap reset
	setTimeout(function () {
		GC.app.view.once('InputSelect', function () {
			gamescreen.emit('endgame');
			reset_game();
		});
	}, 2000);
}

/* Reset game counters and assets.
 */
function reset_game () {
	score = 0;
	scoreboard.setText('');
	molehills.forEach(function (molehill) {
		molehill.resetMole();
	});
}
