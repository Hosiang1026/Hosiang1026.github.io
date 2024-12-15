###!
Copyright (c) 2013 Derek Petersen https://github.com/tuxracer/renderer
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
###

fs = require 'fs-extra'
Q = require 'q'
Handlebars = require 'handlebars'

# renderer src, [dest], data
module.exports = (src, dest, data) ->
  unless data?
   data = dest
   dest = null

  # Register helpers
  require('./helpers')(Handlebars, src)

  Q.nfcall(fs.readFile, src, 'utf8')
  .then (contents) ->
    template = Handlebars.compile contents
    template data
  .then (rendered) ->
    if dest?
      Q.nfcall(fs.outputFile, dest, rendered)
    else
      rendered
