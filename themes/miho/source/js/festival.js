//节日倒计时
var voiceflag = false;
var songflag = true;

//获取当前农历
var calendars;
//获取当前阳历
var date;

//当前年份
var syear;
//当前月份
var smouth;
//当前具体日期
var sday;
//当前时间戳
var nowTime;
//农历出生年
var biryear;
//农历出生月日
var brithMD;
//选定的节日
var festivalName = "";
var festivalDate = "";
var yearCalContent = "";
//特殊节日
var festivalNameSpecial = "";
var festivalDateSpecial = "";
var festivalTimeSpecial = 0;
//24节气
var termNote = "";
var festivalNameTerm = "";
var festivalDateTerm = "";
var festivalTimeTerm = 0;
//阳历
var festivalNameSFtv = "";
var festivalDateSFtv = "";
var festivalTimeSFtv = 0;
//阴历
var festivalNameLFtv = "";
var festivalDateLFtv = "";
var festivalTimeLFtv = 0;

//定义特殊节日数组
var special = ["05/2-7*母亲节","06/3-7*父亲节","11/4-4*感恩节"];
//定义24节气数组
//var solarTerm = ["01*小寒","01*大寒","02*立春","02*雨水","03*惊蛰","03*春分","04*清明(法定节假日)","04*谷雨","05*立夏","05*小满","06*芒种","06*夏至","07*小暑","07*大暑","08*立秋","08*处暑","09*白露","09*秋分","10*寒露","10*霜降","11*立冬","11*小雪","12*大雪","12*冬至"];
//定义阴历节日数组
var lFtv = ["01/01*春节(法定节假日)","01/12*老妈的生日|1972","01/15*上元节","02/02*龙头节","02/14*老爸的生日|1970","04/04*寒食节","04/08*佛诞节","05/31*端午节(法定节假日)","07/07*七夕节","07/15*中元节","09/06*中秋节(法定节假日)","09/09*重阳节","09/18*祥祥同学的生日|1992","10/01*七七同学的生日|1995","10/15*下元节","12/08*腊八节","12/23*小年(北方地区)","12/24*小年(南方大部分地区)","12/28*订婚纪念日","12/28*小年(江浙沪地区)","12/29*除夕(法定节假日)"];
//定义阳历节日数组
var sFtv = ["01/01*元旦(法定节假日)","02/14*情人节","03/08*妇女节","03/12*植树节","03/15*消费者权益日","04/01*愚人节","05/01*劳动节(法定节假日)","05/04*青年节","05/12*护士节","05/20*网络情人节","06/01*儿童节","07/01*建党节(1921.07.23)|香港回归纪念日(1997.07.01)","07/14*领证纪念日","08/01*建军节(1927.08.01)","09/03*抗战胜利纪念日(1945.09.03)","09/10*教师节","09/18*九一八事变纪念日(1931.09.18)","10/01*国庆节(法定节假日)","10/24*1024程序员节","11/01*万圣节","11/11*网络单身节","12/13*国家公祭日","12/20*澳门回归纪念日(1999.12.20)","12/24*平安夜","12/25*圣诞节"];

var birthdayArr = ["正月十二", "二月十四", "九月十八", "十月初一"];
var springFestivalArr = ["腊月廿三", "腊月廿四", "腊月廿五", "腊月廿六", "腊月廿七", "腊月廿八", "腊月廿九", "腊月三十", "正月初一", "正月初二", "正月初三"];
var nationalDayArr = ["10月01日", "10月02日", "10月03日", "10月04日", "10月05日", "10月06日", "10月07日"];

