
var thisApp = angular.module(theApp.services, []);


thisApp.factory('GetRoomInfoService', ['$http', function($http) {
    return {
        getRoomInfo: function (room) {
            $http.post('/host/getRoom', room)
                .success(function (data) {
                    currentRoomData = data;
                    console.log(currentRoomData);
                })
                .error(function () {
                    console.log("error");
                });
        }
    }
}]);