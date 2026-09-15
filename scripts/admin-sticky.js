'use strict';

const path = require('path');

const update = require(path.join(
  hexo.base_dir,
  'node_modules/hexo-admin-qiniu/update.js'
));

function readBody(req, cb) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
    return cb(null, req.body);
  }
  let body = '';
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    try {
      cb(null, JSON.parse(body || '{}'));
    } catch (e) {
      cb(e);
    }
  });
}

hexo.extend.filter.register('server_middleware', function (app) {
  const root = hexo.config.root || '/';

  app.use(root + 'admin/api/sticky', function (req, res, next) {
    if (req.method !== 'POST') return next();

    readBody(req, function (err, data) {
      if (err) {
        res.statusCode = 400;
        return res.end('invalid json');
      }

      const id = data.id;
      if (!id) {
        res.statusCode = 400;
        return res.end('no id');
      }

      const post = hexo.model('Post').get(id);
      if (!post) {
        res.statusCode = 404;
        return res.end('post not found');
      }

      const sticky = data.sticky ? Date.now() : 0;
      update(
        'Post',
        id,
        { sticky: sticky },
        function (err2, updated) {
          if (err2) {
            res.statusCode = 400;
            return res.end(String(err2));
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              _id: updated._id,
              sticky: updated.sticky || sticky,
              title: updated.title
            })
          );
        },
        hexo
      );
    });
  });
});
