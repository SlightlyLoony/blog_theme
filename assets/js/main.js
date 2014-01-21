$(function($) {
	
	// FitVids for Responsive Embed Videos
	$('#main_willsong').fitVids();

	// Function for article animation
	var articleAppear = function (who) {
		$(who).animate({'margin-top' : 0+'px', 'opacity' : 1.0}, 500);	
	}

	var articleSetappear = function (who) {
		$(who).css({'margin-top' : 0+'px', 'opacity' : 1.0});	
	}

	// Extension to determine current DOM in viewport
	$.fn.atScreen = function(){
     
	    var win = $(window);
	     
	    var viewport = {
	        top : win.scrollTop(),
	        left : win.scrollLeft()
	    };
	    viewport.right = viewport.left + win.width();
	    viewport.bottom = viewport.top + win.height();
	     
	    var bounds = this.offset();
	    bounds.right = bounds.left + this.outerWidth();
	    bounds.bottom = bounds.top + this.outerHeight();
	     
	    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	     
	};

	$('.article_willsong').each(function(){
		if ($(this).atScreen()) {
			$('.appear-class').addClass('already-appeared').removeClass('appear-class');
			articleSetappear($('.already-appeared').children('.mainright_willsong'));
			articleAppear($(this).children('.mainright_willsong'));
		}
		else {
			$(this).addClass('appear-class');
		}
	});

	$('body').on('touchstart',function(){
		$('.appear-class').addClass('already-appeared').removeClass('appear-class');
		articleSetappear($('.already-appeared').children('.mainright_willsong'));
	});

	$('.appear-class').appear();

	$('body').on('appear', '.appear-class', function() {
		var who = $(this).children('.mainright_willsong');
		articleAppear(who);
	});
	
});