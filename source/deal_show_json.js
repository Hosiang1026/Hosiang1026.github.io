var fs = require("fs");
var http = require('http');
var https = require('https');

//主域名
var domain = 'https://haoxiang.eu.org/tv.m3u';
var groupArr = ['央视节目','卫视节目','地方节目'];
var netmaskVer = "ipv4"
var ipv4_cctv_sort = 0;
var ipv4_wstv_sort = 0;
var ipv4_dftv_sort = 0;
var ipv6_cctv_sort = 0;
var ipv6_wstv_sort = 0;
var ipv6_dftv_sort = 0;
var ipv4_cctv_list = [];
var ipv4_wstv_list = [];
var ipv4_dftv_list = [];
var ipv6_cctv_list = [];
var ipv6_wstv_list = [];
var ipv6_dftv_list = [];

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
                    dealIpv6List(groupName, tvName, tvUrl);
                }else{
                    dealIpv4List(groupName, tvName, tvUrl);
                }
            }
        }
    })

    var ipv4_list={cctv:ipv4_cctv_list, wstv:ipv4_wstv_list, dftv:ipv4_dftv_list};
    var ipv6_list={cctv:ipv6_cctv_list, wstv:ipv6_wstv_list, dftv:ipv6_dftv_list};
    var obj={ipv4:ipv4_list, ipv6:ipv6_list};
    var fileContent = JSON.stringify(obj,"","\t");
    console.log(fileContent);
    fs.writeFileSync("./show.json", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}


function dealIpv4List(groupName, tvName, tvUrl) {
    if (groupName.indexOf(groupArr[0]) != -1){
        ipv4_cctv_sort = ipv4_cctv_sort +1;
        ipv4_cctv_list.push({
            sort: ipv4_cctv_sort,
            display: 0,
            group: groupName,
            name: tvName.substring(tvName.lastIndexOf(",")+1),
            url: tvUrl
        });
    }

    if (groupName.indexOf(groupArr[1]) != -1){
        ipv4_wstv_sort = ipv4_wstv_sort +1;
        ipv4_wstv_list.push({
            sort: ipv4_wstv_sort,
            display: 0,
            group: groupName,
            name: tvName.substring(tvName.lastIndexOf(",")+1),
            url: tvUrl
        });
    }

    if (groupName.indexOf(groupArr[2]) != -1){
        ipv4_dftv_sort = ipv4_dftv_sort +1;
        ipv4_dftv_list.push({
            sort: ipv4_dftv_sort,
            display: 0,
            group: groupName,
            name: tvName.substring(tvName.lastIndexOf(",")+1),
            url: tvUrl
        });
    }
}

function dealIpv6List(groupName, tvName, tvUrl) {
    if (groupName.indexOf(groupArr[0]) != -1){
        ipv6_cctv_sort = ipv6_cctv_sort +1;
        ipv6_cctv_list.push({
            sort: ipv4_cctv_sort,
            display: 0,
            group: groupName,
            name: tvName.substring(tvName.lastIndexOf(",")+1),
            url: tvUrl
        });
    }

    if (groupName.indexOf(groupArr[1]) != -1){
        ipv6_wstv_sort = ipv6_wstv_sort +1;
        ipv6_wstv_list.push({
            sort: ipv4_wstv_sort,
            display: 0,
            group: groupName,
            name: tvName.substring(tvName.lastIndexOf(",")+1),
            url: tvUrl
        });
    }

    if (groupName.indexOf(groupArr[2]) != -1){
        ipv6_dftv_sort = ipv6_dftv_sort +1;
        ipv6_dftv_list.push({
            sort: ipv4_dftv_sort,
            display: 0,
            group: groupName,
            name: tvName.substring(tvName.lastIndexOf(",")+1),
            url: tvUrl
        });
    }
}