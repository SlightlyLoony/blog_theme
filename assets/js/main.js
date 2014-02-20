// our namespace...
var TD1 = {};

// important constants...
TD1.headerTrigger = 1000;   // in pixels, viewport width at which blog description flips from right to under the blog name...
TD1.positionClasses = { '<': 'img_left_td1', '>': 'img_right_td1', '!': 'img_inline_td1' }; // position codes -> position classes...
TD1.sizeClasses = { s: 'img_small_td1', m: 'img_medium_td1', l: 'img_large_td1' };  // size codes -> size classes...


// post information tree...
//   each element of the array is an object (map) containing information about a single post, in the order that they appear on the page
//   the map contains the following fields:
//      dom: '.post_td1' element wrapped in a jQuery object
//      paragraphs: array of content paragraph elements wrapped in jQuery objects, in the order that they appear on the page
//      images: array of image information maps, each of which has the following fields:
//         image: img element wrapped in a jQuery object
//         position: '<' for float left, '>' for float right (default), '!' for inline, or '#' for table
//         thumbSize: 's' for small (default), 'm' for medium, 'l' for large
//         title: actual title with any directives removed
//         paragraph: number of content paragraph that contains it
TD1.postInfo = [];

// height of a truncated post (set by clicking "more")...
TD1.truncatedPostHeight = 0;

// array of thumbs (per post)...
TD1.thumbs = [];

// invoked when document loads; drives all other document loaded behavior...
TD1.loadDispatcher = function() {
};

// invoked when window resizes; drives all other window resize behavior...
TD1.resizeDispatcher = function() {
    TD1.headerDescriptionAdjust();
};

// invoked when DOM is ready; drives all other DOM ready behavior...
TD1.readyDispatcher = function() {
    console.log( 'jQuery version: ' + $.fn.jquery );
    var walker = new TD1.Walker();
    walker.walk( $( '#index_td1') );
    TD1.initPosts();
    TD1.headerDescriptionAdjust();
    TD1.fixPostTitles();
    TD1.fixContent();
    TD1.initializeTruncation();

    // set up event listeners...
    $( '.more_button_td1').click( function( event ) { TD1.moreClick( event ); } );
    $( '.less_button_td1').click( function( event ) { TD1.lessClick( event ); } );
};


// invoked when user clicks on a "more" button...
TD1.moreClick = function( event ) {

    // some basics...
    var truncatedGradient = $( event.target).parent().parent();
    var thisPost = truncatedGradient.parent();
    var innerPost = thisPost.children( '.post_inner_td1');

    // first kill the gradient overlay, which contains the "more" button...
    truncatedGradient.css( 'display', 'none' );

    // animate exposing the whole post...
    TD1.truncatedPostHeight = parseFloat( thisPost.css( 'max-height' ) );
    var targetMaxHeight = innerPost.height();
    var ms = (targetMaxHeight - TD1.truncatedPostHeight) / 0.5;
    var properties = { 'max-height' : targetMaxHeight };
    thisPost.animate( properties, ms, 'swing', displayLessButton );

    // invoked by animator...
    function displayLessButton() {

        // finally, display the "less" button...
        thisPost.children( '.less_td1' ).css( 'display', 'block' );
    }
};


// invoked when user clicks on a "less" button...
TD1.lessClick = function( event ) {

    // some basics...
    var lessButton = $( event.target).parent();
    var thisPost = lessButton.parent();

    // first kill the "less" button...
    lessButton.css( 'display', 'none' );

    // animate closing the post back to truncated state...
    var properties = { 'max-height': TD1.truncatedPostHeight };
    var ms = (thisPost.height() - TD1.truncatedPostHeight) / 0.5;
    thisPost.animate( properties, ms, 'swing', displayMoreButton );

    // invoked by animator...
    function displayMoreButton() {

        // finally, enable the "more" button...
        thisPost.children( '.truncated_post_gradient_div_td1' ).css( 'display', 'block' );
    }
};


