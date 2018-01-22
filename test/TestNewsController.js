var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, category = {}, channel = {}, news ={};
describe('NewsController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for News Controller *********');
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
        //it('removeChannelByUser', function (done) {
        //    agent.get('/news/user-channel/remove')
        //        .send({'__channel_id': channel._id})
        //        .end(function (err, res) {
        //            expect(res.body.code).to.equal(200);
        //            expect(err).to.be.null;
        //            done();
        //        });
        //});
        //
        //it('deleteNews', function (done) {
        //    agent.get('/news/delete-news/')
        //        .set({'categoryId': category._id,'channelId':channel._id,'articleId':news._id})
        //        .end(function (err, res) {
        //            expect(res.body.code).to.equal(200);
        //            expect(err).to.be.null;
        //            done();
        //        });
        //});
        //it('deleteNewsCategory', function (done) {
            agent.get('/news/delete-category')
                .set({'categoryId': category._id})
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    expect(err).to.be.null;
                    done();
                });
        //});

        //it('deleteNewsChannel', function (done) {
        //    agent.get('/news/delete-channel')
        //        .set({'categoryId': category._id,'channelId':channel._id})
        //        .end(function (err, res) {
        //            expect(res.body.code).to.equal(200);
        //            expect(err).to.be.null;
        //            done();
        //        });
        //});
        done();
    });
    afterEach(function (done) {
        done();
    });

    describe('News category', function () {

        it('addNewsCategory', function (done) {
            agent.post('/news/add-category')
                .send({'categoryImg': 'category_img.jpg', 'categoryName': 'First News category'})
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    done();
                });
        });

        it('getNewsCategories', function (done) {
            agent.get('/news/get-categories')
                .end(function (err, res) {
                    category = res.body.news[0];
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('news');
                    expect(res.body.news).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });



    });

    describe('News Channel', function () {

        it('addNewsChannel', function (done) {
            agent.post('/news/add-channel')
                .send({'categoryId': category._id, 'channelName': 'First News channel', channelUrl:'http://feeds.feedburner.com/TechCrunchIT',channelImage:'first_channel.jpg'})
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    done();
                });
        });

        it('getNewsChannels', function (done) {
            agent.get('/news/get-channels/'+category._id)
                .end(function (err, res) {
                    channel = res.body.news_list[0].channels[0];
                    expect(res.body.status).to.equal(200);
                    expect(res.body).to.have.property('news_list');
                    expect(res.body.news_list).to.be.an('array');
                    expect(err).to.be.null;
                    done();
                });
        });

        it('getChannelByCategory', function (done) {
            agent.get('/news/channels/'+category._id)
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body).to.have.property('channels');
                    expect(res.body.channels).to.be.an('array');
                    expect(res.body.channels).not.to.be.empty;
                    done();
                });
        });

        it('searchChannelForCategory', function (done) {
            agent.get('/news/channels/'+category._id+channel.name)
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(err).to.be.null;
                    expect(res.body).to.have.property('channels');
                    done();
                });
        });
    });

    describe('News', function () {

        it('addNews', function (done) {
            agent.post('/news/add-news')
                .send({'categoryId': category._id, channelId:channel._id,'articleHeading': 'First article heading', articleContent:'http://feeds.feedburner.com/TechCrunchIT',articleImage:'first_channel.jpg','articleDate':"2016-05-03T23:29:58.527Z"})
                .end(function (err, res) {
                    expect(res.status).to.equal(200);
                    done();
                });
        });

        it('getNews', function (done) {
            agent.get('/news/get-news/'+category._id+'/'+channel._id)
                .end(function (err, res) {
                    news = res.body;
                    expect(res.body.status).to.equal(200);
                    expect(res.body).to.have.property('news_list');
                    expect(res.body.news_list).to.be.an('array');
                    expect(res.body.news_list).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });
    });

    describe('Favourite', function () {

        it('addToFavourite', function (done) {
            agent.post('/user/news/add-category')
                .send({'nw_cat_id': category._id})
                .end(function (err, res) {
                    expect(res.status).to.equal(200);
                    done();
                });
        });

        it('getMyNews', function (done) {
            agent.get('/news/get/my/news-articles')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('news');
                    expect(res.body.news).to.be.an('array');
                    expect(res.body.news).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });

        it('saveMyNews', function (done) {
            agent.post('/news/articles/save')
                .send({channel:channel._id,'heading': 'First article heading','article_date':"2016-05-03T23:29:58.527Z"})
                .end(function (err, res) {
                    expect(res.status).to.equal(200);
                    done();
                });
        });

        it('getSavedArticles', function (done) {
            agent.get('/news/saved/articles')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('news_list');
                    expect(res.body.news_list).to.be.an('array');
                    expect(res.body.news_list).not.to.be.empty;
                    expect(err).to.be.null;
                    done();
                });
        });

        it('addChannelByUser', function (done) {
            agent.post('/news/user-channel/composer')
                .send({__channel_id:channel._id,'__category_id':category._id})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });
    });

});
