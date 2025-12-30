---
title: EasyUI部分问题总结技
categories: 其他系列
tags:
  - TypeScript
  - JavaScript
abbrlink: e6460db3
date: 2023-01-10 00:00:00
top: 151
---

本文总结了EasyUI开发过程中遇到的常见问题和解决方案，包括数据表格、表单验证、对话框、树形控件等组件的使用技巧和注意事项。通过实际项目经验，整理了EasyUI开发中的最佳实践和常见坑点，帮助开发者快速解决开发中遇到的问题，提升开发效率。

<!-- more -->

![EasyUI](/images/gAhSjg.jpg  "EasyUI部分问题总结-技巧篇")


### 一、输入框处理

EasyUI的输入框组件在实际开发中经常会遇到精度丢失、科学计数法显示等问题，本节将详细介绍这些问题的解决方案。

#### 1.1 四舍五入精度丢失问题

```
问题描述：
```
在使用EasyUI的NumberBox组件时，当指定小数位数后，有时候无法正常进行四舍五入，导致精度丢失。这是因为JavaScript的浮点数运算精度问题导致的。

```
解决方案：
通过重写Number.prototype.toFixed()方法，使用自定义的精度计算逻辑来解决这个问题。
```

```html
<!-- 页面 -->
<div class="query_ipt font_sz12 font_clr66 mg_r10" >
    <span>调账金额</span>
    <input type="text" class="easyui-numberbox" data-options="max:999999999"  id="adjustAmountJs" name="adjustAmount">
</div>


```javascript
```
/**
 * 页面JS
```
 */
```javascript
$(document).ready(function() {
```

```
     //重写Number.toFixed()方法
     //NumberBox指定小数位数有时候不能正常的四舍五入解决办法
     $("#adjustAmountJs").numberbox({
           precision: 2
```
    })
	
```
});
```

```javascript
//在Number的原型上重写toFixed方法
Number.prototype.toFixed = function (s) {  
    var Dight = Math.pow(10,s);
    //判断是否为正数
	if(Number(this)>0){
	   return Math.round(numMulti(this, Dight))/Dight;
	}else{
		//取绝对值，再转化为负数
		var num = Math.round(numMulti(Math.abs(this), Dight))/Dight;
		return -num;
```
		
	}
	
};
```
/** 
  * 乘法运算，避免数据相乘小数点后产生多位数和计算精度损失。 
```
  * 
```
  * @param num1被乘数 | num2乘数 
```
  */ 
```javascript
function numMulti(num1, num2) { 
	var baseNum = 0; 
	try { 
	baseNum += num1.toString().split(".")[1].length; 
	} catch (e) { 
```
	} 
```
	try { 
	baseNum += num2.toString().split(".")[1].length; 
```
	} 
```
	return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum); 
```


} 
```

#### 1.2 科学计数法转换问题

在EasyUI的输入框中，当输入或计算大数值时，可能会显示为科学计数法格式（如1.23e+10），影响用户体验。需要将科学计数法转换为普通数字格式显示。

通过自定义计算函数，使用parseFloat和toLocaleString方法将科学计数法转换为普通数字格式，并处理千分位分隔符。

    <span class="font_clred font_sz14">*</span>
	<span>价格/天</span>
 	<input type="text" class="easyui-validatebox" id="npriceUpd" name="nprice" maxlength="12" onchange="calculateNyingshoumny()"/>  
  		
	<span>天数</span>
		<input  type="text" class="easyui-validatebox" id="idaynumUpd" name="idaynum" maxlength="28" onchange="calculateNyingshoumny()"/>

	  <span>应收金额</span>
	  <input type="text" class="easyui-validatebox" id="nyingshoumnyUpd" name="nyingshoumny" disabled="true"/>
 
	<span>备注</span>
	<input class="easyui-validatebox" id="vremarkUpd" name="vremark" maxlength="20"/>
	

```
```
/**
```
 */
 
```
/**
 * 计算应收金额
```
 */
```javascript
function calculateNyingshoumny(){
```
	
```javascript
	var nyingshoumny = '';
```
	
