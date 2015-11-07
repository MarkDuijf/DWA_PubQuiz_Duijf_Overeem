theApp.controller('participantController', function($scope, $http, $location){

    $scope.answered = false;
    $scope.answerData = {};
    $scope.teamData = {};
    $scope.responseText = '';

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
    $scope.waitingAcceptance = false;
    $scope.waitingStartQuiz = false;
    $scope.waitingNextQuestion = false;
    $scope.waitingNextRound = false;

    $scope.setWaitingAcceptance = function (boolean) {
        $scope.waitingAcceptance = boolean;
    };
    $scope.setWaitStartQuiz = function (boolean) {
        $scope.waitingStartQuiz = boolean;
    };
    $scope.setWaitingNextQuestion = function (boolean) {
        $scope.waitingNextQuestion = boolean;
    };

    $scope.template = '/partials/participantsView.html';

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
            case 'acceptedTeam':
                $scope.getRoomInfo({roomName: $scope.roomId})
                $scope.setWaitStartQuiz(true);
                $scope.setWaitingAcceptance(false);
                $scope.teamsInRoom = receivedData.teamList;
                break;
            case 'rejectedTeam':
                console.log('you got rejected!');
                $location.path('/participant');
                break;
            case 'processStartQuestion':
                $scope.template = '/partials/answerQuestion.html';
                $scope.theQuestion = receivedData.question;
                $scope.currentQuestion = receivedData.question;
            break;
            case 'endQuestionParticipant':
                $scope.setWaitStartQuiz(false);
                $scope.setWaitingNextQuestion(true)
                $scope.template = '/partials/waitingScreen.html';
            break;
            case 'endQuiz':
                alert("Quiz has been stopped!");
                $location.path('/home');
            break;
        }
        $scope.$apply();
    };

    $scope.submitAnswer = function() {
        if($scope.answerData.answer === undefined || $scope.answerData.answer === ''){
            $scope.answered = true;
            $scope.responseText = 'please answer the question before submitting!';
        }
        else if($scope.answerData.answer === $scope.answerData.sentAnswer){
            $scope.responseText = 'you can\'t submit the same answer twice!';
        }
        else {
            $scope.answered = true;
            $scope.answerData.sentAnswer = $scope.answerData.answer;
            $scope.responseText = 'Your answer was submitted! You answered: '  +  $scope.answerData.answer;
            $scope.wsSend({
                messageType: 'answeredQuestion',
                teamName: $scope.teamData.teamName,
                roomId: $scope.roomId,
                answer: $scope.answerData.answer
            });
            $scope.answerData.answer = undefined;
            $scope.responseText = '';
        }
    };

    $scope.rooms = [];
    $scope.getRooms = function(){
        $scope.rooms = [];
        $http.get('/participant/getRooms')
            .success(function(data){
                data.forEach(function (room) {
                    $scope.rooms.push(room);
                });
            })
            .error(function(err){
                console.log(err);
            })
    };
    $scope.getRooms();

    $scope.openModal = function(id, teams){
        console.log('openModal!');
        $scope.showModal = true;
        $scope.teamsInRoom = teams;
        $scope.roomId = id;
        console.log($scope.roomId);
    }

    $scope.closeModal = function(){
        $scope.showModal = false;
        $scope.teamsInRoom = [];
        $scope.password = '';
    };

    $scope.applyToRoom = function(roomPass){
        if ($scope.teamData.teamName === undefined){
            alert('Teamname can not be empty!')
        }
        else {
            $http.post('/participant/joinRoom', {teamName: $scope.teamData.teamName, roomPass: roomPass, roomId: $scope.roomId})
                .success(function (data) {
                    if (data != 'the password was incorrect!') {
                        $scope.closeModal();
                        $scope.wsSend({teamName: data.teamName, roomId: data.roomId, messageType: 'joinRequest'});
                        $scope.getRooms();
                        $scope.setWaitingAcceptance(true);
                        $scope.template = '/partials/waitingScreen.html';
                    }
                    else {
                        alert('the password was incorrect!');
                    }
                })
                .error(function (err, data) {
                    alert(data);
                })
        }
    }

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