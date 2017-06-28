# stamplines
Simple "stamp + line" drawing utility built on paper.js

The goal of this project is to provide a simple, configurable drawing utility with the following features:

* draw "stamps" (instances of SVG)
* draw "lines" (straigt lines)
* add text elements
* basic transformations (move, rotate, scale)
* connect/lock lines to stamps
* easy to customize via json config

## Install bower and npm packages.
From project directory run:
```
npm install && bower install
```

## Development Environment
A few gulp tasks have been configured to streamline development tasks.

To run the dev server with watchify auto-build, from project directory run:
`gulp dev` (or simply `gulp`)

This will run a test environment at http://localhost:8000/test/
The mocha results are displayed on this page and the StampLines canvas can be used for manual testing.

For fully manual testing (to save load-in time), remove test scrips and mocha.run() in index.html


## Build and Deploy
To perform linting and run tests without starting a server:
`gulp check`

To perform build:
`gulp build`
