var bg_img = new Image();
var city_circ_destroy_img = new Image();
var city_circ_img = new Image();
var city_square_destroy_img = new Image();
var city_square_img = new Image();
var city_tri_destroy_img = new Image();
var city_tri_img = new Image();
var btn_fast_img = new Image();
var btn_next_img = new Image();
var btn_pause_img = new Image();
var btn_play_img = new Image();
var btn_slow_img = new Image();
var guess_fail_img = new Image();
var guess_success_img = new Image();
var guess_unknown_img = new Image();
var icon_circ_img = new Image();
var icon_square_img = new Image();
var icon_tri_img = new Image();
var origin_tt_img = new Image();
var play_head_img = new Image();

var comic_img = new Image();
var btn_intro_img = new Image();
var btn_sp_img = new Image();
var btn_triangulate_img = new Image();
var btn_gps_img = new Image();
var btn_game_img = new Image();
var btn_free_img = new Image();
var menu_grad_img = new Image();
var menu_logo_img = new Image();

var char_imgs;

var bake = function()
{
  bg_img.src = "assets/bg.png";
  city_circ_destroy_img.src = "assets/city_circ_destroy.png";
  city_circ_img.src = "assets/city_circ.png";
  city_square_destroy_img.src = "assets/city_square_destroy.png";
  city_square_img.src = "assets/city_square.png";
  city_tri_destroy_img.src = "assets/city_tri_destroy.png";
  city_tri_img.src = "assets/city_tri.png";
  btn_fast_img.src = "assets/btn_fast.png";
  btn_next_img.src = "assets/btn_next.png";
  btn_pause_img.src = "assets/btn_pause.png";
  btn_play_img.src = "assets/btn_play.png";
  btn_slow_img.src = "assets/btn_slow.png";
  guess_fail_img.src = "assets/guess_fail.png";
  guess_success_img.src = "assets/guess_success.png";
  guess_unknown_img.src = "assets/guess_unknown.png";
  icon_circ_img.src = "assets/icon_circ.png";
  icon_square_img.src = "assets/icon_square.png";
  icon_tri_img.src = "assets/icon_tri.png";
  origin_tt_img.src = "assets/origin_tt.png";
  play_head_img.src = "assets/play_head.png";

  comic_img.src = "assets/comic.png";
  btn_intro_img.src = "assets/btn_intro.png";
  btn_sp_img.src = "assets/btn_sp.png";
  btn_triangulate_img.src = "assets/btn_triangulate.png";
  btn_gps_img.src = "assets/btn_gps.png";
  btn_game_img.src = "assets/btn_game.png";
  btn_free_img.src = "assets/btn_free.png";

  menu_grad_img.src = "assets/menu/menu_gradient.png";
  menu_logo_img.src = "assets/menu/menu_logo.png";

  char_imgs = [];
  for(var i = 0; i < 7; i++)
  {
    char_imgs[i] = new Image();
    char_imgs[i].src = "assets/chars/face/char_"+i+".png";
  }
}

