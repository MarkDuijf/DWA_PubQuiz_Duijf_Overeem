var theApp = angular.module("QuizzerApp", ['ngRoute']);
theApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/participant', {
                templateUrl: 'partials/participantsView.html'
                //controller: 'RouteController'
            }).
            when('/hoster', {
                templateUrl: 'partials/hosterView.html',
                controller: 'hostController'
            }).
            when('/spectator', {
                templateUrl: 'partials/beamerView.html',
                controller: 'beamerViewController'
            }).
            when('/spectator:room?', {
                templateUrl: 'partials/beamerView.html',
                controller: 'beamerViewController'
            }).
            when('/home', {
                templateUrl: 'partials/home.html',
                //controller: 'newMovieController'
            }).
            when('/Question', {
                templateUrl: 'partials/answerQuestion.html',
                controller: 'participantController'
            }).
            when('/hostQuestion', {
                templateUrl: 'partials/hostStartQuestion.html'
                //controller: 'hostController'
            }).
            when('/hostQuestionOverview', {
                templateUrl: 'partials/hostQuestionOverview.html'
                //controller: 'hostController'
            }).
            otherwise({
                redirectTo: 'partials/home.html'
            });
    }]);

theApp.controller("beamerViewController", function($scope, $location){
    $scope.roomSelected = true;

    $scope.openSpecRoom = function(){
        //$location.path("/beamerView/" + roomName);
        $scope.roomSelected = false;
    };

    $scope.closeSpecRoom = function(){
        //$location.path("/beamerView/" + roomName);
        $scope.roomSelected = true;
    };

    $scope.roomIsSelected = function(){
        return (roomName != "");
    }

});

theApp.controller('menuControl', ['$scope', '$location', function ($scope, $location) {

    $scope.menuItems = [{
        Title: 'Quizzer',
        LinkText: 'home'
    }, {
        Title: 'Participate',
        LinkText: 'participant'

    }, {
        Title: 'Host',
        LinkText: 'hoster'

    }, {
        Title: 'Spectate',
        LinkText: 'spectator'
    }, {
        Title: 'Question',
        LinkText: 'Question'
    }, {
        Title: 'start Question',
        LinkText: 'hostQuestion'
    }, {
        Title: 'pending Question',
        LinkText: 'hostQuestionOverview'
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

theApp.controller('participantController', function($scope){

    $scope.answered = false;
    $scope.responseText = document.getElementById('submitResponse');

    $scope.submitAnswer = function() {
        console.log($scope.answer);
        if($scope.answer != undefined){
            $scope.answered = true;
            $scope.responseText.innerHTML = '<h4>' + 'Your answer was submitted! You answered: ' +'<b>' +  $scope.answer + '</b>' + '</h4>';

            // $http.post request met het gegeven antwoord, anders verdwijnt hij weer hieronder

            $scope.answer = undefined;
        }
        else{
            $scope.answered = true;
            $scope.responseText.innerHTML = '<h4>' + 'please answer the question before submitting!' + '</h4>';
        }
    }
});

theApp.controller('hostController', function($scope, $http){
    $scope.createRoom = function(){
        console.log('attempt at room creating');
        //$http.post('/addRoom', JSON.stringify({name: $scope.roomName, password: $scope.roomPass, teams: [], adminPass: $scope.adminPass, roundNr: 1, questionNr: 1}))
        //    .success(function(){
        //        console.log('post succesful!')
        //    })
        //    .error(function(){
        //        console.log('ERRRORRR')
        //    });


        //$http({method: 'Post', url: '/addRoom', data: {name: $scope.roomName, password: $scope.roomPass, teams: [], adminPass: $scope.adminPass, roundNr: 1, questionNr: 1}}).
        //    success(function(data, status, headers, config) {
        //        alert(data);
        //    }).
        //    error(function(){
        //        alert("failed");
        //    })

        $http.post('/addRoom', function(req, res){
            req.body = JSON.stringify({name: $scope.roomName, password: $scope.roomPass, teams: [], adminPass: $scope.adminPass, roundNr: 1, questionNr: 1});
            console.log(req.body);

            res.send();
        });
    };
});

