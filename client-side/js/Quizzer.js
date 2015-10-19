

var theApp = angular.module("QuizzerApp", ['ngRoute']);
theApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/participant', {
                templateUrl: 'partials/participantsView.html',
                controller: 'participantController'
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
                templateUrl: 'partials/hostStartQuestion.html',
                controller: 'hostController'
            }).
            when('/hostQuestionOverview', {
                templateUrl: 'partials/hostQuestionOverview.html'
                //controller: 'hostController'
            }).
            when('/pendingRoom/:id?', {
                templateUrl: 'partials/pendingRoom.html',
                controller: 'hostController'})
    //        }).
    //        otherwise({
    //            redirectTo: '/home'
    //        });
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
    }, {
        Title: 'pending Room',
        LinkText: 'pendingRoom'
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

theApp.controller('participantController', function($scope, $http, $location, $rootScope){

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

    $scope.rooms = [];
    $scope.getRooms = function(){
        $scope.rooms = [];
        $http.get('/participant/getRooms')
            .success(function(data){
                data.forEach(function (room) {
                    $scope.rooms.push(room);
                });
            })
            .error(function(err, data){
                console.log(err);
            })
    };
    $scope.getRooms();

    $scope.openModal = function(id, teams){
        $scope.showModal = true;
        $scope.teamsInRoom = teams;
        var header = document.getElementsByClassName('header');
        header[0].innerHTML = id;
    }

    $scope.closeModal = function(){
        $scope.showModal = false;
        $scope.teamsInRoom = [];
        $scope.teamName= '';
        $scope.password = '';
    };

    $scope.applyToRoom = function(teamName, roomPass){
        var header = document.getElementsByClassName('header');

       var roomId = header[0].innerHTML;
        $http.post('/participant/joinRoom', {teamName: teamName, roomPass: roomPass, roomId: roomId})
            .success(function(data){
                if(data != 'the password was incorrect!') {
                    $scope.closeModal();
                    wsSend({teamName: data.teamName, roomId: data.roomId, messageType: 'joinRequest'});
                    $scope.getRooms();
                   // $location.path('hostQuestion');
                }
            })
            .error(function(err, data){
                alert(data);
            })
    }

});

theApp.controller('hostController', function($scope, $http, $location, $routeParams){
    $scope.createRoom = function(){
        console.log($scope.roomName);
        console.log($scope.roomPass);
        console.log($scope.adminPass);
        if($scope.roomName != undefined && $scope.roomPass != undefined && $scope.adminPass != undefined) {
            var sendData = {
                _id: $scope.roomName,
                password: $scope.roomPass,
                teams: [],
                adminPass: $scope.adminPass,
                roundNr: 1,
                questionNr: 1
            }
            $http.post('/host/addRoom', sendData)
                .success(function (data) {
                    if (data === 'this room name is already taken!') {
                        alert('this room name is already taken!');
                    }
                    else {
                        alert('room created!');
                        $location.path('pendingRoom/' + $scope.roomName);
                    }

                })
                .error(function (data, status) {

                });
        }
        else{
            alert('please enter all the fields!')
        }
    };

    if($location.path().indexOf('/pendingRoom') != -1){
        if($routeParams.id == undefined){
            $routeParams.id = prompt('please enter the room you are trying to connect to');
        }
        var currentRoom = {roomName: $routeParams.id}
        console.log('roomname: ' + $routeParams.id);
        $http.post('/host/hostAuthentication', currentRoom)
            .success(function(data){
                if(data === 'you are not the host!'){
                   var adminPass = {
                       adminPass: prompt('Please enter the admin password'),
                       roomName: $routeParams.id
                    };
                    console.log(adminPass);
                    $http.post('/host/becomeHost', adminPass)
                        .success(function(data){
                            alert(data);
                            $scope.roomName = $routeParams.id
                        })
                        .error(function(status, data){
                            alert(status + ' ' + data);
                            $location.path("participant");
                        })
                }
                $http.post('/host/getRoom', {roomName: data.roomName})
                    .success(function(data){

                    })
                    .error(function(data, status){

                     })
                $scope.roomName = data.roomName;
            })
            .error(function(data, status){
                alert(status + ' ' + data);
                $location.path('participant')
            })
    }


    $scope.deleteRooms = function(){
        $http.post('/host/deleteRooms', {})
            .success(function(data){
                alert(data)
            })
            .error(function(err, status){
                alert(err);
            })
    };

    $scope.selected = false;

    $scope.selectQuestion = function(){
        $scope.selected = !$scope.selected;
        console.log($scope.selected);
        return $scope.selected;
    };

    $scope.isSelectedQuestion = function(){
        return $scope.selected;
    }

    $http.get('http://github.com/sottenad/jService')
        .success(function(data){
            console.log(data);
        })
        .error(function(){
            console.log('failed')
        });


    $(function() {
        $( "#accordion" ).accordion();
    });
});


theApp.controller('beamerViewController', function($scope, $http, $location, $routeParams){
    $scope.rooms = [];
    $scope.getRooms = function(){
        $scope.rooms = [];
        $http.get('/participant/getRooms')
            .success(function(data){
                data.forEach(function (room) {
                    $scope.rooms.push(room);
                });
            })
            .error(function(err, data){
                console.log(err);
            })
    };

    $scope.getRooms();

    $scope.openModal = function(id, teams){
        $scope.showModal = true;
        $scope.teamsInRoom = teams;
        var header = document.getElementsByClassName('header');
        header[0].innerHTML = id;
    };

    $scope.closeModal = function(){
        $scope.showModal = false;
        $scope.teamsInRoom = [];
        $scope.teamName= '';
        $scope.password = '';
    };

    $scope.roomSelected = true;
});
