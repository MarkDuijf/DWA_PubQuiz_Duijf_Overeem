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