// displays gradient and "more" button on truncated posts...
TD1.initializeTruncation = function() {

    // iterate over the posts...
    for (var i = 0; i < TD1.postInfo.length; i++) {
        var thisPost = TD1.postInfo[i].dom;

        // if this post has been truncated...
        var displayedHeight = thisPost.height();
        var actualHeight = thisPost.children( '.post_inner_td1' ).height();
        if (actualHeight > displayedHeight) {

            // display the gradient footer...
            var gradientDiv = thisPost.children( '.truncated_post_gradient_div_td1' );
            gradientDiv.css( 'display', 'block' );
        }
    }
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


// build basic post information...
TD1.initPosts = function() {

    // iterate over the posts on the page...
    var posts = $( '.post_td1' );
    for (var i = 0; i < posts.length; i++) {

        // initialize our post map...
        var map = {};
        map.dom = $( posts[i] );
        map.paragraphs = [];
        map.images = [];

        // add the paragraph information to the map...
        var contentParas = $( map.dom).children( '.post_inner_td1' ).children( '.post_content_td1' ).children( 'p' );
        for (var p = 0; p < contentParas.length; p++)
            map.paragraphs[p] = $( contentParas[p] );

        TD1.postInfo[i] = map;
    }
};

// fixes post titles, which are emitted before content paragraphs, but need to be inserted into the beginning of the first content paragraph...
TD1.fixPostTitles = function() {

    // iterate over the unfixed posts...
    for (var i = 0; i < TD1.postInfo.length; i++) {

        // get the post title span element...
        var titleSpan = TD1.postInfo[i].dom.children( '.post_inner_td1' ).children( '.post_title_td1' ).filter( ':first' );

        // fetch the HTML for the title, all nicely marked up...
        var fixedTitleHTML = titleSpan[0].innerHTML;

        // find the first paragraph within associated content...
        var contentSpan = $( titleSpan ).next( '.post_content_td1' );
        if (contentSpan.length > 0) {
            var contentParas = $( contentSpan ).children( 'p' );
            if (contentParas.length > 0) {

                // prepend our title to the content...
                var origPara = contentParas[0].innerHTML;
                contentParas[0].innerHTML = fixedTitleHTML + '&nbsp;&nbsp;' + origPara;
            }
        }
    }
};

// fixes images, objects, etc. within the content...
TD1.fixContent = function() {

    // iterate over the posts on the page...
    for (var i = 0; i < TD1.postInfo.length; i++) {

        TD1.fixImages( i );
        //TD1.fixIFrames( i );
    }
};


// fix iframes (generally videos) within the given post...
TD1.fixIFrames = function( post ) {

    // grab our map of post information...
    var postMap = TD1.postInfo[post];

    // iterate over all our iframes in the post...
    var iframes = postMap.dom.find( 'iframe' );
    for (var i = 0; i < iframes.length; i++) {
        var thisIframe = iframes[i];

        // get the source settings...
        var width = thisIframe.width - 0;
        var height = thisIframe.height - 0;
        var params = thisIframe.getAttribute( 'td1' );
        params = params ? params : '';  // ensure a string...

        // parse any size and placement information included...
        var sizeSpec = 's';
        var positionSpec = '>';
        for (var p = 0; p < params.length; p++) {
            var c = params.charAt( p );
            if ('sml'.indexOf( c ) >= 0) sizeSpec = c;
            if ('<!>'.indexOf( c ) >= 0) positionSpec = c;
        }

        // figure out our new dimensions...
        var heightToWidth = height / width;
        var newWidth = TD1.iframeSize[sizeSpec];
        var newHeight = newWidth * heightToWidth;

        // set our new dimensions...
        thisIframe.width = newWidth;
        thisIframe.height = newHeight;

        // now set the position according to the spec...
        var posClass;
        switch (positionSpec) {
            case '<': posClass = 'img_left_td1'; break;
            case '>': posClass = 'img_right_td1'; break;
            case '!': posClass = 'img_inline_td1'; break;
        }
        thisIframe.className = posClass;
    }
};


// fixes images within the given post...
TD1.fixImages = function( post ) {

    // grab our map of post information...
    var postMap = TD1.postInfo[post];

    // make a place to collect a table of image numbers, in case we're going to use table positioning...
    var tabled = [];

    // iterate over the child paragraphs...
    for (var p = 0; p < postMap.paragraphs.length; p++) {

        // iterate over the images within a paragraph...
        var paraImages = postMap.paragraphs[p].children( 'img' );
        for (var i = 0; i < paraImages.length; i++) {

            // collect information on the image...
            var map = {};
            map.image = $( paraImages[i] );
            TD1.parseTitle( map );
            map.paragraph = p;
            postMap.images.push( map );

            // remove the image from the DOM if it's not going into the paragraph (positioning #), and save it for tabling...
            if (map.position == '#') {
                map.image.detach();
                tabled.push( postMap.images.length - 1 );
                continue;
            }

            // if we are floating left or right, and there's any text between the img and its container, move it left of the text...
            if ((map.position == '<') || (map.position == '>')) {

                // walk back through our siblings to find the furthest text node...
                var textNode = null;
                var prevNode = null;
                var textNodeType = 3;
                var thisNode = map.image[0].previousSibling;
                while (thisNode) {
                    if (thisNode.nodeType == textNodeType) {
                        textNode = thisNode;
                        prevNode = null;
                    } else if (!prevNode)
                        prevNode = thisNode;
                    thisNode = thisNode.previousSibling;
                }

                // if we found a text node, then we need to move our image back...
                if (textNode) {
                    map.image.detach();
                    if (prevNode)
                        $( prevNode ).after( map.image );
                    else
                        $( map.image[0].parentNode ).prepend( map.image );
                }
            }

            // assign the right classes to our image...
            var classes;
            switch (map.thumbSize) {
                case 's': classes = 'img_framed_td1 img_small_td1'; break;
                case 'm': classes = 'img_framed_td1 img_medium_td1'; break;
                case 'l': classes = 'img_framed_td1 img_large_td1'; break;
            }
            switch (map.position) {
                case '>': classes += ' img_right_td1'; break;
                case '<': classes += ' img_left_td1'; break;
                case '!': classes += ' img_inline_td1'; break;
            }
            map.image[0].className = classes;

            // if we're inserting a float image, mark the parent paragraph as a float container...
            if ((map.position == '>') || (map.position == '<')) {
                var parentPara = $( map.image[0]).parent()[0];
                var floatClass = (map.position == '>') ? 'float_right_cont_td1' : 'float_left_cont_td1';
                parentPara.className = TD1.ensureClass( parentPara.className, floatClass );
            }
        }
    }

    // if we have any tabled images, emit them...
//    if (tabled.length > 0) {
//
//        // iterate over the tabled items find the biggest size specification...
//        var targetSize = 's';
//        for (var j = 0; j < tabled.length; j++) {
//            var thisSize = postMap.images[tabled[j]].thumbSize;
//            if ((targetSize == 's') && (thisSize != 's'))
//                targetSize = thisSize;
//            else if ((targetSize == 'm') && (thisSize == 'l'))
//                targetSize = 'l';
//        }
//
//        // build our thumbnail table into the DOM, appending it to the existing content...
//        var contentSpan = $( postMap.dom).children().children( '.post_content_td1' ).filter( ':first' );
//        var images = [];
//        for (var t = 0; t < tabled.length; t++)
//            images.push( postMap.images[tabled[t]].image );
//        TD1.buildThumbDiv( images, contentSpan, targetSize );
//    }
};


// parses the given title, updates the given image information map, and returns the parsed title...
// the title may contain the following directives to control the image's rendering, as the first characters of the title, terminated by '|':
// the available directives are:
//    > - position the thumbnail as a floating right element (the default position)
//    < - position the thumbnail as a floating left element
//    ! - position the thumbnail as an inline element
//    # - include this thumbnail in a table of thumbnails inserted at the end of the post
//    s - make the thumbnail a small size (the default size)
//    m - make the thumbnail a medium size
//    l - make the thumbnail a large size
// if multiple directives of a single type (position, size, etc.) are found, then the last one is used.
// invalid directives are ignored.
TD1.parseTitle = function( imageMap ) {

    // get the raw title, as entered in markdown...
    var rawTitle = imageMap.image[0].title;

    // set the default values...
    imageMap.position = '>';
    imageMap.thumbSize = 's';
    imageMap.title = rawTitle;

    // if we don't have a directive terminator, just get out of dodge...
    var term = rawTitle.indexOf( '|' );
    if (term < 0)
        return;

    // parse all the directive characters, setting map values appropriately...
    for (var i = 0; i < term; i++) {
        var c = rawTitle.charAt(i);
        switch (c) {

            case '>':
            case '<':
            case '!':
            case '#':
                imageMap.position = c;
                break;

            case 's':
            case 'm':
            case 'l':
                imageMap.thumbSize = c;
                break;
        }
    }

    // delete the directives from the title...
    imageMap.title = rawTitle.substr( term + 1 );
};

// returns a string that contains the first string plus the second string if it wasn't already there, space separated.  Useful for ensuring
// that a particular class is in a class parameter.
TD1.ensureClass = function( currentClass, newClass ) {

    if (!currentClass)
        return newClass;

    var classes = currentClass.split( ' ' );
    if (!TD1.contains( classes, newClass ))
        classes.push( newClass );

    return classes.join( ' ' );
};

// adds the given class to the given target element's class attribute, if it wasn't already there...
TD1.addClass = function( element, klass ) {
    var e = $( element );
    var classes = e[0].className.split( ' ' );
    if (TD1.contains( classes, klass ))
        return;

    // the class isn't there, so add it...
    classes.push( klass );
    e[0].className = classes.join( ' ').trim();
};

// removes the given class from the given target element's class attribute, if it wasn't already there...
TD1.removeClass = function( element, klass ) {
    var e = $( element );
    var classes = e[0].className.split( ' ' );
    if (!TD1.contains( classes, klass ))
        return;

    // the class is there, so remove it...
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] == klass) {
            classes.splice( i, 1 );
            break;
        }
    }
    e[0].className = classes.join( ' ' );
};

