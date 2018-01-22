import React from 'react'
import ReactDom from 'react-dom'
import {Router, Route, browserHistory} from 'react-router'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';

import thunk from 'redux-thunk';
import rootReducer from './pages/notes/reducers/index';

import Main from './pages/main';
import SignupIndex from './pages/signup/Index';
import SelectSecretary  from './pages/signup/SelectSecretary';
import CalenderIndex from './pages/calender/Index';

import ProfileIndex  from './pages/profile/Index';

import ForgotPassword from './pages/signup/ForgotPassword';
import ChangePassword from './pages/signup/ChangePassword';
import ChangePasswordInvalid from './pages/signup/ChangePasswordInvalid';
import ChangedPassword from './pages/signup/ChangedPassword';
import Connection  from './pages/connection/Index';
import NewsSettings from './pages/news/NewsSettings';
import ChatIndex from './pages/chat/Index';
import CallcenterIndex from './pages/callcenter/Index';
import NewsIndex from './pages/news/Index';
import NotesIndex from './pages/notes/Index';
import FoldersIndex from './pages/folders/Index';
import DocIndex from './pages/doc/Index';
import NotificationsIndex from './pages/notifications/Index';
import WorkmodeIndex from './pages/workmode/Index';
import MutualConnections  from './pages/connection/MutualConnections';
import GroupsIndex from './pages/groups/Index';
import GroupsLayout from './pages/groups/GroupsLayout';


let rootRoute = (
    <Route name="main" path="/" component={Main} state="1">
        <Route name="signupIndex" path="/sign-up" component={SignupIndex}/>
        <Route name="choose-secretary" path="/choose-secretary" component={SignupIndex}/>
        <Route name="about-you" path="/about-you" component={SignupIndex}/>
        <Route name="establish-connections" path="/establish-connections" component={SignupIndex}/>
        <Route name="news-categories" path="/news-categories" component={SignupIndex}/>
        <Route name="profile-image" path="/profile-image" component={SignupIndex}/>
        <Route name="collage-and-job" path="/collage-and-job" component={SignupIndex}/>

        /**
         * Profile Route
         */
        <Route name="profile" path="/profile/:uname/connections" component={Connection}/>
        <Route name="profile" path="/profile/:uname" component={ProfileIndex}/>
        <Route name="profile" path="/profile/:uname/:post" component={ProfileIndex}/>

        <Route name="forgot-password" path="/forgot-password" component={ForgotPassword}/>
        <Route name="change-password" path="/change-password/:token" component={ChangePassword}/>
        <Route name="change-password-invalid" path="/change-password-invalid" component={ChangePasswordInvalid}/>
        <Route name="changed-password" path="/changed-password" component={ChangedPassword}/>

        <Route name="chats-video" path="/chat" component={ChatIndex}/>
        <Route name="new-chat" path="/chat/:chatWith" component={ChatIndex}/>


        /**
         * Calender
         */
        <Route name="calendar" path="/calendar" component={CalenderIndex}/>
        <Route name="calendar" path="/calendar/:name" component={CalenderIndex}/>


        /**
         * Connection Route
         */

        <Route name="connections" path="/connections" component={Connection}/>


        /**
         * News
         */

        <Route name="news-feed" path="/news-feed" component={NewsIndex}/>
        <Route name="news" path="/news" component={NewsSettings}/>

        /**
         * Notes
         */

        <Route name="notes" path="/notes" component={NotesIndex}/>
        <Route name="notes" path="/notes/:name" component={NotesIndex}/>

        /**
         * Notifications
         */

        <Route name="notifications" path="/notifications" component={NotificationsIndex}/>

        /**
         * Folders
         */

        <Route name="folders" path="/folders" component={FoldersIndex}/>

        /**
         * Docs
         */

        <Route name="doc" path="/doc" component={DocIndex}/>

        /**
         * Callcenter
         */

        <Route name="callcenter" path="/callcenter" component={CallcenterIndex}/>

       /* <Route name="callcenter" path="/callcenter" handler={()=><CallcenterIndex />}/> */

        /**
         * Groups
         */
        <Route name="groups" path="/groups" component={GroupsIndex}/>
        <Route name="groups" path="/groups/:name" component={GroupsLayout}/>

        /**
         * Workmode
         */

        <Route name="workmode" path="/work-mode" component={WorkmodeIndex}/>

    </Route>
);

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

ReactDom.render((
  <Provider store={createStoreWithMiddleware(rootReducer)}>
    <Router history={browserHistory} routes={rootRoute}/>
  </Provider>


), document.getElementById('proglob-app-container'));
