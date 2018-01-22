var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, skill = {};
describe('SkillController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for Skill Controller *********');
    console.log('********************************************************');

    beforeEach(function (done) {
        done();
    });
    before(function (done) {
        agent.post('/doSignin')
            .send({uname: 'tests@eight25media.com', password: '123456'})
            .end(function (err, res) {
                expect(res.body.status.code).to.equal(200);
                expect(res.body).to.be.an('object');
                user = res.body.user;
                done();
            });
    });

    after(function(done){
        agent.post('/skills/delete')
            .send({
                id: skill._id
            })
            .end(function (err, res) {
                expect(res.body.status.code).to.equal(200);
                expect(err).to.be.null;
                done();
            });
    });

    afterEach(function (done) {
        done();
    });

    describe('function with authentication', function () {

        it('addSkills', function (done) {
            agent.post('/skills/save')
                .send({'name': 'mocha Test skill'})
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    done();
                });
        });

        it('getSkills', function (done) {
            agent.get('/skills')
                .end(function (err, res) {
                    skill = res.body.skill[0];
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body.skill).to.have.property('_id');
                    expect(res.body.skill).to.have.property('name');
                    expect(res.body.skill).to.be.an('object');
                    expect(res.body.skill).not.to.be.empty;
                    done();
                });
        });

        it('getSkillById', function (done) {
            agent.get('/skills/')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body.skill).to.have.length.above(1);
                    expect(res.body.skill).to.be.an('array');
                    expect(res.body.skill).not.to.be.empty;
                    done();
                });
        });

        it('updateSkill', function (done) {

            agent.post('/skills/update')
                .send({
                    Id: skill._id,
                    name: 'updated name from mocha'
                })
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });
    });

});
