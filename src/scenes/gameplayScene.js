var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var location_size = 0.1;
  var quake_s_rate = 0.001;
  var quake_p_rate = 0.0005;
  var s_color = "#FF0000";
  var p_color = "#0000FF";
  var n_locations = 3;
  var n_quakes = 1;
  var p_waves = true;

  var hoverer;
  var dragger;
  var clicker;

  var state;
  var ENUM = 0;
  var STATE_PLAY = ENUM; ENUM++;
  var STATE_PAUSE = ENUM; ENUM++;

  var earth;
  var hloc;

  var scrubber;
  var play_button;
  var pause_button;
  var reset_button;

  self.ready = function()
  {
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    state = STATE_PLAY;

    earth = new Earth();

    scrubber = new Scrubber(earth);

    play_button  = new ButtonBox(10,10,20,20,function(){state = STATE_PLAY;});
    pause_button = new ButtonBox(40,10,20,20,function(){state = STATE_PAUSE;});
    reset_button = new ButtonBox(dc.width-30,10,20,20,function(){earth.reset();});

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
      if(earth.t < earth.recordable_t) earth.t++;
    }
  };

  self.draw = function()
  {
    earth.draw();
    if(state != STATE_PLAY)
    {
      dc.context.globalAlpha=0.5;
      dc.context.fillStyle = "#FFFFFF";
      dc.context.fillRect(0,0,dc.width,dc.height);
      dc.context.globalAlpha=1.0;
    }
    scrubber.draw();
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

    self.locations = [];
    self.quakes = [];
    self.ghost_quake;

    var square = document.createElement('canvas');
    square.width = 10;
    square.height = 10;
    square.context = square.getContext('2d');
    square.context.fillStyle = "#000000";
    square.context.fillRect(0,0,square.width,square.height);

    var circle = document.createElement('canvas');
    circle.width = 10;
    circle.height = 10;
    circle.context = circle.getContext('2d');
    circle.context.fillStyle = "#000000";
    circle.context.beginPath();
    circle.context.arc(circle.width/2,circle.height/2,circle.width/2,0,2*Math.PI);
    circle.context.fill();

    var triangle = document.createElement('canvas');
    triangle.width = 10;
    triangle.height = 10;
    triangle.context = triangle.getContext('2d');
    triangle.context.fillStyle = "#000000";
    triangle.context.beginPath();
    triangle.context.moveTo(0,triangle.height);
    triangle.context.lineTo(triangle.width/2,0);
    triangle.context.lineTo(triangle.width,triangle.height);
    triangle.context.fill();

    self.reset = function()
    {
      self.t = 0;

      var l;
      for(var i = 0; i < n_locations; i++)
      {
        if(l = self.locations[i])
        {
          hoverer.unregister(l);
          dragger.unregister(l);
        }
        l = new Location(Math.random(),Math.random());
             if(i == 0) l.shape = square;
        else if(i == 1) l.shape = circle;
        else if(i == 2) l.shape = triangle;
        hoverer.register(l);
        dragger.register(l);
        self.locations[i] = l;
      }

      for(var i = 0; i < n_quakes; i++)
        self.quakes[i] = new Quake(9999,9999,-1);

      self.ghost_quake = new Quake(Math.random(),Math.random(),0);
      self.ghost_quake.eval_loc_ts(self.locations);
    }
    self.reset();

    self.click = function(evt)
    {
      if(evt.hit_ui) return; //only "hit" if unobtruded
      evt.hit_ui = true;
      self.t = 0;
      state = STATE_PLAY;

      var q = new Quake(evt.doX/dc.width,evt.doY/dc.height,self.t);
      q.eval_loc_ts(self.locations);
      self.quakes.push(q);
      if(self.quakes.length > n_quakes) self.quakes.splice(0,1);
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
      dc.context.strokeStyle = s_color;
      dc.context.beginPath();
      dc.context.ellipse(q.x, q.y, (self.t-q.t)*quake_s_rate*dc.width, (self.t-q.t)*quake_s_rate*dc.height, 0, 0, 2 * Math.PI);
      dc.context.stroke();

      if(p_waves)
      {
        dc.context.strokeStyle = p_color;
        dc.context.beginPath();
        dc.context.ellipse(q.x, q.y, (self.t-q.t)*quake_p_rate*dc.width, (self.t-q.t)*quake_p_rate*dc.height, 0, 0, 2 * Math.PI);
        dc.context.stroke();
      }
    }
    self.drawLoc = function(l,qx,qy)
    {
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

        //quake-shakes
        var qx = 0;
        var qy = 0;
        var td = 0;
        var qn = 50;
        var wd = 0.01;
        for(var j = 0; j < self.quakes.length; j++)
        {
          td = self.t - self.quakes[j].location_s_ts[i];
          if(td > 0 && td < qn)
          {
            qx += Math.random()*(qn-td)/qn*wd;
            qy += Math.random()*(qn-td)/qn*wd;
          }
          if(p_waves)
          {
            td = self.t - self.quakes[j].location_p_ts[i];
            if(td > 0 && td < qn)
            {
              qx += Math.random()*(qn-td)/qn*wd/2;
              qy += Math.random()*(qn-td)/qn*wd/2;
            }
          }
        }
        //ghost-quake-shake
        td = self.t - self.ghost_quake.location_s_ts[i];
        if(td > 0 && td < qn)
        {
          qx += Math.random()*(qn-td)/qn*wd;
          qy += Math.random()*(qn-td)/qn*wd;
        }
        if(p_waves)
        {
          td = self.t - self.ghost_quake.location_p_ts[i];
          if(td > 0 && td < qn)
          {
            qx += Math.random()*(qn-td)/qn*wd/2;
            qy += Math.random()*(qn-td)/qn*wd/2;
          }
        }

        self.drawLoc(l,qx,qy);
      }

      //draw quakes
      var q;
      for(var i = 0; i < self.quakes.length; i++)
      {
        q = self.quakes[i];
        if(
          self.t < q.t || //in the past
          (self.t-q.t)*quake_s_rate > 2 //far enough in future, can guarantee no longer on screen
        ) continue;

        dc.context.strokeStyle = "rgba(0,0,0,"+Math.pow(((i+1)/n_quakes),2)+")";
        self.drawQuake(q);
      }
    }
  }

  var Quake = function(x,y,t)
  {
    var self = this;

    self.x = dc.width*x;
    self.y = dc.height*y;

    self.wx = x;
    self.wy = y;
    self.t = t;

    self.location_s_ts = [];
    self.location_p_ts = [];
    for(var i = 0; i < n_locations; i++)
    {
      self.location_s_ts[i] = 9999;
      self.location_p_ts[i] = 9999;
    }

    self.eval_loc_ts = function(locations)
    {
      var l;
      for(var i = 0; i < locations.length; i++)
      {
        l = locations[i];
        var d = wdist(l,self);
        self.location_s_ts[i] = self.t+(d/quake_s_rate);
        self.location_p_ts[i] = self.t+(d/quake_p_rate);
      }
    }
  }

  var Location = function(x,y)
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

    self.shape; //sets externally

    self.hovering = false;
    self.hover = function(evt)
    {
      self.hovering = true;
      hloc = self;
    }
    self.unhover = function(evt)
    {
      self.hovering = false;
      if(hloc == self) hloc = undefined;
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
      if(self.move_locs)
      {
        for(var i = 0; i < n_quakes; i++)
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
      self.earth.t = Math.round((evt.doX/dc.width)*self.earth.recordable_t);
    }
    self.dragFinish = function(evt)
    {
      self.dragging = false;
    }

    self.drawBlip = function(t,solid)
    {
      var x = Math.round((t/self.earth.recordable_t)*dc.width);
      if(solid)
        dc.context.fillRect(x-1,self.y,2,self.h);
      else
      {
        dc.context.fillRect(x-2,self.y,4,self.h*0.2);
        dc.context.fillRect(x-2,self.y+self.h*0.8,4,self.h*0.2);
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
    self.draw = function()
    {
      dc.context.font = "10px Helvetica";
      dc.context.textAlign = "center";

      var hloc_i = -1;
      for(var i = 0; i < self.earth.locations.length; i++)
        if(hloc == self.earth.locations[i]) hloc_i = i;

      //draw self
      dc.context.fillStyle = "#AAAAAA";
      dc.context.fillRect(self.x,self.y,self.w,self.h);
      dc.context.fillStyle = "#FFFFFF";
      self.drawBlip(self.earth.t,1);
      dc.context.fillStyle = "#000000";
      self.labelBlip(self.earth.t,1);

      //draw ghost quake/loc blips
      var q;
      var l;
      q = self.earth.ghost_quake;
      for(var j = 0; j < self.earth.locations.length; j++)
      {
        if(j == hloc_i)
        {
          dc.context.globalAlpha=1;
          dc.context.fillStyle = "#000000";
          self.labelBlip(q.location_s_ts[j]);
          if(p_waves) self.labelBlip(q.location_p_ts[j]);
        }
        else
        {
          dc.context.globalAlpha=0.2;
          self.shapeBlip(q.location_s_ts[j],self.earth.locations[j].shape);
          if(p_waves) self.shapeBlip(q.location_p_ts[j],self.earth.locations[j].shape);
        }
        dc.context.fillStyle = s_color; self.drawBlip(q.location_s_ts[j],0);
        if(p_waves) { dc.context.fillStyle = p_color; self.drawBlip(q.location_p_ts[j],0); }
      }

      //draw quake/loc blips
      var q;
      var l;
      for(var i = 0; i < self.earth.quakes.length; i++)
      {
        q = self.earth.quakes[i];
        for(var j = 0; j < self.earth.locations.length; j++)
        {
          if(self.earth.t < q.location_s_ts[j]) continue;
          if(j == hloc_i)
          {
            dc.context.globalAlpha=1;
            dc.context.fillStyle = "#000000";
            self.labelBlip(q.location_s_ts[j]);
            if(p_waves) { if(self.earth.t > q.location_p_ts[j]) self.labelBlip(q.location_p_ts[j]); }
          }
          else
          {
            dc.context.globalAlpha=0.2;
            self.shapeBlip(q.location_s_ts[j],self.earth.locations[j].shape);
            if(p_waves) { if(self.earth.t > q.location_p_ts[j]) self.shapeBlip(q.location_p_ts[j],self.earth.locations[j].shape); }
          }
          dc.context.fillStyle = s_color; self.drawBlip(q.location_s_ts[j],1);
          if(p_waves)
          {
            if(self.earth.t > q.location_p_ts[j])
            {
              dc.context.fillStyle = p_color;
              self.drawBlip(q.location_p_ts[j],1);
            }
          }
        }
      }
      dc.context.globalAlpha=1;
    }
  }

};

