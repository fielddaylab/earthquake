var LoadingScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var canvas = dc.canvas;
  var ctx = dc.context;

  var pad;
  var barw;
  var progress;

  var n_loading_imgs_loaded = 0;
  var loading_img_srcs = [];
  var loading_imgs = [];
  var n_imgs_loaded = 0;
  var img_srcs = [];
  var imgs = [];

  var draw_t = 0;
  var max_draw_t = 250;

  var loadingImageLoaded = function()
  {
    n_loading_imgs_loaded++;
  };
  var imageLoaded = function()
  {
    n_imgs_loaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (dc.width-(2*pad));
    progress = 0;
    ctx.font = "12px Open Sans"; //put font that nees loading here
    ctx.fillStyle = "#000000";
    ctx.fillText(".",0,0);// funky way to encourage any custom font to load

    //put asset paths in loading_img_srcs (for assets used on loading screen itself)
    loading_img_srcs.push("assets/loading/by.png");
    loading_img_srcs.push("assets/loading/clouds.png");
    loading_img_srcs.push("assets/loading/flag.png");
    loading_img_srcs.push("assets/loading/logo.png");
    loading_img_srcs.push("assets/loading/pole.png");
    for(var i = 0; i < loading_img_srcs.length; i++)
    {
      loading_imgs[i] = new Image();
      loading_imgs[i].onload = loadingImageLoaded;
      loading_imgs[i].src = loading_img_srcs[i];
    }
    loadingImageLoaded(); //call once to prevent 0/0 != 100% bug

    //put asset paths in img_srcs
    img_srcs.push("assets/bg.png");
    img_srcs.push("assets/city_circ.png");
    img_srcs.push("assets/city_circ_destroy.png");
    img_srcs.push("assets/city_square.png");
    img_srcs.push("assets/city_square_destroy.png");
    img_srcs.push("assets/city_tri.png");
    img_srcs.push("assets/city_tri_destroy.png");
    img_srcs.push("assets/btn_fast.png");
    img_srcs.push("assets/btn_next.png");
    img_srcs.push("assets/btn_pause.png");
    img_srcs.push("assets/btn_play.png");
    img_srcs.push("assets/btn_slow.png");
    img_srcs.push("assets/guess_fail.png");
    img_srcs.push("assets/guess_success.png");
    img_srcs.push("assets/guess_unknown.png");
    img_srcs.push("assets/icon_circ.png");
    img_srcs.push("assets/icon_square.png");
    img_srcs.push("assets/icon_tri.png");
    img_srcs.push("assets/origin_tt.png");
    img_srcs.push("assets/play_head.png");
    for(var i = 0; i < img_srcs.length; i++)
    {
      imgs[i] = new Image();
      imgs[i].onload = imageLoaded;
      imgs[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    //note- assets used on loading screen itself NOT included in wait
    var p = n_imgs_loaded/(img_srcs.length+1);
    if(progress <= p) progress += 0.01;
    if(p >= 1.0) draw_t++;
    if(draw_t >= max_draw_t)
    {
      bake();
      game.nextScene();
    }
  };

  var flag_p = 0;
  self.draw = function()
  {
    var pole_x = 100;
    var pole_w = 68/2;
    var pole_h = 1158/2;

    var p = n_loading_imgs_loaded/(loading_img_srcs.length+1);
    if(p >= 1.0) //assets used in loading screen itself have been loaded
    {
      //do any special drawing here
      var f = draw_t/20;
      if(f > 1) f = 1;
      ctx.globalAlpha = f;
      ctx.fillStyle = "#15A9CB"; //blue
      ctx.fillRect(0,0,dc.width,dc.height);


      //continue to draw underlying bar during fade in
      ctx.fillStyle = "#EFC72F"; //yellow
      flag_p = lerp(flag_p,progress,0.05);
      ctx.fillRect(pole_x+15,dc.height-pole_h*progress,pole_w-30,pole_h);

      var w;
      var h;
      w = 1540*3/4;
      h = 564*3/4;
      ctx.drawImage(loading_imgs[1],-w+draw_t,0,w,h); //clouds
      ctx.drawImage(loading_imgs[1],draw_t,0,w,h); //clouds
      w = pole_w;
      h = pole_h;
      ctx.drawImage(loading_imgs[4],pole_x,dc.height-h,w,h); //pole
      w = 280;
      h = 122;
      ctx.drawImage(loading_imgs[2],pole_x+pole_w-20,dc.height-(pole_h-50)*flag_p,w,h); //flag
      w = 122/2;
      h = 68/2;
      ctx.drawImage(loading_imgs[0],240,260,w,h);
      w = 640/2;
      h = 118/2;
      ctx.drawImage(loading_imgs[3],240,260+40,w,h);

      var n = 20;
      if(draw_t > max_draw_t-n)
      {
        f = (draw_t-(max_draw_t-n))/n;
        if(f > 1) f = 1;
        if(f < 0) f = 0;
        ctx.globalAlpha = f;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,dc.width,dc.height);
      }
      ctx.globalAlpha = 1;
    }
    else
    {
      ctx.fillStyle = "#EFC72F"; //yellow
      ctx.fillRect(pole_x+25,dc.height-pole_h*progress,pole_w-50,pole_h);
    }

  };

  self.cleanup = function()
  {
    imgs = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    loading_imgs = [];//just used them to cache assets in browser; let garbage collector handle 'em.
  };
};

