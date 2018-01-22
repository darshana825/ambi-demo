
import React from 'react';
import { Router, Route } from 'react-router';

import Main from '../pages/main';
import Signup from '../pages/Signup/Signup';
import Secretary from '../pages/Signup/Secretary';


export default {
  component: require('../pages/Main'),
  childRoutes: [
    { path: '/signup',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../pages/Signup/Signup'))
        })
      }
    }
    ]
}