/*	TABLE OF CONTENTS ---- */

/*	Here's the list of modules used to compile this library.
	To keep it current module updates should be made 4 times a year from the jQuery mobile GitHub repository.
		
	URL: 			https://github.com/jquery/jquery-mobile/
	LAST UPDATE: 	29 June, 2012

	1. Define
	2. UI Widget
	3. Widget
	4. Core
	5. Media
	6. Support
	7. VMouse
	8. Events
		8.1 Orienation Change
		8.2 Throttled Resize
		8.3 Touch

*/




/* 	1. DEFINE ---- (jquery/jquery-mobile/js/jquery.mobile.define.js)
================================================================================================== */

// creates the define method on window, only used where async loading
// is not desired in the docs and experiments
window.define = function(){
Array.prototype.slice.call( arguments ).pop()( window.jQuery );
};




/* 	2. UI WIDGET ---- (jquery/jquery-mobile/js/jquery.ui.widget.js)
================================================================================================== */

/*!
* jQuery UI Widget @VERSION
*
* Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Widget
*/
(function( $, undefined ) {

var slice = Array.prototype.slice;

var _cleanData = $.cleanData;
$.cleanData = function( elems ) {
for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
try {
$( elem ).triggerHandler( "remove" );
// http://bugs.jquery.com/ticket/8235
} catch( e ) {}
}
_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
var fullName, existingConstructor, constructor, basePrototype,
namespace = name.split( "." )[ 0 ];

name = name.split( "." )[ 1 ];
fullName = namespace + "-" + name;

if ( !prototype ) {
prototype = base;
base = $.Widget;
}

// create selector for plugin
$.expr[ ":" ][ fullName ] = function( elem ) {
return !!$.data( elem, fullName );
};

$[ namespace ] = $[ namespace ] || {};
existingConstructor = $[ namespace ][ name ];
constructor = $[ namespace ][ name ] = function( options, element ) {
// allow instantiation without "new" keyword
if ( !this._createWidget ) {
return new constructor( options, element );
}

// allow instantiation without initializing for simple inheritance
// must use "new" keyword (the code above always passes args)
if ( arguments.length ) {
this._createWidget( options, element );
}
};
// extend with the existing constructor to carry over any static properties
$.extend( constructor, existingConstructor, {
version: prototype.version,
// copy the object used to create the prototype in case we need to
// redefine the widget later
_proto: $.extend( {}, prototype ),
// track widgets that inherit from this widget in case this widget is
// redefined after a widget inherits from it
_childConstructors: []
});

basePrototype = new base();
// we need to make the options hash a property directly on the new instance
// otherwise we'll modify the options hash on the prototype that we're
// inheriting from
basePrototype.options = $.widget.extend( {}, basePrototype.options );
$.each( prototype, function( prop, value ) {
if ( $.isFunction( value ) ) {
prototype[ prop ] = (function() {
var _super = function() {
return base.prototype[ prop ].apply( this, arguments );
};
var _superApply = function( args ) {
return base.prototype[ prop ].apply( this, args );
};
return function() {
var __super = this._super,
__superApply = this._superApply,
returnValue;

this._super = _super;
this._superApply = _superApply;

returnValue = value.apply( this, arguments );

this._super = __super;
this._superApply = __superApply;

return returnValue;
};
})();
}
});
constructor.prototype = $.widget.extend( basePrototype, {
// TODO: remove support for widgetEventPrefix
// always use the name + a colon as the prefix, e.g., draggable:start
// don't prefix for widgets that aren't DOM-based
widgetEventPrefix: name
}, prototype, {
constructor: constructor,
namespace: namespace,
widgetName: name,
// TODO remove widgetBaseClass, see #8155
widgetBaseClass: fullName,
widgetFullName: fullName
});

// If this widget is being redefined then we need to find all widgets that
// are inheriting from it and redefine all of them so that they inherit from
// the new version of this widget. We're essentially trying to replace one
// level in the prototype chain.
if ( existingConstructor ) {
$.each( existingConstructor._childConstructors, function( i, child ) {
var childPrototype = child.prototype;

// redefine the child widget using the same prototype that was
// originally used, but inherit from the new version of the base
$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
});
// remove the list of existing child constructors from the old constructor
// so the old child constructors can be garbage collected
delete existingConstructor._childConstructors;
} else {
base._childConstructors.push( constructor );
}

$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
var input = slice.call( arguments, 1 ),
inputIndex = 0,
inputLength = input.length,
key,
value;
for ( ; inputIndex < inputLength; inputIndex++ ) {
for ( key in input[ inputIndex ] ) {
value = input[ inputIndex ][ key ];
if (input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
target[ key ] = $.isPlainObject( value ) ? $.widget.extend( {}, target[ key ], value ) : value;
}
}
}
return target;
};

$.widget.bridge = function( name, object ) {
var fullName = object.prototype.widgetFullName;
$.fn[ name ] = function( options ) {
var isMethodCall = typeof options === "string",
args = slice.call( arguments, 1 ),
returnValue = this;

// allow multiple hashes to be passed on init
options = !isMethodCall && args.length ?
$.widget.extend.apply( null, [ options ].concat(args) ) :
options;

if ( isMethodCall ) {
this.each(function() {
var instance = $.data( this, fullName );
if ( !instance ) {
return $.error( "cannot call methods on " + name + " prior to initialization; " +
"attempted to call method '" + options + "'" );
}
if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
return $.error( "no such method '" + options + "' for " + name + " widget instance" );
}
var methodValue = instance[ options ].apply( instance, args );
if ( methodValue !== instance && methodValue !== undefined ) {
returnValue = methodValue && methodValue.jquery ?
returnValue.pushStack( methodValue.get() ) :
methodValue;
return false;
}
});
} else {
this.each(function() {
var instance = $.data( this, fullName );
if ( instance ) {
instance.option( options || {} )._init();
} else {
new object( options, this );
}
});
}

return returnValue;
};
};

