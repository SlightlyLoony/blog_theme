// our namespace...
var TD1 = {};

// invoked when document loads; drives all other document loaded behavior...
TD1.loadDispatcher = function() {
    console.log( $.fn.jquery );

    TD1.headerDescriptionAdjust();
};

// invoked when DOM is ready; drives all other DOM ready behavior...
TD1.readyDispatcher = function() {
};

// if header description is in inline-block mode, adjusts its width to fit alongside blog name...
TD1.headerDescriptionAdjust = function() {
        var descrDiv = $( '#blog_description_td1' );

        // if our top is auto (meaning we're showing the description under the name), just get out of Dodge...
        if (descrDiv.css( 'top' ) == 'auto')
            return;

        // figure out what our width should be...
        var viewWidth = $( window ).width();
        var descrWidth = viewWidth - $( '#blog_name_td1' ).outerWidth( true );

        // adjust the description width as needed...
        descrDiv.width( descrWidth );
};
