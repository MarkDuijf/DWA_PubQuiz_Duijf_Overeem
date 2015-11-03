var mongoose = require('mongoose');

var dbName = "quizzerDB";
var questions = require('./Questions');

var Question = require('./models/Question');

mongoose.connect('mongodb://localhost/' + dbName, function(){
    Question.remove({}, function(){
        Question.create(questions, function(){
            console.log('done!');
        })
    })
});
