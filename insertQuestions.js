var mongoose = require('mongoose');

var dbName = "quizzerDB"
var questions = require('./Questions')

var Question = require('./models/Question');

mongoose.connect('mongodb://localhost/' + dbName, function(err, db){
    Question.remove({}, function(){
        Question.create(questions, function(err){
            console.log('done!');
        })
    })
});
