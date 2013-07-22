(function(){
  window.init = function(data){
    var margin, width, height, x, color, normalized, x$, svg, y$, drawing, res$, department, staff, size, maxSize, notNormalizedPersonHeight, y, departments, z$, departmentBar, z1$;
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
    normalized = true;
    x$ = svg = d3.select("body").append("svg");
    x$.attr('width', width + margin.left + margin.right);
    x$.attr('height', height + margin.top + margin.bottom);
    y$ = drawing = svg.append("g");
    y$.attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
    res$ = [];
    for (department in data) {
      staff = data[department];
      size = staff.length;
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
    if (!normalized) {
      y.domain([0, maxSize]);
    }
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
    z1$ = departmentBar.selectAll("rect").data(function(it){
      return it.staff;
    }).enter().append("rect");
    z1$.attr('width', x.rangeBand());
    z1$.attr('y', function(person, index, parentIndex){
      if (normalized) {
        return y(index / data[parentIndex].size);
      } else {
        return y(maxSize - index);
      }
    });
    z1$.attr('height', function(person, index, parentIndex){
      if (normalized) {
        return height / data[parentIndex].size + 1;
      } else {
        return notNormalizedPersonHeight + 1;
      }
    });
    z1$.attr('title', function(person){
      return person[6] + " " + person[7] + " " + person[8] + " " + person[9];
    });
    z1$.style('fill', function(person){
      switch (false) {
      case !person[17]:
        return '#98abc5';
      default:
        return '#6b486b';
      }
    });
    return z1$;
  };
}).call(this);
