'use strict';

/* Services */
//var defaultCoordinates = { // NYC
//    latitude : 40.763562,
//    longitude : -73.97140100000001
//};
var defaultCoordinates = { // San Fran
    latitude : 37.771139,
    longitude : -122.403424
};


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .value('version', '0.1')

    .factory('testDataSvc', function($http, $rootScope) {
//    $http.get('testfiles/meetings-big.json').success(function(data) {
//        $scope.meetings = data;
//    });
        var testDataSvc = {
            isCacheDirty: true, // signifies if server call needed
            waitingForServerResults: false,
            
            mapItemsCache: [], // latest list of meetings retrieved from server
            mapItemsChangedEvent: "mapItemsChanged"
        };

        // current location
        testDataSvc.getCurrentLocation = function() {
            return {
                latitude: defaultCoordinates.latitude,
                longitude: defaultCoordinates.longitude
            };
        };


        testDataSvc.getmapItemsFromServer = function() {
            if (testDataSvc.isCacheDirty && !testDataSvc.waitingForServerResults) {
                testDataSvc.waitingForServerResults = true;
                $http.get("testfiles/mapitems.json")
                    .success(function(data, status) {
                        testDataSvc.mapItemsCache = data.value;

                        // TODO: single mapItem
//                        testDataSvc.mapItemsCache = [ testDataSvc.mapItemsCache[0] ];

                        testDataSvc.isCacheDirty = false;
                        testDataSvc.waitingForServerResults = false;
                        console.log("******** got "+testDataSvc.mapItemsCache.length+" mapItems **********")
                        $rootScope.$broadcast(testDataSvc.mapItemsChangedEvent, [/* mapItemsChangedArgs */]);
                    })
                    .error(function(data,status) {
                        // TODO: error handling
                        console.log("FAILURE", data, status);
                    });
            }
        };

        testDataSvc.getmapItems = function() {
            console.log ("getmapItems - "+arguments[0])
            if (testDataSvc.isCacheDirty) {
                testDataSvc.getmapItemsFromServer();
            }
            
            // TODO: need promises here.  for now, returns the old mapItemsCache and use broadcast to make change
            return testDataSvc.mapItemsCache;
            // return: array of mapItem objects from server
        }

        // get initial mapItems list from database
        testDataSvc.getmapItemsFromServer();

        return testDataSvc;
    });