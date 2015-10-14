var mongoose   = require('mongoose');
var express    = require('express');
var session     = require('express-session');
var path       = require('path');
var bodyParser  = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(session({resave: true, saveUninitialized: true, secret: 'ngio24ng24hg57341pngEAG6G13g31'}));


var dbName = 'quizzerDB';
var Room = require('./models/Room');
var Question = require('/models/Room');

app.use(express.static(path.join(__dirname, 'client-side')));


var hostRouter = express.Router();
var participantRouter  = express.Router();

participantRouter.get('/getRooms', function(req, res){
    Room.find({}, function(err, result){
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
                res.send('succes!');
            })
        }
        else{
            res.send('the password was incorrect!');
        }
    });
});

hostRouter.post('/addRoom', function(req, res){
    Room.count({_id: req.body._id}, function(err, result){
        console.log(result);
       if(result > 0) {
           res.send('this room name is already taken!');
       }
        else{
           req.session.host = {
               isHost: true,
               roomName: req.body._id
           };
           Room.create(req.body, function(err){
               if(err) console.log(err);
               res.json(req.body);
           });
       }
    });

});

hostRouter.get('/hostAuthentication', function(req, res){
    if(req.session.host){
        res.send(req.session.host);
    } else {
        res.status(403);
        res.send('you are not the host!');
    }
})

hostRouter.post('/deleteRooms', function(req, res){
    Room.remove(function(){

    });
    res.send('rooms deleted!');
})


app.use('/host', hostRouter);
app.use('/participant', participantRouter);

mongoose.connect('mongodb://127.0.0.1:27017/' + dbName, function(err, db) {

    app.listen(3000);
});
