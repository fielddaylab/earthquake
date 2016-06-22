var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  var btn_intro;
  var btn_sp;
  var btn_triangulate;
  var btn_GPS;
  var btn_game;
  var btn_free;

  var btn_s;
  var btn_y;
  var btn_x;

  var section_line_0_y;
  var section_line_1_y;
  var title_y;
  var subtitle_y;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    var n_btns = 6;
    btn_s = dc.width/(n_btns+2);
    btn_y = (3*dc.height/4)-btn_s/2;
    btn_x = [];
    for(var i = 0; i < n_btns; i++)
      btn_x[i] = btn_s/2+ ( btn_s+ (btn_s/(n_btns-1)))*i;

    section_line_0_y = dc.height/3;
    section_line_1_y = dc.height/3+120;
    title_y = dc.height/2-30;
    subtitle_y = btn_y-40;

    btn_intro       = new ButtonBox(btn_x[0],btn_y,btn_s,btn_s,function(evt){ game.start = 0; game.setScene(3); });
    btn_sp          = new ButtonBox(btn_x[1],btn_y,btn_s,btn_s,function(evt){ game.start = 1; game.setScene(3); });
    btn_triangulate = new ButtonBox(btn_x[2],btn_y,btn_s,btn_s,function(evt){ game.start = 2; game.setScene(3); });
    btn_GPS         = new ButtonBox(btn_x[3],btn_y,btn_s,btn_s,function(evt){ game.start = 3; game.setScene(3); });
    btn_game        = new ButtonBox(btn_x[4],btn_y,btn_s,btn_s,function(evt){ game.start = 4; game.setScene(3); });
    btn_free        = new ButtonBox(btn_x[5],btn_y,btn_s,btn_s,function(evt){ game.start = 5; game.setScene(3); });

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
    dc.context.textAlign = "center";

    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(0,0,dc.width,dc.height,5);
    dc.context.fillStyle = "#000000";

    dc.context.fillStyle = "#00FF00";//blue;

    dc.context.fillStyle = "#333333";
    dc.context.font = "25px Open Sans";
    dc.context.fillText("The Earthquake Game".split("").join(space),dc.width/2-100,100);
    dc.context.font = "Bold 16px Open Sans";
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(dc.width/2-110,120,175,30,20);
    dc.context.fillStyle = "#333333";
    dc.context.fillText("There's a lot of unnecessary text on this screen",dc.width/2-100,140);
    dc.context.font = "12px Open Sans";

    dc.context.lineWidth = 0.5;
    dc.context.strokeStyle = "#666666";
    dc.drawLine(0,section_line_0_y,dc.width,section_line_0_y);
    dc.drawLine(0,section_line_1_y,dc.width,section_line_1_y);

    dc.context.textAlign = "center";
    rectBtn(btn_intro,"Intro");
    rectBtn(btn_sp,"SP");
    rectBtn(btn_triangulate,"Triangulate");
    rectBtn(btn_GPS,"GPS");
    rectBtn(btn_game,"Game");
    rectBtn(btn_free,"Free");

    dc.context.font = "40px Open Sans";
    dc.context.fillText("EARTHQUAKE".split("").join(space+space),dc.width/2,title_y);
  };
  var rectBtn = function(btn,lbl)
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.fillStyle = "#000000";
    dc.context.fillText(lbl,btn.x+btn.w/2,btn.y+btn.h+20);
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

