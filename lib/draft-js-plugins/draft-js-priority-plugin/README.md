# DraftJS PriorityTag Plugin

*This is a plugin for the `draft-js-plugins-editor`.*

This plugin highlights PriorityTags in the text!

## Usage

```js
import createPriorityTagPlugin from 'draft-js-priority-plugin';

const priorityTagPlugin = createPriorityTagPlugin();
```

## how to install as a npm package

Just do the following steps.
Since this is a local package, installing it, is bit different than a package which is included in the `npm` repository.  

01. go to the package folder `/lib/draft-js-plugins`. Note: Please use absolute path.
```
$ cd <package folder>
```
02. run a the following command
```
$ npm link
```

03. go to the project root.
```

cd <project root>
```

04. run the follofing command
```
npm link draft-js-priority-plugin
```

That's it.
