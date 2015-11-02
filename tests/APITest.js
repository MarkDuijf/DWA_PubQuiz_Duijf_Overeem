var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('../server');
var agent = supertest.agent(app);
var Room = require('../models/Room');
var mongoose = require('mongoose');

var testDbName = 'quizzerDbTest';

mongoose.connect('mongodb://localhost/' + testDbName, function() {

    describe('Als een team een room wilt joinen', function(){

        it('verkeerd wachtwoord weigeren', function (done) {
            var login = {
                teamName: '',
                roomPass: '',
                roomId: '1'
            };
            Room.remove({}, function (err) {

            });

            Room.create({
                _id: '1',
                password: '123',
                teams: [{teamName: 'hallo', score: 0}],
                adminPass: '123',
                roundNr: 0,
                questionNr: 0
            }, function () {
                agent
                    .post('/participant/joinRoom')
                    .send(login)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /text\/html/)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.text).to.equal('the password was incorrect!');
                        done();
                    });
            });
        });

        it('moet een gekozen teamnaam weigeren', function (done) {
            var login = {
                teamName: "hallo",
                roomPass: '123',
                roomId: '1'
            };
            Room.remove({}, function (err) {

            });

            Room.create({
                _id: '1',
                password: '123',
                teams: [{teamName: 'hallo', score: 0}, {teamName: 'hoi', score: 0}],
                adminPass: '123',
                roundNr: 0,
                questionNr: 0
            }, function (err) {
                agent
                    .post('/participant/joinRoom')
                    .send(login)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        expect(res.text).to.equal('this teamname already exists!');
                        done();
                    });
            });
        });
    });

    describe('Als een host een room aanmaakt', function() {

        it('moet een verkeerd wachtwoord geweigerd worden', function (done) {
            var loginHost = {
                roomName: '1',
                adminPass: '321'
            };
            Room.remove({}, function (err) {

            });

            Room.create({
                _id: '1',
                password: '123',
                teams: [{teamName: 'hallo', score: 0}],
                adminPass: '123',
                roundNr: 0,
                questionNr: 0
            }, function (err) {
                agent
                    .post('/host/hostAuthentication')
                    .send(loginHost)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /text\/html/)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.text).to.equal('you are not the host!');
                        done();
                    });
            });
        });
    });

    describe('Als een host een room afsluit', function() {

        it('moet de room verwijderd worden', function (done) {
            var deleteRoomHost = {
                roomId: '1'
            };
            Room.remove({}, function (err) {

            });

            Room.create({
                _id: '1',
                password: '123',
                teams: [{teamName: 'hallo', score: 0}],
                adminPass: '123',
                roundNr: 0,
                questionNr: 0
            }, function () {
                agent
                    .post('/host/endQuiz')
                    .send(deleteRoomHost)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /text\/html/)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.text).to.equal('Room deleted!');
                        done();
                    });
            });
        });
    });

});