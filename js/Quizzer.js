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

theApp.controller('menuControl', ['$scope', '$location', function ($scope, $location) {

    $scope.menuItems = [{
        Title: 'Quizzer',
        LinkText: 'home',
        selected: true
    }, {
        Title: 'Participate',
        LinkText: 'participant',
        selected: false

    }, {
        Title: 'Host',
        LinkText: 'hoster',
        selected: false

    }, {
        Title: 'Spectate',
        LinkText: 'spectator',
        selected: false

    }];

    $scope.currentPage = 'home';

    $scope.toggleSelected = function (menu) {
        if(menu.LinkText != $scope.currentPage){
            $scope.menuItems.forEach(function (menuitem) {
            if (menuitem === menu) {
                $scope.currentPage = menu.LinkText;
                console.log($scope.currentPage);
                return menu.selected;
            }
        });
        }
    }

    $scope.isCurrentPage = function(menuItem){
        return menuItem.LinkText === $scope.currentPage;
    }

}]);


