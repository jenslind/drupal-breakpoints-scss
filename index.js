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
    var breakpoint = obj[i]
    var multipliers = getMultipliers(breakpoint)
    if (multipliers) {
      for (var j in multipliers) {
        scssVars += '$' + opts.varsPrefix + breakpoint.label + '-' + multipliers[j] + ': \'' + breakpoint.mediaQuery + '\';\n'
      }
    } else {
      scssVars += '$' + opts.varsPrefix + breakpoint.label + ': \'' + breakpoint.mediaQuery + '\';\n'
    }
  }

  return scssVars
}

function jsonToScssMap (obj, opts) {
  var scssMap = '$' + opts.mapName + ': (\n'

  for (var i in obj) {
    var breakpoint = obj[i]
    var multipliers = getMultipliers(breakpoint)
    if (multipliers) {
      for (var j in multipliers) {
        scssMap += '  ' + breakpoint.label + '-' + multipliers[j] + ': \'' + breakpoint.mediaQuery + '\',\n'
      }
    } else {
      scssMap += '  ' + breakpoint.label + ': \'' + breakpoint.mediaQuery + '\',\n'
    }
  }

  scssMap += ');'

  return scssMap
}

/**
 * Returns array of groups in breakpoints object.
 * If breakpoint without group, then it will added to 'default' group.
 */
function getGroups(obj, opts) {
  var groups = []
  var isEmptyExists = false // If breakpoint without group exist.
  for (var i in obj) {
    var breakpoint = obj[i]
    if (breakpoint.hasOwnProperty('group')) {
      if (groups.indexOf(breakpoint.group) === -1) {
        groups.push(breakpoint.group)
      }
    } else {
      isEmptyExists = true
    }
  }
  if (isEmptyExists) {
    groups.unshift('') // Add default empty group.
  }
  return groups
}

/**
 * Returns list of queries for group.
 */
function getGroupQueries(obj, opts, group) {
  var queries = []
  for (var i in obj) {
    var breakpoint = obj[i]

    if (breakpoint.hasOwnProperty('group')) {
      if (breakpoint.group == group) {
        queries.push(breakpoint)
      }
    } else if (group.length == 0) {
      queries.push(breakpoint)
    }
  }
  return queries
}

/**
 * Get multipliers.
 */
function getMultipliers (breakpoint) {
  var multipliers = []
  if (breakpoint.hasOwnProperty('multipliers')) {
    for (var i in breakpoint.multipliers) {
      multipliers.push(breakpoint.multipliers[i])
    }
  } else {
    multipliers = false
  }
  return multipliers
}

function generateScss (breakpoints, opts) {
  var opts = Object.assign(defaultOpts, opts)
  var groups = getGroups(breakpoints, opts);
  var output = ''

  if (groups.length == 1) {
    if (opts.vars) output += jsonToScssVars(breakpoints, opts) + '\n'
    if (opts.map) output += jsonToScssMap(breakpoints, opts) + '\n'
  } else {
    for (var i in groups) {
      var groupOpts = opts
      var queries = getGroupQueries(breakpoints, opts, groups[i])
      groupOpts.mapName = groupOpts.mapName + (groupOpts.mapName.length && groups[i].length ? '-' : '') + groups[i].replace('.', '-')
      groupOpts.varsPrefix = (groupOpts.varsPrefix.length ? '-' : '') + groups[i].replace('.', '-') + (groups[i].length ? '-' : '')
      if (opts.vars) output += jsonToScssVars(queries, groupOpts) + '\n'
      if (opts.map) output += jsonToScssMap(queries, groupOpts) + '\n'
      groupOpts = opts
    }
  }

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
