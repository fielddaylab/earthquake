var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = dc.context;

  var clicker;

  var btn_intro;
  var btn_sp;
  var btn_triangulate;
  var btn_GPS;
  var btn_game;
  var btn_free;

  var btn_s;
  var btn_y_0;
  var btn_y_1;
  var btn_x;

  var section_line_y;
  var title_y;

  self.ready = function()
  {
    checkGameEnd();
    clicker = new Clicker({source:stage.dispCanv.canvas});

    var n_x_btns = 4;
    section_line_y = 278/2+10;
    btn_s = dc.width/(n_x_btns+2);
    btn_y_0 = section_line_y+1*(dc.height-section_line_y)/3-btn_s/2-10;
    btn_y_1 = section_line_y+2*(dc.height-section_line_y)/3-btn_s/2+10;
    btn_x = [];
    for(var i = 0; i < n_x_btns; i++)
      btn_x[i] = btn_s/2+ ( btn_s+ (btn_s/(n_x_btns-1)))*i;

    title_y = dc.height/2-30;

    btn_intro       = new ButtonBox(btn_x[0],btn_y_0,btn_s,btn_s,function(evt){ game.start = 0; game.setScene(4); }); btn_intro.img = btn_intro_img;
    btn_sp          = new ButtonBox(btn_x[1],btn_y_0,btn_s,btn_s,function(evt){ game.start = 1; game.setScene(4); }); btn_sp.img = btn_sp_img;
    btn_triangulate = new ButtonBox(btn_x[2],btn_y_0,btn_s,btn_s,function(evt){ game.start = 2; game.setScene(4); }); btn_triangulate.img = btn_triangulate_img;
    btn_GPS         = new ButtonBox(btn_x[3],btn_y_0,btn_s,btn_s,function(evt){ game.start = 3; game.setScene(4); }); btn_GPS.img = btn_gps_img;

    btn_game        = new ButtonBox(btn_x[0],btn_y_1,btn_s,btn_s,function(evt){ game.start = 4; game.setScene(4); }); btn_game.img = btn_game_img;
    btn_free        = new ButtonBox(btn_x[1],btn_y_1,btn_s,btn_s,function(evt){ game.start = 5; game.setScene(4); }); btn_free.img = btn_free_img;

    clicker.register(btn_intro);
    clicker.register(btn_sp);
    clicker.register(btn_triangulate);
    clicker.register(btn_GPS);
    clicker.register(btn_game);
    clicker.register(btn_free);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  var space = String.fromCharCode(8202)+String.fromCharCode(8202);
  self.draw = function()
  {
    ctx.drawImage(comic_img,0,0,dc.width,dc.height);
    ctx.drawImage(menu_grad_img,0,0,dc.width,dc.height);
    var w = 324/2;
    var h = 278/2;
    ctx.drawImage(menu_logo_img,30,section_line_y-h,w,h);

    ctx.lineWidth = 10;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    dc.drawLine(0,section_line_y,dc.width,section_line_y);
    dc.drawLine(btn_x[0]+btn_s/2,btn_y_0+btn_s/2,btn_x[3]+btn_s/2,btn_y_0+btn_s/2);
    ctx.textAlign = "right";
    ctx.font = "60px SueEllen";
    ctx.fillText("Earthquake!".split("").join(space+space),dc.width-20,section_line_y-40);

    ctx.textAlign = "center";
    ctx.font = "20px Open Sans";
    rectBtn(btn_intro,"Intro",game.intro_complete);
    rectBtn(btn_sp,"SP",game.sp_complete);
    rectBtn(btn_triangulate,"Triangulate",game.triangulate_complete);
    rectBtn(btn_GPS,"GPS",game.gps_complete);
    rectBtn(btn_game,"Game",false);
    rectBtn(btn_free,"Free",false);

  };
  var rectBtn = function(btn,lbl,chck)
  {
    ctx.fillStyle = "#FFFFFF";
  /*
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
  */
    ctx.drawImage(btn.img,btn.x,btn.y,btn.w,btn.h);
    ctx.fillText(lbl,btn.x+btn.w/2,btn.y+btn.h+20);
    if(chck) ctx.drawImage(check_img,btn.x+btn.w-30,btn.y-10,40,40);
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

