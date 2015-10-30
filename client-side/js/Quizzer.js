

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

    $scope.teamsSubmitting = [];
    $scope.teamsSubmitted = [];


    $scope.setWaitingAcceptance = function(boolean){
        $scope.waitingAcceptance = boolean;
    }
    $scope.setWaitStartQuiz = function(boolean){
        $scope.waitingStartQuiz = boolean;
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
            case 'hostAccept':
                $scope.roomName = receivedData.roomId
            break;
            case 'processRequest':
                $scope.teamJoining = true;
                $scope.joiningTeams.push(receivedData.teamName);

                $scope.acceptTeam = function(roomId, teamName){
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
            case 'processStartQuestion':
                $location.path('/answerQuestion');
                $scope.theQuestion = receivedData.question;
            break;
            case 'teamAnswer':
                console.log('teamName:', receivedData.teamName, 'answer:', receivedData.answer);
                $scope.teamsSubmitted.push({teamName: receivedData.teamName, answer: receivedData.answer})
                for(var i = 0;i<$scope.teamsSubmitting.length;i++){
                    if($scope.teamsSubmitting[i].teamName === receivedData.teamName){
                        $scope.teamsSubmitting.splice(i,1);
                    }
                }
            break;
            case 'endQuestionParticipant':
                $location.path('/waitingScreen');
            break;
            case 'endQuestionHost':
                $scope.teamsSubmitted = [];
                console.log($scope.currentRoomData._id)
                $scope.getRoomInfo({roomName: $scope.currentRoomData._id});
                $scope.teamsSubmitting = $scope.currentRoomData.teams;
                $scope.selectCategories($scope.selectedCategories);
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
        $http.post('/host/getRoom', {roomName: $scope.roomName})
            .success(function(data){
                $scope.getRoomInfo({roomName: $scope.roomName});
            })
            .error(function(data, status){

            })
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
    };

    $scope.isSelectedCat = function(category){
        for (var p = 0; p < $scope.categoriesSelected.length; p++){
            if ($scope.categoriesSelected[p] === category){
                return true;
            }
        }
        return false;
    }

    $scope.selectCategories = function(selectedCategories){
        $scope.selectedCategories = selectedCategories;
        if(selectedCategories.length === 3) {
            var allQuestions = $scope.getQuestionInfo('all', function (data) {
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

            for(var i = 0; i < 4; i++) {
                var randomIndex = Math.floor(Math.random() * questionList.length) + 1;
                if(returnArray.indexOf(questionList[randomIndex]) > -1) {
                    i--;
                }
                else{
                    returnArray.push(questionList[randomIndex]);
                }
            }
            return returnArray;
        }
        }
        else{
            alert('please select 3 categories!');
        }
    }

    $scope.currentRoomData = [];

    $scope.getRoomInfo = function(room){
        $http.post('/host/getRoom', room)
            .success(function(data){
                $scope.currentRoomData = data;
                console.log($scope.currentRoomData);
            })
            .error(function(status, data){
                console.log("error");
            });
    };

    $scope.selectQuestion = function(question){
        $scope.selectedQuestion = question;
    };

    $scope.isSelectedQuestion = function(question){
        return $scope.selectedQuestion === question;
    };

    $scope.openQuestionOverview = function(){
        $location.path('/hostQuestionOverview');
        $scope.teamsSubmitting = $scope.currentRoomData.teams;
        $scope.wsSend({messageType: 'questionStart', question: $scope.selectedQuestion.question, roomId: $scope.currentRoomData._id})
    };

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
