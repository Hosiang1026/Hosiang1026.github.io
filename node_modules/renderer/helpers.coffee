fs = require 'fs-extra'
path = require 'path'

module.exports = (Handlebars, src) ->
  Handlebars.registerHelper 'readFile', (filename) ->
    dir = path.dirname src
    filepath = path.join dir, filename

    fs.readFileSync filepath, encoding: 'utf8', (err, data) ->
      throw err if err?
      data

  Handlebars.registerHelper 'stringify', (obj) ->
    JSON.stringify obj
