tooltip = new Tooltip!
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
    normalized = no

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
                    y index + (maxSize - data[parentIndex].size)
            ..attr \height (person, index, parentIndex) ->
                if normalized
                    (height / data[parentIndex].size) + 1
                else
                    notNormalizedPersonHeight + 1
            ..on \mouseover (person) ->
                content =
                    | person.17
                        """
                        <h3>Puvodne: </h3>
                        <p class='from'>#{person.6} #{person.7} #{person.8} #{person.9}</p>
                        <h3>Nastupce: </h3>
                        <p class='to'>#{person.14} #{person.15} #{person.16} #{person.17}</p>
                        """
                    | otherwise
                        "<span class='only'>#{person.6} #{person.7} #{person.8} #{person.9}</span>"
                tooltip.display content
            ..on \mouseout ->
                tooltip.hide!
            ..attr \class (person) ->
                | person.17 => "new"
                | otherwise => "old"


