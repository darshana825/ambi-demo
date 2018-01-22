var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {};
describe('LifeEventController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for LifeEvent Controller *********');
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
        done();
    });

    afterEach(function (done) {
        done();
    });

    describe('function with authentication', function () {

        it('getLifeEventCategories', function (done) {
            agent.get('/life-event/categories')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('life_event_categories');
                    expect(res.body.life_event_categories).to.be.an('array');
                    done();
                });
        });

        it('getLifeEvents', function (done) {

            agent.get('/life-events')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('life_events');
                    expect(res.body.life_events[0]).to.have.property('name');
                    expect(res.body.life_events[0]).to.have.property('cat_id');
                    expect(res.body.life_events).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });
    });

});
