(function(){
  window.init = function(data){
    var margin, width, height, x, y, color, x$, svg, y$, drawing, res$, department, staff, size, departments, z$, departmentBar, z1$;
    margin = {
      top: 20,
      right: 100,
      bottom: 30,
      left: 40
    };
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    y = d3.scale.linear().rangeRound([0, height]);
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
      res$.push({
        department: department,
        staff: staff,
        size: size
      });
    }
    data = res$;
    console.log(data);
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
      return y(index / data[parentIndex].size);
    });
    z1$.attr('height', function(person, index, parentIndex){
      return height / data[parentIndex].size;
    });
    z1$.style('fill', 'red');
    return z1$;
  };
}).call(this);
