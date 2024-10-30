(function ($, undefined) {
	$(document).ready(function() {
		// $('.wcpflipbook').each(function(index, el) {
		// 	var mode = $(this).data('mode');
		// 	var book_width = $(this).data('width');
		// });

		jQuery('.book-loading').hide();
		var mode = $('.wcpflipbook').data('mode');
		var book_width = $('.wcpflipbook').data('width');
		$('.wcpflipbook').flipper({
			'arrows' : true,
			'pager' : true,
			'imagesPath' : wcpbook.path,
			'width' : parseInt(book_width),
		});

		if(mode == 'dual'){
			$('.flipper-page-wrap').each(function(index, el) {
				var css_class = $(this).data('styles');
				$(this).find('.flipper-page').addClass(css_class);
			});
		}

	});

	jQuery(window).resize(function(event) {
		jQuery('.book-loading').show();
		var bk_width = jQuery('.book-loading').innerWidth();
		jQuery('.wcpflipbook').css('width', bk_width);
		jQuery('.book-loading').hide();
	});
	

	jQuery(window).load(function(event) {
		jQuery(window).trigger('resize');
	});

}(jQuery));