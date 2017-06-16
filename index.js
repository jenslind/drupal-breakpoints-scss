'use strict'
var YAML = require('yamljs')
var fs = require('fs')
var stream = require('stream')
var through = require('through2')

var drupalBreakpointsScss = {}
var defaultOpts = {
  vars: true,
  map: false,
  mapName: 'drupal-breakpoints',
  varsPrefix: ''
}

function jsonToScssVars (obj, opts) {
  var scssVars = ''

  for (var i in obj) {
    scssVars += '$' + opts.varsPrefix + obj[i].label + ': \'' + obj[i].mediaQuery + '\';\n'
  }

  return scssVars
}

function jsonToScssMap (obj, opts) {
  var scssMap = '$' + opts.mapName + ': (\n'

  for (var i in obj) {
    scssMap += '  ' + obj[i].label + ': \'' + obj[i].mediaQuery + '\',\n'
  }

  scssMap += ');'

  return scssMap
}

function generateScss (breakpoints, opts) {
  var opts = Object.assign(defaultOpts, opts)

  var output = ''
  if (opts.vars) output += jsonToScssVars(breakpoints, opts) + '\n'
  if (opts.map) output += jsonToScssMap(breakpoints, opts) + '\n'

  return output
}

drupalBreakpointsScss.read = function (path, opts = {}) {
  var rs = stream.Readable()
  var breakpoints = YAML.load(path)

  rs._read = function () {
    rs.push(generateScss(breakpoints, opts))
    rs.push(null)
  }

  return rs
}

drupalBreakpointsScss.write = function (path) {
  var scssFile = fs.createWriteStream(path)
  return scssFile
}

drupalBreakpointsScss.ymlToScss = function (opts = {}) {
  return through.obj(function (file, enc, cb) {
    var content = file.contents.toString('utf8')
    var breakpoints = YAML.parse(content)
    file.contents = new Buffer(String(generateScss(breakpoints, opts)))
    cb(null, file)
  })
}

module.exports = drupalBreakpointsScss
