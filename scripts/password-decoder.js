const crypto = require('crypto');

hexo.extend.filter.register('before_post_render', function(data) {
  if (data.password && typeof data.password === 'string') {
    try {
      const decoded = Buffer.from(data.password, 'base64').toString('utf8');
      if (decoded && decoded.length > 0) {
        data.password = decoded;
      }
    } catch (e) {
      hexo.log.warn(`Failed to decode password for post: ${data.title || data.slug}`);
    }
  }
  return data;
});

