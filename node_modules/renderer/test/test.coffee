grunt = require 'grunt'
renderer = require '../index'

grunt.file.defaultEncoding = 'utf8'

module.exports =
  destination: (test) ->
    test.expect 1

    renderer 'test/fixtures/listen.hbs', 'tmp/listen.html',
      user: 'blaketothefuture',
      song: 'sonic-the-hedgehog-marble-zone',
      title: 'Marble Zone'
      blah:
        foo: 1
        bar: 2
    .then ->
      expected = grunt.file.read 'test/expected/listen.html'
      actual = grunt.file.read 'tmp/listen.html'

      test.equal actual, expected, 'should render template to file'
      test.done()
    , test.done

  nodestination: (test) ->
    test.expect 1

    renderer 'test/fixtures/listen.hbs',
      user: 'blaketothefuture',
      song: 'sonic-the-hedgehog-marble-zone',
      title: 'Marble Zone'
    .then (rendered) ->
      expected = grunt.file.read 'test/expected/listen.html'

      test.equal rendered, expected, 'should return rendered template as string'
      test.done()
    , test.done

  fileincluded: (test) ->
    test.expect 1

    renderer 'test/fixtures/fileincluded.hbs', 'tmp/fileincluded.html',
      user: 'hoodinternet'
    .then ->
      expected = grunt.file.read 'test/expected/fileincluded.html'
      actual = grunt.file.read 'tmp/fileincluded.html'

      test.equal actual, expected, 'should return rendered template including specified file, to file'
      test.done()
    , test.done

  stringify: (test) ->
    test.expect 1

    renderer 'test/fixtures/stringify.hbs', 'tmp/stringify.html',
      stuff:
        foo: 1
        bar: 2
    .then ->
      expected = grunt.file.read 'test/expected/stringify.html'
      actual = grunt.file.read 'tmp/stringify.html'

      test.equal actual, expected, 'should return rendered template including specified file, to file'
      test.done()
    , test.done
