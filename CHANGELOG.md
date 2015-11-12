# node-red-contrib-mopidy changelog


## 2.0.0
Based on the idea of the v0.9.0 proof of concept but completely rebuilt to a full-fledged configurable module. Version number bumped to 2.x (and not 1.x) to denote that this is a complete rebuild and not a stable version of the 0.9.0 release.

Highlights are:

* Allows connections to multiple Mopidy servers
* Access to the full API of the connected Mopidy server
* Can open connections to a Mopidy server on demand
* Fully configurable from the UI

[Laurence](https://github.com/helgrind) gracefully transfered the npm namespace `node-red-contrib-mopidy` to this rebuilt module.

Change source code repository from [https://github.com/SandyLabs/node-red-contrib-mopidy/](https://github.com/SandyLabs/node-red-contrib-mopidy/) to [https://github.com/emiloberg/node-red-contrib-mopidy](https://github.com/emiloberg/node-red-contrib-mopidy)

## 0.9.0
Initial proof of concept module created by [Laurence Stant](https://github.com/helgrind). Can still be installed with `npm install node-red-contrib-mopidy@0.9.0`. Source code is available at [https://github.com/SandyLabs/node-red-contrib-mopidy/](https://github.com/SandyLabs/node-red-contrib-mopidy/)