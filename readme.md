# Drupal-breakpoints-scss

> Convert Drupal 8:s breakpoints (`*.breakpoints.yml`) to scss `$variables`.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Install
```
npm install --save drupal-breakpoints-scss
```

## What it does
Converts this:
```yml
theme.small:
  label: breakpoint-small
  mediaQuery: 'all and (max-width: 500px)'
  weight: 1
  multipliers:
    - 1x

theme.medium:
  label: breakpoint-medium
  mediaQuery: 'all and (max-width: 700px)'
  weight: 1
  multipliers:
    - 1x
```
into this:
```scss
$breakpoint-small: all and (max-width: 500px);
$breakpoint-medium: all and (max-width: 700px);
```

## Usage
```javascript
const drupalBreakpoints = require('drupal-breakpoints-scss')

drupalBreakpoints.read('./theme.breakpoints.yml')
  .pipe(drupalBreakpoints.write('./scss/_breakpoints.scss'))
```

## Usage with gulp
```javascript
const gulp = require('gulp')
const rename = require('gulp-rename')
const drupalBreakpoints = require('drupal-breakpoints-scss')

gulp.task('task', function () {
  return gulp.src('./breakpoints.yml')
    .pipe(drupalBreakpoints.ymlToScss())
    .pipe(rename('_breakpoints.scss'))
    .pipe(gulp.dest('./scss'))
})
```
