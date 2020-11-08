/**
 * 音乐播放器 备用 https://player.ilt.me
 * disclaimer: 插件修改于明月浩空免费版，仅用于学习交流，无商业价值
 *             如发现商业传播，将禁止软件的免费使用
 */
var autoPlayer = 1,
    randomPlayer = 1,
    defaultVolume = 75,
    showLrc = 1,
    greeting = '欢迎访问狂欢马克思！',
    showGreeting = 1,
    defaultAlbum = 1,
    background = 1,
    playerWidth = 275,
    coverWidth = 90,
    showNotes = 1,
    autoPopupPlayer = -1;

var mainColor ='89,88,137';
var font_color='0,0,0';

var songDemoList = [{"albumCovers":["/images/player_cover.jpg"],"albumNames":["Seve"],"artistNames":["Tez Cadey"],"author":"狂欢马克思","songIds":["30394891"],"songNames":["Seve"],"songSheetName":"默认歌单","songTypes":["wy"]}];
var songSheetList = [];

//var lrcstr ='[00:00.000] 作曲 : 金志文[00:01.000] 作词 : 王耀光[00:18.74]我一路看过千山和万水[00:23.09]我的脚踏遍天南和地北[00:27.57]日晒或是风吹 我都无所谓[00:32.10]路边那朵蔷薇 鲜红的纯粹[00:36.54]关掉了手机管他谁是谁[00:40.87]不要去理会是是与非非[00:45.35]天亮走到天黑 从不觉疲惫[00:49.99]黄昏中的堡垒 多颓废[00:53.47]如果迎着风就飞[00:57.56]俯瞰这世界有多美[01:02.09]让烦恼都灰飞[01:04.64]别去理会自我藉慰[01:10.87]如果还有梦就追[01:15.29]至少不会遗憾后悔[01:19.65]迎着光勇敢追[01:22.40]远走高飞 说走就走一回[01:25.91][01:52.22]翻过了山坡又踏过了水[01:56.33]跟心走别管东南和西北[02:00.89]前行或是后退 靠直觉发挥[02:05.21]日落下的余晖 有一点凄美[02:09.77]拥挤的城市布满了虚伪[02:14.16]何必去辩解谁错或是对[02:18.65]就让一切回归 童真的滋味[02:23.13]那自由的感觉 不会累[02:26.69]如果迎着风就飞[02:30.85]俯瞰这世界有多美[02:35.36]让烦恼都灰飞[02:38.06]别去理会自我藉慰[02:44.30]如果还有梦就追[02:48.66]至少不会遗憾后悔[02:53.17]迎着光勇敢追[02:55.66]远走高飞 说走就走一回[03:15.55]如果迎着风就飞[03:19.75]俯瞰这世界有多美[03:24.32]让烦恼都灰飞[03:26.91]别去理会自我藉慰[03:33.13]如果还有梦就追[03:37.65]至少不会遗憾后悔[03:42.01]迎着光勇敢追[03:44.71]远走高飞 说走就走一回[03:51.02]如果迎着风就追[03:55.38]俯瞰这世界有多美[03:59.83]让烦恼都灰飞[04:04.83]别去理会自我藉慰[04:08.64]如果还有梦就追[04:13.24]至少不会遗憾后悔[04:17.74]迎着光勇敢追[04:20.20]远走高飞 说走就走一回[04:23.49]音乐总监：山河[04:24.49]演奏乐队：高速公路乐队[04:25.49]混音：王梓同[04:26.49]演唱者：金志文';

