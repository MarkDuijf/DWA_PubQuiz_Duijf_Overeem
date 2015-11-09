theApp.controller('beamerViewController', ['$scope', '$http'/*, 'GetRoomInfoService'*/ , function($scope, $http /*GetRoomInfoService*/){
    $scope.teamsSubmitted = [];
    $scope.roomSelected = true;
    $scope.template = '/partials/beamerView.html';

    $scope.openSpecRoom = function (room) {
        $scope.currentRoom = room;
        $scope.wsSend({messageType: 'spectateRequest', room: $scope.currentRoom});
        $scope.roomSelected = false;
        $scope.getRoomInfo({roomName: room._id});
    };

    $scope.closeSpecRoom = function () {
        $scope.roomSelected = true;
        $scope.currentRoom = [];
    };


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
                $scope.currentQuestion = 'Waiting for host to start question';
                $scope.currentRoom.questionNr = receivedData.questionNr;
                $scope.currentRoom.roundNr = receivedData.roundNr;
                console.log('vraagNr: ', $scope.currentRoom.questionNr);
                console.log('rondeNr: ', $scope.currentRoom.roundNr);
                break;
            case 'openQuestionSpectator':
                $scope.teamsSubmitting = $scope.currentRoom.teams;
                $scope.teamsSubmitted = [];
                $scope.getRoomInfo({roomName: $scope.currentRoom._id});
                $scope.currentRoom.questionNr = receivedData.questionNr;
                $scope.currentRoom.roundNr = receivedData.roundNr;
                $scope.currentQuestion = receivedData.question;
                break;
            case 'teamAnswer':
                console.log('teamName:', receivedData.teamName, 'answer:', receivedData.answer);
                if ($scope.teamsSubmitted.length === 0) {
                    $scope.teamsSubmitted.push({teamName: receivedData.teamName, answer: receivedData.answer});
                }
                else{
                    for (var p = 0; p < $scope.teamsSubmitted.length; p++) {
                        if ($scope.teamsSubmitted[p].teamName === receivedData.teamName) {
                            $scope.teamsSubmitted.splice(p, 1);
                            $scope.teamsSubmitted.push({teamName: receivedData.teamName, answer: receivedData.answer});
                        }
                        else {
                            $scope.teamsSubmitted.push({teamName: receivedData.teamName, answer: receivedData.answer});
                        }
                    }
                }
                for (var i = 0; i < $scope.teamsSubmitting.length; i++) {
                    if ($scope.teamsSubmitting[i].teamName === receivedData.teamName) {
                        $scope.teamsSubmitting.splice(i, 1);
                    }
                }
            break;
            case 'endQuiz':
                alert("Quiz has been stopped!");
                $location.path('/home');
            break;

        }
        $scope.$apply();
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
        //GetRoomInfoService.getRoomInfo(room)
    };
}]);