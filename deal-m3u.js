var fs = require("fs");
var http = require('http');
var https = require('https');
var datetime = require("silly-datetime");
var cheerio = require('cheerio');
var callDB = require('./callSqlite.js');

//主域名 _blog_index_recommend_list
var author = 'csdn';
var domain = 'https://haoxiang.eu.org/tv.m3u';
var arcList = [];
var newList = [];
var tvId = 0;
var ipVerion = "IPV6";

//创建表
var createTableSql = "create table if not exists tv_show (id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT, tv_name TEXT, tv_url TEXT, ip_verion TEXT,  display TEXT, times TEXT);";
callDB.createTables("tv_show", createTableSql);

crawler(domain);

//获取m3u文件
function crawler(domain) {
    var domainpage = domain;
    var protocol = (new URL(domainpage).protocol == 'https:' ? https : http);
    protocol.encoding = 'utf-8';
    protocol.get(domainpage, function (res) {
        var html = '';
        res.on('data', function (chunk) {
            html += chunk;
        });
        res.on('end', function () {
            filterHtml(html);
        });
    });
}

//解析html页面
function filterHtml(html) {
    var snsArr = html.split('#EXTINF:-1');
    snsArr.forEach((item, index) => {
        var snsArr2 = item.split(/[(\r\n)\r\n]+/);
        if (snsArr2.length > 2) {
            var tvTitle = snsArr2[0];
            var tvUrl = snsArr2[1];
            if (tvTitle.indexOf('#EXTM3U') == -1 && !!tvUrl) {
                var groupName = tvTitle.substring(tvTitle.lastIndexOf("group-title=") + 13, tvTitle.indexOf(",") - 1);
                var tvName = tvTitle.substring(tvTitle.indexOf(",") + 1, tvTitle.lastIndexOf("display=") - 1);
                var displayMark = tvTitle.substring(tvTitle.lastIndexOf("display=") + 9, tvTitle.length - 1);

                if (tvUrl.indexOf("]") != -1) {
                    ipVerion = "IPV4";
                }

                //查询
                //var querySql = "select * from tv_show where tv_url = "+"'"+tvUrl+"'";
                //var queryResult = callDB.queryDatasByUrl(querySql);
                //var htmlData = [[null, groupName, tvName, tvUrl, ipVerion, displayMark, null]];
                //var sql = "insert or replace into tv_show(id, group_name, tv_name, tv_url, ip_verion, display, times) values(?, ?, ?, ?, ?, ?, ?)";
                //callDB.insertDatas(sql, htmlData);
            }
        }
    })

    callDB.closeDB();
}


