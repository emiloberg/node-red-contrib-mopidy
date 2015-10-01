# node-red-contrib-advanced-mopidy

**Work in progress**

[![Build Status](https://travis-ci.org/emiloberg/node-red-contrib-advanced-mopidy.svg?branch=master)](https://travis-ci.org/emiloberg/node-red-contrib-advanced-mopidy)


## Install

    npm install node-red-contrib-advanced-mopidy
    

## Development
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

To auto-run babel and transpile ES2015 to ES5 when files are changed (and copy all non-js files from `/src` to `/mopidy` if they're changed), run:

```
npm run watch
```

To do a complete clean & rebuild, run:

```
npm run clean-build
```