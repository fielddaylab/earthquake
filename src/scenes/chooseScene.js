var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  var btn_intro;
  var btn_sp;
  var btn_triangulate;
  var btn_GPS;
  var btn_free;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    btn_intro       = new ButtonBox(10,10, dc.width-20,30,function(evt){ game.start = 0; game.setScene(3); });
    btn_sp          = new ButtonBox(10,50, dc.width-20,30,function(evt){ game.start = 1; game.setScene(3); });
    btn_triangulate = new ButtonBox(10,90, dc.width-20,30,function(evt){ game.start = 2; game.setScene(3); });
    btn_GPS         = new ButtonBox(10,130,dc.width-20,30,function(evt){ game.start = 3; game.setScene(3); });
    btn_free        = new ButtonBox(10,170,dc.width-20,30,function(evt){ game.start = 4; game.setScene(3); });

    clicker.register(btn_intro);
    clicker.register(btn_sp);
    clicker.register(btn_triangulate);
    clicker.register(btn_GPS);
    clicker.register(btn_free);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  self.draw = function()
  {
    btn_intro.draw(dc);       dc.context.fillStyle = "#000000"; dc.context.fillText("Intro",btn_intro.x+8,btn_intro.y+btn_intro.h-4);
    btn_sp.draw(dc);          dc.context.fillStyle = "#000000"; dc.context.fillText("S&P",btn_sp.x+8,btn_sp.y+btn_sp.h-4);
    btn_triangulate.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Triangulate",btn_triangulate.x+8,btn_triangulate.y+btn_triangulate.h-4);
    btn_GPS.draw(dc);         dc.context.fillStyle = "#000000"; dc.context.fillText("GPS",btn_GPS.x+8,btn_GPS.y+btn_GPS.h-4);
    btn_free.draw(dc);        dc.context.fillStyle = "#000000"; dc.context.fillText("Free",btn_free.x+8,btn_free.y+btn_free.h-4);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};
