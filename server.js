var mongoose   = require('mongoose');
var express    = require('express');
var path       = require('path');
var bodyParser  = require('body-parser');

var app = express();

app.use(bodyParser.json());

var dbName = 'quizzerDB';
var Room = require('./client-side/models/Room');

app.use(express.static(path.join(__dirname, 'client-side')));
var mongo    = require('mongodb').MongoClient;



mongoose.connect('mongodb://127.0.0.1:27017/' + dbName, function(err, db) {

    var hostRouter = express.Router();
    var participantRouter  = express.Router();




    participantRouter.get('/getRooms', function(req, res){
        Room.find({}, function(err, result){
            console.log(result);
            res.send(result);
        });
    })

    hostRouter.post('/addRoom', function(req, res){
        console.log(req.body);
        Room.create(req.body, function(err){
            if(err) console.log(err);
        });
         res.json(req.body);
    });

    hostRouter.post('/deleteRooms', function(req, res){
        Room.remove(function(){

        });
        res.send('rooms deleted!');
    })


    app.use('/host', hostRouter);
    app.use('/participant', participantRouter);
});

app.listen(3000);