var lzxPlayerInit = function () {
    var isPhone = false;
    // Test环境
    var isTest = true;
	var testKey = '8d38ed8b82974702820c79908b9db4b9';
	//var isTest = typeof lzxPlayerTest !== "undefined" && lzxPlayerTest;
    //var testKey = typeof lzxPlayerTestKey !== "undefined" ? lzxPlayerTestKey : null;
    var styleLoaded = typeof lzxPlayerStyleLoaded !== "undefined" && lzxPlayerStyleLoaded;
    if(navigator.userAgent.match(/(iPhone|iPod|Android|ios|Nokia|Black Berry|MIDP|Phone)/i)){
        isPhone = true
    }

    if(!isTest){
        // 判断是否已经加载
        var isLoad = localStorage.getItem("isLoad");
        var lastFeed = localStorage.getItem("lastFeed");
        isLoad = typeof isLoad === "undefined" ? false : isLoad === "true";
        isLoad = isLoad && typeof lastFeed !== "undefined" && new Date().getTime() - parseInt(lastFeed) < 2000;

        //禁止iframe嵌套 || 是否已加载
        if (top.location !== self.location || isLoad) {
            return
        }
        localStorage.setItem("isLoad", "true");
    }

    // 如果测试环境 && 未指定testKey
    if(isTest && testKey == null){
        return;
    }

    var jsUrl = $("#ilt").attr("src");
	var webURL = 'https://player.ilt.me';
    //var webURL = jsUrl.startsWith("http") ? jsUrl.substring(0,jsUrl.indexOf("/",8)) : window.location.origin;
    var keyId = isTest ? testKey : $("#ilt").attr("key");

    if(!styleLoaded){
        $("head").append('<link rel="stylesheet" type="text/css" href="' + webURL + '/player/css/player.css">');
        $("head").append('<link href="https://libs.baidu.com/fontawesome/4.2.0/css/font-awesome.css" rel="stylesheet" type="text/css">');
        lzxPlayerStyleLoaded = true;
    }

    $("body").append('<div id="lzxPlayer" style="bottom: 120px;">\n' +
        '    <div class="player">\n' +
        '        <canvas class="blur-img" width="365" height="155" id="canvas">您的浏览器不支持canvas，请更换高级版的浏览器！</canvas>\n' +
        '        <div class="blur-img">\n' +
        '            <img src="#" class="blur" style="top: 0; display: inline;"></div>\n' +
        '        <div class="infos">\n' +
        '            <div class="songstyle">\n' +
        '                <span>\n' +
        '                    <i class="fa fa-music"></i>\n' +
        '                    <span class="song"></span>\n' +
        '                </span>\n' +
        '                <span style="float: right;">\n' +
        '                    <i class="fa fa-clock-o"></i>\n' +
        '                    <span class="time">00:00 / 00:00</span></span>\n' +
        '            </div>\n' +
        '            <div class="artiststyle">\n' +
        '                <i class="fa fa-user"></i>\n' +
        '                <span class="artist"></span>\n' +
        '                <span class="moshi">\n' +
        '                    <i class="loop fa fa-random current"></i> 随机播放</span>\n' +
        '            </div>\n' +
        '            <div class="artiststyle">\n' +
        '                <i class="fa fa-folder"></i>\n' +
        '                <span class="artist1"></span>\n' +
        '                <span class="geci"></span>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="control">\n' +
        '            <span style="float:left">\n' +
        '                <i class="loop fa fa-retweet" title="顺序播放"></i>\n' +
        '                <i class="prev fa fa-backward" title="上一首"></i>\n' +
        '            </span>\n' +
        '            <span style="float:right">\n' +
        '                <i class="next fa fa-forward" title="下一首"></i>\n' +
        '                <i class="random fa fa-random current" title="随机播放"></i>\n' +
        '            </span>\n' +
        '        </div>\n' +
        '        <div class="status">\n' +
        '            <b>\n' +
        '                <i class="play fa fa-play" title="播放"></i>\n' +
        '                <i class="pause fa fa-pause" title="暂停"></i>\n' +
        '            </b>\n' +
        '            <div id="div1" class="note">\n' +
        '                <i class="fa fa-music" aria-hidden="true"></i>\n' +
        '            </div>\n' +
        '            <div id="div2" class="note">\n' +
        '                <i class="fa fa-music" aria-hidden="true"></i>\n' +
        '            </div>\n' +
        '            <div id="div3" class="note">\n' +
        '                <i class="fa fa-music" aria-hidden="true"></i>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="musicbottom">\n' +
        '            <div class="rate" style=" margin-top: 10px;">\n' +
        '                <div class="progress">\n' +
        '                    <div class="rate-buffered"></div>' +
        '                    <div class="rate-on" style="width: 0;">\n' +
        '                        <div class="drag"></div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '            <div class="icons" style=" margin-top: 5px;">\n' +
        '                <div class="switch-playlist">\n' +
        '                    <i class="fa fa-bars" title="播放列表"></i>\n' +
        '                </div>\n' +
        '                <div class="switch-ksclrc">\n' +
        '                    <i class="fa fa-toggle-on" title="关闭歌词"></i>\n' +
        '                </div>\n' +
        '                <div class="switch-down">\n' +
        '                    <a class="down">\n' +
        '                        <i class="fa fa-cloud-download" title="歌曲下载"></i>\n' +
        '                    </a>\n' +
        '                </div>\n' +
        '                <div class="new-volume">\n' +
        '                    <i class="volumeup fa fa-volume-up" title="音量"></i>\n' +
        '                    <div class="volume-controls" style="">\n' +
        '                        <div class="slider" data-direction="vertical">\n' +
        '                            <div class="progress2" style="height: 66%;">\n' +
        '                                <div class="drag" id="volume-drag"></div>\n' +
        '                            </div>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="cover"></div>\n' +
        '    </div>\n' +
        '    <div class="playlist">\n' +
        '        <div class="playlist-bd">\n' +
        '            <div class="album-list">\n' +
        '                <div class="musicheader"></div>\n' +
        '                <div class="list"></div>\n' +
        '            </div>\n' +
        '            <div class="song-list">\n' +
        '                <div class="musicheader">\n' +
        '                    <i class="fa fa-angle-right"></i>\n' +
        '                    <span></span>\n' +
        '                </div>\n' +
        '                <div class="list">\n' +
        '                    <ul></ul>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    <div class="switch-player">\n' +
        '        <i class="fa fa-angle-right" style="margin-top: 20px;"></i>\n' +
        '    </div>\n' +
        '</div>\n' +
        '<div id="lzxTips" style="top:50px;"></div>\n' +
        '<div id="lzxLrc"></div>');

    // 全局主色
    var audio = new Audio(),
        $player = $('#lzxPlayer'),
        $tips = $('#lzxTips'),
        $lk = $('#lzxKsc,#lzxLrc'),
        $switchPlayer = $('.switch-player', $player),
        $btns = $('.status', $player),
        $songName = $('.song', $player),
        $cover = $('.cover', $player),
        $songTime = $('.time', $player),
        $songList = $('.song-list .list', $player),
        $albumList = $('.album-list', $player),
        $songFrom = $('.player .artist', $player),
        $songFrom1 = $('.player .artist1', $player),
        $songFrom2 = $('.player .moshi', $player),
        $songFrom3 = $('.player .geci', $player),
        $songFrom4 = $('.player .switch-ksclrc', $player),
        $volumeSlider = $('.volume-controls .slider', $player);
        $rateBuffered = $('.musicbottom .rate-buffered', $player);
        $rateSlider = $('.rate .progress', $player);
        songFrom33 = '开启',
        songFrom44 = '',
        songFrom55 = '',
        roundcolor = '#6c6971',
        lightcolor = '#81c300',
        cur = 'current',
        ycgeci = true,
        first = 1,
        volume = $.cookie('lzx_player_volume') ? $.cookie('lzx_player_volume') : '0.666',
        albumId = 0,
        songId = 0,
        songTotal = 0,
        random = true,
        rateIsDown = false,
        rateMouse = {},
        rateTouch = {},
        hasgeci = true,
        cicleTime = null,
        hasLrc = false,
        lrcTimeLine = [],
        lrcHeight = 40,
        lrcTime = null,
        lrcCont = '',
        dogInterval = null,
        songFroms = {
            "wy":"网易音乐",
            "kg":"酷狗音乐",
            "qq":"QQ音乐",
            "xm":"虾米音乐",
            "local":"本地音乐"
        };

    if(isPhone){$('#lzxLrc').addClass('phone');$player.addClass('phone');$(".new-volume",$player).hide();}

    function formatSecond(t) {
        return ('00' + Math.floor(t / 60)).substr(-2) + ':' + ('00' + Math.floor(t % 60)).substr(-2)
    }

    $cover.html('<img src="/images/player_cover.jpg">');
    $songName.html('<a style="color:#f00">正在初始化</a>');
    $songFrom.html('<a style="color:#f00">www.hosiang.cn</a>');
    $songFrom1.html('<a style="color:#f00">音乐播放器</a>');
    $songFrom3.html('<i class="fa fa-times-circle"></i> 歌词未载入');

    // 播放器重载前的清理
    window.lzxPlayerReload = function () {
        try{clearInterval(cicleTime);}catch (e) {}
        try{clearInterval(lrcTime);}catch (e) {}
        try{clearInterval(dogInterval);}catch (e) {}
        $("#lzxPlayer").remove();
        $("#lzxLrc").remove();
        $("#lzxTips").remove();
        audio.pause();
    };

    var lzxMedia = {
        play: function () {
            $cover.addClass('coverplay');
            $player.addClass('playing');
            $rateBuffered.width(0);
            // 播放进度更新秒表
            cicleTime = setInterval(function(){
                if(!rateMouse.isDown && !rateTouch.isTouchDown){
                    $songTime.text(formatSecond(audio.currentTime) + ' / ' + formatSecond(audio.duration));
                    $(".rate-on",$rateSlider).width(audio.currentTime / audio.duration * 100+"%");
                }

                if (audio.currentTime < audio.duration / 2) {
                    $btns.css('background-image', 'linear-gradient(90deg, ' + roundcolor
                        + ' 50%, transparent 50%, transparent), linear-gradient('
                        + (90 + (270 - 90) / (audio.duration / 2) * audio.currentTime) + 'deg, ' + lightcolor + ' 50%, '
                        + roundcolor + ' 50%, ' + roundcolor + ')')
                } else {
                    $btns.css('background-image', 'linear-gradient('
                        + (90 + (270 - 90) / (audio.duration / 2) * audio.currentTime) + 'deg, ' + lightcolor
                        + ' 50%, transparent 50%, transparent), linear-gradient(270deg, ' + lightcolor + ' 50%, '
                        + roundcolor + ' 50%, ' + roundcolor + ')')
                }

                var timeRanges = audio.buffered;
                // 获取已缓存的时间  timeRanges.end(timeRanges.length - 1)

                // 计算百分比 展示进度
                if(timeRanges.length !== 0){
                    $rateBuffered.width(parseInt(timeRanges.end(timeRanges.length - 1) * 100 / audio.duration * 100) / 100 + '%')
                }
            }, 800);
            if (hasLrc) {
                lrcTime = setInterval(lzxLrc.lrc.play, 500);
                $('#lzxLrc').addClass('show');
                $('.switch-down').css('right', '65px');
                $('.switch-ksclrc').show()
            }
        },
        pause: function () {
            clearInterval(cicleTime);
            $player.removeClass('playing');
            $('.switch-ksclrc').hide();
            $('.switch-down').css('right', '35px');
            if (hasLrc) {
                lzxLrc.lrc.hide()
            }
        },
        error: function () {
            clearInterval(cicleTime);
            $player.removeClass('playing');
            lzxTips.show(songSheetList[albumId].songNames[songId] + ' - 资源获取失败！尝试获取下一首...');
            lzxMedia.next();
        },
        seeking: function () {
            lzxTips.show('加载中...')
        },
        volumechange: function () {
            var vol = window.parseInt(audio.volume * 100);
            $('.progress2', $volumeSlider).height(vol + '%');
            lzxTips.show('音量：' + vol + '%');
			if($.cookie != undefined){
			$.cookie("lzx_player_volume", audio.volume);	
			}
            
        },
        getInfos: function (id) {
            $cover.removeClass('coverplay');
            songId = id;
            allmusic();
            songFrom55 = songFroms[songSheetList[albumId].songTypes[songId]];
            musictype = songSheetList[albumId].songTypes[songId];
            netmusic();
        },
        getSongId: function (n) {
            return n >= songTotal ? 0 : n < 0 ? songTotal - 1 : n
        },
        next: function () {
            clearInterval(cicleTime);
            random ? lzxMedia.getInfos(window.parseInt(Math.random() * songTotal))
                : lzxMedia.getInfos(lzxMedia.getSongId(songId + 1));
        },
        prev: function () {
            clearInterval(cicleTime);
            random ? lzxMedia.getInfos(window.parseInt(Math.random() * songTotal))
                : lzxMedia.getInfos(lzxMedia.getSongId(songId - 1));
        }
    };
    var lzxTipsTime = null;
    var lzxTips = {
        show: function (cont) {
            clearTimeout(lzxTipsTime);
            $('#lzxTips').text(cont).addClass('show');
            this.hide()
        },
        hide: function () {
            lzxTipsTime = setTimeout(function () {
                $('#lzxTips').removeClass('show');
            }, 3000)
        }
    };
    //给audio添加监听事件  执行相应的函数
    audio.addEventListener('play', lzxMedia.play, false);
    audio.addEventListener('pause', lzxMedia.pause, false);
    audio.addEventListener('ended', lzxMedia.next, false);
    audio.addEventListener('playing', lzxMedia.playing, false);
    audio.addEventListener('volumechange', lzxMedia.volumechange, false);
    audio.addEventListener('error', lzxMedia.error, false);
    audio.addEventListener('seeking', lzxMedia.seeking, false);

    //侧边按钮点击事件
    $switchPlayer.click(function () {
        $player.toggleClass('show')
    });
    //音乐暂停事件
    $('.pause', $player).click(function () {
        hasgeci = false;
        $("li", $albumList).eq(albumId).addClass(cur).find(".artist").html("暂停播放 > ").parent().siblings()
            .removeClass(cur).find(".artist").html("").parent();
        lzxTips.show('暂停播放 - ' + songSheetList[albumId].songNames[songId]);
        $cover.removeClass('coverplay');
        audio.pause();
        setTimeout(function () {
            lzxTips.show("播放器下次访问将自动暂停");
        }, 4000);
        $.cookie("auto_playre", "no");
    });
    //音乐播放事件
    $('.play', $player).click(function () {
        hasgeci = true;
        $('#lzxLrc,#lzxKsc').show();
        $("li", $albumList).eq(albumId).addClass(cur).find(".artist").html("当前播放 > ").parent().siblings()
            .removeClass(cur).find(".artist").html("").parent();
        startPlay();
        setTimeout(function () {
            lzxTips.show("播放器下次访问将自动播放");
        }, 4000);
        $.cookie("auto_playre", "yes");
    });
    //上一首事件
    $('.prev', $player).click(function () {
        hasgeci = true;
        $('#lzxLrc,#lzxKsc').show();
        lzxMedia.prev();
        $.cookie("auto_playre", "yes");
    });
    //下一首事件
    $('.next', $player).click(function () {
        hasgeci = true;
        $('#lzxLrc,#lzxKsc').show();
        lzxMedia.next();
        $.cookie("auto_playre", "yes");
    });
    //随机播放按钮事件
    $('.random', $player).click(function () {
        $(this).addClass(cur);
        $('.loop', $player).removeClass(cur);
        random = true;
        lzxTips.show('随机播放');
        $songFrom2.html('<i class="random fa fa-random current"></i> 随机播放');
        $.cookie("random_play", true)
    });
    //顺序播放按钮事件
    $('.loop', $player).click(function () {
        $(this).addClass(cur);
        $('.random', $player).removeClass(cur);
        random = false;
        lzxTips.show('顺序播放');
        $songFrom2.html('<i class="loop fa fa-retweet"></i> 顺序播放');
        $.cookie("random_play", false)
    });
    //音量组件拖动事件
    $volumeSlider.click(function (e) {
        var documentTop = $(document).scrollTop();
        var progressHeight = $volumeSlider.height(),
            progressOffsetTop = $volumeSlider.offset().top - documentTop;
        var calcVolume = (1 - (e.clientY - progressOffsetTop) / progressHeight).toFixed(2);
        audio.volume = calcVolume > 1 ? 1 : calcVolume;
    });
    $rateSlider.click(function (e) {
        var progressWidth = $rateSlider.width(),
            progressOffsetLeft = $rateSlider.offset().left,
            eClientX = e.clientX;

        audio.currentTime = audio.duration * ((eClientX - progressOffsetLeft) / progressWidth)
    });
    var isDown = false;
    $('.drag', $volumeSlider).mousedown(function () {
        isDown = true;
    });

    $('.drag', $rateSlider).on("touchstart",(function (e) {
        rateTouch.progressWidth = $rateSlider.width();
        rateTouch.isTouchDown = true;
        rateTouch.startX = e.originalEvent.touches[0].clientX;
        rateTouch.rateOnWidth = parseFloat(($(".rate-on",$rateSlider).width() / rateTouch.progressWidth).toFixed(2));
    }));

    $('.drag', $rateSlider).mousedown(function (e) {
        rateMouse.progressWidth = $rateSlider.width();
        rateMouse.isDown = true;
        rateMouse.startX = e.clientX;
        rateMouse.rateOnWidth = parseFloat(($(".rate-on",$rateSlider).width() / rateMouse.progressWidth).toFixed(2));
    });

    window.addEventListener("touchmove",function(e){
        if(rateTouch.isTouchDown){
            var rate = parseFloat(((e.touches[0].clientX - rateTouch.startX) / rateTouch.progressWidth)
                .toFixed(2))+rateTouch.rateOnWidth;
            if(rate >= 0 && rate <= 1){
                $(".rate-on",$rateSlider).width(rate * 100 + '%');
                rateTouch.currentTime = audio.duration * rate;
                $songTime.text(formatSecond(rateTouch.currentTime) + ' / ' + formatSecond(audio.duration));
            }
        }
        return false;
    }, { passive: false });

    $(window).on({
        mousemove: function (e) {
            if (isDown) {
                var documentTop = $(document).scrollTop();
                var progressHeight = $volumeSlider.height(),
                    progressOffsetTop = $volumeSlider.offset().top - documentTop,
                    eClientY = e.clientY;
                if(eClientY >= progressOffsetTop && eClientY <= progressOffsetTop + progressHeight){
                    audio.volume = (1 - (eClientY - progressOffsetTop) / progressHeight).toFixed(2);
                }
            }else if(rateMouse.isDown){
                var rate = parseFloat(((e.clientX - rateMouse.startX) / rateMouse.progressWidth)
                    .toFixed(2))+rateMouse.rateOnWidth;
                if(rate >= 0 && rate <= 1){
                    $(".rate-on",$rateSlider).width(rate * 100 + '%');
                    rateMouse.currentTime = audio.duration * rate;
                    $songTime.text(formatSecond(rateMouse.currentTime) + ' / ' + formatSecond(audio.duration));
                }
            }
        },
        mouseup: function () {
            isDown = false;
            if(rateMouse.isDown){
                audio.currentTime = rateMouse.currentTime;
                rateMouse.isDown = false;
            }
        },
        // touchmove: function (e) {
        //
        // },
        touchend:function (e) {
            if(rateTouch.isTouchDown){
                audio.currentTime = rateTouch.currentTime;
                rateTouch.isTouchDown = false;
            }
        }
    });
    //播放列表按钮点击事件
    $('.switch-playlist').click(function () {
        $player.toggleClass('showAlbumList')
    });
    //返回专辑列表事件
    $songList.mCustomScrollbar();
    $('.song-list .musicheader,.song-list .fa-angle-right', $player).click(function () {
        $player.removeClass('showSongList')
    });
    //打开关闭歌词显示
    $('.switch-ksclrc').click(function () {
        $player.toggleClass('ksclrc');
        $('#lzxLrc').toggleClass('hide');
        $('#lzxKsc').toggleClass('hidePlayer');
        if (!$('#lzxLrc').hasClass('hide')) {
            ycgeci = true;
            if (hasLrc) {
                $songFrom3.html('<i class="fa fa-check-circle"></i> 歌词开启')
            }
            lzxTips.show('开启歌词显示');
            songFrom33 = '开启';
            $songFrom4.html('<i class="fa fa-toggle-on" title="关闭歌词"></i>');
        } else {
            ycgeci = false;
            if (hasLrc) {
                $songFrom3.html('<i class="fa fa-times-circle"></i> 歌词关闭');
            }
            lzxTips.show('歌词显示已关闭');
            songFrom33 = '关闭';
            $songFrom4.html('<i class="fa fa-toggle-off" title="打开歌词"></i>')
        }
        musicTooltip();
    });

    lzxPlayer.playList = {
        creat: {
            album: function () {
                $('.musicheader', $albumList).html('网易云音乐 - 专辑列表');
                var albumTotal = songSheetList.length,
                    albumList = '';
                for (var c = 0; c < albumTotal; c++) {
                    albumList += '<li><i class="fa fa-angle-right"></i><span class="index">' + (c + 1)
                        + '</span><span class="artist"></span>《' + songSheetList[c].songSheetName + "》 - "
                        + songSheetList[c].author + "</li>";
                }
                $('.list', $albumList).html('<ul>' + albumList + '</ul>').mCustomScrollbar();

                $("li", $albumList).click(function () {
                    var a = $(this).index();
                    $(this).hasClass(cur) ? lzxPlayer.playList.creat.song(a, true)
                        : lzxPlayer.playList.creat.song(a, false);
                    $player.addClass("showSongList")
                });
                songTotal = songSheetList[albumId].songIds.length;

                random ? lzxMedia.getInfos(window.parseInt(Math.random() * songTotal))
                    : lzxMedia.getInfos(lzxMedia.getSongId(0));

            },
            song: function (id, isThisAlbum) {
                songTotal = songSheetList[id].songIds.length;
                $(".song-list .musicheader span", $player)
                    .text(songSheetList[id].songSheetName + "(" + songTotal + ")");
                var songList = '';

                for (var i = 0; i < songTotal; i++) {
                    songList += '<li><span class="index">' + (i + 1) + '</span><span class="artist"></span>'
                        + songSheetList[id].songNames[i] + '</li>'
                }
                $('ul', $songList).html(songList);
                $songList.mCustomScrollbar('update');
                if (isThisAlbum) {
                    $("li", $songList).eq(songId).addClass(cur).siblings().removeClass(cur);
                    $songList.mCustomScrollbar("scrollTo", $("li.current", $songList).position().top - 120);
                } else {
                    $songList.mCustomScrollbar("scrollTo", "top");
                }
                $('li', $songList).click(function () {
                    hasgeci = true;
                    $('#lzxLrc,#lzxKsc').show();
                    albumId = id;
                    if ($(this).hasClass(cur)) {
                        lzxTips.show('正在播放 - '
                            + songSheetList[albumId].songNames[songId].replace(songId + 1 + '#', ''))
                    } else {
                        $.cookie("auto_playre", "yes");
                        songId = $(this).index();
                        lzxMedia.getInfos(songId);
                    }
                })
            }
        }
    };

	
    var lzxLrc = {
        load: function () {
            lzxLrc.lrc.hide();
            hasLrc = false;
            $('#lzxLrc,#lzxKsc').html('');
            setTimeout(function () {
                if (hasgeci) {
                    $songFrom3.html('<i class="fa fa-check-circle"></i> 歌词' + songFrom33)
                } else {
                    $songFrom3.html('<i class="fa fa-times-circle"></i> 歌词' + songFrom33)
                }
                $('.switch-down').css('right', '65px');
                $('.switch-ksclrc').show();
                $.ajax({
                    url: webURL + "/api/musicLyric?songId=" + songSheetList[albumId].songIds[songId] + "&type="
                        + songSheetList[albumId].songTypes[songId],
                    type: 'GET',
                    dataType: 'script',
                    success: function () {
                        if (lrcstr == '') {
                            songFrom44 = ' - 暂无歌词!';
                            $songFrom3.html('<i class="fa fa-times-circle"></i> 暂无歌词');
                            $('.switch-ksclrc').hide();
                            $('.switch-down').css('right', '35px');
                        } else {
                            if (lrcstr.indexOf('[00') >= 0) {
                                setTimeout(function () {
                                        if (!$('#lzxLrc').hasClass('hide')) {
                                            songFrom44 = ' - 歌词获取成功!'
                                        } else {
                                            songFrom44 = ' - 歌词已关闭！'
                                        }
                                        lzxLrc.lrc.format(lrcstr)
                                    },
                                    500)
                            } else {
                                songFrom44 = ' - 暂无歌词!';
                                $songFrom3.html('<i class="fa fa-times-circle"></i> 暂无歌词');
                                $('.switch-ksclrc').hide();
                                $('.switch-down').css('right', '35px');
                            }
                        }
                    },
                    error: function () {
                        songFrom44 = ' - 暂无歌词!';
                        $songFrom3.html('<i class="fa fa-times-circle"></i> 暂无歌词');
                        $('.switch-ksclrc').hide();
                        $('.switch-down').css('right', '35px');
                    }
                })
            }, 50)
        },
        lrc: {
            format: function (cont) {
                hasLrc = true;

                function formatTime(t) {
                    var sp = t.split(':'),
                        min = +sp[0],
                        sec = +sp[1].split('.')[0],
                        ksec = +sp[1].split('.')[1];
                    return min * 60 + sec + Math.round(ksec / 1000)
                }

                var lrcCont = cont.replace(/\[[A-Za-z]+:(.*?)]/g, '').split(/[\]\[]/g),
                    lrcLine = '';
                lrcTimeLine = [];
                for (var i = 1; i < lrcCont.length; i += 2) {
                    var timer = formatTime(lrcCont[i]);
                    lrcTimeLine.push(timer);
                    if (i == 1) {
                        lrcLine += '<li class="lzxLrc' + timer + ' current" style="color:rgba(' + mainColor + ',1)">' + lrcCont[i + 1] + '</li>'
                    } else {
                        lrcLine += '<li class="lzxLrc' + timer + '">' + lrcCont[i + 1] + '</li>'
                    }
                }
                $('#lzxLrc').html('<ul>' + lrcLine + '</ul>');
                setTimeout(function () {
                        if (audio.paused) {
                            $('.switch-ksclrc').hide();
                            $('.switch-down').css('right', '35px');
                        } else {
                            $('#lzxLrc').addClass('show')
                        }
                    },
                    500);
                lrcTime = setInterval(lzxLrc.lrc.play, 500)
            },
            play: function () {
                var timeNow = Math.round(audio.currentTime);
                if ($.inArray(timeNow, lrcTimeLine) > 0) {
                    var $lineNow = $('.lzxLrc' + timeNow);
                    if (!$lineNow.hasClass(cur)) {
                        $lineNow.css('color','rgba(' + mainColor + ',1)');
                        $lineNow.addClass(cur).siblings().removeClass(cur).css('color','');
                        $('#lzxLrc').animate({
                            scrollTop: lrcHeight * $lineNow.index()
                        });
                    }
                } else {
                    lrcCont = ''
                }
            },
            hide: function () {
                clearInterval(lrcTime);
                $('#lzxLrc').removeClass('show')
            }
        }
    };
    //设置默认音量
    audio.volume = volume;
    if (volume == 1) {
        $('.volume-on', $player).width('100%');
    }

    //获取节日名称和日期
    getFestival();

    //获取歌单列表数据
     var htmlobj=$.ajax({url:"/songList.json",async:false});
     if(undefined != htmlobj){
         var songListArr  = htmlobj.responseJSON;
         if (songSheetList.length > 0){
               songListArr.forEach(function(item){
               songSheetList.push(item);
             });
         }else{
             songSheetList = songListArr;
         }

     }else{
        lzxTips.show('歌曲列表获取失败!')
     }

     if (songSheetList.length == 0){
         songSheetList.push(songDemoList);
     }

        if(playerWidth !== -1){
            document.body.style.setProperty('--player-width', playerWidth + 'px');
        }
        if(coverWidth !== -1){
            document.body.style.setProperty('--cover-width', coverWidth + 'px');
        }
        if(showNotes !== 1){
            $(".status .note",$player).hide()
        }
        if(autoPopupPlayer !== -1){
            setTimeout(function () {
                $player.addClass('show')
            },autoPopupPlayer * 1000)
        }

        if ($.cookie == undefined|| $.cookie("random_play") != null) {
            if ($.cookie == undefined||$.cookie("random_play") == "true") {
                $('.loop', $player).removeClass(cur);
                $('.random', $player).addClass(cur);
                $songFrom2.html('<i class="random fa fa-random"></i> 随机播放');
                random = true;
            } else {
                $('.loop', $player).addClass(cur);
                $('.random', $player).removeClass(cur);
                $songFrom2.html('<i class="loop fa fa-retweet"></i> 顺序播放');
                random = false;
            }
        } else {
            if (randomPlayer != 1) {
                $('.loop', $player).addClass(cur);
                $('.random', $player).removeClass(cur);
                random = false;
                $songFrom2.html('<i class="loop fa fa-retweet"></i> 顺序播放');
            }
        }

        if ($.cookie == undefined||$.cookie("lzx_player_volume") == '0.666') {
            volume = (defaultVolume / 100);
            audio.volume = volume;
        }

        // 防止百分百音量无触发事件
        lzxMedia.volumechange();

        albumId = defaultAlbum - 1;

        if (showLrc == 0) {
            //隐藏歌词
            $('#lzxLrc').addClass('hide');

            ycgeci = false;
            if (hasLrc) {
                $songFrom3.html('<i class="fa fa-times-circle"></i> 歌词关闭');
            }
            lzxTips.show('歌词显示已关闭');
            songFrom33 = '关闭';
            $songFrom4.html('<i class="fa fa-toggle-off" title="打开歌词"></i>')
        }
        if (showGreeting == 1) {
            lzxTips.show(greeting);
        }
        setTimeout(function (args) {
            lzxPlayer.playList.creat.album()
        }, 1000);



    // 喂狗
    dogInterval = setInterval(function(){
        if(!isTest){
            localStorage.setItem("lastFeed", new Date().getTime().toString());
        }
        // 检查css变量
        var currPlayerWidth = document.body.style.getPropertyValue('--player-width');
        if(typeof playerWidth != "undefined" && playerWidth !== -1 && currPlayerWidth != (playerWidth + 'px')){
            document.body.style.setProperty('--player-width', playerWidth + 'px');
        }
        var currCoverWidth = document.body.style.getPropertyValue('--cover-width');
        if(typeof coverWidth != "undefined" && coverWidth !== -1  && currCoverWidth != (coverWidth + 'px')){
            document.body.style.setProperty('--cover-width', coverWidth + 'px');
        }
    },1000);

    // 浏览器关闭事件监听器
    window.addEventListener('beforeunload', function(event){
        localStorage.setItem("isLoad", "false");
    }, true);

    function LimitStr(str, num, t) {
        num = num || 6;
        t = t || '...';
        var re = '';
        var leg = str.length;
        var h = 0;
        for (var i = 0; h < num * 2 && i < leg; i++) {
            h += str.charCodeAt(i) > 128 ? 2 : 1;
            re += str.charAt(i)
        }
        if (i < leg) re += t;
        return re
    }

    function netmusic() {
        audio.src = webURL + "/api/musicUrl?songId=" + songSheetList[albumId].songIds[songId]+"&type="+songSheetList[albumId].songTypes[songId];
        $('.switch-down').show();
        $('.switch-down').html('<a class="down"><i class="fa fa-cloud-download" title="从' + songFrom55 + '下载：'
            + songSheetList[albumId].songNames[songId] + ' - ' + songSheetList[albumId].artistNames[songId] + '"></i></a>');
        $('.down').click(function () {
            window.open(audio.src, 'newwindow')
        });
        //lrcurl = songSheetList[albumId].lyrics[songId];
        $songName.html('<span title="' + songSheetList[albumId].songNames[songId] + '">'
            + LimitStr(songSheetList[albumId].songNames[songId]) + '</span>');
        window.console.log(name + ' - 当前播放：' + songSheetList[albumId].songNames[songId] + ' - '
            + songSheetList[albumId].artistNames[songId]);
        $songFrom.html('<span title="' + songSheetList[albumId].artistNames[songId] + '">'
            + LimitStr(songSheetList[albumId].artistNames[songId]) + '</span>');
        $songFrom1.html('<span title="' + songSheetList[albumId].albumNames[songId] + '">'
            + LimitStr(songSheetList[albumId].albumNames[songId]) + '</span>');
        var coverImg = new Image();
        coverImg.src = "/images/player_cover.jpg";

        $cover.addClass('changing');

        coverImg.onload = function () {
            $cover.removeClass('changing');
            playerColor();
        };
        coverImg.error = function () {
            coverImg.src = "/images/player_cover.jpg";
            setTimeout(function () {
                    lzxTips.show(songSheetList[albumId].songNames[songId] + ' - 专辑图片获取失败！')
                },
                4000)
        };
        $cover.html(coverImg);
        if (background == 1) {
            $('.blur-img .blur', $player).attr("src", "/images/player_cover.jpg"); //虚化背景
        } else {
            if ($(".blur-img").length > 0) {
                $(".blur-img").remove();
            }
        }
        lzxLrc.load(); //加载歌词

        if (first == 1) {
            first = 2;
            if (autoPlayer == 1 && ($.cookie("auto_playre") == null || $.cookie("auto_playre") === "yes")) {
                startPlay()
            } else {
                lzxTips.show('播放器自动暂停');
                $cover.removeClass('coverplay');
                audio.pause();
            }
        } else {
            startPlay()
        }
        // 歌词自动隐藏
        $(window).scroll(function () {
            var scrollTop = $(this).scrollTop();
            var scrollHeight = $(window.document).height();
            var windowHeight = $(this).height();
            if (scrollTop + windowHeight == scrollHeight) {
                if (hasgeci && ycgeci) {
                    $player.addClass('ksclrc');
                    $('#lzxLrc').addClass('hide');
                    $('#lzxKsc').addClass('hidePlayer');
                    $songFrom3.html('<i class="fa fa-times-circle"></i> 歌词隐藏');
                    $songFrom4.html('<i class="fa fa-toggle-off" title="歌词隐藏"></i>');
                    if (hasLrc) {
                        lzxTips.show('歌词自动隐藏')
                    }
                }
            } else {
                if (hasgeci && ycgeci) {
                    $player.removeClass('ksclrc');
                    $('#lzxLrc').removeClass('hide');
                    $('#lzxKsc').removeClass('hidePlayer');
                    if (hasLrc) {
                        $songFrom3.html('<i class="fa fa-check-circle"></i> 歌词开启')
                    }
                    $songFrom4.html('<i class="fa fa-toggle-on" title="关闭歌词"></i>')
                }
            }
        });
        musicTooltip();
    }

    function startPlay() {
        lzxTips.show('开始播放 - ' + songSheetList[albumId].songNames[songId]);
        audio.play();
    }

    function allmusic() {
        $("li", $albumList).eq(albumId).addClass(cur).find(".artist").html("当前播放 > ").parent().siblings()
            .removeClass(cur).find(".artist").html("").parent();
        $songList.find("li").eq(songId).addClass(cur).siblings().removeClass(cur);
        if ($('ul', $songList).html() != '') $songList.mCustomScrollbar("scrollTo", $("li.current", $songList)
            .position().top - 120);
    }

    function playerColor() {
        $player.css({
            background: 'rgba(' + mainColor + ',.8)'
        });
        $switchPlayer.css({
            background: 'rgba(' + mainColor + ',.3)'
        });
        $tips.css({
            background: 'rgba(' + mainColor + ',.6)'
        });
        $lk.css({
            background: 'rgba(' + mainColor + ',.3)'
        });
        $(".infos,.control,.status .note", $player).css({
            color: 'rgb(' + font_color + ')'
        });
    }

    function musicTooltip() {
        if (isPhone){return;}
        $('#lzxPlayer span,#lzxPlayer i').each(function () {
            $('#tooltip').remove();
            if (this.title) {
                var a = this.title;
                $(this).unbind("mouseover mouseout");
                $(this).mouseover(function (b) {
                    this.title = '';
                    $('body').append('<div id="tooltip">' + a + '</div>');
                    $('#tooltip').css({
                        left: b.pageX - 15 + 'px',
                        top: b.pageY + 30 + 'px',
                        opacity: '0.8'
                    }).fadeIn(250)
                }).mouseout(function () {
                    this.title = a;
                    $('#tooltip').remove()
                }).mousemove(function (b) {
                    $('#tooltip').css({
                        left: b.pageX - 15 + 'px',
                        top: b.pageY + 30 + 'px'
                    });
                });
            }
        });
    }
};
lzxPlayerInit();
