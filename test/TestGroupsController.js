var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);
var user = {}, event = {};
describe('GroupsController', function () {

    console.log('*********************************************************');
    console.log('******** Mocha test result for Group Controller *********');
    console.log('*********************************************************');
    beforeEach(function (done) {
        done();
    });
    before(function (done) {
        agent.post('/doSignin')
            .send({uname: Config.TEST_USER_USERNAME, password: Config.TEST_USER_PW})
            .end(function (err, res) {
                expect(res.body.status.code).to.equal(200);
                expect(res.body).to.be.an('object');
                user = res.body.user;
                done();
            });
    });

    after(function (done) {
        done();
    });

    afterEach(function (done) {
        done();
    });

    describe('function with authentication', function () {

        it('updateGroup', function (done) {
            agent.post('/group/update-description')
                .send({
                    '__description': 'mocha Test skill',
                    '__groupId': '586a2e694467c41218b302c3'
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

    });

});
