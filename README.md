# wall


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
npm run build:umd:watch
```

Start development server on `http://localhost:9000`. Once you update library or dev server browser page will be reloaded automatically 
``` bash
npm run dev:server
```

### Create own brick
Brick - is simple Angular component which after registration could be used in wall editor.
To write own editor please refer to base `text` or `img` bricks.
