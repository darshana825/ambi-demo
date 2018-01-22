var request = require('supertest');
var server = require('../app');
var expect = require("chai").expect;

var agent = request.agent(server);  // Using request.agent() is the key
var user = {}, education = {}, work = {};
describe('UserController', function () {

    console.log('********************************************************');
    console.log('******** Mocha test result for User Controller *********');
    console.log('********************************************************');

    beforeEach(function (done) {
        done();
    });
    before(function (done) {
        agent.post('/doSignin')
            .send({uname: 'tests+114@eight25media.com', password: '1234567'})
            .end(function (err, res) {
                user = res.body.user;
                expect(res.body.status.code).to.equal(200);
                expect(res.body).to.be.an('object');
                done();
            });
        //done();
    });
    afterEach(function (done) {
        done();
    });
    after(function (done) {
        done();
    });

    describe('User', function () {
        var rand = Math.round(Math.floor(Math.random() * (100 - 1)) + 1);
        it('doSignup', function (done) {
            agent.post('/doSignup')
                .send({
                    fName: 'mocha fName',
                    lName: 'mocha lName',
                    email: 'tests+1' + rand + '@eight25media.com',
                    password: '123456',
                    status: 7,
                    secretary: '56c19ce0a42948a07f50a8ea'
                })
                .end(function (err, res) {
                    user = res.body.user;
                    expect(res.body.status).to.equal('success');
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('first_name');
                    expect(res.body.user).to.have.property('last_name');
                    expect(res.body.user).to.have.property('user_name');
                    expect(res.body.user).to.have.property('email');
                    expect(res.body.user).to.have.property('status');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('saveSecretary', function (done) {
            agent.post('/secretary/save')
                .send({secretary: '56c19ce0a42948a07f50a8ea'})
                .end(function (err, res) {
                    expect(res.body.status).to.equal('success');
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('secretary_id');
                    expect(res.body.user).to.have.property('secretary_name');
                    expect(res.body.user).to.have.property('secretary_image_url');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('saveGeneralInfo', function (done) {
            agent.post('/general-info/save')
                .send({dob: "2016-05-03T23:29:58.527Z", country: 'USA', zip: '10001'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('dob');
                    expect(res.body.user).to.have.property('country');
                    expect(res.body.user).to.have.property('zip_code');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('addCollageAndJob', function (done) {
            agent.post('/collage-and-job/save')
                .send({school: "ZCK", grad_date: "2016-05-03T23:29:58.527Z", job_title: 'SE', company_name: 'USA'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('school');
                    expect(res.body.user).to.have.property('company_name');
                    expect(res.body.user).to.have.property('job_title');
                    expect(res.body.user).to.have.property('grad_date');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('getConnections', function (done) {
            agent.get('/connections/get')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('connections');
                    expect(res.body.connections).to.be.an('array');
                    // expect(res.body.connections).not.to.be.empty;
                    done();
                });
        });

        it('connect', function (done) {
            agent.post('/connect-people')
                .send({
                    connected_users: JSON.stringify(["5757349e2c2961636318cfdd"]),
                    unconnected_users: JSON.stringify([])
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.be.an('object');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('addNewsCategory', function (done) {
            agent.post('/addNewsCategory')
                .send({news_categories: JSON.stringify(["58219183c2e67c14d13c12a3"]), un_selected: JSON.stringify([])})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.be.an('object');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('uploadProfileImage', function (done) {
            agent.post('/upload/profile-image')
                //.attach('profileImg', '/web/dev/profile.jpg')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    //expect(res.body.user).to.have.property('profile_image');
                    //expect(res.body.user.profile_image).not.to.be.empty;
                    done();
                });
        });

        it('uploadCoverImage', function (done) {
            agent.post('/upload/cover-image')
                .attach('cover_img', './profile.jpg')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('cover_image');
                    expect(res.body.user.cover_image).not.to.be.empty;
                    done();
                });
        });

        it('addEducationDetail', function (done) {
            agent.get('/education-info/save')
                .set({
                    school: "Middlesex",
                    date_attended_from: "2007",
                    date_attended_to: "2010",
                    degree: "BSc in IT",
                    grade: "Merit",
                    activities_societies: "Debate Team",
                    description: "It was wonderful"
                })
                .end(function (err, res) {
                    expect(res.body.status).to.equal(200);
                    done();
                });
        });

        it('retrieveEducationDetail', function (done) {
            agent.get('/educations/' + user.user_name)
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    education = res.body.user.education_details[0];
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('education_details');
                    done();
                });
        });

        it('updateEducationDetail', function (done) {
            agent.post('/education/update')
                .send({
                    school: "Middlesex",
                    date_attended_from: "2007",
                    date_attended_to: "2010",
                    degree: "BSc in IT",
                    grade: "Merit",
                    activities_societies: "Debate Team",
                    description: "It was wonderful",
                    edu_id: education._id
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('deleteEducationDetail', function (done) {
            agent.get('/education-info/delete')
                .set({_education_id: education._id, _userId: "56c2d6038c920a41750ac4db"})
                .end(function (err, res) {
                    expect(res.body.status).to.equal(200);
                    done();
                });
        });

        it('saveSkillInfo', function (done) {
            agent.post('/skill-info/save')
                .send({
                    "skill_set": JSON.stringify({
                        day_to_day_comforts:{
                            add : [],
                            remove : []
                        },
                        experienced: {
                            add: ["56c43351f468ba8913f3d129", "56c43351f468ba8913f3d12a", "56c44ddefd4ec41e18ab4e6d"],
                            remove: []
                        }
                    })
                })
                .end(function (err, res) {
                    expect(res.body.code).to.equal(200);
                    done();
                });
        });

        it('getSkills', function (done) {
            agent.get('/user/skills/' + user.user_name)
                .set({'uname':user.user_name})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('forgotPassword', function (done) {
            agent.post('/forgot-password/request/')
                .send({email: user.email})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('validateToken', function (done) {
            agent.get('/forgot-password/reset?token=50c091886cc33aa3b8521a2516f871fd4523d83d')
                .end(function (err, res) {
                    expect('Location', '/change-password/50c091886cc33aa3b8521a2516f871fd4523d83d');
                    done();
                });
        });

        it('resetPassword', function (done) {
            agent.post('/change-password/50c091886cc33aa3b8521a2516f871fd4523d83d')
                .send({password:1234567})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        /**
         *
         * ERROR in development
         *
         * it('connectionCount', function (done) {
            agent.get('/connection/count')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });*/

        it('getProfile', function (done) {
            agent.get('/get-profile/' + user.user_name)
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('profile_data');
                    expect(res.body.profile_data).not.to.be.empty;
                    expect(res.body.err).to.be.empty;
                    done();
                });
        });

        /**
         *
         * ERROR in development
         *
         * it('saveArticle', function (done) {
            agent.post('/news-info/save-article')
                .send({
                    "saved_articles": JSON.stringify({
                        "user_id": '57225c89e08536733c26f428',
                        "article": '5777c116d480387d3e59abb2'
                    })
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });*/

        it('retrieveWorkExperience', function (done) {
            agent.get('/work-experiences/' + user.user_name)
                .end(function (err, res) {
                    work = res.body.user.working_experiences[0];
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).not.to.be.empty;
                    expect(res.body.user).to.have.property('working_experiences');
                    done();
                });
        });

        it('updateWorkExperience', function (done) {
            agent.post('/work-experience/update')
                .send({
                    exp_id: work.exp_id,
                    company_name: "E25M",
                    title: "SE",
                    location: "Colombo",
                    fromYear: "2007",
                    fromMonth: "10",
                    toYear: '2010',
                    toMonth: '12',
                    is_current_work_place: true,
                    description: 'testing'
                })
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('doMobileApiSignin', function(done){
            agent.post('/doSignin/mob/')
                .send({uname: 'tests+114@eight25media.com', password: '1234567'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });

        });

        it('updateIntroduction', function (done) {
            agent.post('/introduction/update')
                .send({introText: 'sample intro text'})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    done();
                });
        });

        it('retrieveIntroduction', function (done) {
            agent.get('/introduction/' + user.user_name)
                .set({'uname': user.user_name})
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property('introduction');
                    expect(res.body.user).not.to.be.empty;
                    done();
                });
        });

        it('getUserSuggestions', function (done) {
            agent.get('/user/get-user-suggestions/an')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('suggested_users');
                    expect(res.body.suggested_users).to.be.an('array');
                    done();
                });
        });

        it('getNotesSharedUsers', function (done) {
            agent.get('/get-connected-users/5791c78d936774c249b86d09/an')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('users');
                    expect(res.body.users).to.be.an('array');
                    done();
                });
        });

        it('getFolderUsers', function (done) {
            agent.get('/get-folder-users/5846289a63fd10f70ce7c3e8/an')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('users');
                    expect(res.body.users).to.be.an('array');
                    done();
                });
        });

        it('filterNoteBookSharedUsers', function (done) {
            agent.get('/filter-shared-users/5791c78d936774c249b86d09/an')
                .end(function (err, res) {
                    expect(res.body.status.code).to.equal(200);
                    expect(res.body).to.have.property('users');
                    expect(res.body.users).to.be.an('array');
                    done();
                });
        });

    });


});
