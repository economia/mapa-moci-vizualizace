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

    svg = d3.select "body" .append "svg"
        ..attr \width width + margin.left + margin.right
        ..attr \height height + margin.top + margin.bottom
    drawing = svg.append "g"
        ..attr \transform "translate(#{margin.left}, #{margin.top})"

    data = for department, staff of data
        size = staff.length
        staff.forEach (person, index) ->
            person.originalIndex = index
        {department, staff, size}

    maxSize = Math.max ...data.map (.size)
    notNormalizedPersonHeight = height / maxSize
    y = d3.scale.linear!rangeRound [0 height]

    departments = data.map (.department)
    color.domain departments
    x.domain departments
    departmentBar = svg.selectAll ".department"
        .data data
        .enter!append "g"
            ..attr \class \department
            ..attr \transform -> "translate(#{x it.department}, 0)"

    rectangles = departmentBar.selectAll "rect"
        .data -> it.staff
        .enter!append "rect"
            ..attr \width x.rangeBand!
            ..on \mouseover (person) ->
                content =
                    | isPersonChanged person
                        """
                        <h3>Puvodne: </h3>
                        <p class='from'>#{person.6} #{person.7} #{person.8} #{person.9} (#{person.11})</p>
                        <h3>Nastupce: </h3>
                        <p class='to'>#{person.14} #{person.15} #{person.16} #{person.17} (#{person.19})</p>
                        """
                    | otherwise
                        "<span class='only'>#{person.6} #{person.7} #{person.8} #{person.9}</span>"
                tooltip.display content
            ..on \mouseout ->
                tooltip.hide!
            ..attr \class (person) ->
                | isPersonChanged person => "new"
                | otherwise => "old"


    redraw = (normalized, sortMethod) ->
        if normalized
            y.domain [0 1]
        else
            y.domain [0 maxSize]
        data.forEach ->
            sortFunction = switch sortMethod
                | 'changed' => orderByChanged
                | otherwise => orderByOriginal
            it.staff.sort sortFunction
            it.staff.forEach (person, index) ->
                person.next = it.staff[index + 1]

        rectangles
            .each (person, index, parentIndex) ->
                index = data[parentIndex].staff.indexOf person
                person.y = switch normalized
                | yes => y index / data[parentIndex].size
                | no  => y index + (maxSize - data[parentIndex].size)
            .transition!
            .duration 500
            .delay (person, index, parentIndex) -> parentIndex * 20
            .attr \y (person) -> person.y
            .attr \height (person, index, parentIndex) ->
                nextPersonY = switch
                    | person.next => that.y
                    | otherwise   => height
                nextPersonY - person.y

    redraw yes


isPersonChanged = (person) ->
    !!person.16

orderByChanged = (personA, personB) ->
    a = if isPersonChanged personA then 1 else 0
    b = if isPersonChanged personB then 1 else 0
    b - a

orderByOriginal = (personA, personB) ->
    personA.originalIndex - personB.originalIndex
