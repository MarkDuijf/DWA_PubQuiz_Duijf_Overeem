var expect = require('chai').expect;
var mongoose = require('mongoose');

var Room = require('../models/Room');

var testDbName = 'quizzerDbTest';

describe('Room', function(){

    before(function (done) {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect('mongodb://localhost/' + testDbName, done);
        }
    });

    beforeEach(function(done){
        Room.remove({}, function(err){

        })
        done();
    })

    it('should create a room', function(done){
        Room.create({_id: 'room1', password: '123', teams: [], adminPass: '123', roundNr: 0, questionNr: 0}, function(err){
            expect(err).to.be.null;

            Room.findOne({}, function(err, result) {
                expect(result._id).to.exist;
                expect(result.password).to.exist;
                expect(result.teams).to.exist;
                expect(result.adminPass).to.exist;
                expect(result.roundNr).to.equal(0);
                expect(result.questionNr).to.equal(0);
                done();
            });
        })
    });

    it('should add a team', function(done){
        Room.update({_id: 'room1'}, {
            $push: {
                teams: {
                    teamName: 'team1',
                    score: 0
                }
            }
        }, {upsert: true}, function (err, data) {
            expect(err).to.be.null;
        })

        Room.findOne({}, function(err, result){
            expect(err).to.be.null;
            expect(result.teams.length).to.equal(1);
            done();
        })
    })

    it('should remove a room', function(done){
        Room.create({_id: 'room1', password: '123', teams: [], adminPass: '123', roundNr: 0, questionNr: 0}, function(err){
            expect(err).to.be.null;
            Room.remove({_id: 'room1'}, function(err){
                expect(err).to.be.null
                Room.count({_id: 'room1'}, function(err, result){
                    expect(err).to.be.null;
                    expect(result).to.equal(0);
                    done();
                })
            })
        })
    })
})
