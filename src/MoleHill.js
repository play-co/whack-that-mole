import animate;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import src.soundcontroller as soundcontroller;

var mole_normal_img = new Image({url: "resources/images/mole_normal.png"}),
		mole_hit_img = new Image({url: "resources/images/mole_hit.png"}),
		hole_back_img = new Image({url: "resources/images/hole_back.png"}),
		hole_front_img = new Image({url: "resources/images/hole_front.png"}),
		mole_up = 5,
		mole_down = 35;

exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, {
			width:	hole_back_img.getWidth(),
			height: hole_back_img.getHeight() + mole_normal_img.getHeight()
		});

		supr(this, 'init', [opts]);

		this.activeMole = false;
		this.activeInput = false;
	};

	/* Set the mole as active and animate it up.
	 */
	this.showMole = function () {
		if (this.activeMole === false) {
			this.activeMole = true;
			this.activeInput = true;

			this._animator.now({y: mole_up}, 500, animate.EASE_IN)
				.wait(1000).then(bind(this, function () {
					this.activeInput = false;
				})).then({y: mole_down}, 200, animate.EASE_OUT)
				.then(bind(this, function () {
					this.activeMole = false;
				}));
		}
	};

	/* Set mole as inactive and animate it down.
	 */
	this.hitMole = function () {
		if (this.activeMole && this.activeInput) {
			this.activeInput = false;

			this._animator.clear()
				.now((function () {
					this._moleview.setImage(mole_hit_img);
				}).bind(this))
				.then({y: mole_down}, 1500)
				.then(bind(this, function () {
					this._moleview.setImage(mole_normal_img);
					this.activeMole = false;
					this.activeInput = false;
				}));
		}
	};

	/* Ending animation, pop up and "laugh"
	 */
	this.endAnimation = function () {
		this.activeInput = false;
		this._animator.then({y: mole_up}, 2000)
			.then(bind(this, function () {
				this._interval = setInterval(bind(this, function () {
					if (this._moleview.getImage() === mole_normal_img) {
						this._moleview.setImage(mole_hit_img);
					} else {
						this._moleview.setImage(mole_normal_img);
					}
				}), 100);
			}));
	};

	/* Rest the molehill properties for the next game.
	 */
	this.resetMole = function () {
		clearInterval(this._interval);
		this._animator.clear();
		this._moleview.style.y = mole_down;
		this._moleview.setImage(mole_normal_img);
		this.activeMole = false;
		this.activeInput = false;
	};

	/*
	 * Layout
	 */
	this.buildView = function () {
		var hole_back = new ui.ImageView({
			superview: this,
			image: hole_back_img,
			x: 0,
			y: 25,
			width: hole_back_img.getWidth(),
			height: hole_back_img.getHeight()
		});

		this._inputview = new ui.View({
			superview: this,
			clip: true,
			x: hole_back_img.getWidth()/2 - mole_normal_img.getWidth()/2,
			y: 0,
			width: mole_normal_img.getWidth(),
			height: 40
		});

		this._moleview = new ui.ImageView({
			superview: this._inputview,
			image: mole_normal_img,
			x: 0,
			y: mole_down,
			width: mole_normal_img.getWidth(),
			height: mole_normal_img.getHeight()
		});

		var hole_front = new ui.ImageView({
			superview: this,
			canHandleEvents: false,
			image: hole_front_img,
			x: 0,
			y: 25,
			width: hole_front_img.getWidth(),
			height: hole_front_img.getHeight()
		});

		/* Create an animator object for mole.
		 */
		this._animator = animate(this._moleview);
		this._interval = null;

		var sound = soundcontroller.getSound();

		this._inputview.on('InputSelect', bind(this, function () {
			if (this.activeInput) {
				sound.play('whack');
				this.emit('molehill:hit');
				this.hitMole();
			}
		}));
	};
});
