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

    //start at 1 to avoid div/0
    self.t = 1;
    self.recorded_t = 1;

    self.quakes = [];
    self.locations = [];

    self.registerLocation = function(l)
    {
      self.locations.push(l);
    }

    self.tick = function()
    {
      if(self.t > self.recorded_t) self.recorded_t = self.t;
    }

    self.click = function(evt)
    {
      if(evt.hit_ui) return; //only "hit" if unobtruded
      evt.hit_ui = true;
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
        if(
          self.t < q.t || //in the past
          (self.t-q.t)*quake_rate > 1 //far enough in future, can guarantee no longer on screen
        ) continue;

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

  var Scrubber = function(earth)
  {
    var self = this;
    self.w = 10;
    self.h = 20;
    self.x = 0;
    self.y = dc.height-self.h;

    self.earth = earth;

    //just to steal event from earth
    self.click = function(evt)
    {
      evt.hit_ui = true;
    }

    self.dragging = false;
    self.dragStart = function(evt)
    {
      evt.hit_ui = true;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      evt.hit_ui = true;
      if(!self.dragging) return;
      self.earth.t = Math.round((evt.doX/dc.width)*self.earth.recorded_t);
    }
    self.dragFinish = function(evt)
    {
      self.dragging = false;
    }

    self.draw = function()
    {
      self.x = Math.round((self.earth.t/self.earth.recorded_t)*dc.width)-self.w/2;

      dc.context.fillStyle = "#000000";
      dc.context.fillRect(self.x,self.y,self.w,self.h);
    }
  }

  var clicker;
  var dragger;

  var state;
  var ENUM = 0;
  var STATE_PLAY = ENUM; ENUM++;
  var STATE_PAUSE = ENUM; ENUM++;

  var earth;
  var A;
  var B;
  var C;

  var scrubber;
  var play_button;
  var pause_button;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});

    state = STATE_PLAY;

    earth = new Earth();

    A = new Location(Math.random(),Math.random());
    B = new Location(Math.random(),Math.random());
    C = new Location(Math.random(),Math.random());
    earth.registerLocation(A);
    earth.registerLocation(B);
    earth.registerLocation(C);

    scrubber = new Scrubber(earth);

    play_button  = new ButtonBox(10,10,20,20,function(){state = STATE_PLAY;});
    pause_button = new ButtonBox(40,10,20,20,function(){state = STATE_PAUSE;});

    clicker.register(play_button);
    clicker.register(pause_button);
    clicker.register(scrubber);
    dragger.register(scrubber);
    clicker.register(earth);
  };

  self.tick = function()
  {
    clicker.flush();
    dragger.flush();

    if(state == STATE_PLAY)
      earth.t++;
    earth.tick();
  };

  self.draw = function()
  {
    earth.draw();
    scrubber.draw();
    play_button.draw(dc);
    pause_button.draw(dc);
  };

  self.cleanup = function()
  {
  };

};