var solarTerm = [//二十四节气列表
        {
            sort: 1,
            name:'立春',
            month: '02',
            remark: '气温开始回升，万物复苏,乍暖还寒，注意防寒保暖，预防感冒。'
        },
        {
            sort: 2,
            name:'雨水',
            month: '02',
            remark: '降水量增加，空气湿度提升，防湿防潮，室内保持通风，注意保暖防感冒。'
        },
        {
            sort: 3,
            name:'惊蛰',
            month: '03',
            remark: '气温快速上升，春雷乍动，昆虫开始活动，防止虫害，外出注意保暖。'
        },
        {
            sort: 4,
            name:'春分',
            month: '03',
            remark: '昼夜平分，气温回升明显，保持合理作息，预防春困。'
        },
        {
            sort: 5,
            name:'清明',
            month: '04',
            remark: '降水增加，草木旺盛，外出祭扫注意防雨，适当增加锻炼。'
        },
        {
            sort: 6,
            name:'谷雨',
            month: '04',
            remark: '春雨增多，利于作物生长，注意防湿防潮，防止过敏。'
        },
        {
            sort: 7,
            name:'立夏',
            month: '05',
            remark: '天气转热，雷雨增多，注意补充水分，避免暴晒。'
        },
        {
            sort: 8,
            name:'小满',
            month: '05',
            remark: '雨水增多，湿热显现，保持饮食清淡，防止湿热引起的身体不适。'
        },
        {
            sort: 9,
            name:'芒种',
            month: '06',
            remark: '高温多雨，农忙时节，避免中暑，多补充盐分和水分。'
        },
        {
            sort: 10,
            name:'夏至',
            month: '06',
            remark: '白天最长，炎热开始，防止高温中暑，适当午休。'
        },
        {
            sort: 11,
            name:'小暑',
            month: '07',
            remark: '暑热初显，雷雨增多，减少户外活动，防雷雨天气。'
        },
        {
            sort: 12,
            name:'大暑',
            month: '07',
            remark: '一年中最热的时节，多喝凉茶解暑，避免长时间户外活动。'
        },
        {
            sort: 13,
            name:'立秋',
            month: '08',
            remark: '暑热渐消，早晚微凉，注意昼夜温差，预防感冒。'
        },
        {
            sort: 14,
            name:'处暑',
            month: '08',
            remark: '暑气渐退，秋高气爽，避免干燥引起的不适，多饮水。'
        },
        {
            sort: 15,
            name:'白露',
            month: '09',
            remark: '清晨出现露珠，气温明显下降，添衣保暖，防止秋季感冒。'
        },
        {
            sort: 16,
            name:'秋分',
            month: '09',
            remark: '昼夜平分，秋意浓郁，防止季节性过敏，注意保暖。'
        },
        {
            sort: 17,
            name:'寒露',
            month: '10',
            remark: '气温显著下降，天气转冷，适时增添衣物，注意防寒。'
        },
        {
            sort: 18,
            name:'霜降',
            month: '10',
            remark: '初霜出现，冬意渐浓，避免露天早起，护肤保湿。'
        },
        {
            sort: 19,
            name:'立冬',
            month: '11',
            remark: '天气寒冷，万物休养生息，注意保暖，加强御寒食物摄入。'
        },
        {
            sort: 20,
            name:'小雪',
            month: '11',
            remark: '降雪初现，气温继续下降，防寒防滑，避免摔倒。'
        },
        {
            sort: 21,
            name:'大雪',
            month: '12',
            remark: '降雪增多，寒冷加剧，做好防冻措施，注意路面安全。'
        },
        {
            sort: 22,
            name:'冬至',
            month: '12',
            remark: '昼最短，夜最长，适当进补，增强免疫力。'
        },
        {
            sort: 23,
            name:'小寒',
            month: '01',
            remark: '寒冷加剧，风雪增多，注意保暖，避免长时间室外活动。'
        },
        {
            sort: 24,
            name:'大寒',
            month: '01',
            remark: '一年中最冷时节，减少外出，做好防寒措施，避免冻伤。'
        }
    ];

var bannerNum = -1;

//春节背景图片
var springFestivalBannerArr = [
    "/photo/album/system/system_003.jpg",
    "/photo/album/system/system_004.jpg",
    "/photo/album/system/system_005.jpg"
];

//国庆背景图片
var nationalFestivalBannerArr = [
    "/photo/album/system/system_006.gif",
    "/photo/album/system/system_007.gif"
];

/**
 * 获取最近的节日名称和日期
 */
function getFestival(){

    //获取当前农历：正月初一
    calendars = showCal();

    //获取当前阳历：2019年08月31日
    date = getCurrentDate();

    //年
    syear = date.substr(0,date.indexOf("年"));
    //月
    smouth = date.substr(date.indexOf("年")+1,date.indexOf("月")-5);
    //日
    sday = date.substr(date.indexOf("月")+1,date.indexOf("日")-8);

    //2019/01/01
    var nowDate = syear+"/"+ smouth+"/"+ sday;
    //当前时间戳
    nowTime =  new Date(nowDate).getTime();

    //遍历特殊节日数组
    ergodicsSpecialArr((parseInt(syear)-1).toString());

    //遍历24节气数组
    ergodicsSolarTermArr((parseInt(syear)-1).toString());

    //遍历阴历节日数组
    ergodicsLFtvArr((parseInt(syear)-1).toString());

    //遍历阳历节日数组
    ergodicsSFtvArr((parseInt(syear)-1).toString());

    //获取最近的节日日期 - 即以上节日的最小值
    getMinFestival();
}

