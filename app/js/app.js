'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'leaflet'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/map1', {templateUrl: 'partials/map1.html', controller: Map1Ctrl});
        $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
        $routeProvider.otherwise({redirectTo: '/map1'});
    }])


    .run(function($rootScope) {
        $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
    });