$.Widget = function( options, element ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
widgetName: "widget",
widgetEventPrefix: "",
defaultElement: "<div>",
options: {
disabled: false,

// callbacks
create: null
},
_createWidget: function( options, element ) {
element = $( element || this.defaultElement || this )[ 0 ];
this.element = $( element );
this.options = $.widget.extend( {},
this.options,
this._getCreateOptions(),
options );

this.bindings = $();
this.hoverable = $();
this.focusable = $();

if ( element !== this ) {
// 1.9 BC for #7810
// TODO remove dual storage
$.data( element, this.widgetName, this );
$.data( element, this.widgetFullName, this );
this._bind({ remove: "destroy" });
this.document = $( element.style ?
// element within the document
element.ownerDocument :
// element is window or document
element.document || element );
this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
}

this._create();
this._trigger( "create", null, this._getCreateEventData() );
this._init();
},
_getCreateOptions: $.noop,
_getCreateEventData: $.noop,
_create: $.noop,
_init: $.noop,

destroy: function() {
this._destroy();
// we can probably remove the unbind calls in 2.0
// all event bindings should go through this._bind()
this.element
.unbind( "." + this.widgetName )
// 1.9 BC for #7810
// TODO remove dual storage
.removeData( this.widgetName )
.removeData( this.widgetFullName );
this.widget()
.unbind( "." + this.widgetName )
.removeAttr( "aria-disabled" )
.removeClass(
this.widgetFullName + "-disabled " +
"ui-state-disabled" );

// clean up events and states
this.bindings.unbind( "." + this.widgetName );
this.hoverable.removeClass( "ui-state-hover" );
this.focusable.removeClass( "ui-state-focus" );
},
_destroy: $.noop,

widget: function() {
return this.element;
},

option: function( key, value ) {
var options = key,
parts,
curOption,
i;

if ( arguments.length === 0 ) {
// don't return a reference to the internal hash
return $.widget.extend( {}, this.options );
}

if ( typeof key === "string" ) {
// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
options = {};
parts = key.split( "." );
key = parts.shift();
if ( parts.length ) {
curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
for ( i = 0; i < parts.length - 1; i++ ) {
curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
curOption = curOption[ parts[ i ] ];
}
key = parts.pop();
if ( value === undefined ) {
return curOption[ key ] === undefined ? null : curOption[ key ];
}
curOption[ key ] = value;
} else {
if ( value === undefined ) {
return this.options[ key ] === undefined ? null : this.options[ key ];
}
options[ key ] = value;
}
}

this._setOptions( options );

return this;
},
_setOptions: function( options ) {
var key;

for ( key in options ) {
this._setOption( key, options[ key ] );
}

return this;
},
_setOption: function( key, value ) {
this.options[ key ] = value;

if ( key === "disabled" ) {
this.widget()
.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
.attr( "aria-disabled", value );
this.hoverable.removeClass( "ui-state-hover" );
this.focusable.removeClass( "ui-state-focus" );
}

return this;
},

enable: function() {
return this._setOption( "disabled", false );
},
disable: function() {
return this._setOption( "disabled", true );
},

_bind: function( element, handlers ) {
// no element argument, shuffle and use this.element
if ( !handlers ) {
handlers = element;
element = this.element;
} else {
// accept selectors, DOM elements
element = $( element );
this.bindings = this.bindings.add( element );
}

var instance = this;
$.each( handlers, function( event, handler ) {
function handlerProxy() {
// allow widgets to customize the disabled handling
// - disabled as an array instead of boolean
// - disabled class as method for disabling individual parts
if ( instance.options.disabled === true ||
$( this ).hasClass( "ui-state-disabled" ) ) {
return;
}
return ( typeof handler === "string" ? instance[ handler ] : handler )
.apply( instance, arguments );
}

// copy the guid so direct unbinding works
if ( typeof handler !== "string" ) {
handlerProxy.guid = handler.guid =
handler.guid || handlerProxy.guid || jQuery.guid++;
}

var match = event.match( /^(\w+)\s*(.*)$/ ),
eventName = match[1] + "." + instance.widgetName,
selector = match[2];
if ( selector ) {
instance.widget().delegate( selector, eventName, handlerProxy );
} else {
element.bind( eventName, handlerProxy );
}
});
},

_delay: function( handler, delay ) {
function handlerProxy() {
return ( typeof handler === "string" ? instance[ handler ] : handler )
.apply( instance, arguments );
}
var instance = this;
return setTimeout( handlerProxy, delay || 0 );
},

_hoverable: function( element ) {
this.hoverable = this.hoverable.add( element );
this._bind( element, {
mouseenter: function( event ) {
$( event.currentTarget ).addClass( "ui-state-hover" );
},
mouseleave: function( event ) {
$( event.currentTarget ).removeClass( "ui-state-hover" );
}
});
},

_focusable: function( element ) {
this.focusable = this.focusable.add( element );
this._bind( element, {
focusin: function( event ) {
$( event.currentTarget ).addClass( "ui-state-focus" );
},
focusout: function( event ) {
$( event.currentTarget ).removeClass( "ui-state-focus" );
}
});
},

_trigger: function( type, event, data ) {
var prop, orig,
callback = this.options[ type ];

data = data || {};
event = $.Event( event );
event.type = ( type === this.widgetEventPrefix ?
type :
this.widgetEventPrefix + type ).toLowerCase();
// the original event may come from any element
// so we need to reset the target on the new event
event.target = this.element[ 0 ];

// copy original event properties over to the new event
orig = event.originalEvent;
if ( orig ) {
for ( prop in orig ) {
if ( !( prop in event ) ) {
event[ prop ] = orig[ prop ];
}
}
}

this.element.trigger( event, data );
return !( $.isFunction( callback ) &&
callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
event.isDefaultPrevented() );
}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
if ( typeof options === "string" ) {
options = { effect: options };
}
var hasOptions,
effectName = !options ?
method :
options === true || typeof options === "number" ?
defaultEffect :
options.effect || defaultEffect;
options = options || {};
if ( typeof options === "number" ) {
options = { duration: options };
}
hasOptions = !$.isEmptyObject( options );
options.complete = callback;
if ( options.delay ) {
element.delay( options.delay );
}
if ( hasOptions && $.effects && ( $.effects.effect[ effectName ] || $.uiBackCompat !== false && $.effects[ effectName ] ) ) {
element[ method ]( options );
} else if ( effectName !== method && element[ effectName ] ) {
element[ effectName ]( options.duration, options.easing, callback );
} else {
element.queue(function( next ) {
$( this )[ method ]();
if ( callback ) {
callback.call( element[ 0 ] );
}
next();
});
}
};
});

// DEPRECATED
if ( $.uiBackCompat !== false ) {
$.Widget.prototype._getCreateOptions = function() {
return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
};
}

})( jQuery );




