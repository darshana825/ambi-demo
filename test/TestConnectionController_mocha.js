var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, connections = {};
describe('ConnectionController', function () {

    console.log('********************************************************');
    console.log('***** Mocha test result for Connection Controller ******');
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

        it('getRequestedConnections', function (done) {
            agent.get('/connection/requests')
                .end(function (err, res) {
                    connections = res.body.req_cons;
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('req_cons');
                    expect(res.body.req_cons).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getMyConnections', function (done) {
            agent.get('/connection/me?q=')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('header');
                    expect(res.body.header).to.be.an('object');
                    expect(res.body).to.have.property('my_con');
                    expect(res.body.my_con).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getMySortedConnections', function (done) {
            agent.get('/connection/me/sort/option=name')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('header');
                    expect(res.body.header).to.be.an('object');
                    expect(res.body).to.have.property('my_con');
                    expect(res.body.my_con).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getMyConnectionsBindUnfriendConnections', function (done) {
            agent.get('/connection/me/unfriend')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('header');
                    expect(res.body.header).to.be.an('object');
                    expect(res.body).to.have.property('my_con');
                    expect(res.body.my_con).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getMutualConnections', function (done) {
            agent.get('/connection/get-mutual/:uid')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('mutual_cons');
                    expect(res.body.mutual_cons).to.be.an('array');
                    expect(res.body).to.have.property('mutual_cons_count');
                    expect(res.body.mutual_cons_count).to.be.an('number');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getFriendSuggestion', function (done) {
            agent.get('/connection/suggestion')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('header');
                    expect(res.body.header).to.be.an('object');
                    expect(res.body).to.have.property('connections');
                    expect(res.body.connections).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('sendFriendRequest', function (done) {
            agent.post('/connection/send-request')
                .send({"connected_users":JSON.stringify(["58328a44a7553d08d4abb223"])})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getUniqueFriendRequest', function (done) {
            agent.post('/connection/skip-request')
                .send({cur_b_ids:JSON.stringify(['5825c0b613751e263231ff53'])})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('checkConnection', function (done) {
            agent.get('/check-connection/'+user.user_name)
                .set({'uname':user.user_name})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('alreadyConnected');
                    expect(res.body).to.have.property('alreadyRequestSent');
                    expect(res.body).to.have.property('alreadyRequestReceived');
                    expect(res.body).to.have.property('profile_user_id');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('unfriendUser', function (done) {
            agent.post('/connection/unfriend')
                .send({sender_id:user.id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('searchConnection', function (done) {
            agent.get('/connection/search/:q')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('suggested_users');
                    expect(res.body.suggested_users).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

    });
});
