<style>
#banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 106%;
  background-position: center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  background-size: cover;
  background-image: url("https://source.unsplash.com/random/1920x420"), url("../photo/album/system/system_001.jpg");
  z-index: -1;
}

.outer{
     max-width: 100% !important;
     margin: 0 auto;
     padding: 0 20px;
  }

</style>

<script type="text/javascript">
    //修改标题
    $(function(){
    $('title').html('相册 | 狂欢马克思');
    });
</script>

<!-- load stylesheets -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400">  <!-- Google web font "Open Sans" -->
<link rel="stylesheet" href="/photo/font/css/font-awesome.min.css">                <!-- Font Awesome -->
<link rel="stylesheet" href="/photo/css/bootstrap.min.css">                                      <!-- Bootstrap style -->
<link rel="stylesheet" href="/photo/css/magnific-popup.css">                                     <!-- Magnific Popup -->
<link rel="stylesheet" href="/photo/css/templatemo-style.css">                                   <!-- Templatemo style -->

<div class="container-fluid" id="main">
    
<!-- Gallery -->
<section  id="gallery" class="tm-section tm-section-gallery tm-flex" style = "margin-top: -71px;">
    <div class="tm-page-content-width tm-flex-col tm-gallery-content" style = "height: 10%; ">
            <div class="iso-box-section" style = "margin-top: -20px;">
                <div id="test" class="iso-box-wrapper col4-iso-box" style="margin-left: -20px; display:none; ">
                </div> 
                <div id="albumList" class="iso-box-wrapper col4-iso-box" style="margin-left: -20px;"></div>                            
            </div>
  <div id="menu" align = "center" style = "margin-top: -47px;">
       <a id="returnAlbum" href="###" style="display:none;">返回相册列表</a>&emsp;&emsp;<a id="firstPage" href="###">首页</a>&emsp;&emsp;<a id="prePage" href="###">上一页</a>&emsp;&emsp;<a id="nextPage" href="###">下一页</a>&emsp;&emsp;<a id="lastPage" href="###">尾页</a>&emsp;&emsp;<select id="jumpWhere"></select>&emsp;&emsp;<a href="###" id="jumpPage"> 跳转</a>&emsp;&emsp;当前第<a id="current"></a>页&emsp;&emsp;总计<a id="pages"></a> 页 &emsp;&emsp;总计<a id="total"></a>条
   </div>  
 </div>

    

             
</section>
    
<!-- load JS files -->
<script src="/photo/js/isotope.pkgd.min.js"></script>         <!-- https://isotope.metafizzy.co/ -->
<script src="/photo/js/imagesloaded.pkgd.min.js"></script>     <!-- https://imagesloaded.desandro.com/ --> 
<script src="/photo/js/jquery.magnific-popup.min.js"></script> <!-- http://dimsemenov.com/plugins/magnific-popup/ -->

<script src="/photo/js/photo.js"></script>

<script>     

    $(document).ready(function () {
        // Isotope for Gallery
        if ( $('.iso-box-wrapper').length > 0 ) { 
            var $container  = $('.iso-box-wrapper'), 
            $imgs = $('.iso-box img');

            $container.imagesLoaded(function () {
                $container.isotope({
                    layoutMode: 'fitRows',
                    itemSelector: '.iso-box'
                });
                $imgs.load(function(){
                    $container.isotope('reLayout');
                })
            });

            //filter items on button click
            $('.filter-wrapper li a').click(function(){
                var $this = $(this), filterValue = $this.attr('data-filter');
                $container.isotope({ 
                    filter: filterValue,
                    animationOptions: { 
                        duration: 750, 
                        easing: 'linear', 
                        queue: false, 
                    }                
                });             

                // don't proceed if already selected
                if ( $this.hasClass('selected') ) { 
                    return false; 
                }

                var filter_wrapper = $this.closest('.filter-wrapper');
                filter_wrapper.find('.selected').removeClass('selected');
                $this.addClass('selected');

                return false;
            });
        }

        // Magnific Popup for Gallery
        $('.iso-box-wrapper').magnificPopup({
            delegate: 'a', // child items selector, by clicking on it popup will open
            type: 'image',
            gallery:{enabled:true}
        });

        // Smooth scrolling (https://css-tricks.com/snippets/jquery/smooth-scrolling/)
        // Select all links with hashes
        $('a[href*="#"]')
          // Remove links that don't actually link to anything
          .not('[href="#"]')
          .not('[href="#0"]')
          .click(function(event) {
            // On-page links
            if (
              location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
              && 
              location.hostname == this.hostname
            ) {
              // Figure out element to scroll to
              var target = $(this.hash);
              target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
              // Does a scroll target exist?
              if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                  scrollTop: target.offset().top
                }, 600, function() {
                  // Callback after animation
                  // Must change focus!
                  var $target = $(target);
                  $target.focus();
                  if ($target.is(":focus")) { // Checking if the target was focused
                    return false;
                  } else {
                    $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                    $target.focus(); // Set focus again
                  }
                });
              }
            }
          });

        // Update the current year in copyright
        $('.tm-current-year').text(new Date().getFullYear());          
    });

</script>

</div>