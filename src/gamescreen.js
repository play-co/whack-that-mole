/*
 * The game screen is a singleton view that consists of
 * a scoreboard and a collection of molehills.
 */

import animate;
import device;
import ui.View;
import ui.ImageView;
import ui.TextView;
import src.MoleHill as MoleHill;

var score = 0,
		high_score = 30,
		hit_value = 1,
		molehills = [];

/*
 * Layout
 */

/* This is the brown background box that holds the text view.
 */
var scoreboard_holder = new ui.View({
	x: 0,
	y: 0,
	width: device.width,
	height: 90,
	autoSize: false,
	backgroundColor: '#845e40',
});

/* The scoreboard displays the "ready, set, go" message,
 * the current score, and the end game message. Because
 * of the size differences, it's settings are updated
 * in the end game flow.
 */
var scoreboard = new ui.TextView({
	superview: scoreboard_holder,
	x: 0,
	y: 15,
	width: device.width,
	height: 50,
	autoSize: false,
	fontSize: 38,
	verticalAlign: 'middle',
	textAlign: 'center',
	multiline: false,
	color: '#fff'
});

function update_score (val) {
	score = score + val;
	scoreboard.setText(score.toString());
}

/* Create and position the molehills.
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

/* The game screen view is a child of the main application.
 * By adding the scoreboard and the molehills as it's children,
 * everything is visible in the scene graph.
 */
var GameScreen = Class(ui.View, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this.addSubview(scoreboard_holder);
		molehills.forEach((function (molehill) {
			this.addSubview(molehill);
			molehill.on('molehill:hit', function () {
				update_score(hit_value);
			});
		}).bind(this));
	};
});

/* Export a game screen singleton as this module.
 */
var gamescreen = exports = new GameScreen({
	x: 0,
	y: 0,
	width: device.width,
	height: device.height,
	backgroundColor: '#37B34A',
	visible: false
});

/* This event is emitted from the main application, which in
 * turn got from the start button on the title screen.
 */
gamescreen.on('app:start', start_game_flow);

/*
 * Game play
 */

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
	var game_length = 30000, //30 secs
			mole_interval = 600,
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
	//resize scoreboard text to fit everything
	scoreboard.updateOpts({
		text: '',
		x: 10,
		fontSize: 17,
		verticalAlign: 'top',
		textAlign: 'left',
		multiline: true
	});
	//check for high-score and do appropriate animation
	if (score > high_score) {
		high_score = score;
		molehills.forEach(function (molehill) {
			molehill.endAnimation();
		});
		scoreboard.setText("You whacked " + score + " moles\nThat's a new high score!\nTap to play again");
	} else {
		molehills[(molehills.length-1) / 2 | 0].endAnimation(true);
		var s = (score === 1) ? "mole" : "moles",
				taunt = taunt_messages[Math.random() * taunt_messages.length | 0];
		scoreboard.setText("You whacked " + score + " " + s + ".\n" +
											 taunt + "\n" +
											 "Tap to play again");
	}

	//slight delay before allowing a tap reset
	setTimeout(function () {
		GC.app.view.once('InputSelect', function () {
			gamescreen.emit('gamescreen:end');
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
	scoreboard.updateOpts({
		text: '',
		x: 0,
		fontSize: 38,
		verticalAlign: 'middle',
		textAlign: 'center',
		multiline: false
	});
}

var taunt_messages = [
	"Welcome to Loserville, population: you.", //max length
	"You're an embarrassment!",
	"You'll never catch me!",
	"Your days are numbered, human.",
	"Don't quit your day job.",
	"Just press the screen, it's not hard.",
	"You might be the worst I've seen.",
	"You're just wasting my time.",
	"Don't hate the playa, hate the game.",
	"Make like a tree, and get out of here!"
];
