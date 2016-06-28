var GamePlayScene = function(game, stage)
{
  var yellow = "#EFC62F"
  var red = "#F05945";
  var gray = "#BCBCBC"
  var black = "#000000"
  var white = "#FFFFFF"

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
  var next_input_state;

  ENUM = 0;
  var CHAR_BABY  = ENUM; ENUM++;
  var CHAR_ANNOY = ENUM; ENUM++;
  var CHAR_AXE   = ENUM; ENUM++;
  var CHAR_GIRL  = ENUM; ENUM++;
  var CHAR_TALL  = ENUM; ENUM++;
  var CHAR_BOY   = ENUM; ENUM++;
  var CHAR_DAD   = ENUM; ENUM++;

  var self = this;
  var dc = stage.drawCanv;
  var ctx = stage.drawCanv.context;

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
  var cur_prompt_line;
  var start_level = 0;
  var game_guesses;
  var game_known_locs;
  var game_drag_a;
  var game_drag_b;
  var game_drag_c;
  var game_drag_n;

  var earth;
  var hov_loc;
  var hov_loc_i;
  var hov_quak;
  var hov_quak_i;

  var next_button;
  var record_button;

  var scrubber;
  var speed_normal_button;
  var speed_fast_button;

  var desel_quakes_button;
  var del_sel_quakes_button;
  var del_all_quakes_button;
  var new_button;

  var char_disp;
  var canvdom;
  var blurb_w;
  var blurb_x;
  var blurb_y;
  var blurb_t;
  var canvdomhit;

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
        ctx.fillRect(self.sx-2,self.sy-2,4,4);
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
    play_speed = 1.5;

    lt = {};
    var l;
    levels = [];

    l = new Level();
    l.return_on_complete = false;
    l.reset = true;
    l.GPS = false;
    l.location_success_range = 0;
    l.n_locations = 0;
    l.quake_start_range_s = 0;
    l.quake_start_range_e = 0;
    l.display_quake_start_range = true;
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
    l.imask.origin_flag = false;
    l.imask.earth = false;
    l.imask.earthdrag = false;
    l.imask.select = false;
    l.imask.new = false;
    l.imask.skip = false;
    l.lines = [];
    l.chars = [];
    l.advanceTest = function(){return true;}
    lt.LVL_NULL = levels.length;
    levels.push(l);

    if(debug_levels)
    {
      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 50;
      l.n_locations = 3;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.lines = [];
      l.chars = [];
      lt.LVL_DEBUG = levels.length;
      levels.push(l);
    }
    else
    {

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 100;
      l.quake_start_range_e = 100;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = false;
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
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.new = false;
      l.imask.skip = false;
      l.lines = [
        //"What can we know about earthquakes? And how can we know it?",
        //"Imagine that the little black square is <b>Square City</b>, and an earthquake is about to make it rumble!",
        "With the right information, we can figure out when an earthquake started...",
        "And where it came from!",
        "We'll start with one city on the map. I'm not super good at drawing...",
        "It's great! A cute little square city.",
        "Let's call it... um... Square City!",
        "Ok, here we go... an earthquake is about to hit Square City!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function()
      {
        earth.assumed_start_t = levels[cur_level].quake_start_range_s;
        earth.genQuake(earth.ghost_quake.wx,earth.ghost_quake.wy);
      }
      l.postPromptEvt = function() {}
      l.drawExtra = function() { ctx.fillText("Click the play button to watch quake",100,100); }
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_INTRO_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,100);
        else ctx.fillText("Watch the quake",100,100);
      }
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_INTRO_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = false;
      l.imask.skip = true;
      l.lines = [
        //"Did you see how a wave moved out from the earthquake's <b>epicenter</b> and expanded until it hit the city?",
        //"We can see <b>where</b> the earthquake started,",
        //"we can see <b>when</b> it started,",
        //"and we can see <b>when</b> it was <b>experienced</b> by Square City.",
        //"But with real earthquakes, we have to <b>construct</b> all of that information from a <b>limited amount of data</b>.",
        //"Often, all we have is the <b>reports</b> that cities <b>felt</b> the earthquake at a certain <b>time</b>.",
        "KA-BOOM!",
        "Yipes... what was that?",
        "A shockwave!",
        "The wave started at the earthquake's epicenter and expanded until it hit the city.",
        "We saw where the earthquake started, when it started, and when it was felt by Square City",
        "Well, that seemed pretty simple!",
        "Yep. But in real life, scientists don't have a map that shows them when and where an earthquake started.",
      ];
      l.chars = [
        CHAR_AXE,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_INTRO_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.allow_skip_prompt = undefined;
      l.display_ghost_quake = false;
      l.display_quake_start_range = false;
      l.imask.play_pause = true;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.skip = false;
      l.lines = [
        //"The real information we have looks something more like this.",
        "Real earthquakes go more like this:",
      ];
      l.chars = [
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() { earth.t = 0; play_state = STATE_PAUSE; }
      l.postPromptEvt = function() {}
      l.drawExtra = function() { ctx.fillText("Click the play button",100,100); }
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_EMPTY_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,100);
        else ctx.fillText("Watch the quake",100,100);
      }
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_EMPTY_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = true;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = false;
      l.imask.skip = true;
      l.lines = [
        //"All we see is <b>when</b> <b>Square City</b> feels the shake!",
        //"<b>When</b> and <b>where</b> did the earthquake come from?",
        //"How can we fill out all the missing <b>information</b>, from only <b>when a location felt a tremor</b>?",
        "Ahhh! Take cover, Square City!",
        "But... where did the quake come from? When did it start?",
        "Scientists can fill in that info by working backward from the data they do have.",
        "For example, we can figure out when the earthquake started by looking at reports of when Square City felt the tremors.",
        "I'll show you how it works!",
        "But first, you need to know a little more about earthquakes.",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function(){ return false; }
      lt.LVL_EMPTY_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 50;
      l.quake_start_range_e = 50;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = false;
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
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.new = false;
      l.imask.skip = false;
      l.lines = [
        //"How can we figure out <b>when</b> an earthquake </b>originated</b> from only <b>when</b> it was <b>felt</b>?",
        //"Before we can answer, we have to quickly learn <b>just a bit more</b> about earthquakes.",
        //"Earthquakes send <b>multiple</b> shockwaves <b>from their epicenter</b>.",
        //"Each travels at a <b>different speed</b>- The <b>P-wave</b> (or Primary Wave) is much faster than the <b>S-Wave</b> (or Secondary Wave)",
        //"Let's see what that might look like.",
        "Earthquakes send shockwaves from the location where they originated- their epicenter.",
        "The P Wave, or Primary Wave, moves a lot faster than the S Wave, or Secondary Wave.",
        "Let's check out what that looks like.",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function()
      {
        earth.t = 0;
        earth.assumed_start_t = levels[cur_level].quake_start_range_s;
        speed_normal_button.set(true);
        play_state = STATE_PAUSE;
        earth.genQuake(earth.ghost_quake.wx,earth.ghost_quake.wy);
      }
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_SP_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_SP_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = false;
      l.imask.skip = true;
      l.lines = [
        //"See how the <b>P-Wave</b> (purple) travels at <b>twice the speed</b> of the <b>S-Wave</b> (blue)?",
        //"Look at <b>when</b> each wave was <b>reported</b> (shown on the timeline).",
        //"How can we use this to help determine <b>when</b> the earthquake <b>originated</b>?",
        "Ooh... the S Wave moved a lot slower!",
        "Yep. The P Wave was twice as fast as the S Wave.",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_SP_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 10;
      l.n_locations = 2;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.loc_2_x = -0.15;
      l.loc_2_y = 0;
      l.quake_start_range_s = 20;
      l.quake_start_range_e = 20;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = false;
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
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.new = false;
      l.imask.skip = false;
      l.lines = [
        //"Let's show that same earthquake, but this time, with <b>two locations</b>.",
        //"One will feel the tremors <b>shortly after</b> the quake originates,",
        //"And one will feel the tremors <b>long after</b> the quake has originated.",
        //"See how each experiences the shockwaves <b>differently</b> (watch the timeline!).",
        "Let's watch the same earthquake, but this time with two cities on the map.",
        "Gah... more drawing...",
        "Ok, let's call this one... Circle City?",
        "Ooh, I like it!",
        "So, Circle City will feel the tremors soon after the quake starts...",
        "And Square City will feel the tremors quite a while later.",
        "See how each city experienced the earthquake differently?",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function()
      {
        earth.t = 0;
        earth.assumed_start_t = levels[cur_level].quake_start_range_s;
        speed_normal_button.set(true);
        play_state = STATE_PAUSE;
        earth.genQuake(earth.ghost_quake.wx,earth.ghost_quake.wy);
      }
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_SP_RECAP_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+20)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_SP_RECAP_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = false;
      l.imask.skip = true;
      l.lines = [
        //"Do you see the <b>difference</b>?",
        //"Circle City feels the tremors <b>one soon after the other</b>, and Square City feels them <b>longer apart</b>.",
        //"We can use <b>how far apart</b> the <b>S-Wave</b> and the <b>P-Wave</b> were experienced to determine <b>how long ago</b> the quake <b>originated</b>.",
        "Circle City was closer to the epicenter...",
        "So the tremors hit closer together.",
        "Oh, I get it! Square City was farther from the epicenter...",
        "So the tremors were farther apart!",
        "Exactly. The time between waves tells us if the quake was close and recent, or if it was far away and long ago.",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_SP_RECAP_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 50;
      l.quake_start_range_e = 50;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = false;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.move_q_around_s = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.play_pause = true;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.skip = false;
      l.imask.new = false;
      l.lines = [
        //"<b>Without both</b> the S and P Waves, <b>we can't figure out when the quake originated</b>.",
        //"Was it <b>very close</b> and <b>very recent</b>? Or was it <b>very far away</b> and <b>very long ago</b>?",
        //"Here's an example of a <b>far away</b> quake that started <b>long ago</b>, hitting Square City-",
        "So what if we only had one wave? Could we still figure it out?",
        "Good question. Here's an example of a quake that started far away and long ago, hitting Square City.",
        "Poor Squares...",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_ANNOY,
      ];
      l.prePromptEvt = function()
      {
        earth.t = 0;
        earth.assumed_start_t = levels[cur_level].quake_start_range_s;
        speed_fast_button.set(true);
        play_state = STATE_PAUSE;
        earth.genQuake(earth.ghost_quake.wx,earth.ghost_quake.wy);
      }
      l.postPromptEvt = function() {}
      l.drawExtra = function() { ctx.fillText("Click Play",100,100); }
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_SP_SINGLE_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() { speed_fast_button.set(true); }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        if(speed_normal_button.on) ctx.fillText("Wait for it... (click >> to speed up)",100,100);
        else ctx.fillText("Wait for it...",100,100);
      }
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+10)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_SP_SINGLE_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.variable_quake_t = true;
      l.move_q_around_s = true;
      l.imask.origin_flag = true;
      l.imask.skip = false;
      l.lines = [
        //"Let's see if there could have been another scenario that <b>doesn't conflict with what we know</b> (exactly <b>when</b> Square City was hit).",
        //"Slide the <b>Quake Origin</b> on the timeline to start the quake <b>closer to when</b> Square City felt its tremors.",
        "Now let's see how it might look if the quake started at a different time.",
        "Slide the Quake Origin on the timeline, so that the quake starts closer to when Square City felt the tremors.",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Slide the \"Quake Origin\" marker on the timeline",100,100);
        ctx.fillText("closer to the time of impact.",100,120);
      }
      l.advanceTest = function() { return (earth.quakes[0].wx >= 0.1 && !scrubber.scrub_bar.dragging_quake_start); }
      lt.LVL_SP_SINGLE_MOVE_CLOSE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.variable_quake_t = true;
      l.move_q_around_s = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.skip = true;
      l.lines = [
        //"The quake could have been <b>very close</b> and <b>very recent</b>, and it <b>still</b> would have hit Square City <b>at the reported time</b>!",
        //"That means <b>we can't know</b> which scenario was true <b>with only this information</b>.",
        "Hmmm. The quake was really close and really recent, but it still hit Square City at the same time as before!",
        "Yep. That's why one wave isn't enough.",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() { earth.t = 0; play_state = STATE_PLAY; }
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_SP_SINGLE_MOVE_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 10;
      l.n_locations = 1;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.quake_start_range_s = 50;
      l.quake_start_range_e = 50;
      l.quake_x = 0;
      l.quake_y = 0;
      l.display_ghost_quake = false;
      l.display_quake_start_range = true;
      l.p_waves = true;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = false;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = true;
      l.move_q_around_p = true;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.origin_flag = true;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.skip = false;
      l.imask.new = false;
      l.lines = [
        //"Let's see that <b>same scenario</b>, but this time, with <b>both S and P waves</b>.",
        //"Move the <b>origin time</b> until <b>both</b> the S wave <b>and</b> the P wave <b>hit Square City at the reported times</b>.",
        "Let's try again, this time with both waves! Move the origin time until both the S Wave and the P Wave hit Square City at the reported times.",
      ];
      l.chars = [
        CHAR_GIRL,
      ];
      l.prePromptEvt = function()
      {
        earth.assumed_start_t = levels[cur_level].quake_start_range_s;
        speed_fast_button.set(true);
        play_state = STATE_PAUSE;
        earth.genQuake(earth.ghost_quake.wx,earth.ghost_quake.wy);
        earth.t = earth.ghost_quake.location_s_ts[0]+10;
        //hack drag it forward
        var t = earth.assumed_start_t+100;
        var goal_t = earth.quakes[0].location_p_ts[0];
        var rate = quake_p_rate;
        var td = goal_t - t;
        if(td < 0) { t = goal_t; td = 0; }
        var lx = earth.locations[0].wx;
        var qx = lx-td*rate;
        earth.quakes[0].eval_pos(qx,earth.quakes[0].wy);
        earth.quakes[0].t = t;
        earth.quakes[0].eval_loc_ts(earth.locations);
        earth.assumed_start_t = t;
      }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Slide the \"Quake Origin\" marker on the timeline",100,100);
        ctx.fillText("until both the S Wave and P Wave match the times reported",100,120);
      }
      l.advanceTest = function(){ return (earth.quakes[0].c && !scrubber.scrub_bar.dragging_quake_start); }
      lt.LVL_SP_DOUBLE_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = true;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.variable_quake_t = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.skip = true;
      l.lines = [
        //"See how with reports of <b>both</b> the time of experiencing the <b>P Wave</b>, <b>and</b> the time of experiencing the <b>S Wave</b>, we can <b>narrow down</b> the <b>origin time</b> to a single possibility!",
        //"Once we've achieved that, we're <b>one step closer</b> to discovering <b>where</b> the earthquake originated.",
        "See? If we know when the P Wave and the S Wave hit a certain location, we can figure out the origin time!",
      ];
      l.chars = [
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() { earth.t = 1; play_state = STATE_PLAY; }
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_SP_DOUBLE_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
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
      l.imask.origin_flag = false;
      l.imask.select = false;
      l.imask.new = false;
      l.imask.skip = false;
      l.imask.earthdrag = false;
      l.lines = [
        //"Another earthquake has hit <b>Square City</b>!",
        //"To figure out <b>where</b> the earthquake originated (or \"to find its <b>epicenter</b>\"),",
        //"we're going to assume we already know <b>when</b> it originated.",
        //"(This means we'll no longer need to visualize both the <b>P-Waves</b> <i>and</i> the <b>S-Waves</b> going forward.)",
        //"Only knowing <b>when</b> the earthquake started, and <b>when</b> it hit Square City,",
        //"place a guess <b>where</b> you think the earthquake might have occurred!",
        "Ok, so we can figure out when a earthquake happened.",
        "But we still don't know where the earthquake came from!",
        "That's true... we'll need more information to figure that out.",
        "Luckily, another earthquake just hit Square City!",
        "Again? Sheesh, this place is earthquake central!",
        "This time, we'll figure out where the earthquake started - its epicenter.",
        "We already know when the quake started, so we don't need to worry about both P and S Waves.",
        "Check out the timeline. You can see when the earthquake started, and when it hit Square City.",
        "Click on the map to guess where you think the earthquake started!",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() { ctx.fillText("Click to guess the earthquake's epicenter",100,100); }
      l.advanceTest = function()
      {
        return earth.quakes.length;
      }
      lt.LVL_BLIND_GUESS_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.earth = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        if(speed_normal_button.on) ctx.fillText("Wait for it... (click >> to speed up)",100,100);
        else ctx.fillText("Wait for it...",100,100);
      }
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
      lt.LVL_BLIND_GUESS_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = false;
      l.imask.earth = true;
      l.imask.select = true;
      l.lines = [
        //"It looks like the earthquake <b>could not have</b> originated at that location.",
        //"If it had, Square City would have reported <b>experiencing its tremors</b> at a <b>different time</b>.",
        //"Keep guessing until we find a location that <b>doesn't conflict</b> with any of the information we know.",
        "Hmm... looks like the earthquake couldn't have started at that location.",
        "If it had, Square City would've felt tremors at a different time.",
        "Oh, darn...",
        "It's ok, keep guessing! Click different spots on the map until you find a location where the earthquake would have started.",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() { ctx.fillText("Try to find a plausable quake location",100,100); }
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
      lt.LVL_BLIND_GUESS_INCORRECT = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.deselect_known_wrongs_on_create = true;
      l.lines = [
        //"Wow! Good guess!",
        //"The timing of that guessed epicenter <b>does not conflict</b> with the information we know.",
        //"While we <b>can't yet</b> difinitively say \"that is the earthquake's epicenter\", we <b>can't rule it out</b>-",
        //"There may be other locations we could try that <b>also</b> wouldn't conflict with our known information.",
        //"Try to find some other <b>plausable epicenters</b>.",
        "Wow! Good guess!",
        "YES! I found the earthquake!!!",
        "Well, you found one possible epicenter. The earthquake could have started at that location.",
        "So it could've started somewhere else??",
        "Yep, but you're getting closer. Since we know when the earthquake hit Square City, we're ruling out a lot of locations where the earthquake couldn't have started.",
        "Try to find some other plausible epicenters!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.drawExtra = function() { ctx.fillText("Try to find another plausable epicenter",100,100); }
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
      lt.LVL_BLIND_GUESS_ENCOURAGE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.lines = [
        //"Great work!",
        //"So you've found a couple locations that <b>cannot be ruled out</b> as epicenters-",
        //"that is, we've made some guesses that <b>don't conflict with what we know</b>.",
        //"Make a few more guesses, and try to look for a pattern. <b>What does the space look like</b> where the quake might have originated?",
        //"(Don't be afraid to make guesses all over the map!)",
        "Nice!! You found another location where the earthquake could have started!",
        "We can't know for sure yet, but we can't rule them out.",
        "Can I guess some more??",
        "Sure! Go ahead and click all over the map. Try to find a pattern!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.drawExtra = function()
      {
        var n = 0;
        for(var i = 0; i < earth.quakes.length; i++)
          if(earth.quakes[i].c && earth.quakes[i].player_knows_c) n++;
        ctx.fillText("Keep finding plausible epicenters (found "+n+"/5)",100,100);
      }
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
      lt.LVL_BLIND_GUESS_ENCOURAGE_AGAIN = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "I think I know the pattern";
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.imask.skip = true;
      l.lines = [
        //"Do you see the pattern starting to emerge?",
        //"Because <b>we know when the earthquake originated</b>, and <b>when Square City felt its tremors</b>,",
        //"we can <b>rule out some locations as possible epicenters</b>, and <b>cannot rule out</b> others.",
        //"Keep guessing until the pattern is obvious.",
        "Looks like a pattern is starting to emerge!",
        "Almost done... keep guessing until the pattern becomes obvious!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_BLIND_GUESS_COMPLETE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = undefined;
      l.allow_radii = true;
      l.imask.skip = false;
      l.lines = [
        //"So you think you see the pattern?",
        //"Click and drag out from Square City to highlight the area that <b>cannot be ruled out</b> as a possible epicenter of the earthquake",
        "I think I know the pattern!",
        "Great!",
        "Now click and drag out from Square City to highlight the area where the earthquake could have started.",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.drawExtra = function() { ctx.fillText("Click and Drag out a pattern from Square City",100,100); }
      l.advanceTest = function()
      {
        return (!earth.locations[0].dragging && Math.abs(Math.round(earth.locations[0].rad/quake_s_rate)-earth.ghost_quake.location_s_ts[0]) < 30);
      }
      lt.LVL_DRAG_PATTERN_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Ok. I'm ready to move on.";
      l.imask.skip = true;
      l.lines = [
        //"The pattern is a ring!",
        //"From only the information of <b>when</b> a quake originated, <b>when</b> a quake was felt (at a known location), and <b>how fast</b> a quake travels,",
        //"we can <b>narrow down</b> possible <b>epicenters</b> to a <b>ring</b> around the <b>known location</b>.",
        //"The <b>radius</b> of the ring is <b>proportional</b> to the <b>difference in time between when it originated, and when it was felt</b>.",
        //"In other words, <b>the longer it takes to travel, the larger the circle.</b>",
        //"From now on, you'll be able to <b>drag out these rings</b> from locations.",
        "Ooh... I see the pattern! It's.. It's...",
        "A donut!!!",
        "Actually, I was going to say a ring-",
        "An earthquake donut!",
        "An earth-nut? A dough-quake?",
        "Er... either way, you're right!",
        "We can narrow down possible epicenters to a ring -or a donut- around Square City.",
        "The radius of the ring is proportional to the time difference between when the quake started, and when it was felt.",
        "........whaaaa?",
        "Basically, the longer the quake takes to travel, the larger the ring.",
        "From now on, you can click and drag a ring from any city.",
      ];
      l.chars = [
        CHAR_ANNOY,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_DRAG_PATTERN_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 20;
      l.n_locations = 1;
      l.loc_1_x = 0.2;
      l.loc_1_y = -0.1;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.quake_x = -0.3;
      l.quake_y = 0;
      l.display_ghost_quake = false;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 20;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.imask.new = false;
      l.lines = [
        //"So, now that we have the ability to <b>drag a ring out from locations</b> to illuminate locations that <b>don't conflict with our known information</b>,",
        //"we'll now reduce the <b>error range</b>.",
        //"That is, for us to consider a location <b>plausibly correct</b>, it will have to be <b>very precise</b>.",
        //"With this new tool, and new restriction, try to find 3 <b>plausible epicenters</b> that <b>don't conflict with our known information.",
        "Now that we can pinpoint our earth-nut... um, I mean, our RING...",
        "...We can reduce our error range.",
        "In other words, we can make really good guesses of where the earthquake started!",
        "Using the ring to help you, try to find three plausible epicenters.",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        var n = 0;
        for(var i = 0; i < earth.quakes.length; i++)
          if(earth.quakes[i].c && earth.quakes[i].player_knows_c) n++;
        ctx.fillText("Find 3 plausible epicenters very precisely (found "+n+"/3)",100,100);
        ctx.fillText("(Drag out a ring from the location to help!)",100,120);
      }
      l.advanceTest = function()
      {
        var n_correct = 0;
        var q;
        for(var i = 0; i < earth.quakes.length; i++)
        {
          var q = earth.quakes[i];
          if(earth.t > q.location_s_ts[0] && q.location_s_cs[0]) n_correct++;
        }
        if(n_correct >= 3)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_TIGHT_GUESS_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Ready to move on";
      l.lines = [
        //"Cool. So we know how to pretty effectively narrow down <b>possible epicenters</b> to a ring",
        //"from only the information of <b>when</b> a quake originated, <b>when</b> a quake was felt (at a known location), and <b>how fast</b> a quake travels.",
        //"But how could we narrow it down further? We want to find <b>exactly where the quake originated</b>.",
        //"Unfortunately, <b>a ring</b> is the best we can narrow the possibilities down with <b>only that information</b>.",
        //"But what if we had more information?",
        //"What if there was <b>another location</b>, and we knew <b>when it felt the tremor</b> as well?",
        "Nice work!!",
        "Ok, so we can find a donut of possible epicenters. But where did the quake actually start??",
        "With the information we have so far, the donut is the best we can do.",
        "So... we need more information?",
        "Exactly!!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_TIGHT_GUESS_COMPLETE = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
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
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.imask.skip = false;
      l.imask.new = false;
      l.lines = [
        //"Well good news!",
        //"Circle city just called in when <b>they felt the earthquake's tremors</b>.",
        //"Using that information, see if you can narrow the possible locations that <b>don't conflict with any known information</b> down further!",
        //"Find 2 plausible <b>epicenters</b>.",
        "Luckily, Circle City just called to report when they felt the earthquake's tremors.",
        "Using this new information, see if you can find two plausible epicenters.",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
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
      lt.LVL_2LOC_GUESS_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = false;
      l.allow_skip_prompt = "Ready to move on";
      l.imask.skip = true;
      l.lines = [
        //"Ok. So we've narrowed it down even more!",
        //"With one location, we can <b>reduce the possible epicenter</b> to a <b>ring</b>.",
        //"With two locations, we get <b>two rings</b>.",
        //"But the epicenter <b>has to fall on both rings</b>.",
        //"This leaves at most <b>two small areas</b> where the rings intersect as <b>the only possible epicenters</b>.",
        //"That's a big reduction!",
        //"But we still don't yet know <b>exactly</b> where the quake's epicenter is located...",
        //"Which of the <b>two possible areas</b> is it?",
        //"We can answer this question by adding <b>one more location</b>...",
        "Great!",
        "With one location, we can only narrow down the possible epicenter to one ring.",
        "With two locations, we get two rings.",
        "Since the epicenter has to fall on BOTH rings, that juse leaves two small areas where the quake could've started.",
        "Ooh. So which one is it??",
        "We can answer that question by adding one more location!",
        "Max, your turn... what do you want to call this one??",
        "...",
        "BOOMTOWN!",
        "I can't draw a BOOM. How about Triangle City?",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_AXE,
        CHAR_AXE,
        CHAR_GIRL,
      ];
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_2LOC_GUESS_COMPLETE = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
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
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 10;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.imask.skip = false;
      l.imask.new = false;
      l.lines = [
        //"So now we've got 3 locations.",
        //"See if you can find the <b>exact</b> epicenter!",
        "Now that we have three locations, try to find the exact epicenter!",
      ];
      l.chars = [
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
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
      lt.LVL_3LOC_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.allow_skip_prompt = "Done";
      l.return_on_complete = true;
      l.reset = false;
      l.GPS = false;
      l.imask.skip = true;
      l.lines = [
        //"Ok! Now you know how to <b>triangulate</b> the epictner of an earthquake!",
        "BOOM!",
        "YES! We found it!!!",
        "Whew. I'm craving donuts, for some reason.",
        "Now you know how to triangulate a location!",
      ];
      l.chars = [
        CHAR_AXE,
        CHAR_ANNOY,
        CHAR_ANNOY,
        CHAR_GIRL,
      ];
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_TRIANGULATION_CONCLUSION = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = true;
      l.location_success_range = 10;
      l.n_locations = 3;
      l.loc_1_x = 0.4;
      l.loc_1_y = 0;
      l.loc_2_x = 0.0;
      l.loc_2_y = 0.2;
      l.loc_3_x = -0.2;
      l.loc_3_y = -0.3;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.quake_x = -0.4;
      l.quake_y = 0;
      l.display_ghost_quake = false;
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
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.imask.new = false;
      l.imask.skip = false;
      l.lines = [
        //"Triangulation has applications beyond <b>finding the epicenter of earthquakes</b>.",
        //"It's also used by <b>Global Positioning Systems</b> (or <b>GPS</b>)!",
        //"A key difference is that, rather than a wave <b>emitting from the unknown location</b>, towards a set of <b>known locations</b>,",
        //"waves instead <b>are emitted from known locations</b>, toward an <b>unknown location</b>.",
        //"Click Play to see what this might look like",
        "Triangulation isn't just used to find the epicenter of an earthquake...",
        "It's also used by Global Positioning Systems, or GPS.",
        "Oh!! Liek my mom uses to get us un-lost!",
        "Yep. GPS devices can find where you are and help you navigate!",
        "So does triangula-whatsit work the same way for earthquakes and GPS?",
        "Well, almost.",
        "But instead of a wave moving from an unknown location- the epicenter- to a known location...",
        "...GPS  devices use waves that move from known locations toward an unknown location.",
        "Click Play to see how triangulation can pinpoint where you are!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function()
      {
        earth.assumed_start_t = levels[cur_level].quake_start_range_s;
        earth.genQuake(earth.ghost_quake.wx,earth.ghost_quake.wy);
      }
      l.postPromptEvt = function() {}
      l.drawExtra = function() { ctx.fillText("Click the play button to watch the radio waves",100,100); }
      l.advanceTest = function(){ return play_state == STATE_PLAY; }
      lt.LVL_GPS_INTRO = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.GPS = true;
      l.imask.play_pause = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        if(speed_normal_button.on) ctx.fillText("Watch the radio waves (click >> to speed up)",100,100);
        else ctx.fillText("Watch the radio waves",100,100);
      }
      l.advanceTest = function()
      {
        if(earth.t > earth.ghost_quake.location_s_ts[0]+150)
        {
          play_state = STATE_PAUSE;
          return true;
        }
        return false;
      }
      lt.LVL_GPS_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = true;
      l.reset = false;
      l.GPS = true;
      l.allow_skip_prompt = "Done";
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = false;
      l.imask.skip = true;
      l.lines = [
        //"See how each <b>Satellite</b> emits a wave <b>toward</b> the GPS device?",
        //"Whenever the device <b>receives a signal</b> from any of the <b>known locations</b>, it marks down <b>how far away</b> it is from <b>the location sending the signal</b>.",
        //"Just like with earthquakes- when you have a <b>known distance</b> to a <b>known location</b>, you have reduced your <b>possible position</b> to <b>a ring</b>.",
        //"<b>3 distances</b> from <b>3 locations</b> means <b>3 rings</b>, which is enough to find <b>exactly where you are</b>!",
        "See how each satellite emits a wave toward the GPS device?",
        "When the GPS gets a signal from any of the known locations, it marks down how far away the signal came from.",
        "Three distances from three locations creates three rings...",
        "Which is enough to find your exact location!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_GPS_OUTRO = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = false;
      l.reset = true;
      l.GPS = false;
      l.location_success_range = 10;
      l.n_locations = 3;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = false;
      l.ghost_countdown = true;
      l.imask.new = false;
      l.imask.skip = false;
      l.lines = [
        //"Time to <b>test your intuition</b>!",
        //"Only showing <b>when each location was hit</b>, <b>guess</b> where you think the earthquake <b>originated</b>.",
        //"You <b>won't be able</b> to <b>drag out circles</b> from the locations until you guess!",
        "Want to try it?",
        "Yeah!!",
        "Ok, we know when each city reported tremors. See if you can guess where the earthquake originated.",
        "You won't be able to drag out rings from each city until after you guess!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_ANNOY,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function(){ game_guesses = 0; game_known_locs = 0; game_drag_a = 0; game_drag_b = 0; game_drag_c = 0; if(game.heard_game_prompt) levels[lt.LVL_GAME_GUESS_1].lines = []; };
      l.postPromptEvt = function(){ game.heard_game_prompt = true; };
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        ctx.fillText("Click to guess the location of the quake's epicenter!",100,120);
        ctx.fillText("(No using the locations' radius tool!)",100,140);
      }
      l.advanceTest = function()
      {
        if(earth.quakes.length > game_known_locs)
        {
          game_known_locs = earth.quakes.length;
          return true;
        }
        game_known_locs = earth.quakes.length;
      }
      lt.LVL_GAME_GUESS_1 = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = false;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() { game_guesses++; }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,120);
        else ctx.fillText("Watch the quake",100,120);
      }
      l.advanceTest = function()
      {
        if(earth.t >= earth.recordable_t)
        {
          if(earth.quakes[earth.quakes.length-1].c) cur_level = lt.LVL_GAME_GUESS_CORRECT-1; //jump to correct level
          return true;
        }
        return false;
      }
      lt.LVL_GAME_GUESS_1_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.earth = true;
      l.imask.earthdrag = true;
      l.imask.select = true;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        ctx.fillText("Click to guess the location of the quake's epicenter!",100,120);
        ctx.fillText("You are allowed to use 1 location's radius tool.",100,140);
      }
      l.advanceTest = function()
      {
        if(earth.quakes.length > game_known_locs)
        {
          game_known_locs = earth.quakes.length;
          return true;
        }
        game_known_locs = earth.quakes.length;
      }
      lt.LVL_GAME_GUESS_2 = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = false;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() { game_guesses++; }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,120);
        else ctx.fillText("Watch the quake",100,120);
      }
      l.advanceTest = function()
      {
        if(earth.t >= earth.recordable_t)
        {
          if(earth.quakes[earth.quakes.length-1].c) cur_level = lt.LVL_GAME_GUESS_CORRECT-1; //jump to correct level
          return true;
        }
        return false;
      }
      lt.LVL_GAME_GUESS_2_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.earth = true;
      l.imask.earthdrag = true;
      l.imask.select = true;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        ctx.fillText("Click to guess the location of the quake's epicenter!",100,120);
        ctx.fillText("You are allowed to use 2 locations' radius tools.",100,140);
      }
      l.advanceTest = function()
      {
        if(earth.quakes.length > game_known_locs)
        {
          game_known_locs = earth.quakes.length;
          return true;
        }
        game_known_locs = earth.quakes.length;
      }
      lt.LVL_GAME_GUESS_3 = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = false;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() { game_guesses++; }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,120);
        else ctx.fillText("Watch the quake",100,120);
      }
      l.advanceTest = function()
      {
        if(earth.t >= earth.recordable_t)
        {
          if(earth.quakes[earth.quakes.length-1].c) cur_level = lt.LVL_GAME_GUESS_CORRECT-1; //jump to correct level
          return true;
        }
        return false;
      }
      lt.LVL_GAME_GUESS_3_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.earth = true;
      l.imask.earthdrag = true;
      l.imask.select = true;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        ctx.fillText("Click to guess the location of the quake's epicenter!",100,120);
        ctx.fillText("You are allowed to use all locations' radius tools.",100,140);
      }
      l.advanceTest = function()
      {
        if(earth.quakes.length > game_known_locs)
        {
          game_known_locs = earth.quakes.length;
          return true;
        }
        game_known_locs = earth.quakes.length;
      }
      lt.LVL_GAME_GUESS_4 = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = false;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() { game_guesses++; }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,120);
        else ctx.fillText("Watch the quake",100,120);
      }
      l.advanceTest = function()
      {
        if(earth.t >= earth.recordable_t)
        {
          if(earth.quakes[earth.quakes.length-1].c) cur_level = lt.LVL_GAME_GUESS_CORRECT-1; //jump to correct level
          return true;
        }
        return false;
      }
      lt.LVL_GAME_GUESS_4_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.earth = true;
      l.imask.earthdrag = true;
      l.imask.select = true;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        ctx.fillText("Click to guess the location of the quake's epicenter!",100,120);
        ctx.fillText("You are allowed to use all locations' radius tools.",100,140);
      }
      l.advanceTest = function()
      {
        if(earth.quakes.length > game_known_locs)
        {
          game_known_locs = earth.quakes.length;
          return true;
        }
        game_known_locs = earth.quakes.length;
      }
      lt.LVL_GAME_GUESS_INDEFINITE = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = false;
      l.reset = false;
      l.allow_radii = false;
      l.imask.play_pause = false;
      l.imask.scrubber = false;
      l.imask.origin_flag = false;
      l.imask.earth = false;
      l.imask.earthdrag = false;
      l.imask.select = false;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() { game_guesses++; }
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        if(speed_normal_button.on) ctx.fillText("Watch the quake (click >> to speed up)",100,120);
        else ctx.fillText("Watch the quake",100,120);
      }
      l.advanceTest = function()
      {
        if(earth.t >= earth.recordable_t)
        {
          if(earth.quakes[earth.quakes.length-1].c) cur_level = lt.LVL_GAME_GUESS_CORRECT-1; //jump to correct level
          else cur_level = lt.LVL_GAME_GUESS_INDEFINITE-1; //jump back to indefinite guessing
          return true;
        }
        return false;
      }
      lt.LVL_GAME_GUESS_INDEFINITE_PLAYING = levels.length;
      levels.push(l);

      l = new Level();
      cloneLevel(levels[levels.length-1],l);
      l.return_on_complete = true;
      l.allow_skip_prompt = "Done";
      l.reset = false;
      l.allow_radii = true;
      l.imask.play_pause = true;
      l.imask.scrubber = true;
      l.imask.origin_flag = true;
      l.imask.earth = true;
      l.imask.earthdrag = true;
      l.imask.select = true;
      l.imask.skip = true;
      l.lines = [
      ];
      l.chars = [
      ];
      l.prePromptEvt = function() {}
      l.postPromptEvt = function() {}
      l.drawExtra = function()
      {
        ctx.fillText("Number of guesses:"+game_guesses,100,100);
        ctx.fillText("You've guessed correctly in "+game_guesses+" turns!",100,120);
      }
      l.advanceTest = function()
      {
        return false;
      }
      lt.LVL_GAME_GUESS_CORRECT = levels.length;
      levels.push(l);

      l = new Level();
      l.return_on_complete = true;
      l.reset = true;
      l.GPS = false;
      l.allow_skip_prompt = "Done";
      l.location_success_range = 10;
      l.n_locations = 3;
      l.quake_start_range_s = 0;
      l.quake_start_range_e = 0;
      l.display_quake_start_range = true;
      l.p_waves = false;
      l.quake_selection_r = 0;
      l.deselect_all_on_create = true;
      l.deselect_known_wrongs_on_create = false;
      l.draw_mouse_quake = false;
      l.click_resets_t = true;
      l.variable_quake_t = false;
      l.allow_radii = true;
      l.ghost_countdown = true;
      l.lines = [
        //"This area allows you to play around with <b>random</b> configurations of locations and quakes.",
        //"See if you can figure anything out about <b>what positioning of locations</b> works best, and what doesn't.",
        //"You'll be able to play as many different <b>random scenarios</b> as you'd like-",
        //"Good luck!",
        "This is the playground!",
        "Go ahead and play around with different cities and quakes. See if you can figure anything out about what positioning of locations works best, and what doesn't.",
        "You can play as many scenarios as you want!",
      ];
      l.chars = [
        CHAR_GIRL,
        CHAR_GIRL,
        CHAR_GIRL,
      ];
      l.prePromptEvt = function(){ if(game.heard_freeplay_prompt) levels[lt.LVL_FREE].lines = []; };
      l.postPromptEvt = function(){ game.heard_freeplay_prompt = true; };
      l.drawExtra = function() {}
      l.advanceTest = function() { return false; }
      lt.LVL_FREE = levels.length;
      levels.push(l);
    }

    if(start_level) cur_level = start_level;
    else
    {
      switch(game.start)
      {
        case 0: cur_level = lt.LVL_INTRO_INTRO-1;       break;
        case 1: cur_level = lt.LVL_SP_INTRO-1;          break;
        case 2: cur_level = lt.LVL_BLIND_GUESS_INTRO-1; break;
        case 3: cur_level = lt.LVL_GPS_INTRO-1;         break;
        case 4: cur_level = lt.LVL_GAME_GUESS_1-1;              break;
        case 5: cur_level = lt.LVL_FREE-1;              break;
      }
    }
    cur_prompt_line = 0;

    game_guesses = 0;
    game_known_locs = 0;
    game_drag_a = 0;
    game_drag_b = 0;
    game_drag_c = 0;
    game_drag_n = 0;

    earth = new Earth();
    earth.reset();

    if(record)
    {
      record_button = new ButtonBox(40,10,20,20,function(){ ui_lock = self; if(listener.playing) listener.stop(); else if(listener.recording) listener.play(); else listener.record(); });
      clicker.register(record_button);
    }
    next_button = new ButtonBox(dc.width-100,dc.height-100,80,20,function(){ if(!levels[cur_level].imask.skip || !levels[cur_level].allow_skip_prompt) return; ui_lock = self; self.nextLevel(); });
    clicker.register(next_button);
    scrubber = new Scrubber(earth);
    hoverer.register(scrubber);

    speed_normal_button = new ToggleBox(dc.width-2*scrubber.btn_s, dc.height-scrubber.btn_s, scrubber.btn_s,scrubber.btn_s,true, function(on) { ui_lock = self; if(on) { play_speed = 1.5;   speed_fast_button.on = false; } });
    speed_fast_button   = new ToggleBox(dc.width-1*scrubber.btn_s, dc.height-scrubber.btn_s, scrubber.btn_s,scrubber.btn_s,false,function(on) { ui_lock = self; if(on) { play_speed =   6; speed_normal_button.on = false; } });

    var btn_w = 120;
    desel_quakes_button   = new ButtonBox(btn_w*0, 0, btn_w, 20, function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.deselectQuakes();});
    del_sel_quakes_button = new ButtonBox(btn_w*1, 0, btn_w, 20, function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.deleteSelectedQuakes(); play_state = STATE_PAUSE;});
    del_all_quakes_button = new ButtonBox(btn_w*2, 0, btn_w, 20, function(){ ui_lock = self; if(!levels[cur_level].imask.select) return; earth.deleteQuakes(); play_state = STATE_PAUSE;});

    new_button            = new ButtonBox(0,100,110,20,function(){ ui_lock = self; if(!levels[cur_level].imask.new)    return; earth.reset(); play_state = STATE_PAUSE;});

    clicker.register(speed_normal_button);
    clicker.register(speed_fast_button);
    clicker.register(desel_quakes_button);
    clicker.register(del_sel_quakes_button);
    clicker.register(del_all_quakes_button);
    clicker.register(new_button);
    hoverer.register(earth);
    dragger.register(earth);

    char_disp = [];
    for(var i = 0; i < char_imgs.length; i++)
      char_disp[i] = 0;
    canvdom = new CanvDom();
    //setTimeout(function(){ input_state = IGNORE_INPUT; canvdom.popDismissableMessage('hi',100,100,100,100,dismissed); },100);
    blurb_x = 200;
    blurb_w = dc.width-blurb_x-150;
    blurb_y = dc.height-200;
    blurb_t = 0;
    canvdomhit = {x:0,y:0,w:dc.width,h:dc.height,click:function(evt){canvdom.click(evt);}};

    canvdom_clicker.register(canvdomhit);

    next_input_state = RESUME_INPUT;
    input_state = RESUME_INPUT;

    self.nextLevel(true);
  };

  var dismissed = function()
  {
    cur_prompt_line++;
    if(cur_prompt_line < levels[cur_level].lines.length)
      canvdom.popDismissableMessage(textToLines(dc, "18px Open Sans", blurb_w-20, naiveStripHTML(levels[cur_level].lines[cur_prompt_line])),blurb_x+5,blurb_y,blurb_w-10,200,dismissed);
    else
    {
      next_input_state = RESUME_INPUT;
      levels[cur_level].postPromptEvt();
    }
  }

  self.nextLevel = function(skip_scene_check)
  {
    if(!skip_scene_check) //lazy hack
    {
      if(levels[cur_level].return_on_complete) { game.setScene(2); return; }
    }
    cur_level = (cur_level+1)%levels.length;
    if(levels[cur_level].reset)
      earth.reset();
    levels[cur_level].prePromptEvt();
    if(levels[cur_level].lines.length)
    {
      next_input_state = IGNORE_INPUT;
      cur_prompt_line = 0;
      canvdom.popDismissableMessage(textToLines(dc, "18px Open Sans", blurb_w-20, naiveStripHTML(levels[cur_level].lines[cur_prompt_line])),blurb_x+5,blurb_y,blurb_w-10,200,dismissed);
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

      if(dragger) //because clicker might switch scenes
      {
        //dragger.flush();
        drag_qs = dragger.requestManualFlush();
        self.manuallyFlushQueues();
        dragger.manualFlush();
      }
    }

    ui_lock = undefined;

    if(play_state == STATE_PLAY)
    {
      if(earth.t < earth.recordable_t) earth.t += play_speed;
      if(earth.t > earth.recordable_t) earth.t = earth.recordable_t;
    }

    if(levels[cur_level].advanceTest())
      self.nextLevel();

    input_state = next_input_state;
    if(input_state == IGNORE_INPUT)
    {
      blurb_t = lerp(blurb_t,1,0.2)
      for(var i = 0; i < char_disp.length; i++)
      {
        if(i == levels[cur_level].chars[cur_prompt_line])
          char_disp[i] = lerp(char_disp[i],1,0.1);
        else
          char_disp[i] = lerp(char_disp[i],0,0.1);
      }
    }
    else
    {
      blurb_t = lerp(blurb_t,-0.2,0.2);
      for(var i = 0; i < char_disp.length; i++)
        char_disp[i] = lerp(char_disp[i],0,0.1);
    }
  };

  self.draw = function()
  {
    ctx.font = "18px Open Sans";
    ctx.fillStyle = white;
    ctx.drawImage(bg_img,0,0,dc.width,dc.height);

    earth.draw();

    if(record) record_button.draw(dc);
    if(levels[cur_level].allow_skip_prompt)
    {
      ctx.fillStyle = yellow;
      ctx.fillRect(next_button.x,next_button.y,next_button.w,next_button.h);
      ctx.fillStyle = black;
      ctx.textAlign = "left";
      ctx.fillText(levels[cur_level].allow_skip_prompt,next_button.x+5,next_button.y+15);
    }

    ctx.fillStyle = black;
    ctx.strokeStyle = black;
    ctx.textAlign = "center";
    //speed_buttons
    if(earth.quakes.length && levels[cur_level].imask.select)
    {
      var sel = false;
      for(var i = 0; i < earth.quakes.length && !sel; i++)
        if(earth.quakes[i].selected) sel = true;
      if(sel)
      {
        ctx.fillStyle = black; ctx.fillText("deselect all",desel_quakes_button.x+desel_quakes_button.w/2,desel_quakes_button.y+desel_quakes_button.h-2);
        ctx.fillStyle = black; ctx.fillText("delete selected",del_sel_quakes_button.x+del_sel_quakes_button.w/2,del_sel_quakes_button.y+del_sel_quakes_button.h-2);
      }
      ctx.fillStyle = black; ctx.fillText("delete all",del_all_quakes_button.x+del_all_quakes_button.w/2,del_all_quakes_button.y+del_all_quakes_button.h-2);
    }
    if(levels[cur_level].imask.new)
    {
      ctx.fillStyle = black; ctx.fillText("new",new_button.x+new_button.w/2,new_button.y+new_button.h-2);
    }

    //if(input_state != IGNORE_INPUT) fake_mouse.draw();
    ctx.fillStyle = black;
    ctx.textAlign = "left";
    levels[cur_level].drawExtra();

    if(input_state == IGNORE_INPUT)
    {
      ctx.globalAlpha = .5;
      ctx.fillStyle = white;
      ctx.fillRect(0,0,dc.width,dc.height);
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(grad,0,dc.height-blurb_t*300,dc.width,300);
    for(var i = 0; i < char_imgs.length; i++)
      ctx.drawImage(char_imgs[i], 20, dc.height+10-char_disp[i]*260, 200, 400);
    if(input_state == IGNORE_INPUT)
    {
      ctx.fillStyle = white;
      dc.fillRoundRect(blurb_x-5,blurb_y-5,blurb_w+10,100+10,10);
      ctx.beginPath();
      ctx.moveTo(blurb_x+1 ,blurb_y+70);
      ctx.lineTo(blurb_x-15,blurb_y+90);
      ctx.lineTo(blurb_x+1 ,blurb_y+90);
      ctx.fill();
      canvdom.draw(18,dc);

      var x = blurb_x+blurb_w+15;
      var y = blurb_y+100;
      var w = dc.width-(blurb_x+blurb_w)-25;
      var h = 30;
      ctx.fillStyle = gray;
      ctx.fillRect(x,y+5,w,h);
      ctx.fillStyle = white;
      ctx.fillRect(x,y,w,h);
      ctx.fillStyle = black;
      ctx.fillText("Next",x+5,y+h-5);
    }

    scrubber.draw();
    if(speed_fast_button.on)
    {
      ctx.drawImage(btn_fast_img,speed_fast_button.x  +scrubber.btn_pad,speed_fast_button.y  +scrubber.btn_pad,speed_fast_button.w  -2*scrubber.btn_pad,speed_fast_button.h  -2*scrubber.btn_pad);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(btn_slow_img,speed_normal_button.x+scrubber.btn_pad,speed_normal_button.y+scrubber.btn_pad,speed_normal_button.w-2*scrubber.btn_pad,speed_normal_button.h-2*scrubber.btn_pad);
    }
    else //assume normal selected
    {
      ctx.drawImage(btn_slow_img,speed_normal_button.x+scrubber.btn_pad,speed_normal_button.y+scrubber.btn_pad,speed_normal_button.w-2*scrubber.btn_pad,speed_normal_button.h-2*scrubber.btn_pad);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(btn_fast_img,speed_fast_button.x  +scrubber.btn_pad,speed_fast_button.y  +scrubber.btn_pad,speed_fast_button.w  -2*scrubber.btn_pad,speed_fast_button.h  -2*scrubber.btn_pad);
    }
    ctx.globalAlpha = 1;

  };

  self.cleanup = function()
  {
    hoverer.detach(); hoverer = undefined;
    dragger.detach(); dragger = undefined;
    clicker.detach(); clicker = undefined;
    canvdom_clicker.detach(); canvdom_clicker = undefined;
  };

  var Level = function()
  {
    var self = this;
    self.complete = false;
    self.return_on_complete = false;
    self.reset = true;
    self.GPS = false;
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
    self.move_q_around_p = false;
    self.move_q_around_s = false;
    self.allow_radii = true;
    self.ghost_countdown = false;
    self.imask = new InputMask();
    self.lines = ["what's up?"];
    self.chars = [];
    self.prePromptEvt = function(){};
    self.postPromptEvt = function(){};
    self.drawExtra = function(){};
    self.advanceTest = function(){return false;}
  }

  var InputMask = function()
  {
    var self = this;
    self.play_pause = true;
    self.scrubber = true;
    self.origin_flag = true;
    self.earth = true;
    self.earthdrag = true;
    self.select = true;
    self.new = true;
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
    toLvl.move_q_around_p = fromLvl.move_q_around_p;
    toLvl.move_q_around_s = fromLvl.move_q_around_s;
    toLvl.allow_radii = fromLvl.allow_radii;
    toLvl.ghost_countdown = fromLvl.ghost_countdown;
    toLvl.imask.play_pause = fromLvl.imask.play_pause;
    toLvl.imask.scrubber = fromLvl.imask.scrubber;
    toLvl.imask.origin_flag = fromLvl.imask.origin_flag;
    toLvl.imask.earth = fromLvl.imask.earth;
    toLvl.imask.earthdrag = fromLvl.imask.earthdrag;
    toLvl.imask.select = fromLvl.imask.select;
    toLvl.imask.new = fromLvl.imask.new;
    toLvl.imask.skip = fromLvl.imask.skip;
    toLvl.lines = fromLvl.lines;
    toLvl.chars = fromLvl.chars;
    toLvl.prePromptEvt = fromLvl.prePromptEvt;
    toLvl.postPromptEvt = fromLvl.postPromptEvt;
    toLvl.drawExtra = fromLvl.drawExtra;
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
          l.shape = icon_square_img;
          l.city = city_square_img;
          l.destroy = city_square_destroy_img;
        }
        else if(i == 1)
        {
          if(levels[cur_level].loc_2_x !== undefined) l = new Location(levels[cur_level].loc_2_x,levels[cur_level].loc_2_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
          l.shape = icon_circ_img;
          l.city = city_circ_img;
          l.destroy = city_circ_destroy_img;
        }
        else if(i == 2)
        {
          if(levels[cur_level].loc_3_x !== undefined) l = new Location(levels[cur_level].loc_3_x,levels[cur_level].loc_3_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
          l.shape = icon_tri_img;
          l.city = city_tri_img;
          l.destroy = city_tri_destroy_img;
        }
        else if(i == 3)
        {
          if(levels[cur_level].loc_4_x !== undefined) l = new Location(levels[cur_level].loc_4_x,levels[cur_level].loc_4_y,i);
          else                                        l = new Location(randR(-0.3,0.3),randR(-0.3,0.3),i);
          l.shape = icon_tri_img;
          l.city = city_tri_img;
          l.destroy = city_tri_destroy_img;
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
    self.genQuake = function(wx,wy)
    {
      var q;
      q = new Quake(wx,wy,self.assumed_start_t,self.ghost_quake);
      q.eval_loc_ts(self.locations);
      q.selected = true;
      hov_quak = q;
      hoverer.register(q);
      self.quakes.push(q);
      return q;
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
        if(accomplished) self.ghost_quake.eval_loc_ts(self.locations);
        self.ghost_quake.c = true; //must occur after eval loc ts
        //hack in correct "c_aware_t"
        for(var i = 0; i < self.ghost_quake.location_s_ts.length; i++)
        {
          if(self.ghost_quake.location_s_ts[i] > self.ghost_quake.c_aware_t)
            self.ghost_quake.c_aware_t = self.ghost_quake.location_s_ts[i];
        }
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
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.earth) return;
      if(!self.dragging) return;
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
      {
        self.dragFinish();
      }
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
          var within = ptWithin(obj.x-r/2, obj.y-r/2, obj.w+r, obj.h+r, self.drag_obj.x, self.drag_obj.y); //expanded
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

        var q = self.genQuake(self.drag_obj.wx,self.drag_obj.wy);
        if(levels[cur_level].deselect_all_on_create) self.deselectQuakes();
        if(levels[cur_level].deselect_known_wrongs_on_create) self.deselectKnownWrongQuakes();
        q.selected = true;
        hov_quak = q;
      }

      var min_x = self.drag_origin_obj.wx; if(self.drag_obj.wx < min_x) min_x = self.drag_obj.wx;
      var min_y = self.drag_origin_obj.wy; if(self.drag_obj.wy < min_y) min_y = self.drag_obj.wy;
      var w = Math.abs(self.drag_obj.wx-self.drag_origin_obj.wx);
      var h = Math.abs(self.drag_obj.wy-self.drag_origin_obj.wy);
      for(var i = 0; i < self.quakes.length; i++)
      {
        if(ptWithin(min_x, min_y, w, h, self.quakes[i].wx, self.quakes[i].wy))
        {
          self.quakes[i].selected = true;
        }
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
        if(!levels[cur_level].GPS || earth.t > q.c_aware_t)
        {
          ctx.lineWidth = 5;
          ctx.strokeStyle = red;
          ctx.beginPath();
          ctx.arc(q.cx, q.cy, q.w/2, 0, 2 * Math.PI);
          ctx.stroke();
        }

        if(levels[cur_level].GPS)
        {
          for(var i = 0; i < self.locations.length; i++)
          {
            var l = self.locations[i];
            ellipse.wx = l.wx;
            ellipse.wy = l.wy;
            ellipse.ww = self.t*quake_s_rate; //doesn't need to be "quake_s"- just a constant rate
            ellipse.wh = self.t*quake_s_rate;
            screenSpace(cam,dc,ellipse);
            ctx.strokeStyle = s_color;
            ctx.beginPath();
            ctx.ellipse(l.cx, l.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
            ctx.stroke();
            if(earth.t >= q.location_s_ts[i])
            {
              ellipse.ww = q.location_s_ts[i]*quake_s_rate; //doesn't need to be "quake_s"- just a constant rate
              ellipse.wh = q.location_s_ts[i]*quake_s_rate;
              screenSpace(cam,dc,ellipse);
              ctx.strokeStyle = "#FF8888";
              ctx.beginPath();
              ctx.ellipse(l.cx, l.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
        }
        else
        {
          ellipse.wx = q.wx;
          ellipse.wy = q.wy;
          ellipse.ww = (self.t-q.t)*quake_s_rate;
          ellipse.wh = (self.t-q.t)*quake_s_rate;
          screenSpace(cam,dc,ellipse);
          ctx.strokeStyle = s_color;
          ctx.beginPath();
          ctx.ellipse(q.cx, q.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
          ctx.stroke();

          if(levels[cur_level].p_waves)
          {
            ctx.strokeStyle = p_color;
            ellipse.wx = q.wx;
            ellipse.wy = q.wy;
            ellipse.ww = (self.t-q.t)*quake_p_rate;
            ellipse.wh = (self.t-q.t)*quake_p_rate;
            screenSpace(cam,dc,ellipse);
            ctx.beginPath();
            ctx.ellipse(q.cx, q.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
      }

      var s = 20;
      if(q.c_aware_t < self.t)
      {
        if(q.c) ctx.drawImage(guess_success_img,q.cx-s/2,q.cy-s/2,s,s);
        else    ctx.drawImage(guess_fail_img,q.cx-s/2,q.cy-s/2,s,s);
        q.player_knows_c = true;
      }
      else if(!levels[cur_level].GPS)
        ctx.drawImage(guess_unknown_img,q.cx-s/2,q.cy-s/2,s,s);

    }
    self.drawLoc = function(l,shake_amt)
    {
      var qx = 0;
      var qy = 0;
      var wd = 0.01;
      qx += randR(-1,1)*shake_amt*wd*dc.width;
      qy += randR(-1,1)*shake_amt*wd*dc.width;
      var s = 100;
      ctx.drawImage(l.city,l.cx+qx-s/2,l.cy+qy-s/2,s,s);
      s = 20;
      ctx.drawImage(l.shape,l.cx+qx-s/2,l.cy+qy-s/2,s,s);
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
      ctx.textAlign = "center";

      //draw distance viz
      var l;
      ctx.strokeStyle = black;
      ctx.fillStyle = black;
      ctx.globalAlpha=0.1;
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];

        if(levels[cur_level].allow_radii)
        {
          var x = l.wx-l.rad_obj.wx;
          var y = l.wy-l.rad_obj.wy;
          var d = Math.sqrt(x*x+y*y);

          ctx.lineWidth = dc.height*(quake_p_rate*levels[cur_level].location_success_range); //BAD- ONLY WORKS WHEN cam.wh == 1;
          ellipse.wx = l.wx;
          ellipse.wy = l.wy;
          ellipse.ww = l.rad;
          ellipse.wh = l.rad;
          screenSpace(cam,dc,ellipse);
          ctx.beginPath();
          ctx.ellipse(l.cx,l.cy,ellipse.w,ellipse.h,0,0,2*Math.PI); //circles around locs
          ctx.stroke();

          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(l.cx,l.cy,ellipse.w,ellipse.h,0,0,2*Math.PI); //circles around locs
          ctx.stroke();
          if(l.dragging || l.hovering)
          {
            //not technically an ellipse...
            ctx.beginPath();
            ctx.moveTo(l.cx,l.cy); ctx.lineTo(l.rad_obj.x,l.rad_obj.y); //line
            ctx.stroke();

            if(l.rad != 0)
            {
              var tmp_alpha = ctx.globalAlpha;
              ctx.globalAlpha=1;
              ellipse.wx = l.rad_obj.wx+x/2;
              ellipse.wy = l.rad_obj.wy+y/2;
              ellipse.ww = 0;
              ellipse.wh = 0;
              screenSpace(cam,dc,ellipse);

              ctx.font = "12px Open Sans";
              if(!levels[cur_level].p_waves)
              {
                ctx.fillStyle = white;
                dc.fillRoundRect(ellipse.x-50,ellipse.y-40,100,40,5);
                ctx.fillStyle = s_color;
                ctx.fillText("Time to arrive:",ellipse.x,ellipse.y-22);
                ctx.fillText(timeForT(Math.round(l.rad/quake_s_rate)),ellipse.x,ellipse.y-10);
              }
              else
              {
                ctx.fillStyle = white;
                dc.fillRoundRect(ellipse.x-40,ellipse.y-30,60,80,5);
                ctx.fillStyle = black;
                ctx.fillText("Time to arrive:",ellipse.x,ellipse.y-32);
                ctx.fillStyle = p_color;
                ctx.fillText(timeForT(Math.round(l.rad/quake_p_rate)),ellipse.x,ellipse.y-20);
                ctx.fillStyle = s_color;
                ctx.fillText(timeForT(Math.round(l.rad/quake_s_rate)),ellipse.x,ellipse.y-10);
              }
              ctx.globalAlpha=tmp_alpha;
            }
          }
        }
      }
      ctx.globalAlpha=1;

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

        ctx.fillStyle = black;
        ctx.globalAlpha=0.1;
        ctx.fillRect(min_x,min_y,w,h);
        ctx.globalAlpha=1;
      }

      //draw locations
      var l;
      ctx.strokeStyle = black;
      for(var i = 0; i < self.locations.length; i++)
      {
        l = self.locations[i];
        var shake_amt = 0;

        if(!levels[cur_level].GPS)
        {
          for(var j = 0; j < self.quakes.length; j++)
            if(self.quakes[j].selected) shake_amt += self.quakeShakes(self.quakes[j],i);
          shake_amt += self.quakeShakes(self.ghost_quake,i);
        }

        self.drawLoc(l,shake_amt);
      }

      //draw quakes
      var n_selected = 0;
      for(var i = 0; i < self.quakes.length; i++)
        if(self.quakes[i].selected) n_selected++;
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
        ctx.strokeStyle = black;
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
            ctx.globalAlpha=1-(t_til/200);
            ctx.beginPath();
            ctx.ellipse(l.cx, l.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
            ctx.stroke();
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
              ctx.globalAlpha=1-(t_til/100);
              ctx.beginPath();
              ctx.ellipse(l.cx, l.cy, ellipse.w, ellipse.h, 0, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
          ctx.globalAlpha=1;
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
        self.location_s_hrts[i] = clockForT(Math.round(self.t+(d/quake_s_rate)));
        self.location_p_hrts[i] = clockForT(Math.round(self.t+(d/quake_p_rate)));
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
        if(cur_level >= lt.LVL_GAME_GUESS_1 && cur_level <= lt.LVL_GAME_GUESS_CORRECT)
        {
          //in game- do voodoo
          if(
            (self.i == 0 && game_drag_a) ||
            (self.i == 1 && game_drag_b) ||
            (self.i == 2 && game_drag_c) ||
            game_drag_n < game_guesses
            )
          {
            //good to go
            if(self.i == 0 && !game_drag_a) game_drag_n++;
            if(self.i == 1 && !game_drag_b) game_drag_n++;
            if(self.i == 2 && !game_drag_c) game_drag_n++;
            if(self.i == 0) game_drag_a++;
            if(self.i == 1) game_drag_b++;
            if(self.i == 2) game_drag_c++;
          }
          else return;
        }
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
    self.h = 60;
    self.x = 0;
    self.y = dc.height-self.h;
    self.btn_s = self.h/2;
    self.btn_pad = 5;
    self.y_draw = dc.height-self.btn_s;
    self.y_mid_draw = self.y_draw+(dc.height-self.y_draw)/2;

    self.earth = earth;

    self.play_button  = new ButtonBox(0,         self.y_draw,self.btn_s,self.btn_s,function(){ ui_lock = self; if(!levels[cur_level].imask.play_pause) return; if(self.earth.t == self.earth.recordable_t) self.earth.t = 0; play_state = STATE_PLAY; });
    self.pause_button = new ButtonBox(self.btn_s,self.y_draw,self.btn_s,self.btn_s,function(){ ui_lock = self; if(!levels[cur_level].imask.play_pause) return; play_state = STATE_PAUSE;});
    self.bogus_button = new ButtonBox(0,self.y,self.h,self.h/2,function() { ui_lock = self; return; }); //shoot... why do I need this?
    clicker.register(self.play_button);
    clicker.register(self.pause_button);
    clicker.register(self.bogus_button);
    self.scrub_bar = new Box(self.btn_s*2+5,self.y,self.w-self.btn_s*4-10,self.h);
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
      if(levels[cur_level].imask.scrubber || levels[cur_level].imask.origin_flag)
      {
        var t = Math.round(((evt.doX-self.scrub_bar.x)/self.scrub_bar.w)*self.earth.recordable_t);
        if(levels[cur_level].imask.origin_flag && levels[cur_level].variable_quake_t && evt.doY < self.scrub_bar.y+100 && t-self.earth.assumed_start_t < 50 && t-self.earth.assumed_start_t > -50)
          self.scrub_bar.dragging_quake_start = true;
        self.scrub_bar.dragging = true;
        saved_state = play_state;
        play_state = STATE_PAUSE;
        self.scrub_bar.drag(evt);
      }
    }
    self.scrub_bar.drag = function(evt)
    {
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!self.scrub_bar.dragging) return;
      var t = Math.round(((evt.doX-self.scrub_bar.x)/self.scrub_bar.w)*self.earth.recordable_t)
      if(t < 0) t = 0;
      if(t > self.earth.recordable_t) t = self.earth.recordable_t;
      if(levels[cur_level].imask.origin_flag && self.scrub_bar.dragging_quake_start)
      {
        var goal_t = 0;
        var rate = 0;
        if(levels[cur_level].move_q_around_p) { goal_t = self.earth.quakes[0].location_p_ts[0]; rate = quake_p_rate; }
        if(levels[cur_level].move_q_around_s) { goal_t = self.earth.quakes[0].location_s_ts[0]; rate = quake_s_rate; }
        if(goal_t)
        {
          var td = goal_t - t;
          if(td < 0) { t = goal_t; td = 0; }
          var lx = self.earth.locations[0].wx;
          var qx = lx-td*rate;
          self.earth.quakes[0].eval_pos(qx,self.earth.quakes[0].wy);
          self.earth.quakes[0].t = t;
          self.earth.quakes[0].eval_loc_ts(self.earth.locations);
        }
        self.earth.assumed_start_t = t;
      }
      else if(levels[cur_level].imask.scrubber)
        self.earth.t = t;
    }
    self.scrub_bar.dragFinish = function(evt)
    {
      self.scrub_bar.dragging = false;
      self.scrub_bar.dragging_quake_start = false;
      if(ui_lock && ui_lock != self) return; ui_lock = self;
      if(!levels[cur_level].imask.scrubber && !levels[cur_level].imask.origin_flag) return;
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
      if(range)
      {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = black;
        ctx.fillRect(x-w/2,self.y_draw,w,self.btn_s);
        ctx.globalAlpha = 1;
      }

      if(icon)
      {
        var s = 15;
        y = self.y_mid_draw+3;
        ctx.strokeStyle = black;
        ctx.beginPath();
        ctx.moveTo(x,self.y_draw);
        ctx.lineTo(x,y);
        ctx.stroke();
        ctx.drawImage(icon,x-s/2,y-s/2,s,s);
      }
    }
    self.labelBlip = function(t,hrt)
    {
      var x = self.scrub_bar.xForT(t);
      ctx.fillText(hrt,x,self.y+self.h/2-1);
    }
    self.shapeBlip = function(t,shape)
    {
      var x = self.scrub_bar.xForT(t);
      var y = self.y_mid_draw+3;
      var s = 20;
      ctx.strokeStyle = black;
      ctx.beginPath();
      ctx.moveTo(x,self.y_draw);
      ctx.lineTo(x,y);
      ctx.stroke();
      ctx.drawImage(shape,x-s/2,y-s/2,s,s);
    }
    self.drawAssumedStartBlip = function()
    {
      var w = 304 / 2;
      var h = 58  / 2;
      var x = self.scrub_bar.xForT(self.earth.assumed_start_t);
      ctx.drawImage(origin_tt_img,x-w/2,self.y,w,h);
    }
    self.drawQuakeBlips = function(q,ghost)
    {
      for(var i = 0; i < self.earth.locations.length; i++)
      {
        var draw_s =                               (ghost || self.earth.t > q.location_s_ts[i]);
        var draw_p = (levels[cur_level].p_waves && (ghost || self.earth.t > q.location_p_ts[i]));

        var range = ghost ? levels[cur_level].location_success_range : 0;
        var split = ghost;
        if(draw_s)
        {
          ctx.fillStyle = s_color;
          var icon = q.location_s_cs[i] ? guess_success_img : guess_fail_img;
          self.drawBlip(q.location_s_ts[i],range,split,ghost ? 0 : icon);
        }
        if(draw_p)
        {
          ctx.fillStyle = p_color;
          var icon = q.location_p_cs[i] ? guess_success_img : guess_fail_img;
          self.drawBlip(q.location_p_ts[i],range,split,ghost ? 0 : icon);
        }

        if(false && i == hov_loc_i) //hovering over location
        {
          ctx.fillStyle = black;
          if(draw_s) self.labelBlip(q.location_s_ts[i],q.location_s_hrts[i]);
          if(draw_p) self.labelBlip(q.location_p_ts[i],q.location_p_hrts[i]);
        }
        else if(false && q == hov_quak) //hovering over quake
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
            if(draw_s) self.shapeBlip(q.location_s_ts[i],self.earth.locations[i].shape);
            if(draw_p) self.shapeBlip(q.location_p_ts[i],self.earth.locations[i].shape);
          }
        }
      }
    }
    self.draw = function()
    {
      ctx.textAlign = "center";

      //draw self
      //  yellow
      ctx.fillStyle = yellow;
      ctx.fillRect(self.x,self.y_draw,self.w,self.h);
      //  gray
      ctx.strokeStyle = gray;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(self.x,self.y_draw); ctx.lineTo(self.x+self.w,self.y_draw); ctx.stroke();
      //  black
      ctx.strokeStyle = black;
      ctx.fillStyle = black;
      ctx.beginPath(); ctx.moveTo(self.scrub_bar.x,self.y_draw); ctx.lineTo(self.scrub_bar.x+self.scrub_bar.w,self.y_draw); ctx.stroke();
      ctx.beginPath(); ctx.arc(self.scrub_bar.x,self.y_draw,3,0,2*Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(self.scrub_bar.x+self.scrub_bar.w,self.y_draw,3,0,2*Math.PI); ctx.fill();

      if(levels[cur_level].display_quake_start_range)
      {
        ctx.fillStyle = "#88AAAA";
        var s = self.scrub_bar.w*(levels[cur_level].quake_start_range_s/self.earth.recordable_t);
        var e = self.scrub_bar.w*(levels[cur_level].quake_start_range_e/self.earth.recordable_t);
        ctx.fillRect(self.scrub_bar.x+s,self.y+self.h/2,e-s,self.h/2);
      }

/*
      if(self.scrub_bar.hovering && !self.scrub_bar.dragging)
      {
        ctx.fillStyle = "#888888";
        self.drawBlip(self.scrub_bar.hovering_t,0,0,0);
        ctx.fillStyle = black;
        self.labelBlip(self.scrub_bar.hovering_t,clockForT(Math.round(self.scrub_bar.hovering_t)));
      }
*/

      if(hov_loc && hov_loc.rad)
      {
        ctx.globalAlpha=1;
        var range = levels[cur_level].location_success_range;
        ctx.fillStyle = "#222222";
        self.drawBlip(hov_loc.rad/quake_s_rate,range,true,0);
        ctx.globalAlpha=1;
      }

      self.drawQuakeBlips(self.earth.ghost_quake,true);
      for(var i = 0; i < self.earth.quakes.length; i++)
        if(self.earth.quakes[i].selected || self.earth.quakes[i] == hov_quak) self.drawQuakeBlips(self.earth.quakes[i],false)
      ctx.globalAlpha=1;

      if(levels[cur_level].display_quake_start_range)
        self.drawAssumedStartBlip();

      ctx.drawImage(btn_play_img,self.play_button.x+self.btn_pad,self.play_button.y+self.btn_pad,self.play_button.w-2*self.btn_pad,self.play_button.h-2*self.btn_pad);
      ctx.drawImage(btn_pause_img,self.pause_button.x+self.btn_pad,self.pause_button.y+self.btn_pad,self.pause_button.w-2*self.btn_pad,self.pause_button.h-2*self.btn_pad);

      var x = self.scrub_bar.xForT(self.earth.t);
      var w = 126 * 2/5;
      var h = 74  * 2/5;
      var y = self.y_draw-h+8;
      ctx.drawImage(play_head_img,x-w/2,y,w,h);
      ctx.textAlign = "center";
      ctx.font = "12px Open Sans";
      ctx.fillStyle = black;
      ctx.fillText(clockForT(Math.round(self.earth.t)),x,y+12);
    }
  }

  var timeForT = function(t)
  {
    var hrs = (Math.floor(t/60)%24);
    var mins = t%60;
    if(mins < 10) mins = "0"+mins;
    if(!hrs) return mins+" minutes";
    return hrs+"h "+mins+"m";
  }
  var clockForT = function(t)
  {
    var hrs = (Math.floor(t/60)%24);
    var mins = t%60;
    if(mins < 10) mins = "0"+mins;
    var post = "AM";
    if(hrs > 11) post = "PM"
    hrs = hrs%12;
    if(hrs == 0) hrs = 12;
    return hrs+":"+mins+post;
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

var grad = GenIcon(100,100);
var grd=grad.context.createLinearGradient(0,0,0,grad.height);
grd.addColorStop(0,"rgba(99,228,248,0)");
grd.addColorStop(0.5,"rgba(99,228,248,1)");
grad.context.fillStyle = grd;
grad.context.fillRect(0,0,grad.width,grad.height);

