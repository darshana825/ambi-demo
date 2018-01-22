var express = require('express');
var router = express.Router();

var oAuth = require('../middleware/Authentication');

/**
 * Load Models
 */
require('../model/UserModel');
require('../model/SecretaryModel');
require('../model/ConnectionModel');
require('../model/FavouriteNewsCategory');
require('../model/UploadModel');
require('../model/SkillModel');
require('../model/PostModel');
require('../model/NewsModel');
require('../model/SavedArticleModel');
require('../model/NotificationModel');
require('../model/NotificationRecipientModel');
require('../model/NotificationSMSModel');
require('../model/CommentModel');
require('../model/LifeEventModel');
require('../model/LifeEventCategoryModel');
require('../model/LikeModel');
require('../model/NotesModel');
require('../model/NotebookModel');
require('../model/UsersSavedArticle');
require('../model/SubscribedPosts');
require('../model/NewsChannelsModel');
require('../model/FolderModel');
require('../model/FolderDocsModel');
require('../model/CalendarEventModel');
require('../model/CallModel');
require('../model/GroupsModel');
require('../model/GroupFolderModel');
require('../model/GroupFolderDocsModel');
require('../model/WorkModeModel');
require('../model/SubscribedNews');

/** Load  Controllers
 */
var DefaultController = require('../controller/DefaultController'),
  UserController = require('../controller/UserController'),
  NewsChannelController = require('../controller/NewsChannelController'),
  NewsController = require('../controller/NewsController'),
  PostController = require('../controller/PostController'),
  CommentController = require('../controller/CommentController'),
  UploadController = require('../controller/UploadController'),
  ConnectionController = require('../controller/ConnectionController'),
  LikeController = require('../controller/LikeController'),
  NotesController = require('../controller/NotesController'),
  NotificationController = require('../controller/NotificationController'),
  NotificationSMSController = require('../controller/NotificationSMSController'),
  FolderController = require('../controller/FolderController'),
  CalendarController = require('../controller/CalendarController'),
  CallCenterController = require('../controller/CallCenterController'),
  GroupsController = require('../controller/group/GroupsController'),
  GroupNotebookController = require('../controller/group/GroupNotebookController'),
  GroupFolderController = require('../controller/group/GroupFolderController'),
  WorkModeController = require('../controller/WorkModeController');
SubscribedNewsController = require('../controller/SubscribedNewsController');


/**
 * Define Public URLs
 * this public urls will load without authentication component.
 * Basically those URLs will be site assets.
 * This URL can be image, Stylesheet, Javascript file
 */
GLOBAL.publicURLs = ['/images', '/css', '/web', '/fonts', '/js'];


/**
 * This urls should be outside login. if user logged-in can't see these pages
 */
GLOBAL.notAuthURLs = ['/sign-up', '/forgot-password', '/change-password-invalid', '/changed-password']


/**
 * This urls are related to api and will be authenticated separately
 */
GLOBAL.mobileApiUrls = ['/api/connections/get', '/api/upload/cover-image'];


/**
 *This URLs will be normal URL that execute out side the authentication component.
 * this URL can be accessed through web browser without login
 */
GLOBAL.AccessAllow = [
  '/', '/choose-secretary', '/doSignup', '/doSignin/mob/', '/secretaries', '/about-you', '/establish-connections', '/news-categories',
  '/profile-image', '/done', '/cache-check', '/collage-and-job', '/test/:id', '/news-feed', '/news', '/chat', '/chat/:chatWith', '/notes', '/notifications', '/notes/new-note/:notebook_id',
  '/notes/edit-note/:note_id', '/connections', '/profile/:name', '/profile/:name/:post', '/folders', '/doc', '/get-connected-users/', '/work-mode',
  '/get-connected-users/:notebook/:name', '/filter-shared-users/:notebook/:name', '/news/channels/:category_id', '/news/channels/:category_id/:channel_name',
  '/calendar/:name', '/calendar', '/groups', '/groups/:name'
];

/**
 * Push All Rqurst through oAuth
 */
router.all('/*', oAuth.Authentication);


/**
 * Implement Actual Routes that need to Authenticate
 */

// User related
router.get('/introduction/:uname', UserController.retrieveIntroduction);
router.get('/get-folder-users/:folder/:name', UserController.getFolderUsers);
router.get('/get-folder-users/:folder', UserController.getFolderUsers);

router.get('/connections/get', UserController.getConnections);
router.get('/connection/count', UserController.connectionCount);

