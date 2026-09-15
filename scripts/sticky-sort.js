'use strict';

hexo.extend.filter.register('before_generate', function () {
  const posts = this.locals.get('posts');
  if (!posts || !posts.data) return;
  posts.data.sort(function (a, b) {
    const sa = Number(a.sticky) || 0;
    const sb = Number(b.sticky) || 0;
    if (sb !== sa) return sb - sa;
    return b.date.valueOf() - a.date.valueOf();
  });
});
