var Game = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  self.intro_complete = false;
  self.sp_complete = false;
  self.triangulate_complete = false;
  self.gps_complete = false;

  var stage = new Stage({width:init.width,height:init.height,container:init.container});
  var scenes = [
    new NullScene(self, stage),
    new LoadingScene(self, stage),
    new ComicScene(self, stage),
    /*new TestScene(self, stage),*/
    new ChooseScene(self, stage),
    new GamePlayScene(self, stage),
  ];
  var cur_scene = 0;
  var old_cur_scene = -1;

  self.start = 0;
  self.heard_freeplay_prompt = false;

  self.begin = function()
  {
    self.nextScene();
    tick();
  };

  var tick = function()
  {
    requestAnimFrame(tick,stage.dispCanv.canvas);
    //stage.clear();
    scenes[cur_scene].tick();
    if(old_cur_scene == cur_scene) //still in same scene- draw
    {
      scenes[cur_scene].draw();
      stage.draw(); //blits from offscreen canvas to on screen one
    }
    old_cur_scene = cur_scene;
  };

  self.nextScene = function()
  {
    self.setScene(cur_scene+1);
  };

  self.setScene = function(i)
  {
    scenes[cur_scene].cleanup();
    cur_scene = i;
    scenes[cur_scene].ready();
  }

};

