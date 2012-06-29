# jQuery Mobile Events
====================
## A single library of all jQuery mobile events

This is a compilation of all the jQuery Mobile events. It aims to leverage all the excellent, cross-device tested event code the mobile jQuery team have created.

I've done nothing to the code except collate all the dependent code to allow basic event interaction. The minified version comes in around 25kb.

For more on jQuery Mobile's browser support, see: http://jquerymobile.com/gbs/

## How to use
Just include the 'jquery.mobile.events.custom.min.js' file in with your other JS libraries and then start using the touch events outlined at: http://jquerymobile.com/test/docs/api/events.html

## Example	
$("nav").on("click tap", function() {
	…
});

## To do
* Test all events mentioned in: http://jquerymobile.com/test/docs/api/events.html


