const defaults = {
  mimeTypes: [
    'application/json',
    'application/ld+json'
  ]
};

/* eslint-disable no-useless-escape */
const regexEscape = (str) =>
  str.replace(/([\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/,
    (match, specialChar) => `\\${specialChar}`);
/* eslint-enable no-useless-escape */

module.exports = (html, opts = {}) => {
  if (typeof html !== 'string') {
    throw new Error('Invalid parameter: html must be string');
  }

  if (typeof opts !== 'object') {
    throw new Error('Invalid parameter: options must be object');
  }

  const options = Object.assign({}, defaults, opts);

  if (typeof options.mimeTypes === 'string') {
    options.mimeTypes = [ options.mimeTypes ];
  }

  if (!Array.isArray(options.mimeTypes)
    || options.mimeTypes.some((mimeType) => typeof mimeType !== 'string')) {
    throw new Error('Invalid option: mimeTypes must be string or Array of strings');
  }

  const regex = new RegExp(`<script(.*)type="(${
    options.mimeTypes.map((mimeType) => `${regexEscape(mimeType)}`)
      .join('|')
  })"(.*)>([^]+?)</script>`, 'gm');

  return html.replace(regex,
    (match, preType, type, postType, json) =>
      `<script${preType}type="${type}"${postType}>${
        JSON.stringify(JSON.parse(json))
      }</script>`);
};