```javascript
	//价格/天
	var nprice = $('#npriceUpd').val();
	//天数
	var idaynum = $("#idaynumUpd").val();
```
	
```javascript
	//验证价格/天
	var npriceFlag = validateNprice(npriceStr);
	if (!npriceFlag) {
		return false;
```
	}

```javascript
	//验证天数
	var idaynumFlag = validateIdaynum(idaynum);
```
	
```
	//验证是否通过
	if (!(npriceFlag&&idaynumFlag)) {
```
	}
	
```
	//应收金额计算并赋值显示
	nyingshoumny = (parseFloat(npriceStr) * parseInt(idaynum)).toLocaleString();
```
    
```
	if (nyingshoumny.indexOf(",") != -1 ) {
	    $("#nyingshoumnyUpd").val(nyingshoumny.replaceAll(/,/,""));
		$("#nyingshoumnyUpd").val(nyingshoumny);	
```
	}
	
```
	return true;
```
}

```
/**
 * 验证价格/天
```
 */
```javascript
function validateNprice(nprice){
```

```
	//1。验证为空字符串
	if ("" == npriceStr) {
		$.messager.alert('提示',"价格/天不可为空，请输入！");
```
	}
	
```javascript
	//2。验证为数字
	var npriceReg =  /^\d+(\.\d+)?$/; 
	if(nprice.match(null == npriceReg)){
		$.messager.alert('提示',"价格/天必须为数字，请重新输入！");
		$('#npriceUpd').val("");
```
	 }
	
```javascript
	//3。保留两位小数处理
	var npriceStr = eval(nprice).toFixed(2);
```

```
	$("#npriceUpd").val(npriceStr);
```
	
```javascript
	//4。验证类型和长度
	var reg =  /(?!0+$)^[+-]?\d{0,9}(.\d{1,2})?$/;
```
    
```
	if(null == npriceStr.match(reg)){
		$.messager.alert('提示',"价格/天必须为正负数且两位小数，整数位不能大于9位，请重新输入！");
```
	 }
	

}

```
/**
 * 验证天数
```
 */
```javascript
function validateIdaynum(idaynum){
```
	
```
	if ("" == idaynum) {
		$.messager.alert('提示',"天数不可为空，请输入！");
```
	} 
	
```javascript
	var idaynumReg =  /^\d+$/g; 
	if(null == idaynum.match(idaynumReg)){
		$.messager.alert('提示',"天数必须为正整数，请重新输入！");
		$('#idaynumUpd').val("");
```
	 }
	
```javascript
	//3。验证类型和长度
	var reg =  /^[1-9]\d{0,28}?$/;
```
    
```
	if(null == idaynum.match(reg)){
		$.messager.alert('提示',"天数必须为正整数且长度不能大于28位，请重新输入！");
```
	 }
	
}

```
/**
 * 保存
```
 */
```javascript
function doSave(){
```

```
	//获取表单的值
```
	
	
```
	//天数
```
	
```javascript
	//应收金额
	var nyingshoumny = $("#nyingshoumnyUpd").val();
```

}
 

```java
/**
 * 后台验证数据
 */
@Service

public class AccountCoachServiceImpl implements AccountCoachService {

    private Json verifyAccountCoach(FmAccountCoachDto dto) throws Exception{

	Json json = new Json();
	
	//天数
	String idaynum = dto.getIdaynum();
	
	String nprice = dto.getNprice();
	
	//备注
	String vremark = dto.getVremark();
	
	//四舍五入并保留两位小数
	BigDecimal bigDecimal = new BigDecimal(nprice);  
	BigDecimal npriceDou = bigDecimal.setScale(2, BigDecimal.ROUND_HALF_UP); 
  
  
	//金额计算处理
	BigDecimal nyingshoumny = (new BigDecimal(nprice)).multiply(new BigDecimal(idaynum));
	DecimalFormat myformat=new java.text.DecimalFormat("0.00");
	String nyingshoumnyStr = myformat.format(nyingshoumny);
	accountCoach.setNyingshoumny(new BigDecimal(nyingshoumnyStr));
			
	
	//验证备注的长度
	if ("".equals(vremark) && vremark.trim().getBytes("GBK").length > 20) {
		json.fail();
		json.setInfo("备注的长度不可超过20位，请重新输入！");
		return json;
	}
	
  }


```

