(function(){
  var tooltip, x$, perElementTooltip, capableBrowser, annotatePerson, isPersonChanged, getPersonPosition, orderByChanged, orderByOriginal, orderByImportance, bindActions, onSelectionChanged;
  tooltip = new Tooltip();
  x$ = perElementTooltip = new Tooltip;
  x$.watchElements();
  capableBrowser = Modernizr.inlinesvg;
  if (capableBrowser) {
    $('#content, #fallback').removeClass('incapable');
  }
  window.init = function(data){
    var margin, width, height, x, color, x$, svg, y$, drawing, res$, department, staff, size, maxSize, notNormalizedPersonHeight, y, departments, z$, z1$, departmentBar, z2$, rectangles, xAxis, z3$, z4$, yAxis, drawYAxis, hideYAxis;
    if (!capableBrowser) {
      return;
    }
    margin = {
      top: 10,
      right: 90,
      bottom: 90,
      left: 10
    };
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    x = d3.scale.ordinal().rangeRoundBands([0, width], 0.01);
    color = d3.scale.ordinal().range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00', '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
    x$ = svg = d3.select('#content').append("svg");
    x$.attr('width', width + margin.left + margin.right);
    x$.attr('height', height + margin.top + margin.bottom);
    y$ = drawing = svg.append("g");
    y$.attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
    res$ = [];
    for (department in data) {
      staff = data[department];
      size = staff.length;
      staff.forEach(annotatePerson);
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
    color.domain(departments);
    x.domain(departments);
    z$ = drawing.append("rect");
    z$.attr('class', 'rasterBackground');
    z$.attr('x', 4);
    z$.attr('width', width - 9);
    z$.attr('height', height);
    z1$ = departmentBar = drawing.selectAll(".department").data(data).enter().append("g");
    z1$.attr('class', 'department');
    z1$.attr('transform', function(it){
      return "translate(" + x(it.department) + ", 0)";
    });
    z2$ = rectangles = departmentBar.selectAll("rect").data(function(it){
      return it.staff;
    }).enter().append("rect");
    z2$.attr('width', x.rangeBand());
    z2$.on('mouseover', function(person){
      var content, fromString, toString;
      content = "<h2>" + getPersonPosition(person) + "</h2>";
      content += (function(){
        switch (false) {
        case !isPersonChanged(person):
          fromString = person[6] + " " + person[7] + " " + person[8] + " " + person[9];
          if (person[11]) {
            fromString += "(" + person[11] + ")";
          }
          toString = person[14] + " " + person[15] + " " + person[16] + " " + person[17];
          if (person[19]) {
            toString += "(" + person[19] + ")";
          }
          return "<h3>Pùvodnì: </h3>\n<p class='from'>" + fromString + "</p>\n<h3>Nástupce: </h3>\n<p class='to'>" + toString + "</p>";
        default:
          return "<span class='only'>" + person[6] + " " + person[7] + " " + person[8] + " " + person[9] + "</span>";
        }
      }());
      return tooltip.display(content);
    });
    z2$.on('mouseout', function(){
      return tooltip.hide();
    });
    z2$.attr('class', function(person){
      switch (false) {
      case !isPersonChanged(person):
        return "new";
      default:
        return "old";
      }
    });
    xAxis = drawing.append("g");
    z3$ = departmentBar = xAxis.selectAll("text").data(data).enter().append("text");
    z3$.text(function(it){
      return it.department;
    });
    z3$.attr('transform', function(it){
      return "translate(" + (x(it.department) + x.rangeBand() / 2) + ", " + (height + 15) + "),rotate(-45)";
    });
    z3$.attr('text-anchor', 'end');
    window.redraw = function(normalized, sortMethod){
      if (normalized) {
        y.domain([0, 1]);
      } else {
        y.domain([0, maxSize]);
      }
      if (sortMethod == 'changed' || sortMethod == 'importance') {
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
      return rectangles.each(function(person, index, parentIndex){
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
    };
    z4$ = yAxis = drawing.append("g");
    z4$.attr('transform', "translate(" + width + ", 0)");
    z4$.attr('class', 'yAxis');
    drawYAxis = function(normalized, sortMethod){
      var yAxisTicks;
      yAxis.transition().duration(500).attr('opacity', 1);
      yAxisTicks = d3.svg.axis().orient('right').scale(y).tickFormat(function(it){
        if (sortMethod === 'importance') {
          switch (it) {
          case 0:
            return "Ministøi";
          case 0.2:
            return "Námìstci";
          case 0.4:
            return "Odbory";
          case 0.9:
            return "Nižší mgmt.";
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
    redraw(true, 'changed');
    return bindActions();
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
    var position, i$, ref$, len$, i, that, results$ = [];
    position = null;
    for (i$ = 0, len$ = (ref$ = [0, 1, 2, 3, 4, 5]).length; i$ < len$; ++i$) {
      i = ref$[i$];
      if (that = person[i]) {
        results$.push(position = that);
      }
    }
    return results$;
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
  bindActions = function(){
    $(document).on('click', '.selector li', function(evt){
      var $ele;
      evt.preventDefault();
      $ele = $(this);
      $.scrollTo($ele, {
        duration: 200
      });
      if ($ele.hasClass('active')) {
        return;
      }
      $ele.parent().find("li").removeClass('active');
      $ele.addClass('active');
      return onSelectionChanged();
    });
    return $(document).on('click', '.backFromGallery', function(evt){
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
    var sort, normalized;
    sort = $('#sortSelector li.active').data('content');
    normalized = true;
    return redraw(normalized, sort);
  };
}).call(this);
