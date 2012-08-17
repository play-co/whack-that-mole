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

/* Some game constants.
 */
var score = 0,
		high_score = 19,
		hit_value = 1,
		mole_interval = 600,
		game_on = false,
		game_length = 20000, //20 secs
		countdown_secs = game_length / 1000;

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

		/* The scoreboard displays the "ready, set, go" message,
		 * the current score, and the end game message. We'll set
		 * it as a hidden property on our class since we'll use it
		 * throughout the game.
		 */
		this._scoreboard = new ui.TextView({
			superview: this,
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

		/* The start event is emitted from the start button via the main application.
		 */
		this.on('app:start', start_game_flow.bind(this));
	};

	/*
	 * Layout the molehills before the view's first render.
	 */
	this.buildView = function () {
		var x_offset = 5,
				y_offset = 160,
				y_pad = 25,
				layout = [[1, 0, 1],
									[0, 1, 0],
									[1, 0, 1]];

		this._molehills = [];
		
		for (var row = 0, len = layout.length; row < len; row++) {
			for (var col = 0; col < len; col++) {
				if (layout[row][col] !== 0) {
					var molehill = new MoleHill();
					molehill.style.x = x_offset + col * molehill.style.width;
					molehill.style.y = y_offset + row * (molehill.style.height + y_pad);
					this.addSubview(molehill);
					this._molehills.push(molehill);
					
					//update score on hit event
					molehill.on('molehill:hit', bind(this, function () {
						if (game_on) {
							score = score + hit_value;
							this._scoreboard.setText(score.toString());
						}
					}));
				}
			}
		}

		//Set up countdown timer
		this._countdown = new ui.TextView({
			superview: this._scoreboard,
			visible: false,
			x: 260,
			y: -5,
			width: 50,
			height: 50,
			fontSize: 24,
			color: '#fff',
			opacity: 0.7
		});
	};
});

/*
 * Game play
 */

/* Manages the intro animation sequence before starting game.
 */
function start_game_flow () {
	var scoreboard = this._scoreboard;
	
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
	var i = setInterval(tick.bind(this), mole_interval),
			j = setInterval(update_countdown.bind(this), 1000);

	setTimeout(bind(this, function () {
		game_on = false;
		clearInterval(i);
		clearInterval(j);
		setTimeout(end_game_flow.bind(this), mole_interval * 2);
		this._countdown.setText(":00");
	}), game_length);

	//Make countdown timer visible, remove start message if still there.
	setTimeout(bind(this, function () {
		this._scoreboard.setText(score.toString());
		this._countdown.style.visible = true;
	}), game_length * 0.25);

	//Running out of time! Set countdown timer red.
	setTimeout(bind(this, function () {
		this._countdown.updateOpts({color: '#CC0066'});
	}), game_length * 0.75);
}

/* Pick a random, non-active, mole from our molehills.
 */
function tick () {
	var len = this._molehills.length,
			molehill = this._molehills[Math.random() * len | 0];
	
	while (molehill.activeMole) {
		molehill = this._molehills[Math.random() * len | 0];
	}
	molehill.showMole();
}

/* Updates the countdown timer, pad out leading zeros.
 */
function update_countdown () {
	countdown_secs -= 1;
	this._countdown.setText(":" + (("00" + countdown_secs).slice(-2)));
}

/* Check for high-score and play the ending animation.
 * Add a click-handler to the screen to return to the title
 * screen so we may play again.
 */
function end_game_flow () {
	this._countdown.setText(''); //clear countdown text
	//resize scoreboard text to fit everything
	this._scoreboard.updateOpts({
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
		this._molehills.forEach(function (molehill) {
			molehill.endAnimation();
		});
		this._scoreboard.setText("You whacked " + score + " moles\nThat's a new high score!\nTap to play again");
	} else {
		this._molehills[(this._molehills.length-1) / 2 | 0].endAnimation(true);
		var s = (score === 1) ? "mole" : "moles",
				taunt = taunt_messages[Math.random() * taunt_messages.length | 0];
		this._scoreboard.setText("You whacked " + score + " " + s + ".\n" + taunt + "\nTap to play again");
	}

	//slight delay before allowing a tap reset
	setTimeout(emit_endgame_event.bind(this), 2000);
}

/* Tell the main app to switch back to the title screen.
 */
function emit_endgame_event () {
	this.once('InputSelect', function () {
		this.emit('gamescreen:end');
		reset_game.call(this);
	});
}
	
/* Reset game counters and assets.
 */
function reset_game () {
	score = 0;
	countdown_secs = game_length / 1000;
	this._scoreboard.setText('');
	this._molehills.forEach(function (molehill) {
		molehill.resetMole();
	});
	this._scoreboard.updateOpts({
		x: 0,
		fontSize: 38,
		verticalAlign: 'middle',
		textAlign: 'center',
		multiline: false
	});
	this._countdown.updateOpts({
		visible: false,
		color: '#fff'
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
