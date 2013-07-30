(function(){
  var Tooltip;
  window.Tooltip = Tooltip = (function(){
    Tooltip.displayName = 'Tooltip';
    var prototype = Tooltip.prototype, constructor = Tooltip;
    function Tooltip(options){
      var ref$;
      this.options = options != null
        ? options
        : {};
      this.onMouseMove = bind$(this, 'onMouseMove', prototype);
      (ref$ = this.options).parent == null && (ref$.parent = $('body'));
      this.createElement();
      $(document).bind('mousemove', this.onMouseMove);
    }
    prototype.watchElements = function(){
      var this$ = this;
      $(document).on('mouseover', "[data-tooltip]", function(evt){
        var currentTarget;
        currentTarget = evt.currentTarget;
        return this$.display("<p>" + $(currentTarget).data('tooltip') + "</p>");
      });
      return $(document).on('mouseout', "[data-tooltip]", bind$(this, 'hide'));
    };
    prototype.display = function($content, mouseEvent){
      var x$;
      this.$element.empty();
      x$ = this.$element;
      x$.append($content);
      x$.appendTo(this.options.parent);
      return this.setPosition();
    };
    prototype.hide = function(){
      this.$element.detach();
      return this.mouseBound = false;
    };
    prototype.reposition = function(arg$){
      var left, top, clientLeft, clientTop, dX, dY, width, maxLeft, topMargin, x$;
      left = arg$[0], top = arg$[1], clientLeft = arg$[2], clientTop = arg$[3];
      dX = left - clientLeft;
      dY = top - clientTop;
      width = this.$element.width();
      left -= width / 2;
      maxLeft = $(window).width() - width - 10;
      top -= this.$element.height();
      left = Math.max(dX + 10, left);
      left = Math.min(left, dX + maxLeft);
      if (top <= 10 + dY) {
        topMargin = parseInt(this.$element.css('margin-top'));
        top += this.$element.height() - 2 * topMargin;
      }
      x$ = this.$element;
      x$.css('left', left);
      x$.css('top', top);
      return x$;
    };
    prototype.createElement = function(){
      return this.$element = $("<div class='tooltip' />");
    };
    prototype.setPosition = function(){
      if (this.options.positionElement) {
        return this.setPositionByElement();
      } else {
        return this.setPositionByMouse();
      }
    };
    prototype.setPositionByElement = function(){
      var $parent, ref$, left, top;
      $parent = this.options.positionElement;
      ref$ = $parent.offset(), left = ref$.left, top = ref$.top;
      left += this.options.positionElement.width() / 2;
      return this.reposition([left, top]);
    };
    prototype.setPositionByMouse = function(){
      this.mouseBound = true;
      return this.reposition(this.lastMousePosition);
    };
    prototype.onMouseMove = function(evt){
      this.lastMousePosition = [evt.pageX, evt.pageY, evt.clientX, evt.clientY];
      if (this.mouseBound) {
        return this.reposition(this.lastMousePosition);
      }
    };
    return Tooltip;
  }());
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
