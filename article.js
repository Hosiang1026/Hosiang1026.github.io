var fs = require("fs");
var http = require('http');
var https = require('https');
var datetime = require("silly-datetime");
var cheerio = require('cheerio');
var callDB = require('./callSqlite.js');

//主域名 _blog_index_recommend_list
var domain = 'https://www.oschina.net/blog/widgets/_blog_index_recommend_list?type=ajax&';
var arcList = [];
var newList = [];

//创建表
callDB.createTables("article");

crawler(domain);

//抓取文章列表
function crawler(domain) {
    var i = 1;
    do{
        var domainpage = domain + 'p=' + i;
        i++;
        var protocol = (new URL(domainpage).protocol == 'https:' ? https : http);
        protocol.encoding = 'utf-8';
        protocol.get(domainpage, function (res) {
            var html = '';
            res.on('data', function (chunk) {
                html += chunk;
            });
            res.on('end', function () {
                filterHtml(html);
                //nextPage( html );
            });
        });
    }while (i != 15)
}

//解析html页面
function filterHtml(html) {
    var $ = cheerio.load(html);

    var aPost = $(".blog-item");
    aPost.each(function (index,item) {
        var ele = $(this);
        var title = ele.find(".header").attr("title");
        var url = ele.find(".header").attr("href");
        var listTime = ele.find(".extra").find(".list").find(".item")[1].children[0].data;
        //var cover = ele.find(".image").children()[0].attribs.src;
        var cover = "";
        if (null != ele.find(".image").html()){
            cover = ele.find(".image")[0].children[1].attribs.src;
        }

        var desc = ele.find(".line-clamp").text();
        //ele.find("small a").remove();
        console.log(title + "-- " + url);
        //特殊符号处理
        var reg=/\\|\/|\?|\？|\*|\"|\“|\”|\'|\‘|\’|\<|\>|\{|\}|\[|\]|\【|\】|\：|\:|\、|\^|\$|\!|\~|\`|\|/g;
        title = title.replace(reg,"-");
        arcList.push({
            title: title,
            cover: cover,
            url: url,
            desc: desc,
            content: '',
            times: listTime
        });
    });

    crawlerContent();
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
    $("div.article-box__content").find("blockquote").remove();
    $("div.article-box__content").find(".content").find("h1").prepend("<span>### </span>");
    $("div.article-box__content").find(".content").find("h2").prepend("<span>#### </span>");
    $("div.article-box__content").find(".content").find("h3").prepend("<span>##### </span>");
    $("div.article-box__content").find(".content").find("h4").prepend("<span>###### </span>");
    $("div.article-box__content").find(".content").find("code").prepend("<span> \n ```java \n  </span>");
    $("div.article-box__content").find(".content").find("code").append("<span>\n  ``` \n </span>");
    var image = $("div.article-box__content").find(".content").find("img");
    if (null != image){
        var imageUrl = image.attr("src");
        $("div.article-box__content").find(".content").find("img").append("![Test]("+imageUrl +"  '" +title+"')");
    }

    /* var aPost = $("#articleContent").find("img");
     aPost.each(function (index,item) {
         var ele = $(this);
         var imgs = item.attribs.src;
         var imgsText = "![Test]("+imgs+" "+title+")"+"\n";
         item.after(imgsText);
         item.text
     });*/
    var contentText = $("div.article-box__content").find(".content").text();

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
            var htmlData = [[null, item.title, item.url, item.desc, item.content, item.times]];
            var sql = "replace into article(id, title, url, desc, content, times) values(?, ?, ?, ?, ?, ?)";
            callDB.insertDatas(sql,htmlData);
            writeFiles(index+1, item.title, item.cover, item.desc, item.content);
        }
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
        "  - Popular\n" +
        "author: OSChina\n" +
        "top: "+index+"\n" +
        "date: "+titleTime+"\n" +
        "cover_picture: '"+cover+"'\n" +
        "---\n" +
        "\n" +
        "&emsp;&emsp;"+desc+"\n" +
        "<!-- more -->\n"+ content;
    title = title.replace("?","");
    fs.writeFileSync("./source/_posts/"+title+".md", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(title + " File has been created-"+index);
    });
}
