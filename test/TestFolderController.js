var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, folder = {};
describe('FolderController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for Folder Controller *********');
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

        it('addNewFolder', function (done) {
            agent.post('/folders/add-new')
                .send({'folder_name': 'mocha Test Folder','folder_color':'#404040',isDefault:true})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('folder_id');
                    done();
                });
        });

        it('getFolders', function (done) {
            agent.get('/folders/get-all')
                .end(function (err, res) {
                    folder = res.body.folders[0];
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('folders');
                    expect(res.body.folders[0]).to.have.property('folder_id');
                    expect(res.body.folders[0]).to.have.property('folder_name');
                    expect(res.body.folders[0]).to.have.property('folder_color');
                    expect(res.body.folders[0]).to.have.property('folder_user');
                    expect(res.body.folders[0]).to.have.property('documents');
                    expect(res.body.folders).to.be.an('array');
                    expect(res.body.folders[0]).to.be.an('object');
                    expect(res.body.folders).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });

        it('shareFolder', function (done) {
            agent.post('/folders/share-folder')
                .send({userId:user.id,folderId:folder.folder_id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getSharedUsers', function (done) {
            agent.post('/folders/shared-users')
                .send({folder_id:folder.folder_id,folder_name:folder.folder_name})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('owner');
                    expect(res.body).to.have.property('sharedWith');
                    expect(res.body.sharedWith).to.be.an('array');
                    expect(res.body.owner).to.be.an('object');
                    expect(res.body.owner).not.to.be.empty;
                    expect(res.body.sharedWith).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });

    });

});
