var ComicScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = stage.drawCanv.context;

  var clicker;

  var imgs;
  var cur_img;
  var prev_btn;
  var next_btn;
  var hit_ui;

  var node_y = dc.height-50;
  var node_s = 10;
  var btn_s = 40;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    imgs = [];
    for(var i = 0; i < 12; i++)
    {
      imgs[i] = new Image();
      imgs[i].src = "assets/comic/comic_"+i+".png";
    }

    prev_btn = new ButtonBox(xspace(1)-btn_s/2,node_y-btn_s/2,btn_s,btn_s,function(evt){if(hit_ui) return;cur_img--;hit_ui = true;});
    next_btn = new ButtonBox(0,0,dc.width,dc.height,                      function(evt){if(hit_ui) return;cur_img++;hit_ui = true;});
    clicker.register(prev_btn);
    clicker.register(next_btn);

    cur_img = 0;
  };

  var xspace = function(n)
  {
    return n*(dc.width/(imgs.length+3));
  }

  var duh = 0;
  self.tick = function()
  {
    if(cur_img >= imgs.length) { game.nextScene(); }
    else clicker.flush();
    hit_ui = false;
  };

  self.draw = function()
  {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,dc.width,dc.height);
    if(cur_img < imgs.length)
    {
      ctx.drawImage(imgs[cur_img],20,20,dc.width-40,dc.height-40);
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(prev_btn.x,prev_btn.y,prev_btn.w,prev_btn.h);
      ctx.fillRect(xspace(imgs.length+2)-btn_s/2,node_y-btn_s/2,btn_s,btn_s);
      var x;
      for(var i = 0; i < imgs.length; i++)
      {
        x = xspace(i+2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(x-node_s/2,node_y-node_s/2,node_s,node_s);
        if(i == cur_img)
        {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x-(node_s*0.8)/2,node_y-(node_s*0.8)/2,(node_s*0.8),(node_s*0.8));
        }
      }
    }
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};