/**
 * 遍历24节气数组
 */
let recursionCount = 0;
function ergodicsSolarTermArr(termyear) {

    for (var i = 0, len = solarTerm.length; i < len; i++) {
        var next = solarTerm[i];
        //索引节日时间戳
        //节气排序
        var num = i + 1;
        //节气阳历月份
        var month = next.month;
        //节气名称
        var orderName = "第" + next.sort + "个节气-";
        var nextName = orderName + next.name;

        //24节气转换公历
        var nextDate = conversionTerm(termyear, month, num);
        var nextTime = new Date(nextDate).getTime();
        
        //比较日期
        if (nowTime == nextTime || nowTime < nextTime) {
            //获取下一个节气
            festivalNameTerm = nextName;
            festivalDateTerm = nextDate;
            festivalTimeTerm = nextTime;
            //获取当前节气
            var curr = i == 0?solarTerm[23]:solarTerm[i-1];
            var currTermName = "第" + curr.sort + "个节气-" + curr.name;
            termNote = currTermName + ": " + curr.remark;

            break;
        } else {
            //跨年处理,递归调用
            if (num > 21 && month == 12 && recursionCount < 2) {
                recursionCount++;
                var newyear = (parseInt(termyear) + 1).toString();
                ergodicsSolarTermArr(newyear);
            }
        }
    }
}

/**
 * 遍历阴历节日数组
 */
function ergodicsLFtvArr(lfyear) {
    for(var i = 0,len=lFtv.length; i < len; i++) {
        var curr = lFtv[i];
        //索引节日时间戳
        var currName = curr.substr(curr.indexOf("*")+1,curr.length);
        if (-1 != currName.indexOf("生日")) {
            biryear = curr.substr(curr.indexOf("|")+1,curr.length);
            currName = curr.substr(curr.indexOf("*")+1,curr.indexOf("|")-6);
        }
        brithMD = curr.substr(0,curr.indexOf("*"));
        var currDate = lfyear +"/"+ brithMD;
        var yangCurrDate = conversion(currDate);
        var currTime = new Date(yangCurrDate).getTime();


        //比较日期
        if (nowTime == currTime || nowTime<currTime){
            festivalNameLFtv = currName;
            festivalDateLFtv = yangCurrDate;
            festivalTimeLFtv = currTime;
            break;
        }else{
            //跨年处理,递归调用
            if (i == len-1) {
                var newyear = (parseInt(lfyear)+1).toString();
                ergodicsLFtvArr(newyear);
            }
        }

    }
}

/**
 * 遍历阳历节日数组
 */
function ergodicsSFtvArr(sfyear) {
    for(var i = 0,len=sFtv.length; i < len; i++) {
        var curr = sFtv[i];
        //索引节日时间戳
        var currName = curr.substr(curr.indexOf("*")+1,curr.length);
        var currDate = sfyear +"/"+ curr.substr(0,curr.indexOf("*"));
        var currTime = new Date(currDate).getTime();
        //比较日期
        if (nowTime == currTime || nowTime<currTime){
            festivalNameSFtv = currName;
            festivalDateSFtv = currDate;
            festivalTimeSFtv = currTime;
            break;
        }else{
            //跨年处理,递归调用
            if (i == len-1) {
                var newyear = (parseInt(sfyear)+1).toString();
                ergodicsSFtvArr(newyear);
            }
        }
    }
}

/**
 * 遍历特殊节日数组
 */
