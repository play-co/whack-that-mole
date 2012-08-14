import animate;
//import sound;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;

var mole_normal_img = new Image({url: "resources/images/mole_normal.png"}),
		mole_hit_img = new Image({url: "resources/images/mole_hit.png"}),
		hole_back_img = new Image({url: "resources/images/hole_back.png"}),
		hole_front_img = new Image({url: "resources/images/hole_front.png"}),
		mole_up = 5,
		mole_down = 35;

exports = Class(ui.View, function (supr) {
	
	this.init = function (opts) {
		opts = merge(opts, {
			width: 	hole_back_img.getWidth(),
			height: hole_back_img.getHeight() + mole_normal_img.getHeight()
		});

		supr(this, 'init', [opts]);

		create_ui.call(this);

		this.input_area.on('InputSelect', (function () {
			if (this.activeInput) {
				//sound.play('effect', 'whack');
				this.emit('molehill:hit');
				this.hitMole();
			}
		}).bind(this));

		/* Object proprieties
		 */
		this.mole_animator = animate(this.moleview);
		this.anim_interval = null;
		this.activeMole = false;
		this.activeInput = false;
	};

	this.showMole = function () {
		if (this.activeMole === false) {
			this.activeMole = true;
			this.activeInput = true;
			
			this.mole_animator.now({y: mole_up}, 500, animate.EASE_IN)
				.wait(1000).then((function () {
					this.activeInput = false;
				}).bind(this)).then({y: mole_down}, 200, animate.EASE_OUT)
				.then((function () {
					this.activeMole = false;
				}).bind(this));
		}
	};

	this.hitMole = function () {
		if (this.activeMole && this.activeInput) {
			this.activeInput = false;
			
			this.mole_animator.clear()
				.now((function () {
					this.moleview.setImage(mole_hit_img);
				}).bind(this))
				.then({y: mole_down}, 1500)
				.then((function () {
					this.moleview.setImage(mole_normal_img);
					this.activeMole = false;
					this.activeInput = false;
				}).bind(this));
		}
	};
	
	this.endAnimation = function () {
		this.activeInput = false;
		this.mole_animator.then({y: mole_up}, 2000)
			.then((function () {
				var moleview = this.moleview;
				
				this.anim_interval = setInterval(function () {
					if (moleview.getImage() === mole_normal_img) {
						moleview.setImage(mole_hit_img);
					} else {
						moleview.setImage(mole_normal_img);
					}
				}, 100);
			}).bind(this));
	};

	this.resetMole = function () {
		clearInterval(this.anim_interval);
		this.mole_animator.clear();
		this.moleview.style.y = mole_down;
		this.moleview.setImage(mole_normal_img);
		this.activeMole = false;
		this.activeInput = false;
	};
});


function create_ui () {
	
	var hole_back = new ui.ImageView({
		superview: this,
		image: hole_back_img,
		x: 0,
		y: 25,
		width: hole_back_img.getWidth(),
		height: hole_back_img.getHeight()
	});
		
	this.input_area = new ui.View({
		superview: this,
		clip: true,
		x: hole_back_img.getWidth()/2 - mole_normal_img.getWidth()/2,
		y: 0,
		width: mole_normal_img.getWidth(),
		height: 40,
		canHandleEvents: true
	});
		
	this.moleview = new ui.ImageView({
		superview: this.input_area,
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
}
