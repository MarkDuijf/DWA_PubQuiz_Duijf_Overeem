

var theApp = angular.module("QuizzerApp", ['ngRoute']);
theApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/participant', {
                templateUrl: 'partials/participantsView.html',
                controller: 'participantController'
            }).
            when('/host', {
                templateUrl: 'partials/host.html',
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
            when('/Question', {
                templateUrl: 'partials/answerQuestion.html',
                controller: 'participantController'
            }).
            when('/hostQuestion', {
                templateUrl: 'partials/hostStartQuestion.html',
                controller: 'hostController'
            }).
            when('/hostQuestionOverview', {
                templateUrl: 'partials/hostQuestionOverview.html',
                controller: 'hostController'
            }).
            when('/waitingScreen', {
                templateUrl: 'partials/waitingScreen.html',
                controller: 'participantController'
            }).
            when('/selectCategory', {
                templateUrl: 'partials/selectCategory.html',
                controller: 'hostController'
            }).
            when('/answerQuestion', {
                templateUrl: '/partials/answerQuestion.html',
                controller: 'participantController'
            }).
            when('/pendingRoom/:id?', {
                templateUrl: 'partials/pendingRoom.html',
                controller: 'hostController'});
    //        }).
    //        otherwise({
    //            redirectTo: '/home'
    //        });
    }]);


theApp.controller("globalController", function($scope, $location, $http, $rootScope) {
    $scope.waitingAcceptance = false;
    $scope.waitingStartQuiz = false;
    $scope.waitingNextQuestion = false;
    $scope.waitingNextRound = false;
    $scope.teamJoining = false;

    $scope.teamRoundScores = [];
    $scope.rooms = [];
    $scope.currentRoom = [];
    $scope.currentQuestion = "";
    $scope.getRooms = function () {
        $scope.rooms = [];
        $http.get('/participant/getRooms')
            .success(function (data) {
                data.forEach(function (room) {
                    $scope.rooms.push(room)
                });
            })
            .error(function (err) {
                console.log(err);
            })
    };

    $scope.getRooms();

    $scope.roomSelected = true;

    $scope.openSpecRoom = function (room) {
        $scope.currentRoom = room;
        $scope.wsSend({messageType: 'spectateRequest', room: $scope.currentRoom});
        $scope.roomSelected = false;
        $scope.getRoomInfo({roomName: room._id});
        $scope.teamsSubmitting = $scope.currentRoomData.teams;
    };

    $scope.closeSpecRoom = function () {
        $scope.roomSelected = true;
        $scope.currentRoom = [];
    };

    $scope.setWaitingAcceptance = function (boolean) {
        $scope.waitingAcceptance = boolean;
    };
    $scope.setWaitStartQuiz = function (boolean) {
        $scope.waitingStartQuiz = boolean;
    };
    $scope.setWaitingNextQuestion = function (boolean) {
        $scope.waitingNextQuestion = boolean;
    };

    $scope.wsConnection = new WebSocket("ws://localhost:3000");
// this method is not in the official API, but it's very useful.

    $scope.wsConnection.onopen = function () {
        console.log("Socket connection is open!");
    };
    $scope.wsConnection.onclose = function (eventInfo) {
        console.log("CONNECTION", eventInfo);
    };

    $scope.wsSend = function (data) {
        console.log("WS SEND", data, $scope.wsConnection);
        $scope.wsConnection.send(JSON.stringify(data));
    };

    $scope.wsConnection.onmessage = function (message) {
        var receivedData = JSON.parse(message.data);
        switch (receivedData.messageType) {
            case 'spectatorAccept':
                $scope.currentRoom.questionNr = receivedData.questionNr;
                $scope.currentRoom.roundNr = receivedData.roundNr;
                console.log('vraagNr: ', $scope.currentRoom.questionNr);
                console.log('rondeNr: ', $scope.currentRoom.roundNr);
                break;

            case 'acceptedTeam':
                $scope.getRoomInfo({roomName: $rootScope.roomId})
                $scope.setWaitStartQuiz(true);
                $scope.setWaitingAcceptance(false);
                $scope.teamsInRoom = receivedData.teamList;
                break;
            case 'rejectedTeam':
                console.log('you got rejected!');
                $location.path('/participant');
                break;
            case 'roomFull':
                alert('your room is full! you can\'t accept more teams');
            break;
            case 'processStartQuestion':
                $location.path('/answerQuestion');
                $scope.theQuestion = receivedData.question;
                $scope.currentQuestion = receivedData.question;
                break;

            case 'endQuestionParticipant':
                $scope.setWaitStartQuiz(false);
                $scope.setWaitingNextQuestion(true)
                $location.path('/waitingScreen');
                break;

            case 'openQuestionSpectator':
                $scope.currentRoom.questionNr = receivedData.questionNr;
                $scope.currentRoom.roundNr = receivedData.roundNr;
                $scope.currentQuestion = receivedData.question;
                break;
            case 'endQuiz':
                alert("Quiz has been stopped!");
                $location.path('/home');
            break;

        }
        $scope.$apply();
    };



    $scope.endQuiz = function (roomId) {
        $http.post('/host/endQuiz', {roomId: roomId})
            .success(function () {
                $scope.wsSend({roomId: roomId, messageType: 'endQuiz'})
            })
            .error(function (status, data) {

            })
    };


    $scope.currentRoomData = [];

    $scope.getRoomInfo = function (room) {
        $http.post('/host/getRoom', room)
            .success(function (data) {
                $scope.currentRoomData = data;
                console.log($scope.currentRoomData);
            })
            .error(function () {
                console.log("error");
            });
    };
});


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
