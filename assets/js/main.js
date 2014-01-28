// our namespace...
var TD1 = {};

// important constants...
TD1.headerTrigger = 1000;   // in pixels, viewport width at which blog description flips from right to under the blog name...
TD1.sizeToColumns = {s: 4, m: 3, l: 2};  // number of columns in thumbnail table for the possible thumbnail sizes...

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
    TD1.initPosts();
    TD1.headerDescriptionAdjust();
    TD1.fixPostTitles();
    TD1.fixContent();
    TD1.initializeTruncation();
    $( '.more_button_td1').click( function( event ) { TD1.moreClick( event ); } );
    $( '.less_button_td1').click( function( event ) { TD1.lessClick( event ); } );
};


// invoked when user clicks on a "more" button...
TD1.moreClick = function( event ) {

    // first kill the gradient overlay, which contains the "more" button...
    $( event.target).parent().parent().css( 'display', 'none' );

    // then stop truncating the post content...
    TD1.addClass( $( event.target ).parent().parent().parent(), 'post_full_length_td1' );

    // finally, display the "less" button...
    $( event.target).parent().parent().parent().children( '.less_td1').css( 'display', 'block' );
};


// invoked when user clicks on a "less" button...
TD1.lessClick = function( event ) {

    // first kill the "less" button...
    $( event.target).parent().css( 'display', 'none' );

    // then set the max-height back to where it was...
    TD1.removeClass( $( event.target ).parent().parent(), 'post_full_length_td1' );

    // finally, enable the "more" button...
    $( event.target ).parent().parent().children( '.truncated_post_gradient_div_td1').css( 'display', 'block' );
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

        TD1.fixImage( i );
    }
};

// fixes images within the given post...
TD1.fixImage = function( post ) {

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
    if (tabled.length > 0) {

        // iterate over the tabled items find the biggest size specification...
        var targetSize = 's';
        for (var i = 0; i < tabled.length; i++) {
            var thisSize = postMap.images[tabled[i]].thumbSize;
            if ((targetSize == 's') && (thisSize != 's'))
                targetSize = thisSize;
            else if ((targetSize == 'm') && (thisSize == 'l'))
                targetSize = 'l';
        }

        // figure the number of columns to use...
        var cols = TD1.sizeToColumns[targetSize];

        // build our thumbnail table into the DOM, appending it to the existing content...
        var contentSpan = $( postMap.dom).children().children( '.post_content_td1' ).filter( ':first' );
        var images = [];
        for (var t = 0; t < tabled.length; t++)
            images.push( postMap.images[tabled[t]].image );
        TD1.buildThumbDiv( images, contentSpan, targetSize, cols );
    }
};

// inserts a div with the given number of columns of the given array of images of the given target size,
// as the last child element of the given target element...
TD1.buildThumbDiv = function( images, target, targetSize, cols ) {
    target.append( '<div class="thumb_div"></div>')
    var thumbDiv = target.children().filter( ':last' );

    // iterate over our tabled images, appending them...
    for (var i = 0; i < images.length; i++) {

        // assign the right classes...
        var classes = 'img_table_td1 ';
        var colImage = images[i];
        switch (targetSize) {
            case 's': classes += 'img_small_td1'; break;
            case 'm': classes += 'img_medium_td1'; break;
            case 'l': classes += 'img_large_td1'; break;
        }
        colImage[0].className = classes;
        thumbDiv.append( colImage );
    }
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
    e[0].className = classes.join( ' ' );
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


/*
YouTube (iframe) examples:

 The method optionally accepts a selector expression of the same type that we can pass to the $() function. If the selector is supplied, the elements will be filtered by testing whether they match it.Here's a YouTube video: <iframe width="200" height="113" src="//www.youtube.com/embed/GH68bSJXGE8?rel=0" frameborder="0" allowfullscreen></iframe>

 <iframe width="200" height="113" src="//www.youtube.com/embed/GH68bSJXGE8?rel=0" frameborder="0" allowfullscreen></iframe>


 */