### 二、分页方法重写

EasyUI的DataGrid组件默认的分页功能在某些场景下可能无法满足需求，比如需要在前端进行分页处理、自定义分页逻辑等。本节介绍如何重写分页方法，实现自定义分页功能。

```
应用场景：
```
- 数据量较小，需要在前端进行分页
- 需要自定义分页显示逻辑
- 需要动态调整分页参数


```
/**
 * 加载列表数据
 * @param data
```
 */
```javascript
function loadDatagrid(data){
```
	
```
    $("#list_datagrid").datagrid({  
      fitColumns:false, 
      striped:true, 
	  rownumbers:true, 
	  nowrap:true, 
	  singleSelect:false, 
	  serialCtrl:true, 
	  pagination:true, 
	  pageSize:10, 
	  pageList:[10,20,30], 
	  onClickCell: onClickCell,
      data:data.slice(0,10) 
    }); 
```
    
```
    //分页处理
    pagerFilter(data);
```
    
}


```
/**
 * 分页数据的操作 
```
 */
```javascript
function pagerFilter(data){ 
```
	
```javascript
	   var pager = $("#list_datagrid").datagrid("getPager"); 
	    pager.pagination({ 
	      total:data.length, 
	      onSelectPage:function (pageNo, pageSize) { 
	        var start = (pageNo - 1) * pageSize; 
	        var end = start + pageSize; 
	        $("#list_datagrid").datagrid("loadData", data.slice(start, end)); 
```
	        
```javascript
	        var rowNumbers = $('.datagrid-cell-rownumber');
	        $(rowNumbers).each(function(index){
	        var row = parseInt($(rowNumbers[index]).html()) + parseInt(start);
	          $(rowNumbers[index]).html("");
	          $(rowNumbers[index]).html(row);
	          });
```
	          
```
	        pager.pagination('refresh', { 
	          pageNumber:pageNo 
	        }); 
	    }); 
```
   

```


### 三、日历框方法重写

EasyUI的DateBox和DateTimeBox组件提供了丰富的日期选择功能，但在实际项目中，我们经常需要自定义日期格式、限制日期范围、只显示年月等特殊需求。本节介绍如何重写日历框方法，实现这些自定义功能。

常见需求：
- 只显示年月，不显示日期
- 自定义日期时间格式
- 设置默认时间范围
- 限制可选日期范围


<div class="query_ipt font_sz12 font_clr66">
	<span class=" " >运费月份</span>
	<input  class="easyui-datebox" id="month" name="month" data-options="editable:false">

	<span class="autoStyle"><span class="font_clred font_sz14">*</span>创建时间从</span>
	<input  class="easyui-datetimebox start" id="startDate"  data-options="formatter:ww3,parser:w3,editable:false,required:true" >
	<span class="autoStyle"><span class="font_clred font_sz14">*</span>创建时间到</span>
	<input class="easyui-datetimebox end"  id="endDate"  data-options="formatter:ww3,parser:w3,editable:false,required:true" >


```
```
/**
```
 */

```
    //加载日历-年月
    doDatebox("month");
```
    
```
    //初始化默认时间
    getDateForMat('startDate','endDate');
```
    
```
    //初始化日历框内时间
    InitiTime('startDate','endDate'); 
```
      
```
});
```

```
/**
  * 日历控件修改-只显示年月
  * @param dateboxId  日历控件id
  * @param callBack  回调函数，参数为选中的日期，可以做后期处理，可以不传   
```
  */
