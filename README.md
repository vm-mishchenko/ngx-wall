# wall
[![npm version](https://badge.fury.io/js/ngx-wall.svg)](https://www.npmjs.com/package/ngx-wall)
[![peerDependencies Status](https://david-dm.org/vm-mishchenko/ngx-wall/peer-status.svg)](https://david-dm.org/vm-mishchenko/ngx-wall?type=peer)
[![devDependencies Status](https://david-dm.org/vm-mishchenko/ngx-wall/dev-status.svg)](https://david-dm.org/vm-mishchenko/ngx-wall?type=dev)

## Goal
The goal of the project is to create extensible web editor which provides clear and simple API for adding new type of editors (`bricks`) based on Angular components.

Demo: https://vm-mishchenko.github.io/ngx-wall

## Development
The project is in early development stage and is not recommended for production.


### Folder structure
 - `configurations` - config files for development and production releases
 - `dev-application` - development server
 - `libs`
    - `wall` - editor itself, render bricks and provide api for manipulation 
    - `text-brick` - base brick in the system. Allow to type simple text and could be transformed to any other bricks 
    - `header-brick` - allow to add simple header to the wall
    - `img-brick` - image brick
    - `resources` - styles for editor and base bricks

### Development process

Install library dependencies
``` bash
npm i
```

Build umd version of library in watch mode
``` bash
npm run build:watch
```

Start development server on `http://localhost:9000`. Once you update library or dev server browser page will be reloaded automatically 
``` bash
npm run application
```

### Create own brick
Brick - is simple Angular component which after registration could be used in wall editor.
To write own editor please refer to base `text` or `img` bricks.