// returns true if the given array has an element matching the given value...
TD1.contains = function( arr, val ) {
    for (var i = 0; i < arr.length; i++)
        if (val == arr[i])
            return true;
    return false;
};



// DOM walker and object handler...
TD1.Walker = function() {
    this.handlers = {};
    this.addHandler( TD1.getIframeHandler() );
    this.addHandler( TD1.getDivHandler() );
};


TD1.Walker.prototype.addHandler = function( handler ) {
    this.handlers[ handler.tag ] = handler;
};


// walk the DOM tree below the given element, looking for tags to handle...
TD1.Walker.prototype.walk = function( element ) {
    var e = $( element );

    // if we need to handle this tag, do so...
    var tag = e[0].tagName.toLowerCase();
    var handler = this.handlers[tag];
    if (handler)
        handler.handle( e[0] );

    // walk the kids...
    var kids = e.children();
    for (var i = 0; i < kids.length; i++)
        this.walk( kids[i] );
};


// returns an iframe handler instance...
TD1.getIframeHandler = function() {
    var handler = {};
    handler.tag = 'iframe';
    handler.handle = function( element ) {

        var thisIframe = $( element )[0];
        var meta = TD1.parseMeta( thisIframe.getAttribute( 'td1' ) );

        TD1.ensureParagraph( thisIframe );
        TD1.setPosition( element, meta );
        TD1.setSize( element, meta );
    };
    return handler;
};


