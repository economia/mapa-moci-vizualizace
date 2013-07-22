window.init = (data) ->
    margin =
        top: 20
        right: 100
        bottom: 30
        left: 40
    width = 960 - margin.left - margin.right
    height = 500 - margin.top - margin.bottom
    x = d3.scale.ordinal!rangeRoundBands [0, width], 0.1
    y = d3.scale.linear!rangeRound [0, height]
    color = d3.scale.ordinal!range ['#98abc5' '#8a89a6' '#7b6888' '#6b486b' '#a05d56' '#d0743c' '#ff8c00' ] * 2

    svg = d3.select "body" .append "svg"
        ..attr \width width + margin.left + margin.right
        ..attr \height height + margin.top + margin.bottom
    drawing = svg.append "g"
        ..attr \transform "translate(#{margin.left}, #{margin.top})"

    data = for department, staff of data
        # lidi.forEach (clovek) ->
        #     console.log clovek[17]
        # staff.length = 20
        size = staff.length
        {department, staff, size}
    console.log data
    departments = data.map (.department)
    color.domain departments
    x.domain departments
    departmentBar = svg.selectAll ".department"
        .data data
        .enter!append "g"
            ..attr \class \department
            ..attr \transform -> "translate(#{x it.department}, 0)"

    departmentBar.selectAll "rect"
        .data -> it.staff
        .enter!append "rect"
            ..attr \width x.rangeBand!
            ..attr \y (person, index, parentIndex) ->
                y index / data[parentIndex].size
            ..attr \height (person, index, parentIndex) ->
                (height / data[parentIndex].size)
            ..style \fill \red


