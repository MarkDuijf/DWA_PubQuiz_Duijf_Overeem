'use strict';


var wsConnection = new WebSocket("ws://localhost:3000");
// this method is not in the official API, but it's very useful.
wsConnection.sendJSON = function (data) {
    this.send(JSON.stringify(data));
};


wsConnection.onopen = function (eventInfo) {
    console.log("Socket connection is open!");
};

var wsSend = function(data){
    wsConnection.send(JSON.stringify(data));
};


wsConnection.onmessage = function(message){
    var receivedData = JSON.parse(message.data);
    console.log(receivedData);

    if(receivedData.messageType === 'processRequest'){
        var requests = document.getElementById('requests');
        var request = document.createElement('div');
        request.innerHTML = '<h1>' + receivedData.teamName + '</h1>';
        requests.appendChild(request);
    }
};

