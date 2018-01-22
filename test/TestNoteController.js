var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, note = {}, notes = {};
describe('NoteController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for Note Controller *********');
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

    after(function () {
        agent.post('/notes/delete-note')
            .send({noteId: note._id})
            .end(function (err, res) {
                expect(res.body.code).to.equal(200);
                expect(err).to.be.null;
                done();
            });
    });

    afterEach(function (done) {
        done();
    });

    describe('function with authentication', function () {

        it('addNoteBook', function (done) {
            agent.post('/notes/add-notebook')
                .send({'notebookName': 'mocha Test notebook', 'notebookColor': '#404040', 'isDefault': 1})
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    done();
                });
        });

        it('getNote', function (done) {
            agent.get('/notes/get-note/572934d82c2961636318cfc8')
                .end(function (err, res) {
                    note = res.body.note;
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body.note).to.have.property('_id');
                    expect(res.body.note).to.have.property('notebook_id');
                    expect(res.body.note).to.have.property('user_id');
                    expect(res.body.note).to.be.an('object');
                    done();
                });
        });

        it('getNotes', function (done) {
            agent.get('/notes/get-notes')
                .end(function (err, res) {
                    notes = res.body.notes[1];
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body.notes).to.have.length.above(1);
                    expect(res.body.notes).to.be.an('array');
                    done();
                });
        });

        it('updateNote', function (done) {

            agent.post('/notes/update-note')
                .send({
                    noteId: note._id,
                    noteName: 'updated name from mocha',
                    noteContent: 'updated content from mocha'
                })
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('shareNoteBook', function (done) {

            agent.post('/notes/share-notebook')
                .send({
                    noteBookId: note.notebook_id,
                    userId: [user.id]
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });
        it('getNoteBookSharedUsers', function (done) {

            agent.post('/notebook/shared-users')
                .send({notebook_id: notes.notebook_id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('updateNoteBookSharedPermissions', function (done) {

            agent.post('/notebook/shared-permission/change')
                .send({
                    user_id: note.user_id,
                    notebook_id: note.notebook_id,
                    shared_type: 2
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('removeSharedNoteBookUser', function (done) {

            agent.post('/notebook/shared-user/remove')
                .send({
                    user_id: note.user_id,
                    notebook_id: note.notebook_id
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('updateSharedUsersListColor', function (done) {

            agent.post('/notebook/update/shared-users/colors')
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getNotesSharedUsers', function (done) {

            agent.get('/get-connected-users/'+note.notebook_id+'/'+note.name)
                .set({notebook:note.notebook_id,name:note.name})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('users');
                    expect(res.body.users).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('filterNoteBookSharedUsers', function (done) {

            agent.get('/filter-shared-users/'+note.notebook_id+'/'+note.name)
                .set({notebook:note.notebook_id,name:note.name})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('users');
                    expect(res.body.users).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

    });

});
