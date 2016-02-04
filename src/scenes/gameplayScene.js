var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var Earth = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = dc.width;
    self.h = dc.height;

    self.t = 0;

    self.quakes = [];
    self.locations = [];

    self.registerLocation = function(l)
    {
      self.locations.push(l);
    }

    self.tick = function()
    {
      self.t++;
    }

    self.click = function(evt)
    {
      var q = new Quake(evt.doX/dc.width,evt.doY/dc.height,self.t);
      self.quakes.push(q);
    }

    var location_size = 0.1;
    var lw = location_size*dc.width;
    var lh = location_size*dc.height;
    var quake_rate = 0.01;
    self.draw = function()
    {
      var l;
      dc.context.fillStyle = "#000000";
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];
        dc.context.fillRect(l.x-lw/2,l.y-lh/2,lw,lh);
      }
      var q;
      dc.context.strokeStyle = "#000000";
      for(var i = 0; i < self.quakes.length; i++)
      {
        q = self.quakes[i];
        if((self.t-q.t)*quake_rate > 1) continue; //no need to draw
        console.log("drawing...");

        dc.context.beginPath();
        dc.context.arc(q.x,q.y,(self.t-q.t)*quake_rate*dc.width,0,2*Math.PI);
        dc.context.stroke();
      }
    }
  }

  var Quake = function(x,y,t)
  {
    var self = this;

    self.x = dc.width*x;
    self.y = dc.height*y;

    self.ex = x;
    self.ey = y;
    self.t = t;
  }

  var Location = function(x,y)
  {
    var self = this;

    self.x = dc.width*x;
    self.y = dc.height*y;

    self.ex = x;
    self.ey = y;
  }

  var clicker;
  var earth;
  var A;
  var B;
  var C;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    earth = new Earth();
    clicker.register(earth);
    A = new Location(Math.random(),Math.random());
    B = new Location(Math.random(),Math.random());
    C = new Location(Math.random(),Math.random());
    earth.registerLocation(A);
    earth.registerLocation(B);
    earth.registerLocation(C);
  };

  self.tick = function()
  {
    clicker.flush();
    earth.tick();
  };

  self.draw = function()
  {
    earth.draw();
  };

  self.cleanup = function()
  {
  };

};

