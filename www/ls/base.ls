tooltip = new Tooltip!
perElementTooltip = new Tooltip
    ..watchElements!
capableBrowser = Modernizr.inlinesvg
if capableBrowser then $ '.incapable' .removeClass 'incapable'
window.init = (data) ->
    return if not capableBrowser
    index = 0
    data_ministerstva = {}
    data_firmy = {}
    for name, content of data
        target = if index < 11 then data_firmy else data_ministerstva
        target[name] = content
        index++
    drawGraph data_ministerstva, '#ministerstva'
    drawGraph data_firmy, '#firmy'
drawGraph = (data, parentSelector) ->
    margin =
        top: 10
        right: 90
        bottom: 110
        left: 10
    baseHeight = if parentSelector is '#ministerstva' then 500 else 300
    width = 960 - margin.left - margin.right
    height = baseHeight - margin.top - margin.bottom
    x = d3.scale.ordinal!rangeRoundBands [0, width], 0.02

    svg = d3.select parentSelector .append "svg"
        ..attr \width width + margin.left + margin.right
        ..attr \height height + margin.top + margin.bottom
    drawing = svg.append "g"
        ..attr \transform "translate(#{margin.left}, #{margin.top})"

    data = for department, staff of data
        escaped = escape department
        if "Pl%E1n" is escaped or department is ''
            continue
        size = staff.length
        currentTitles = []
        for person, index in staff
            person.fulltitles = []
            for i in [0 to 5]
                title = person[i]
                if not title
                    person.fulltitles[i] = currentTitles[i]
                else
                    currentTitles[i] = title
                    break
            annotatePerson person, index
            # normalizePerson person, escaped
        {department, staff, size}

    maxSize = Math.max ...data.map (.size)
    notNormalizedPersonHeight = height / maxSize
    y = d3.scale.linear!rangeRound [0 height]

    departments = data.map (.department)
    x.domain departments
    drawing.append "rect"
        ..attr \class \rasterBackground
        ..attr \x 4
        ..attr \width width - 9
        ..attr \height height

    background = drawing.selectAll ".departmentBackground"
        .data data
        .enter!
        .append "rect"
            ..attr \class \departmentBackground
            ..attr \width x.rangeBand!
            ..attr \x -> x it.department

    departmentBar = drawing.selectAll ".department"
        .data data
        .enter!append "g"
            ..attr \class \department
            ..attr \transform -> "translate(#{x it.department}, 0)"

    rectangles = departmentBar.selectAll "rect"
        .data -> it.staff
        .enter!append "rect"
            ..attr \width x.rangeBand!
            ..on \mouseover (person, index, parentIndex) ->
                content = "<h2>#{getPersonPosition person, parentSelector, parentIndex}</h2>"
                content +=
                    | isPersonChanged person
                        fromString = "#{person.6} #{person.7} #{person.8} #{person.9}"
                        if person.11 then fromString += " (#{person.11})"
                        toString = "#{person.14} #{person.15} #{person.16} #{person.17}"
                        if person.19 then toString += " (#{person.19})"
                        """
                        <h3>Původně: </h3>
                        <p class='from'>#fromString</p>
                        <h3>Nástupce: </h3>
                        <p class='to'>#toString</p>
                        """
                    | otherwise
                        "<span class='only'>#{person.6} #{person.7} #{person.8} #{person.9}</span>"
                tooltip.display content
            ..on \mouseout ->
                tooltip.hide!
            ..attr \class (person) ->
                | isPersonChanged person => "new"
                | otherwise => "old"

    xAxis = drawing.append "g"
    departmentBar = xAxis.selectAll "text"
        .data data
        .enter!append "text"
            ..text (.department)
            ..attr \transform ->
                "translate(#{x(it.department) + x.rangeBand! / 2}, #{height + 15}),
                rotate(-45)"
            ..attr \text-anchor \end



    redraw = (normalized, sortMethod) ->
        if normalized
            y.domain [0 1]
        else
            y.domain [0 maxSize]
        if sortMethod is \changed
            drawYAxis normalized, sortMethod
        else
            hideYAxis!
        data.forEach ->
            sortFunction = switch sortMethod
                | 'changed'    => orderByChanged
                | 'importance' => orderByImportance
                | otherwise    => orderByOriginal
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
                nextPersonY - person.y - 0.5
        background
            ..attr \y (department) -> department.staff.0.y
            ..attr \height (department) -> height - department.staff.0.y
    yAxis = drawing.append "g"
        ..attr \transform "translate(#{width}, 0)"
        ..attr \class \yAxis
    drawYAxis = (normalized, sortMethod) ->
        yAxis
            .transition!
            .duration 500
            .attr \opacity 1
        yAxisTicks = d3.svg.axis!
            .orient \right
            .scale y
            .tickFormat ->
                if sortMethod is \importance
                    switch it
                    | 0   => "Ministři"
                    | 0.2 => "Náměstci"
                    | 0.4 => "Odbory"
                    | _   => ""
                else
                    if normalized
                        "#{100 - it * 100}%"
                    else
                        y.domain!.1 - it
        yAxis.call yAxisTicks

    hideYAxis = ->
        yAxis
            .transition!
            .duration 500
            .attr \opacity 0

    bindActions = ->
        $ parentSelector .on \click '.selector li' (evt) ->
            evt.preventDefault!
            $ele = $ @
            $.scrollTo $ele, duration:200 axis: \y
            return if $ele.hasClass \active
            $ele.parent!.find "li" .removeClass 'active'
            $ele.addClass 'active'
            onSelectionChanged!

    onSelectionChanged = ->
        selector = parentSelector + ' .selector li.active'
        sort = $ selector .data \content
        normalized = no
        redraw normalized, sort



    redraw no \changed
    bindActions!

