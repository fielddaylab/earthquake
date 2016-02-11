var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var location_size = 0.1;
  var quake_size = 0.03;
  var quake_s_rate = 0.001;
  var quake_p_rate = 0.0005;
  var s_color = "#FF0000";
  var p_color = "#0000FF";
  var n_locations = 3;
  var p_waves = true;

  var hoverer;
  var dragger;
  var clicker;

  var state;
  var ENUM = 0;
  var STATE_PLAY = ENUM; ENUM++;
  var STATE_PAUSE = ENUM; ENUM++;
  var play_speed;

  var earth;
  var hloc;
  var hloc_i;
  var hquak;
  var hquak_i;

  var scrubber;
  var speed_1x_button;
  var speed_2x_button;
  var speed_4x_button;
  var speed_8x_button;
  var play_button;
  var pause_button;
  var reset_button;

  self.ready = function()
  {
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    state = STATE_PAUSE;
    play_speed = 1;

    earth = new Earth();

    scrubber = new Scrubber(earth);

    speed_1x_button = new ToggleBox(dc.width-120,dc.height-60,20,20,true, function(on) { if(on) play_speed = 1; else if(play_speed == 1) speed_1x_button.on = true; speed_2x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_2x_button = new ToggleBox(dc.width-90, dc.height-60,20,20,false,function(on) { if(on) play_speed = 2; else if(play_speed == 2) speed_2x_button.on = true; speed_1x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_4x_button = new ToggleBox(dc.width-60, dc.height-60,20,20,false,function(on) { if(on) play_speed = 4; else if(play_speed == 4) speed_4x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_8x_button.on = false; });
    speed_8x_button = new ToggleBox(dc.width-30, dc.height-60,20,20,false,function(on) { if(on) play_speed = 8; else if(play_speed == 8) speed_8x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_4x_button.on = false; });

    play_button  = new ButtonBox(10,10,20,20,function(){state = STATE_PLAY;});
    pause_button = new ButtonBox(40,10,20,20,function(){state = STATE_PAUSE;});
    reset_button = new ButtonBox(dc.width-30,10,20,20,function(){earth.reset();state = STATE_PAUSE;});

    clicker.register(speed_1x_button);
    clicker.register(speed_2x_button);
    clicker.register(speed_4x_button);
    clicker.register(speed_8x_button);
    clicker.register(play_button);
    clicker.register(pause_button);
    clicker.register(reset_button);
    dragger.register(scrubber);
    clicker.register(scrubber);
    hoverer.register(earth);
    clicker.register(earth);
  };

  self.tick = function()
  {
    hoverer.flush();
    dragger.flush();
    clicker.flush();

    if(state == STATE_PLAY)
    {
      if(earth.t < earth.recordable_t) earth.t += play_speed;
    }
  };

  self.draw = function()
  {
    earth.draw();

    scrubber.draw();
    speed_1x_button.draw(dc);
    speed_2x_button.draw(dc);
    speed_4x_button.draw(dc);
    speed_8x_button.draw(dc);
    //play_button.draw(dc);
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";
    dc.context.beginPath();
    dc.context.moveTo(play_button.x,play_button.y);
    dc.context.lineTo(play_button.x+play_button.w,play_button.y+play_button.h/2);
    dc.context.lineTo(play_button.x,play_button.y+play_button.h);
    dc.context.fill();
    //pause_button.draw(dc);
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";
    dc.context.fillRect(pause_button.x,pause_button.y,8,pause_button.h);
    dc.context.fillRect(pause_button.x+pause_button.w-8,pause_button.y,8,pause_button.h);
    reset_button.draw(dc);
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

    self.t = 0;
    self.recordable_t = 1.5/quake_p_rate;

    self.locations;
    self.quakes;
    self.ghost_quake;

    self.reset = function()
    {
      self.t = 0;

      for(var i = 0; self.locations && i < self.locations.length; i++)
      {
        hoverer.unregister(self.locations[i]);
        dragger.unregister(self.locations[i]);
      }

      hloc = undefined;
      hloc_i = -1;
      self.locations = [];
      var l;
      for(var i = 0; i < n_locations; i++)
      {
        l = new Location(randR(0.2,0.8),randR(0.2,0.8),i);
             if(i == 0) l.shape = square;
        else if(i == 1) l.shape = circle;
        else if(i == 2) l.shape = triangle;
        hoverer.register(l);
        dragger.register(l);
        self.locations.push(l);
      }

      for(var i = 0; self.quakes && i < self.quakes.length; i++)
      {
        hoverer.unregister(self.quakes[i]);
      }
      hquak = undefined;
      hquak_i = -1;
      self.quakes = [];
      self.ghost_quake = new Quake(randR(0.2,0.8),randR(0.2,0.8),0);
      self.ghost_quake.eval_loc_ts(self.locations);
    }
    self.reset();

    self.click = function(evt)
    {
      if(evt.hit_ui) return; //only "hit" if unobtruded
      evt.hit_ui = true;
      self.t = 0;
      state = STATE_PLAY;

      var q = new Quake(evt.doX/dc.width,evt.doY/dc.height,self.t,self.ghost_quake);
      q.eval_loc_ts(self.locations);
      hoverer.register(q);
      hquak = q;
      self.quakes.push(q);
    }

    self.hovering = false;
    self.hoveringX = 0;
    self.hoveringY = 0;
    self.hovering_wx = 0;
    self.hovering_wy = 0;
    self.hover = function(evt)
    {
      self.hovering = true;
      self.hoveringX = evt.doX;
      self.hoveringY = evt.doY;
      self.hovering_wx = self.hoveringX/dc.width;
      self.hovering_wy = self.hoveringY/dc.height;
    }
    self.unhover = function()
    {
      self.hovering = false;
    }

    self.drawQuake = function(q)
    {
      if(q == hquak)
      {
        dc.context.strokeStyle = "#000000";
        dc.context.beginPath();
        dc.context.arc(q.cx, q.cy, q.w/2, 0, 2 * Math.PI);
        dc.context.stroke();

        dc.context.strokeStyle = s_color;
        dc.context.beginPath();
        dc.context.ellipse(q.cx, q.cy, (self.t-q.t)*quake_s_rate*dc.width, (self.t-q.t)*quake_s_rate*dc.height, 0, 0, 2 * Math.PI);
        dc.context.stroke();

        if(p_waves)
        {
          dc.context.strokeStyle = p_color;
          dc.context.beginPath();
          dc.context.ellipse(q.cx, q.cy, (self.t-q.t)*quake_p_rate*dc.width, (self.t-q.t)*quake_p_rate*dc.height, 0, 0, 2 * Math.PI);
          dc.context.stroke();
        }
      }

      if(q.c_aware_t < self.t)
      {
        if(q.c) dc.context.drawImage(cmark,q.cx-cmark.width/2,q.cy-cmark.height/2);
        else    dc.context.drawImage(xmark,q.cx-xmark.width/2,q.cy-xmark.height/2);
      }
      else
        dc.context.drawImage(qmark,q.cx-qmark.width/2,q.cy-qmark.height/2);
    }
    self.drawLoc = function(l,shake_amt)
    {
      var qx = 0;
      var qy = 0;
      var wd = 0.01;
      qx += Math.random()*shake_amt*wd;
      qy += Math.random()*shake_amt*wd;
      dc.context.beginPath();
      dc.context.ellipse(l.cx+qx*dc.width,l.cy+qy*dc.height,location_size/2*dc.width,location_size/2*dc.height,0,0,2*Math.PI);
      dc.context.stroke();
      dc.context.drawImage(l.shape,l.cx+qx*dc.width-l.shape.width/2,l.cy+qy*dc.height-l.shape.height/2,l.shape.width,l.shape.height);
      if(l == hloc)
      {
        dc.context.fillStyle = "#000000";
        //dc.context.fillText("("+fviz(l.wx)+","+fviz(l.wy)+")",l.x,l.y-1);
      }
    }
    self.quakeShakes = function(q,i)
    {
      var t_delta = 0;
      var q_t = 50;
      var shake_amt = 0;

      t_delta = self.t - q.location_s_ts[i];
      if(t_delta > 0 && t_delta < q_t)
        shake_amt += (q_t-t_delta)/q_t;
      if(p_waves)
      {
        t_delta = self.t - q.location_p_ts[i];
        if(t_delta > 0 && t_delta < q_t)
          shake_amt += ((q_t-t_delta)/q_t)/2;
      }

      return shake_amt;
    }
    self.draw = function()
    {
      dc.context.font = "10px Helvetica";
      dc.context.textAlign = "center";

      //draw distance viz
      var l;
      dc.context.strokeStyle = "#000000";
      dc.context.fillStyle = "#000000";
      dc.context.globalAlpha=0.1;
      var mouse = { wx:self.hovering_wx, wy:self.hovering_wy, cx:self.hovering_wx*dc.width, cy:self.hovering_wy*dc.height };
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];

        if(!l.drag_rad)
        {
          var x = l.wx-mouse.wx;
          var y = l.wy-mouse.wy;
          var d = Math.sqrt(x*x+y*y);

          dc.context.beginPath();
          dc.context.ellipse(mouse.cx,mouse.cy,d*dc.width,d*dc.height,0,0,2*Math.PI); //circles around mouse
          dc.context.ellipse((mouse.wx+x/2)*dc.width,(mouse.wy+y/2)*dc.height,d/2*dc.width,d/2*dc.height,0,0,2*Math.PI); //circles between mouse/location
          dc.context.ellipse(l.cx,l.cy,d*dc.width,d*dc.height,0,0,2*Math.PI); //circles around locs
          dc.context.moveTo(l.cx,l.cy); dc.context.lineTo(mouse.cx,mouse.cy); //line
          dc.context.stroke();
          if(l.dragging || l.hovering)
          {
            dc.context.fillStyle = s_color;
            dc.context.fillText("("+Math.round(d/quake_s_rate)+")",(mouse.wx+x/2)*dc.width,(mouse.wy+y/2)*dc.height-10); //line annotations
            if(p_waves)
            {
              dc.context.fillStyle = p_color;
              dc.context.fillText("("+Math.round(d/quake_p_rate)+")",(mouse.wx+x/2)*dc.width,(mouse.wy+y/2)*dc.height-20); //line annotations
            }
          }
        }
        else
        {
          var x = l.wx-l.mx;
          var y = l.wy-l.my;
          var d = Math.sqrt(x*x+y*y);

          dc.context.beginPath();
          dc.context.ellipse(l.cx,l.cy,l.rad*dc.width,l.rad*dc.height,0,0,2*Math.PI); //circles around locs
          dc.context.moveTo(l.cx,l.cy); dc.context.lineTo(l.mx*dc.width,l.my*dc.height); //line
          dc.context.stroke();
          if(l.dragging || l.hovering)
          {
            dc.context.fillStyle = s_color;
            dc.context.fillText("("+Math.round(l.rad/quake_s_rate)+")",(l.mx+x/2)*dc.width,(l.my+y/2)*dc.height-10);
            if(p_waves)
            {
              dc.context.fillStyle = p_color;
              dc.context.fillText("("+Math.round(l.rad/quake_p_rate)+")",(l.mx+x/2)*dc.width,(l.my+y/2)*dc.height-20);
            }
          }
        }
      }
      dc.context.globalAlpha=1;

      //draw locations
      var l;
      dc.context.strokeStyle = "#000000";
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];
        var shake_amt = 0;

        if(hquak) shake_amt += self.quakeShakes(hquak,i);
        shake_amt += self.quakeShakes(self.ghost_quake,i);

        self.drawLoc(l,shake_amt);
      }

      //draw quakes
      for(var i = 0; i < self.quakes.length; i++)
        self.drawQuake(self.quakes[i]);
    }
  }

  var Quake = function(x,y,t,ghost)
  {
    var self = this;

    self.wx = x;
    self.wy = y;

    self.cx = dc.width*self.wx;
    self.cy = dc.height*self.wy;

    self.w = quake_size*dc.width;
    self.h = quake_size*dc.height;
    self.x = self.cx-self.w/2;
    self.y = self.cy-self.h/2;

    self.t = t;

    self.location_s_ts = [];
    self.location_p_ts = [];
    self.location_s_cs = []
    self.location_p_cs = []
    self.c_aware_t = 9999;
    self.c = false;

    for(var i = 0; i < n_locations; i++)
    {
      self.location_s_ts[i] = 9999;
      self.location_p_ts[i] = 9999;
      self.location_s_cs[i] = 0;
      self.location_p_cs[i] = 0;
    }

    self.eval_loc_ts = function(locations)
    {
      var l;
      self.c = true;
      var first_false = 99999;
      var last_true = 0;
      for(var i = 0; i < locations.length; i++)
      {
        l = locations[i];
        var d = wdist(l,self);
        self.location_s_ts[i] = self.t+(d/quake_s_rate);
        self.location_p_ts[i] = self.t+(d/quake_p_rate);
        self.location_s_cs[i] = (ghost != undefined && Math.abs(self.location_s_ts[i]-ghost.location_s_ts[i]) < 10);
        self.location_p_cs[i] = (ghost != undefined && Math.abs(self.location_p_ts[i]-ghost.location_p_ts[i]) < 10);

        if(!self.location_s_cs[i])
        {
          if(self.location_s_ts[i] < first_false) first_false = self.location_s_ts[i];
          self.c = false;
        }
        else
          if(self.location_s_ts[i] > last_true) last_true = self.location_s_ts[i];
        if(!self.location_p_cs[i])
        {
          if(self.location_p_ts[i] < first_false) first_false = self.location_p_ts[i];
          self.c = false;
        }
        else
          if(self.location_p_ts[i] > last_true) last_true = self.location_p_ts[i];
      }
      if(self.c) self.c_aware_t = last_true;
      else       self.c_aware_t = first_false;
    }

    self.hovering = false;
    self.hover = function(evt)
    {
      self.hovering = true;
      hquak = self;
      hquak_i = self.i;
    }
    self.unhover = function(evt)
    {
      self.hovering = false;
    }
  }

  var Location = function(x,y,i)
  {
    var self = this;

    self.wx = x;
    self.wy = y;

    self.cx = dc.width*self.wx;
    self.cy = dc.height*self.wy;

    self.w = location_size*dc.width;
    self.h = location_size*dc.height;
    self.x = self.cx-self.w/2;
    self.y = self.cy-self.h/2;

    self.i = i;

    self.shape; //sets externally

    self.hovering = false;
    self.hover = function(evt)
    {
      self.hovering = true;
      hloc = self;
      hloc_i = self.i;
    }
    self.unhover = function(evt)
    {
      self.hovering = false;
      if(hloc == self)
      {
        hloc = undefined;
        hloc_i = -1;
      }
    }

    self.move_locs = false;
    self.drag_rad = true;

    self.dragging = false;
    if(self.move_locs)
    {
      self.offX = 0;
      self.offY = 0;
    }
    if(self.drag_rad)
    {
      self.rad = 0;
      self.mx = self.wx;
      self.my = self.wy;
    }
    self.dragStart = function(evt)
    {
      if(self.move_locs)
      {
        self.offX = evt.doX-self.x;
        self.offY = evt.doY-self.y;
      }
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      self.dragging = true;
      evt.hit_ui = true;
      hloc = self;
      hloc_i = self.i;
      if(self.move_locs)
      {
        self.deltaX = ((evt.doX-self.x)-self.offX);
        self.deltaY = ((evt.doY-self.y)-self.offY);
        self.x = self.x + self.deltaX;
        self.y = self.y + self.deltaY;
        self.offX = evt.doX - self.x;
        self.offY = evt.doY - self.y;
        self.wx = (self.x+self.w/2)/dc.width;
        self.wy = (self.y+self.h/2)/dc.height;
        self.cx = dc.width*self.wx;
        self.cy = dc.height*self.wy;
      }
      if(self.drag_rad)
      {
        self.mx = evt.doX/dc.width;
        self.my = evt.doY/dc.height;
        var x = self.mx-self.wx;
        var y = self.my-self.wy;
        self.rad = Math.sqrt(x*x+y*y);
      }
    }
    self.dragFinish = function()
    {
      self.dragging = false;
      hloc = undefined;
      hloc_i = -1;
      if(self.move_locs)
      {
        for(var i = 0; i < earth.quakes.length; i++)
          earth.quakes[i].eval_loc_ts(earth.locations);
        earth.ghost_quake.eval_loc_ts(earth.locations);
      }
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
    var saved_stagte = STATE_PLAY;
    self.dragStart = function(evt)
    {
      evt.hit_ui = true;
      self.dragging = true;
      saved_state = state;
      state = STATE_PAUSE;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      evt.hit_ui = true;
      if(!self.dragging) return;
      self.earth.t = Math.round((evt.doX/dc.width)*self.earth.recordable_t);
    }
    self.dragFinish = function(evt)
    {
      self.dragging = false;
      state = saved_state;
    }

    self.drawBlip = function(t,ghost,correct)
    {
      var x = Math.round((t/self.earth.recordable_t)*dc.width);
      if(ghost)
      {
        dc.context.fillRect(x-2,self.y,4,self.h*0.2);
        dc.context.fillRect(x-2,self.y+self.h*0.8,4,self.h*0.2);
      }
      else
      {
        dc.context.fillRect(x-1,self.y,2,self.h);
        if(correct)
          dc.context.drawImage(cmark,x-cmark.width/2,self.y+self.h/2-cmark.height/2);
        else
          dc.context.drawImage(xmark,x-xmark.width/2,self.y+self.h/2-xmark.height/2);
      }
    }
    self.labelBlip = function(t)
    {
      var x = Math.round((t/self.earth.recordable_t)*dc.width);
      dc.context.fillText(Math.round(t),x,self.y-1);
    }
    self.shapeBlip = function(t,shape)
    {
      var x = Math.round((t/self.earth.recordable_t)*dc.width);
      dc.context.drawImage(shape,x-shape.width/2,self.y-5-shape.height);
    }
    self.drawQuakeBlips = function(q,ghost)
    {
      for(var i = 0; i < self.earth.locations.length; i++)
      {
        var draw_s =             (ghost || self.earth.t > q.location_s_ts[i]);
        var draw_p = (p_waves && (ghost || self.earth.t > q.location_p_ts[i]));
        if(i == hloc_i)
        {
          dc.context.globalAlpha=1;
          dc.context.fillStyle = "#000000";
          if(draw_s) self.labelBlip(q.location_s_ts[i]);
          if(draw_p) self.labelBlip(q.location_p_ts[i]);
        }
        else
        {
          dc.context.globalAlpha=0.2;
          if(draw_s) self.shapeBlip(q.location_s_ts[i],self.earth.locations[i].shape);
          if(draw_p) self.shapeBlip(q.location_p_ts[i],self.earth.locations[i].shape);
        }
        if(draw_s) { dc.context.fillStyle = s_color; self.drawBlip(q.location_s_ts[i],ghost,q.location_s_cs[i]); }
        if(draw_p) { dc.context.fillStyle = p_color; self.drawBlip(q.location_p_ts[i],ghost,q.location_p_cs[i]); }
      }
    }
    self.draw = function()
    {
      dc.context.font = "10px Helvetica";
      dc.context.textAlign = "center";

      //draw self
      dc.context.fillStyle = "#AAAAAA";
      dc.context.fillRect(self.x,self.y,self.w,self.h);
      dc.context.fillStyle = "#FFFFFF";
      self.drawBlip(self.earth.t,1);
      dc.context.fillStyle = "#000000";
      self.labelBlip(self.earth.t,1);

      self.drawQuakeBlips(self.earth.ghost_quake,true);
      if(hquak) self.drawQuakeBlips(hquak,false)
      dc.context.globalAlpha=1;
    }
  }

};

//icons
var square = GenIcon();
square.context.fillRect(0,0,square.width,square.height);

var circle = GenIcon();
circle.context.beginPath();
circle.context.arc(circle.width/2,circle.height/2,circle.width/2,0,2*Math.PI);
circle.context.fill();

var triangle = GenIcon();
triangle.context.beginPath();
triangle.context.moveTo(0,triangle.height);
triangle.context.lineTo(triangle.width/2,0);
triangle.context.lineTo(triangle.width,triangle.height);
triangle.context.fill();

var qmark = GenIcon();
qmark.context.fillText("?",qmark.width/2,qmark.height-2);

var xmark = GenIcon();
xmark.context.fillText("✖",xmark.width/2,xmark.height-2);

var cmark = GenIcon();
cmark.context.fillText("✔",cmark.width/2,cmark.height-2);

