const fs = require('fs');
const path = require('path');
const url = require('url');

const xmlParser = require('xml-parser');

const config = {
    username: 'Hosiang1026',
    repo: 'bolg-comment',
    token: process.env.GITALK_GITHUB_TOKEN || '',
    sitemap: path.join(__dirname, './public/sitemap.xml'),
    cache: true,
    gitalkCacheFile: path.join(__dirname, './gitalk-init-cache.json'),
    gitalkErrorFile: path.join(__dirname, './gitalk-init-error.json'),
};

const api = 'https://api.github.com/repos/' + config.username + '/' + config.repo + '/issues';

/**
 * 读取 sitemap 文件
 * 远程 sitemap 文件获取可参考 https://www.npmjs.com/package/sitemapper
 */
const sitemapXmlReader = (file) => {
    try {
        const data = fs.readFileSync(file, 'utf8');
        const sitemap = xmlParser(data);
        let ret = [];
        sitemap.root.children.forEach(function (url) {
            const loc = url.children.find(function (item) {
                return item.name === 'loc';
            });
            if (!loc) {
                return false;
            }
            const title = url.children.find(function (item) {
                return item.name === 'title';
            });
            const desc = url.children.find(function (item) {
                return item.name === 'desc';
            });
            const date = url.children.find(function (item) {
                return item.name === 'date';
            });
            ret.push({
                url: loc.content,
                title: title.content,
                desc: desc.content,
                date: date.content,
            });
        });
        return ret;
    } catch (e) {
        return [];
    }
};

// 获取 gitalk 使用的 id
const getGitalkId = ({
                         url: u,
                         date
                     }) => {
    const link = url.parse(u);
    // 链接不存在，不需要初始化
    if (!link || !link.pathname) {
        return false;
    }
    if (!date) {
        return false;
    }
    return  link.pathname;
};

/**
 * 通过以请求判断是否已经初始化
 * @param {string} gitalk 初始化的id
 * @return {[boolean, boolean]} 第一个值表示是否出错，第二个值 false 表示没初始化， true 表示已经初始化
 */
const getIsInitByRequest = async (id) => {
    await new Promise((r) => setTimeout(r, 1000));
    try {
        const response = await fetch(api + '?labels=' + 'Gitalk,' + id, {
            method: 'GET',
            headers: {
                'Authorization': 'token ' + config.token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        if (response.status != 200) {
            return [response, false];
        }
        const res = await response.json();
        if (res.length > 0) {
            return [false, true];
        }
        return [false, false];
    } catch (err) {
        return [err, false];
    }
};

/**
 * 通过缓存判断是否已经初始化
 * @param {string} gitalk 初始化的id
 * @return {boolean} false 表示没初始化， true 表示已经初始化
 */
const getIsInitByCache = (() => {
    // 判断缓存文件是否存在
    let gitalkCache = false;
    try {
        gitalkCache = require(config.gitalkCacheFile);
    } catch (e) {}
    return function (id) {
        if (!gitalkCache) {
            return false;
        }
        if (gitalkCache.find(({
                                  id: itemId
                              }) => (itemId === id))) {
            return true;
        }
        return false;
    };
})();

// 根据缓存，判断链接是否已经初始化
// 第一个值表示是否出错，第二个值 false 表示没初始化， true 表示已经初始化
const idIsInit = async (id) => {
    if (!config.cache) {
        return await getIsInitByRequest(id);
    }
    // 如果通过缓存查询到的数据是未初始化，则再通过请求判断是否已经初始化，防止多次初始化
    if (getIsInitByCache(id) === false) {
        return await getIsInitByRequest(id);
    }
    return [false, true];
};

// 初始化
const gitalkInit = async ({
                        url,
                        id,
                        title,
                        desc
                    }) => {
    //创建issue
    const reqBody = {
        'title': title,
        'labels': ['Gitalk', id],
        'body': url + '\r\n\r\n' + desc
    };

    try {
        const response = await fetch(api, {
            method: 'POST',
            headers: {
                'Authorization': 'token ' + config.token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(reqBody)
        });
        if (response.status != 201) {
            return [response, false];
        }
        return [false, true];
    } catch (err) {
        return [err, false];
    }
};


/**
 * 写入内容
 * @param {string} fileName 文件名
 * @param {string} content 内容
 */
const write = async (fileName, content, flag = 'w+') => {
    return new Promise((resolve) => {
        fs.open(fileName, flag, function (err, fd) {
            if (err) {
                resolve([err, false]);
                return;
            }
            fs.writeFile(fd, content, function (err) {
                if (err) {
                    resolve([err, false]);
                    return;
                }
                fs.close(fd, (err) => {
                    if (err) {
                        resolve([err, false]);

                    }
                });
                resolve([false, true]);
            });
        });
    });
};

const init = async () => {
    const urls = sitemapXmlReader(config.sitemap);
    // 报错的数据
    const errorData = [];
    // 已经初始化的数据
    const initializedData = [];
    // 成功初始化数据
    const successData = [];
    for (const item of urls) {
        const {
            url,
            date,
            title,
            desc
        } = item;
        const id = getGitalkId({
            url,
            date
        });
        if (!id) {
            console.log(`id: 生成失败 [ ${id} ] `);
            errorData.push({
                ...item,
                info: 'id 生成失败',
            });
            continue;
        }
        const [err, res] = await idIsInit(id);
        if (err) {
            console.log(`Error: 查询评论异常 [ ${title} ] , 信息：`, err || '无');
            errorData.push({
                ...item,
                info: '查询评论异常',
            });
            continue;
        }
        if (res === true) {
            console.log(`--- Gitalk 已经初始化 --- [ ${title} ] `);
            initializedData.push({
                id,
                url,
                title,
            });
            continue;
        }
        console.log(`Gitalk 初始化开始... [ ${title} ] `);
        const [e, r] = await gitalkInit({
            id,
            url,
            title,
            desc
        });
        if (e || !r) {
            console.log(`Error: Gitalk 初始化异常 [ ${title} ] , 信息：`, e || '无');
            errorData.push({
                ...item,
                info: '初始化异常',
            });
            continue;
        }
        successData.push({
            id,
            url,
            title,
        });
        console.log(`Gitalk 初始化成功! [ ${title} ] `);

    }

    console.log(''); // 空输出，用于换行
    console.log('--------- 运行结果 ---------');
    console.log(''); // 空输出，用于换行

    if (errorData.length !== 0) {
        console.log(`报错数据： ${errorData.length} 条。参考文件 ${config.gitalkErrorFile}。`);
        await write(config.gitalkErrorFile, JSON.stringify(errorData, null, 2));
    }

    console.log(`本次成功： ${successData.length} 条。`);

    // 写入缓存
    if (config.cache) {
        console.log(`写入缓存： ${(initializedData.length + successData.length)} 条，已初始化 ${initializedData.length} 条，本次成功： ${successData.length} 条。参考文件 ${config.gitalkCacheFile}。`);
        await write(config.gitalkCacheFile, JSON.stringify(initializedData.concat(successData), null, 2));
    } else {
        console.log(`已初始化： ${initializedData.length} 条。`);
    }
};

init();