/*	3. WIDGET ---- (jquery/jquery-mobile/js/jquery.mobile.widget.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Widget factory extentions for mobile.
//>>label: Widget Factory
//>>group: Core
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( [ "jquery", "depend!./jquery.ui.widget[jquery]" ], function( $ ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

$.widget( "mobile.widget", {
// decorate the parent _createWidget to trigger `widgetinit` for users
// who wish to do post post `widgetcreate` alterations/additions
//
// TODO create a pull request for jquery ui to trigger this event
// in the original _createWidget
_createWidget: function() {
$.Widget.prototype._createWidget.apply( this, arguments );
this._trigger( 'init' );
},

_getCreateOptions: function() {

var elem = this.element,
options = {};

$.each( this.options, function( option ) {

var value = elem.jqmData( option.replace( /[A-Z]/g, function( c ) {
return "-" + c.toLowerCase();
})
);

if ( value !== undefined ) {
options[ option ] = value;
}
});

return options;
},

enhanceWithin: function( target, useKeepNative ) {
this.enhance( $( this.options.initSelector, $( target )), useKeepNative );
},

enhance: function( targets, useKeepNative ) {
var page, keepNative, $widgetElements = $( targets ), self = this;

// if ignoreContentEnabled is set to true the framework should
// only enhance the selected elements when they do NOT have a
// parent with the data-namespace-ignore attribute
$widgetElements = $.mobile.enhanceable( $widgetElements );

if ( useKeepNative && $widgetElements.length ) {
// TODO remove dependency on the page widget for the keepNative.
// Currently the keepNative value is defined on the page prototype so
// the method is as well
page = $.mobile.closestPageData( $widgetElements );
keepNative = (page && page.keepNativeSelector()) || "";

$widgetElements = $widgetElements.not( keepNative );
}

$widgetElements[ this.widgetName ]();
},

raise: function( msg ) {
throw "Widget [" + this.widgetName + "]: " + msg;
}
});

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/* 	4. CORE ---- (jquery/jquery-mobile/js/jquery.mobile.core.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Base file for jQuery Mobile
//>>label: Core
//>>group: Core
//>>css.structure: ../css/structure/jquery.mobile.core.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( [ "jquery", "text!../version.txt" ], function( $, __version__ ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, window, undefined ) {

var nsNormalizeDict = {};

// jQuery.mobile configurable options
$.mobile = $.extend( {}, {

// Version of the jQuery Mobile Framework
version: __version__,

// Namespace used framework-wide for data-attrs. Default is no namespace
ns: "",

// Define the url parameter used for referencing widget-generated sub-pages.
// Translates to to example.html&ui-page=subpageIdentifier
// hash segment before &ui-page= is used to make Ajax request
subPageUrlKey: "ui-page",

// Class assigned to page currently in view, and during transitions
activePageClass: "ui-page-active",

// Class used for "active" button state, from CSS framework
activeBtnClass: "ui-btn-active",

// Class used for "focus" form element state, from CSS framework
focusClass: "ui-focus",

// Automatically handle clicks and form submissions through Ajax, when same-domain
ajaxEnabled: true,

// Automatically load and show pages based on location.hash
hashListeningEnabled: true,

// disable to prevent jquery from bothering with links
linkBindingEnabled: true,

// Set default page transition - 'none' for no transitions
defaultPageTransition: "fade",

// Set maximum window width for transitions to apply - 'false' for no limit
maxTransitionWidth: false,

// Minimum scroll distance that will be remembered when returning to a page
minScrollBack: 250,

// DEPRECATED: the following property is no longer in use, but defined until 2.0 to prevent conflicts
touchOverflowEnabled: false,

// Set default dialog transition - 'none' for no transitions
defaultDialogTransition: "pop",

// Error response message - appears when an Ajax page request fails
pageLoadErrorMessage: "Error Loading Page",

// For error messages, which theme does the box uses?
pageLoadErrorMessageTheme: "e",

//automatically initialize the DOM when it's ready
autoInitializePage: true,

pushStateEnabled: true,

// allows users to opt in to ignoring content by marking a parent element as
// data-ignored
ignoreContentEnabled: false,

// turn of binding to the native orientationchange due to android orientation behavior
orientationChangeEnabled: true,

buttonMarkup: {
hoverDelay: 200
},

// TODO might be useful upstream in jquery itself ?
keyCode: {
ALT: 18,
BACKSPACE: 8,
CAPS_LOCK: 20,
COMMA: 188,
COMMAND: 91,
COMMAND_LEFT: 91, // COMMAND
COMMAND_RIGHT: 93,
CONTROL: 17,
DELETE: 46,
DOWN: 40,
END: 35,
ENTER: 13,
ESCAPE: 27,
HOME: 36,
INSERT: 45,
LEFT: 37,
MENU: 93, // COMMAND_RIGHT
NUMPAD_ADD: 107,
NUMPAD_DECIMAL: 110,
NUMPAD_DIVIDE: 111,
NUMPAD_ENTER: 108,
NUMPAD_MULTIPLY: 106,
NUMPAD_SUBTRACT: 109,
PAGE_DOWN: 34,
PAGE_UP: 33,
PERIOD: 190,
RIGHT: 39,
SHIFT: 16,
SPACE: 32,
TAB: 9,
UP: 38,
WINDOWS: 91 // COMMAND
},

// Scroll page vertically: scroll to 0 to hide iOS address bar, or pass a Y value
silentScroll: function( ypos ) {
if ( $.type( ypos ) !== "number" ) {
ypos = $.mobile.defaultHomeScroll;
}

// prevent scrollstart and scrollstop events
$.event.special.scrollstart.enabled = false;

setTimeout(function() {
window.scrollTo( 0, ypos );
$( document ).trigger( "silentscroll", { x: 0, y: ypos });
}, 20 );

setTimeout(function() {
$.event.special.scrollstart.enabled = true;
}, 150 );
},

// Expose our cache for testing purposes.
nsNormalizeDict: nsNormalizeDict,

// Take a data attribute property, prepend the namespace
// and then camel case the attribute string. Add the result
// to our nsNormalizeDict so we don't have to do this again.
nsNormalize: function( prop ) {
if ( !prop ) {
return;
}

return nsNormalizeDict[ prop ] || ( nsNormalizeDict[ prop ] = $.camelCase( $.mobile.ns + prop ) );
},

// Find the closest parent with a theme class on it. Note that
// we are not using $.fn.closest() on purpose here because this
// method gets called quite a bit and we need it to be as fast
// as possible.
getInheritedTheme: function( el, defaultTheme ) {
var e = el[ 0 ],
ltr = "",
re = /ui-(bar|body|overlay)-([a-z])\b/,
c, m;

while ( e ) {
c = e.className || "";
if ( c && ( m = re.exec( c ) ) && ( ltr = m[ 2 ] ) ) {
// We found a parent with a theme class
// on it so bail from this loop.
break;
}

e = e.parentNode;
}

// Return the theme letter we found, if none, return the
// specified default.

return ltr || defaultTheme || "a";
},

// TODO the following $ and $.fn extensions can/probably should be moved into jquery.mobile.core.helpers
//
// Find the closest javascript page element to gather settings data jsperf test
// http://jsperf.com/single-complex-selector-vs-many-complex-selectors/edit
// possibly naive, but it shows that the parsing overhead for *just* the page selector vs
// the page and dialog selector is negligable. This could probably be speed up by
// doing a similar parent node traversal to the one found in the inherited theme code above
closestPageData: function( $target ) {
return $target
.closest(':jqmData(role="page"), :jqmData(role="dialog")')
.data("page");
},

enhanceable: function( $set ) {
return this.haveParents( $set, "enhance" );
},

hijackable: function( $set ) {
return this.haveParents( $set, "ajax" );
},

haveParents: function( $set, attr ) {
if( !$.mobile.ignoreContentEnabled ){
return $set;
}

var count = $set.length,
$newSet = $(),
e, $element, excluded;

for ( var i = 0; i < count; i++ ) {
$element = $set.eq( i );
excluded = false;
e = $set[ i ];

while ( e ) {
var c = e.getAttribute ? e.getAttribute( "data-" + $.mobile.ns + attr ) : "";

if ( c === "false" ) {
excluded = true;
break;
}

e = e.parentNode;
}

if ( !excluded ) {
$newSet = $newSet.add( $element );
}
}

return $newSet;
},

getScreenHeight: function(){
// Native innerHeight returns more accurate value for this across platforms,
// jQuery version is here as a normalized fallback for platforms like Symbian
return window.innerHeight || $( window ).height();
}
}, $.mobile );

// Mobile version of data and removeData and hasData methods
// ensures all data is set and retrieved using jQuery Mobile's data namespace
$.fn.jqmData = function( prop, value ) {
var result;
if ( typeof prop !== "undefined" ) {
if ( prop ) {
prop = $.mobile.nsNormalize( prop );
}
result = this.data.apply( this, arguments.length < 2 ? [ prop ] : [ prop, value ] );
}
return result;
};

$.jqmData = function( elem, prop, value ) {
var result;
if ( typeof prop !== "undefined" ) {
result = $.data( elem, prop ? $.mobile.nsNormalize( prop ) : prop, value );
}
return result;
};

$.fn.jqmRemoveData = function( prop ) {
return this.removeData( $.mobile.nsNormalize( prop ) );
};

$.jqmRemoveData = function( elem, prop ) {
return $.removeData( elem, $.mobile.nsNormalize( prop ) );
};

$.fn.removeWithDependents = function() {
$.removeWithDependents( this );
};

$.removeWithDependents = function( elem ) {
var $elem = $( elem );

( $elem.jqmData('dependents') || $() ).remove();
$elem.remove();
};

$.fn.addDependents = function( newDependents ) {
$.addDependents( $(this), newDependents );
};

$.addDependents = function( elem, newDependents ) {
var dependents = $(elem).jqmData( 'dependents' ) || $();

$(elem).jqmData( 'dependents', $.merge(dependents, newDependents) );
};

// note that this helper doesn't attempt to handle the callback
// or setting of an html elements text, its only purpose is
// to return the html encoded version of the text in all cases. (thus the name)
$.fn.getEncodedText = function() {
return $( "<div/>" ).text( $(this).text() ).html();
};

// fluent helper function for the mobile namespaced equivalent
$.fn.jqmEnhanceable = function() {
return $.mobile.enhanceable( this );
};

$.fn.jqmHijackable = function() {
return $.mobile.hijackable( this );
};

// Monkey-patching Sizzle to filter the :jqmData selector
var oldFind = $.find,
jqmDataRE = /:jqmData\(([^)]*)\)/g;

$.find = function( selector, context, ret, extra ) {
selector = selector.replace( jqmDataRE, "[data-" + ( $.mobile.ns || "" ) + "$1]" );

return oldFind.call( this, selector, context, ret, extra );
};

$.extend( $.find, oldFind );

$.find.matches = function( expr, set ) {
return $.find( expr, null, null, set );
};

$.find.matchesSelector = function( node, expr ) {
return $.find( expr, null, null, [ node ] ).length > 0;
};
})( jQuery, this );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/*	5. MEDIA ---- (jquery/jquery-mobile/js/jquery.mobile.media.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: A workaround for browsers without window.matchMedia
//>>label: matchMedia Polyfill
//>>group: Utilities


define( [ "jquery", "./jquery.mobile.core" ], function( $ ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

var $window = $( window ),
	$html = $( "html" );

/* $.mobile.media method: pass a CSS media type or query and get a bool return
	note: this feature relies on actual media query support for media queries, though types will work most anywhere
	examples:
		$.mobile.media('screen') // tests for screen media type
		$.mobile.media('screen and (min-width: 480px)') // tests for screen media type with window width > 480px
		$.mobile.media('@media screen and (-webkit-min-device-pixel-ratio: 2)') // tests for webkit 2x pixel ratio (iPhone 4)
*/
$.mobile.media = (function() {
	// TODO: use window.matchMedia once at least one UA implements it
	var cache = {},
		testDiv = $( "<div id='jquery-mediatest'></div>" ),
		fakeBody = $( "<body>" ).append( testDiv );

	return function( query ) {
		if ( !( query in cache ) ) {
			var styleBlock = document.createElement( "style" ),
				cssrule = "@media " + query + " { #jquery-mediatest { position:absolute; } }";

			//must set type for IE!
			styleBlock.type = "text/css";

			if ( styleBlock.styleSheet  ){
				styleBlock.styleSheet.cssText = cssrule;
			} else {
				styleBlock.appendChild( document.createTextNode(cssrule) );
			}

			$html.prepend( fakeBody ).prepend( styleBlock );
			cache[ query ] = testDiv.css( "position" ) === "absolute";
			fakeBody.add( styleBlock ).remove();
		}
		return cache[ query ];
	};
})();

})(jQuery);
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/*	6. SUPPORT ---- (jquery/jquery-mobile/js/jquery.mobile.support.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Assorted tests to qualify browsers by detecting features
//>>label: Support Tests
//>>group: Core
define( [  "jquery", "./jquery.mobile.core", "./jquery.mobile.media", "./jquery.mobile.support.orientation" ], function( $ ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

var fakeBody = $( "<body>" ).prependTo( "html" ),
	fbCSS = fakeBody[ 0 ].style,
	vendors = [ "Webkit", "Moz", "O" ],
	webos = "palmGetResource" in window, //only used to rule out scrollTop
	opera = window.opera,
	operamini = window.operamini && ({}).toString.call( window.operamini ) === "[object OperaMini]",
	bb = window.blackberry; //only used to rule out box shadow, as it's filled opaque on BB

// thx Modernizr
function propExists( prop ) {
	var uc_prop = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
		props = ( prop + " " + vendors.join( uc_prop + " " ) + uc_prop ).split( " " );

	for ( var v in props ){
		if ( fbCSS[ props[ v ] ] !== undefined ) {
			return true;
		}
	}
}

function validStyle( prop, value, check_vend ) {
	var div = document.createElement('div'),
		uc = function( txt ) {
			return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 );
		},
		vend_pref = function( vend ) {
			return  "-" + vend.charAt( 0 ).toLowerCase() + vend.substr( 1 ) + "-";
		},
		check_style = function( vend ) {
			var vend_prop = vend_pref( vend ) + prop + ": " + value + ";",
				uc_vend = uc( vend ),
				propStyle = uc_vend + uc( prop );

			div.setAttribute( "style", vend_prop );

			if( !!div.style[ propStyle ] ) {
				ret = true;
			}
		},
		check_vends = check_vend ? [ check_vend ] : vendors,
		ret;

	for( var i = 0; i < check_vends.length; i++ ) {
		check_style( check_vends[i] );
	}
	return !!ret;
}

// Thanks to Modernizr src for this test idea. `perspective` check is limited to Moz to prevent a false positive for 3D transforms on Android.
function transform3dTest() {
	var prop = "transform-3d";
	return validStyle( 'perspective', '10px', 'moz' ) || $.mobile.media( "(-" + vendors.join( "-" + prop + "),(-" ) + "-" + prop + "),(" + prop + ")" );
}

// Test for dynamic-updating base tag support ( allows us to avoid href,src attr rewriting )
function baseTagTest() {
	var fauxBase = location.protocol + "//" + location.host + location.pathname + "ui-dir/",
		base = $( "head base" ),
		fauxEle = null,
		href = "",
		link, rebase;

	if ( !base.length ) {
		base = fauxEle = $( "<base>", { "href": fauxBase }).appendTo( "head" );
	} else {
		href = base.attr( "href" );
	}

	link = $( "<a href='testurl' />" ).prependTo( fakeBody );
	rebase = link[ 0 ].href;
	base[ 0 ].href = href || location.pathname;

	if ( fauxEle ) {
		fauxEle.remove();
	}
	return rebase.indexOf( fauxBase ) === 0;
}

// Thanks Modernizr
function cssPointerEventsTest() {
	var element = document.createElement('x'),
		documentElement = document.documentElement,
		getComputedStyle = window.getComputedStyle,
		supports;

	if( !( 'pointerEvents' in element.style ) ){
		return false;
	}

	element.style.pointerEvents = 'auto';
	element.style.pointerEvents = 'x';
    documentElement.appendChild(element);
	supports = getComputedStyle &&
    getComputedStyle( element, '' ).pointerEvents === 'auto';
	documentElement.removeChild( element );
    return !!supports;
}


// non-UA-based IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
// allows for inclusion of IE 6+, including Windows Mobile 7
$.extend( $.mobile, { browser: {} } );
$.mobile.browser.ie = (function() {
	var v = 3,
		div = document.createElement( "div" ),
		a = div.all || [];

	do {
		div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><br><![endif]-->";
	} while( a[0] );

	return v > 4 ? v : !v;
})();


$.extend( $.support, {
	cssTransitions: "WebKitTransitionEvent" in window || validStyle( 'transition', 'height 100ms linear' ) && !opera,
	pushState: "pushState" in history && "replaceState" in history,
	mediaquery: $.mobile.media( "only all" ),
	cssPseudoElement: !!propExists( "content" ),
	touchOverflow: !!propExists( "overflowScrolling" ),
	cssTransform3d: transform3dTest(),
	boxShadow: !!propExists( "boxShadow" ) && !bb,
	scrollTop: ( "pageXOffset" in window || "scrollTop" in document.documentElement || "scrollTop" in fakeBody[ 0 ] ) && !webos && !operamini,
	dynamicBaseTag: baseTagTest(),
	cssPointerEvents: cssPointerEventsTest()
});

fakeBody.remove();


// $.mobile.ajaxBlacklist is used to override ajaxEnabled on platforms that have known conflicts with hash history updates (BB5, Symbian)
// or that generally work better browsing in regular http for full page refreshes (Opera Mini)
// Note: This detection below is used as a last resort.
// We recommend only using these detection methods when all other more reliable/forward-looking approaches are not possible
var nokiaLTE7_3 = (function(){

	var ua = window.navigator.userAgent;

	//The following is an attempt to match Nokia browsers that are running Symbian/s60, with webkit, version 7.3 or older
	return ua.indexOf( "Nokia" ) > -1 &&
			( ua.indexOf( "Symbian/3" ) > -1 || ua.indexOf( "Series60/5" ) > -1 ) &&
			ua.indexOf( "AppleWebKit" ) > -1 &&
			ua.match( /(BrowserNG|NokiaBrowser)\/7\.[0-3]/ );
})();

// Support conditions that must be met in order to proceed
// default enhanced qualifications are media query support OR IE 7+
$.mobile.gradeA = function(){
	return $.support.mediaquery || $.mobile.browser.ie && $.mobile.browser.ie >= 7;
};

$.mobile.ajaxBlacklist =
			// BlackBerry browsers, pre-webkit
			window.blackberry && !window.WebKitPoint ||
			// Opera Mini
			operamini ||
			// Symbian webkits pre 7.3
			nokiaLTE7_3;

// Lastly, this workaround is the only way we've found so far to get pre 7.3 Symbian webkit devices
// to render the stylesheets when they're referenced before this script, as we'd recommend doing.
// This simply reappends the CSS in place, which for some reason makes it apply
if ( nokiaLTE7_3 ) {
	$(function() {
		$( "head link[rel='stylesheet']" ).attr( "rel", "alternate stylesheet" ).attr( "rel", "stylesheet" );
	});
}

// For ruling out shadows via css
if ( !$.support.boxShadow ) {
	$( "html" ).addClass( "ui-mobile-nosupport-boxshadow" );
}

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/* 7. VMOUSE ---- (jquery/jquery-mobile/js/jquery.mobile.support.js) 
================================================================================================== */

