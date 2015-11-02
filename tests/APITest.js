var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('../server');
var agent = supertest.agent(app);

describe('Als een team een room wilt joinen', function(){
    Room.create({_id: '1', password: '123', teams: [{teamName: 'hallo', score: 0}], adminPass: '123', roundNr: 0, questionNr: 0}, function(err){
    expect(err).to.be.null;

        it('verkeerd wachtwoord weigeren', function(done) {
            var login = {
                teamName: '',
                roomPass: '' ,
                roomId: '1'};
            agent
                .post('/participant/joinRoom')
                .send(login)
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect('Content-Type', /text\/html/)
                .end(function(err,res) {
                    expect(err).to.be.null;

                    console.log(res.text);
                    expect(res.text).to.equal('the password was incorrect!');
                    done();
                });
        });

        it('moet een gekozen teamnaam weigeren', function(done) {
            var login = {
                teamName: "hallo",
                roomPass: '1' ,
                roomId: '1'};
            agent
                .post('/participant/joinRoom')
                .send(login)
                .set('Content-Type', 'application/json')
                .expect(404, done)
                .expect('Content-Type', /json/)
                .end(function(err,res) {
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
});



    //xit('should refuse partial submissions', function() {
    //
    //});
    //xit('should refuse complete submission of invalid user credentials', function() {
    //
    //});
});