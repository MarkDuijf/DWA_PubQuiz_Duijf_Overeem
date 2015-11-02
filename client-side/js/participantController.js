theApp.controller('participantController', function($scope, $http, $location, $rootScope){

    $scope.answered = false;
    $scope.answer = '';
    $scope.responseText = '';

    $scope.submitAnswer = function() {
        if($scope.answer != undefined){
            $scope.answered = true;
            $scope.responseText = 'Your answer was submitted! You answered: '  +  $scope.answer;
            $scope.wsSend({
                messageType: 'answeredQuestion',
                teamName: $scope.teamName,
                roomId: $scope.roomId,
                answer: $scope.answer
            });
            $scope.answer = undefined;
        }
        else {
            $scope.answered = true;
            $scope.responseText = 'please answer the question before submitting!';
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
        $scope.showModal = true;
        $scope.teamsInRoom = teams;
        $rootScope.roomId = id;
        console.log($scope.roomId);
    };

    $scope.closeModal = function(){
        $scope.showModal = false;
        $scope.teamsInRoom = [];
        $scope.teamName = '';
        $scope.password = '';
    };

    $scope.applyToRoom = function(teamName, roomPass){
        $rootScope.teamName = teamName;
        console.log($rootScope.teamName);
        if ($rootScope.teamName === undefined){
            alert('Teamname can not be empty!')
        }
        else {
            $http.post('/participant/joinRoom', {teamName: teamName, roomPass: roomPass, roomId: $scope.roomId})
                .success(function (data) {
                    if (data != 'the password was incorrect!') {
                        $scope.closeModal();
                        $scope.wsSend({teamName: data.teamName, roomId: data.roomId, messageType: 'joinRequest'});
                        $scope.getRooms();
                        $scope.setWaitingAcceptance(true);
                        $location.path('/waitingScreen');
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

});