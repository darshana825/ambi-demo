var express = require('express');
var router = express.Router();

var DefaultController   = require('../controller/DefaultController'),
    UserController      = require('../controller/UserController'),
    PostController      = require('../controller/PostController'),
    SecretaryController = require('../controller/SecretaryController'),
    SkillController     = require('../controller/SkillController'),
    NewsController      = require('../controller/NewsController'),
    ConnectionController = require('../controller/ConnectionController'),
    LifeEventController = require('../controller/LifeEventController'),
    CalendarController = require('../controller/CalendarController'),
    TwilioController = require('../controller/TwilioController');

/**
 * Actual Routes Implementation without Authentication
 */
router.post('/doSignup',UserController.doSignup);
router.get('/secretaries',SecretaryController.getSeretaries);
router.get('/cache-check/:key',SecretaryController.cacheCheck);
router.post('/doSignin', UserController.doSignin);
router.post('/doSignin/mob/', UserController.doMobileApiSignin);
router.post('/dummy', DefaultController.dummy);
router.post('/forgot-password/request/', UserController.forgotPassword);
router.get('/forgot-password/reset/:token', UserController.validateToken);
router.get('/change-password/:token', DefaultController.index);
router.post('/change-password/:token', UserController.resetPassword);
router.get('/life-event/categories', LifeEventController.getLifeEventCategories);
router.get('/life-events', LifeEventController.getLifeEvents);
router.get('/get-users/:name', UserController.getUserSuggestions);
router.get('/check-connection/:uname', ConnectionController.checkConnection);

router.get('/education-info/save', UserController.addEducationDetail);
router.get('/educations/:uname',UserController.retrieveEducationDetail);
router.get('/education-info/delete', UserController.deleteEducationDetail);
router.get('/work-experiences/:uname', UserController.retrieveWorkExperience);
router.get('/user/skills/:uname', UserController.getSkills);
router.get('/user/find', UserController.findByUserName); // probably don't need this route any more, since users can change their user_names. use the id route instsead.
router.get('/user/find/id', UserController.findById);

// Skills CRUD
router.get('/skills/save', SkillController.addSkills);
router.get('/skills', SkillController.getSkills);
router.get('/skill/:id', SkillController.getSkillById);
router.get('/skills/update', SkillController.updateSkill);
router.get('/skills/delete', SkillController.deleteSkill);
//User's skill add / delete
router.post('/collage-and-job/save',UserController.addCollageAndJob);
//News Category / Channel & News Add / Get All & Delete
router.post('/news/add-category', NewsController.addNewsCategory);
router.get('/news/delete-category', NewsController.deleteNewsCategory);
router.post('/news/add-channel', NewsController.addNewsChannel);
router.get('/news/delete-channel', NewsController.deleteNewsChannel);
router.post('/news/add-news', NewsController.addNews);
router.get('/news/get-news/:category/:channel', NewsController.getNews);
router.get('/news/delete-news', NewsController.deleteNews);
router.get('/news/news-categories', NewsController.allNewsCategories);
router.get('/get-profile/:uname',UserController.getProfile);
router.get('/news-info/delete-category', UserController.deleteNewsCategory);
router.get('/news-info/add-channel', UserController.addNewsChannel);
router.get('/news-info/get-channels/:category', UserController.getNewsChannels);
router.get('/news-info/delete-channel', UserController.deleteNewsChannel);
router.post('/news-info/save-article', UserController.saveArticle);
router.get('/news-info/delete-saved-articles', UserController.deleteSavedArticle);
router.get('/pull/posts', PostController.getPost);

router.get('/news-feed', DefaultController.index);
router.get('/notifications', DefaultController.index);
router.get('/news', DefaultController.index);
router.get('/chat', DefaultController.index);
router.get('/chat/:chatWith', DefaultController.index);
router.get('/notes', DefaultController.index);
router.get('/notes/new-note/:notebook_id', DefaultController.index);
router.get('/notes/edit-note/:note_id', DefaultController.index);
router.get('/connections', DefaultController.index);
router.get('/connections/mutual/:uname', DefaultController.index);
router.get('/profile/:name', DefaultController.index);
router.get('/profile/:name/:post', DefaultController.index);
router.get('/calendar', DefaultController.index);
router.get('/calendar/:name', DefaultController.index);
router.get('/groups/:name', DefaultController.index);

router.get('/get-connected-users/:notebook/:name', UserController.getNotesSharedUsers);
router.get('/filter-shared-users/:notebook/:name', UserController.filterNoteBookSharedUsers);

// Twilio generate access token
router.post('/twilio/token/generate', TwilioController.generateAccessToken);

module.exports = router;
