(function(){
  var tooltip, x$, perElementTooltip, capableBrowser, drawGraph, normalizePerson, annotatePerson, isPersonChanged, getPersonPosition, orderByChanged, orderByOriginal, orderByImportance;
  tooltip = new Tooltip();
  x$ = perElementTooltip = new Tooltip;
  x$.watchElements();
  capableBrowser = Modernizr.inlinesvg;
  if (capableBrowser) {
    $('.incapable').removeClass('incapable');
  }
  window.init = function(data){
    var index, data_ministerstva, data_firmy, name, content, target;
    if (!capableBrowser) {
      return;
    }
    index = 0;
    data_ministerstva = {};
    data_firmy = {};
    for (name in data) {
      content = data[name];
      target = index < 11 ? data_firmy : data_ministerstva;
      target[name] = content;
      index++;
    }
    drawGraph(data_ministerstva, '#ministerstva');
    return drawGraph(data_firmy, '#firmy');
  };
  drawGraph = function(data, parentSelector){
    var margin, baseHeight, width, height, x, x$, svg, y$, drawing, res$, department, staff, escaped, size, currentTitles, i$, len$, index, person, j$, ref$, len1$, i, title, maxSize, notNormalizedPersonHeight, y, departments, z$, z1$, background, z2$, departmentBar, z3$, rectangles, xAxis, z4$, redraw, z5$, yAxis, drawYAxis, hideYAxis, bindActions, onSelectionChanged;
    margin = {
      top: 10,
      right: 90,
      bottom: 100,
      left: 10
    };
    baseHeight = parentSelector === '#ministerstva' ? 500 : 300;
    width = 960 - margin.left - margin.right;
    height = baseHeight - margin.top - margin.bottom;
    x = d3.scale.ordinal().rangeRoundBands([0, width], 0.02);
    x$ = svg = d3.select(parentSelector).append("svg");
    x$.attr('width', width + margin.left + margin.right);
    x$.attr('height', height + margin.top + margin.bottom);
    y$ = drawing = svg.append("g");
    y$.attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
    res$ = [];
    for (department in data) {
      staff = data[department];
      escaped = escape(department);
      if ("Pl%E1n" === escaped || department === '') {
        continue;
      }
      size = staff.length;
      currentTitles = [];
      for (i$ = 0, len$ = staff.length; i$ < len$; ++i$) {
        index = i$;
        person = staff[i$];
        person.fulltitles = [];
        for (j$ = 0, len1$ = (ref$ = [0, 1, 2, 3, 4, 5]).length; j$ < len1$; ++j$) {
          i = ref$[j$];
          title = person[i];
          if (!title) {
            person.fulltitles[i] = currentTitles[i];
          } else {
            currentTitles[i] = title;
            break;
          }
        }
        annotatePerson(person, index);
      }
      res$.push({
        department: department,
        staff: staff,
        size: size
      });
    }
    data = res$;
    maxSize = Math.max.apply(Math, data.map(function(it){
      return it.size;
    }));
    notNormalizedPersonHeight = height / maxSize;
    y = d3.scale.linear().rangeRound([0, height]);
    departments = data.map(function(it){
      return it.department;
    });
    x.domain(departments);
    z$ = drawing.append("rect");
    z$.attr('class', 'rasterBackground');
    z$.attr('x', 4);
    z$.attr('width', width - 9);
    z$.attr('height', height);
    z1$ = background = drawing.selectAll(".departmentBackground").data(data).enter().append("rect");
    z1$.attr('class', 'departmentBackground');
    z1$.attr('width', x.rangeBand());
    z1$.attr('x', function(it){
      return x(it.department);
    });
    z2$ = departmentBar = drawing.selectAll(".department").data(data).enter().append("g");
    z2$.attr('class', 'department');
    z2$.attr('transform', function(it){
      return "translate(" + x(it.department) + ", 0)";
    });
    z3$ = rectangles = departmentBar.selectAll("rect").data(function(it){
      return it.staff;
    }).enter().append("rect");
    z3$.attr('width', x.rangeBand());
    z3$.on('mouseover', function(person){
      var content, fromString, toString;
      content = "<h2>" + getPersonPosition(person) + "</h2>";
      content += (function(){
        switch (false) {
        case !isPersonChanged(person):
          fromString = person[6] + " " + person[7] + " " + person[8] + " " + person[9];
          if (person[11]) {
            fromString += " (" + person[11] + ")";
          }
          toString = person[14] + " " + person[15] + " " + person[16] + " " + person[17];
          if (person[19]) {
            toString += " (" + person[19] + ")";
          }
          return "<h3>Původně: </h3>\n<p class='from'>" + fromString + "</p>\n<h3>Nástupce: </h3>\n<p class='to'>" + toString + "</p>";
        default:
          return "<span class='only'>" + person[6] + " " + person[7] + " " + person[8] + " " + person[9] + "</span>";
        }
      }());
      return tooltip.display(content);
    });
    z3$.on('mouseout', function(){
      return tooltip.hide();
    });
    z3$.attr('class', function(person){
      switch (false) {
      case !isPersonChanged(person):
        return "new";
      default:
        return "old";
      }
    });
    xAxis = drawing.append("g");
    z4$ = departmentBar = xAxis.selectAll("text").data(data).enter().append("text");
    z4$.text(function(it){
      return it.department;
    });
    z4$.attr('transform', function(it){
      return "translate(" + (x(it.department) + x.rangeBand() / 2) + ", " + (height + 15) + "),rotate(-45)";
    });
    z4$.attr('text-anchor', 'end');
    redraw = function(normalized, sortMethod){
      var x$;
      if (normalized) {
        y.domain([0, 1]);
      } else {
        y.domain([0, maxSize]);
      }
      if (sortMethod === 'changed') {
        drawYAxis(normalized, sortMethod);
      } else {
        hideYAxis();
      }
      data.forEach(function(it){
        var sortFunction;
        sortFunction = (function(){
          switch (sortMethod) {
          case 'changed':
            return orderByChanged;
          case 'importance':
            return orderByImportance;
          default:
            return orderByOriginal;
          }
        }());
        it.staff.sort(sortFunction);
        return it.staff.forEach(function(person, index){
          return person.next = it.staff[index + 1];
        });
      });
      rectangles.each(function(person, index, parentIndex){
        index = data[parentIndex].staff.indexOf(person);
        return person.y = (function(){
          switch (normalized) {
          case true:
            return y(index / data[parentIndex].size);
          case false:
            return y(index + (maxSize - data[parentIndex].size));
          }
        }());
      }).transition().duration(500).delay(function(person, index, parentIndex){
        return parentIndex * 20;
      }).attr('y', function(person){
        return person.y;
      }).attr('height', function(person, index, parentIndex){
        var nextPersonY, that;
        nextPersonY = (function(){
          switch (false) {
          case !(that = person.next):
            return that.y;
          default:
            return height;
          }
        }());
        return nextPersonY - person.y - 0.5;
      });
      x$ = background;
      x$.attr('y', function(department){
        return department.staff[0].y;
      });
      x$.attr('height', function(department){
        return height - department.staff[0].y;
      });
      return x$;
    };
    z5$ = yAxis = drawing.append("g");
    z5$.attr('transform', "translate(" + width + ", 0)");
    z5$.attr('class', 'yAxis');
    drawYAxis = function(normalized, sortMethod){
      var yAxisTicks;
      yAxis.transition().duration(500).attr('opacity', 1);
      yAxisTicks = d3.svg.axis().orient('right').scale(y).tickFormat(function(it){
        if (sortMethod === 'importance') {
          switch (it) {
          case 0:
            return "Ministři";
          case 0.2:
            return "Náměstci";
          case 0.4:
            return "Odbory";
          default:
            return "";
          }
        } else {
          if (normalized) {
            return (100 - it * 100) + "%";
          } else {
            return y.domain()[1] - it;
          }
        }
      });
      return yAxis.call(yAxisTicks);
    };
    hideYAxis = function(){
      return yAxis.transition().duration(500).attr('opacity', 0);
    };
    bindActions = function(){
      $(parentSelector).on('click', '.selector li', function(evt){
        var $ele;
        evt.preventDefault();
        $ele = $(this);
        $.scrollTo($ele, {
          duration: 200,
          axis: 'y'
        });
        if ($ele.hasClass('active')) {
          return;
        }
        $ele.parent().find("li").removeClass('active');
        $ele.addClass('active');
        return onSelectionChanged();
      });
      return $(parentSelector).on('click', '.backFromGallery', function(evt){
        var x$;
        if (history.length > 1) {
          history.back();
        } else {
          window.location = $(this).find('a').attr('href');
        }
        x$ = evt;
        x$.preventDefault();
        x$.stopPropagation();
        return x$;
      });
    };
    onSelectionChanged = function(){
      var selector, sort, normalized;
      selector = parentSelector + ' .selector li.active';
      sort = $(selector).data('content');
      normalized = false;
      return redraw(normalized, sort);
    };
    redraw(false, 'changed');
    return bindActions();
  };
  normalizePerson = function(person, department){
    var shift, i$, x$, ref$, len$;
    shift = (function(){
      switch (department) {
      case '%u0160kolstv%ED':
        return 2;
      case 'Kultura':
        return 2;
      case '%u017Divotn%ED%20prost%u0159ed%ED':
        return 2;
      case 'M%EDstn%ED%20rozvoj':
        return 2;
      case 'Spravedlnost':
        return 3;
      case 'Obrana':
        return 3;
      case 'Zem%u011Bd%u011Blstv%ED':
        return 3;
      case 'Doprava':
        return 0;
      case 'Vl%E1da%20+%20Premi%E9r':
        return 3;
      case 'Pr%u016Fmysl%20a%20obchod':
        return 2;
      case 'Finance':
        return 2;
      case 'Vnitro':
        return 1;
      default:
        return 0;
      }
    }());
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      x$ = ref$[i$];
      person.unshift("");
    }
    return person;
    function fn$(){
      var i$, to$, results$ = [];
      for (i$ = 0, to$ = shift; i$ < to$; ++i$) {
        results$.push(i$);
      }
      return results$;
    }
  };
  annotatePerson = function(person, index){
    person.originalIndex = index;
    return person.positionImportance = (function(){
      switch (false) {
      case !person[0]:
        return 0;
      case !person[1]:
        return 1;
      case !person[2]:
        return 2;
      case !person[3]:
        return 3;
      case !person[4]:
        return 4;
      case !person[5]:
        return 5;
      default:
        return 6;
      }
    }());
  };
  isPersonChanged = function(person){
    return !!person[16];
  };
  getPersonPosition = function(person){
    var position, i$, ref$, len$, i, that;
    position = null;
    for (i$ = 0, len$ = (ref$ = [0, 1, 2, 3, 4, 5]).length; i$ < len$; ++i$) {
      i = ref$[i$];
      if (that = person[i]) {
        position = that;
      }
    }
    return position;
  };
  orderByChanged = function(personA, personB){
    var a, b, that;
    a = isPersonChanged(personA) ? 1 : 0;
    b = isPersonChanged(personB) ? 1 : 0;
    if (that = a - b) {
      return that;
    } else {
      return (-1) * orderByImportance(personA, personB);
    }
  };
  orderByOriginal = function(personA, personB){
    return personA.originalIndex - personB.originalIndex;
  };
  orderByImportance = function(personA, personB){
    return personA.positionImportance - personB.positionImportance;
  };
}).call(this);