// returns a div handler instance...
TD1.getDivHandler = function() {
    var handler = {};
    handler.tag = 'div';
    handler.handle = function( element ) {

        var thisDiv = $( element )[0];

        // if we're starting a new post, clear the thumbs array...
        if (thisDiv.className == 'post_inner_td1' ) {
            TD1.thumbs.length = 0;
            return;
        }

        // if we're ending a post, remove the ender div (it's only there to trigger this) and place any thumbs...
        if (thisDiv.className == 'post_ender_td1' ) {
            TD1.buildThumbTable( thisDiv );
            $( thisDiv ).remove();
        }

    };
    return handler;
};


// inserts a div with a floating table of the given array of images as a sibling preceding the given target element...
TD1.buildThumbTable = function( target ) {

    // iterate over the tabled items find the biggest size specification...
    var targetSize = 's';
    for (var i = 0; i < TD1.thumbs.length; i++) {
        var thisSize = TD1.thumbs[i].meta.size;
        if ((targetSize == 's') && (thisSize != 's'))
            targetSize = thisSize;
        else if ((targetSize == 'm') && (thisSize == 'l'))
            targetSize = 'l';
    }

    // add a div for our table...
    $( target).before( '<div class="thumb_div"></div>' );

    // iterate over our content to be put in a thumb table, appending them...
    for (var j = 0; j < TD1.thumbs.length; j++) {

        // assign the right classes...
        if (TD1.thumbs[j].item[0].tagName.toLowerCase() == 'iframe')
            TD1.addClass( TD1.thumbs[j].item, 'iframe_table_td1' );
        else
            TD1.addClass( TD1.thumbs[j].item, 'img_table_td1' );
        TD1.setSize( TD1.thumbs[j].item, TD1.thumbs[j].meta );

        // insert our new thumb...
        $( target ).prev().append( TD1.thumbs[j].item );
    }
};


