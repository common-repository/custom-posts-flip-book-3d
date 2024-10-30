jQuery(document).ready(function($) {
	$('#select-posts').select2();
	$('.colorpicker').wpColorPicker();
	
	$('#select-post-type').change(function(event) {
		event.preventDefault();
		$('.posts-loader').show();
		$('.select2-container').hide();
		var data = {
			action: 'wcp_get_posts',
			post_type: $(this).val(),
		}
		$.post(ajaxurl, data, function(resp) {
			// console.log(resp);
			$('#select-posts').html(resp);
			$('.posts-loader').hide();
			$('.select2-container').show();
		});
	});
    $('.wcp-taxonomy').change(function(event) {
        event.preventDefault();
        var element = jQuery(this);
        // element.closest('table').find('.append-terms').html('<img src="'+wcpAjax.path+'images/ajax-loader.gif">');
        jQuery.post(ajaxurl, {action: 'wcp_get_terms' , taxonomy: element.val()}, function(resp) {
          element.closest('table').find('.append-terms').html(resp);
        });
    });

    if ($('.select-list-by').val() == 'taxonomy') {
    	$('.if-by-tax').show();
    	$('.if-by-post').hide();
    } else {
    	$('.if-by-tax').hide();
    	$('.if-by-post').show();
    }

    $('.select-list-by').change(function(event) {
    	if ($(this).val() == 'taxonomy') {
	    	$('.if-by-tax').show();
	    	$('.if-by-post').hide();
    	} else {
	    	$('.if-by-tax').hide();
	    	$('.if-by-post').show();
    	}
    });
    
});