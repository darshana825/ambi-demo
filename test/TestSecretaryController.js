var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, education = {}, work = {};
describe('SecretaryController', function () {

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

    describe('Secretary', function () {
        it('getSeretaries', function (done) {
            agent.get('/secretaries')
                .end(function (err, res) {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });

        it('cacheCheck', function (done) {
            agent.get('/cache-check/post:like:576d10313201742f40368fbc')
                .end(function (err, res) {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.be.an('object');
                    done();
                });
        });

    });

});
