var fs = require("fs");
var http = require('http');
var https = require('https');
var datetime = require("silly-datetime");
var cheerio = require('cheerio');
var callDB = require('./callSqlite.js');

//主域名 _blog_index_recommend_list
var author = 'csdn';
var domain = 'https://www.csdn.net/api/articles?type=more&category=java&shown_offset=0';
var arcList = [];
var newList = [];

//创建表
callDB.createTables("article");

crawler(domain);

//抓取文章列表
function crawler(domain) {

    var protocol = (new URL(domain).protocol == 'https:' ? https : http);
    protocol.encoding = 'utf-8';
    protocol.get(domain, function (res) {
        var html = '';
        res.on('data', function (chunk) {
            html += chunk;
        });
        res.on('end', function () {
            filterHtml(html);
            //nextPage( html );
        });
    });
}

//解析html页面
function filterHtml(html) {

    var json = JSON.parse(html);

    if (null != json){
        var articlesList = json.articles;
        articlesList.forEach(function(item,index) {
            var title = item.title;
            var url = item.url;
            var listTime = item.created_at;
            var cover = item.avatarurl;
            var desc = item.desc;

            arcList.push({
                title: title,
                cover: cover,
                url: url,
                desc: desc,
                content: '',
                times: listTime
            });

        });
    }

    setTimeout( function(){
        crawlerContent();
    }, 5000 );
}

//抓取文章内容
function crawlerContent() {
    var num = 0;
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
                    insertArrData();
                    callDB.closeDB();
                }
                //nextPage( html );
            });
        });
    });
}

/**
 * 过滤广告
 * @param title
 * @param html
 * @returns {*|jQuery|string}
 */
function filterContentHtml(title, html) {
    var $ = cheerio.load(html);
    //移除广告
    $("div.article_content").find("blockquote").remove();
    $("div.article_content").find("h1").prepend("<span>### </span>");
    $("div.article_content").find("h2").prepend("<span>#### </span>");
    $("div.article_content").find("h3").prepend("<span>##### </span>");
    $("div.article_content").find("h4").prepend("<span>###### </span>");
    $("div.article_content").find("code").prepend("<span> \n ```java \n  </span>");
    $("div.article_content").find("code").append("<span>\n  ``` \n </span>");

    /*var imageList = $("div.article_content").find("img");
    if (null != imageList.html()){
        imageList.each(function(index,item) {
            var imageUrl = item.attribs.src;
            var imgsText = "![Test](" + imageUrl + "  '" + title + "')";
            item.append().attribs.src = imgsText;
            //$("div.article-box__content").find(".content").find("img").append("![Test]("+imageUrl +"  '" +title+"')");
            //$("div.article-box__content").find(".content").find("img")[index] =  "![Test](" + imageUrl + "  '" + title + "')";
        });
    }*/

    var contentText = $("div.article_content").text();

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



//插入数据
function insertArrData() {
    newList.forEach(function(item,index){
        //写入文件
        if ('' != item.content){
            var htmlData = [[null, item.title, author, item.url, item.cover, item.desc, item.content,  item.times ]];
            var sql = "replace into article(id, title, source, url, cover, desc, content, times) values(?, ?, ?, ?, ?, ?, ?, ?)";
            callDB.insertDatas(sql,htmlData);
            writeFiles(index+1, item.title, item.cover, item.desc, item.content);
        }
    });
}

//写入文件
function writeFiles(index, title, cover, desc, content) {

    if (-1 != cover.indexOf(">-")){
        cover = cover.replace(">-","'");
        cover.append("'");
    }
    var titleTime = datetime.format(new Date(),'YYYY-MM-DD hh:mm:ss');

    var fileContent =
        "---\n" +
        "title: 推荐系列-"+title+"\n" +
        "categories: 热门文章\n" +
        "tags:\n" +
        "  - Popular\n" +
        "author: "+author+"\n" +
        "top: "+index+"\n" +
        "date: "+titleTime+"\n" +
        "cover_picture: '"+cover+"'\n" +
        "---\n" +
        "\n" +
        "&emsp;&emsp;"+desc+"\n" +
        "<!-- more -->\n"+ content;
    console.log(title + " File has been created-"+index + "cover_picture: '"+cover+"'");
    fs.writeFileSync("./source/_posts/"+title+".md", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}
