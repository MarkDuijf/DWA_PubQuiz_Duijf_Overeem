var mongoose    = require('mongoose');
var express     = require('express');
var session     = require('express-session');
var path        = require('path');
var bodyParser  = require('body-parser');
var http        = require('http');
var ws          = require('ws');

var app = express();
var httpServer      = http.createServer(app);

var theWebSocketServer = new ws.Server({
    server: httpServer
});

app.use(bodyParser.json());
app.use(session({resave: true, saveUninitialized: true, secret: 'ngio24ng24hg57341pngEAG6G13g31'}));


var dbName = 'quizzerDB';
var Room = require('./models/Room');
var Question = require('./models/Question');

theWebSocketServer.on('connection', function(ws){
    console.log('connected')
        ws.on('message', function (message) {
            console.log(message.teamName);
            ws.send(message);

        })
});



app.use(express.static(path.join(__dirname, 'client-side')));


var hostRouter = express.Router();
var participantRouter  = express.Router();

participantRouter.get('/getRooms', function(req, res){
    Room.find({}, function(err, result){
        res.send(result);
    });
});

hostRouter.post('/getRoom', function(req, res){
    Room.findOne({}, function(err, result){
        res.send(result);
    });

})

participantRouter.post('/joinRoom', function(req, res){
    Room.find({_id: req.body.roomId}, function(err, result){

        if(result[0].password === req.body.roomPass) {
            Room.update({_id: req.body.roomId}, {
                $push: {
                    teams: {
                        teamName: req.body.teamName,
                        score: 0
                    }
                }
            }, {upsert: true}, function (err, data) {
                res.send(req.body);
            })
        }
        else{
            res.send('the password was incorrect!');
        }
    });
});

hostRouter.post('/addRoom', function(req, res){
    Room.count({_id: req.body._id}, function(err, result){
       if(result > 0) {
           res.send('this room name is already taken!');
       }
        else{
           session.host = {
               isHost: true,
               roomName: req.body._id,
               teams: []
           };
           Room.create(req.body, function(err){
               if(err) console.log(err);
               res.json(req.body);
           });
       }
    });
});

hostRouter.post('/hostAuthentication', function(req, res){
    Room.count({_id: req.body.roomName}, function(err, result){
            if(result === 0) {
            res.status(404);
            res.send('this room name doesn\'t exist');
        }
        else{
            session.host = {
                roomName: 1
            }
            if (session.host.roomName === req.body.roomName) {
                res.send('you are the host!: ' + session.host);
            } else {
                res.send('you are not the host!');
            }
        }
    })
});

hostRouter.post('/becomeHost', function(req,res){
    Room.findOne({_id: req.body.roomName}, function(err, result){
        console.log(req.body.roomName);
        console.log(result);
        if(req.body.adminPass === result.adminPass){
            session.host = {
                isHost: true,
                roomName: req.body.roomName,
                teams: []
            }
            res.send('allowed!');
        }
        else{
          res.status(403);
          res.send('the adminPass was incorrect!');
        }
    })
})

hostRouter.post('/deleteRooms', function(req, res){
    Room.remove(function(){

    });
    res.send('rooms deleted!');
});


app.use('/host', hostRouter);
app.use('/participant', participantRouter);

mongoose.connect('mongodb://127.0.0.1:27017/' + dbName, function(err, db) {

    httpServer.listen(3000, function () {
        console.log('Listening on ' + httpServer.address().port)
    });
});


