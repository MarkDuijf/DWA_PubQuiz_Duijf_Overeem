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