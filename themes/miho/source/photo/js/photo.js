
var that = this;
var current = 1;
var size = 8;
var flag = true;
var passFlag = true;
var datas;
var photosData;
var host = "https://www.hosiang.cn";
var lockUrl = host + "/images/album_lock.jpg";

$.getJSON(host+"/photo/album/photo.json", function (data) {
    datas = data;
    that.render(data, current);
});

//首页
$("#firstPage").click(function(){
    if(flag){
        that.render(datas, parseInt(1));
    }else{
        getPhotoList(photosData, parseInt(1));
    }
});

//上页
$("#prePage").click(function(){
    var pages = $("#pages").text();
    current = $("#current").text();
    nextCurrent = parseInt(current)-1;
    if(nextCurrent>0&&nextCurrent<=pages){
        if(flag){
            that.render(datas,nextCurrent);
        }else{
            getPhotoList(photosData, nextCurrent);
        }
    }

});

//下页
$("#nextPage").click(function(){
    var pages = $("#pages").text();
    current = $("#current").text();
    var nextCurrent = parseInt(current)+1;

    if(nextCurrent>0&&nextCurrent<=pages){
        if(flag){
            that.render(datas, nextCurrent);
        }else{
            getPhotoList(photosData, nextCurrent);
        }
    }
});

//尾页
$("#lastPage").click(function(){
    var pages = $("#pages").text();
    if(flag){
        that.render(datas, parseInt(pages));
    }else{
        getPhotoList(photosData, parseInt(pages));
    }
});

//跳转
$("#jumpPage").click(function(){
    var jumpPage = $("#jumpWhere").val();
    if(flag){
        that.render(datas, parseInt(jumpPage));
    }else{
        getPhotoList(photosData, parseInt(jumpPage));
    }
});


//打开相册
function openAlbum(id){

    //验证访问权限
    var password = $('#passwordId'+id).val();
    if(password != ''){
        verifyPassword(password);
    }else{
        passFlag = true;
    }

    if(passFlag){
        $('#albumList').hide();
        $('#test').show();
        $('#returnAlbum').show();
        flag = false;
        var albumId = $('#albumId'+id).val();
        photosData = datas[albumId].photos;
        getPhotoList(photosData, current);
    }

}

//验证密码
function verifyPassword(password){
    passFlag = false;
    var hashword = getAES(prompt('此相册已被加密，需要输入密码访问')).toString();
    if (hashword !== password){
        alert('抱歉，密码错误, 您没有权限访问！');
    }else{
        passFlag = true;
    }
}

//返回相册
$("#returnAlbum").click(function(){
    $('#test').hide();
    $('#albumList').show();
    $('#returnAlbum').hide();
    flag = true;
    that.render(datas, current);
});

var render = function(data,current){

    var total = data.length;

    if (flag) {
        setPage(total,current);
    }

    $("#albumList").empty();

    var forcur = current*size-size;
    var forlen = current*size;


    if (forlen>total){
        forlen = total;
    }

    for (var i = forcur; i < forlen; i++) {

        var sort = data[i].sort;
        var albumName = data[i].name;
        var password = data[i].password;
        var photosArr = data[i].photos;
        //默认第一张为封面
        var thumbnail = photosArr[0].thumbnail;
        var url = host + thumbnail;

        //加锁图片
        if(password !=""){
            url = lockUrl;
        }

        var img ='<div class="iso-box design col-6 col-sm-4 col-md-4 col-lg-3 col-xl-3" >' +
            '<div style="background: rgba(204,204,204,0.8); width: 300px; height: 218px;"> ' +
            '<div><input id="albumId'+sort+'" value="'+sort+'" type="hidden" />' +
            '<input id="passwordId'+sort+'" value="'+password+'" type="hidden" />' +
            '<img  id = "'+sort+'" onclick="openAlbum(this.id)" src="'+url+'" alt="Image" class="img-fluid" style="padding-top: 6px;margin-left: 6px; width: 280.5px; height: 210.5px;"></div> ' +
            ' </div>' +
            '<div align="center"><p>'+albumName+'</p></div>\n' +
            '</div>';
        $("#albumList").append(img);

        if (!flag) {
            getPhotoList(photosArr, current);
        }
    }


};



function getPhotoList(data,current) {

    var total = data.length;
    setPage(total,current);

    $("#test").empty();

    for (var i = current*size-size; i <  current*size; i++) {

        var imgName = data[i].name;
        var url = host + data[i].thumbnail;
        var img = '<div class="iso-box design col-6 col-sm-4 col-md-4 col-lg-3 col-xl-3" >' +
            '<a href= "' + url + '"><img src="' + url + '" alt="Image" class="img-fluid" style="padding-top: 6px;margin-left: 6px; width: 280.5px; height: 210.5px;"></a> ' +
            '<div align="center"><p>' + imgName + '</p></div>\n' +
            '</div>';

        $("#test").append(img);
    }
}

function setPage(total,current) {

    var pages = Math.ceil(total/size);

    if (current<= 0){
        current = 1;
    }

    if (current>pages){
        $("#current").text(pages);
    }else{
        $("#current").text(current);
    }

    $("#pages").text(pages);
    $("#total").text(total);

    $("#test").empty();
    $("#jumpWhere").empty();

    for (var k = current-1; k < pages; k++) {
        $("<option value="+parseInt(k+1)+">"+parseInt(k+1)+"</option>").appendTo("#jumpWhere");
    }

}