function ergodicsSpecialArr(sfyear) {
    for(var i = 0,len=special.length; i < len; i++) {
        var curr = special[i];
        //索引节日时间戳
        var nmonth = curr.substr(0,curr.indexOf("/"));
        if (null == currDate) {
            continue;
        }
        //比较日期
        var weeks = curr.substr(curr.indexOf("/")+1,curr.indexOf("-")-3);
        var nums = curr.substr(curr.indexOf("-")+1,curr.indexOf("*")-5);
        var currName = curr.substr(curr.indexOf("*")+1,curr.length);
        var currDate = conversionParentDate(sfyear,nmonth,weeks,nums);
        var currTime = new Date(currDate).getTime();
        if(nowTime == currTime || nowTime < currTime){
            festivalNameSpecial = currName;
            festivalDateSpecial = currDate;
            festivalTimeSpecial = currTime;
            break;
        }

        //跨年处理,递归调用
        if (i == len-1) {
            var newyear = (parseInt(sfyear)+1).toString();
            ergodicsSpecialArr(newyear);
        }

    }
}

/**
 * 获取最近的节日日期 - 即以上节日的最小值
 */
function getMinFestival() {

    var festivalTimeData;

    if (festivalTimeSpecial == 0) {
        festivalTimeData = [festivalTimeTerm,festivalTimeSFtv,festivalTimeLFtv];
    }else{
        festivalTimeData = [festivalTimeSpecial,festivalTimeTerm,festivalTimeSFtv,festivalTimeLFtv];
    }

    var festivalTime = Math.min.apply(Math,festivalTimeData);
    assigFestival(festivalTime,festivalNameSpecial,festivalDateSpecial,festivalTimeSpecial);
    assigFestival(festivalTime,festivalNameTerm,festivalDateTerm,festivalTimeTerm);
    assigFestival(festivalTime,festivalNameSFtv,festivalDateSFtv,festivalTimeSFtv);
    //农历日期不准
    //assigFestival(festivalTime,festivalNameLFtv,festivalDateLFtv,festivalTimeLFtv);
}

/**
 * 赋值最近的名称和日期
 */
function assigFestival(minTime,Names,Dates,Times) {
    if (minTime == Times&&-1==festivalName.indexOf(Names)) {
        festivalDate = Dates;
        festivalName = festivalName  + " | " + Names;
        if(festivalName.startsWith(" | ")){
            var temp = " | ".length;
            festivalName = festivalName.substr(temp);
        }
    }
}

/**
 * 计算倒计时
 */
function showTime(){
    var time = "";
    if("" == yearCalContent){
        yearCalContent = showYearCal();
    }

    var msgContent = getCurrentDateTime() + " " + yearCalContent;
    $("#msg").html(msgContent);
    var currentTime=new Date().getTime();
    var beginDayEarlyTime =new Date().setHours(0, 0, 0, 0) ;
    var endDayEarlyTime =new Date().setHours(0, 0, 0, 1) ;
    //每天凌晨重新获取节日名称和日期
    if(currentTime >= beginDayEarlyTime &&currentTime <= endDayEarlyTime){
         $("#timer").html("");
         $("#msg").html("");
        getFestival();
    }

    if ("" != festivalDate) {
        var endTime=new Date(festivalDate).getTime();
        var remainTime=endTime-currentTime;
        <!-- 1天=24小时  1小时=60分钟  1分钟=60秒  1秒=1000毫秒 -->
        var day=Math.floor(remainTime/(24*60*60*1000));
        var hour=Math.floor((remainTime-day*24*60*60*1000)/(60*60*1000));
        var minute=Math.floor((remainTime-day*24*60*60*1000-hour*60*60*1000)/(60*1000));
        var second=Math.floor((remainTime-day*24*60*60*1000-hour*60*60*1000-minute*60*1000)/(1000));

        if(remainTime > -86399000 && remainTime <= 0){
            //处理特殊说明文字
            if (-1 != festivalName.indexOf("(法定节假日)")){
                festivalName = festivalName.replace("(法定节假日)","");
            }
            //特殊节日
            var timerHtml = $("#timer").html();
            if ("" == timerHtml) {
                if (-1 != festivalName.indexOf("生日")) {
                    <!-- 根据出生农历获取生日星座 -->
                    var birthStr = biryear + "/" + brithMD;
                    var astroStr = conversionAstro(birthStr);

                    festivalName = festivalName + "-" + astroStr + "，" + "愿：时光能缓、美好如初、生日快乐";
                }

                if ("国庆节" == festivalName) {
                    <!-- 获取建国周年 -->
                    var anniversaryStr = "(建国" + (parseInt(syear) - 1949) + "周年)";
                    festivalName = festivalName + anniversaryStr + "，愿：繁荣昌盛、国泰民安、喜乐安宁";
                }

                if ("元旦" == festivalName) {
                    festivalName = syear + "年" + festivalName + "，" + "元旦快乐、岁岁平安";
                }

                if ("除夕" == festivalName || "春节" == festivalName) {
                    <!-- 获取农历 -->
                    var lunarStr = conversionLunar(syear);
                    festivalName = lunarStr + "-" + syear + festivalName + "，" + "新春快乐、大吉大利";
                }

                
                if ("" != festivalName) {
                    //赋值节日名称
                    var time = "，今天是" + festivalName + "！";
                    $("#timer").html(time);
                    $("#note").html(termNote);
                }
            }

        }else{
            if ("" != festivalName) {
                //赋值节日名称和节日倒计时
                time = "，距离"+festivalName+"，还有" + day+"天"+hour+"时"+minute+"分"+second+"秒！";
                $("#timer").html(time);
                $("#note").html(termNote);
            }

        }

        //语音播报和播放纯音乐
        if (voiceflag){
            var url = window.location.href;
            if ($.cookie("auto_playre") == null || $.cookie("auto_playre") === "yes") {
                if(url == "http://localhost:4000/"||url == "https://haoxiang.eu.org/"||url == "https://haoxiang.eu.org"){
                    speechVoice();
                   }else{
                     voiceflag = false;
                   }
                //palyAudio();
            }
        }

        songlistArr();
    }


}
//定时刷新倒计时
setInterval("showTime()",1000);

