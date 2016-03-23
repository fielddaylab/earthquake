var GamePlayScene = function(game, stage)
{
  var ENUM;

  ENUM = 0;
  var STATE_PLAY  = ENUM; ENUM++;
  var STATE_PAUSE = ENUM; ENUM++;
  var play_state;
  var play_speed;


  ENUM = 0;
  var IGNORE_INPUT = ENUM; ENUM++;
  var RESUME_INPUT = ENUM; ENUM++;
  var input_state;

  ENUM = 0;
  var SPC_NONE = ENUM; ENUM++;
  var SPC_CLICK_TO_GUESS = ENUM; ENUM++;
  var SPC_WAIT_RESULT = ENUM; ENUM++;
  var SPC_RESULT_WRONG_TRY_CORRECT = ENUM; ENUM++;
  var SPC_RESULT_CORRECT_TRY_2 = ENUM; ENUM++;
  var SPC_RESULT_CORRECT_TRY_5 = ENUM; ENUM++;
  var SPC_XXX = ENUM; ENUM++;
  var spc_state;

  var self = this;
  var dc = stage.drawCanv;

  var location_size = 0.1;
  var quake_size = 0.03;
  var quake_s_rate = 0.0005;
  var quake_p_rate = 0.001;
  var s_color = "#0088CC";
  var p_color = "#8800CC";
  var debug_levels = false;
  var record = false;

  var n_ticks = 0;

  var hoverer;
  var dragger;
  var clicker;

  var drag_qs;
  var canvdom_clicker;
  var ui_lock;

  var listener;
  var fake_mouse;

  var levels;
  var cur_level;

  var earth;
  var hov_loc;
  var hov_loc_i;
  var hov_quak;
  var hov_quak_i;

  var next_button;
  var record_button;

  var scrubber;
  var speed_1x_button;
  var speed_2x_button;
  var speed_4x_button;
  var speed_8x_button;
  var reset_button;
  var del_all_quakes_button;
  var del_sel_quakes_button;
  var desel_quakes_button;

  var dom;
  var canvdom;
  var bmwrangler;

  self.ready = function()
  {
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});
    canvdom_clicker = new Clicker({source:stage.dispCanv.canvas});
    ui_lock = undefined;

    listener = new Listener(dc);
    hoverer.register(listener); listener.hoverer = hoverer;
    dragger.register(listener); listener.dragger = dragger;
    clicker.register(listener); listener.clicker = clicker;

    var Mouse = function()
    {
      var self = this;
      self.x = 0;
      self.y = 0;
      self.w = dc.width;
      self.h = dc.height;

      self.sx = 0;
      self.sy = 0;

      self.hover = function(evt)
      {
        self.sx = evt.doX;
        self.sy = evt.doY;
      }
      self.unhover = function(evt)
      {
      }
      self.draw = function()
      {
        dc.context.fillRect(self.sx-2,self.sy-2,4,4);
      }
    }
    fake_mouse = new Mouse();
    hoverer.register(fake_mouse);

    play_state = STATE_PAUSE;
    play_speed = 1;

    var l;
    levels = [];

    //0
    l = new Level();
    l.reset = true;
    l.location_success_range = 0;
    l.n_locations = 0;
    l.display_quake_start_range = false;
    l.p_waves = false;
    l.quake_selection_r = 0;
    l.deselect_on_create = false;
    l.draw_mouse_quake = false;
    l.click_resets_t = false;
    l.variable_quake_t = false;
    l.allow_radii = false;
    l.lines = [];
    levels.push(l);

    if(debug_levels)
    {
      //-1
      l = new Level();
      l.reset = true;
      l.location_success_range = 50;
      l.n_locations = 3;
      l.quake_start_range = 0;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_on_create = true;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.lines = ["test this!"];
      levels.push(l);
    }
    else
    {
      //intro - guess loc
      l = new Level();
      l.reset = true;
      l.location_success_range = 50;
      l.n_locations = 1;
      l.loc_1_x = 0.5;
      l.loc_1_y = 0.5;
      l.quake_start_range = 0;
      l.quake_x = 0.25;
      l.quake_y = 0.25;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 50;
      l.deselect_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.lines = [
        "An earthquake has been reported by Square City!",
        "All we know is that the earthquake started at midnight (<b>0:00</b>), and Square City reported feeling its tremors at <b>11:47</b>.",
        "So we know <b>when</b> it <b>originated</b>, and <b>when</b> it was <b>experienced at a specific location</b>.",
        "We also know at what speed earthquakes travel across the surface of the earth.",
        "We've put all of this informaiton into an earthquake simulator. See if you can use this info to make a guess <b>where</b> you think the earthquake might have originated.",
      ];
      l.postPromptEvt = function() { spc_state = SPC_CLICK_TO_GUESS; }
      levels.push(l);

      //was incorrect - find correct
      l = new Level();
      l.reset = false;
      l.location_success_range = 50;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 50;
      l.deselect_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.lines = [
        "It looks like we can rule out that guess as a <b>plausable origin</b> for the quake. Had the quake originated there, square city would have reported feeling its tremors at a different time.",
        "Keep guessing to find some plausable originating locations, using only the information of <b>when</b> the quake originated, and <b>when it was experienced</b>.",
        "(Don't be afraid to make guesses all over the map!)",
      ];
      levels.push(l);

      //was correct - find 2
      l = new Level();
      l.reset = false;
      l.location_success_range = 50;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 50;
      l.deselect_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.lines = [
        "Wow! Good guess! Your guessed location is a <b>plausable origin</b> of the quake! Had the quake originated there, square city would have reported feeling its tremors just around the time it actually did!",
        "Try to find some other plausable originating locations, using only the information of <b>when</b> the quake originated, and <b>when it was experienced</b>.",
        "(Don't be afraid to make guesses all over the map!)",
      ];
      levels.push(l);

      //found 2 corrects - find 5
      l = new Level();
      l.reset = false;
      l.location_success_range = 50;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 50;
      l.deselect_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.lines = [
        "So you've found a couple <b>plausibly correct</b> origins- that is, we've made some guesses that <b>don't conflict with what we know</b>.",
        "Make a few more guesses, and try to look for a pattern. What does the space look like where the quake might have originated?",
      ];
      levels.push(l);

      //found 5 corrects
      l = new Level();
      l.reset = false;
      l.location_success_range = 50;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 50;
      l.deselect_on_create = true;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.lines = [
        "Do you see the pattern starting to emerge? There are clearly areas we can rule out for the origin of the quake, and areas we cannot.",
        "Keep guessing until the pattern is obvious.",
      ];
      levels.push(l);

      //
      l = new Level();
      l.reset = true;
      l.location_success_range = 50;
      l.n_locations = 2;
      l.loc_1_x = 0.5;
      l.loc_1_y = 0.5;
      l.loc_2_x = 0.7;
      l.loc_2_y = 0.3;
      l.quake_start_range = 0;
      l.quake_x = 0.25;
      l.quake_y = 0.25;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_on_create = true;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.lines = ["A location has reported a quake. What can we know about where this quake occurred?"];
      levels.push(l);

      //
      l = new Level();
      l.reset = true;
      l.location_success_range = 50;
      l.n_locations = 3;
      l.loc_1_x = 0.5;
      l.loc_1_y = 0.5;
      l.loc_2_x = 0.7;
      l.loc_2_y = 0.3;
      l.loc_3_x = 0.4;
      l.loc_3_y = 0.9;
      l.quake_start_range = 0;
      l.quake_x = 0.25;
      l.quake_y = 0.25;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_on_create = true;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.lines = ["A location has reported a quake. What can we know about where this quake occurred?"];
      levels.push(l);

    }

    cur_level = 0;

    earth = new Earth();
    earth.reset();

    if(record)
    {
      record_button = new ButtonBox(40,10,20,20,function(){ if(spc_state != SPC_NONE) return; ui_lock = self; if(listener.playing) listener.stop(); else if(listener.recording) listener.play(); else listener.record(); });
      clicker.register(record_button);
    }
    next_button = new ButtonBox(10,10,20,20,function(){ if(spc_state != SPC_NONE) return; ui_lock = self; self.nextLevel(); });
    clicker.register(next_button);
    scrubber = new Scrubber(earth);
    hoverer.register(scrubber);

    speed_1x_button = new ToggleBox(dc.width-120,dc.height-60,20,20,true, function(on) { ui_lock = self; if(on) play_speed = 1; else if(play_speed == 1) speed_1x_button.on = true; speed_2x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_2x_button = new ToggleBox(dc.width-90, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 2; else if(play_speed == 2) speed_2x_button.on = true; speed_1x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_4x_button = new ToggleBox(dc.width-60, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 4; else if(play_speed == 4) speed_4x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_8x_button.on = false; });
    speed_8x_button = new ToggleBox(dc.width-30, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 8; else if(play_speed == 8) speed_8x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_4x_button.on = false; });

    reset_button = new ButtonBox(dc.width-30,10,20,20,function(){ if(spc_state == SPC_WAIT_RESULT) return; ui_lock = self; earth.reset(); play_state = STATE_PAUSE;});
    del_all_quakes_button = new ButtonBox(dc.width-60,10,20,20,function(){ if(spc_state == SPC_WAIT_RESULT) return; ui_lock = self; earth.deleteQuakes(); play_state = STATE_PAUSE;});
    del_sel_quakes_button = new ButtonBox(dc.width-90,10,20,20,function(){ if(spc_state == SPC_WAIT_RESULT) return; ui_lock = self; earth.deleteSelectedQuakes(); play_state = STATE_PAUSE;});
    desel_quakes_button = new ButtonBox(dc.width-120,10,20,20,function(){ if(spc_state == SPC_WAIT_RESULT) return; ui_lock = self; earth.deselectQuakes();});

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

    dom = new Dom();
    canvdom = new CanvDom();
    bmwrangler = new BottomMessageWrangler();
    //setTimeout(function(){ input_state = IGNORE_INPUT; dom.popDismissableMessageOnEl('hi',100,100,100,100,document.getElementById('stage_container'),dismissed); },100);
    //setTimeout(function(){ input_state = IGNORE_INPUT; canvdom.popDismissableMessage('hi',100,100,100,100,dismissed); },100);
    //setTimeout(function(){ input_state = IGNORE_INPUT; bmwrangler.popMessage(['hi','there','what','you'],dismissed); },100);

    canvdom_clicker.register(canvdom);

    input_state = RESUME_INPUT;
    spc_state = SPC_NONE;

    self.nextLevel();
  };

  var dismissed = function()
  {
    input_state = RESUME_INPUT;
    levels[cur_level].postPromptEvt();
  }

  self.nextLevel = function()
  {
    cur_level = (cur_level+1)%levels.length;
    input_state = IGNORE_INPUT;
    bmwrangler.popMessage(levels[cur_level].lines,dismissed);
    if(levels[cur_level].reset)
      earth.reset();
  }

  self.manuallyFlushQueues = function()
  {
    if(ui_lock) return;
    //dragger first

    //listener takes -1 priority
    for(var i = 0; i < drag_qs.callbackQueue.length; i++)
    {
      if(
        drag_qs.callbackQueue[i] == listener.dragStart ||
        drag_qs.callbackQueue[i] == listener.drag ||
        drag_qs.callbackQueue[i] == listener.dragFinish
      )
      {
        drag_qs.callbackQueue[i](drag_qs.evtQueue[i]);
        drag_qs.callbackQueue.splice(i,1);
        drag_qs.evtQueue.splice(i,1);
        i--;
      }
    }

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

  }
  self.tick = function()
  {
    n_ticks++;

    canvdom_clicker.flush();
    if(input_state == IGNORE_INPUT)
    {
      hoverer.ignore();
      clicker.ignore();
      dragger.ignore();
    }
    else
    {
      listener.flush();

      hoverer.flush();
      clicker.flush();

      //dragger.flush();

      drag_qs = dragger.requestManualFlush();

      self.manuallyFlushQueues();

      dragger.manualFlush();
    }

    ui_lock = undefined;

    if(play_state == STATE_PLAY)
    {
      if(earth.t < earth.recordable_t) earth.t += play_speed;
      if(earth.t > earth.recordable_t) earth.t = earth.recordable_t;
    }

    switch(spc_state)
    {
      case SPC_NONE: break;
      case SPC_CLICK_TO_GUESS: break;
      case SPC_WAIT_RESULT:
        if(!earth.quakes.length) spc_state = SPC_CLICK_TO_GUESS;
        else
        {
          if(earth.t > earth.quakes[0].location_s_ts[0])
          {
            if(!earth.quakes[0].location_s_cs[0])
            {
              spc_state = SPC_RESULT_WRONG_TRY_CORRECT;
              levels[cur_level].complete = true;
              play_state = STATE_PAUSE;
              self.nextLevel();
            }
            else
            {
              spc_state = SPC_RESULT_CORRECT_TRY_2;
              levels[cur_level].complete = true;
              cur_level++; //skip a level
              play_state = STATE_PAUSE;
              self.nextLevel();
            }
          }
        }
        break;
      case SPC_RESULT_WRONG_TRY_CORRECT:
      case SPC_RESULT_CORRECT_TRY_2:
      case SPC_RESULT_CORRECT_TRY_5:
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(earth.t > q.location_s_ts[0] && q.location_s_cs[0]) n_correct++;
        }
        if(spc_state == SPC_RESULT_WRONG_TRY_CORRECT && n_correct >= 1)
        {
          spc_state = SPC_RESULT_CORRECT_TRY_2;
          levels[cur_level].complete = true;
          play_state = STATE_PAUSE;
          self.nextLevel();
        }
        if(spc_state == SPC_RESULT_CORRECT_TRY_2 && n_correct >= 2)
        {
          spc_state = SPC_RESULT_CORRECT_TRY_5;
          levels[cur_level].complete = true;
          play_state = STATE_PAUSE;
          self.nextLevel();
        }
        else if(spc_state == SPC_RESULT_CORRECT_TRY_5 && n_correct >= 5)
        {
          spc_state = SPC_NONE;
          levels[cur_level].complete = true;
          play_state = STATE_PAUSE;
          self.nextLevel();
        }
        break;
    }

    bmwrangler.tick();
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.context.fillRect(0,0,dc.width,dc.height);

    earth.draw();

    if(record) record_button.draw(dc);
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

    if(input_state != IGNORE_INPUT) fake_mouse.draw();
    dc.context.fillStyle = "#000000";
    switch(spc_state)
    {
      case SPC_NONE:break;
      case SPC_CLICK_TO_GUESS:
        dc.context.fillText("Click to Guess",100,100);
        break;
      case SPC_WAIT_RESULT:
        dc.context.fillText("Wait for it...",100,100);
        break;
      case SPC_RESULT_WRONG_TRY_CORRECT:
        dc.context.fillText("Try to find a plausable quake location",100,100);
        break;
      case SPC_RESULT_CORRECT_TRY_2:
        dc.context.fillText("Try to find another plausable quake origin",100,100);
        break;
      case SPC_RESULT_CORRECT_TRY_5:
        dc.context.fillText("Keep finding plausible origins until a pattern emerges",100,100);
        break;
    }
    canvdom.draw(dc);
  };

  self.cleanup = function()
  {
  };

  var Level = function()
  {
    var self = this;
    self.reset = true;
    self.complete = false;
    self.location_success_range = 10;
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
    self.quake_selection_r = 0;
    self.deselect_on_create = true;
    self.draw_mouse_quake = false;
    self.click_resets_t = true;
    self.variable_quake_t = false;
    self.allow_radii = true;
    self.lines = ["what's up?"];
    self.postPromptEvt = function(){};
  }

  var Earth = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = dc.width;
    self.h = dc.height;

    self.t = 0;
    self.assumed_start_t = 0;
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
      self.assumed_start_t = 0;

      self.clearLocations();
      self.genLocations();
      self.deleteQuakes();
      self.popGhost();
      play_state = STATE_PAUSE;
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
      if(spc_state == SPC_WAIT_RESULT) return;
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(spc_state == SPC_WAIT_RESULT) return;
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
      if(spc_state == SPC_CLICK_TO_GUESS)
      {
        self.dragFinish();
        spc_state = SPC_WAIT_RESULT;
      }
    }
    self.dragFinish = function()
    {
      if(spc_state == SPC_WAIT_RESULT) return;
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
          //var within = ptWithinObj(self.dragging_x, self.dragging_y, self.quakes[i]);
          var obj = self.quakes[i];
          var r = levels[cur_level].quake_selection_r;
          var within = ptWithin(self.dragging_x, self.dragging_y, obj.x-r/2, obj.y-r/2, obj.w+r, obj.h+r); //expanded
          if(within)
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
          play_state = STATE_PLAY;
        }

        var q;
        q = new Quake(self.dragging_wx,self.dragging_wy,self.assumed_start_t,self.ghost_quake);
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
        dc.context.strokeStyle = "#888888";
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

        if(levels[cur_level].allow_radii)
        {
          var x = l.wx-l.mx;
          var y = l.wy-l.my;
          var d = Math.sqrt(x*x+y*y);

          dc.context.lineWidth = dc.width*(quake_p_rate*levels[cur_level].location_success_range);
          dc.context.beginPath();
          dc.context.ellipse(l.cx,l.cy,l.rad*dc.width,l.rad*dc.height,0,0,2*Math.PI); //circles around locs
          dc.context.stroke();

          dc.context.lineWidth = 2;
          dc.context.beginPath();
          dc.context.ellipse(l.cx,l.cy,l.rad*dc.width,l.rad*dc.height,0,0,2*Math.PI); //circles around locs
          dc.context.stroke();
          if(l.dragging || l.hovering)
          {
            dc.context.beginPath();
            dc.context.moveTo(l.cx,l.cy); dc.context.lineTo(l.mx*dc.width,l.my*dc.height); //line
            dc.context.stroke();

            if(l.rad != 0)
            {
              var tmp_alpha = dc.context.globalAlpha;
              dc.context.globalAlpha=1;
              dc.context.fillStyle = s_color;
              dc.context.fillText("("+timeForT(Math.round(l.rad/quake_s_rate))+")",(l.mx+x/2)*dc.width,(l.my+y/2)*dc.height-10);
              if(levels[cur_level].p_waves)
              {
                dc.context.fillStyle = p_color;
                dc.context.fillText("("+timeForT(Math.round(l.rad/quake_p_rate))+")",(l.mx+x/2)*dc.width,(l.my+y/2)*dc.height-20);
              }
              dc.context.globalAlpha=tmp_alpha;
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
    self.location_s_hrts = [];
    self.location_p_hrts = [];
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
        self.location_s_hrts[i] = timeForT(Math.round(self.t+(d/quake_s_rate)));
        self.location_p_hrts[i] = timeForT(Math.round(self.t+(d/quake_p_rate)));
        self.location_s_cs[i] = (ghost != undefined && Math.abs(self.location_s_ts[i]-ghost.location_s_ts[i]) < levels[cur_level].location_success_range);
        self.location_p_cs[i] = (ghost != undefined && Math.abs(self.location_p_ts[i]-ghost.location_p_ts[i]) < levels[cur_level].location_success_range);

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
      if(levels[cur_level].allow_radii)
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

    self.play_button  = new ButtonBox(self.h*0,self.y,self.h,self.h,function(){ if(spc_state == SPC_WAIT_RESULT || spc_state == SPC_CLICK_TO_GUESS) return; ui_lock = self; if(self.earth.t == self.earth.recordable_t) self.earth.t = 0; play_state = STATE_PLAY;});
    self.pause_button = new ButtonBox(self.h*1,self.y,self.h,self.h,function(){ if(spc_state == SPC_WAIT_RESULT || spc_state == SPC_CLICK_TO_GUESS) return; ui_lock = self; play_state = STATE_PAUSE;});
    clicker.register(self.play_button);
    clicker.register(self.pause_button);
    self.scrub_bar = new Box(self.h*2+5,self.y,self.w-(self.h*2+5),self.h);
    hoverer.register(self.scrub_bar);
    dragger.register(self.scrub_bar);

    //just for other UI's information
    self.hovering = false;
    self.hover = function()
    {
      self.hovering = true;
    }
    self.unhover = function()
    {
      self.hovering = false;
    }

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
    self.scrub_bar.dragging_quake_start = false;
    var saved_state = STATE_PAUSE;
    self.scrub_bar.dragStart = function(evt)
    {
      if(spc_state == SPC_WAIT_RESULT || spc_state == SPC_CLICK_TO_GUESS) return;
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      self.scrub_bar.dragging = true;
      var t = Math.round(((evt.doX-self.scrub_bar.x)/self.scrub_bar.w)*self.earth.recordable_t);
      if(levels[cur_level].variable_quake_t && Math.abs(t-self.earth.assumed_start_t) < 20)
        self.scrub_bar.dragging_quake_start = true;
      saved_state = play_state;
      play_state = STATE_PAUSE;
      self.scrub_bar.drag(evt);
    }
    self.scrub_bar.drag = function(evt)
    {
      if(spc_state == SPC_WAIT_RESULT || spc_state == SPC_CLICK_TO_GUESS) return;
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!self.scrub_bar.dragging) return;
      self.earth.t = Math.round(((evt.doX-self.scrub_bar.x)/self.scrub_bar.w)*self.earth.recordable_t);
      if(self.earth.t < 0) self.earth.t = 0;
      if(self.earth.t > self.earth.recordable_t) self.earth.t = self.earth.recordable_t;
      if(self.scrub_bar.dragging_quake_start)
      {
        self.earth.assumed_start_t = self.earth.t;
      }
    }
    self.scrub_bar.dragFinish = function(evt)
    {
      self.scrub_bar.dragging = false;
      self.scrub_bar.dragging_quake_start = false;
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(spc_state == SPC_WAIT_RESULT || spc_state == SPC_CLICK_TO_GUESS) return;
      play_state = saved_state;
    }

    self.scrub_bar.xForT = function(t)
    {
      return self.scrub_bar.x+Math.round((t/self.earth.recordable_t)*self.scrub_bar.w);
    }
    self.drawBlip = function(t,range,split,icon)
    {
      var x = self.scrub_bar.xForT(t);
      var w = self.scrub_bar.w*((2*range)/self.earth.recordable_t);
      if(range == 0) w = 1;

      if(split)
      {
        dc.context.fillRect(x-w/2,self.y,           w,self.h*0.2);
        dc.context.fillRect(x-w/2,self.y+self.h*0.8,w,self.h*0.2);
      }
      else dc.context.fillRect(x-w/2,self.y,w,self.h);

      if(icon) dc.context.drawImage(icon,x-icon.width/2,self.y+self.h/2-icon.height/2);
    }
    self.labelBlip = function(t,hrt)
    {
      var x = self.scrub_bar.xForT(t);
      dc.context.fillText(hrt,x,self.y-1);
    }
    self.shapeBlip = function(t,shape)
    {
      var x = self.scrub_bar.xForT(t);
      dc.context.drawImage(shape,x-shape.width/2,self.y-5-shape.height);
    }
    self.drawAssumedStartBlip = function()
    {
      dc.context.textAlign = "left";
      var x = self.scrub_bar.xForT(self.earth.assumed_start_t);
      dc.context.fillStyle = "#2277FF";
      dc.context.fillRect(x-0.5,self.y,1,self.h);
      dc.context.fillRect(x-0.5,self.y-15,60,15);
      dc.context.fillStyle = "#FFFFFF";
      dc.context.fillText("Quake Start",x+2,self.y-3);
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
          if(draw_s) self.labelBlip(q.location_s_ts[i],q.location_s_hrts[i]);
          if(draw_p) self.labelBlip(q.location_s_ts[i],q.location_p_hrts[i]);
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

        var range = ghost ? levels[cur_level].location_success_range : 0;
        var split = ghost;
        if(draw_s)
        {
          dc.context.fillStyle = s_color;
          var icon = q.location_s_cs[i] ? cmark : xmark;
          self.drawBlip(q.location_s_ts[i],range,split,ghost ? 0 : icon);
        }
        if(draw_p)
        {
          dc.context.fillStyle = p_color;
          var icon = q.location_p_cs[i] ? cmark : xmark;
          self.drawBlip(q.location_p_ts[i],range,split,ghost ? 0 : icon);
        }
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

      self.drawAssumedStartBlip();
      dc.context.textAlign = "center";

      self.drawBlip(self.earth.t,0,0,0);
      dc.context.fillStyle = "#000000";
      self.labelBlip(self.earth.t,timeForT(self.earth.t));

      if(self.scrub_bar.hovering && !self.scrub_bar.dragging)
      {
        dc.context.fillStyle = "#888888";
        self.drawBlip(self.scrub_bar.hovering_t,0,0,0);
        dc.context.fillStyle = "#000000";
        self.labelBlip(self.scrub_bar.hovering_t,timeForT(self.scrub_bar.hovering_t));
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

  var timeForT = function(t)
  {
    var hrs = (Math.floor(t/60)%24);
    var mins = t%60;
    if(mins < 10) mins = "0"+mins;
    return hrs+":"+mins;
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
xmark.context.fillStyle = "#CC2222";
xmark.context.fillText("✖",xmark.width/2,xmark.height-2);

var cmark = GenIcon();
cmark.context.fillStyle = "#22CC22";
cmark.context.fillText("✔",cmark.width/2,cmark.height-2);

