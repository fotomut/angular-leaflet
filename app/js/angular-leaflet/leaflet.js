'use strict';

var app = angular.module('leaflet', []);

// TODO: ui-event?
//Setup map events from a leaflet map object to trigger on a given element too,
//then we just use ui-event to catch events from an element
var bindMapEvents = function bindMapEvents(scope, eventsString, leafletObject, element) {
    angular.forEach(eventsString.split(' '), function (eventName) {
        //Prefix all leaflet events with 'map-', so eg 'click'
        //for the leaflet map doesn't interfere with a normal 'click' event
        var $event = { type: 'map-' + eventName };
        leafletObject.addEventListener(eventName, function (evt) {
            element.triggerHandler(angular.extend({}, $event, evt));
            // TODO: dont really understand this apply stuff
            //We create an $apply if it isn't happening. we need better support for this
            //We don't want to use timeout because tons of these events fire at once,
            //and we only need one $apply
            scope.safeApply();
        });
    });
}

app.directive('leafletMap', ['$parse', function ($parse) {

    var mapEvents = 'click dblclick ' +
        'mousedown mouseup mouseover mouseout mousemove ' +
        'contextmenu ' +
        'focus blur ' +
        'preclick load viewreset ' +
        'movestart move moveend ' +
        'dragstart drag dragend ' +
        'zoomstart zoom zoomend autopanstart ' +
        'layeradd layerremove baselayerchange ' +
        'locationfound locationerror ' +
        'popupopen popupclose';

    return {
        restrict: 'A',
//        replace: true,
//        template: '<div></div>',
//        scope: {
//            leafletOptions: '=' // required
//        },
        link: function link(scope, element, attrs) {
            var map = L.map(element[0]);

            var model = $parse(attrs.leafletMap);
            model.assign(scope, map); //Set scope variable for the map

            // map tileLayer
//            var tileUrl = 'http://{s}.tiles.mapbox.com/v3/samfrons.map-dcwttqie/{z}/{x}/{y}.png';
//            var tileUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
            var tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            map.addLayer(L.tileLayer(tileUrl, { maxZoom: 18 }));

            // mapOptions
            if (attrs.leafletOptions !== undefined) {
                scope.$watch(attrs.leafletOptions, function (mapOptions) {
                    if (mapOptions === undefined) { // create mapOptions if doesn't exist
                        mapOptions = {};
                    }

                    // Center of the map
                    if (mapOptions.center === undefined) { // default center
                        angular.extend(mapOptions, { center : L.latLng(38.8977, -77.0366) });
                    }
                    // zoom
                    if (mapOptions.zoom === undefined) { // default zoom
                        angular.extend(mapOptions, { zoom : 8 });
                    }
                    map.setView(mapOptions.center, mapOptions.zoom);

                    // markers
                    if (mapOptions.markers) {
                        angular.forEach(mapOptions.markers, function(marker) {
                            marker.addTo(map);
                        })
                    }

                });
            }
            bindMapEvents(scope.$root, mapEvents, map, element);
        }
    };
}]);

app.directive('leafletMarker', ['$parse', function($parse) {

    var markerEvents = 'click dblclick ' +
        'mousedown mouseover mouseout ' +
        'contextmenu ' +
        'dragstart drag dragend ' +
        'move remove';

    return {
        restrict: 'E', // TODO:
//        replace: true,
//        template: '<div></div>',

        link: function (scope, element, attrs) {
            // attributes:
            //   leafletLat, leafletLng // required
            //   markerOptions
            //   leafletMap // required
            console.log(attrs.leafletLat, scope.$eval(attrs.leafletLat), scope.$eval(attrs.leafletLng))
            var latLng = L.latLng(scope.$eval(attrs.leafletLat), scope.$eval(attrs.leafletLng));
            var opts = angular.extend({}, scope.$eval(attrs.markerOptions));
            var marker = L.marker(latLng, opts);

            var map = scope.$eval(attrs.leafletMap);
            marker.addTo(map);

            // bind the popup using an input function and the model object
            if (attrs.popupContentFunction && attrs.model) {
                var popupContent = scope.$eval(attrs.popupContentFunction)(scope.$eval(attrs.model));
                var popupOptions = angular.extend({}, scope.$eval(attrs.popupContentOptions));
                marker.bindPopup(popupContent, popupOptions);
            }

            bindMapEvents(scope, markerEvents, marker, element);

            element.bind("$destroy", function() {
                map.removeLayer(marker);
            });
        }
    };
}]);



//////////////////////  code below from angular-ui google maps
    app.directive('uiMapInfoWindow',
        ['ui.config', '$parse', '$compile', function (uiConfig, $parse, $compile) {

            var infoWindowEvents = 'closeclick content_change domready ' +
                'position_changed zindex_changed';
            var options = uiConfig.mapInfoWindow || {};

            return {
                link: function (scope, elm, attrs) {
                    var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
                    opts.content = elm[0];
                    var model = $parse(attrs.uiMapInfoWindow);
                    var infoWindow = model(scope);

                    if (!infoWindow) {
                        infoWindow = new google.maps.InfoWindow(opts);
                        model.assign(scope, infoWindow);
                    }

                    bindMapEvents(scope, infoWindowEvents, infoWindow, elm);

                    /* The info window's contents dont' need to be on the dom anymore,
                     google maps has them stored.  So we just replace the infowindow element
                     with an empty div. (we don't just straight remove it from the dom because
                     straight removing things from the dom can mess up angular) */
                    elm.replaceWith('<div></div>');

                    //Decorate infoWindow.open to $compile contents before opening
                    var _open = infoWindow.open;
                    infoWindow.open = function open(a1, a2, a3, a4, a5, a6) {
                        $compile(elm.contents())(scope);
                        _open.call(infoWindow, a1, a2, a3, a4, a5, a6);
                    };
                }
            };
        }]);

/*
 * Map overlay directives all work the same. Take map marker for example
 * <ui-map-marker="myMarker"> will $watch 'myMarker' and each time it changes,
 * it will hook up myMarker's events to the directive dom element.  Then
 * ui-event will be able to catch all of myMarker's events. Super simple.
 */
//function mapOverlayDirective(directiveName, events) {
//console.log('mapOverlayDirective_'+directiveName,events);
//    app.directive(directiveName, [function () {
//        return {
//            restrict: 'A',
//            link: function (scope, elm, attrs) {
//                scope.$watch(attrs[directiveName], function (newObject) {
//                    bindMapEvents(scope, events, newObject, elm);
//                });
//            }
//        };
//    }]);
//}
//
//mapOverlayDirective(
//    'leafletMarker',
//    'click dblclick ' +
//    'mousedown mouseover mouseout ' +
//    'contextmenu ' +
//    'dragstart drag dragend ' +
//    'move remove'
//);



//    mapOverlayDirective('uiMapPolyline',
//        'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');
//
//    mapOverlayDirective('uiMapPolygon',
//        'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');
//
//    mapOverlayDirective('uiMapRectangle',
//        'bounds_changed click dblclick mousedown mousemove mouseout mouseover ' +
//            'mouseup rightclick');
//
//    mapOverlayDirective('uiMapCircle',
//        'center_changed click dblclick mousedown mousemove ' +
//            'mouseout mouseover mouseup radius_changed rightclick');
//
//    mapOverlayDirective('uiMapGroundOverlay',
//        'click dblclick');