normalizePerson = (person, department) ->
    shift = switch department
    | '%u0160kolstv%ED' => 2
    | 'Kultura' => 2
    | '%u017Divotn%ED%20prost%u0159ed%ED' => 2
    | 'M%EDstn%ED%20rozvoj' => 2
    | 'Spravedlnost' => 3
    | 'Obrana' => 3
    | 'Zem%u011Bd%u011Blstv%ED' => 3
    | 'Doprava' => 0
    | 'Vl%E1da%20+%20Premi%E9r' => 3
    | 'Pr%u016Fmysl%20a%20obchod' => 2
    | 'Finance' => 2
    | 'Vnitro' => 1
    | otherwise => 0
    for [0 til shift]
        person.unshift ""
    person
    # console.log "#department: #{person.9}"

annotatePerson = (person, index) ->
    person.originalIndex = index
    person.positionImportance = switch
    | person.0  => 0
    | person.1  => 1
    | person.2  => 2
    | person.3  => 3
    | person.4  => 4
    | person.5  => 5
    | otherwise => 6


isPersonChanged = (person) ->
    !!person.16

getPersonPosition = (person, parentSelector, parentIndex) ->
    position = null
    for i in [0 to 5]
        if person[i] then position = that
    if parentSelector == '#firmy' and parentIndex == 10
        position = (person.fulltitles[0] || person[0]) + ", " + position
    position


orderByChanged = (personA, personB) ->
    a = if isPersonChanged personA then 1 else 0
    b = if isPersonChanged personB then 1 else 0
    if a - b
        that
    else
        (-1) * orderByImportance personA, personB


orderByOriginal = (personA, personB) ->
    personA.originalIndex - personB.originalIndex

orderByImportance = (personA, personB) ->
    personA.positionImportance - personB.positionImportance

$ document .on \click \.backFromGallery (evt) ->
    if history.length > 1
        history.back!
    else
        window.location = $ @ .find \a .attr \href
    evt
        ..preventDefault!
        ..stopPropagation!