```javascript
function doDatebox(dateboxId,callBack){
    $('#'+dateboxId).datebox({
        onShowPanel: function (){
            //显示日趋选择对象后再触发弹出月份层的事件，初始化时没有生成月份层
            span.trigger('click'); //触发click事件弹出月份层
            if (!tds) setTimeout(function () {//延时触发获取月份对象，因为上面的事件触发和对象生成有时间间隔
                tds = p.find('div.calendar-menu-month-inner td');
                tds.click(function (e) {
                    e.stopPropagation(); //禁止冒泡执行easyui给月份绑定的事件
                    var year = /\d{4}/.exec(span.html())[0]//得到年份
                    , month = parseInt($(this).attr('abbr'), 10); //月份，这里不需要+1
                    $('#'+dateboxId).datebox('hidePanel')//隐藏日期对象
                    .datebox('setValue', year + '-' + month); //设置日期的值
                     //alert(undefined != callBack);
                    //执行回调函数
                    if(undefined != callBack){
                    	callBack(new Date(year + '-' + month));
```
                    }
```
                });
            }, 0);
            yearIpt.unbind();//解绑年份输入框中任何事件
```
        },
```javascript
        parser: function (s) {
            if (!s) return new Date();
            var arr = s.split('-');
            return new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, 1);
```
        },
```javascript
        formatter: function (d) { return d.getFullYear() + '-' + (d.getMonth() + 1);/*getMonth返回的是0开始的，忘记了。。已修正*/ }
    });
```

```javascript
    var p = $('#'+dateboxId).datebox('panel'), //日期选择对象
        tds = false, //日期选择对象中月份
        yearIpt = p.find('input.calendar-menu-year'),//年份输入框
        span = p.find('span.calendar-text'); //显示月份层的触发控件
```
}

```
/**
 * 初始化默认时间
 * @param startTime
 * @param endTime
```
 */
```javascript
function getDateForMat(startTime , endTime){
	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "/";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
		  month = "0" + month;
```
		}
```
		if (strDate >= 0 && strDate <= 9) {
		  strDate = "0" + strDate;
```
		}
```javascript
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
```
		    + "/ " + "00" + seperator2 +"00"
```
		    + seperator2 + "00";
		return currentdate;
```
	}
```javascript
	function getNowFormatDate2() {
```
		}
		}
		    + "/ " + "23" + seperator2 +"59"
```
		    + seperator2 + "59";
```
	}
```javascript
	function time(){
		var h = date.getHours();  
		var min = date.getMinutes();  
		var sec = date.getSeconds();  
		var str = (h<10?('0'+h):h)+':'+(min<10?('0'+min):min)+':'+(sec<10?('0'+sec):sec);  
		return str;  
```
	} 
```javascript
	$('#'+startTime).datetimebox({
		value:getNowFormatDate(),
		onShowPanel:function(){
			$(this).datetimebox("spinner").timespinner("setValue",time()); 
```
		}
```
	});
```
	
```
	$('#'+endTime).datetimebox({ 
		value : getNowFormatDate2(), 
```
		}
```
	});
```

```
/**
 * 初始化日历框内时间
```
 */
```javascript
function InitiTime(startTime,endTime){
```
	
```
	      required : false, 
	      $(this).datetimebox("spinner").timespinner("setValue","00:00:00"); 
```
	      }
```
	    });
	      $(this).datetimebox("spinner").timespinner("setValue","23:59:59"); 
```
	      }
```
	    });
```
	    
}


```
/**
 * 加载格式化日历当前2018/01/05/ 00:00:00 - 2018/01/05/ 23:59:59
 * @param date
```
 */
```javascript
function ww3(date){  
    var y = date.getFullYear();  
    var m = date.getMonth()+1;  
    var d = date.getDate();  
    var str = y+'/'+(m<10?('0'+m):m)+'/'+(d<10?('0'+d):d)+'/'+' '+(h<10?('0'+h):h)+':'+(min<10?('0'+min):min)+':'+(sec<10?('0'+sec):sec);  
```
}  


```
/**
 * @param s
```
 */
```javascript
function w3(s){  
    var y = s.substring(0,4);  
    var m =s.substring(5,7);  
    var d = s.substring(8,10);  
    var h = s.substring(11,14);  
    var min = s.substring(15,17);  
    var sec = s.substring(18,20);  
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(h) && !isNaN(min) && !isNaN(sec)){  
        return new Date(y,m-1,d,h,min,sec);  
    } else {  
        return new Date();  
```
    }  


```