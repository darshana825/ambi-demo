'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _decorateComponentWithProps = require('decorate-component-with-props');

var _decorateComponentWithProps2 = _interopRequireDefault(_decorateComponentWithProps);

var _PriorityTag = require('./PriorityTag');

var _PriorityTag2 = _interopRequireDefault(_PriorityTag);

var _priorityTagStrategy = require('./priorityTagStrategy');

var _priorityTagStrategy2 = _interopRequireDefault(_priorityTagStrategy);

var _styles = require('./styles.css');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTheme = {
    prioritytag: _styles2.default.prioritytag
};

var priorityTagPlugin = function priorityTagPlugin() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Styles are overwritten instead of merged as merging causes a lot of confusion.
    //
    // Why? Because when merging a developer needs to know all of the underlying
    // styles which needs a deep dive into the code. Merging also makes it prone to
    // errors when upgrading as basically every styling change would become a major
    // breaking change. 1px of an increased padding can break a whole layout.
    var theme = config.theme ? config.theme : defaultTheme;

    return {
        decorators: [{
            strategy: _priorityTagStrategy2.default,
            component: (0, _decorateComponentWithProps2.default)(_PriorityTag2.default, { theme: theme })
        }]
    };
};

exports.default = priorityTagPlugin;