/**
 * 语音播报
 */
function speechVoice() {
    //公告内容
    if (undefined != $("#noticeMar")[0]) {
        var text = $("#noticeMar")[0].innerText;
        if (text != "") {
            if ('speechSynthesis' in window) {
                //Html5语音合成
                //htmlVoice(text);
                //百度语音合成
                //baiduVoice(text);
                voiceflag = false;
            }
        }
    }

}

/**
 * Html5语音合成
 */
function htmlVoice(text) {
    var msg = new SpeechSynthesisUtterance();
    
    // 设置语音语言为中文
    msg.lang = "zh-CN"; 
    
    // 设置语速 (0.1 到 10，默认是 1)
    msg.rate = 1; //稍微提高语速
    
    // 设置语调 (0 到 2，默认是 1)
    msg.pitch = 1.5; //降低语调，使语音更自然
    
    // 设置要朗读的文本
    msg.text = text;
    
    // 设置语音引擎（可以通过调整 voice 来选择不同的声音）
    var voices = window.speechSynthesis.getVoices();
    for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang === "zh-CN") {
            msg.voice = voices[i]; // 设置中文语音
            break;
        }
    }

    // 开始朗读
    window.speechSynthesis.speak(msg);
}

/**
 *  百度语音合成
 */
function baiduVoice(text) {
    var ttsUrl = 'https://tts.baidu.com/text2audio?';
    // 处理参数
    var urlParameter = [];
    urlParameter.push('lan=zh');
    urlParameter.push('pdt=301');
    urlParameter.push('vol=8');
    urlParameter.push('per=0');
    urlParameter.push('cuid=baike');
    urlParameter.push('ctp=1');
    urlParameter.push('tex=' + encodeURIComponent(text));
    var address = ttsUrl + urlParameter.join('&');

    //如果浏览器支持，可以设置autoplay，但是不能兼容所有浏览器
    var audio = new Audio();
    audio.autoplay = true;
    audio.preload = true;
    audio.controls = false;
    audio.src = address;
    audio.loop = false;
    audio.volume = 1;
    //监听语音播报结束
    audio.addEventListener('ended',palyAudio(), false);
}

function audioArr() {
    return [
        'https://aod.cos.tx.xmcdn.com/group10/M0A/1C/F6/wKgDaVV34rnSjpcxAOLRGSfkWLY847.mp3', 
        'https://aod.cos.tx.xmcdn.com/group10/M0A/1C/F6/wKgDaVV34rnSjpcxAOLRGSfkWLY847.mp3'
    ];
}

/**
 * 网站背景音乐
 * 喜马拉雅-外链工具：http://3g.gljlw.com/diy/ximalaya.php
 * @param arr
 */