router.get('/user/get-user-suggestions/:name', UserController.getUserSuggestions);
router.get('/news-info/get-saved-articles', UserController.getSavedArticles);
router.post('/secretary/save', UserController.saveSecretary);
router.post('/general-info/save', UserController.saveGeneralInfo);
router.post('/connect-people', UserController.connect);
router.post('/addNewsCategory', UserController.addNewsCategory);
router.post('/upload/profile-image', UserController.uploadProfileImage);
router.post('/upload/cover-image', UserController.uploadCoverImage);
router.post('/education/update', UserController.updateEducationDetail);
router.post('/work-experience/update', UserController.updateWorkExperience);
router.post('/skill-info/save', UserController.saveSkillInfo);
router.post('/introduction/update', UserController.updateIntroduction);
router.post('/account-info/update', UserController.updateAccountInfo);
router.post('/background/update', UserController.updateBackgroundImage);
router.post('/settings/update', UserController.updateSettings);
router.post('/widgets/update', UserController.updateWidgets);
router.post('/widgets/countdown/update', UserController.updateCountdownWidget);
router.post('/widgets/daily_interest/update', UserController.updateDailyInterest);

// Post
router.post('/post/composer', PostController.addPost);
router.post('/post/share', PostController.sharePost);
router.post('/post/profile-image-post', PostController.profileImagePost);
router.post('/post/delete', PostController.deletePost);

// Comment
router.post('/comment/composer', CommentController.addComment);
router.get('/pull/comments', CommentController.getComment);
router.post('/comment/delete', CommentController.deleteComment);

// Upload
router.post('/upload/image', UploadController.uploadImage);
router.post('/ajax/upload/image', UploadController.uploadTimeLinePhoto);
router.post('/ajax/upload/video', UploadController.uploadTimeLineVideo);
router.post('/ajax/upload/folderDoc', UploadController.uploadFolderDocument);


//CONNECTIONS
router.post('/connection/requests', ConnectionController.getRequestedConnections);
router.get('/connection/me', ConnectionController.getMyConnections);
router.get('/connection/search/:q', ConnectionController.searchConnection);
router.get('/connection/get/:q', ConnectionController.getConnections);
router.get('/connection/me/sort/:option', ConnectionController.getMySortedConnections);
router.get('/connection/me/unfriend', ConnectionController.getMyConnectionsBindUnfriendConnections);
router.get('/connection/get-mutual/', ConnectionController.getMutualConnections);
router.post('/connection/accept', ConnectionController.acceptFriendRequest);
router.post('/connection/decline', ConnectionController.declineFriendRequest);
router.post('/connection/unfriend', ConnectionController.unfriendUser);

router.get('/connection/suggestion', ConnectionController.getFriendSuggestion);
router.post('/connection/send-request', ConnectionController.sendFriendRequest);
router.post('/connection/skip-request', ConnectionController.getUniqueFriendRequest);

//NEWS
// router.get('/news/get-channels/:category', NewsController.getNewsChannels);
router.get('/news/get-categories', NewsController.getNewsCategories);
// router.post('/user/news/add-category', NewsController.addToFavourite);
router.get('/news/get/my/news-articles', NewsController.getMyNews);
router.post('/news/articles/save', NewsController.saveMyNews);
router.get('/news/saved/articles', NewsController.getSavedArticles);
// router.post('/news/user-channel/composer', NewsController.addChannelByUser);
// router.post('/news/user-channel/remove', NewsController.removeChannelByUser);
// router.get('/news/channels/:category_id', NewsChannelController.getChannelByCategory);
// router.get('/news/channels/:category_id/:channel_name', NewsChannelController.searchChannelForCategory);

//Subscribed News
router.get('/news/get-subscribed/topics', SubscribedNewsController.getSubscribedNewsTopics);
router.post('/news/subscribe/topics', SubscribedNewsController.subscribeToNewsTopics);
router.post('/news/unsubscribe/topics', SubscribedNewsController.unsubscribeNewsTopic);
router.post('/news/user-channel/composer', SubscribedNewsController.addNewsChannels);
router.post('/news/user-channel/remove', SubscribedNewsController.removeNewsChannels);
router.get('/news/user-channel/get', SubscribedNewsController.getSubscribedNewsChannel);

// Like
router.post('/like/composer', LikeController.doLike);

// Notes
router.post('/notes/add-notebook', NotesController.addNotebook);
router.post('/notes/share-notebook', NotesController.shareNoteBook);
router.post('/notes/add-note', NotesController.addNote);
router.get('/notes/get-notes', NotesController.getAllNotebooks);
router.get('/notes/get-note/:note_id', NotesController.getNote);
router.post('/notebook/shared-users', NotesController.getSharedUsers);
router.post('/notebook/shared-permission/change', NotesController.updateNoteBookSharedPermissions);
router.post('/notebook/shared-user/remove', NotesController.removeSharedNoteBookUser);
router.post('/notebook/update/shared-users/color', NotesController.updateSharedUsersListColor);
router.post('/notebook/delete', NotesController.deleteNotebook);
router.post('/notes/update-note', NotesController.updateNote);
router.post('/notes/delete-note', NotesController.deleteNote);

