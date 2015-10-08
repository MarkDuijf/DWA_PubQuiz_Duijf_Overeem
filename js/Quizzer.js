var theApp = angular.module("QuizzerApp", ['ngRoute']);


theApp.config(['$routeProvider',
    function($routeProvider) {
        console.log("Hello! :)")
        $routeProvider.
            when('/participant', {
                templateUrl: 'partials/participantsView.html'
                //controller: 'RouteController'
            }).
            when('/hoster', {
                templateUrl: 'partials/hosterView.html'
            }).
            when('/spectator', {
                templateUrl: 'partials/beamerView.html',
                controller: 'beamerViewController'
            }).
            when('/spectator:room?', {
                templateUrl: 'partials/beamerView.html',
                //controller: 'newMovieController'
            }).
            when('/home', {
                templateUrl: 'partials/home.html',
                //controller: 'newMovieController'
            }).
            otherwise({
                redirectTo: 'partials/home.html'
            });
    }]);

theApp.controller("beamerViewController", function($scope, $location){

    $scope.openSpecRoom = function(){
        $location.path("/beamerView/" + roomName);
    };


});
