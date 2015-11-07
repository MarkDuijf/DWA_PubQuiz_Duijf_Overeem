theApp.controller('hostController', function($scope, $http, $location, $routeParams){

    $scope.joiningTeams = [];
    $scope.joinedTeams = [];

    $scope.teamsSubmitting = [];
    $scope.teamsSubmitted = [];

    $scope.teamJoining = false;

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

    $scope.wsConnection.onmessage = function(){
        $scope.wsConnection.onmessage = function (message) {
            var receivedData = JSON.parse(message.data);
            switch (receivedData.messageType) {
                case 'hostAccept':
                    $scope.roomName = receivedData.roomId;
                break;
                case 'processRequest':
                    $scope.teamJoining = true;
                    $scope.joiningTeams.push(receivedData.teamName);

                    $scope.acceptTeam = function (roomId, teamName) {
                        $scope.wsSend({roomId: roomId, teamName: teamName, messageType: 'processAcceptTeam'});
                        if ($scope.joinedTeams.length < 6) {
                            $scope.joinedTeams.push(teamName);
                        }
                        for (var i = 0; i < $scope.joiningTeams.length; i++) {
                            if ($scope.joiningTeams[i] === teamName) {
                                $scope.joiningTeams.splice(i, 1);
                            }
                        }
                    };

                    $scope.rejectTeam = function (roomId, teamName) {
                        $scope.wsSend({roomId: roomId, teamName: teamName, messageType: 'rejectTeam'});
                        for (var i = 0; i < $scope.joiningTeams.length; i++) {
                            if ($scope.joiningTeams[i] === teamName) {
                                $scope.joiningTeams.splice(i, 1);
                            }
                        }
                    };
                break;
                case 'roomFull':
                    alert('your room is full! you can\'t accept more teams');
                break;
                case 'teamAnswer':
                    console.log('teamName:', receivedData.teamName, 'answer:', receivedData.answer);
                    $scope.teamsSubmitted.push({teamName: receivedData.teamName, answer: receivedData.answer});
                    for (var i = 0; i < $scope.teamsSubmitting.length; i++) {
                        if ($scope.teamsSubmitting[i].teamName === receivedData.teamName) {
                            $scope.teamsSubmitting.splice(i, 1);
                        }
                    }
                break;
                case 'endQuestionHost':
                    $scope.teamsSubmitted = [];
                    console.log($scope.currentRoomData._id)
                    $scope.getRoomInfo({roomName: $scope.currentRoomData._id});
                    $scope.teamsSubmitting = $scope.currentRoomData.teams;
                    $scope.selectCategories($scope.selectedCategories);
                break;
                case 'endRoundHost':
                    $scope.getRoomInfo({roomName: $scope.currentRoomData._id});
                    $scope.categoriesSelected = [];
                    $scope.openCategorySelection();
                break;
                case 'endQuiz':
                    alert("Quiz has been stopped!");
                    $location.path('/home');
                break;
            }
            $scope.$apply();
        };
    }


    $scope.createRoomData = {};
    $scope.template = '/partials/hosterView.html'
    $scope.createRoom = function(){
        console.log($scope.createRoomData.roomName, $scope.createRoomData.roomPass, $scope.createRoomData.adminPass);
        if($scope.createRoomData.roomName != undefined && $scope.createRoomData.roomPass != undefined && $scope.createRoomData.adminPass != undefined) {
            var sendData = {
                _id: $scope.createRoomData.roomName,
                password: $scope.createRoomData.roomPass,
                teams: [],
                adminPass: $scope.createRoomData.adminPass,
                roundNr: 1,
                questionNr: 1
            };
            $http.post('/host/addRoom', sendData)
                .success(function (data) {
                    if (data === 'this room name is already taken!') {
                        alert('this room name is already taken!');
                    }
                    else {
                        alert('room created!');
                        $scope.becomeHost();
                        $scope.template = '/partials/pendingRoom.html';
                    }

                })
                .error(function (data, status) {

                });
        }
        else{
            alert('please enter all the fields!')
        }
    };

    $scope.becomeHost = function(){
        var currentRoom = {roomName: $scope.createRoomData.roomName};
        console.log(currentRoom);
        $http.post('/host/hostAuthentication', currentRoom)
            .success(function(data){
                if(data === 'you are not the host!'){
                    var adminPass = {
                        adminPass: prompt('Please enter the admin password'),
                        roomName: $scope.createRoomData.roomName
                    };
                    $http.post('/host/becomeHost', adminPass)
                        .success(function(data){
                            alert(data);
                            $scope.wsSend({messageType: 'becomeHost', roomId: $scope.createRoomData.roomName});
                        })
                        .error(function(status, data){
                            alert(status + ' ' + data);
                            $location.path("participant");
                        })
                }

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
            .error(function(err){
                alert(err);
            })
    };
    $scope.correctAnswers = [];

    $scope.toggleCorrectAnswer = function(answer){
        if ($scope.correctAnswers.indexOf(answer) > -1){
            for (var p = 0; p < $scope.correctAnswers.length; p++) {
                if ($scope.correctAnswers[p] === answer) {
                    $scope.correctAnswers.splice(p, 1)
                }
            }
        }
        else {
            $scope.correctAnswers.push(answer);
        }
    };

    $scope.isCorrectAnswer = function(answer){
        for (var p = 0; p < $scope.correctAnswers.length; p++){
            if ($scope.correctAnswers[p] === answer){
                return true;
            }
        }
        return false;
    };
    
    $scope.endQuestion = function(){
        $scope.selectedQuestion = undefined;
        $scope.updateScores($scope.correctAnswers);
        $scope.wsSend({
            messageType: 'endQuestion',
            roomId: $scope.createRoomData.roomName,
            correctAnswers: $scope.correctAnswers
        })
    };

    $scope.openCategorySelection = function () {
        $scope.getRoomInfo({roomName: $scope.createRoomData.roomName})
        $scope.getQuestionInfo('categories', function (data) {
            $scope.filteredCategoryList = $scope.filterCategories(data);
            $scope.template = '/partials/selectCategory.html';
        });
    };


    $scope.filterCategories = function (categoryList) {
        var filteredArray = [];
        categoryList.forEach(function (category) {
            if (filteredArray.indexOf(category) > -1) {
            }
            else {
                filteredArray.push(category);
            }
        });
        return filteredArray;
    };

    $scope.categoriesSelected = [];

    $scope.toggleSelectedCategory = function (category) {
        if ($scope.categoriesSelected.indexOf(category) > -1) {
            for (var p = 0; p < $scope.categoriesSelected.length; p++) {
                if ($scope.categoriesSelected[p] === category) {
                    $scope.categoriesSelected.splice(p, 1)
                }
            }
        }
        else {
            if ($scope.categoriesSelected.length < 3) {
                $scope.categoriesSelected.push(category);
            }
        }
    };

    $scope.isSelectedCat = function (category) {
        for (var p = 0; p < $scope.categoriesSelected.length; p++) {
            if ($scope.categoriesSelected[p] === category) {
                return true;
            }
        }
        return false;
    };

    $scope.selectCategories = function (selectedCategories) {
        $scope.selectedCategories = selectedCategories;
        if (selectedCategories.length === 3) {
            $scope.getQuestionInfo('all', function (data) {
                $scope.allQuestions = data;
                $scope.cat1 = $scope.getRandomQuestions($scope.questionsInCat(selectedCategories[0]));
                $scope.cat1Name = $scope.cat1[0].category;
                $scope.cat2 = $scope.getRandomQuestions($scope.questionsInCat(selectedCategories[1]));
                $scope.cat2Name = $scope.cat2[0].category;
                $scope.cat3 = $scope.getRandomQuestions($scope.questionsInCat(selectedCategories[2]));
                $scope.cat3Name = $scope.cat3[0].category;
                $scope.template = '/partials/hostStartQuestion.html';
                $scope.teamRoundScores = $scope.currentRoomData.teams;
            });

            $scope.questionsInCat = function (cat) {
                var returnArray = [];
                for (var i = 0; i < $scope.allQuestions.length; i++) {
                    if ($scope.allQuestions[i].category === cat) {
                        returnArray.push($scope.allQuestions[i]);
                    }
                }
                return returnArray;
            };
            $scope.getRandomQuestions = function (questionList) {
                var returnArray = [];

                for (var i = 0; i < 4; i++) {
                    var randomIndex = Math.floor(Math.random() * questionList.length) + 1;
                    if (returnArray.indexOf(questionList[randomIndex]) > -1) {
                        i--;
                    }
                    else {
                        returnArray.push(questionList[randomIndex]);
                    }
                }
                return returnArray;
            }
        }
        else {
            alert('please select 3 categories!');
        }
    };

    $scope.selectQuestion = function (question) {
        $scope.selectedQuestion = question;
    };

    $scope.isSelectedQuestion = function (question) {
        return $scope.selectedQuestion === question;
    };

    $scope.openQuestionOverview = function () {
        if ($scope.selectedQuestion === undefined) {
            alert('Select a question!')
        }
        else {
            $scope.template = '/partials/hostQuestionOverview.html';
            $scope.teamsSubmitting = $scope.currentRoomData.teams;
            $scope.wsSend({
                messageType: 'questionStart',
                question: $scope.selectedQuestion.question,
                roomId: $scope.createRoomData.roomName,
                teamRoundScores: $scope.teamRoundScores
            })
        }
    }

    $scope.updateScores = function(answers){
        console.log("teamScores: ", $scope.teamRoundScores);
        console.log("answers:", answers);
        for(var j=0; j<answers.length;j++){
            for(var i=0; i<$scope.teamRoundScores.length; i++){
                if ($scope.teamRoundScores[i].teamName === answers[j].teamName){
                    $scope.teamRoundScores[i].score += 1;
                    console.log($scope.teamRoundScores.teamName, $scope.teamRoundScores.score);
                }
            }
        }
    }

    $scope.getQuestionInfo = function (detail, cb) {
        $scope.info = [];
        $http.get('/global/getQuestions')
            .success(function (data) {
                if (detail === 'questions') {
                    for (var i = 0; i < data.length; i++) {
                        $scope.info[i] = data[i].question;
                    }
                }
                else if (detail === 'categories') {
                    for (var j = 0; j < data.length; j++) {
                        $scope.info[j] = data[j].category;
                    }
                }
                else if (detail === 'all') {
                    for (var k = 0; k < data.length; k++) {
                        $scope.info[k] = data[k];
                    }
                }
                cb($scope.info);
            })
            .error(function () {

            });
    };

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

    $scope.endQuiz = function (roomId) {
        $http.post('/host/endQuiz', {roomId: roomId})
            .success(function () {
                $scope.wsSend({roomId: roomId, messageType: 'endQuiz'})
            })
            .error(function (status, data) {

            })
    };


    $(function() {
        $("#accordion").accordion({
            heightStyle: "content"
        });
    });
});