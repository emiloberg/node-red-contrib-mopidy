# node-red-contrib-advanced-mopidy

**Work in progress**

[![Build Status](https://travis-ci.org/emiloberg/node-red-contrib-advanced-mopidy.svg?branch=master)](https://travis-ci.org/emiloberg/node-red-contrib-advanced-mopidy)
[![Dependency Status](https://gemnasium.com/emiloberg/node-red-contrib-advanced-mopidy.svg)](https://gemnasium.com/emiloberg/node-red-contrib-advanced-mopidy)
[![Test Coverage](https://codeclimate.com/github/emiloberg/node-red-contrib-advanced-mopidy/badges/coverage.svg)](https://codeclimate.com/github/emiloberg/node-red-contrib-advanced-mopidy/coverage)
[![Code Climate](https://codeclimate.com/github/emiloberg/node-red-contrib-advanced-mopidy/badges/gpa.svg)](https://codeclimate.com/github/emiloberg/node-red-contrib-advanced-mopidy)

## Install
While in development, you need to clone and `npm install` it. Will be on NPM when stable.
    

## Development
This is coded in ES2015. To make older node able to understand it, it has to be transpiled to ES5. This is done automagically on installation.

To rebuild it yourself, please see the tasks below.

The source lives in the `./lib` folder and gets transpiled and copied to the `./mopidy` folder. I would rather name it `./src`, however, Node-RED walks the entire folder structure and tries to discover modules in every folder. [A few folder names are exluded](https://github.com/node-red/node-red/blob/master/red/nodes/registry/localfilesystem.js#L91) from this discovery (`lib|icons|node_modules|test|locales`) and `src` isn't one of them.

### Pre commit
There's a pre-commit hook in place which will run tests and lint check (`npm test` and `npm runt lint`) on ommit. Failed tests or lints will prevent commit.

### Development tasks
Run tests which __do not__ require a connected Mopidy server by running:

```
npm test
```

Run tests which __do__ require a connected Mopidy server by running:

```
npm run test-all
```

For linting with eslint, run 

```
npm run lint
```

To auto-run babel and transpile ES2015 to ES5 when files are changed (and copy all non-js files from `/lib` to `/mopidy` if they're changed), run:

```
npm run watch
```

To do a complete clean & rebuild, run:

```
npm run clean-build
```