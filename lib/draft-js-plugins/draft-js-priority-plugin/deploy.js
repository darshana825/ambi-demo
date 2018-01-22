"use strict";

const fs = require('fs-extra')
const path = require('path');

fs.copySync(path.resolve('./src/styles.css'), path.resolve('./lib/styles.css'));
fs.copySync(path.resolve('./lib'), path.resolve('../../../node_modules/draft-js-priority-plugin'));
