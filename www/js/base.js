(function(){
  var tooltip, isPersonChanged, orderByChanged, orderByOriginal;
  tooltip = new Tooltip();
  window.init = function(data){
    var margin, width, height, x, color, x$, svg, y$, drawing, res$, department, staff, size, maxSize, notNormalizedPersonHeight, y, departments, z$, departmentBar, z1$, rectangles, redraw;
    margin = {
      top: 20,
      right: 100,
      bottom: 30,
      left: 40
    };
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    x = d3.scale.ordinal().rangeRoundBands([0, width], 0.01);
    color = d3.scale.ordinal().range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00', '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
    x$ = svg = d3.select("body").append("svg");
    x$.attr('width', width + margin.left + margin.right);
    x$.attr('height', height + margin.top + margin.bottom);
    y$ = drawing = svg.append("g");
    y$.attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
    res$ = [];
    for (department in data) {
      staff = data[department];
      size = staff.length;
      staff.forEach(fn$);
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
    z$ = departmentBar = svg.selectAll(".department").data(data).enter().append("g");
    z$.attr('class', 'department');
    z$.attr('transform', function(it){
      return "translate(" + x(it.department) + ", 0)";
    });
    z1$ = rectangles = departmentBar.selectAll("rect").data(function(it){
      return it.staff;
    }).enter().append("rect");
    z1$.attr('width', x.rangeBand());
    z1$.on('mouseover', function(person){
      var content;
      content = (function(){
        switch (false) {
        case !isPersonChanged(person):
          return "<h3>Puvodne: </h3>\n<p class='from'>" + person[6] + " " + person[7] + " " + person[8] + " " + person[9] + " (" + person[11] + ")</p>\n<h3>Nastupce: </h3>\n<p class='to'>" + person[14] + " " + person[15] + " " + person[16] + " " + person[17] + " (" + person[19] + ")</p>";
        default:
          return "<span class='only'>" + person[6] + " " + person[7] + " " + person[8] + " " + person[9] + "</span>";
        }
      }());
      return tooltip.display(content);
    });
    z1$.on('mouseout', function(){
      return tooltip.hide();
    });
    z1$.attr('class', function(person){
      switch (false) {
      case !isPersonChanged(person):
        return "new";
      default:
        return "old";
      }
    });
    redraw = function(normalized, sorted){
      if (normalized) {
        y.domain([0, 1]);
      } else {
        y.domain([0, maxSize]);
      }
      data.forEach(function(it){
        it.staff.sort(orderByOriginal);
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
        return nextPersonY - person.y;
      });
    };
    return redraw(true);
    function fn$(person, index){
      return person.originalIndex = index;
    }
  };
  isPersonChanged = function(person){
    return !!person[16];
  };
  orderByChanged = function(personA, personB){
    var a, b;
    a = isPersonChanged(personA) ? 1 : 0;
    b = isPersonChanged(personB) ? 1 : 0;
    return b - a;
  };
  orderByOriginal = function(personA, personB){
    return personA.originalIndex - personB.originalIndex;
  };
}).call(this);