function palyAudio() {
    var arr = audioArr();
    var myAudio = new Audio();
    myAudio.preload = true;
    <!--获取和设置已播放的时间-->
    //myAudio.currentTime = 8;
    <!--是否显示控制面板-->
    myAudio.controls = false;
    <!--每次随机读数组的一个元素-->
    var n = Math.floor(Math.random() * arr.length);
    myAudio.src = arr[n];
    try {
        myAudio.play();
    } catch (e) {
    }
    //特殊节日单循环
    if (arr.length == 1) {
        myAudio.loop = true;
    }else{
        //禁止循环，否则无法触发ended事件
        myAudio.loop = false;
        arr.splice(n,1);
        //myAudio.src = arr.pop();
        myAudio.addEventListener('ended', playEndedHandler, false);
    }

    function playEndedHandler(){
        var ne = Math.floor(Math.random() * arr.length);
        myAudio.src = arr[ne];
        try {
            myAudio.play();
        } catch (e) {
        }
        arr.splice(ne,1);
        if(arr.length==0){
            arr = audioArr();
        }

        //只有一个元素时解除绑定
        //!arr.length && myAudio.removeEventListener('ended',playEndedHandler,false);

    }
}

/**
 * 特殊节日歌单
 * @returns {*[]|string[]}
 */
function songlistArr() {

    if (-1 != birthdayArr.indexOf(calendars)) {
        //生日歌
        $("#banner").css("background-image", "url(/photo/album/system/system_002.jpg)");
        //getFestivalSongList("birthdaySongList");
    }

    if (-1 != springFestivalArr.indexOf(calendars)) {
        //春节序曲
        //getFestivalSongList("festivalSongList");
        //随机背景图
        if(bannerNum == -1){
            bannerNum = Math.floor(Math.random() * springFestivalBannerArr.length);
        }
        $("#banner").css("background-image", "url(" + springFestivalBannerArr[bannerNum] + ")");

    }

    if (-1 != nationalDayArr.indexOf(date.substr(date.indexOf("年") + 1, date.indexOf("日") - 4))) {
        //我爱你中国 小提琴版
        //getFestivalSongList("nationalSongList");
        //随机背景图
        if(bannerNum == -1){
            bannerNum = Math.floor(Math.random() * nationalFestivalBannerArr.length);
        }

        $("#banner").css("background-image", "url(" + nationalFestivalBannerArr[bannerNum] + ")");
    }

}

//获取节日歌单列表数据
var songSheetList = [];
function getFestivalSongList(songListName) {
    if (songflag) {
        var htmlobj=$.ajax({url:"/"+songListName+".json",async:false});
        if(undefined != htmlobj){
            var htmllist  = htmlobj.responseJSON;
             fesSongList = htmllist[0];
             if (songSheetList.length>0){
                 songSheetList.splice(0,0,fesSongList);
             }
             songflag = false;
        }else{
            lzxTips.show('歌曲列表获取失败!')
        }
    }

}

//疫情数据接口
function getYQData(){ 
    $.ajax({
          method:"get",
          async: false,
          url:"https://service-qzyqjgtg-1254466492.gz.apigw.tencentcs.com/release/DxyData",
          success: function(htmlobj){
             if(htmlobj.error==0){
            $("#YQData").html(htmlobj.data);
          }
        }
     });    
}

//一言接口
function getHitokoto(){ 
    $.ajax({
          method:"get",
          async: false,
          url:"https://service-4bm8avhm-1254466492.gz.apigw.tencentcs.com/release/hitokoto",
          success: function(htmlobj){
              var content = htmlobj.hitokoto;
              if(null != content){
                  content = content + ' - ';
                  var artistsname = htmlobj.from_who;
                  if(null != artistsname){
                      content = content + artistsname;
                  }
                  var name = htmlobj.from;
                  if(null != name){
                      content = content + '《' + name + '》';
                  }

                  $("#hitokoto").html(content);
              }
        }
     });    
}

//网易云音乐热门评论接口
function getWYComments(){ 
    $.ajax({
          method:"get",
          async: false,
          url:"https://service-o9klo0gw-1254466492.gz.apigw.tencentcs.com/release/comments",
          success: function(htmlobj){
           if(htmlobj.code==1){
               var name = htmlobj.data.name;
               var artistsname = htmlobj.data.artistsname;
               var content = htmlobj.data.content;
               $("#wycomments").html(content + ' - ' + artistsname + '《' + name + '》');
           }
        }
     });   
}