// if the given element is not a child of a paragraph, wraps it in a paragraph; otherwise, does nothing...
TD1.ensureParagraph = function( element ) {

    // if our parent is a paragraph already, just leave...
    if (element.parentNode.tagName.toLowerCase() == 'p')
        return;

    // wrap our element in a bare naked paragraph...
    $( element).wrap( '<p></p>' );
};


// sizes the given element according to the given metadata size code (sml)...
TD1.setSize = function( element, meta ) {

    // remove any height and width attributes, as they'll mess us up...
    $( element )[0].removeAttribute( 'height' );
    $( element )[0].removeAttribute( 'width' );

    // assign the right class...
    TD1.addClass( element, TD1.sizeClasses[meta.size] );
};


// positions the given element according to the given metadata position code (<!>#).  If the position is thumb table ("#"), then the element is
// removed from the flow and added to the thumbs array...
TD1.setPosition = function( element, meta ) {

    // if the position is thumb table, handle that and leave...
    if (meta.position == '#')
        TD1.thumbs.push( { item: $(element).detach(), meta: meta } );

    // otherwise, add the right positioning class...
    else
        TD1.addClass( element, TD1.positionClasses[meta.position] );
};


// parse any metadata (size, position, etc.) from the given string, and return them in a metadata object...
TD1.parseMeta = function( s ) {

    // create a result object with defaults...
    var result = { size: 's', position: '>' };

    // parse all the directive characters, setting map values appropriately...
    for (var i = 0; s && (i < s.length); i++) {
        var c = s.charAt(i);
        switch (c) {

            case '>':  // position right...
            case '<':  // position left...
            case '!':  // position inline...
            case '#':  // position in trailing table...
                result.position = c;
                break;

            case 's':  // size small...
            case 'm':  // size medium...
            case 'l':  // size large...
                result.size = c;
                break;
        }
    }

    return result;
};


/*
YouTube (iframe) examples:

 The method optionally accepts a selector expression of the same type that we can pass to the $() function. If the selector is supplied, the elements will be filtered by testing whether they match it.Here's a YouTube video: <iframe width="200" height="113" src="//www.youtube.com/embed/GH68bSJXGE8?rel=0" frameborder="0" allowfullscreen></iframe>

 <iframe width="200" height="113" src="//www.youtube.com/embed/GH68bSJXGE8?rel=0" frameborder="0" allowfullscreen></iframe>


 */