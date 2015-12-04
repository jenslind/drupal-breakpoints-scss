'use strict'
const YAML = require('yamljs')
const fs = require('fs')
const stream = require('stream')

// Midnight oil <3
const howCanWeSleepWhileOurBedsAreBurning = {}

function jsonToScssVars (obj) {
  let scssVars = ''

  for (let i in obj) {
    scssVars += '$' + obj[i].label + ': ' + obj[i].mediaQuery + ';\n'
  }

  return scssVars
}

howCanWeSleepWhileOurBedsAreBurning.read = function (path) {
  let rs = stream.Readable()
  let breakpoints = YAML.load(path)

  rs._read = function () {
    rs.push(jsonToScssVars(breakpoints))
    rs.push(null)
  }

  return rs
}

howCanWeSleepWhileOurBedsAreBurning.write = function (path) {
  let scssFile = fs.createWriteStream(path)
  return scssFile
}

module.exports = howCanWeSleepWhileOurBedsAreBurning