// Notification
// router.get('/notifications/get-notifications',NotificationController.getNotifications);
router.get('/notifications/get-notifications', NotificationController.getNotificationsList);
router.get('/notifications/get-notifications/category', NotificationController.getNotificationsList);
router.post('/notifications/update-notifications', NotificationController.updateNotifications);
router.post('/notifications/notebook-update', NotificationController.updateNotebookNotifications);
router.post('/notifications/set-notification-sms', NotificationSMSController.setNotificationSMS);
router.get('/notifications/get-details', NotificationController.getDetails);
router.get('/notifications/get-notification-count', NotificationController.getNotificationCount);
router.post('/notifications/folder-update', NotificationController.updateFolderNotifications);

// Folder
router.get('/folders/get-count', FolderController.getCount);
router.post('/folders/add-new', FolderController.addNewFolder);
router.get('/folders/get-all', FolderController.getFolders);
router.post('/folders/shared-users', FolderController.getSharedUsers);
router.post('/folders/share-folder', FolderController.shareFolder);
router.post('/folder/shared-user/remove', FolderController.removeSharedFolderUser);
router.post('/folder/remove', FolderController.deleteFolder);
router.post('/folder/shared-permission/change', FolderController.updateFolderSharedPermission);
router.post('/document/remove', FolderController.deleteDocument);
router.get('/folder/search/:is_group/:q', FolderController.searchFolder);
router.get('/folder/get-folder/:folder_id', FolderController.getAFolder);
router.get('/folder/get-document/:folder_id/:document_id', FolderController.getAFolder);


// Calender
router.get('/calendar/month/all', CalendarController.getAllForSpecificMonth);
router.get('/calendar/shared_users', CalendarController.getEventSharedUsers);
router.get('/calendar/events/date_range', CalendarController.getAllForDateRange);
router.post('/calendar/event/add', CalendarController.addEvent);
router.post('/calendar/day/all', CalendarController.getEventsForSpecificDay);
router.post('/calendar/update', CalendarController.updateEvent);
router.post('/calendar/remove/share_user', CalendarController.removeSharedEventUser);
router.post('/calendar/notification/respond', CalendarController.respondToNotification);
router.post('/calendar/task/respond', CalendarController.respondToTask);
router.get('/calendar/task/new-list', CalendarController.getNewTasks);
router.get('/calendar/task/priority-list', CalendarController.getPriorityList);

router.post('/calendar/event/completion', CalendarController.updateEventCompletion);
router.post('/calendar/shared/event/completion', CalendarController.updateSharedEventCompletion);
router.post('/calendar/event/get', CalendarController.getEvent);
router.post('/calendar/delete', CalendarController.deleteCalendarEvent);
router.get('/calendar/suggest-users/:calendar_type/:list_type/:group_id/:q', CalendarController.suggestUsers);

// Call Center
router.get('/callcenter', DefaultController.index);
router.get('/contacts/all', CallCenterController.contact.getAll);
router.post('/contact/group-members', CallCenterController.contact.getGroupMembers);
router.get('/call/get-records', CallCenterController.call.getCallRecords);
router.post('/call/add-record', CallCenterController.call.addCallRecord);
router.post('/me/update/user-mode', CallCenterController.me.updateMode);
router.post('/contact/caller', CallCenterController.contact.getContact);
router.post('/call/update-record', CallCenterController.call.updateCallRecord);

// Twilio


//Group
router.post('/groups/add', GroupsController.createGroup);
router.post('/groups/update-description', GroupsController.updateDescription);
router.post('/groups/add-members', GroupsController.addMembers);
router.post('/groups/upload-image', GroupsController.uploadGroupProfileImage);
router.post('/groups/get-group', GroupsController.getGroup);
router.post('/groups/get-groups', GroupsController.getGroups);
router.post('/groups/get-members', GroupsController.getMembers);
router.post('/groups/update/member-status', GroupsController.updateGroupMemberStatus);

// Group Notebook
router.post('/group/add-notebook', GroupNotebookController.addNewNotebook);
router.post('/group/remove-member', GroupsController.removeMember);


// Group Folder
router.post('/group-folders/add-new', GroupFolderController.addNewFolder);
router.get('/group-folders/get-all/:group_id', GroupFolderController.getFolders);
router.get('/group-folders/count/:group_id', GroupFolderController.getGroupFolderCount);
router.get('/group-folders/all', GroupFolderController.getAllGroupFolders);
router.get('/group-folder/search/:group_id/:q', FolderController.searchGroupFolder);


// work-mode
router.post('/work-mode/add', WorkModeController.set.workMode);
router.get('/work-mode/get', WorkModeController.get.userActiveWorkMode); //add queryParam "_user_id" to get unique user work mode data
router.get('/work-mode/update', WorkModeController.update.workMode);

module.exports = router;
