# minify-inline-json
Node.js module to minify inlined/embedded JSON data within script tags.

[![NPM](https://nodei.co/npm/minify-inline-json.png?downloads=true)](https://nodei.co/npm/minify-inline-json/)

[![CircleCI](https://circleci.com/gh/haensl/minify-inline-json.svg?style=svg)](https://circleci.com/gh/haensl/minify-inline-json)

## Installation

### NPM

`npm i --save minify-inline-json`

### Yarn

`yarn add minify-inline-json`

## Usage

### Synopsis

```javascript
/**
 * Minify inline JSON data in the given string.
 * When minifyInlineJson() encounters a script tag with JSON mime type,
 * e.g.
 *  <script type="application/json">{
 *    // ...
 *  }</script>
 * it will minify the JSON found within the script tag.
 *
 * @param {string} html the string to process.
 * @param {object} options configuration options.
 * @returns {string} the processed string.
 */
minifyInlineJson(html, options);
```

### Example

```javascript
const minifyInlineJson = require('minify-inline-json');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
minifyInlineJson(html);
```

### Options

#### mimeTypes `Array<string> | string`

**Default:** `['application/json', 'application/ld+json']`

Specify the mime type(s) of scripts to minify JSON data in.

### [Changelog](CHANGELOG.md)

### [License](LICENSE)
