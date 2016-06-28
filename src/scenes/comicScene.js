var ComicScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = stage.drawCanv.context;

  var clicker;

  var imgs;
  var cur_img;
  var next_btn;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    imgs = []; var i = 0;
    imgs[i] = new Image(); imgs[i].src = "assets/city_circ.png"; i++;
    imgs[i] = new Image(); imgs[i].src = "assets/city_tri.png"; i++;

    next_btn = new ButtonBox(0,0,dc.width,dc.height,function(evt){cur_img++;});
    clicker.register(next_btn);

    cur_img = 0;
  };

  var duh = 0;
  self.tick = function()
  {
    if(cur_img >= imgs.length) { game.nextScene(); }
    else clicker.flush();
  };

  self.draw = function()
  {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,dc.width,dc.height);
    if(cur_img < imgs.length) ctx.drawImage(imgs[cur_img],20,20,dc.width-40,dc.height-40);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};
