// our namespace...
var TD1 = {};

// important constants...
TD1.headerTrigger = 1000;   // in pixels, viewport width at which blog description flips from right to under the blog name...

// invoked when document loads; drives all other document loaded behavior...
TD1.loadDispatcher = function() {
    //TD1.headerDescriptionAdjust();
};

// invoked when window resizes; drives all other window resize behavior...
TD1.resizeDispatcher = function() {
    TD1.headerDescriptionAdjust();
};

// invoked when DOM is ready; drives all other DOM ready behavior...
TD1.readyDispatcher = function() {
    console.log( 'jQuery version: ' + $.fn.jquery );
    TD1.headerDescriptionAdjust();
    TD1.fixPostTitles();
};

// if on a narrow device (< 1280 pixels), show description under name; otherwise, description to the right of name...
TD1.headerDescriptionAdjust = function() {

        // figure out which style we should be using...
        var viewWidth = $( window ).width();
        if (viewWidth >= TD1.headerTrigger) {
            $('#blog_description_wide_td1').css( 'display', 'table-cell' );
            $('#blog_description_narrow_td1').css( 'display', 'none' );
        } else {
            $('#blog_description_narrow_td1').css( 'display', 'table-cell' );
            $('#blog_description_wide_td1').css( 'display', 'none' );
        }
};

// fixes post titles, which are emitted before content paragraphs, but need to be inserted into the beginning of the first content paragraph...
TD1.fixPostTitles = function() {
    // <span class="post_fixed_title_td1" itemprop="headline"><a href="{{{url}}}" rel="bookmark">{{title}}</a></span>

    // iterate over the unfixed post title spans...
    var titleSpans = $( '.post_title_td1' );
    for (var i = 0; i < titleSpans.length; i++) {

        // fetch the HTML for the title, all nicely marked up...
        var fixedTitleHTML = titleSpans[i].innerHTML;

        // find the first paragraph within associated content...
        var contentSpan = $( titleSpans[i] ).next( '.post_content_td1' );
        if (contentSpan.length > 0) {
            var contentParas = $( contentSpan ).children( 'p' );
            if (contentParas.length > 0) {

                // prepend our title to the content...
                var origPara = contentParas[0].innerHTML;
                contentParas[0].innerHTML = fixedTitleHTML + '&nbsp;&nbsp;' + origPara;
            }
        }
    }
}
