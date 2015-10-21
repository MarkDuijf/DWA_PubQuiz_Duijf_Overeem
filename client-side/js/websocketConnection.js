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

acceptTeam = function(roomId, teamName, messageType){
    wsSend({roomId: roomId, teamName: teamName, messageType: messageType});
}

wsConnection.onmessage = function(message){
    var receivedData = JSON.parse(message.data);
    console.log(receivedData);

    switch(receivedData.messageType){
        case 'processRequest':
            console.log('processRequest received!')
            var requests = document.getElementById('teamRequests');
            var request = document.createElement('div');
            request.classList.add('col-lg-3')
            request.classList.add('col-md-4')
            request.classList.add('col-sm-6')
            var accept = document.createElement('button');
            accept.innerHTML = 'Accept';
            accept.classList.add('btn-success');
            accept.setAttribute('ng-click', acceptTeam({roomId: receivedData.roomId, teamName: receivedData.teamName, messageType: 'acceptTeam'}));
            var reject = document.createElement('button');
            reject.classList.add('btn-danger')
            reject.innerHTML = 'Reject';
            request.style.textAlign = 'center';
            request.style.border = 'solid 1px black';
            request.innerHTML = '<h1>' + receivedData.teamName + '</h1>';
            request.appendChild(accept)
            request.appendChild(reject)
            requests.appendChild(request);
        break;
    }

};

