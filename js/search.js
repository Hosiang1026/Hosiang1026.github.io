function initSearch(){var e=$("#keywords"),t=$("#back"),n=$("#search-container"),r=$("#search-result"),s=$("#search-tpl").html(),o="/content.json?v="+ +new Date,i;function a(t){if(!i){var e=new XMLHttpRequest;e.open("GET",o,true);e.onload=function(){if(this.status>=200&&this.status<300){var e=JSON.parse(this.response||this.responseText);i=e instanceof Array?e:e.posts;t(i)}else{console.error(this.statusText)}};e.onerror=function(){console.error(this.statusText)};e.send()}else{t(i)}}function c(e,n){return e.replace(/\{\w+\}/g,function(e){var t=e.replace(/\{|\}/g,"");return n[t]||""})}function u(e){var t="";if(e.length){t=e.map(function(e){return c(s,{title:e.title,url:window.mihoConfig.root+"/"+e.path})}).join("")}else{t='<li class="search-result-item-tips"><p>No Result found!</p></li>'}r.html(t);l(true)}function l(e){if(e){n.addClass("search-container-show")}else{n.removeClass("search-container-show")}}function f(e){var n=this.value.trim().toLowerCase();if(!n){l(false);return}a(function(e){var t=[];e.forEach(function(e){if(e.title.toLowerCase().indexOf(n)>-1){t.push(e)}});u(t)});e.preventDefault()}e.bind("input propertychange",f)}