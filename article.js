var fs = require("fs");
var http = require('http');
var https = require('https');
var datetime = require("silly-datetime");
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var callDB = require('./callSqlite.js');


var url = 'https://www.oschina.net/blog/recommend';

//解析html页面
function filterHtml(html) {
    var $ = cheerio.load(html);
    var arcList = [];
    var aPost = $("#recommendArticleList").find("div.content");
    aPost.each(function (index,item) {
        var ele = $(this);
        var title = ele.find("a.header").attr("title");
        var url = ele.find("a.header").attr("href");

        var cover = $("#recommendArticleList").find("a.small")[index].children[1].attribs.src;
        var desc = ele.find("p.line-clamp").text();
        ele.find("small a").remove();
        var listTime =ele.find("div.item")[1].children[0].data;
        arcList.push({
            title: title,
            cover: cover,
            url: url,
            desc: desc,
            content: '',
            times: listTime
        });
    });

    //创建表
    callDB.createTables("article");

    crawlerContent(arcList);

    return arcList;
}

function filterContentHtml(title, html) {
    var $ = cheerio.load(html);
    //移除阿里云广告
    $("#articleContent").find("a").remove();

   /* var aPost = $("#articleContent").find("img");
    aPost.each(function (index,item) {
        var ele = $(this);
        var imgs = item.attribs.src;
        var imgsText = "![Test]("+imgs+" "+title+")"+"\n";
        item.after(imgsText);
        item.text
    });*/

    var contentText = $("#articleContent").text();

    return contentText;
}


function nextPage( html ){
    var $ = cheerio.load(html);
    var nextUrl = $("#pager a:last-child").attr('href');
    if ( !nextUrl ) return ;
    var curPage = $("#pager .current").text();
    if( !curPage ) curPage = 1;
    var nextPage = nextUrl.substring( nextUrl.indexOf( '=' ) + 1 );
    if ( curPage < nextPage ) crawler( nextUrl );
}

//抓取文章列表
function crawler(url) {
    var protocol = (new URL(url).protocol == 'https:' ? https : http);
    protocol.encoding = 'utf-8';
    protocol.get(url, function (res) {

        var html = '';
        var arcList = [];

        res.on('data', function (chunk) {
            html += chunk;
        });
        res.on('end', function () {
            arcList = filterHtml(html);
            //console.log( arcList );
            //nextPage( html );
        });
    });
}

crawler(url);

//抓取文章内容
function crawlerContent(arcList) {

    var num = 0;
    var newList = [];
    arcList.forEach(function(item,index) {
        var url = item.url;
        var title = item.title;
        var protocol = (new URL(url).protocol == 'https:' ? https : http);
        protocol.encoding = 'utf-8';
        protocol.get(url, function (res) {

            var html = '';
            var contentText = '';

            res.on('data', function (chunk) {
                html += chunk;
            });
            res.on('end', function () {
                contentText = filterContentHtml(title, html);
                arcList.forEach(function(item,index) {
                    if (title == item.title){
                        item.content = contentText;
                        newList.push(item);
                        num = num + 1;
                    }
                });
                //console.log(newList);
                if (arcList.length == num ){
                    insertArrData(newList);
                    callDB.closeDB();
                }
                //nextPage( html );
            });
        });
    });
}

//插入数据
function insertArrData(arcList) {
    arcList.forEach(function(item,index){
        var htmlData = [[null, item.title, item.url, item.desc, item.content, item.times]];
        var sql = "replace into article(id, title, url, desc, content, times) values(?, ?, ?, ?, ?, ?)";
        callDB.insertDatas(sql,htmlData);

        //写入文件
        writeFiles(index+1, item.title, item.cover, item.desc, item.content)
    });
}

//写入文件
function writeFiles(index, title, cover, desc, content) {

    var titleTime = datetime.format(new Date(),'YYYY-MM-DD hh:mm:ss');

    var fileContent =
        "---\n" +
        "title: 推荐系列-"+title+"\n" +
        "categories: 热门文章\n" +
        "tags:\n" +
        "  - Test\n" +
        "author: OSChina\n" +
        "top: "+index+"\n" +
        "date: "+titleTime+"\n" +
        "cover_picture: '"+cover+"'\n" +
        "---\n" +
        "\n" +
        "&emsp;&emsp;"+desc+"\n" +
        "<!-- more -->\n"+ content;
    title = title.replace("?","");
    fs.writeFile("./source/_posts/"+title+".md", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(title + " File has been created-"+index);
    });
}
