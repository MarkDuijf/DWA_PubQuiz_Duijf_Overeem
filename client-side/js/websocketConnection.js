'use strict';


var wsConnection = new WebSocket("ws://localhost:3000");
var teamNameRequest = '';
// this method is not in the official API, but it's very useful.
wsConnection.sendJSON = function (data) {
    this.send(JSON.stringify(data));
};

var getTeamRequests = function(){
    return teamNameRequest;
}

wsConnection.onopen = function (eventInfo) {
    console.log("Socket connection is open!");
};

var wsSend = function(data){
    wsConnection.send(data);
};

wsConnection.onmessage = function(message){
    teamNameRequest = message.data;
}

