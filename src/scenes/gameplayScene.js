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

  var self = this;
  var dc = stage.drawCanv;

  var location_size = 0.1;
  var quake_size = 0.03;
  var quake_s_rate = 0.001;
  var quake_p_rate = 0.002;
  var s_color = "#0088CC";
  var p_color = "#8800CC";
  var debug_levels = false;
  var record = false;

  var n_ticks = 0;

  var hoverer;
  var dragger;
  var clicker;

  var cam;

  var drag_qs;
  var canvdom_clicker;
  var ui_lock;

  var listener;
  var fake_mouse;

  var levels;
  var cur_level;
  var start_level = 0;

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

  var lt; //level title object. just to correctly namespace them.

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

    var denom;
    if(dc.width > dc.height) denom = dc.height;
    else denom = dc.width;
    cam = {
      wx:0,
      wy:0,
      ww:dc.width/denom,
      wh:dc.height/denom,
    };

    play_state = STATE_PAUSE;
    play_speed = 1;

    lt = {};
    var l;
    levels = [];

    l = new Level();
    l.reset = true;
    l.location_success_range = 0;
    l.n_locations = 0;
    l.quake_start_range_s = 0;
    l.quake_start_range_e = 0;
    l.display_quake_start_range = false;
    l.p_waves = false;
    l.quake_selection_r = 0;
    l.deselect_all_on_create = false;
    l.deselect_known_wrongs_on_create = false;
    l.draw_mouse_quake = false;
    l.click_resets_t = false;
    l.variable_quake_t = false;
    l.allow_radii = false;
    l.imask.play_pause = false;
    l.imask.scrubber = false;
    l.imask.earth = false;
    l.imask.earthdrag = false;
    l.imask.select = false;
    l.imask.skip = false;
    l.lines = [];
    l.advanceTest = function(){return true;}
    lt.LVL_NULL = levels.length;
    levels.push(l);

    if(debug_levels)
    {
      l = new Level();
      l.reset = true;
      l.location_success_range = 50;
      l.n_locations = 3;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.lines = ["test this!"];
      lt.LVL_DEBUG = levels.length;
      levels.push(l);
    }
    else
    {

      l = new Level();
      l.reset = true;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 100;
      l.quake_start_range_e = 100;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = true;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.scrubber = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.skip = false;
      l.lines = [
        "What can we know about earthquakes? And how can we know it?",
        "Imagine that the little black square is actually <b>Square City</b> and an earthquake it about to make it rumble!",
      ];
      l.prePromptEvt = function() { earth.assumed_start_t = levels[cur_level].quake_start_range_s; }
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_ANIM_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_ANIM_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.skip = true;
      l.lines = [
        "Did you see how a wave moved out from the earthquake's <b>origin</b> and expanded until it hit the city?",
        "From that animation we know <b>where</b> the earthquake came from.",  
        "We also can see <b>when</b> it started,",
        "As it moves out, we see a delay, then we can see <b>when</b> it was <b>experienced</b> by square city.,",
        "But with real earthquakes, we have to <b>construct</b> all of that information from a <b>limited amount of data</b>.",
        "Often, all we have is the reports from cities that they <b>felt</b> the earthquake at a certian <b>time</b>.",
        "Play around if you like, then touch the <b>Done</b> button",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_ANIM_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = undefined;
      l.display_ghost_quake = false;
      l.display_quake_start_range = false;
      l.imask.play_pause = true;
      l.imask.scrubber = false;
      l.imask.skip = false;
      l.lines = [
        "The real information we have looks something more like this.",
      ];
      l.prePromptEvt = function() { earth.t = 0; play_state = STATE_PAUSE; }
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_EMPTY_ANIM = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_EMPTY_ANIM_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.skip = true;
      l.lines = [
        "They didn't even see it coming! All we see is <b>when</b> <b>Square City</b> feels the shake!",
        "When and where did the earthquake come from?",
        "How can we fill out all the missing <b>information</b>, from only <b>when a location felt a tremor</b>?",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return false; }
      lt.LVL_EMPTY_ANIM_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      l.reset = true;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 50;
      l.quake_start_range_e = 50;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = true;
      l.display_quake_start_range = true;
      l.p_waves = true;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.scrubber = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.skip = false;
      l.lines = [
        "Let's start with time.",
        "We can figure out <b>when the earthquake originated</b> from <b>when it was felt</b>.",
        "Sound like magic? Well, first have to learn something extra about earthquakes:",
        "Earthquakes actually to send <b>multiple</b> shockwaves <b>from their origin</b>.",
        "The two waves we care about are the <b>P-Wave</b> or Primary-wave and the <b>S-Wave</b> or Secondary-wave",
        "They <b>each travel at a different speed</b>. The <b>P-wave</b> is much faster than the <b>S-Wave</b>",
        "Let's see what that might look like.",
      ];
      l.prePromptEvt = function() { earth.t = 0; earth.assumed_start_t = levels[cur_level].quake_start_range_s; speed_1x_button.click({}); play_state = STATE_PAUSE; }
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_DISTANCE_FIND = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_DISTANCE_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.skip = true;
      l.lines = [
        "See how the <b>P-Wave</b> (purple) travels at <b>twice the speed</b> of the <b>S-Wave</b> (blue)?",
        "Look at <b>when</b> each wave was <b>reported</b> (shown on the timeline).",
        "How can we use this information to help determine <b>when</b> the earthquake <b>originated</b>?",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      l.reset = true;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 400;
      l.quake_start_range_e = 400;
      l.quake_x = 0.1;
      l.quake_y = 0;
      l.display_ghost_quake = true;
      l.display_quake_start_range = true;
      l.p_waves = true;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.scrubber = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.skip = false;
      l.lines = [
        "Let's compare that last example to what happens when an earthquake <b>originates</b> just <b>slightly before</b> a location <b>feels its tremors</b>.",
      ];
      l.prePromptEvt = function() { earth.t = 0; earth.assumed_start_t = levels[cur_level].quake_start_range_s; speed_1x_button.click({}); play_state = STATE_PAUSE; }
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_DISTANCE_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.skip = true;
      l.lines = [
        "Look where on the timeline the <b>tremors were reported</b>-",
        "They are <b>very close together</b>!",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = undefined;
      l.display_ghost_quake = false;
      l.display_quake_start_range = false;
      l.imask.scrubber = false;
      l.imask.skip = false;
      l.lines = [
        "Now we'll look at that without the distraction of the visible quake...",
        "Keep in mind, in reality, <b>this</b> is the only information we have to start with.",
        "See if you can visualize in your mind <b>how this information</b> (the reported times) means that <b>the earthquake originated near the time the city felt its tremors</b>.",
      ];
      l.prePromptEvt = function() { earth.t = 0; earth.assumed_start_t = levels[cur_level].quake_start_range_s; speed_1x_button.click({}); play_state = STATE_PAUSE; }
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_DISTANCE_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.skip = true;
      l.lines = [
        "Can you see why <b>a more recently originating earthquake</b> equates to <b>feeling the tremors close together</b>?",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      l.reset = true;
      l.location_success_range = 10;
      l.n_locations = 2;
      l.loc_1_x = -0.15;
      l.loc_1_y = 0;
      l.loc_2_x = 0.4;
      l.loc_2_y = 0;
      l.quake_start_range_s = 20;
      l.quake_start_range_e = 20;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = true;
      l.display_quake_start_range = true;
      l.p_waves = true;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.scrubber = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.skip = false;
      l.lines = [
        "We'll watch this <i>one more time</i>-",
        "But this time, we'll have <b>two</b> locations.",
        "One will feel the tremors <b>shortly after</b> the quake originates,",
        "And one will feel the tremors <b>long after</b> the quake has originated.",
        "Which will feel the <b>S-Wave</b> and the <b>P-Wave</b> close together?",
      ];
      l.prePromptEvt = function() { earth.t = 0; earth.assumed_start_t = levels[cur_level].quake_start_range_s; speed_1x_button.click({}); play_state = STATE_PAUSE; }
      l.postPromptEvt = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[1]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_DISTANCE_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.skip = true;
      l.lines = [
        "Do you see how the difference matters?",
        "Once we have this information (the <b>time</b> a location felt an earthquake's <b>P-Wave</b> and the <b>time</b> a location felt its <b>S-Wave</b>),",
        "and because we know the <b>relative speeds</b> of the two waves,",
        "we can can use this difference to find out <b>exactly when</b> the earthquake <b>originated</b>.",
        "All it takes is a bit of math!",
        "(Specifically:<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;<i>t_earthquake</i> = <div style=\"position:relative; left:100px;\"><div>(<i>speed_pwave</i>*<i>t_pwave_felt</i>)-(<i>speed_swave</i>*<i>t_swave_felt</i>)</div>/<div>(<i>speed_pwave</i>-<i>speed_swave</i>)</div></div><br /><b>-- But don't worry about that for now!</b>)",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_DISTANCE_PAUSE = levels.length;
      levels.push(l);


      l = new Level();
      l.reset = true;
      l.location_success_range = 60;
      l.n_locations = 1;
      l.loc_1_x = 0;
      l.loc_1_y = 0;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.quake_x = -0.25;
      l.quake_y = -0.25;
      l.display_ghost_quake = false;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 50;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.skip = false;
      l.imask.earthdrag = false;
      l.lines = [
        "Going forward, we'll now just assume we know <b>when</b> the quake originated, and will no longer show the <b>P-Waves</b>- Just for simplification.",
        "(After all, we now know exactly how to calculate it!)",
        "Anyways. Now, we need to figure out a way to calculate <b>where</b> the earthquake originated.",
        "Knowing <b>when</b> the earthquake started, and <b>when</b> it hit Square City,",
        "place a guess <b>where</b> you think the earthquake might have occurred!",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        return earth.quakes.length;
      }
      lt.LVL_GUESS_LOC = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.earth = false;
      l.lines = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.quakes[0].location_s_ts[0]+20)
        {
          if(!earth.quakes[0].location_s_cs[0])
          {
            play_state = STATE_PAUSE;
            return true;
          }
          else
          {
            cur_level++; //skip a level
            play_state = STATE_PAUSE;
            return true;
          }
        }
        return false;
      }
      lt.LVL_GUESS_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.earth = true;
      l.lines = [
        "It looks like the earthquake <b>could not have</b> originated at that location.",
        "If it had, Square City would have reported <b>experiencing its tremors</b> at a <b>different time</b>.",
        "Keep guessing until we find a location that <b>doesn't conflict</b> with any of the information we know.",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(earth.t > q.location_s_ts[0] && q.location_s_cs[0]) n_correct++;
        }
        if(n_correct >= 1)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_INCORRECT_GUESS_FIND_CORRECT = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.deselect_known_wrongs_on_create = true;
      l.lines = [
        "Wow! Good guess!",
        "The timing of that guessed origin location <b>does not conflict</b> with the information we know.",
        "While we <b>can't yet</b> difinitively say \"that's where the earthquake originated\", we <b>can't rule it out</b>-",
        "There may be other locations we could try that <b>also</b> wouldn't conflict with our known information.",
        "Try to find some other plausable originating locations.",
      ];
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(earth.t > q.location_s_ts[0] && q.location_s_cs[0]) n_correct++;
        }
        if(n_correct >= 2)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_CORRECT_GUESS_FIND_ANOTHER = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.lines = [
        "Great work!",
        "So you've found a couple locations that <b>cannot be ruled out</b> as origins- that is, we've made some guesses that <b>don't conflict with what we know</b>.",
        "Make a few more guesses, and try to look for a pattern. What does the space look like where the quake might have originated?",
        "(Don't be afraid to make guesses all over the map!)",
      ];
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(earth.t > q.location_s_ts[0] && q.location_s_cs[0]) n_correct++;
        }
        if(n_correct >= 5)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_FOUND_2_CORRECT_FIND_5 = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "I think I know the pattern";
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.imask.skip = true;
      l.lines = [
        "Do you see the pattern starting to emerge?",
        "Because <b>we know when the earthquake originated</b>, and <b>when Square City felt its tremors</b>,",
        "we can <b>rule out some locations as possible origins</b>, and <b>cannot rule out</b> others.",
        "Keep guessing until the pattern is obvious.",
      ];
      l.advanceTest = function() { return false; }
      lt.LVL_FOUND_5_CORRECT_KEEP_FINDING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = undefined;
      l.allow_radii = true;
      l.imask.skip = false;
      l.lines = [
        "So you think you see the pattern?",
        "Click and drag out from Square City to highlight the area that <b>cannot be ruled out</b> as a possible originating location of the earthquake",
      ];
      l.advanceTest = function()
      {
        return (!earth.locations[0].dragging && Math.abs(Math.round(earth.locations[0].rad/quake_s_rate)-earth.ghost_quake.location_s_ts[0]) < 20);
      }
      lt.LVL_DRAG_TO_PATTERN = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Ok. I'm ready to move on.";
      l.imask.skip = true;
      l.lines = [
        "The pattern is a ring!",
        "From only the information of <b>when</b> a quake originated, <b>when</b> a quake was felt (at a known location), and <b>how fast</b> a quake travels,",
        "we can <b>narrow down</b> possible <b>originating locations</b> to a <b>ring</b> around the <b>known location</b>.",
        "The <b>radius</b> of the ring is <b>proportional</b> to the <b>difference in time between when it originated, and when it was felt</b>.",
        "In other words, <b>the longer it takes to travel, the larger the circle.</b>",
        "From now on, you'll be able to <b>drag out these rings</b> from locations.",
      ];
      l.advanceTest = function() { return false; }
      lt.LVL_FOUND_PATTERN_PLAY = levels.length;
      levels.push(l);

      l = new Level();
      l.reset = true;
      l.location_success_range = 20;
      l.n_locations = 1;
      l.loc_1_x = 0.2;
      l.loc_1_y = -0.1;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.quake_x = -0.3;
      l.quake_y = 0;
      l.display_ghost_quake = false;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 20;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.lines = [
        "So, now that we have the ability to <b>drag a ring out from locations</b> to illuminate locations that <b>don't conflict with our known information</b>,",
        "we'll now reduce the <b>error range</b>.",
        "That is, now- for us to consider a location <b>plausibly correct</b>, it will have to be <b>very precise</b>.",
        "With this new tool, and new restriction, try to find 3 <b>plausible origin locations</b> that <b>don't conflict with our known information.",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(earth.t > q.location_s_ts[0] && q.location_s_cs[0]) n_correct++;
        }
        if(n_correct >= 2)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_FIND_TIGHT_RING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Ready to move on";
      l.lines = [
        "Cool. So we know how to pretty effectively narrow down a list of locations to a ring",
        "from only the information of <b>when</b> a quake originated, <b>when</b> a quake was felt (at a known location), and <b>how fast</b> a quake travels.",
        "But how could we narrow it down further? We want to find <b>exactly where the quake originated</b>-",
        "narrowing it down to a ring just isn't good enough.",
        "Unfortunately, that's the best we can do with <b>only that information</b>.",
        "But what if we had more information?",
        "What if there was <b>another location</b>, and we knew <b>when it felt the tremor</b> as well?",
      ];
      l.advanceTest = function() { return false; }
      lt.LVL_FOUND_TIGHT_RING_PLAY = levels.length;
      levels.push(l);

      l = new Level();
      l.reset = true;
      l.location_success_range = 20;
      l.n_locations = 2;
      l.loc_1_x = 0.2;
      l.loc_1_y = -0.1;
      l.loc_2_x = -0.2;
      l.loc_2_y = 0.4;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.quake_x = -0.3;
      l.quake_y = 0;
      l.display_ghost_quake = false;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.imask.next = false;
      l.lines = [
        "Well good news!",
        "Circle city just called in when <b>they felt the earthquake's tremors</b>.",
        "Using that information, see if you can narrow the possible locations that <b>don't conflict with any known information</b> down further!",
        "Find 2 plausible <b>origin locations</b>.",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(
            earth.t > q.location_s_ts[0] && q.location_s_cs[0] &&
            earth.t > q.location_s_ts[1] && q.location_s_cs[1]
            )
            n_correct++;
        }
        if(n_correct >= 2)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_2_LOCATIONS = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.allow_skip_prompt = "Ready to move on";
      l.imask.next = true;
      l.lines = [
        "Ok. So we've narrowed it down even more!",
        "With one location, we can <b>reduce the possible origin location</b> to a <b>ring</b>.",
        "With two locations, we get <b>two rings</b>.",
        "But the origin location <b>has to fall on both rings</b>.",
        "This leaves at most <b>two small areas</b> where the rings intersect as <b>the only possible origin locations</b>.",
        "That's a big reduction!",
        "But we still don't yet know <b>exactly</b> where the quake originated...",
        "Which of the <b>two possible areas</b> is it?",
        "We can answer this question by adding <b>one more location</b>...",
      ];
      l.advanceTest = function() { return false; }
      lt.LVL_2_LOCATIONS_PLAY = levels.length;
      levels.push(l);

      l = new Level();
      l.reset = true;
      l.allow_skip_prompt = undefined;
      l.location_success_range = 20;
      l.n_locations = 3;
      l.loc_1_x = 0.2;
      l.loc_1_y = -0.1;
      l.loc_2_x = -0.2;
      l.loc_2_y = 0.4;
      l.loc_3_x = -0.6;
      l.loc_3_y = -0.05;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.quake_x = -0.3;
      l.quake_y = 0;
      l.display_ghost_quake = false;
      l.display_quake_start_range = false;
      l.p_waves = false;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.imask.next = false;
      l.lines = [
        "So now we've got 3 locations.",
        "See if you can find <b>exactly</b> where this earthquake originated!",
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(
            earth.t > q.location_s_ts[0] && q.location_s_cs[0] &&
            earth.t > q.location_s_ts[1] && q.location_s_cs[1] &&
            earth.t > q.location_s_ts[2] && q.location_s_cs[2]
            )
            n_correct++;
        }
        if(n_correct >= 1)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_3_LOCATIONS = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.reset = false;
      l.lines = [
        "Ok! Now you know how to <b>triangulate</b> the origin location of an earthquake!",
      ];
      l.advanceTest = function() { return false; }
      levels.push(l);
    }

    cur_level = start_level;

    earth = new Earth();
    earth.reset();

    if(record)
    {
      record_button = new ButtonBox(40,10,20,20,function(){ ui_lock = self; if(listener.playing) listener.stop(); else if(listener.recording) listener.play(); else listener.record(); });
      clicker.register(record_button);
    }
    next_button = new ButtonBox(10,10,60,30,function(){ if(!levels[cur_level].imask.skip || !levels[cur_level].allow_skip_prompt) return; ui_lock = self; self.nextLevel(); });
    clicker.register(next_button);
    scrubber = new Scrubber(earth);
    hoverer.register(scrubber);

    //speed_1x_button = new ToggleBox(dc.width-120,dc.height-60,20,20,true, function(on) { ui_lock = self; if(on) play_speed = 1; else if(play_speed == 1) speed_1x_button.on = true; speed_2x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_1x_button = new ToggleBox(dc.width-60, dc.height-60,20,20,true, function(on) { ui_lock = self; if(on) play_speed = 1; else if(play_speed == 1) speed_1x_button.on = true; speed_2x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_2x_button = new ToggleBox(dc.width-90, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 2; else if(play_speed == 2) speed_2x_button.on = true; speed_1x_button.on = false; speed_4x_button.on = false; speed_8x_button.on = false; });
    speed_4x_button = new ToggleBox(dc.width-60, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 4; else if(play_speed == 4) speed_4x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_8x_button.on = false; });
    speed_8x_button = new ToggleBox(dc.width-30, dc.height-60,20,20,false,function(on) { ui_lock = self; if(on) play_speed = 8; else if(play_speed == 8) speed_8x_button.on = true; speed_1x_button.on = false; speed_2x_button.on = false; speed_4x_button.on = false; });

    reset_button          = new ButtonBox(dc.width-30, 10,20,20,function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.reset(); play_state = STATE_PAUSE;});
    del_all_quakes_button = new ButtonBox(dc.width-60, 10,20,20,function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.deleteQuakes(); play_state = STATE_PAUSE;});
    del_sel_quakes_button = new ButtonBox(dc.width-90, 10,20,20,function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.deleteSelectedQuakes(); play_state = STATE_PAUSE;});
    desel_quakes_button   = new ButtonBox(dc.width-120,10,20,20,function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.deselectQuakes();});

    clicker.register(speed_1x_button);
    //clicker.register(speed_2x_button);
    //clicker.register(speed_4x_button);
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
    if(levels[cur_level].reset)
      earth.reset();
    levels[cur_level].prePromptEvt();
    if(levels[cur_level].lines.length)
    {
      input_state = IGNORE_INPUT;
      bmwrangler.popMessage(levels[cur_level].lines,dismissed);
    }
    else
      levels[cur_level].postPromptEvt();
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

    bmwrangler.tick();

    if(levels[cur_level].advanceTest()) self.nextLevel();
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.context.fillRect(0,0,dc.width,dc.height);

    earth.draw();

    if(record) record_button.draw(dc);
    if(levels[cur_level].allow_skip_prompt)
    {
      next_button.draw(dc);
      dc.context.fillStyle = "#000000";
      dc.context.textAlign = "left";
      dc.context.fillText(levels[cur_level].allow_skip_prompt,next_button.x+5,next_button.y+15);
    }
    scrubber.draw();

    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";
    dc.context.textAlign = "center";
    //speed_buttons
    var b;

    b = speed_1x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("1x",b.x+b.w/2,b.y+b.h-2);
    /*
    b = speed_2x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("2x",b.x+b.w/2,b.y+b.h-2);
    b = speed_4x_button;
    b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("4x",b.x+b.w/2,b.y+b.h-2);
    */
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
    dc.context.textAlign = "left";
    switch(cur_level)
    {
      case lt.LVL_ANIM_INTRO:
        dc.context.fillText("Click the play button to watch quake",100,100);
        break;
      case lt.LVL_ANIM_PLAYING:
        if(play_speed == 1) dc.context.fillText("Watch the quake (click 8x speed to speed up)",100,100);
        else dc.context.fillText("Watch the quake",100,100);
        break;
      case lt.LVL_EMPTY_ANIM:
        dc.context.fillText("Click the play button",100,100);
        break;
      case lt.LVL_EMPTY_ANIM_PLAYING:
        if(play_speed == 1) dc.context.fillText("Watch the quake (click 8x speed to speed up)",100,100);
        else dc.context.fillText("Watch the quake",100,100);
        break;
      case lt.LVL_GUESS_LOC:
        dc.context.fillText("Click to guess where the earthquake might have originated",100,100);
        break;
      case lt.LVL_GUESS_PLAYING:
        if(play_speed == 1) dc.context.fillText("Wait for it... (click 8x speed to speed up)",100,100);
        else dc.context.fillText("Wait for it...",100,100);
        break;
      case lt.LVL_INCORRECT_GUESS_FIND_CORRECT:
        dc.context.fillText("Try to find a plausable quake location",100,100);
        break;
      case lt.LVL_CORRECT_GUESS_FIND_ANOTHER:
        dc.context.fillText("Try to find another plausable quake origin",100,100);
        break;
      case lt.LVL_FOUND_2_CORRECT_FIND_5:
        var n = 0;
        for(var i = 0; i < earth.quakes.length; i++)
          if(earth.quakes[i].c && earth.quakes[i].player_knows_c) n++;
        dc.context.fillText("Keep finding plausible origins (found "+n+"/5)",100,100);
        break;
      case lt.LVL_FIND_TIGHT_RING:
        var n = 0;
        for(var i = 0; i < earth.quakes.length; i++)
          if(earth.quakes[i].c && earth.quakes[i].player_knows_c) n++;
        dc.context.fillText("Find 3 plausible origins very precisely (found "+n+"/3)",100,100);
        dc.context.fillText("(Drag out a ring from the location to help!)",100,120);
        break;
      case lt.LVL_DRAG_TO_PATTERN:
        dc.context.fillText("Click and Drag out a pattern from Square City",100,100);
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
    self.complete = false;
    self.reset = true;
    self.allow_skip_prompt = false;
    self.location_success_range = 10;
    self.n_locations = 3;
    self.loc_1_x = undefined;
    self.loc_1_y = undefined;
    self.loc_2_x = undefined;
    self.loc_2_y = undefined;
    self.loc_3_x = undefined;
    self.loc_3_y = undefined;
    self.loc_4_x = undefined;
    self.loc_4_y = undefined;
    self.quake_start_range_s = 0;
    self.quake_start_range_e = 0;
    self.quake_x = undefined;
    self.quake_y = undefined;
    self.display_ghost_quake = false;
    self.display_quake_start_range = true;
    self.p_waves = true;
    self.quake_selection_r = 0;
    self.deselect_all_on_create = true;
    self.deselect_known_wrongs_on_create = false;
    self.draw_mouse_quake = false;
    self.click_resets_t = true;
    self.variable_quake_t = false;
    self.allow_radii = true;
    self.ghost_countdown = false;
    self.imask = new InputMask();
    self.lines = ["what's up?"];
    self.prePromptEvt = function(){};
    self.postPromptEvt = function(){};
    self.advanceTest = function(){return false;}
  }

  var InputMask = function()
  {
    var self = this;
    self.play_pause = true;
    self.scrubber = true;
    self.earth = true;
    self.earthdrag = true;
    self.select = true;
    self.skip = true;
  }

  var cloneLevel = function(fromLvl, toLvl)
  {
    //toLvl.complete = fromLvl.complete; //don't copy complete!
    toLvl.reset = fromLvl.reset;
    toLvl.allow_skip_prompt = fromLvl.allow_skip_prompt;
    toLvl.location_success_range = fromLvl.location_success_range;
    toLvl.n_locations = fromLvl.n_locations;
    toLvl.loc_1_x = fromLvl.loc_1_x;
    toLvl.loc_1_y = fromLvl.loc_1_y;
    toLvl.loc_2_x = fromLvl.loc_2_x;
    toLvl.loc_2_y = fromLvl.loc_2_y;
    toLvl.loc_3_x = fromLvl.loc_3_x;
    toLvl.loc_3_y = fromLvl.loc_3_y;
    toLvl.loc_4_x = fromLvl.loc_4_x;
    toLvl.loc_4_y = fromLvl.loc_4_y;
    toLvl.quake_start_range_s = fromLvl.quake_start_range_s;
    toLvl.quake_start_range_e = fromLvl.quake_start_range_e;
    toLvl.quake_x = fromLvl.quake_x;
    toLvl.quake_y = fromLvl.quake_y;
    toLvl.display_ghost_quake = fromLvl.display_ghost_quake;
    toLvl.display_quake_start_range = fromLvl.display_quake_start_range;
    toLvl.p_waves = fromLvl.p_waves;
    toLvl.quake_selection_r = fromLvl.quake_selection_r;
    toLvl.deselect_all_on_create = fromLvl.deselect_all_on_create;
    toLvl.deselect_known_wrongs_on_create = fromLvl.deselect_known_wrongs_on_create;
    toLvl.draw_mouse_quake = fromLvl.draw_mouse_quake;
    toLvl.click_resets_t = fromLvl.click_resets_t;
    toLvl.variable_quake_t = fromLvl.variable_quake_t;
    toLvl.allow_radii = fromLvl.allow_radii;
    toLvl.ghost_countdown = fromLvl.ghost_countdown;
    toLvl.imask.play_pause = fromLvl.imask.play_pause;
    toLvl.imask.scrubber = fromLvl.imask.scrubber;
    toLvl.imask.earth = fromLvl.imask.earth;
    toLvl.imask.earthdrag = fromLvl.imask.earthdrag;
    toLvl.imask.select = fromLvl.imask.select;
    toLvl.imask.skip = fromLvl.imask.skip;
    toLvl.lines = fromLvl.lines;
    toLvl.prePromptEvt = fromLvl.prePromptEvt;
    toLvl.postPromptEvt = fromLvl.postPromptEvt;
    toLvl.advanceTest = fromLvl.advanceTest;
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
    self.recordable_t = 2/quake_p_rate;

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
          if(levels[cur_level].loc_1_x !== undefined) l = new Location(levels[cur_level].loc_1_x,levels[cur_level].loc_1_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
          l.shape = square;
        }
        else if(i == 1)
        {
          if(levels[cur_level].loc_2_x !== undefined) l = new Location(levels[cur_level].loc_2_x,levels[cur_level].loc_2_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
          l.shape = circle;
        }
        else if(i == 2)
        {
          if(levels[cur_level].loc_3_x !== undefined) l = new Location(levels[cur_level].loc_3_x,levels[cur_level].loc_3_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
          l.shape = triangle;
        }
        else if(i == 3)
        {
          if(levels[cur_level].loc_4_x !== undefined) l = new Location(levels[cur_level].loc_4_x,levels[cur_level].loc_4_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
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
    self.deselectKnownWrongQuakes = function()
    {
      for(var i = 0; self.quakes && i < self.quakes.length; i++)
      {
        var q = self.quakes[i];
        if(!q.c && q.player_knows_c) self.quakes[i].selected = false;
      }
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
        accomplished = true;
        if(levels[cur_level].quake_x !== undefined)
        {
          self.ghost_quake = new Quake(levels[cur_level].quake_x, levels[cur_level].quake_y, Math.round(randR(levels[cur_level].quake_start_range_s,levels[cur_level].quake_start_range_e)));
        }
        else
        {
          self.ghost_quake = new Quake(          randR(-0.3,0.3),           randR(-0.3,0.3), Math.round(randR(levels[cur_level].quake_start_range_s,levels[cur_level].quake_start_range_e)));
          for(var i = 0; accomplished && i < self.locations.length; i++)
            accomplished = (wdist(self.locations[i],self.ghost_quake) > min_dist);
        }
        self.ghost_quake.knows_c = false;
        self.ghost_quake.selected = true;
        self.ghost_quake.c = true; //by definition
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
    self.mouse_quake.selected = true;

    self.hovering = false;
    self.hov_obj = new WO();
    self.hover = function(evt)
    {
      self.hovering = true;
      self.hov_obj.x = evt.doX;
      self.hov_obj.y = evt.doY;
      worldSpace(cam,dc,self.hov_obj);
    }
    self.unhover = function()
    {
      self.hovering = false;
    }

    self.dragging = false;
    self.drag_obj = new WO();
    self.drag_origin_obj = new WO();
    self.drag_obj.x = -1;
    self.drag_obj.y = -1;
    self.drag_obj.wx = -1;
    self.drag_obj.wy = -1;
    self.drag_origin_obj.wx = -1;
    self.drag_origin_obj.wy = -1;
    self.dragStart = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.earth) return;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.earth) return;
      self.dragging = true;
      self.drag_obj.x = evt.doX;
      self.drag_obj.y = evt.doY;
      worldSpace(cam,dc,self.drag_obj);
      if(self.drag_origin_obj.wx == -1)
      {
        self.drag_origin_obj.x = self.drag_obj.x;
        self.drag_origin_obj.y = self.drag_obj.y;
        self.drag_origin_obj.wx = self.drag_obj.wx;
        self.drag_origin_obj.wy = self.drag_obj.wy;
      }
      if(!levels[cur_level].imask.earthdrag)
        self.dragFinish();
    }
    self.dragFinish = function()
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.earth) return;
      self.dragging = false;

      if(self.drag_obj.x == -1) return;
      if(
        Math.abs(self.drag_obj.wx-self.drag_origin_obj.wx) < 0.05 &&
        Math.abs(self.drag_obj.wy-self.drag_origin_obj.wy) < 0.05
      )
      {
        for(var i = 0; i < self.quakes.length; i++)
        {
          var obj = self.quakes[i];
          var r = levels[cur_level].quake_selection_r;
          var within = ptWithin(self.drag_obj.x, self.drag_obj.y, obj.x-r/2, obj.y-r/2, obj.w+r, obj.h+r); //expanded
          if(within)
          {
            self.quakes[i].selected = !self.quakes[i].selected;
            self.drag_obj.x = -1;
            self.drag_obj.y = -1;
            self.drag_obj.wx = -1;
            self.drag_obj.wy = -1;
            self.drag_origin_obj.wx = -1;
            self.drag_origin_obj.wy = -1;
            return;
          }
        }

        if(levels[cur_level].click_resets_t)
        {
          self.t = 0;
          play_state = STATE_PLAY;
        }

        var q;
        q = new Quake(self.drag_obj.wx,self.drag_obj.wy,self.assumed_start_t,self.ghost_quake);
        q.eval_loc_ts(self.locations);
        if(levels[cur_level].deselect_all_on_create) self.deselectQuakes();
        if(levels[cur_level].deselect_known_wrongs_on_create) self.deselectKnownWrongQuakes();
        q.selected = true;
        hov_quak = q;
        hoverer.register(q);
        self.quakes.push(q);
      }

      var min_x = self.drag_origin_obj.wx; if(self.drag_obj.wx < min_x) min_x = self.drag_obj.wx;
      var min_y = self.drag_origin_obj.wy; if(self.drag_obj.wy < min_y) min_y = self.drag_obj.wy;
      var w = Math.abs(self.drag_obj.wx-self.drag_origin_obj.wx);
      var h = Math.abs(self.drag_obj.wy-self.drag_origin_obj.wy);
      for(var i = 0; i < self.quakes.length; i++)
      {
        if(ptWithin(self.quakes[i].wx, self.quakes[i].wy, min_x, min_y, w, h))
          self.quakes[i].selected = true;
      }

      self.drag_obj.x = -1;
      self.drag_obj.y = -1;
      self.drag_obj.wx = -1;
      self.drag_obj.wy = -1;
      self.drag_origin_obj.wx = -1;
      self.drag_origin_obj.wy = -1;
    }

    var ellipse = new WO();
    self.drawQuake = function(q)
    {
      if((self.t-q.t) < 0) return;

      if(q.selected)
      {
        dc.context.lineWidth = 2;
        dc.context.strokeStyle = "#888888";
        dc.context.beginPath();
        dc.context.arc(q.cx, q.cy, q.w/2, 0, 2 * Math.PI);
        dc.context.stroke();

        ellipse.wx = q.wx;
        ellipse.wy = q.wy;
        ellipse.ww = (self.t-q.t)*quake_s_rate;
        ellipse.wh = (self.t-q.t)*quake_s_rate;
        screenSpace(cam,dc,ellipse);
        dc.context.strokeStyle = s_color;
        dc.context.beginPath();
        dc.context.ellipse(q.cx, q.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
        dc.context.stroke();

        if(levels[cur_level].p_waves)
        {
          dc.context.strokeStyle = p_color;
          ellipse.wx = q.wx;
          ellipse.wy = q.wy;
          ellipse.ww = (self.t-q.t)*quake_p_rate;
          ellipse.wh = (self.t-q.t)*quake_p_rate;
          screenSpace(cam,dc,ellipse);
          dc.context.beginPath();
          dc.context.ellipse(q.cx, q.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
          dc.context.stroke();
        }
      }

      if(q.c_aware_t < self.t)
      {
        if(q.c) dc.context.drawImage(cmark,q.cx-cmark.width/2,q.cy-cmark.height/2);
        else    dc.context.drawImage(xmark,q.cx-xmark.width/2,q.cy-xmark.height/2);
        q.player_knows_c = true;
      }
      else
        dc.context.drawImage(qmark,q.cx-qmark.width/2,q.cy-qmark.height/2);
    }
    self.drawLoc = function(l,shake_amt)
    {
      var qx = 0;
      var qy = 0;
      var wd = 0.01;
      qx += randR(-1,1)*shake_amt*wd*dc.width;
      qy += randR(-1,1)*shake_amt*wd*dc.width;
      dc.context.lineWidth = 2;
      dc.context.beginPath();
      dc.context.ellipse(l.cx+qx,l.cy+qy,l.w/2,l.h/2,0,0,2*Math.PI);
      dc.context.stroke();
      dc.context.drawImage(l.shape,l.cx+qx-l.shape.width/2,l.cy+qy-l.shape.height/2,l.shape.width,l.shape.height);
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
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];

        if(levels[cur_level].allow_radii)
        {
          var x = l.wx-l.rad_obj.wx;
          var y = l.wy-l.rad_obj.wy;
          var d = Math.sqrt(x*x+y*y);

          dc.context.lineWidth = dc.height*(quake_p_rate*levels[cur_level].location_success_range); //BAD- ONLY WORKS WHEN cam.wh == 1;
          ellipse.wx = l.wx;
          ellipse.wy = l.wy;
          ellipse.ww = l.rad;
          ellipse.wh = l.rad;
          screenSpace(cam,dc,ellipse);
          dc.context.beginPath();
          dc.context.ellipse(l.cx,l.cy,ellipse.w,ellipse.h,0,0,2*Math.PI); //circles around locs
          dc.context.stroke();

          dc.context.lineWidth = 2;
          dc.context.beginPath();
          dc.context.ellipse(l.cx,l.cy,ellipse.w,ellipse.h,0,0,2*Math.PI); //circles around locs
          dc.context.stroke();
          if(l.dragging || l.hovering)
          {
            //not technically an ellipse...
            dc.context.beginPath();
            dc.context.moveTo(l.cx,l.cy); dc.context.lineTo(l.rad_obj.x,l.rad_obj.y); //line
            dc.context.stroke();

            if(l.rad != 0)
            {
              var tmp_alpha = dc.context.globalAlpha;
              dc.context.globalAlpha=1;
              ellipse.wx = l.rad_obj.wx+x/2;
              ellipse.wy = l.rad_obj.wy+y/2;
              ellipse.ww = 0;
              ellipse.wh = 0;
              screenSpace(cam,dc,ellipse);
              dc.context.fillStyle = s_color;
              dc.context.fillText("("+timeForT(Math.round(l.rad/quake_s_rate))+")",ellipse.x,ellipse.y-10);
              if(levels[cur_level].p_waves)
              {
                dc.context.fillStyle = p_color;
                dc.context.fillText("("+timeForT(Math.round(l.rad/quake_p_rate))+")",ellipse.x,ellipse.y-20);
              }
              dc.context.globalAlpha=tmp_alpha;
            }
          }
        }
      }
      dc.context.globalAlpha=1;

      //draw selection box
      var dragSel;
      if(self.dragging)
      {
        dragSel = new WO();
        var min_x = self.drag_origin_obj.x;
        var min_y = self.drag_origin_obj.y;
        if(self.drag_obj.x < min_x) min_x = self.drag_obj.x;
        if(self.drag_obj.y < min_y) min_y = self.drag_obj.y;
        var w = Math.abs(self.drag_origin_obj.x-self.drag_obj.x);
        var h = Math.abs(self.drag_origin_obj.y-self.drag_obj.y);

        dc.context.fillStyle = "#000000";
        dc.context.globalAlpha=0.1;
        dc.context.fillRect(min_x,min_y,w,h);
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
      if(levels[cur_level].display_ghost_quake)
        self.drawQuake(self.ghost_quake);
      if(self.hovering && levels[cur_level].draw_mouse_quake && !hov_loc && !hov_quak && !scrubber.hovering)
      {
        self.mouse_quake.eval_pos(self.hovering_wx,self.hovering_wy);
        self.drawQuake(self.mouse_quake);
      }
      if(false && levels[cur_level].ghost_countdown)
      {
        var l;
        var g = self.ghost_quake;
        dc.context.strokeStyle = "#000000";
        for(var i = 0; i < self.locations.length; i++)
        {
          l = self.locations[i];
          var t_til = g.location_s_ts[i]-self.t;
          if(t_til > 0 && t_til < 200)
          {
            ellipse.wx = l.wx;
            ellipse.wy = l.wy;
            ellipse.ww = t_til*quake_s_rate;
            ellipse.wh = t_til*quake_s_rate;
            screenSpace(cam,dc,ellipse);
            dc.context.globalAlpha=1-(t_til/200);
            dc.context.beginPath();
            dc.context.ellipse(l.cx, l.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
            dc.context.stroke();
          }

          if(levels[cur_level].p_waves)
          {
            var t_til = g.location_p_ts[i]-self.t;
            if(t_til > 0 && t_til < 100)
            {
              ellipse.wx = l.wx;
              ellipse.wy = l.wy;
              ellipse.ww = t_til*quake_p_rate;
              ellipse.wh = t_til*quake_p_rate;
              screenSpace(cam,dc,ellipse);
              dc.context.globalAlpha=1-(t_til/100);
              dc.context.beginPath();
              dc.context.ellipse(l.cx, l.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
              dc.context.stroke();
            }
          }
          dc.context.globalAlpha=1;
        }
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
    self.player_knows_c = false;

    self.selected = false;

    self.eval_pos = function(x,y)
    {
      self.wx = x;
      self.wy = y;
      self.ww = quake_size;
      self.wh = quake_size;

      screenSpace(cam,dc,self);
      self.cx = self.x+self.w/2;
      self.cy = self.y+self.h/2;
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
    self.ww = location_size;
    self.wh = location_size;

    screenSpace(cam,dc,self);
    self.cx = self.x+self.w/2;
    self.cy = self.y+self.h/2;

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
    self.rad_obj = new WO();
    self.rad_obj.x = self.cx;
    self.rad_obj.y = self.cy;
    self.rad_obj.wx = self.wx;
    self.rad_obj.wy = self.wy;
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
        screenSpace(cam,dc,self);
        self.cx = self.x+self.w/2;
        self.cy = self.y+self.h/2;
      }
      if(levels[cur_level].allow_radii)
      {
        self.rad_obj.x = evt.doX;
        self.rad_obj.y = evt.doY;
        worldSpace(cam,dc,self.rad_obj);
        var x = self.rad_obj.wx-self.wx;
        var y = self.rad_obj.wy-self.wy;
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
    self.h = 40;
    self.x = 0;
    self.y = dc.height-self.h;

    self.earth = earth;

    self.play_button  = new ButtonBox((self.h/2)*0,self.y+self.h/2,self.h/2,self.h/2,function(){ ui_lock = self; if(!levels[cur_level].imask.play_pause) return; if(self.earth.t == self.earth.recordable_t) self.earth.t = 0; play_state = STATE_PLAY; });
    self.pause_button = new ButtonBox((self.h/2)*1,self.y+self.h/2,self.h/2,self.h/2,function(){ ui_lock = self; if(!levels[cur_level].imask.play_pause) return; play_state = STATE_PAUSE;});
    self.bogus_button = new ButtonBox(0,self.y,(self.h/2)*2,self.h/2,function() { ui_lock = self; return; });
    clicker.register(self.play_button);
    clicker.register(self.pause_button);
    clicker.register(self.bogus_button);
    self.scrub_bar = new Box((self.h/2)*2+5,self.y,self.w-((self.h/2)*2+5),self.h);
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
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.scrubber) return;
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
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.scrubber) return;
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
      if(!levels[cur_level].imask.scrubber) return;
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
        dc.context.fillRect(x-w/2,self.y+self.h/2,           w,self.h*0.1);
        dc.context.fillRect(x-w/2,self.y+self.h/2+self.h*0.4,w,self.h*0.1);
      }
      else dc.context.fillRect(x-w/2,self.y+self.h/2,w,self.h/2);

      if(icon) dc.context.drawImage(icon,x-icon.width/2,self.y+self.h/2+self.h/4-icon.height/2);
    }
    self.labelBlip = function(t,hrt)
    {
      var x = self.scrub_bar.xForT(t);
      dc.context.fillText(hrt,x,self.y+self.h/2-1);
    }
    self.shapeBlip = function(t,shape)
    {
      var x = self.scrub_bar.xForT(t);
      dc.context.drawImage(shape,x-shape.width/2,self.y+self.h/2-5-shape.height);
    }
    self.drawAssumedStartBlip = function()
    {
      dc.context.textAlign = "left";
      var x = self.scrub_bar.xForT(self.earth.assumed_start_t);
      dc.context.fillStyle = "#2277FF";
      dc.context.fillRect(x-0.5,self.y,1,self.h);
      dc.context.fillRect(x-0.5,self.y,90,self.h/4);
      dc.context.fillStyle = "#FFFFFF";
      dc.context.fillText("Quake Origin Time",x+2,self.y+self.h/4-2);
    }
    self.drawQuakeBlips = function(q,ghost)
    {
      for(var i = 0; i < self.earth.locations.length; i++)
      {
        var draw_s =                               (ghost || self.earth.t > q.location_s_ts[i]);
        var draw_p = (levels[cur_level].p_waves && (ghost || self.earth.t > q.location_p_ts[i]));
        dc.context.globalAlpha = 1;
        if(i == hov_loc_i) //hovering over location
        {
          dc.context.fillStyle = "#000000";
          if(draw_s) self.labelBlip(q.location_s_ts[i],q.location_s_hrts[i]);
          if(draw_p) self.labelBlip(q.location_p_ts[i],q.location_p_hrts[i]);
        }
        else if(q == hov_quak) //hovering over quake
        {
          if(ghost || self.earth.locations.length > 1)
          {
            if(draw_s) self.shapeBlip(q.location_s_ts[i],self.earth.locations[i].shape);
            if(draw_p) self.shapeBlip(q.location_p_ts[i],self.earth.locations[i].shape);
          }
        }
        else //hovering over neither
        {
          if(ghost)
          {
            if(self.earth.locations.length > 1) dc.context.globalAlpha = 0.2;
            if(draw_s) self.shapeBlip(q.location_s_ts[i],self.earth.locations[i].shape);
            if(draw_p) self.shapeBlip(q.location_p_ts[i],self.earth.locations[i].shape);
          }
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
      dc.context.globalAlpha = 1;
    }
    self.draw = function()
    {
      dc.context.font = "10px Helvetica";
      dc.context.textAlign = "center";

      //draw self
      dc.context.fillStyle = "#CCCCCC";
      dc.context.fillRect(self.x,self.y,self.w,self.h);
      dc.context.fillStyle = "#AAAAAA";
      dc.context.fillRect(self.x,self.y+self.h/2,self.w,self.h/2);
      dc.context.strokeStyle = "#000000";
      dc.context.lineWidth = 1;
      dc.context.beginPath();
      dc.context.moveTo(self.x,self.y+self.h/2);
      dc.context.lineTo(self.x+self.w,self.y+self.h/2);
      dc.context.stroke();
      if(levels[cur_level].display_quake_start_range)
      {
        dc.context.fillStyle = "#88AAAA";
        var s = self.scrub_bar.w*(levels[cur_level].quake_start_range_s/self.earth.recordable_t);
        var e = self.scrub_bar.w*(levels[cur_level].quake_start_range_e/self.earth.recordable_t);
        dc.context.fillRect(self.scrub_bar.x+s,self.y+self.h/2,e-s,self.h/2);
      }
      dc.context.fillStyle = "#FFFFFF";

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

      if(hov_loc && hov_loc.rad)
      {
        dc.context.globalAlpha=1;
        var range = levels[cur_level].location_success_range;
        dc.context.fillStyle = "#222222";
        self.drawBlip(hov_loc.rad/quake_s_rate,range,true,0);
        dc.context.globalAlpha=1;
      }

      self.drawQuakeBlips(self.earth.ghost_quake,true);
      for(var i = 0; i < self.earth.quakes.length; i++)
        if(self.earth.quakes[i].selected || self.earth.quakes[i] == hov_quak) self.drawQuakeBlips(self.earth.quakes[i],false)
      dc.context.globalAlpha=1;

      if(levels[cur_level].display_quake_start_range)
        self.drawAssumedStartBlip();

      //ui
      dc.context.fillStyle = "#000000";
      var padding = 5;
      //play_button
      dc.context.beginPath();
      dc.context.moveTo(self.play_button.x+padding,self.play_button.y+padding);
      dc.context.lineTo(self.play_button.x+self.play_button.w-padding,self.play_button.y+self.play_button.h/2);
      dc.context.lineTo(self.play_button.x+padding,self.play_button.y+self.play_button.h-padding);
      dc.context.fill();
      //pause_button
      dc.context.fillRect(
        self.pause_button.x+padding,
        self.pause_button.y+padding,
        (self.pause_button.w-2*padding)/2-(self.pause_button.w/20),
        self.pause_button.h-2*padding
      );
      dc.context.fillRect(
        self.pause_button.x+self.pause_button.w/2+(self.pause_button.w/20),
        self.pause_button.y+padding,
        (self.pause_button.w-2*padding)/2-(self.pause_button.w/20),
        self.pause_button.h-2*padding
      );
      //dc.context.fillRect(self.pause_button.x+self.pause_button.w/2+self.pause_button/5,self.pause_button.y+padding,self.pause_button.w/2-padding-self.pause_button/10,self.pause_button.h-2*padding);
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

var WO = function()
{
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
  this.wx = 0;
  this.wy = 0;
  this.ww = 0;
  this.wh = 0;
}

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
qmark.context.fillText("?",qmark.width/2-1,qmark.height-1);

var xmark = GenIcon();
xmark.context.fillStyle = "#CC2222";
xmark.context.fillText("✖",xmark.width/2,xmark.height-2);

var cmark = GenIcon();
cmark.context.fillStyle = "#22CC22";
cmark.context.fillText("✔",cmark.width/2,cmark.height-2);

