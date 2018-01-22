var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, event = {};
describe('CalendarController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for Calendar Controller *********');
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

    after(function (done) {
        done();
    });

    afterEach(function (done) {
        done();
    });

    describe('function with authentication', function () {

        it('addEvent', function (done) {
            agent.post('/calendar/event/add')
                .send({
                    'description': 'mocha Test skill',
                    'type': 'event',
                    apply_date: '2016-11-17',
                    event_time: '10:50:00:000Z',
                    event_timezone: ''
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body.events).to.have.property('user_id');
                    expect(res.body.events).to.have.property('description');
                    expect(res.body.events).to.be.an('object');
                    done();
                });
        });

        it('getAllForSpecificMonth', function (done) {
            agent.get('/calendar/month/all')
                .query({month: '10', year: '2016'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body.events).to.be.an('array');
                    done();
                });
        });

        it('getAllForDateRange', function (done) {
            agent.get('/calendar/events/date_range')
                .query({start_date: '2016-06-01', end_date: '2016-12-31'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body.events).to.be.an('array');
                    done();
                });
        });

        it('getAllForSpecificWeek', function (done) {
            agent.get('/calendar/week/all')
                .query({month: '10', year: '2016', week: '02'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body).to.have.property('week');
                    expect(res.body).to.have.property('days');
                    expect(res.body.events).to.be.an('array');
                    expect(res.body.days).to.be.an('array');
                    done();
                });
        });

        it('getAllEventForCurrentWeek', function (done) {
            agent.get('/calendar/week/current')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body).to.have.property('week');
                    expect(res.body).to.have.property('days');
                    expect(res.body.events).to.be.an('array');
                    expect(res.body.days).to.be.an('array');
                    done();
                });
        });

        it('getAllEventForNextOrPrevWeek', function (done) {
            agent.get('/calendar/week/next_prev')
                .query({date: '2016-11-10', action: 'next'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body).to.have.property('week');
                    expect(res.body).to.have.property('days');
                    expect(res.body.events).to.be.an('array');
                    expect(res.body.days).to.be.an('array');
                    done();
                });
        });

        it('getEventsForSpecificDay', function (done) {
            agent.post('/calendar/day/all')
                .send({day: '2016-11-17'})
                .end(function (err, res) {
                    event = res.body.events[0];
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('events');
                    expect(res.body.events).to.be.an('array');
                    done();
                });
        });

        it('updateEvent', function (done) {

            agent.post('/calendar/update')
                .send({
                    id:event._id,
                    apply_date: '2016-11-10',
                    description: 'update event description',
                    plain_text: 'update event plain_text',
                    event_time: '09:00',
                    shared_users:[user.id]
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('event_time');
                    expect(res.body.event_time).to.be.an('object');
                    expect(res.body.event_time).to.have.property('isTimeChanged');
                    expect(res.body.event_time).to.have.property('event_time');
                    expect(res.body.event_time).to.have.property('passed_event_time');
                    done();
                });
        });

        it('shareEvent', function (done) {
            agent.post('/calendar/event/share')
                .send({'eventId': event._id, 'userId': [user.id]})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('getEventSharedUsers', function (done) {
            agent.get('/calendar/shared_users')
                .query({eventId: event._id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('results');
                    expect(res.body.results[0]).to.have.property('user_name');
                    expect(res.body.results[0]).to.have.property('event_id');
                    expect(res.body.results).to.be.an('array');
                    done();
                });
        });

        //it('removeSharedEventUser', function (done) {
        //    agent.post('/calendar/remove/share_user')
        //        .send({eventId: event._id,userId:user.id})
        //        .end(function (err, res) {
        //            expect(res.body.status.code).to.equal(200);
        //            done();
        //        });
        //});

        it('updateEventSharedStatus', function (done) {
            agent.post('/calendar/update/event_status')
                .send({event_id: event._id,status:'REQUEST_ACCEPTED',updating_user:user.id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('updateEventCompletion', function (done) {
            agent.post('/calendar/event/completion')
                .send({id: event._id,status:'3'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });



        //it('getEvents', function (done) {
        //    agent.get('/folders/get-all')
        //        .end(function (err, res) {
        //            expect(res.body.status.code).to.equal(200);
        //            expect(res.body).to.have.property('folders');
        //            expect(res.body.folders[0]).to.have.property('folder_id');
        //            expect(res.body.folders[0]).to.have.property('folder_name');
        //            expect(res.body.folders[0]).to.have.property('folder_color');
        //            expect(res.body.folders[0]).to.have.property('folder_user');
        //            expect(res.body.folders[0]).to.have.property('documents');
        //            expect(res.body.folders).to.be.an('array');
        //            expect(res.body.folders[0]).to.be.an('object');
        //            expect(res.body.folders).not.to.be.empty;
        //            expect(err).to.be.null;
        //            done();
        //        });
        //});

    });

});
