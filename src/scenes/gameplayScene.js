var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var location_size = 0.1;
  var quake_rate = 0.01;
  var n_locations = 3;

  var clicker;
  var dragger;

  var state;
  var ENUM = 0;
  var STATE_PLAY = ENUM; ENUM++;
  var STATE_PAUSE = ENUM; ENUM++;

  var earth;
  var highlit_loc;

  var scrubber;
  var play_button;
  var pause_button;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    hoverer = new Hoverer({source:stage.dispCanv.canvas});

    state = STATE_PLAY;

    earth = new Earth();

    var l;
    for(var i = 0; i < n_locations; i++)
    {
      l = new Location(Math.random(),Math.random());
      hoverer.register(l);
      earth.registerLocation(l);
    }

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
    hoverer.flush();

    if(state == STATE_PLAY)
    {
      //only continue to play if something has happened in recent-ish past
      resume = false;
      for(var i = 0; !resume && i < earth.quakes.length; i++)
        if(earth.quakes[i].t > earth.t-(1/quake_rate)) resume = true;
      if(resume) earth.t++;
    }
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



//DATA

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

      var l;
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];
        var x = l.ex-q.ex;
        var y = l.ey-q.ey;
        var d = Math.sqrt((x*x)+(y*y));
        q[QuakeLocNames[i]] = q.t+(d/quake_rate);
      }
      self.quakes.push(q);
    }

    var lw = location_size*dc.width;
    var lh = location_size*dc.height;
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
        //dc.context.arc(q.x,q.y,(self.t-q.t)*quake_rate*dc.width,0,2*Math.PI);
        dc.context.ellipse(q.x, q.y, (self.t-q.t)*quake_rate*dc.width, (self.t-q.t)*quake_rate*dc.height, 0, 0, 2 * Math.PI);
        dc.context.stroke();
      }
    }
  }

  //javascript amirite
  var QuakeLocNames = [];
  QuakeLocNames[0] = "location_a_t";
  QuakeLocNames[1] = "location_b_t";
  QuakeLocNames[2] = "location_c_t";
  QuakeLocNames[3] = "location_d_t";
  QuakeLocNames[4] = "location_e_t";
  QuakeLocNames[5] = "location_f_t";
  QuakeLocNames[6] = "location_g_t";
  var Quake = function(x,y,t)
  {
    var self = this;

    self.x = dc.width*x;
    self.y = dc.height*y;

    self.ex = x;
    self.ey = y;
    self.t = t;

    //pre-populate because dynamic population = non-packed array
    self.location_a_t = 0;
    self.location_b_t = 0;
    self.location_c_t = 0;
    self.location_d_t = 0;
    self.location_e_t = 0;
    self.location_f_t = 0;
    self.location_g_t = 0;
  }

  var Location = function(x,y)
  {
    var self = this;

    self.x = dc.width*x;
    self.y = dc.height*y;

    self.ex = x;
    self.ey = y;

    self.hover = function(evt)
    {

    }
    self.unhover = function(evt)
    {

    }
  }

  var Scrubber = function(earth)
  {
    var self = this;
    self.w = dc.width;
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
      dc.context.fillStyle = "#AAAAAA";
      dc.context.fillRect(self.x,self.y,self.w,self.h);
      var x = Math.round((self.earth.t/self.earth.recorded_t)*dc.width);
      dc.context.fillStyle = "#000000";
      dc.context.fillRect(x-10,self.y,20,self.h);

      var q;
      var l;
      for(var i = 0; i < self.earth.quakes.length; i++)
      {
        q = self.earth.quakes[i];
        if(q.t < self.earth.t)
        {
          var x = Math.round((q.t/self.earth.recorded_t)*dc.width);
          dc.context.fillStyle = "#000000";
          dc.context.fillRect(x-1,self.y,2,self.h);

          for(var j = 0; j < self.earth.locations.length; j++)
          {
            if(q[QuakeLocNames[j]] < self.earth.t)
            {
              var x = Math.round((q[QuakeLocNames[j]]/self.earth.recorded_t)*dc.width);
              dc.context.fillStyle = "#FF0000";
              dc.context.fillRect(x-1,self.y,2,self.h);
            }
          }
        }
      }
    }
  }

};

