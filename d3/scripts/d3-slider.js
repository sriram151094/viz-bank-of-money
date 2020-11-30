
var brush;
var rangeMap = {};
var gBrush;
var x;
var firstDayLabel;
var secondDayLabel;
var s;
var height;
var width;
var labelL;
var labelR;
var g;
var svg;
var range;
var w;
var h;
var margin;
var handle;
var rangeData = [];
var eventVal = "";

function slider(min, max, rangeData) {

    range = [min, max];

    // set width and height of svg
    w = 656
    h = 100
    margin = {
        top: 35,
        bottom: 30,
        left: 40,
        right: 40
    }



    // dimensions of slider bar
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom - 10;

    // create x scale
    x = d3.scaleLinear()
        .domain(range)  // data space
        .range([0, width]);  // display space

    // d3.selectAll("#line")
    //     .remove();
    // d3.selectAll("#labelright")
    //     .remove();
    // d3.selectAll("#labelleft")
    //     .remove();
    // d3.selectAll("#datelabel1")
    //     .remove();
    // d3.selectAll("#datelabel2")
    //     .remove();
    // d3.selectAll("#newbrush")
    //     .remove();
    // d3.select("#eventhandler").remove();
    // d3.selectAll("svg > *").remove();

    // create svg and translated g
    svg = d3.select("#eventhandler").append('svg').attr("width", w).attr("height", (height + 25))

    g = svg.append('g').attr('transform', `translate(${30}, ${5})`)

    var line = g.append("line").attr('id', 'line')
        .style("stroke", "black")
        // .style("stroke-width", 2)
        .attr("x1", 288)
        .attr("y1", 0)
        .attr("x2", 288)
        .attr("y2", 25);


    // d3.selectAll("#brushX")
    //     .remove();
    // labels
    labelL = g.append('text')
        .attr('id', 'labelleft')
        .attr('x', 0)
        .attr('y', height + 5)
        .style('fill', '#fff')


    firstDayLabel = g.append('text')
        .attr('id', 'datelabel1')
        .attr('x', 150)
        .attr('y', height - 8.5)
        .text("2012/04/05")
        .style("font-size", "12px")
        .style("font-weight", "bold");

    secondDayLabel = g.append('text')
        .attr('id', 'datelabel2')
        .attr('x', 360)
        .attr('y', height - 8.5)
        .text("2012/04/06")
        // dominant-baseline: hanging;
        // .style("dominant-baseline", "hanging")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black");

    // var line = g.append('line')
    // .attr('id', 'datelabel')
    // .attr('x', 270)
    // .attr('y', 1);

    labelR = g.append('text')
        .attr('id', 'labelright')
        .attr('x', 0)
        .attr('y', height + 5)
        .style('fill', '#fff')



    // define brush
    brush = d3.brushX()
        // .attr("id", "brushX")
        .extent([[0, 0], [width, height]])
        .on('brush', function (e) {
            s = e.selection;
            // update and move labels
            labelL.attr('x', s[0])
                // .attr("id", "leftlabel")
                .text(rangeData[String(s).split(",")[0]].split(" ")[1])
            labelR.attr('x', s[1])
                // .attr("id", "rightlabel")
                .text(rangeData[String(s).split(",")[1]].split(" ")[1])
            // move brush handles      
            handle.attr("display", null).attr("transform", function (d, i) { return "translate(" + [s[i], - height / 4] + ")"; });
            // update view
            // if the view should only be updated after brushing is over, 
            // move these two lines into the on('end') part below
            svg.node().value = s.map(function (d) { var temp = x.invert(d); return +temp.toFixed(2) });
            var elem = document.querySelector('#eventhandler');
            //d3.select("#eventhandler").dispatch('change', { detail: { first: rangeData[String(s).split(",")[0]], second: rangeData[String(s).split(",")[1]] } })
        })
        .on('end', function(e) {
            d3.select("#eventhandler").dispatch('change', { detail: { first: rangeData[String(s).split(",")[0]], second: rangeData[String(s).split(",")[1]], third: eventVal} })
        })

    brush.move(d3.select(this), [
        [0, 100],
        [2890, 1000]
    ]);

    // brush.attr("d", rightRoundedRect(-240, -120, 480, 240, 20));

    // append brush to g
    gBrush = g.append("g")
        .attr("class", "brush")
        .attr("id", "newbrush")
        .call(brush)

    // add brush handles
    var brushResizePath = function (d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
            "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
            "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    handle = gBrush.selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "rgb(16, 195, 225)")
        .attr("fill", 'rgb(16, 195, 225)')
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    gBrush.selectAll(".overlay")
        .style("rx", "5")
        .style("fill", "#fff")
        // .attr("d", rightRoundedRect(-500, -620, 880, 1240, 120))
        .each(function (d) { d.type = "selection"; })

        .on("mousedown touchstart", brushcentered)

    gBrush.selectAll(".selection")
        .style("rx", "5")
        .style("fill", "rgb(16, 195, 225)")

    function brushcentered() {
        var dx = x(1) - x(0), // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
        d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }

    gBrush.call(brush.move, [1.11, 1.245].map(x).map(d => Math.floor(d)))

    var firstDayLabel = g.append('text')
        .attr('id', 'datelabel')
        .attr('x', 150)
        .attr('y', height - 8.5)
        .text("2012/04/05")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black");

    var secondDayLabel = g.append('text')
        .attr('id', 'datelabel')
        .attr('x', 360)
        .attr('y', height - 8.5)
        .text("2012/04/06")
        // dominant-baseline: hanging;
        // .style("dominant-baseline", "hanging")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black");

    var line = g.append("line").attr('id', 'line')
        .style("stroke", "black")
        // .style("stroke-width", 2)
        .attr("x1", 288)
        .attr("y1", 0)
        .attr("x2", 288)
        .attr("y2", 25);

}

export function setTime(start, end, eventvalue) {
    var range1 = {
        "SQL Attack": [1.31, 1.66],
        "Port Scanning": [1.11, 1.245],
        "FTP/SSH Attack": [1.24, 1.29],
        "Data Outage": [1.57, 2.53],
        "DNS Attack": [2.495, 2.56]
    }
    eventVal = eventvalue;
    gBrush.call(brush.move, [range1[eventvalue][0], range1[eventvalue][1]].map(x).map(d => Math.floor(d)))

}

export function getEventVal() {
    return eventVal;
}

export function setEventVal() {
    eventVal = "";
}


export function initTimeSlider() {

    for (let j = 0; j < 10; j++) {
        let k = 0;
        while (k < 10) {
            rangeData.push("2012-04-05 0" + j + ":0" + k);
            k = k + 5;
        }
        while (k < 60) {
            rangeData.push("2012-04-05 0" + j + ":" + k);
            k = k + 5;
        }
    }
    for (let j = 10; j < 24; j++) {
        let k = 0;
        while (k < 10) {
            rangeData.push("2012-04-05 " + j + ":0" + k);
            k = k + 5;
        }
        while (k < 60) {
            rangeData.push("2012-04-05 " + j + ":" + k);
            k = k + 5;
        }
    }

    for (let j = 0; j < 10; j++) {
        let k = 0;
        while (k < 10) {
            rangeData.push("2012-04-06 0" + j + ":0" + k);
            k = k + 5;
        }
        while (k < 60) {
            rangeData.push("2012-04-06 0" + j + ":" + k);
            k = k + 5;
        }
    }
    for (let j = 10; j < 24; j++) {
        let k = 0;
        while (k < 10) {
            rangeData.push("2012-04-06 " + j + ":0" + k);
            k = k + 5;
        }
        while (k < 60) {
            rangeData.push("2012-04-06 " + j + ":" + k);
            k = k + 5;
        }
    }
    rangeData.push("2012-04-06 23:59");

    slider(0, 2.89, rangeData);

};

