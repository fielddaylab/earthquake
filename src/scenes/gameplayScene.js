var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var location_size = 0.1;
  var quake_size = 0.03;
  var quake_s_rate = 0.0005;
  var quake_p_rate = 0.001;
  var s_color = "#FF0000";
  var p_color = "#0000FF";
  var debug_levels = true;

  var hoverer;
  var dragger;
  var clicker;
  var presser;
  var hover_qs;
  var drag_qs;
  var click_qs;
  var press_qs;
  var ui_lock;

  var state;
  var ENUM = 0;
  var STATE_PLAY  = ENUM; ENUM++;
  var STATE_PAUSE = ENUM; ENUM++;
  var play_speed;

  var levels;
  var cur_level;

  var earth;
  var hov_loc;
  var hov_loc_i;
  var hov_quak;
  var hov_quak_i;

  var next_button;
  var scrubber;
  var speed_1x_button;
  var speed_2x_button;
  var speed_4x_button;
  var speed_8x_button;
  var reset_button;
  var del_all_quakes_button;
  var del_sel_quakes_button;
  var desel_quakes_button;

  self.ready = function()
  {
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});
    ui_lock = undefined;

    state = STATE_PAUSE;
    play_speed = 1;

    var l;
    levels = [];

    if(debug_levels)
    {
      //-1
      l = new Level();
      l.n_locations = 3;
      l.quake_start_range = 0;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.deselect_on_create = true;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.prompt = "test this!";
      levels.push(l);
    }
    else
    {
      //0
      l = new Level();
      l.n_locations = 1;
      l.loc_1_x = 0.5;
      l.loc_1_y = 0.5;
      l.quake_start_range = 0;
      l.quake_x = 0.25;
      l.quake_y = 0.25;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.deselect_on_create = true;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.prompt = "A location has reported a quake. What can we know about where this quake occurred?";
      levels.push(l);
    }

    cur_level = 0;

    earth = new Earth();
    earth.reset();

    next_button = new ButtonBox(10,10,20,20,function(){ ui_lock = self; self.nextLevel(); });
    clicker.register(next_button);
    scrubber = new Scrubber(earth);

    speed_1x_button = new ToggleBox(dc.width-120,dc.height-60,20,20,true, function(on) { ui_lock = self; if(on) play_speed = 1; else if(play_speed == 1) speed_1x_button.on = true; speed_2x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_2x_button = new ToggleBox(dc.width-90, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 2; else if(play_speed == 2) speed_2x_button.on = true; speed_1x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_4x_button = new ToggleBox(dc.width-60, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 4; else if(play_speed == 4) speed_4x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_8x_button.on = false; });
    speed_8x_button = new ToggleBox(dc.width-30, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 8; else if(play_speed == 8) speed_8x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_4x_button.on = false; });

    reset_button = new ButtonBox(dc.width-30,10,20,20,function(){ ui_lock = self; earth.reset(); state = STATE_PAUSE;});
    del_all_quakes_button = new ButtonBox(dc.width-60,10,20,20,function(){ ui_lock = self; earth.deleteQuakes(); state = STATE_PAUSE;});
    del_sel_quakes_button = new ButtonBox(dc.width-90,10,20,20,function(){ ui_lock = self; earth.deleteSelectedQuakes(); state = STATE_PAUSE;});
    desel_quakes_button = new ButtonBox(dc.width-120,10,20,20,function(){ ui_lock = self; earth.deselectQuakes();});

    clicker.register(speed_1x_button);
    clicker.register(speed_2x_button);
    clicker.register(speed_4x_button);
    clicker.register(speed_8x_button);
    clicker.register(reset_button);
    clicker.register(del_all_quakes_button);
    clicker.register(del_sel_quakes_button);
    clicker.register(desel_quakes_button);
    hoverer.register(earth);
    dragger.register(earth);
  };

  self.nextLevel = function()
  {
    cur_level = (cur_level+1)%levels.length;
    earth.reset();
  }

  self.manuallyFlushQueues = function()
  {
    if(ui_lock) return;
    //dragger first

    //scrubber takes first priority
    for(var i = 0; i < drag_qs.callbackQueue.length; i++)
    {
      if(
        drag_qs.callbackQueue[i] == scrubber.scrub_bar.dragStart ||
        drag_qs.callbackQueue[i] == scrubber.scrub_bar.drag ||
        drag_qs.callbackQueue[i] == scrubber.scrub_bar.dragFinish
      )
      {
        drag_qs.callbackQueue[i](drag_qs.evtQueue[i]);
        return;
      }
    }
    //non-earth (locations) takes second
    for(var i = 0; i < drag_qs.callbackQueue.length; i++)
    {
      if(
        drag_qs.callbackQueue[i] != earth.dragStart &&
        drag_qs.callbackQueue[i] != earth.drag &&
        drag_qs.callbackQueue[i] != earth.dragFinish
      )
      {
        drag_qs.callbackQueue[i](drag_qs.evtQueue[i]);
        return;
      }
    }
    //earth takes third
    for(var i = 0; i < drag_qs.callbackQueue.length; i++)
    {
      if(
        drag_qs.callbackQueue[i] == earth.dragStart ||
        drag_qs.callbackQueue[i] == earth.drag ||
        drag_qs.callbackQueue[i] == earth.dragFinish
      )
      {
        drag_qs.callbackQueue[i](drag_qs.evtQueue[i]);
        return;
      }
    }

    //now presser
    //non-earth (quakes) takes first
    for(var i = 0; i < press_qs.callbackQueue.length; i++)
    {
      if(
        press_qs.callbackQueue[i] != earth.press &&
        press_qs.callbackQueue[i] != earth.unpress
      )
      {
        press_qs.callbackQueue[i](press_qs.evtQueue[i]);
        console.log('found press');
        return;
      }
    }
    //earth takes second
    for(var i = 0; i < press_qs.callbackQueue.length; i++)
    {
      if(
        press_qs.callbackQueue[i] == earth.press ||
        press_qs.callbackQueue[i] == earth.unpress
      )
      {
        console.log('found epress');
        press_qs.callbackQueue[i](press_qs.evtQueue[i]);
        return;
      }
    }
  }
  self.tick = function()
  {
    hoverer.flush();
    clicker.flush();

    drag_qs = dragger.requestManualFlush();
    press_qs = presser.requestManualFlush();

    self.manuallyFlushQueues();

    dragger.manualFlush();
    presser.manualFlush();

    ui_lock = undefined;

    if(state == STATE_PLAY)
    {
      if(earth.t < earth.recordable_t) earth.t += play_speed;
    }
  };

  self.draw = function()
  {
    earth.draw();

    next_button.draw(dc);
    scrubber.draw();

    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";
    dc.context.textAlign = "center";
    //speed_buttons
    var b;

    b = speed_1x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("1x",b.x+b.w/2,b.y+b.h-2);
    b = speed_2x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("2x",b.x+b.w/2,b.y+b.h-2);
    b = speed_4x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("4x",b.x+b.w/2,b.y+b.h-2);
    b = speed_8x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("8x",b.x+b.w/2,b.y+b.h-2);

    b = reset_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("new",b.x+b.w/2,b.y+b.h-2);
    b = del_all_quakes_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("clear",b.x+b.w/2,b.y+b.h-2);
    b = del_sel_quakes_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("delete",b.x+b.w/2,b.y+b.h-2);
    b = desel_quakes_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("deselect",b.x+b.w/2,b.y+b.h-2);
  };

  self.cleanup = function()
  {
  };

  var Level = function()
  {
    var self = this;
    self.n_locations = 3;
    self.loc_1_x = 0;
    self.loc_1_y = 0;
    self.loc_2_x = 0;
    self.loc_2_y = 0;
    self.loc_3_x = 0;
    self.loc_3_y = 0;
    self.loc_4_x = 0;
    self.loc_4_y = 0;
    self.quake_start_range = 0;
    self.quake_x = 0;
    self.quake_y = 0;
    self.display_quake_start_range = true;
    self.p_waves = true;
    self.deselect_on_create = true;
    self.draw_mouse_quake = false;
    self.click_resets_t = true;
    self.variable_quake_t = false;
    self.allow_radii = true;
    self.prompt = "what's up?";
  }

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
    self.mouse_quake;

    self.clearLocations = function()
    {
      for(var i = 0; self.locations && i < self.locations.length; i++)
      {
        hoverer.unregister(self.locations[i]);
        dragger.unregister(self.locations[i]);
      }

      hov_loc = undefined;
      hov_loc_i = -1;
      self.locations = [];
    }
    self.genLocations = function()
    {
      var l;
      for(var i = 0; i < levels[cur_level].n_locations; i++)
      {
             if(i == 0)
        {
          if(levels[cur_level].loc_1_x) l = new Location(levels[cur_level].loc_1_x,levels[cur_level].loc_1_y,i);
          else                          l = new Location(randR(0.2,0.8),randR(0.2,0.8),i);
          l.shape = square;
        }
        else if(i == 1)
        {
          if(levels[cur_level].loc_2_x) l = new Location(levels[cur_level].loc_2_x,levels[cur_level].loc_2_y,i);
          else                          l = new Location(randR(0.2,0.8),randR(0.2,0.8),i);
          l.shape = circle;
        }
        else if(i == 2)
        {
          if(levels[cur_level].loc_3_x) l = new Location(levels[cur_level].loc_3_x,levels[cur_level].loc_3_y,i);
          else                          l = new Location(randR(0.2,0.8),randR(0.2,0.8),i);
          l.shape = triangle;
        }
        else if(i == 3)
        {
          if(levels[cur_level].loc_4_x) l = new Location(levels[cur_level].loc_4_x,levels[cur_level].loc_4_y,i);
          else                          l = new Location(randR(0.2,0.8),randR(0.2,0.8),i);
          l.shape = triangle;
        }
        hoverer.register(l);
        dragger.register(l);
        self.locations.push(l);
      }
    }
    self.deselectQuakes = function()
    {
      for(var i = 0; self.quakes && i < self.quakes.length; i++)
        self.quakes[i].selected = false;
    }
    self.deleteQuakes = function()
    {
      for(var i = 0; self.quakes && i < self.quakes.length; i++)
      {
        hoverer.unregister(self.quakes[i]);
      }

      hov_quak = undefined;
      hov_quak_i = -1;
      self.quakes = [];
    }
    self.deleteSelectedQuakes = function()
    {
      for(var i = 0; self.quakes && i < self.quakes.length; i++)
      {
        if(self.quakes[i].selected)
        {
          if(self.quakes[i] == hov_quak)
          {
            hov_quak = undefined;
            hov_quak_i = -1;
          }
          hoverer.unregister(self.quakes[i]);
          self.quakes.splice(i,1);
          i--;
        }
      }
    }
    self.popGhost = function()
    {
      var min_dist = location_size+quake_size;
      var accomplished = false;
      while(!accomplished)
      {
        if(levels[cur_level].quake_x) self.ghost_quake = new Quake(levels[cur_level].quake_x, levels[cur_level].quake_y, Math.round(Math.random()*levels[cur_level].quake_start_range));
        else                          self.ghost_quake = new Quake(           randR(0.2,0.8),            randR(0.2,0.8), Math.round(Math.random()*levels[cur_level].quake_start_range));
        accomplished = true;
        for(var i = 0; accomplished && i < self.locations.length; i++)
          accomplished = (wdist(self.locations[i],self.ghost_quake) > min_dist);
        if(accomplished) self.ghost_quake.eval_loc_ts(self.locations);
      }
    }

    self.reset = function()
    {
      self.t = 0;

      self.clearLocations();
      self.genLocations();
      self.deleteQuakes();
      self.popGhost();
      state = STATE_PAUSE;
    }
    self.mouse_quake = new Quake(0,0,0);

    self.hovering = false;
    self.hovering_x = 0;
    self.hovering_y = 0;
    self.hovering_wx = 0;
    self.hovering_wy = 0;
    self.hover = function(evt)
    {
      self.hovering = true;
      self.hovering_x = evt.doX;
      self.hovering_y = evt.doY;
      self.hovering_wx = self.hovering_x/dc.width;
      self.hovering_wy = self.hovering_y/dc.height;
    }
    self.unhover = function()
    {
      self.hovering = false;
    }

    self.dragging = false;
    self.dragging_x = -1;
    self.dragging_y = -1;
    self.dragging_wx = -1;
    self.dragging_wy = -1;
    self.drag_orig_wx = -1;
    self.drag_orig_wy = -1;
    self.dragStart = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      self.dragging = true;
      self.dragging_x = evt.doX;
      self.dragging_y = evt.doY;
      self.dragging_wx = self.dragging_x/dc.width;
      self.dragging_wy = self.dragging_y/dc.height;
      if(self.drag_orig_wx == -1)
      {
        self.drag_orig_wx = self.dragging_wx;
        self.drag_orig_wy = self.dragging_wy;
      }
    }
    self.dragFinish = function()
    {
      self.dragging = false;
      if(ui_lock && ui_lock != self) return; ui_lock = self;

      if(self.dragging_x == -1) return;
      if(
        Math.abs(self.dragging_wx-self.drag_orig_wx) < 0.05 &&
        Math.abs(self.dragging_wy-self.drag_orig_wy) < 0.05
      )
      {
        for(var i = 0; i < self.quakes.length; i++)
        {
          if(ptWithinObj(self.dragging_x, self.dragging_y, self.quakes[i]))
          {
            self.quakes[i].selected = !self.quakes[i].selected;
            self.dragging_x = -1;
            self.dragging_y = -1;
            self.dragging_wx = -1;
            self.dragging_wy = -1;
            self.drag_orig_wx = -1;
            self.drag_orig_wy = -1;
            return;
          }
        }

        if(levels[cur_level].click_resets_t)
        {
          self.t = 0;
          state = STATE_PLAY;
        }

        var q;
        if(levels[cur_level].variable_quake_t) q = new Quake(self.dragging_wx,self.dragging_wy,self.t,self.ghost_quake);
        else                                   q = new Quake(self.dragging_wx,self.dragging_wy,     0,self.ghost_quake);
        q.eval_loc_ts(self.locations);
        if(levels[cur_level].deselect_on_create) self.deselectQuakes();
        q.selected = true;
        hov_quak = q;
        hoverer.register(q);
        self.quakes.push(q);
      }

      var min_x = self.drag_orig_wx; if(self.dragging_wx < min_x) min_x = self.dragging_wx;
      var min_y = self.drag_orig_wy; if(self.dragging_wy < min_y) min_y = self.dragging_wy;
      var w = Math.abs(self.dragging_wx-self.drag_orig_wx);
      var h = Math.abs(self.dragging_wy-self.drag_orig_wy);
      for(var i = 0; i < self.quakes.length; i++)
      {
        if(ptWithin(self.quakes[i].wx, self.quakes[i].wy, min_x, min_y, w, h))
          self.quakes[i].selected = true;
      }

      self.dragging_x = -1;
      self.dragging_y = -1;
      self.dragging_wx = -1;
      self.dragging_wy = -1;
      self.drag_orig_wx = -1;
      self.drag_orig_wy = -1;
    }

    self.drawQuake = function(q)
    {
      if((self.t-q.t) < 0) return;

      if(q.selected || q == self.mouse_quake)
      {
        dc.context.strokeStyle = "#000000";
        dc.context.beginPath();
        dc.context.arc(q.cx, q.cy, q.w/2, 0, 2 * Math.PI);
        dc.context.stroke();

        dc.context.strokeStyle = s_color;
        dc.context.beginPath();
        dc.context.ellipse(q.cx, q.cy, (self.t-q.t)*quake_s_rate*dc.width, (self.t-q.t)*quake_s_rate*dc.height, 0, 0, 2 * Math.PI);
        dc.context.stroke();

        if(levels[cur_level].p_waves)
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
      qx += randR(-1,1)*shake_amt*wd;
      qy += randR(-1,1)*shake_amt*wd;
      dc.context.beginPath();
      dc.context.ellipse(l.cx+qx*dc.width,l.cy+qy*dc.height,location_size/2*dc.width,location_size/2*dc.height,0,0,2*Math.PI);
      dc.context.stroke();
      dc.context.drawImage(l.shape,l.cx+qx*dc.width-l.shape.width/2,l.cy+qy*dc.height-l.shape.height/2,l.shape.width,l.shape.height);
      if(l == hov_loc)
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
        shake_amt += ((q_t-t_delta)/q_t);
      if(levels[cur_level].p_waves)
      {
        t_delta = self.t - q.location_p_ts[i];
        if(t_delta > 0 && t_delta < q_t)
          shake_amt += ((q_t-t_delta)/q_t)/10;
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
          dc.context.stroke();
          if(l.dragging || l.hovering)
          {
            dc.context.beginPath();
            dc.context.moveTo(l.cx,l.cy); dc.context.lineTo(mouse.cx,mouse.cy); //line
            dc.context.stroke();

            dc.context.fillStyle = s_color;
            dc.context.fillText("("+Math.round(d/quake_s_rate)+")",(mouse.wx+x/2)*dc.width,(mouse.wy+y/2)*dc.height-10); //line annotations
            if(levels[cur_level].p_waves)
            {
              dc.context.fillStyle = p_color;
              dc.context.fillText("("+Math.round(d/quake_p_rate)+")",(mouse.wx+x/2)*dc.width,(mouse.wy+y/2)*dc.height-20); //line annotations
            }
          }
        }
        else if(l.drag_rad && levels[cur_level].allow_radii)
        {
          var x = l.wx-l.mx;
          var y = l.wy-l.my;
          var d = Math.sqrt(x*x+y*y);

          dc.context.beginPath();
          dc.context.ellipse(l.cx,l.cy,l.rad*dc.width,l.rad*dc.height,0,0,2*Math.PI); //circles around locs
          dc.context.stroke();
          if(l.dragging || l.hovering)
          {
            dc.context.beginPath();
            dc.context.moveTo(l.cx,l.cy); dc.context.lineTo(l.mx*dc.width,l.my*dc.height); //line
            dc.context.stroke();

            dc.context.fillStyle = s_color;
            dc.context.fillText("("+Math.round(l.rad/quake_s_rate)+")",(l.mx+x/2)*dc.width,(l.my+y/2)*dc.height-10);
            if(levels[cur_level].p_waves)
            {
              dc.context.fillStyle = p_color;
              dc.context.fillText("("+Math.round(l.rad/quake_p_rate)+")",(l.mx+x/2)*dc.width,(l.my+y/2)*dc.height-20);
            }
          }
        }
      }
      dc.context.globalAlpha=1;

      //draw selection box
      if(self.dragging)
      {
        var min_x = self.drag_orig_wx;
        var min_y = self.drag_orig_wy;
        if(self.dragging_wx < min_x) min_x = self.dragging_wx;
        if(self.dragging_wy < min_y) min_y = self.dragging_wy;
        var w = Math.abs(self.drag_orig_wx-self.dragging_wx);
        var h = Math.abs(self.drag_orig_wy-self.dragging_wy);
        dc.context.fillStyle = "#000000";
        dc.context.globalAlpha=0.1;
        dc.context.fillRect(min_x*dc.width,min_y*dc.height,w*dc.width,h*dc.height);
        dc.context.globalAlpha=1;
      }

      //draw locations
      var l;
      dc.context.strokeStyle = "#000000";
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];
        var shake_amt = 0;

        for(var j = 0; j < self.quakes.length; j++)
          if(self.quakes[j].selected) shake_amt += self.quakeShakes(self.quakes[j],i);
        shake_amt += self.quakeShakes(self.ghost_quake,i);

        self.drawLoc(l,shake_amt);
      }

      //draw quakes
      for(var i = 0; i < self.quakes.length; i++)
        self.drawQuake(self.quakes[i]);
      if(self.hovering && levels[cur_level].draw_mouse_quake && !hov_loc && !hov_quak && !scrubber.hovering)
      {
        self.mouse_quake.eval_pos(self.hovering_wx,self.hovering_wy);
        self.drawQuake(self.mouse_quake);
      }
    }
  }

  var Quake = function(x,y,t,ghost)
  {
    var self = this;

    self.t = t;

    self.location_s_ts = [];
    self.location_p_ts = [];
    self.location_s_cs = []
    self.location_p_cs = []
    self.c_aware_t = 9999;
    self.c = false;

    self.selected = false;

    self.eval_pos = function(x,y)
    {
      self.wx = x;
      self.wy = y;

      self.cx = dc.width*self.wx;
      self.cy = dc.height*self.wy;

      self.w = quake_size*dc.width;
      self.h = quake_size*dc.height;
      self.x = self.cx-self.w/2;
      self.y = self.cy-self.h/2;
    }
    self.eval_pos(x,y);

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
        if(levels[cur_level].p_waves)
        {
          if(!self.location_p_cs[i])
          {
            if(self.location_p_ts[i] < first_false) first_false = self.location_p_ts[i];
            self.c = false;
          }
          else
            if(self.location_p_ts[i] > last_true) last_true = self.location_p_ts[i];
        }
      }
      if(self.c) self.c_aware_t = last_true;
      else       self.c_aware_t = first_false;
    }

    self.hovering = false;
    self.hover = function(evt)
    {
      self.hovering = true;
      hov_quak = self;
    }
    self.unhover = function(evt)
    {
      self.hovering = false;
      if(hov_quak == self)
      {
        hov_quak = undefined;
        hov_quak_i = -1;
      }
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
      hov_loc = self;
      hov_loc_i = self.i;
    }
    self.unhover = function(evt)
    {
      self.hovering = false;
      if(hov_loc == self)
      {
        hov_loc = undefined;
        hov_loc_i = -1;
      }
    }

    self.move_locs = false;
    self.drag_rad = true;

    self.offX = 0;
    self.offY = 0;
    self.rad = 0;
    self.mx = self.wx;
    self.my = self.wy;
    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(self.move_locs)
      {
        self.offX = evt.doX-self.x;
        self.offY = evt.doY-self.y;
      }
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      self.dragging = true;
      hov_loc = self;
      hov_loc_i = self.i;
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
      if(self.drag_rad && levels[cur_level].allow_radii)
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
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      hov_loc = undefined;
      hov_loc_i = -1;
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

    self.play_button  = new ButtonBox(self.h*0,self.y,self.h,self.h,function(){ ui_lock = self; if(self.earth.t == self.earth.recordable_t) self.earth.t = 0; state = STATE_PLAY;});
    self.pause_button = new ButtonBox(self.h*1,self.y,self.h,self.h,function(){ ui_lock = self; state = STATE_PAUSE;});
    clicker.register(self.play_button);
    clicker.register(self.pause_button);
    self.scrub_bar = new Box(self.h*2+5,self.y,self.w-(self.h*2+5),self.h);
    hoverer.register(self.scrub_bar);
    dragger.register(self.scrub_bar);

    self.scrub_bar.hovering = false;
    self.scrub_bar.hovering_x;
    self.scrub_bar.hovering_t;
    self.scrub_bar.hover = function(evt)
    {
      self.scrub_bar.hovering = true;
      self.scrub_bar.hovering_x = evt.doX;
      self.scrub_bar.hovering_t = Math.round(((evt.doX-self.scrub_bar.x)/self.scrub_bar.w)*self.earth.recordable_t);
      if(self.scrub_bar.hovering_t < 0) self.scrub_bar.hovering_t = 0;
      if(self.scrub_bar.hovering_t > self.earth.recordable_t) self.scrub_bar.hovering_t = self.earth.recordable_t;
    }
    self.scrub_bar.unhover = function()
    {
      self.scrub_bar.hovering = false;
    }

    self.scrub_bar.dragging = false;
    var saved_state = STATE_PLAY;
    self.scrub_bar.dragStart = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      self.scrub_bar.dragging = true;
      saved_state = state;
      state = STATE_PAUSE;
      self.scrub_bar.drag(evt);
    }
    self.scrub_bar.drag = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!self.scrub_bar.dragging) return;
      self.earth.t = Math.round(((evt.doX-self.scrub_bar.x)/self.scrub_bar.w)*self.earth.recordable_t);
      if(self.earth.t < 0) self.earth.t = 0;
      if(self.earth.t > self.earth.recordable_t) self.earth.t = self.earth.recordable_t;
    }
    self.scrub_bar.dragFinish = function(evt)
    {
      self.scrub_bar.dragging = false;
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      state = saved_state;
    }

    self.scrub_bar.xForT = function(t)
    {
      return self.scrub_bar.x+Math.round((t/self.earth.recordable_t)*self.scrub_bar.w);
    }
    self.drawBlip = function(t,ghost,correct)
    {
      var x = self.scrub_bar.xForT(t);
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
      var x = self.scrub_bar.xForT(t);
      dc.context.fillText(Math.round(t),x,self.y-1);
    }
    self.shapeBlip = function(t,shape)
    {
      var x = self.scrub_bar.xForT(t);
      dc.context.drawImage(shape,x-shape.width/2,self.y-5-shape.height);
    }
    self.drawQuakeBlips = function(q,ghost)
    {
      for(var i = 0; i < self.earth.locations.length; i++)
      {
        var draw_s =                               (ghost || self.earth.t > q.location_s_ts[i]);
        var draw_p = (levels[cur_level].p_waves && (ghost || self.earth.t > q.location_p_ts[i]));
        if(i == hov_loc_i)
        {
          dc.context.globalAlpha=1;
          dc.context.fillStyle = "#000000";
          if(draw_s) self.labelBlip(q.location_s_ts[i]);
          if(draw_p) self.labelBlip(q.location_p_ts[i]);
        }
        else if(q == hov_quak)
        {
          dc.context.globalAlpha = 1;
          if(draw_s) self.shapeBlip(q.location_s_ts[i],self.earth.locations[i].shape);
          if(draw_p) self.shapeBlip(q.location_p_ts[i],self.earth.locations[i].shape);
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
      if(levels[cur_level].display_quake_start_range)
      {
        dc.context.fillStyle = "#88AAAA";
        dc.context.fillRect(self.scrub_bar.x,self.y,self.scrub_bar.w*(levels[cur_level].quake_start_range/self.earth.recordable_t),self.h);
      }
      dc.context.fillStyle = "#FFFFFF";
      self.drawBlip(self.earth.t,1);
      dc.context.fillStyle = "#000000";
      self.labelBlip(self.earth.t);

      if(self.scrub_bar.hovering && !self.scrub_bar.dragging)
      {
        dc.context.fillStyle = "#888888";
        self.drawBlip(self.scrub_bar.hovering_t,1);
        dc.context.fillStyle = "#000000";
        self.labelBlip(self.scrub_bar.hovering_t);
      }

      self.drawQuakeBlips(self.earth.ghost_quake,true);
      for(var i = 0; i < self.earth.quakes.length; i++)
        if(self.earth.quakes[i].selected || self.earth.quakes[i] == hov_quak) self.drawQuakeBlips(self.earth.quakes[i],false)
      dc.context.globalAlpha=1;

      //ui
      dc.context.fillStyle = "#000000";
      //play_button
      dc.context.beginPath();
      dc.context.moveTo(self.play_button.x+2,self.play_button.y+2);
      dc.context.lineTo(self.play_button.x+self.play_button.w-2,self.play_button.y+self.play_button.h/2);
      dc.context.lineTo(self.play_button.x+2,self.play_button.y+self.play_button.h-2);
      dc.context.fill();
      //pause_button
      dc.context.fillRect(self.pause_button.x+2,self.pause_button.y+2,6,self.pause_button.h-4);
      dc.context.fillRect(self.pause_button.x+self.pause_button.w-6-2,self.pause_button.y+2,6,self.pause_button.h-4);
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

