# 中文博客源码备份（狂欢马克思）

## 作者：吉祥草

## 主域名：https://haoxiang.eu.org
## 备域名：https://hosiang1026.github.io

## 网站特点：语雀云端写作、Github-Actions 自动部署

## 技术方案：Hexo 7.3 + Github-Actions + Github-Pages + Cloudflare

Github-Pages 作为备份站，Cloudflare 作为主站（同步仓库部署）。Node.js >= 18。

主题：miho

![Blog Version](https://haoxiang.eu.org/images/blog_version.png "博客版本信息")

## 更新日志

### 2026-09-15

#### 1. 清理无用源码与依赖
- 移除 `baidu.js`、`csdn-article.js`、`oschina-article.js` 等采集脚本
- 移除 `sqlite.js`、`callSqlite.js`、`callSqlite2.js`、`blog.db` 等 SQLite 相关文件
- 移除 `gulpfile.js`、`.travis.yml`、`index_bak.html`、UI 预览页、`gitalk-init-*.json`
- `package.json` 剔除 `gulp*`、`request`、`sqlite3`、`moment`、`browser-sync`、`chromedriver` 等无用依赖

#### 2. 强化 `.gitignore`
- 忽略 `*.db`、`yuque.json`、`.env`、编辑器目录与备份文件
- 忽略 `gitalk-init-cache.json`、`gitalk-init-error.json`

#### 3. 文章密码加密
- 使用 `hexo-blog-encrypt` + `scripts/password-decoder.js`
- front matter 中密码以 Base64 存储，构建时自动解码

#### 4. Gitalk 初始化脚本
- Token 改为读取环境变量 `GITALK_GITHUB_TOKEN`，不再硬编码
- 使用原生 `fetch` 替代 `request`

#### 5. Github Actions 部署
- 合并 build / deploy 为单 job
- `actions/checkout`、`actions/setup-node` 升级至 v4，启用 npm cache
- 使用 `npx hexo`，不再全局安装 `hexo-cli`

#### 6. 构建与后台
- 开启 `hexo-all-minifier`，关闭 Live2D
- `postinstall`：`inject-admin-sticky.js`、`patch-connect-headers.js`
- 新增 `fix:images` 脚本
- hexo-admin 增加 `metadata.sticky`

#### 7. 文档清理
- 移除 Travis-CI / Serverless / 钉钉通知等过时方案说明
- 同步当前 npm scripts 与密码加密用法

#### 8. Gitalk OAuth 代理
- 默认代理 `cors-anywhere.azm.workers.dev` 不可用，改为本域 Cloudflare Worker
- 代码：`cloudflare/gitalk-oauth-proxy.js`，路由：`haoxiang.eu.org/gitalk-oauth`
- 主题配置 `proxy: https://haoxiang.eu.org/gitalk-oauth`

### 2017-12-14

#### 1. [创建第一个测试版](https://hexo.io/docs/)
#### 2. 修改主题配置、添加文章、站内搜索

### 2017-12-15

#### 1. 安装 Browsersync / livereload
#### 2. 安装 hexo-admin-qiniu
#### 3. 添加 Gitalk 与 `gitalk-auto-init.js`

## 常用命令

```bash
npm install
npm run sync                 # 语雀同步
npm run clean                # 清理语雀缓存
npm run dev                  # hexo clean && hexo g && hexo s
npm run build                # hexo clean && hexo g && gitalk-auto-init
npm run prod                 # hexo clean && hexo g && hexo d
npm run deploy               # 同 prod
npm run gitalk               # 批量初始化 Gitalk（需 GITALK_GITHUB_TOKEN）
npm run fix:images           # 修复失效图片
hexo version
```

静态压缩由 `hexo-neat` / `hexo-all-minifier` 在构建时处理（见 `_config.yml`）。

## 文章密码加密

使用 `hexo-blog-encrypt`，密码以 Base64 写入 front matter，构建时由 `scripts/password-decoder.js` 解码。

```bash
node -e "console.log(Buffer.from('你的密码', 'utf8').toString('base64'));"
```

```yaml
---
title: 文章标题
password: <Base64编码后的密码>
---
```

访问时输入原始明文密码即可。

- 密钥派生：PBKDF2 + SHA-256
- 加密算法：AES-256-CBC
- 消息认证：HMAC-SHA256

## Gitalk 评论登录

默认 OAuth 代理失效会导致登录失败。本站用 Cloudflare Worker 转发：

```bash
npx wrangler deploy --config cloudflare/wrangler.toml
```

或在 Cloudflare 控制台创建 Worker，粘贴 `cloudflare/gitalk-oauth-proxy.js`，路由设为 `haoxiang.eu.org/gitalk-oauth`。

GitHub OAuth App 的 Authorization callback URL 填 `https://haoxiang.eu.org`，然后重新部署博客。

批量初始化 Issue（新文章）：`GITALK_GITHUB_TOKEN=xxx npm run gitalk`

## GitHub Pages Action

工作流：`.github/workflows/deploy.yml`（`peaceiris/actions-gh-pages@v4`）

`git push origin source` 后自动：`hexo generate` → 发布到 `master`（GitHub Pages）。也可在 Actions 页手动 Run workflow。

首次需配置：
1. Settings → Deploy keys：添加可写公钥
2. Settings → Secrets and variables → Actions：`ACTIONS_DEPLOY_KEY`（对应私钥）
3. Settings → Pages：Source 选 `master`

https://github.com/peaceiris/actions-gh-pages#readme
