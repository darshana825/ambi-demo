var express = require('express');
var router = express.Router(),
    TestController   = require('../controller/TestController');

var TestPostController          = require('../test/previous_test/TestPostController'),
    TestConnectionController    = require('../test/previous_test/TestConnectionController'),
    TestCommentController    = require('../test/previous_test/TestCommentController'),
    TestSessionController   =   require('../test/previous_test/TestSessionController'),
    NotificationSMSController     = require('../controller/NotificationSMSController');

/**
 * Implement All Test Routs from there
 * All below routes has /test part in the beginning of the route
 * Ex: /get-uploaded-images/:id  should be  /test/get-uploaded-images/:id
 */

router.get('/uploads', TestController.uploadTest);
router.get('/get-uploaded-images/:id', TestController.getImageTest);
router.get('/send-mail', TestController.sendMailTest);
router.get('/get-profile/:id', TestController.getProfile);
router.get('/get-education/:uname', TestController.retrieveEducationDetail);
router.get('/get-workexp/:uname', TestController.retrieveWorkExperience);
router.post('/add-post/:id', TestPostController.addPost);
router.get('/get-post/:id/:page', TestPostController.ch_getPost);
router.get('/es/create-index/:id', TestController.esCreateIndex);
router.get('/es/search', TestController.esSearch);
router.get('/get-connections/:id', TestConnectionController.getConnection);
router.get('/get-friend-requests/:id', TestConnectionController.getFriendRequests);
router.post('/accept-friend-requests/:id', TestConnectionController.acceptFriendRequest);
router.get('/my-connections/:id/:q',TestConnectionController.myConnections);
router.post('/session',TestSessionController.addToSession);
router.get('/get-session',TestSessionController.getSession);
router.post('/logout',TestSessionController.logout);
router.get('/save-notification', TestController.saveNotification);
router.get('/get-notifications', TestController.getNotifications);
router.get('/update-notification', TestController.updateNotification);
router.post('/comment/add/:id', TestCommentController.addComment);
router.get('/comment/get/:id', TestCommentController.getComment);
router.post('/set-notification-sms', NotificationSMSController.setNotificationSMS);

module.exports = router;
