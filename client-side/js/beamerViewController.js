theApp.controller('beamerViewController', function($scope, $http, $location, $routeParams){
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
});