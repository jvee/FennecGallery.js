;(function (global) {

	'use strict';

	var defaults = {
		delay: 3000,
		duration: 1500,
		id: 'gallery',
		easing: '>'
	};

	function FennecGallery(options) {
		this.initialize(options);
	}

	FennecGallery.prototype = {

		initialize: function (options) {
			this.options = options;
			this.gallery = SVG(options.id || defaults.id);
			this.gallery.viewbox(0, 0, 100, 100);
			this.images = options.images;
			this.delay = options.delay || defaults.delay;
			this.duration = options.duration || defaults.duration;
			this.easing = options.easing || defaults.easing;
			this.intervalTimer = undefined;
			this.current = {};
			this.current.index = -1;
			this.loaded = 0;

			this.preload(function () {
				this.show();
				this.start();
			});
				
		},

		preload: function (callback) {
			var x, img;

			for (x = 0; x < this.images.length; x++) {
				img = document.createElement('img');
				img.onload = this.imgLoaded.bind(this, x, this.images[x], callback);
				img.src = this.images[x];
			}

			this.current.text = this.gallery.text('0%')
					.fill('#ccc')
					.font({ family: 'Arial', size: 10, anchor: 'middle' })
					.move('50%', '40%', true);
		},

		imgLoaded: function (index, src, callback, event) {
			var percent;

			this.loaded += 1;

			percent = (100 / this.images.length * this.loaded).toFixed(0) + '%';
			this.current.text.text(percent);

			if (this.loaded === this.images.length && callback) {
				this.current.text.remove();
				callback.call(this);
			}
		},

		start: function () {
			this.intervalTimer = setInterval(this.show.bind(this), this.delay);
		},

		stop: function () {
			clearInterval(this.intervalTimer);
		},

		show: function () {
			var cached, index, image, clip, effect;

			cached = this.current;
			this.current = {};

			index = this.current.index = ++cached.index % this.images.length;

			image = this.current.image = this.gallery.group();
			image.rect(100, 100).fill({ color: '#fff' });
			image.image(this.images[index], 80, 80).move(10, 10);

			effect = this.effects[randomInteger(this.effects.length - 1)];

			// effect = this.effects[2];

			effect.bind(this)(this.current, cached, this.gallery, function () {
				if (cached.image) {
					cached.image.clipper.remove();
					cached.image.remove();
				}
			});
			
		}
	};

	FennecGallery.prototype.effects = [

		// circle
		function (newImage, oldImage, gallery, callback) {
			var clip = newImage.clip = gallery.circle(1).attr({ cx: 50, cy: 50 }),
				image = newImage.image.clipWith(clip);

			clip
				.animate(this.duration, this.easing, 0)
				.transform({
					scaleX: 150,
					scaleY: 150,
					x: -7450,
					y: -7450
				})
				.after(callback || function () {});
		},

		// triangle
		function (newImage, oldImage, gallery, callback) {
			var arrow = gallery.polygon('0,0 30,50 0,100'),
				rect = gallery.rect(100, 100).move(-100, 0),
				clip = newImage.clip = gallery.clip().add(arrow).add(rect),
				image = newImage.image.clipWith(clip),
				direction = randomInteger(3);

			if (direction === 1) clip.translate(100, 0).rotate(90);
			if (direction === 2) clip.translate(100, 100).rotate(180);
			if (direction === 3) clip.translate(0, 100).rotate(270);

			clip
				.animate(this.duration, this.easing, 0)
				.during(function (pos, morph) {
					arrow.translate(morph(0, 100), 0);
					rect.translate(morph(0, 100) + 1, 0);
				})
				.after(callback || function () {});
		},

		// radian
		function (newImage, oldImage, gallery, callback) {
			var circle = gallery.circle(80).move(200,0),
				rect = gallery.rect(80, 80).move(91, 10),
				clip = newImage.clip = gallery.clip().add(rect).add(circle),
				image = newImage.image.clipWith(clip),
				direction = randomInteger(3);

			if (direction === 1) clip.translate(100, 0).rotate(90);
			if (direction === 2) clip.translate(100, 100).rotate(180);
			if (direction === 3) clip.translate(0, 100).rotate(270);

			clip
				.animate(this.duration, this.easing, 0)
				.during(function (pos, morph) {
					circle.move((1 - pos) * 120 - 30, 10);
					rect.move((1-pos) * 120 + 10, 10);
				})
				.after(callback || function () {});
		},

		// stripe
		function (newImage, oldImage, gallery, callback) {
			var clip = newImage.clip = gallery.clip(),
				image = newImage.image.clipWith(clip),
				stripes = [], stripe, x;

			// vertical / horisontal
			if (randomInteger(1) === 1) clip.translate(100, 0).rotate(90);

			for (x = 0; x < 10; x++) {
				stripe = {};

				stripe.dxPos = randomInteger(80);
				stripe.initPos = randomInteger(1) === 1 ? 1 : -1;
				stripe.startPos = stripe.initPos * stripe.dxPos + stripe.initPos * 80;

				stripe.el = gallery.rect(9, 80).move(8 * x + 10, 10);
				stripe.el.transform('y', stripe.startPos);

				clip.add(stripe.el);
				stripes.push(stripe);
			}

			clip
				.animate(this.duration, this.easing, 0)
				.during(function (pos, morph) {
					for (x = 0; x < 10; x++) {
						stripe = stripes[x];
						stripe.el.transform('y', morph(stripe.startPos, 0));
					}

				})
				.after(callback || function () {});
		},

		// square
		function (newImage, oldImage, gallery, callback) {
			var clip = newImage.clip = gallery.rect(1).move(50,50).rotate(90),
				image = newImage.image.clipWith(clip);

			clip
				.animate(this.duration, this.easing, 0)
				.size(80, 80)
				.move(10, 10)
				.rotate(0)
				.after(callback || function () {});
		}
	];

	function randomInteger(bottom, top) {
		var topValue = top || bottom || 100,
			bottomValue = top ? bottom : 0;

		return Math.round(Math.random() * (topValue - bottomValue) + bottomValue);
	}


	global.FennecGallery = FennecGallery;

})(this, undefined);