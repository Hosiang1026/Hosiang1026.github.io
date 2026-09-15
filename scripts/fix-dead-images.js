const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'source', '_posts');
const DEAD = /https?:\/\/hosiang1026\.github\.io\/photos\/[^\s)\]"'<>]+/gi;
let files = 0;
let removed = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.md')) fix(p);
  }
}

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  if (!DEAD.test(c)) {
    DEAD.lastIndex = 0;
    return;
  }
  DEAD.lastIndex = 0;
  const before = (c.match(DEAD) || []).length;
  DEAD.lastIndex = 0;

  c = c.replace(/!\[[^\]]*\]\(https?:\/\/hosiang1026\.github\.io\/photos\/[^)]+\)[^\n]*/g, '');
  c = c.replace(/<img[^>]+src=["']https?:\/\/hosiang1026\.github\.io\/photos\/[^"']+["'][^>]*>/gi, '');
  c = c.replace(DEAD, '');
  c = c.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(file, c, 'utf8');
  files++;
  removed += before;
  console.log(path.relative(root, file) + '\t-' + before);
}

walk(root);
console.log('files=' + files + ' urls=' + removed);
