'use strict';

/* Controllers */


function MyCtrl2() {
}



function Map1Ctrl($scope, $parse, testDataSvc) {
    // Current location
    $scope.currentLatLng= new L.LatLng(testDataSvc.getCurrentLocation().latitude, testDataSvc.getCurrentLocation().longitude);

    // map options
    $scope.mapOptions = {
        center: $scope.currentLatLng,
        zoom: 13,
        markers: [
            L.marker($scope.currentLatLng, { icon: L.icon({iconUrl: "img/heremap.png"})})
        ]
    };


    var addMarkerOptions = function(mapItems) {
        for (var i=0; i<mapItems.length; i++) {
            var icon = L.Icon.Default;

            var markerOptions = {
//                icon: icon
            };
            angular.extend(mapItems[i], { markerOptions: markerOptions });
        }

        return mapItems;
    };

    $scope.markerPopupContentOpts = {
//        maxWidth: 400,
        maxHeight: 500
    };
    $scope.markerPopupContentFn = function(item) {
        var popupContent = '' +
            '<hgroup class="">' +
            '    <h3>' + item.title + '</h3>' +
            '    <h4>latitude=' + item.latLon.latitude + '</h4>' +
            '    <h4>longitude=' + item.latLon.longitude + '</h4>' +
            '</hgroup>';

        return popupContent;
    };

    // meetings
    $scope.$on(testDataSvc.mapItemsChangedEvent, function(event, args) {
        console.log("MapCtrl#on#mapItems changed", event, args)
        $scope.mapItems = addMarkerOptions(testDataSvc.getmapItems("map-on"));
        console.log($scope.mapItems)

    });
    $scope.mapItems = addMarkerOptions(testDataSvc.getmapItems("map controller init"));
}