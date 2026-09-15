const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'source', '_posts');
const DIR_L1 = { CODE: '开发', TOOL: '工具', OPS: '运维', ARCH: '架构', LIFE: '生活' };

const SERIES_L2 = {
  'Java开发全栈系列': 'Java',
  'Spring生态体系系列': 'Spring',
  '前端开发技术系列': '前端',
  'Python开发实战系列': 'Python',
  '区块链与以太坊开发系列': '区块链',
  '数据库深度解析系列': '数据与存储',
  'ZooKeeper系列': '数据与存储',
  '消息队列技术系列': '消息队列',
  '分布式系统核心系列': '分布式与微服务',
  '微服务架构实践系列': '分布式与微服务',
  '架构设计思想系列': '架构设计',
  'Kubernetes云原生系列': '云原生',
  'Docker容器化技术系列': '云原生',
  'Linux系统精通系列': 'Linux与网络',
  '网络协议深度解析系列': 'Linux与网络',
  '系统性能优化实战系列': '性能与安全',
  '系统安全与认证系列': '性能与安全',
  'Git版本控制精通系列': '工程效能',
  'Hexo博客搭建指南系列': '工程效能',
  '开发环境配置全攻略系列': '环境与安装',
  '操作系统安装指南系列': '环境与安装',
  '生活情感日记系列': '生活',
  '柯迪亚克': '车机',
  'IOS开发全栈系列': '移动端'
};

const L1_SET = new Set(Object.values(DIR_L1));
const VOID_TAGS = new Set([
  'Getting-Started', 'Development', 'Learning-Path', 'Learning-Resources',
  'Case-Study', 'Recommendation', 'Dockerfile'
]);

const BLOCKCHAIN_HINT = /solidity|ethereum|以太坊|智能合约|区块链|web3|tron|btc|bitcoin/i;
const JS_HINT = /javascript|typescript|vue|react|node\.?js|前端|webpack|vite|css|html|浏览器/i;

function guessOther(title, body, l1) {
  const t = title + '\n' + body.slice(0, 800);
  if (/斯柯达|柯迪亚克|中控/.test(t)) return '车机';
  if (/Spring|IOC|AOP|Boot|MyBatis/.test(t)) return 'Spring';
  if (/Kafka|RabbitMQ|RocketMQ|消息队列|TDMQ/.test(t)) return '消息队列';
  if (/Redis|MySQL|Mongo|Elastic|ClickHouse|ZooKeeper|数据库|SQL/.test(t)) return '数据与存储';
  if (/K8s|Kubernetes|Docker|Istio|KubeVela|云原生/.test(t)) return '云原生';
  if (/以太坊|Solidity|区块链|智能合约|Web3/.test(t)) return '区块链';
  if (/Vue|React|前端|TypeScript|Webpack|Vite|CSS|HTML/.test(t)) return '前端';
  if (/Python/.test(t)) return 'Python';
  if (/Git|Hexo|CI\/CD|Jenkins|测试/.test(t)) return '工程效能';
  if (/TCP|HTTP|网络|Linux|Shell|awk/.test(t)) return 'Linux与网络';
  if (/分布式|秒杀|微服务|高并发|架构/.test(t)) return l1 === '架构' ? '架构设计' : '分布式与微服务';
  if (/性能|优化|安全|认证|SSO|OAuth/.test(t)) return '性能与安全';
  if (/安装|环境配置|黑苹果|Windows|子系统/.test(t)) return '环境与安装';
  if (/Java|JVM|JDK|GC|线程|并发/.test(t)) return 'Java';
  if (l1 === '架构') return '架构设计';
  if (l1 === '运维') return '环境与安装';
  if (l1 === '生活') return '生活';
  if (l1 === '开发') return 'Java';
  return '工程效能';
}

function parseFM(raw) {
  const bom = raw.charCodeAt(0) === 0xfeff;
  const text = bom ? raw.slice(1) : raw;
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  return {
    bom,
    fm: text.slice(0, end + 4),
    body: text.slice(end + 4),
    rawPrefix: bom ? '\uFEFF' : ''
  };
}

