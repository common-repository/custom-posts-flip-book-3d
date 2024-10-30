/*
	Flipper v1.0
	Author: Nikolay Dyankov
	Site: http://www.nikolaydyankov.com
	Email: me@nikolaydyankov.com
*/

(function($) {
	var supports = (function() {
		var div = document.createElement('div');
		vendors = 'Khtml Ms O Moz Webkit'.split(' ');
		
		len = vendors.length;
		return function(prop) {  
			if ( prop in div.style ) return true;
			
			prop = prop.replace(/^[a-z]/, function(val) {  
				return val.toUpperCase();  
			});
			
			while(len--) {  
			      if ( vendors[len] + prop in div.style ) {  
			            return true;  
			      }  
			   }
			
			return false;
		};
	})();
	
	if (supports('transform')) {
		var fb = false;
	} else {
		var fb = true;
	}
	
	var increment, flipper, i, mouseDown, mouseDragging, bounce, touchDown, eX, eY, mouseX, mouseY, delta, lastDelta, moveDirection, direction, temp, currentPageSide, currentPageSidePage, nextPageSide, currentPageOverlay, nextPageOverlay, currentPage, nextPage, currentDirection, deg, startDeg, reachedHalf, cReachedHalf, animWidth, animDirection;
	var animating = false;
	
	window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
	
	// eX = Event X location, eY = Event Y location
	
	
	function Flipper() {
		this.pages;
		this.wrap;
		this.currentPage = 0;
		this.prevPage;
		this.nextPage;
		this.numPages;
	}
	Flipper.prototype.init = function(element) {
		var root = this;
		root.wrap = $(element);
		root.pages = root.wrap.find('.flipper-page');
		
		// Add class "flipper-wrap" if it doesn't exist. That's done if the user forgets to add the class, because the script can be called upon any element.			
		if (!root.wrap.hasClass('flipper-wrap')) {
			root.wrap.addClass('flipper-wrap');
		}
		
		// Add class flipper-fb if fallback code is necessary
		if (fb) {
			root.wrap.addClass('flipper-fb');
		}
		
		// Change the width and height of the flipbook's main element, according to the options. If no options were specified, it defaults to 800x400 pixels.			
		if (O.width != 800 || O.height != 400) {
			root.wrap.css({
				'width' : O.width,
				'height' : O.height
			});				
		}
		
		// Alter the HTML code for each page			
		if (fb) { root.fb_initPages(); } else { root.initPages(); }

		// Add UI elements
		root.initUI();
		
		// Add events
		if (O.pager) {
			$(root.wrap).find('.flipper-pager').on('click', function() {
				if (!animating) {
					root.nextPage = parseInt($(this).attr('id').replace('flipper-pager-', ''));
					direction = (root.nextPage < root.currentPage) ? -1 : 1;

					if (root.nextPage != root.currentPage) {
						root.showPage(direction, 0);
					}
				}				
			});
		}
		if (O.arrows) {
			$(root.wrap).find('.flipper-next-page').on('click.flipper', function() {
				root.showNextPage();
			});
			$(root.wrap).find('.flipper-prev-page').on('click.flipper', function() {
				root.showPrevPage();
			});
		}			
		
		$(root.pages).on('mousedown.flipper', function(e) {
			if (!animating) {
				mouseDown = true;
			}
			eX = e.pageX;
			eY = e.pageY;
		});
		$(document).on('mousemove.flipper', function(e) {
			if (mouseDown && !mouseDragging) {
				// initialize
				mouseX = e.pageX;
				mouseY = e.pageY;
				if (!animating && mouseX - eX != 0) { 
					root.startDragging();
					mouseDragging = true;
				}
				
			}
			if (mouseDragging) {
				mouseX = e.pageX;
				mouseY = e.pageY;
				// perform dragging
				if (!animating) {
					root.drag();
				}
			}
		});
		$(document).on('mouseup.flipper', function(e) {
			// finish dragging
			if (mouseDown) {
				if (!animating && mouseDragging) {
					root.finishDragging();
				}
			}
			mouseDragging = false;
			mouseDown = false;
		});
		
		// Touch
		if (!fb) {
			if (O.pager) {
				$(root.wrap).find('.flipper-pager').get(0).addEventListener('touchend', function() {
					if (!animating) {
						root.nextPage = parseInt($(this).attr('id').replace('flipper-pager-', ''));
						direction = (root.nextPage < root.currentPage) ? -1 : 1;

						if (root.nextPage != root.currentPage) {
							root.showPage(direction, 0);
						}
					}					
				});
			}
			if (O.arrows) {
				$(root.wrap).find('.flipper-next-page').get(0).addEventListener('touchend', function() {
					root.showNextPage();
				});
				$(root.wrap).find('.flipper-prev-page').get(0).addEventListener('touchend', function() {
					root.showPrevPage();
				});
			}
			root.wrap.get(0).addEventListener('touchstart', function(e) {
				e.preventDefault();
				if (!animating) {
					mouseDown = true;
				}
				eX = e.touches[0].pageX;
				eY = e.touches[0].pageY;
			});
			document.addEventListener('touchmove', function(e) {
				if (mouseDown && !mouseDragging) {
					// initialize
					mouseX = e.touches[0].pageX;
					mouseY = e.touches[0].pageY;
					if (!animating && mouseX - eX != 0) { 
						root.startDragging();
						mouseDragging = true;
					}

					e.preventDefault();
				}
				if (mouseDragging) {
					e.preventDefault();
					mouseX = e.touches[0].pageX;
					mouseY = e.touches[0].pageY;
					// perform dragging
					if (!animating) {
						root.drag();
					}
				}
			});
			document.addEventListener('touchend', function() {
				// finish dragging
				if (mouseDown) {
					if (!animating && mouseDragging) {
						root.finishDragging();
					}
				}
				mouseDragging = false;
				mouseDown = false;
			});
		}
		
		setTimeout(function() {
			if (!fb) { root.bounce(); } else { root.fb_bounce(); }
		}, 500);
		this.updatePagers();
	}
	Flipper.prototype.initPages = function() {
		var root = this;
		root.numPages = root.pages.length;
		var html, page, h;
		var mode = jQuery(root.wrap).data('mode');
		for (i=0; i<root.numPages; i++) {
			page = $(root.pages[i]);
			html = page.html();
			if (mode == 'single') {
				images = page.data('imgurls');
				classes = page.data('styles');
				h = '	<div class="flipper-page-left"><div class="flipper-overlay"></div><div class="flipper-page '+classes[0]+'">'+images[0]+'</div></div>';
				h += '	<div class="flipper-page-right"><div class="flipper-overlay"></div><div class="flipper-page '+classes[1]+'">'+images[1]+'</div></div>';
				
				page.removeClass('flipper-page').addClass('flipper-page-wrap').html(h).attr('id', 'flipper-page-' + i);
				
			} else {
				h = '	<div class="flipper-page-left"><div class="flipper-overlay"></div><div class="flipper-page">' + html + '</div></div>';
				h += '	<div class="flipper-page-right"><div class="flipper-overlay"></div><div class="flipper-page">' + html + '</div></div>';
				
				page.removeClass('flipper-page').addClass('flipper-page-wrap').html(h).attr('id', 'flipper-page-' + i);
			}

			
		}
		
		// Put the first page on top
		$(root.pages).css({ 'z-index' : 1 });
		$(root.pages[0]).css({ 'z-index' : 3 });
	}
	Flipper.prototype.initUI = function() {
		h = '';
		if (O.arrows) {
			h = '<img src="' + O.imagesPath + 'arrow_next.png" class="flipper-next-page"><img src="' + O.imagesPath + 'arrow_prev.png" class="flipper-prev-page">';
		}
		
		if (O.pager) {
			h += '<div class="flipper-pager-wrap">';
			for (i=0; i < this.numPages; i++) {
				h += '<img src="' + O.imagesPath + 'pager.png" class="flipper-pager" id="flipper-pager-' + i + '">';
			}
			h += '</div>';
		}			

		if (O.arrows || O.pager) {
			this.wrap.prepend(h);
		}			
	}
	Flipper.prototype.bounce = function() {
		var root = this;
		currentPageSide = $('#flipper-page-0').find('.flipper-page-right');
		currentPageSideOverlay = currentPageSide.find('.flipper-overlay').show();
		deg = 1;
		reachedHalf = false;
		start = true;
		bounce = true;
		
		animate_bounce();
	}
	Flipper.prototype.showPage = function(direction, animDeg) {
		if (fb) {
			this.fb_showPage(direction, animDeg);
			return;
		}
		
		if (bounce && direction == -1) {
			this.setAngle(currentPageSide, currentPageSideOverlay, 0);
			currentPageSideOverlay.hide();
			bounce = false;
		} else {
			currentPageSideOverlay.hide();
			bounce = false;
		}
		reachedHalf = false;
		var root = this;
		
		// Cache elements
		nextPage = root.wrap.find('#flipper-page-' + this.nextPage);
		currentPage = root.wrap.find('#flipper-page-' + this.currentPage);
		
		if (direction == 1) {
			currentPageSide = currentPage.find('.flipper-page-right');
			nextPageSide = nextPage.find('.flipper-page-left');
			currentPageOverlay = currentPageSide.find('.flipper-overlay').show();
			nextPageOverlay = nextPageSide.find('.flipper-overlay').show();
		} else {
			currentPageSide = currentPage.find('.flipper-page-left');
			nextPageSide = nextPage.find('.flipper-page-right');
			currentPageOverlay = currentPageSide.find('.flipper-overlay').show();
			nextPageOverlay = nextPageSide.find('.flipper-overlay').show();
		}
		
		if (animating) {
			return;
		}
		
		deg = animDeg;

		this.pages.css({ "z-index" : 0 });
		if (deg < 90) {
			currentPage.css({ "z-index" : 5 });
			nextPage.css({ "z-index" : 3 });
		} else {
			currentPage.css({ "z-index" : 3 });
			nextPage.css({ "z-index" : 5 });
		}
		
		animDirection = direction;
		animating = true;
		animate();
		root.currentPage = root.nextPage;
		root.updatePagers();
	}
	Flipper.prototype.showNextPage = function(cb) {
		if (animating) { return; }
		if (bounce) {
			bounce = false;
		} else {
			deg = 0;
		}
		this.nextPage = (this.currentPage < this.numPages-1) ? this.currentPage + 1 : 0;
		// this.showPage(1, deg);
		// done by rameez
		if(this.nextPage != 0)
			this.showPage(1, deg);		
	}
	Flipper.prototype.showPrevPage = function() {
		if (animating) { return; }
		this.nextPage = (this.currentPage > 0) ? this.currentPage - 1 :this.numPages-1;
		// this.showPage(-1, 0);
		// done by rameez
		if(this.currentPage != 0)
			this.showPage(-1, 0);		
	}
	Flipper.prototype.startDragging = function() {
		if (fb) { this.fb_startDragging(); return; }
		var root = this;
		delta = eX - mouseX;
		currentDirection = (delta < 0) ? -1 : 1;
		direction = currentDirection;
		
		reachedHalf = false;
		
		if (bounce && direction == 1) {
			startDeg = deg;
			bounce = false;
		} else {
			startDeg = 0;
			bounceReset();
			bounce = false;
		}
		
		if (direction == 1) {
			this.nextPage = (this.currentPage < this.numPages-1) ? this.currentPage + 1 : 0;
			// Cache elements
			nextPage = root.wrap.find('#flipper-page-' + this.nextPage);
			currentPage = root.wrap.find('#flipper-page-' + this.currentPage);
			
			currentPageSide = currentPage.find('.flipper-page-right');
			currentPageOverlay = currentPageSide.find('.flipper-overlay').show();
			nextPageSide = nextPage.find('.flipper-page-left');
			nextPageOverlay = nextPageSide.find('.flipper-overlay').show();
		} else {
			this.nextPage = (this.currentPage > 0) ? this.currentPage - 1 :this.numPages-1;
			// Cache elements
			nextPage = root.wrap.find('#flipper-page-' + this.nextPage);
			currentPage = root.wrap.find('#flipper-page-' + this.currentPage);
			
			currentPageSide = currentPage.find('.flipper-page-left');
			currentPageOverlay = currentPageSide.find('.flipper-overlay').show();
			nextPageSide = nextPage.find('.flipper-page-right');				
			nextPageOverlay = nextPageSide.find('.flipper-overlay').show();
		}
		
		this.pages.css({ "z-index" : 0 });
		currentPage.css({ "z-index" : 5 });
		nextPage.css({ "z-index" : 3 });
		
		this.wrap.addClass('flipper-dragging');
		deg = 0;
	}
	Flipper.prototype.drag = function() {
		if (fb) { this.fb_drag(); return; }
		delta = eX - mouseX;
		currentDirection = (delta < 0) ? -1 : 1;
		
		if (lastDelta - delta < 0) {
			moveDirection = 1;
		} else {
			moveDirection = -1;
		}
		// done by rameez
		if (this.currentPage == 0 && currentDirection == -1) { return; };
		if (this.nextPage == 0 && currentDirection == 1) { return; };		
		lastDelta = delta;
		
		deg = (delta/O.width * 180 * direction + startDeg < 0) ? 0 : (delta/O.width * 180 * direction + startDeg > 180) ? 180 : delta/O.width * 180 * direction + startDeg;

		cReachedHalf = (deg > 90) ? true : false;
		
		if (cReachedHalf != reachedHalf) {
			if (deg > 90) {
				currentPage.css({ "z-index" : 3 });
				nextPage.css({ "z-index" : 5 });
			} else {
				currentPage.css({ "z-index" : 5 });
				nextPage.css({ "z-index" : 3 });
			}				
			reachedHalf = cReachedHalf;
		}
		
		this.setAngle(currentPageSide, currentPageOverlay, deg * direction * -1);
		this.setAngle(nextPageSide, nextPageOverlay, (180 - deg) * direction);
	}
	Flipper.prototype.finishDragging = function() {
		if (fb) { this.fb_finishDragging(); return; }
		if (moveDirection != direction && deg > 0) {
			this.resetState(direction, deg);
		} else if (deg > 0) {
			this.showPage(direction, deg);
		}
		
		this.wrap.removeClass('flipper-dragging');
	}
	Flipper.prototype.resetState = function(direction, animDeg) {
		var root = this;
		
		deg = animDeg;
		this.pages.css({ "z-index" : 0 });
		if (deg < 90) {
			currentPage.css({ "z-index" : 5 });
			nextPage.css({ "z-index" : 3 });
			reachedHalf = true;
		} else {
			currentPage.css({ "z-index" : 3 });
			nextPage.css({ "z-index" : 5 });
			reachedHalf = false;
		}
		
		
		animating = true;
		animDirection = direction;
		animate_reset();
	}
	Flipper.prototype.resetAngles = function() {
		flipper.setAngle(flipper.wrap.find('.flipper-page-left').add('.flipper-page-right'), flipper.wrap.find('.flipper-overlay'), 0);
	}
	Flipper.prototype.setAngle = function(el, overlay, deg) {
		el.css({ 
			"-moz-transform" : 'perspective(1800px) rotateY(' + deg + 'deg)',
		 	"-webkit-transform" : 'perspective(1800px) rotateY(' + deg + 'deg)',
		 	"-ms-transform" : 'perspective(1800px) rotateY(' + deg + 'deg)', 
			"-o-transform" : 'perspective(1800px) rotateY(' + deg + 'deg)',
			"transform" : 'perspective(1800px) rotateY(' + deg + 'deg)' });
		overlay.css({ "opacity" : Math.abs(deg)/90 });
	}
	Flipper.prototype.updatePagers = function() {
		var root = this;
		root.wrap.find('.flipper-pager').attr('src', '' + O.imagesPath + 'pager.png');
		root.wrap.find('#flipper-pager-' + this.currentPage).attr('src', root.wrap.find('#flipper-pager-' + this.currentPage).attr('src').replace('.png', '-active.png'));
	}
	Flipper.prototype.updateZ = function() {
		$(this.pages).css({ "z-index" : 1 });
		$('#flipper-page-' + this.currentPage).css({ "z-index" : 5 });
	}
	
	// Fallback
	Flipper.prototype.fb_initPages = function() {
		var root = this;
		root.numPages = root.pages.length;

		for (i=0; i<root.numPages; i++) {
			page = $(root.pages[i]);
			html = page.html();
			
			h = '	<div class="flipper-page-left"><div class="flipper-page">' + html + '</div></div>';
			h += '	<div class="flipper-page-right"><div class="flipper-page">' + html + '</div></div>';
			
			page.removeClass('flipper-page').addClass('flipper-page-wrap-fb').addClass('flipper-page-wrap').html(h).attr('id', 'flipper-page-' + i);
			page.find('.flipper-page').css({ "width" : O.width });
		}
		
		root.wraps = $('.flipper-page-wrap-fb');
		
		// Put the first page on top
		$(root.wraps).css({ 'z-index' : 1 });
		$(root.wraps[0]).css({ 'z-index' : 3 });
		
		// Some initial settings
		root.currentPage = 0;
		root.nextPage = 1;
		root.prevPage = root.numPages-1;
	}
	Flipper.prototype.fb_bounce = function() {
		this.wrap.prepend('<div class="flipper-fb-bounce">Flick to change pages</div>');
		$('.flipper-fb-bounce').fadeIn(500);
		
		setTimeout(function() {
			$('.flipper-fb-bounce').fadeOut(500, function() {
				$(this).remove();
			});
		}, 3000);
	}
	Flipper.prototype.fb_showPage = function(direction, width) {
		if (animating) { return; }
		var root = this;
		
		if (direction == 1) {
			currentPage = root.wrap.find('#flipper-page-' + root.currentPage);
			currentPageSide = currentPage.find('.flipper-page-right');

			nextPage = root.wrap.find('#flipper-page-' + root.nextPage);
			nextPageSide = nextPage.find('.flipper-page-left');
		} else {
			currentPage = root.wrap.find('#flipper-page-' + root.currentPage);
			currentPageSide = currentPage.find('.flipper-page-left');

			nextPage = root.wrap.find('#flipper-page-' + root.nextPage);
			nextPageSide = nextPage.find('.flipper-page-right');
		}
		
		
		$(root.pages).css({ "z-index" : 0 });
		currentPage.css({ "z-index" : 5 });
		nextPage.css({ "z-index" : 3 });
		
		temp = nextPageSide.html();
		animating = true;
		
		if (direction == 1) {
			// Going forward
			currentPage.append('<div class="flipper-temp flipper-page-left">' + temp + '</div>');
			temp = $('.flipper-temp');
			
			currentPageSide.css({ "right" : 'auto', "left" : '50%' }).find('.flipper-page').css({ "left" : -O.width/2, "right" : 'auto' });
			temp.css({ "width" : 0, "left" : O.width });
			
			currentPageSidePage = currentPageSide.find('.flipper-page');
		} else {
			// Going back
			currentPage.append('<div class="flipper-temp flipper-page-right">' + temp + '</div>');
			temp = $('.flipper-temp');

			currentPageSidePage = currentPageSide.find('.flipper-page');
		}
		
		animWidth = width;
		animDirection = direction;
		
		fb_animate();
		root.currentPage = root.nextPage;
		root.updatePagers();
	}
	Flipper.prototype.fb_startDragging = function() {
		if (animating) { return; }
		this.wrap.addClass('flipper-dragging');
		var root = this;
		delta = eX - mouseX;
		currentDirection = (delta < 0) ? -1 : 1;
		direction = currentDirection;
		

		// Preparations for dragging from fb_showPage()
		if (direction == 1) {
			this.nextPage = (this.currentPage < this.numPages-1) ? this.currentPage + 1 : 0;
			currentPage = root.wrap.find('#flipper-page-' + root.currentPage);
			currentPageSide = currentPage.find('.flipper-page-right');

			nextPage = root.wrap.find('#flipper-page-' + root.nextPage);
			nextPageSide = nextPage.find('.flipper-page-left');
			temp = nextPageSide.html();
			currentPage.append('<div class="flipper-temp flipper-page-left">' + temp + '</div>');
			temp = $('.flipper-temp');
			
			currentPageSidePage = currentPageSide.find('.flipper-page');
			currentPageSide.css({ "right" : 'auto', "left" : '50%' }).find('.flipper-page').css({ "left" : -O.width/2, "right" : 'auto' });
			temp.css({ "width" : 0, "left" : O.width, "height" : O.height + 2 });
		} else {
			this.nextPage = (this.currentPage > 0) ? this.currentPage - 1 :this.numPages-1;
			currentPage = root.wrap.find('#flipper-page-' + root.currentPage);
			currentPageSide = currentPage.find('.flipper-page-left');

			nextPage = root.wrap.find('#flipper-page-' + root.nextPage);
			nextPageSide = nextPage.find('.flipper-page-right');
			temp = nextPageSide.html();
			currentPage.append('<div class="flipper-temp flipper-page-right">' + temp + '</div>');
			temp = $('.flipper-temp');

			currentPageSidePage = currentPageSide.find('.flipper-page');
			temp.css({ "left" : 0, "width" : 0, "height" : O.height + 2 });
		}
		$(root.pages).css({ "z-index" : 0 });
		currentPage.css({ "z-index" : 5 });
		nextPage.css({ "z-index" : 3 });
	}
	Flipper.prototype.fb_drag = function() {
		delta = eX - mouseX;
		currentDirection = (delta < 0) ? -1 : 1;
		
		if (lastDelta - delta < 0) {
			moveDirection = 1;
		} else {
			moveDirection = -1;
		}
		
		lastDelta = delta;
		delta = Math.abs(delta/2);
		delta = (delta > O.width/2) ? O.width/2 : delta;
		// delta = (delta < 0) ? (-delta > O.width/2) ? O.width/4 : -delta/2 : (delta > O.width/2) ? O.width/4 : delta/2;
		
		if (direction == 1) {
			temp.css({ "width" : delta, "left" : O.width - delta*2 });
			currentPageSide.css({ "width" : O.width/2 - delta });
		} else {
			temp.css({ "width" : delta, "left" : delta });
			currentPageSide.css({ "width" : O.width/2 - delta, "left" : delta });
			currentPageSidePage.css({ "left" : -delta });
		}
	}
	Flipper.prototype.fb_finishDragging = function() {
		if (moveDirection != direction && delta > 0 && delta < O.width/2) {
			this.fb_resetState(direction, delta);
		} else if (delta > 0) {
			this.fb_showPage(direction, delta);
		}
		this.wrap.removeClass('flipper-dragging');
	}
	Flipper.prototype.fb_resetState = function(direction, width) {
		var root = this;
		animating = true;
		
		animDirection = direction;
		animWidth = width;
		fb_animate_reset();
	}
	
	function animate_bounce() {
		if (deg > 0 && bounce) {
			start = false;
			requestAnimFrame(animate_bounce);
			
			increment = (0.9 - Math.sin(deg/40)) * 3;
			
			if (deg >= 40) {
				reachedHalf = true;
			}
			flipper.setAngle(currentPageSide, currentPageSideOverlay, -deg);
			
			if (!reachedHalf) {
				deg = deg + increment;
			} else {
				deg = deg - increment;
			}
		} else {
			if (!mouseDown) bounceReset();
			bounce = false;
		}
	}
	function bounceReset() {
		if (bounceReset) {
			flipper.setAngle(currentPageSide, currentPageSideOverlay, 0);
			currentPageSideOverlay.hide();
		}
	}
	function animate() {
		if (deg < 180) {
			requestAnimFrame(animate);
		    deg += 4;
			flipper.setAngle(currentPageSide, currentPageOverlay, deg * animDirection * -1);
			flipper.setAngle(nextPageSide, nextPageOverlay, (180 - deg) * animDirection);

			if (deg > 90 && !reachedHalf) {
				reachedHalf = true;
				currentPage.css({ "z-index" : 3 });
				nextPage.css({ "z-index" : 5 });
			}
		} else {
			// Reset transforms
			flipper.resetAngles();
			
			// Hide overlays
			currentPageOverlay.hide();
			nextPageOverlay.hide();
			
			animating = false;
			reachedHalf = false;
		}
	}
	function animate_reset() {
		if (deg > 0) {
			requestAnimFrame(animate_reset);
		    deg -= 3;
			flipper.setAngle(currentPageSide, currentPageOverlay, deg * animDirection * -1);
			flipper.setAngle(nextPageSide, nextPageOverlay, (deg - 180) * animDirection * -1);
			
			if (deg <= 90 && !reachedHalf) {
				reachedHalf = true;
				currentPage.css({ "z-index" : 5 });
				nextPage.css({ "z-index" : 3 });
			}
		} else {
			flipper.setAngle(currentPageSide, currentPageOverlay, 0);
			flipper.setAngle(nextPageSide, nextPageOverlay, 0);
			animating = false;
		}
	}
	function fb_animate() {
		if (animWidth <= O.width/2) {
			requestAnimFrame(fb_animate);
			if (animDirection == 1) {
				temp.css({ "width" : animWidth - 2, "left" : O.width - animWidth*2 - 1 });
				currentPageSide.css({ "width" : O.width/2 - animWidth });
			} else {
				temp.css({ "width" : animWidth - 2, "left" : animWidth - 1 });
				currentPageSide.css({ "width" : O.width/2 - animWidth, "left" : animWidth });
				currentPageSidePage.css({ "left" : -animWidth });
			}
			animWidth += 10;
		} else {
			$(flipper.wraps).css({ 'z-index' : 1 });
			currentPage.css({ 'z-index' : 3 });
			nextPage.css({ 'z-index' : 5 });

			temp.remove();
			flipper.currentPage = flipper.nextPage;
			
			if (animDirection == 1) {
				currentPageSide.css({ "width" : O.width / 2 });
			} else {
				currentPageSide.css({ "width" : O.width / 2, "left" : 0 });
			}
			if (animDirection == -1) { currentPageSidePage.css({ "left" : 0 }); }
			animating = false;
		}
	}
	function fb_animate_reset() {
		if (animDirection == 1) {
			if (animWidth > 0) {
				requestAnimFrame(fb_animate_reset);
				temp.css({ "width" : animWidth - 2, "left" : O.width - animWidth*2 - 1 });
				currentPageSide.css({ "width" : O.width/2 - animWidth });
				animWidth -= 10;
			} else {
				currentPageSide.css({ "width" : O.width/2 });
				temp.remove();
				currentPageSide.css({ "width" : O.width });
				animating = false;
			}
		} else {
			if (animWidth > 0) {
				requestAnimFrame(fb_animate_reset);
				temp.css({ "width" : animWidth - 2, "left" : animWidth - 1 });
				currentPageSide.css({ "width" : O.width/2 - animWidth, "left" : animWidth });
				currentPageSidePage.css({ "left" : -animWidth });
				animWidth -= 10;
			} else {			
				temp.remove();
				currentPageSide.css({ "width" : O.width / 2, "left" : 0 });
				currentPageSidePage.css({ "left" : 0 });
				animating = false;
			}
		}
	}
	
	$.fn.flipper = function(options) {
		var D = {
			width : 800,
			height : 400,
			arrows : true,
			pager : true,
			imagesPath : 'images/'
		};
		
		O = $.extend(true, D, options);

		if (O.imagesPath[O.imagesPath.length - 1] != '/') {
			O.imagesPath = O.imagesPath + '/';
		}
		
		return this.each(function() {
			// Check for CSS 3D transforms support.
			
			flipper = new Flipper();
			flipper.init($(this));			
		});
	}
})(jQuery);