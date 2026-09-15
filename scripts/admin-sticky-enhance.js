(function () {
  if (typeof window === 'undefined') return;
  var root = window.location.pathname.split('/admin')[0] || '';
  if (root === '/') root = '';

  var MAP = [
    ['Hexo Admin', '博客后台'],
    ['New Post', '新建文章'],
    ['New Page', '新建页面'],
    ['New page', '新建页面'],
    ['Loading...', '加载中...'],
    ['Draft', '草稿'],
    ['Publish', '发布'],
    ['Unpublish', '取消发布'],
    ['Preview', '预览'],
    ['Back to Preview', '返回预览'],
    ['Settings', '设置'],
    ['Deploy', '部署'],
    ['Date', '日期'],
    ['Author', '作者'],
    ['Tags', '标签'],
    ['Categories', '分类'],
    ['Markdown', 'Markdown'],
    ['words', '字'],
    ['saved ', '已保存 '],
    ['Delete this post?', '确定删除这篇文章？'],
    ['This operation will move current draft into source/_discarded folder.', '文章将移到 source/_discarded，可从磁盘恢复。'],
    ['Yes', '确定'],
    ['No', '取消'],
    ['Cancel', '取消'],
    ['Type a message here and hit `deploy` to run your deploy script.', '填写提交说明后点击部署。'],
    ['Deploy/commit message', '部署/提交说明'],
    ['Std Output', '标准输出'],
    ['Std Error', '标准错误'],
    ['Error:', '错误：'],
    ['Set various settings for your admin panel and editor.', '在这里配置后台与编辑器选项。'],
    ['Hexo admin can be secured with a password.', '可以为后台设置登录密码。'],
    ['Setup authentification here.', '点此配置认证。'],
    ['Enable line numbering.', '显示行号'],
    ['Enable spellchecking. (buggy on older browsers)', '启用拼写检查（旧浏览器可能有问题）'],
    ['Always ask for filename.', '粘贴图片时询问文件名'],
    ['Overwrite images if file already exists.', '同名图片直接覆盖'],
    ['Image directory', '图片目录'],
    ['Image filename prefix', '图片文件名前缀'],
    ['Editor Settings', '编辑器设置'],
    ['Image Pasting Settings', '粘贴图片设置'],
    ['Hexo-admin allows you to paste images you copy from the web or elsewhere directly', '支持把网页或其他地方复制的图片直接粘贴到编辑器。'],
    ["into the editor. Decide how you'd like to handle the pasted images.", '请选择粘贴图片的处理方式。'],
    ['This is the Hexo Admin Plugin', 'Hexo 博客后台'],
    ['Goal: Provide an awesome admin experience for managing your blog.', '目标：提供好用的博客管理后台。'],
    ['Useful links:', '相关链接：'],
    ['Hexo site', 'Hexo 官网'],
    ['Github page for Hexo-admin', 'Hexo-admin GitHub'],
    ["add 'qiniu' to Hexo-admin", 'Hexo-admin 七牛版'],
    ['Helper:', '帮助：'],
    ['Authentification Setup', '认证配置'],
    ['Username:', '用户名：'],
    ['Password:', '密码：'],
    ['Secret:', '密钥：'],
    ['Username', '用户名'],
    ['Password', '密码'],
    ['Submit', '登录'],
    ['Untitled', '未命名'],
    ['Writing Suggestions', '写作建议'],
    ['Brought to you by ', '引擎：'],
    ['Nice! No possible improvements were found!', '不错！没有发现可改进之处！'],
    ['Click to rename', '点击重命名'],
    ['Rename File', '重命名文件'],
    ['Check for Writing Improvements', '写作检查'],
    ['Admin Config Section', '后台配置段']
  ];

  function req(method, url, body) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
          } catch (e) {
            resolve(null);
          }
        } else {
          reject(new Error(xhr.status + ' ' + xhr.responseText));
        }
      };
      xhr.onerror = function () {
        reject(new Error('network'));
      };
      xhr.send(body ? JSON.stringify(body) : null);
    });
  }

  function walkText(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (!t || !t.trim()) return;
      for (var i = 0; i < MAP.length; i++) {
        if (t.indexOf(MAP[i][0]) !== -1) {
          node.nodeValue = t.split(MAP[i][0]).join(MAP[i][1]);
          t = node.nodeValue;
        }
      }
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT') {
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        ['placeholder', 'value', 'title'].forEach(function (attr) {
          var v = node.getAttribute(attr);
          if (!v) return;
          for (var j = 0; j < MAP.length; j++) {
            if (v.indexOf(MAP[j][0]) !== -1) {
              v = v.split(MAP[j][0]).join(MAP[j][1]);
            }
          }
          if (attr === 'value' && document.activeElement === node) return;
          node.setAttribute(attr, v);
          if (attr === 'value' && node.value !== v && node.type === 'submit') node.value = v;
        });
      }
      return;
    }
    if (node.title) {
      var title = node.title;
      for (var k = 0; k < MAP.length; k++) {
        if (title.indexOf(MAP[k][0]) !== -1) {
          title = title.split(MAP[k][0]).join(MAP[k][1]);
        }
      }
      node.title = title;
    }
    var child = node.firstChild;
    while (child) {
      var next = child.nextSibling;
      walkText(child);
      child = next;
    }
  }

  function localize() {
    var title = document.querySelector('title');
    if (title) title.textContent = '博客后台';
    var brand = document.querySelector('.app_title');
    if (brand) brand.textContent = '博客后台';
    walkText(document.body);
  }

  function postIdFromHash() {
    var m = (window.location.hash || '').match(/posts\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  function isSticky(v) {
    return Number(v) > 0;
  }

  function hideStickyNumberField() {
    var sections = document.querySelectorAll('.config_section');
    for (var i = 0; i < sections.length; i++) {
      var title = sections[i].querySelector('.config_section-title');
      if (title && String(title.textContent).trim().toLowerCase() === 'sticky') {
        sections[i].style.display = 'none';
      }
    }
  }

  function styleBtn(el, bg, color, border) {
    el.style.cssText =
      'margin-left:6px;padding:3px 10px;cursor:pointer;border:1px solid ' +
      border +
      ';background:' +
      bg +
      ';color:' +
      color +
      ';border-radius:3px;font-size:12px;text-decoration:none;display:inline-block;vertical-align:middle;';
  }

  function ensureEditorChrome() {
    var top = document.querySelector('.editor_top');
    if (!top) return;
    var id = postIdFromHash();
    if (!id) return;

    var pub = top.querySelector('.editor_publish');
    if (pub && pub.textContent.trim() === 'Publish') pub.textContent = '发布';
    var unpub = top.querySelector('.editor_unpublish');
    if (unpub && unpub.textContent.trim() === 'Unpublish') unpub.textContent = '取消发布';

    var remove = top.querySelector('.editor_remove');
    if (remove) {
      remove.title = '删除';
      var tip = remove.querySelector('.zh-label');
      if (tip) tip.parentNode.removeChild(tip);
    }

    var btn = top.querySelector('.editor_sticky_btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editor_sticky_btn';
      top.appendChild(btn);
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('data-on') === '1';
        btn.disabled = true;
        req('POST', root + '/admin/api/sticky', { id: id, sticky: !on })
          .then(function (data) {
            paintStickyBtn(btn, isSticky(data && data.sticky));
            btn.disabled = false;
          })
          .catch(function () {
            btn.disabled = false;
            alert('置顶操作失败');
          });
      });
    }
    if (btn.getAttribute('data-id') === id && btn.getAttribute('data-ready') === '1') return;
    btn.setAttribute('data-id', id);
    btn.setAttribute('data-ready', '0');
    btn.textContent = '...';
    req('GET', root + '/admin/api/posts/' + id)
      .then(function (post) {
        if (btn.getAttribute('data-id') !== id) return;
        paintStickyBtn(btn, isSticky(post && post.sticky));
        btn.setAttribute('data-ready', '1');
      })
      .catch(function () {
        btn.textContent = '置顶';
      });
  }

  function paintStickyBtn(btn, on) {
    btn.setAttribute('data-on', on ? '1' : '0');
    btn.textContent = on ? '取消置顶' : '置顶';
    styleBtn(btn, on ? '#e74c3c' : '#fff', on ? '#fff' : '#333', on ? '#e74c3c' : '#ccc');
  }

  function ensureListActions() {
    var items = document.querySelectorAll('.posts_post');
    if (!items.length) return;
    req('GET', root + '/admin/api/posts/list')
      .then(function (posts) {
        if (!Array.isArray(posts)) return;
        var map = {};
        posts.forEach(function (p) {
          map[p._id] = p;
        });
        items.forEach(function (li) {
          var link = li.querySelector('.posts_edit-link');
          if (!link) return;
          var href = link.getAttribute('href') || '';
          var m = href.match(/posts\/([^/?#]+)/);
          if (!m) return;
          var id = m[1];
          var post = map[id];
          if (!post) return;

          var actions = li.querySelector('.posts_actions');
          if (!actions) {
            actions = document.createElement('span');
            actions.className = 'posts_actions';
            actions.style.cssText = 'float:right;margin-right:8px;';
            li.appendChild(actions);
          }

          var pin = actions.querySelector('.posts_sticky_btn');
          if (!pin) {
            pin = document.createElement('a');
            pin.href = 'javascript:;';
            pin.className = 'posts_sticky_btn';
            pin.innerHTML = '<i class="fa fa-thumb-tack"></i>';
            actions.appendChild(pin);
            pin.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              var on = pin.getAttribute('data-on') === '1';
              req('POST', root + '/admin/api/sticky', { id: id, sticky: !on })
                .then(function (data) {
                  paintPin(pin, isSticky(data && data.sticky));
                })
                .catch(function () {
                  alert('置顶操作失败');
                });
            });
          }
          paintPin(pin, isSticky(post.sticky));

          var pub = actions.querySelector('.posts_publish_btn');
          if (post.isDraft) {
            if (!pub) {
              pub = document.createElement('a');
              pub.href = 'javascript:;';
              pub.className = 'posts_publish_btn';
              pub.textContent = '发布';
              styleBtn(pub, '#27ae60', '#fff', '#27ae60');
              actions.appendChild(pub);
              pub.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!confirm('确认发布这篇文章？')) return;
                pub.textContent = '...';
                req('POST', root + '/admin/api/posts/' + id + '/publish', {})
                  .then(function () {
                    pub.textContent = '已发布';
                    li.classList.remove('posts_post--draft');
                    setTimeout(function () {
                      location.reload();
                    }, 300);
                  })
                  .catch(function () {
                    pub.textContent = '发布';
                    alert('发布失败');
                  });
              });
            }
          } else if (pub) {
            pub.parentNode.removeChild(pub);
          }

          var del = actions.querySelector('.posts_delete_btn');
          if (!del) {
            del = document.createElement('a');
            del.href = 'javascript:;';
            del.className = 'posts_delete_btn';
            del.title = '删除';
            del.innerHTML = '<i class="fa fa-trash-o"></i>';
            del.style.cssText = 'margin-left:6px;cursor:pointer;color:#e74c3c;';
            actions.appendChild(del);
            del.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              if (!confirm('确定删除这篇文章？将移到 _discarded。')) return;
              del.style.opacity = '0.5';
              req('POST', root + '/admin/api/posts/' + id + '/remove', {})
                .then(function () {
                  if (li.parentNode) li.parentNode.removeChild(li);
                })
                .catch(function () {
                  del.style.opacity = '1';
                  alert('删除失败');
                });
            });
          }
        });
      })
      .catch(function () {});
  }

  function paintPin(pin, on) {
    pin.setAttribute('data-on', on ? '1' : '0');
    pin.style.color = on ? '#e74c3c' : '#999';
    pin.style.marginLeft = '6px';
    pin.style.cursor = 'pointer';
    pin.title = on ? '取消置顶' : '置顶';
  }

  setInterval(function () {
    localize();
    hideStickyNumberField();
    ensureEditorChrome();
    ensureListActions();
  }, 700);
})();
