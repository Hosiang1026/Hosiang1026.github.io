renderer = require './index'

module.exports = (grunt) ->
  grunt.initConfig
    nodeunit:
      files: ['test/test.coffee']

    clean:
      test: ['tmp/']

  # Load installed tasks
  grunt.file.glob
  .sync('./node_modules/grunt-*/tasks')
  .forEach(grunt.loadTasks)

  # Shortcuts
  grunt.registerTask 'test', ['clean', 'nodeunit', 'clean']

  # Default task
  grunt.registerTask 'default', 'test'
