window.init = (data) ->
    margin =
        top: 20
        right: 100
        bottom: 30
        left: 40
    width = 960 - margin.left - margin.right
    height = 500 - margin.top - margin.bottom
    x = d3.scale.ordinal!rangeRoundBands [0, width], 0.01

    color = d3.scale.ordinal!range ['#98abc5' '#8a89a6' '#7b6888' '#6b486b' '#a05d56' '#d0743c' '#ff8c00' ] * 2
    normalized = yes

    svg = d3.select "body" .append "svg"
        ..attr \width width + margin.left + margin.right
        ..attr \height height + margin.top + margin.bottom
    drawing = svg.append "g"
        ..attr \transform "translate(#{margin.left}, #{margin.top})"

    data = for department, staff of data
        size = staff.length
        {department, staff, size}
    maxSize = Math.max ...data.map (.size)
    notNormalizedPersonHeight = height / maxSize
    y = d3.scale.linear!rangeRound [0 height]
    if not normalized
        y.domain [0 maxSize]

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
                if normalized
                    y index / data[parentIndex].size
                else
                    y maxSize - index
            ..attr \height (person, index, parentIndex) ->
                if normalized
                    (height / data[parentIndex].size) + 1
                else
                    notNormalizedPersonHeight + 1
            ..attr \title (person) -> "#{person.6} #{person.7} #{person.8} #{person.9}"
            ..style \fill (person) ->

                | person.17 => \#98abc5
                | otherwise => \#6b486b


