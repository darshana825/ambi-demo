var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, post = {},profile_post={}, comment = {};
describe('Main Controller Head', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for Post, Like and Comment Controller *********');
    console.log('********************************************************');

    beforeEach(function (done) {
        done();
    });
    before(function (done) {
        agent.post('/doSignin')
            .send({uname: 'tests+151@eight25media.com', password: '123456'})
            .end(function (err, res) {
                expect(res.body.status.code).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('user');
                expect(res.body.user).not.to.be.empty;
                user = res.body.user;
                done();
            });
    });
    after(function (done) {
        agent.post('/post/delete')
            .send({
                __post_id: post.post_id
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

        it('addPost', function (done) {
            agent.post('/post/composer')
                .send({
                    __hs_attachment: false,
                    __content: 'moch test content',
                    __on_friends_wall: true,
                    __profile_user_id: user._id,
                    page_link: '',
                    __post_mode: 'NP',
                    __file_content: '',
                    __uuid: '',
                    __lct: 'colombo',
                    __lf_evt: '',
                    __visible_users: []
                })
                .end(function (err, res) {
                    post = res.body.post;
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('post');
                    expect(res.body.post).to.be.an('object');
                    expect(res.body.post).not.to.be.empty;
                    expect(err).to.be.null;
                    expect(res.body.post).to.have.property('post_id');
                    expect(res.body.post).to.have.property('shared_post_id');
                    expect(res.body.post).to.have.property('shared_post');
                    expect(res.body.post.shared_post).to.be.an('object');
                    expect(res.body.post).to.have.property('upload');
                    expect(res.body.post.upload).to.be.an('array');
                    expect(res.body.post).to.have.property('content');
                    expect(res.body.post).to.have.property('post_mode');
                    expect(res.body.post).to.have.property('has_attachment');
                    expect(res.body.post).to.have.property('visible_users');
                    expect(res.body.post.visible_users).to.be.an('array');
                    expect(res.body.post).to.have.property('page_link');
                    expect(res.body.post).to.have.property('location');
                    expect(res.body.post).to.have.property('life_event');
                    expect(res.body.post).to.have.property('date');
                    expect(res.body.post.date).to.be.an('object');
                    //expect(res.body.post).to.have.property('created_by');
                    //expect(res.body.post.created_by).to.be.an('object');
                    //expect(res.body.post).to.have.property('post_owned_by');
                    //expect(res.body.post.post_owned_by).to.be.an('object');
                    done();
                });
        });

        it('getPost', function (done) {
            agent.get('/pull/posts?uname='+user.user_name+'&__own=me&__pg=0')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body).to.have.property('posts');//console.log(JSON.stringify(res.body.posts))
                    expect(res.body.posts).to.be.an('array');
                    expect(res.body.posts[0]).to.have.property('post_id');
                    expect(res.body.posts[0]).to.have.property('has_attachment');
                    expect(res.body.posts[0]).to.have.property('post_mode');
                    expect(res.body.posts[0]).to.have.property('content');
                    expect(res.body.posts[0]).to.have.property('created_by');
                    expect(res.body.posts[0].created_by).to.be.an('object');
                    expect(res.body.posts[0]).to.have.property('post_owned_by');
                    expect(res.body.posts[0].post_owned_by).to.be.an('object');
                    expect(res.body.posts[0]).to.have.property('post_visible_mode');
                    expect(res.body.posts[0]).to.have.property('date');
                    expect(res.body.posts[0].date).to.be.an('object');
                    expect(res.body.posts[0]).to.have.property('location');
                    expect(res.body.posts[0]).to.have.property('lat');
                    expect(res.body.posts[0]).to.have.property('lng');
                    expect(res.body.posts[0]).to.have.property('life_event');
                    expect(res.body.posts[0]).to.have.property('upload');
                    expect(res.body.posts[0].upload).to.be.an('array');
                    expect(res.body.posts[0]).to.have.property('shared_post');
                    expect(res.body.posts[0].shared_post).to.be.an('object');
                    done();
                });
        });

        it('sharePost', function (done) {
            agent.post('/post/share')
                .send({
                    __content: 'moch test content',
                    __pid: post.post_id,
                    __post_mode: 'SP',
                    __own: user.id
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('post');
                    expect(res.body.post).to.be.an('object');
                    expect(res.body.post).not.to.be.empty;
                    expect(err).to.be.null;
                    expect(res.body.post).to.have.property('content');
                    expect(res.body.post).to.have.property('created_by');
                    expect(res.body.post.created_by).to.be.an('object');
                    expect(res.body.post).to.have.property('post_owned_by');
                    expect(res.body.post.post_owned_by).to.be.an('object');
                    expect(res.body.post).to.have.property('post_mode');
                    expect(res.body.post).to.have.property('post_visible_mode');
                    expect(res.body.post).to.have.property('visible_users');
                    expect(res.body.post.visible_users).to.be.an('array');
                    expect(res.body.post).to.have.property('date');
                    expect(res.body.post.date).to.be.an('object');
                    expect(res.body.post).to.have.property('shared_post');
                    expect(res.body.post.shared_post).to.be.an('object');
                    done();
                });
        });

        it('profileImagePost', function (done) {

            agent.post('/post/profile-image-post')
                .send({
                    __hs_attachment: true,
                    __content: '',
                    __post_mode: 'PP',
                    __profile_picture: []
                })
                .end(function (err, res) {
                    profile_post = res.body.post;
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('post');
                    expect(res.body.post).to.be.an('object');
                    expect(res.body.post).not.to.be.empty;
                    expect(err).to.be.null;
                    expect(res.body.post).to.have.property('post_id');
                    expect(res.body.post).to.have.property('shared_post_id');
                    expect(res.body.post).to.have.property('shared_post');
                    expect(res.body.post.shared_post).to.be.an('object');
                    expect(res.body.post).to.have.property('upload');
                    expect(res.body.post.upload).to.be.an('array');
                    expect(res.body.post).to.have.property('content');
                    expect(res.body.post).to.have.property('post_mode');
                    expect(res.body.post).to.have.property('has_attachment');
                    expect(res.body.post).to.have.property('visible_users');
                    expect(res.body.post.visible_users).to.be.an('array');
                    expect(res.body.post).to.have.property('page_link');
                    expect(res.body.post).to.have.property('location');
                    expect(res.body.post).to.have.property('life_event');
                    expect(res.body.post).to.have.property('date');
                    expect(res.body.post.date).to.be.an('object');
                    expect(res.body.post).to.have.property('created_by');
                    expect(res.body.post.created_by).to.be.an('object');
                    expect(res.body.post).to.have.property('post_owned_by');
                    expect(res.body.post.post_owned_by).to.be.an('object');
                    done();
                });
        });
    });

    describe('LikeController function', function () {

        it('doLike', function (done) {
            agent.post('/like/composer')
                .send({
                    __post_id: post.post_id
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body.like).to.have.property('post_id');
                    expect(res.body.like).to.have.property('user_id');
                    expect(res.body.like).to.be.an('object');
                    expect(res.body.like).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });
    });

    describe('CommentController function', function () {

        it('addComment', function (done) {
            agent.post('/comment/composer')
                .send({
                    __post_id: post.post_id, __content: 'mocha test comment', __img: ''
                })
                .end(function (err, res) {
                    comment = res.body.comment;
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('comment');
                    expect(res.body.comment).to.have.property('post_id');
                    expect(res.body.comment).to.have.property('user_id');
                    expect(res.body.comment).to.have.property('comment');
                    expect(res.body.comment).to.be.an('object');
                    expect(res.body.comment).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getComment', function (done) {
            agent.get('/pull/comments?__post_id=' + post.post_id)
                .send({__post_id: post.post_id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('comments');
                    expect(res.body.comments).to.be.an('object');
                    expect(res.body.comments).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });
    });

});
