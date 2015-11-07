var theApp = angular.module("QuizzerApp", ['ngRoute']);
theApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/participant', {
                templateUrl: 'partials/participant.html',
                controller: 'participantController'
            }).
            when('/host', {
                templateUrl: 'partials/host.html',
                controller: 'hostController'
            }).
            when('/spectator', {
                templateUrl: 'partials/spectator.html',
                controller: 'beamerViewController'
            }).
            otherwise({
                redirectTo: '/home'
            });
    }]);




theApp.controller('menuControl', ['$scope', '$location', function ($scope) {

    $scope.menuItems = [{
        Title: 'Quizzer',
        LinkText: 'home'
    }, {
        Title: 'Participate',
        LinkText: 'participant'

    }, {
        Title: 'Host',
        LinkText: 'host'

    }, {
        Title: 'Spectate',
        LinkText: 'spectator'
    }];

    $scope.currentPage = 'home';

    $scope.toggleSelected = function (menu) {
        if(menu.LinkText != $scope.currentPage){
            $scope.menuItems.forEach(function (menuitem) {
            if (menuitem === menu) {
                $scope.currentPage = menu.LinkText;
                return menu.selected;
            }
        });
        }
    };

    $scope.isCurrentPage = function(menuItem){
        return menuItem.LinkText === $scope.currentPage;
    }

}]);
