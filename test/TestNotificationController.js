var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, notification = {};
describe('NotificationController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for Notification Controller *********');
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

        it('getNotifications', function (done) {
            agent.get('/notifications/get-notifications?pg=1&days=1')
                .end(function (err, res) {
                    notification = res.body.notifications[0];
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('notifications');
                    expect(res.body.notifications).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('updateNotifications', function (done) {
            agent.post('/notifications/update-notifications')
                .send({notification_type:'share_notebook_response',notification_id:notification.notification_id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getDetails', function (done) {
            agent.get('/notifications/get-details?post_id=57205d0ce08536733c26f40b')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('object');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getNotificationCount', function (done) {
            agent.get('/notifications/get-notification-count')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('count');
                    expect(res.body.count).to.be.an('number');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('updateNotebookNotifications', function (done) {
            agent.post('/notifications/notebook-update')
                .send({status:'REQUEST_ACCEPTED',notification_id:notification.notification_id,notebook_id:'572934762c2961636318cfc6',updating_user:user.id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });


    });

});