function getTitle(fm) {
  const m = fm.match(/^title:\s*(.+)$/m);
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function getCategories(fm) {
  const list = fm.match(/^categories:\s*\r?\n((?:[ \t]*-[ \t]*.+\r?\n?)*)/m);
  if (list) {
    return list[1].split(/\r?\n/).map(l => l.replace(/^[ \t]*-[ \t]*/, '').trim()).filter(Boolean);
  }
  const one = fm.match(/^categories:\s*(.+)$/m);
  if (one && one[1].trim()) return [one[1].trim().replace(/^['"]|['"]$/g, '')];
  return [];
}

function getTags(fm) {
  const block = fm.match(/^tags:\s*\r?\n((?:[ \t]*-[ \t]*.+\r?\n?)*)/m);
  if (block) {
    return block[1].split(/\r?\n/).map(l => l.replace(/^[ \t]*-[ \t]*/, '').trim()).filter(Boolean);
  }
  const one = fm.match(/^tags:\s*\[([^\]]*)\]/m);
  if (one) {
    return one[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  return [];
}

function cleanTags(tags, title, body) {
  const text = title + '\n' + body;
  const out = [];
  for (let t of tags) {
    if (VOID_TAGS.has(t)) continue;
    if (t === 'Dockerfile') t = 'Docker';
    if (t === 'Life') t = '生活';
    if (t === 'Solidity' && !BLOCKCHAIN_HINT.test(text)) continue;
    if (t === 'Ethereum' && !BLOCKCHAIN_HINT.test(text)) continue;
    if (t === 'Blockchain' && !BLOCKCHAIN_HINT.test(text)) continue;
    if ((t === 'JavaScript' || t === 'TypeScript') && !JS_HINT.test(text) && /Kubernetes|Docker|Linux|JVM|Kafka|Redis|MySQL|运维|安装/.test(text)) continue;
    if (!out.includes(t)) out.push(t);
  }
  if (!out.length) {
    if (/Java|Spring|JVM/.test(text)) out.push('Java');
    else if (BLOCKCHAIN_HINT.test(text)) out.push('Solidity');
    else if (JS_HINT.test(text)) out.push('JavaScript');
    else if (/Python/.test(text)) out.push('Python');
    else if (/Golang|Go语言|\bGo\b/.test(text)) out.push('Go');
    else if (/Kubernetes|K8s/.test(text)) out.push('Kubernetes');
    else if (/Docker/.test(text)) out.push('Docker');
    else if (/生活|斯柯达|车机/.test(text)) out.push('生活');
    else out.push('Java');
  }
  return out.slice(0, 3);
}

function renderFM(fm, cats, tags) {
  let out = fm.replace(/\r\n/g, '\n');
  const catBlock = 'categories:\n  - ' + cats[0] + '\n  - ' + cats[1] + '\n';
  const tagBlock = 'tags:\n' + tags.map(t => '  - ' + t).join('\n') + '\n';

  if (/^categories:\s*\n(?:[ \t]*-[ \t]*.+\n)*/m.test(out)) {
    out = out.replace(/^categories:\s*\n(?:[ \t]*-[ \t]*.+\n)*/m, catBlock);
  } else if (/^categories:\s*.+$/m.test(out)) {
    out = out.replace(/^categories:\s*.+$/m, catBlock.trimEnd());
  } else {
    out = out.replace(/^---\n/, '---\n' + catBlock);
  }

  if (/^tags:\s*\n(?:[ \t]*-[ \t]*.+\n)*/m.test(out)) {
    out = out.replace(/^tags:\s*\n(?:[ \t]*-[ \t]*.+\n)*/m, tagBlock);
  } else if (/^tags:\s*\[.*\]\s*$/m.test(out)) {
    out = out.replace(/^tags:\s*\[.*\]\s*$/m, tagBlock.trimEnd());
  } else if (/^tags:\s*.+$/m.test(out)) {
    out = out.replace(/^tags:\s*.+$/m, tagBlock.trimEnd());
  } else {
    out = out.replace(/\n---\s*$/, '\n' + tagBlock + '---');
  }
  return out.replace(/\n/g, '\r\n');
}

let changed = 0;
const l2count = {};

function process(file, dirKey) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = parseFM(raw);
  if (!parsed) return;
  const { fm, body, rawPrefix } = parsed;
  const l1 = DIR_L1[dirKey];
  if (!l1) return;

  const cats = getCategories(fm);
  const title = getTitle(fm);
  let l2;
  if (cats.length >= 2 && L1_SET.has(cats[0])) {
    l2 = cats[1];
  } else {
    const oldCat = cats[0] || '其他系列';
    l2 = SERIES_L2[oldCat] || guessOther(title, body, l1);
  }

  const tags = cleanTags(getTags(fm), title, body);
  const newFM = renderFM(fm, [l1, l2], tags);
  const next = rawPrefix + newFM + body;
  if (next !== raw) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
  }
  l2count[l1 + '/' + l2] = (l2count[l1 + '/' + l2] || 0) + 1;
}

for (const dirKey of Object.keys(DIR_L1)) {
  const dir = path.join(root, dirKey);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    process(path.join(dir, name), dirKey);
  }
}

console.log('changed=' + changed);
console.log(JSON.stringify(l2count, null, 2));
