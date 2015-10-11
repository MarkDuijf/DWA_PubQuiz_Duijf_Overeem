var mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    password: {type: String, required: true},
    teams: [{teamName: String, score: Number}],
    adminPass: {type: String, required: true},
    roundNr: {type: Number, required: true},
    questionNr: {type: Number, max: 12}
})

module.exports = mongoose.model('Room', roomSchema);

