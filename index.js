'use strict'
var YAML = require('yamljs')
var fs = require('fs')
var stream = require('stream')
var through = require('through2')

var drupalBreakpointsScss = {}

function jsonToScssVars (obj, varPrefix) {
  var scssVars = ''

  for (var i in obj) {
    scssVars += '$' + varPrefix + obj[i].label + ': \'' + obj[i].mediaQuery + '\';\n'
  }

  return scssVars
}

function jsonToScssMap (obj, mapName) {
  var scssMap = '$' + mapName + ': (\n'

  for (var i in obj) {
    scssMap += '  ' + obj[i].label + ': \'' + obj[i].mediaQuery + '\',\n'
  }

  scssMap += ');'

  return scssMap
}

drupalBreakpointsScss.read = function (path) {
  var rs = stream.Readable()
  var breakpoints = YAML.load(path)

  rs._read = function () {
    rs.push(jsonToScssVars(breakpoints))
    rs.push(null)
  }

  return rs
}

drupalBreakpointsScss.write = function (path) {
  var scssFile = fs.createWriteStream(path)
  return scssFile
}

drupalBreakpointsScss.ymlToScss = function (varPrefix = '', mapName = 'drupal-breakpoints') {
  return through.obj(function (file, enc, cb) {
    var content = file.contents.toString('utf8')
    var parsedYaml = YAML.parse(content)
    file.contents = new Buffer(String(jsonToScssVars(parsedYaml, varPrefix) + '\n' + jsonToScssMap(parsedYaml, mapName)))
    cb(null, file)
  })
}

module.exports = drupalBreakpointsScss
