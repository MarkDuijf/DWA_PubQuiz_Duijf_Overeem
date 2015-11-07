theApp.controller('beamerViewController', function($scope, $http){

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
                $scope.teamsSubmitting = $scope.currentRoom.teams;
                $scope.currentRoom.questionNr = receivedData.questionNr;
                $scope.currentRoom.roundNr = receivedData.roundNr;
                console.log('vraagNr: ', $scope.currentRoom.questionNr);
                console.log('rondeNr: ', $scope.currentRoom.roundNr);
            break;
            case 'openQuestionSpectator':
                $scope.getRoomInfo({roomName: $scope.currentRoom._id});
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
    $scope.getRoomInfo = function (room) {
        $http.post('/host/getRoom', room)
            .success(function (data) {
                $scope.currentRoomData = data;

                $scope.currentRoom = $scope.currentRoomData;
                console.log($scope.currentRoomData);
            })
            .error(function () {
                console.log("error");
            });
    };
});