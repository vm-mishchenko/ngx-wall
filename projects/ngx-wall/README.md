# ngx-wall
[![npm version](https://badge.fury.io/js/ngx-wall.svg)](https://www.npmjs.com/package/ngx-wall)
[![npm version](https://travis-ci.org/vm-mishchenko/ngx-wall.svg?branch=master)](https://travis-ci.org/vm-mishchenko/ngx-wall/builds)
[![peerDependencies Status](https://david-dm.org/vm-mishchenko/ngx-wall/peer-status.svg)](https://david-dm.org/vm-mishchenko/ngx-wall?type=peer)

## What
ngx-wall is library which helps build <i>content editor</i> for note-taking application.

## Demo
https://vm-mishchenko.github.io/ngx-wall

## Features
- customizable - extend editor writing own components
- support drag-and-drop
- support columns
- created with extension in mind - write own plugin to extend behaviour (core functionality is written as the plugin)
<img width="500px" alt="ORY Editor demo" src="docs/images/move-brick.gif">

## Why
Note-taking is my natural way to learn something new. Whether I read some book or learn new technology I have to write my thoughts down.&nbsp;For a long time I was trying to find an app for my notes. Evernote has too simple editor and not extensible. It cannot properly format block of code or add google maps inside doc. Google Docs is highly customizable but his heavy UI suits more for the science paper rather than quick notes. After awhile I found the balance between all my needs and it's <i>notion.so</i> application. Don't hesitate to try it, maybe it's also what are you looking for)&nbsp;I was so excited that I decided to write my own library which provides similar editor experience and behaviour. Based on the <i>ngx-wall</i> I'm building&nbsp;<i>origin</i> application - self-hosted note-taking app for saving my notes.&nbsp;

## Development
ngx-wall is angular library based on angular-cli project.

### Folder structure
- `src` - development application
- `projects/ngx-wall` - ngx-wall library source code
- `projects/ngx-wall/src/lib/wall` - editor itself
- `projects/ngx-wall/src/lib/resources` - styles
- `projects/ngx-wall/src/lib/*-brick` - standard components
- `projects/ngx-wall/src/lib/moduels` - helper modules

### Development process
Install library dependencies
``` javascript
npm i
```

Start development application
``` javascript
npm start
```

Build library release version
``` javascript
npm release
```

<img width="500px" alt="ORY Editor demo" src="docs/images/general.gif">
