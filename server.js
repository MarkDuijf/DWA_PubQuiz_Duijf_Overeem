var mongoose   = require('mongoose');
var express    = require('express');
var path       = require('path');
var app = express();

var dbName = 'quizzerDB';
var Room = require('./client-side/models/Room');
var room1 = new Room({name: 'room1', password: '123', teams: [], adminPass: '321', roundNr: 1, questionNr: 1});
app.use(express.static(path.join(__dirname, 'client-side')));

//var mongo = require('mongodb').MongoClient;

mongoose.connect('mongodb://127.0.0.1:27017/' + dbName, function(err, db) {
    room1.save(function(err, char){
        if(err) console.log(err);
        mongoose.connection.close();
        console.log('All done -- Bye');
    });
});

app.listen(3000);