// This plugin is an experiment for abstracting away the touch and mouse
// events so that developers don't have to worry about which method of input
// the device their document is loaded on supports.
//
// The idea here is to allow the developer to register listeners for the
// basic mouse events, such as mousedown, mousemove, mouseup, and click,
// and the plugin will take care of registering the correct listeners
// behind the scenes to invoke the listener at the fastest possible time
// for that device, while still retaining the order of event firing in
// the traditional mouse environment, should multiple handlers be registered
// on the same element for different events.
//
// The current version exposes the following virtual events to jQuery bind methods:
// "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel"

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Normalizes touch/mouse events.
//>>label: Virtual Mouse (vmouse) Bindings
//>>group: Core

define( [ "jquery" ], function( $ ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, window, document, undefined ) {

var dataPropertyName = "virtualMouseBindings",
	touchTargetPropertyName = "virtualTouchID",
	virtualEventNames = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split( " " ),
	touchEventProps = "clientX clientY pageX pageY screenX screenY".split( " " ),
	mouseHookProps = $.event.mouseHooks ? $.event.mouseHooks.props : [],
	mouseEventProps = $.event.props.concat( mouseHookProps ),
	activeDocHandlers = {},
	resetTimerID = 0,
	startX = 0,
	startY = 0,
	didScroll = false,
	clickBlockList = [],
	blockMouseTriggers = false,
	blockTouchTriggers = false,
	eventCaptureSupported = "addEventListener" in document,
	$document = $( document ),
	nextTouchID = 1,
	lastTouchID = 0, threshold;

$.vmouse = {
	moveDistanceThreshold: 10,
	clickDistanceThreshold: 10,
	resetTimerDuration: 1500
};

function getNativeEvent( event ) {

	while ( event && typeof event.originalEvent !== "undefined" ) {
		event = event.originalEvent;
	}
	return event;
}

function createVirtualEvent( event, eventType ) {

	var t = event.type,
		oe, props, ne, prop, ct, touch, i, j, len;

	event = $.Event(event);
	event.type = eventType;

	oe = event.originalEvent;
	props = $.event.props;

	// addresses separation of $.event.props in to $.event.mouseHook.props and Issue 3280
	// https://github.com/jquery/jquery-mobile/issues/3280
	if ( t.search( /^(mouse|click)/ ) > -1 ) {
		props = mouseEventProps;
	}

	// copy original event properties over to the new event
	// this would happen if we could call $.event.fix instead of $.Event
	// but we don't have a way to force an event to be fixed multiple times
	if ( oe ) {
		for ( i = props.length, prop; i; ) {
			prop = props[ --i ];
			event[ prop ] = oe[ prop ];
		}
	}

	// make sure that if the mouse and click virtual events are generated
	// without a .which one is defined
	if ( t.search(/mouse(down|up)|click/) > -1 && !event.which ){
		event.which = 1;
	}

	if ( t.search(/^touch/) !== -1 ) {
		ne = getNativeEvent( oe );
		t = ne.touches;
		ct = ne.changedTouches;
		touch = ( t && t.length ) ? t[0] : ( (ct && ct.length) ? ct[ 0 ] : undefined );

		if ( touch ) {
			for ( j = 0, len = touchEventProps.length; j < len; j++){
				prop = touchEventProps[ j ];
				event[ prop ] = touch[ prop ];
			}
		}
	}

	return event;
}

function getVirtualBindingFlags( element ) {

	var flags = {},
		b, k;

	while ( element ) {

		b = $.data( element, dataPropertyName );

		for (  k in b ) {
			if ( b[ k ] ) {
				flags[ k ] = flags.hasVirtualBinding = true;
			}
		}
		element = element.parentNode;
	}
	return flags;
}

function getClosestElementWithVirtualBinding( element, eventType ) {
	var b;
	while ( element ) {

		b = $.data( element, dataPropertyName );

		if ( b && ( !eventType || b[ eventType ] ) ) {
			return element;
		}
		element = element.parentNode;
	}
	return null;
}

function enableTouchBindings() {
	blockTouchTriggers = false;
}

function disableTouchBindings() {
	blockTouchTriggers = true;
}

function enableMouseBindings() {
	lastTouchID = 0;
	clickBlockList.length = 0;
	blockMouseTriggers = false;

	// When mouse bindings are enabled, our
	// touch bindings are disabled.
	disableTouchBindings();
}

function disableMouseBindings() {
	// When mouse bindings are disabled, our
	// touch bindings are enabled.
	enableTouchBindings();
}

function startResetTimer() {
	clearResetTimer();
	resetTimerID = setTimeout(function(){
		resetTimerID = 0;
		enableMouseBindings();
	}, $.vmouse.resetTimerDuration );
}

function clearResetTimer() {
	if ( resetTimerID ){
		clearTimeout( resetTimerID );
		resetTimerID = 0;
	}
}

function triggerVirtualEvent( eventType, event, flags ) {
	var ve;

	if ( ( flags && flags[ eventType ] ) ||
				( !flags && getClosestElementWithVirtualBinding( event.target, eventType ) ) ) {

		ve = createVirtualEvent( event, eventType );

		$( event.target).trigger( ve );
	}

	return ve;
}

function mouseEventCallback( event ) {
	var touchID = $.data(event.target, touchTargetPropertyName);

	if ( !blockMouseTriggers && ( !lastTouchID || lastTouchID !== touchID ) ){
		var ve = triggerVirtualEvent( "v" + event.type, event );
		if ( ve ) {
			if ( ve.isDefaultPrevented() ) {
				event.preventDefault();
			}
			if ( ve.isPropagationStopped() ) {
				event.stopPropagation();
			}
			if ( ve.isImmediatePropagationStopped() ) {
				event.stopImmediatePropagation();
			}
		}
	}
}

function handleTouchStart( event ) {

	var touches = getNativeEvent( event ).touches,
		target, flags;

	if ( touches && touches.length === 1 ) {

		target = event.target;
		flags = getVirtualBindingFlags( target );

		if ( flags.hasVirtualBinding ) {

			lastTouchID = nextTouchID++;
			$.data( target, touchTargetPropertyName, lastTouchID );

			clearResetTimer();

			disableMouseBindings();
			didScroll = false;

			var t = getNativeEvent( event ).touches[ 0 ];
			startX = t.pageX;
			startY = t.pageY;

			triggerVirtualEvent( "vmouseover", event, flags );
			triggerVirtualEvent( "vmousedown", event, flags );
		}
	}
}

function handleScroll( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	if ( !didScroll ) {
		triggerVirtualEvent( "vmousecancel", event, getVirtualBindingFlags( event.target ) );
	}

	didScroll = true;
	startResetTimer();
}

function handleTouchMove( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	var t = getNativeEvent( event ).touches[ 0 ],
		didCancel = didScroll,
		moveThreshold = $.vmouse.moveDistanceThreshold,
		flags = getVirtualBindingFlags( event.target );

		didScroll = didScroll ||
			( Math.abs(t.pageX - startX) > moveThreshold ||
				Math.abs(t.pageY - startY) > moveThreshold );


	if ( didScroll && !didCancel ) {
		triggerVirtualEvent( "vmousecancel", event, flags );
	}

	triggerVirtualEvent( "vmousemove", event, flags );
	startResetTimer();
}

function handleTouchEnd( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	disableTouchBindings();

	var flags = getVirtualBindingFlags( event.target ),
		t;
	triggerVirtualEvent( "vmouseup", event, flags );

	if ( !didScroll ) {
		var ve = triggerVirtualEvent( "vclick", event, flags );
		if ( ve && ve.isDefaultPrevented() ) {
			// The target of the mouse events that follow the touchend
			// event don't necessarily match the target used during the
			// touch. This means we need to rely on coordinates for blocking
			// any click that is generated.
			t = getNativeEvent( event ).changedTouches[ 0 ];
			clickBlockList.push({
				touchID: lastTouchID,
				x: t.clientX,
				y: t.clientY
			});

			// Prevent any mouse events that follow from triggering
			// virtual event notifications.
			blockMouseTriggers = true;
		}
	}
	triggerVirtualEvent( "vmouseout", event, flags);
	didScroll = false;

	startResetTimer();
}

function hasVirtualBindings( ele ) {
	var bindings = $.data( ele, dataPropertyName ),
		k;

	if ( bindings ) {
		for ( k in bindings ) {
			if ( bindings[ k ] ) {
				return true;
			}
		}
	}
	return false;
}

function dummyMouseHandler(){}

function getSpecialEventObject( eventType ) {
	var realType = eventType.substr( 1 );

	return {
		setup: function( data, namespace ) {
			// If this is the first virtual mouse binding for this element,
			// add a bindings object to its data.

			if ( !hasVirtualBindings( this ) ) {
				$.data( this, dataPropertyName, {});
			}

			// If setup is called, we know it is the first binding for this
			// eventType, so initialize the count for the eventType to zero.
			var bindings = $.data( this, dataPropertyName );
			bindings[ eventType ] = true;

			// If this is the first virtual mouse event for this type,
			// register a global handler on the document.

			activeDocHandlers[ eventType ] = ( activeDocHandlers[ eventType ] || 0 ) + 1;

			if ( activeDocHandlers[ eventType ] === 1 ) {
				$document.bind( realType, mouseEventCallback );
			}

			// Some browsers, like Opera Mini, won't dispatch mouse/click events
			// for elements unless they actually have handlers registered on them.
			// To get around this, we register dummy handlers on the elements.

			$( this ).bind( realType, dummyMouseHandler );

			// For now, if event capture is not supported, we rely on mouse handlers.
			if ( eventCaptureSupported ) {
				// If this is the first virtual mouse binding for the document,
				// register our touchstart handler on the document.

				activeDocHandlers[ "touchstart" ] = ( activeDocHandlers[ "touchstart" ] || 0) + 1;

				if (activeDocHandlers[ "touchstart" ] === 1) {
					$document.bind( "touchstart", handleTouchStart )
						.bind( "touchend", handleTouchEnd )

						// On touch platforms, touching the screen and then dragging your finger
						// causes the window content to scroll after some distance threshold is
						// exceeded. On these platforms, a scroll prevents a click event from being
						// dispatched, and on some platforms, even the touchend is suppressed. To
						// mimic the suppression of the click event, we need to watch for a scroll
						// event. Unfortunately, some platforms like iOS don't dispatch scroll
						// events until *AFTER* the user lifts their finger (touchend). This means
						// we need to watch both scroll and touchmove events to figure out whether
						// or not a scroll happenens before the touchend event is fired.

						.bind( "touchmove", handleTouchMove )
						.bind( "scroll", handleScroll );
				}
			}
		},

		teardown: function( data, namespace ) {
			// If this is the last virtual binding for this eventType,
			// remove its global handler from the document.

			--activeDocHandlers[ eventType ];

			if ( !activeDocHandlers[ eventType ] ) {
				$document.unbind( realType, mouseEventCallback );
			}

			if ( eventCaptureSupported ) {
				// If this is the last virtual mouse binding in existence,
				// remove our document touchstart listener.

				--activeDocHandlers[ "touchstart" ];

				if ( !activeDocHandlers[ "touchstart" ] ) {
					$document.unbind( "touchstart", handleTouchStart )
						.unbind( "touchmove", handleTouchMove )
						.unbind( "touchend", handleTouchEnd )
						.unbind( "scroll", handleScroll );
				}
			}

			var $this = $( this ),
				bindings = $.data( this, dataPropertyName );

			// teardown may be called when an element was
			// removed from the DOM. If this is the case,
			// jQuery core may have already stripped the element
			// of any data bindings so we need to check it before
			// using it.
			if ( bindings ) {
				bindings[ eventType ] = false;
			}

			// Unregister the dummy event handler.

			$this.unbind( realType, dummyMouseHandler );

			// If this is the last virtual mouse binding on the
			// element, remove the binding data from the element.

			if ( !hasVirtualBindings( this ) ) {
				$this.removeData( dataPropertyName );
			}
		}
	};
}

// Expose our custom events to the jQuery bind/unbind mechanism.

for ( var i = 0; i < virtualEventNames.length; i++ ){
	$.event.special[ virtualEventNames[ i ] ] = getSpecialEventObject( virtualEventNames[ i ] );
}

// Add a capture click handler to block clicks.
// Note that we require event capture support for this so if the device
// doesn't support it, we punt for now and rely solely on mouse events.
if ( eventCaptureSupported ) {
	document.addEventListener( "click", function( e ){
		var cnt = clickBlockList.length,
			target = e.target,
			x, y, ele, i, o, touchID;

		if ( cnt ) {
			x = e.clientX;
			y = e.clientY;
			threshold = $.vmouse.clickDistanceThreshold;

			// The idea here is to run through the clickBlockList to see if
			// the current click event is in the proximity of one of our
			// vclick events that had preventDefault() called on it. If we find
			// one, then we block the click.
			//
			// Why do we have to rely on proximity?
			//
			// Because the target of the touch event that triggered the vclick
			// can be different from the target of the click event synthesized
			// by the browser. The target of a mouse/click event that is syntehsized
			// from a touch event seems to be implementation specific. For example,
			// some browsers will fire mouse/click events for a link that is near
			// a touch event, even though the target of the touchstart/touchend event
			// says the user touched outside the link. Also, it seems that with most
			// browsers, the target of the mouse/click event is not calculated until the
			// time it is dispatched, so if you replace an element that you touched
			// with another element, the target of the mouse/click will be the new
			// element underneath that point.
			//
			// Aside from proximity, we also check to see if the target and any
			// of its ancestors were the ones that blocked a click. This is necessary
			// because of the strange mouse/click target calculation done in the
			// Android 2.1 browser, where if you click on an element, and there is a
			// mouse/click handler on one of its ancestors, the target will be the
			// innermost child of the touched element, even if that child is no where
			// near the point of touch.

			ele = target;

			while ( ele ) {
				for ( i = 0; i < cnt; i++ ) {
					o = clickBlockList[ i ];
					touchID = 0;

					if ( ( ele === target && Math.abs( o.x - x ) < threshold && Math.abs( o.y - y ) < threshold ) ||
								$.data( ele, touchTargetPropertyName ) === o.touchID ) {
						// XXX: We may want to consider removing matches from the block list
						//      instead of waiting for the reset timer to fire.
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
				ele = ele.parentNode;
			}
		}
	}, true);
}
})( jQuery, window, document );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/*	8. EVENTS
================================================================================================== */

/*	8.1 ORIENTATION CHANGE ---- (jquery/jquery-mobile/js/events/orientationchange.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Orientation change event
//>>label: orientationchange
//>>group: Events

define( [ "jquery", "../jquery.mobile.support.orientation", "./throttledresize" ], function( jQuery ) {
//>>excludeEnd("jqmBuildExclude");

(function( $, window ) {
	var win = $( window ),
		event_name = "orientationchange",
		special_event,
		get_orientation,
		last_orientation,
		initial_orientation_is_landscape,
		initial_orientation_is_default,
		portrait_map = { "0": true, "180": true };

	// It seems that some device/browser vendors use window.orientation values 0 and 180 to
	// denote the "default" orientation. For iOS devices, and most other smart-phones tested,
	// the default orientation is always "portrait", but in some Android and RIM based tablets,
	// the default orientation is "landscape". The following code attempts to use the window
	// dimensions to figure out what the current orientation is, and then makes adjustments
	// to the to the portrait_map if necessary, so that we can properly decode the
	// window.orientation value whenever get_orientation() is called.
	//
	// Note that we used to use a media query to figure out what the orientation the browser
	// thinks it is in:
	//
	//     initial_orientation_is_landscape = $.mobile.media("all and (orientation: landscape)");
	//
	// but there was an iPhone/iPod Touch bug beginning with iOS 4.2, up through iOS 5.1,
	// where the browser *ALWAYS* applied the landscape media query. This bug does not
	// happen on iPad.

	if ( $.support.orientation ) {

		// Check the window width and height to figure out what the current orientation
		// of the device is at this moment. Note that we've initialized the portrait map
		// values to 0 and 180, *AND* we purposely check for landscape so that if we guess
		// wrong, , we default to the assumption that portrait is the default orientation.
		// We use a threshold check below because on some platforms like iOS, the iPhone
		// form-factor can report a larger width than height if the user turns on the
		// developer console. The actual threshold value is somewhat arbitrary, we just
		// need to make sure it is large enough to exclude the developer console case.

		var ww = window.innerWidth || $( window ).width(),
			wh = window.innerHeight || $( window ).height(),
			landscape_threshold = 50;

		initial_orientation_is_landscape = ww > wh && ( ww - wh ) > landscape_threshold;


		// Now check to see if the current window.orientation is 0 or 180.
		initial_orientation_is_default = portrait_map[ window.orientation ];

		// If the initial orientation is landscape, but window.orientation reports 0 or 180, *OR*
		// if the initial orientation is portrait, but window.orientation reports 90 or -90, we
		// need to flip our portrait_map values because landscape is the default orientation for
		// this device/browser.
		if ( ( initial_orientation_is_landscape && initial_orientation_is_default ) || ( !initial_orientation_is_landscape && !initial_orientation_is_default ) ) {
			portrait_map = { "-90": true, "90": true };
		}
	}

	$.event.special.orientationchange = $.extend( {}, $.event.special.orientationchange, {
		setup: function() {
			// If the event is supported natively, return false so that jQuery
			// will bind to the event using DOM methods.
			if ( $.support.orientation && !$.event.special.orientationchange.disabled ) {
				return false;
			}

			// Get the current orientation to avoid initial double-triggering.
			last_orientation = get_orientation();

			// Because the orientationchange event doesn't exist, simulate the
			// event by testing window dimensions on resize.
			win.bind( "throttledresize", handler );
		},
		teardown: function(){
			// If the event is not supported natively, return false so that
			// jQuery will unbind the event using DOM methods.
			if ( $.support.orientation && !$.event.special.orientationchange.disabled ) {
				return false;
			}

			// Because the orientationchange event doesn't exist, unbind the
			// resize event handler.
			win.unbind( "throttledresize", handler );
		},
		add: function( handleObj ) {
			// Save a reference to the bound event handler.
			var old_handler = handleObj.handler;


			handleObj.handler = function( event ) {
				// Modify event object, adding the .orientation property.
				event.orientation = get_orientation();

				// Call the originally-bound event handler and return its result.
				return old_handler.apply( this, arguments );
			};
		}
	});

	// If the event is not supported natively, this handler will be bound to
	// the window resize event to simulate the orientationchange event.
	function handler() {
		// Get the current orientation.
		var orientation = get_orientation();

		if ( orientation !== last_orientation ) {
			// The orientation has changed, so trigger the orientationchange event.
			last_orientation = orientation;
			win.trigger( event_name );
		}
	}

	// Get the current page orientation. This method is exposed publicly, should it
	// be needed, as jQuery.event.special.orientationchange.orientation()
	$.event.special.orientationchange.orientation = get_orientation = function() {
		var isPortrait = true, elem = document.documentElement;

		// prefer window orientation to the calculation based on screensize as
		// the actual screen resize takes place before or after the orientation change event
		// has been fired depending on implementation (eg android 2.3 is before, iphone after).
		// More testing is required to determine if a more reliable method of determining the new screensize
		// is possible when orientationchange is fired. (eg, use media queries + element + opacity)
		if ( $.support.orientation ) {
			// if the window orientation registers as 0 or 180 degrees report
			// portrait, otherwise landscape
			isPortrait = portrait_map[ window.orientation ];
		} else {
			isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
		}

		return isPortrait ? "portrait" : "landscape";
	};

	$.fn[ event_name ] = function( fn ) {
		return fn ? this.bind( event_name, fn ) : this.trigger( event_name );
	};

	$.attrFn[ event_name ] = true;

}( jQuery, this ));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/*	8.2 THROTTLED RESIZE ---- (jquery/jquery-mobile/js/events/throttledresize.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Throttled resize event
//>>label: throttledresize
//>>group: Events

define( [ "jquery" ], function( jQuery ) {
//>>excludeEnd("jqmBuildExclude");

	// throttled resize event
	(function( $ ) {
		$.event.special.throttledresize = {
			setup: function() {
				$( this ).bind( "resize", handler );
			},
			teardown: function(){
				$( this ).unbind( "resize", handler );
			}
		};

		var throttle = 250,
			handler = function() {
				curr = ( new Date() ).getTime();
				diff = curr - lastCall;

				if ( diff >= throttle ) {

					lastCall = curr;
					$( this ).trigger( "throttledresize" );

				} else {

					if ( heldCall ) {
						clearTimeout( heldCall );
					}

					// Promise a held call will still execute
					heldCall = setTimeout( handler, throttle - diff );
				}
			},
			lastCall = 0,
			heldCall,
			curr,
			diff;
	})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");




/*	8.3 TOUCH ---- (jquery/jquery-mobile/js/events/touch.js) 
================================================================================================== */

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Touch events: touchstart, touchmove, touchend, tap, taphold, swipe, swipeleft, swiperight, scrollstart, scrollstop
//>>label: touch
//>>group: Events

define( [ "jquery", "../jquery.mobile.vmouse" ], function( $ ) {
//>>excludeEnd("jqmBuildExclude");

(function( $, window, undefined ) {
	// add new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"tap taphold " +
		"swipe swipeleft swiperight " +
		"scrollstart scrollstop" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		$.attrFn[ name ] = true;
	});

	var supportTouch = "ontouchend" in document,
		scrollEvent = "touchmove scroll",
		touchStartEvent = supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = supportTouch ? "touchmove" : "mousemove";

	function triggerCustomEvent( obj, eventType, event ) {
		var originalType = event.type;
		event.type = eventType;
		$.event.handle.call( obj, event );
		event.type = originalType;
	}

	// also handles scrollstop
	$.event.special.scrollstart = {

		enabled: true,

		setup: function() {

			var thisObject = this,
				$this = $( thisObject ),
				scrolling,
				timer;

			function trigger( event, state ) {
				scrolling = state;
				triggerCustomEvent( thisObject, scrolling ? "scrollstart" : "scrollstop", event );
			}

			// iPhone triggers scroll after a small delay; use touchmove instead
			$this.bind( scrollEvent, function( event ) {

				if ( !$.event.special.scrollstart.enabled ) {
					return;
				}

				if ( !scrolling ) {
					trigger( event, true );
				}

				clearTimeout( timer );
				timer = setTimeout(function() {
					trigger( event, false );
				}, 50 );
			});
		}
	};

	// also handles taphold
	$.event.special.tap = {
		tapholdThreshold: 750,

		setup: function() {
			var thisObject = this,
				$this = $( thisObject );

			$this.bind( "vmousedown", function( event ) {

				if ( event.which && event.which !== 1 ) {
					return false;
				}

				var origTarget = event.target,
					origEvent = event.originalEvent,
					timer;

				function clearTapTimer() {
					clearTimeout( timer );
				}

				function clearTapHandlers() {
					clearTapTimer();

					$this.unbind( "vclick", clickHandler )
						.unbind( "vmouseup", clearTapTimer );
					$( document ).unbind( "vmousecancel", clearTapHandlers );
				}

				function clickHandler(event) {
					clearTapHandlers();

					// ONLY trigger a 'tap' event if the start target is
					// the same as the stop target.
					if ( origTarget === event.target ) {
						triggerCustomEvent( thisObject, "tap", event );
					}
				}

				$this.bind( "vmouseup", clearTapTimer )
					.bind( "vclick", clickHandler );
				$( document ).bind( "vmousecancel", clearTapHandlers );

				timer = setTimeout(function() {
					triggerCustomEvent( thisObject, "taphold", $.Event( "taphold", { target: origTarget } ) );
				}, $.event.special.tap.tapholdThreshold );
			});
		}
	};

	// also handles swipeleft, swiperight
	$.event.special.swipe = {
		scrollSupressionThreshold: 10, // More than this horizontal displacement, and we will suppress scrolling.

		durationThreshold: 1000, // More time than this, and it isn't a swipe.

		horizontalDistanceThreshold: 30,  // Swipe horizontal displacement must be more than this.

		verticalDistanceThreshold: 75,  // Swipe vertical displacement must be less than this.

		setup: function() {
			var thisObject = this,
				$this = $( thisObject );

			$this.bind( touchStartEvent, function( event ) {
				var data = event.originalEvent.touches ?
						event.originalEvent.touches[ 0 ] : event,
					start = {
						time: ( new Date() ).getTime(),
						coords: [ data.pageX, data.pageY ],
						origin: $( event.target )
					},
					stop;

				function moveHandler( event ) {

					if ( !start ) {
						return;
					}

					var data = event.originalEvent.touches ?
						event.originalEvent.touches[ 0 ] : event;

					stop = {
						time: ( new Date() ).getTime(),
						coords: [ data.pageX, data.pageY ]
					};

					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				}

				$this.bind( touchMoveEvent, moveHandler )
					.one( touchStopEvent, function( event ) {
						$this.unbind( touchMoveEvent, moveHandler );

						if ( start && stop ) {
							if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
								Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
								Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {

								start.origin.trigger( "swipe" )
									.trigger( start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight" );
							}
						}
						start = stop = undefined;
					});
			});
		}
	};
	$.each({
		scrollstop: "scrollstart",
		taphold: "tap",
		swipeleft: "swipe",
		swiperight: "swipe"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			}
		};
	});

})( jQuery, this );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");

