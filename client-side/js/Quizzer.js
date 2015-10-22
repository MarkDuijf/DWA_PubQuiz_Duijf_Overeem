

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
            when('/waitingScreen', {
                templateUrl: 'partials/waitingScreen.html',
                controller: 'participantController'
            }).
            when('/selectCategory', {
                templateUrl: 'partials/selectCategory.html',
                controller: 'hostController'
            }).
            when('/pendingRoom/:id?', {
                templateUrl: 'partials/pendingRoom.html',
                controller: 'hostController'})
    //        }).
    //        otherwise({
    //            redirectTo: '/home'
    //        });
    }]);


theApp.controller("globalController", function($scope, $location, $http){
    $scope.waitingAcceptance = false;
    $scope.waitingStartQuiz = false;
    $scope.teamJoining = false;
    $scope.filteredCategoryList = [];

    $scope.setWaitingAcceptance = function(boolean){
        $scope.waitingAcceptance = boolean;
        console.log('setWaitingAcceptance: ', $scope.waitingAcceptance);
    }
    $scope.setWaitStartQuiz = function(boolean){
        $scope.waitingStartQuiz = boolean;
        console.log('setWaitStartQuiz: ', $scope.waitingAcceptance);
    }

    $scope.joiningTeams = [];
    $scope.joinedTeams = [];

    $scope.wsConnection = new WebSocket("ws://localhost:3000");
// this method is not in the official API, but it's very useful.

    $scope.wsConnection.onopen = function (eventInfo) {
        console.log("Socket connection is open!");
    };
    $scope.wsConnection.onclose = function(eventInfo) {
        console.log("CONNECTION", eventInfo);
    }

    $scope.wsSend = function(data){
        console.log("WS SEND", data,$scope.wsConnection )
        $scope.wsConnection.send(JSON.stringify(data));
    };

    $scope.wsConnection.onmessage = function(message){
        var receivedData = JSON.parse(message.data);
        switch(receivedData.messageType){
            case 'processRequest':
                $scope.teamJoining = true;
                $scope.joiningTeams.push(receivedData.teamName);

                $scope.acceptTeam = function(roomId, teamName){
                    console.log('acceptTeam executed!');
                    $scope.wsSend({roomId: roomId, teamName: teamName, messageType: 'processAcceptTeam'});
                    if($scope.joinedTeams.length < 6) {
                        $scope.joinedTeams.push(teamName);
                    }
                    for (var i=0; i < $scope.joiningTeams.length; i++){
                        if ($scope.joiningTeams[i] === teamName){
                            $scope.joiningTeams.splice(i,1);
                        }
                    }
                }

                $scope.rejectTeam = function(roomId, teamName){
                    $scope.wsSend({roomId: roomId, teamName: teamName, messageType: 'rejectTeam'});
                    for (var i=0; i < $scope.joiningTeams.length; i++){
                        if ($scope.joiningTeams[i] === teamName){
                            $scope.joiningTeams.splice(i,1);
                        }
                    }
                }
            break;
            case 'acceptedTeam':
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
        }
        $scope.$apply();
    };

    $scope.getQuestionInfo = function(detail, cb){
        $scope.info = [];
        $http.get('/global/getQuestions')
            .success(function(data){
                if (detail === 'questions') {
                    for (var i = 0; i < data.length; i++) {
                        $scope.info[i] = data[i].question;
                    }
                }
                else if (detail === 'categories') {
                    for(var i=0; i<data.length; i++){
                        $scope.info[i] = data[i].category;
                    }
                }
                else if(detail === 'all'){
                    for(var i=0;i<data.length;i++){
                        $scope.info[i] = data[i];
                    }
                }
                cb($scope.info);
                })
            .error(function(){

                });
    };

    $scope.openCategorySelection = function(){
        $scope.getQuestionInfo('categories', function(data){
            $scope.filteredCategoryList = $scope.filterCategories(data);
            $location.path('/selectCategory');
        });
    };


    $scope.filterCategories = function(categoryList){
        var filteredArray = [];
        categoryList.forEach(function(category){
            if(filteredArray.indexOf(category) > -1){
            }
            else{
                filteredArray.push(category);
            }
        });
        console.log(filteredArray);
        return filteredArray;
    };

    $scope.categoriesSelected = [];

    $scope.toggleSelectedCategory = function(category){
        if ($scope.categoriesSelected.indexOf(category) > -1){
            for (var p = 0; p < $scope.categoriesSelected.length; p++) {
                if ($scope.categoriesSelected[p] === category) {
                    $scope.categoriesSelected.splice(p, 1)
                }
            }
        }
        else {
            if ($scope.categoriesSelected.length < 3){
                $scope.categoriesSelected.push(category);
            }
        }
        console.log($scope.categoriesSelected)

    };

    $scope.isSelectedCat = function(category){
        for (var p = 0; p < $scope.categoriesSelected.length; p++){
            if ($scope.categoriesSelected[p] === category){
                return true;
            }
        }
        return false;
    }

    $scope.hai = "hallo";
    $scope.selectCategories = function(selectedCategories){
        var allQuestions = $scope.getQuestionInfo('all', function(data){
            console.log(data);
            $scope.allQuestions = data;
            $scope.cat1 = $scope.getRandomQuestions($scope.questionsInCat(selectedCategories[0]));
            $scope.cat1Name = $scope.cat1[0].category;
            $scope.cat2 = $scope.getRandomQuestions($scope.questionsInCat(selectedCategories[1]));
            $scope.cat2Name = $scope.cat2[0].category;
            $scope.cat3 = $scope.getRandomQuestions($scope.questionsInCat(selectedCategories[2]));
            $scope.cat3Name = $scope.cat3[0].category;
            $location.path('hostQuestion');
        })
        $scope.questionsInCat = function(cat){
            var returnArray = [];
            for(var i = 0;i < $scope.allQuestions.length;i++){
                if($scope.allQuestions[i].category === cat){
                    returnArray.push($scope.allQuestions[i]);
                }
            }
            return returnArray;
        }
        $scope.getRandomQuestions = function(questionList){
            var returnArray = []
            //console.log()
            for(var i = 0; i < 4; i++) {
                var randomIndex = Math.floor(Math.random() * questionList.length) + 1;
                console.log(randomIndex);
                returnArray.push(questionList[randomIndex]);
                returnArray.splice(randomIndex, 1);
            }
            return returnArray;
        }
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
        $scope.roomId = id;
    }

    $scope.closeModal = function(){
        $scope.showModal = false;
        $scope.teamsInRoom = [];
        $scope.teamName= '';
        $scope.password = '';
    };

    $scope.applyToRoom = function(teamName, roomPass){
        $http.post('/participant/joinRoom', {teamName: teamName, roomPass: roomPass, roomId: $scope.roomId})
            .success(function(data){
                if(data != 'the password was incorrect!') {
                    $scope.closeModal();
                    $scope.wsSend({teamName: data.teamName, roomId: data.roomId, messageType: 'joinRequest'});
                    $scope.getRooms();
                    $scope.setWaitingAcceptance(true);
                   $location.path('/waitingScreen');
                }
                else{
                    alert('the password was incorrect!');
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
                            $scope.wsSend({messageType: 'becomeHost', roomId: $scope.roomName});
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



    $(function() {
        $( "#accordion" ).accordion();
    });

});


theApp.controller('beamerViewController', function($scope, $http, $location, $routeParams){
    console.log('hai');
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
