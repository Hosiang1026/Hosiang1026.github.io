<style>
.outer{
     max-width: 100% !important;
     margin: 0 auto;
     padding: 0 20px;
  }
</style>

<script type="text/javascript">
    //修改标题
    $(function(){
    $('title').html('笔记 | 狂欢马克思');
    });
</script>      


<iframe id="mainiframe" 
      frameborder="no"
      scrolling="no"
      width="100%" 
      height="100%" 
      align="center"
      src="https://Hosiang1026.coding.me/gitbook-site" >
</iframe>

<script type="text/javascript">
    function changeFrameHeight(){
        var ifm= document.getElementById("mainiframe");
        ifm.height=document.documentElement.clientHeight-56;
    }
    window.onresize=function(){ changeFrameHeight();};
    $(function(){changeFrameHeight();});
</script>    
