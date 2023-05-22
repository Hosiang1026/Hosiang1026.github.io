//需要推送的网站链接
var content = "https://haoxiang.eu.org/";
//对应配置post推送的接口说明
var options = {
    host: "data.zz.baidu.com",
    path: path,//接口的调用地址
    method: "post",
    "User-Agent": "curl/7.12.1",
    headers: {
        "Content-Type": "text/plain",
        "Content-Length": content.length
    }
};
var req = http.request(options, function (res) {
    res.setEncoding("utf8");
    res.on("data", function (data) {
        console.log("data:", data); //返回的数据
    });
});
req.write(content);
req.end;