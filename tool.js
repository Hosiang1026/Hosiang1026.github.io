"use strict";
var fs = require("fs");
var request = require("request");
var date = require("silly-datetime");
var baseUrl = "/photo/album/";
var albumPath = "./themes/miho/source/photo/album/";

var arr = [];
var sorts = 0;
var components = [];

var albumNameMap = {
    "image": "博客配图",
    "picture": "日常生活",
    "system": "网站图片",
    "diary": "加密相册"
};

const files = fs.readdirSync(albumPath);
files.forEach(function (item) {
    var stat = fs.lstatSync(albumPath + item);
    if (stat.isDirectory() === true) {
        components.push(item)
    }
});

console.log(components);

/**
 * 遍历文件夹
 */
for(var j = 0,len=components.length; j < len; j++) {
    var value = components[j];

    //读取资源文件
    readFolder(value);
}


/**
 * 读取资源文件
 * @param path
 * @param urlPath
 */
function readFolder(value){

    var photosArr = [];
    var albumPassword = "";
    var urlPath = baseUrl + value+ "/";
    var path = albumPath + value+"/";

    var albumName = albumNameMap[value];

    if (undefined == albumName){
        albumName = value;
    }

    if (-1 !=albumName.indexOf("密")) {
        albumPassword = "+ahiJogQTpDxQ8yIGrMGlw==";
    }else{
        albumPassword = "";
    }

    fs.readdir(path, function (err, files) {
        if (err) {
            return;
        }

        (function iterator(index) {
            fs.stat(path + files[index], function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile()) {

                    var photo = {};
                    var thumbnail = files[index];
                    //npm install silly-datetime
                    var today = date.format(new Date(),'YYYY-MM-DD');
                    photo.sort = index;
                    photo.name = today + " " + albumName + "(" + index + ")";
                    photo.thumbnail = urlPath + thumbnail;
                    photo.description ="照片描述";

                    photosArr.push(photo);

                }
                iterator(index + 1);

            });


            if (index == files.length) {
                var albumObjwww = {};
                albumObjwww.sort = sorts;
                albumObjwww.name = albumName;
                albumObjwww.password = albumPassword;
                albumObjwww.description = "测试相册描述";
                albumObjwww.photos = photosArr;
                arr.push(albumObjwww);
                sorts++;
                if (arr.length == components.length){
                    //写入Json文件
                    writeJsonFile(arr);
                }
            }
        }(0));

    });
}

/**
 * 写入Json文件
 */
function writeJsonFile(arr) {
    console.log(JSON.stringify(arr, null, "\t"));
    fs.writeFile(albumPath + "photo.json", JSON.stringify(arr, null, "\t"), function (err) {
        if (err) throw err;
        console.log('write photo.json success!');
    });

}
