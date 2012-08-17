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
		high_score = 19,
		hit_value = 1,
		game_on = false,
		molehills = [],
		scoreboard;

/* The GameScreen view is a child of the main application.
 * By adding the scoreboard and the molehills as it's children,
 * everything is visible in the scene graph.
 */
exports = Class(ui.View, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			width: device.width,
			height: device.height,
			backgroundColor: '#37B34A',
			visible: false
		});
		
		supr(this, 'init', [opts]);

		build_views(this);

		/* This event is emitted from the main application, which in
		 * turn got from the start button on the title screen.
		 */
		this.on('app:start', start_game_flow.bind(this));
	};
});

/*
 * Layout
 */

function build_views (parent) {

	/* The scoreboard displays the "ready, set, go" message,
	 * the current score, and the end game message. We'll use
	 * variable at module-level scope since we'll be using it
	 * throughout the file.
	 */
	scoreboard = new ui.TextView({
		superview: parent,
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

	/* Create and position the molehills.
	 */
	var x_offset = 5,
			y_offset = 160,
			y_pad = 25,
			layout = [[1, 0, 1],
								[0, 1, 0],
								[1, 0, 1]];

	for (var row = 0, len = layout.length, molehill; row < len; row++) {
		for (var col = 0; col < len; col++) {
			if (layout[row][col] !== 0) {
				molehill = new MoleHill();
				molehill.style.x = x_offset + col * molehill.style.width;
				molehill.style.y = y_offset + row * (molehill.style.height + y_pad);
				molehills.push(molehill);
				parent.addSubview(molehill);
				
				//update score on hit event
				molehill.on('molehill:hit', function () {
					if (game_on) {
						score = score + hit_value;
						scoreboard.setText(score.toString());
					}
				});
			}
		}
	}
}

/*
 * Game play
 */

/* Manages the intro animation sequence before starting game.
 */
function start_game_flow () {
	animate(scoreboard).wait(1000)
		.then(function () {
			scoreboard.setText("Ready ...");
		}).wait(1500).then(function () {
			scoreboard.setText("Set ...");
		}).wait(1500).then(bind(this, function () {
			scoreboard.setText("Whack that Mole!");
			//start game ...
			game_on = true;
			play_game.call(this);
		}));
}

/* With everything in place, the actual game play is quite simple.
 * Summon a non-active mole every n seconds. If it's hit, an event
 * handler on the molehill updates the score. After a set timeout,
 * stop calling the moles and proceed to the end game.
 */
function play_game () {
	var game_length = 20000, //20 secs
			mole_interval = 600,
			i = setInterval(tick, mole_interval);

	setTimeout(bind(this, function () {
		game_on = false;
		clearInterval(i);
		setTimeout(end_game_flow.bind(this), mole_interval * 2);
	}), game_length);
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
		scoreboard.setText("You whacked " + score + " " + s + ".\n" + taunt + "\nTap to play again");
	}

	//slight delay before allowing a tap reset
	setTimeout(emit_endgame_event.bind(this), 2000);
}

/* Tell the main app to switch back to the title screen.
 */
function emit_endgame_event () {
	this.once('InputSelect', function () {
		this.emit('gamescreen:end');
		reset_game();
	});
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
