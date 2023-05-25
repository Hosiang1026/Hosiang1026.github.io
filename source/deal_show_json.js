var fs = require("fs");
var http = require('http');
var https = require('https');

//主域名
var domain = 'https://haoxiang.eu.org/tv.m3u';
var groupArr = ['央视节目','卫视节目','地方节目'];
var netmaskVer = "ipv4"
var sort1 = 0;
var sort2 = 0;
var sort3 = 0;
var arcList1 = [];
var arcList2 = [];
var arcList3 = [];

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
    snsArr.forEach((item,index)=>{
        var snsArr2 = item.split(/[(\r\n)\r\n]+/);
        if(snsArr2.length>2){
            var tvName = snsArr2[0];
            var tvUrl = snsArr2[1];
            if (tvName.indexOf('#EXTM3U') == -1&&!!tvUrl){
                var groupName = tvName.substring(tvName.lastIndexOf("=")+2, tvName.lastIndexOf(",")-1);
                if (tvUrl.indexOf("]") != -1){
                    netmaskVer = "ipv6"
                }
                if (groupName.indexOf(groupArr[0]) != -1){
                    sort1 = sort1 +1;
                    arcList1.push({
                        sort: sort1,
                        display: 0,
                        netmask: netmaskVer,
                        group: groupName,
                        name: tvName.substring(tvName.lastIndexOf(",")+1),
                        url: tvUrl
                    });
                }

                if (groupName.indexOf(groupArr[1]) != -1){
                    sort2 = sort2 +1;
                    arcList2.push({
                        sort: sort2,
                        display: 0,
                        netmask: netmaskVer,
                        group: groupName,
                        name: tvName.substring(tvName.lastIndexOf(",")+1),
                        url: tvUrl
                    });
                }

                if (groupName.indexOf(groupArr[2]) != -1){
                    sort3 = sort3 +1;
                    arcList3.push({
                        sort: sort3,
                        display: 0,
                        netmask: netmaskVer,
                        group: groupName,
                        name: tvName.substring(tvName.lastIndexOf(",")+1),
                        url: tvUrl
                    });
                }
            }
        }
    })

    var ipv4_obj={cctv:arcList1, wctv:arcList2, dctv:arcList3};
    var fileContent = JSON.stringify(ipv4_obj,"","\t");
    console.log(fileContent);
    fs.writeFileSync("./show.json", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}
