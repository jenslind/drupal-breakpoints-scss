# Drupal-breakpoints-scss

> Convert Drupal 8:s breakpoints (`*.breakpoints.yml`) to scss `$variables`.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Install
```
npm install --save drupal-breakpoints-scss
```

## Usage
```javascript
const drupalBreakpoints = require('drupal-breakpoints-scss')

drupalBreakpoints.read('./theme.breakpoints.yml')
  .pipe(drupalBreakpoints.write('./scss/_breakpoints.scss'))
```
