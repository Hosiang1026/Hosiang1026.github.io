'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const patchFile = path.join(root, 'node_modules/connect/lib/patch.js');

if (!fs.existsSync(patchFile)) process.exit(0);

let src = fs.readFileSync(patchFile, 'utf8');
const bad = "if (this._headers && 'set-cookie' == key)";
const good = "if ('set-cookie' == key)";

if (src.includes(bad)) {
  src = src.replace(bad, good);
  fs.writeFileSync(patchFile, src);
}
