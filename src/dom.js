var Dom = function()
{
  var self = this;

  var m;
  var c;

  var mclicked = function(evt)
  {
    m.removeEventListener('click',mclicked);
    document.body.removeChild(m);
    m = undefined;
    if(c) c();
    c = undefined;
  }

  self.popDismissableMessageOnEl = function(text,x,y,w,h,el,callback)
  {
    //javascript tho
    var box = el.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    x = x+left;
    y = y+top;
    self.popDismissableMessage(text,x,y,w,h,callback);
  }
  self.popDismissableMessage = function(text,x,y,w,h,callback)
  {
    if(m) mclicked();
    c = callback;
    m = document.createElement('div');
    m.innerHTML = text;
    m.style.position = 'absolute';
    m.style.top = y+'px';
    m.style.left = x+'px';
    m.style.width = w+'px';
    m.style.height = h+'px';

    m.style.backgroundColor = 'red';

    m.addEventListener('click',mclicked);
    document.body.appendChild(m);
  }
}

