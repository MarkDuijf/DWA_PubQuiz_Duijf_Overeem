theApp.controller('hostController', function($scope, $http, $location, $routeParams){

    $scope.createRoom = function(){
        if($scope.roomName != undefined && $scope.roomPass != undefined && $scope.adminPass != undefined) {
            var sendData = {
                _id: $scope.roomName,
                password: $scope.roomPass,
                teams: [],
                adminPass: $scope.adminPass,
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
        var currentRoom = {roomName: $routeParams.id};
        $http.post('/host/hostAuthentication', currentRoom)
            .success(function(data){
                if(data === 'you are not the host!'){
                    var adminPass = {
                        adminPass: prompt('Please enter the admin password'),
                        roomName: $routeParams.id
                    };
                    $http.post('/host/becomeHost', adminPass)
                        .success(function(data){
                            alert(data);
                            $scope.roomName = $routeParams.id;
                            $scope.wsSend({messageType: 'becomeHost', roomId: $scope.roomName});
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
        $scope.updateScores($scope.correctAnswers);
        $scope.wsSend({
            messageType: 'endQuestion',
            roomId: $scope.roomName,
            correctAnswers: $scope.correctAnswers
        })
    };

    $(function() {
        $("#accordion").accordion({
            heightStyle: "content"
        });
    });
});