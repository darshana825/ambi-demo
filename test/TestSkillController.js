var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, education = {}, work = {};
describe('SkillController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for User Controller *********');
    console.log('********************************************************');

    beforeEach(function (done) {
        done();
    });
    before(function (done) {
        done();
    });
    afterEach(function (done) {
        done();
    });
    after(function (done) {
        done();
    });

    describe('Skill', function () {
        it('getSkills', function (done) {
            agent.get('/skills')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('skills');console.log(res.body.skills)
                    expect(res.body.skills).to.be.an('array');
                    done();
                });
        });

        it('getSkillById', function (done) {
            agent.get('/skill/56c43351f468ba8913f3d129')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('skill');
                    expect(res.body.skill).to.be.an('object');
                    done();
                });
        });

    });

});
