var eventIntervals = {'portscan':"2012-04-05 18:27,2012-04-05 20:36",
                      'sshftpattack':"2012-04-05 20:37,2012-04-05 21:21",
                      'sqlattack':"2012-04-05 21:47,2012-04-06 03:27",
                      'dataoutage':"2012-04-06 02:00,2012-04-06 18:00",
                      'dnsattack':"2012-04-06 17:26,2012-04-06 18:27",
                    };

function slider(min, max, rangeData) {

    var range = [min, max];
    var dateRange = [];
    // console.log(rangeData)

    // set width and height of svg
    var w = 656
    var h = 100
    var margin = {
        top: 35,
        bottom: 30,
        left: 40,
        right: 40
    }

    // dimensions of slider bar
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom - 10;

    // create x scale
    var x = d3.scaleLinear()
        .domain(range)  // data space
        .range([0, width]);  // display space

    // create svg and translated g
    var svg = d3.select("#eventhandler").append('svg').attr("width", w).attr("height", (height + 25))

    const g = svg.append('g').attr('transform', `translate(${30}, ${5})`)

    var line = g.append("line").attr('id', 'line')
        .style("stroke", "black")
        // .style("stroke-width", 2)
        .attr("x1", 288)
        .attr("y1", 0)
        .attr("x2", 288)
        .attr("y2", 25);
    // labels
    var labelL = g.append('text')
        .attr('id', 'labelleft')
        .attr('x', 0)
        .attr('y', height + 5)

    var firstDayLabel = g.append('text')
        .attr('id', 'datelabel')
        .attr('x', 150)
        .attr('y', height - 8.5)
        .text("2012/04/05")
        .style("font-size", "12px")
        .style("font-weight", "bold");

    var secondDayLabel = g.append('text')
        .attr('id', 'datelabel')
        .attr('x', 360)
        .attr('y', height - 8.5)
        .text("2012/04/06")
        // dominant-baseline: hanging;
        // .style("dominant-baseline", "hanging")
        .style("font-size", "12px")
        .style("font-weight", "bold");

    // var line = g.append('line')
    // .attr('id', 'datelabel')
    // .attr('x', 270)
    // .attr('y', 1);

    var labelR = g.append('text')
        .attr('id', 'labelright')
        .attr('x', 0)
        .attr('y', height + 5)



    // define brush
    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on('brush', function (e) {
            var s = e.selection;
            // console.log("The selection is "+String(s).split(",")[0])
            // console.log("x val is "+rangeData[String(s).split(",")[0]])
            // console.log("y val is "+rangeData[String(s).split(",")[1]])
            // update and move labels
            labelL.attr('x', s[0])
                .text(rangeData[String(s).split(",")[0]].split(" ")[1])
            labelR.attr('x', s[1])
                .text(rangeData[String(s).split(",")[1]].split(" ")[1])
            // move brush handles      
            handle.attr("display", null).attr("transform", function (d, i) { return "translate(" + [s[i], - height / 4] + ")"; });
            // update view
            // if the view should only be updated after brushing is over, 
            // move these two lines into the on('end') part below
            svg.node().value = s.map(function (d) { var temp = x.invert(d); return +temp.toFixed(2) });
            var elem = document.querySelector('#eventhandler');
            d3.select("#eventhandler").dispatch('change', { detail: { first: rangeData[String(s).split(",")[0]], second: rangeData[String(s).split(",")[1]] } })
        })

    // append brush to g
    var gBrush = g.append("g")
        .attr("class", "brush")
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

    var handle = gBrush.selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#111")
        .attr("fill", '#111')
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    gBrush.selectAll(".overlay")
        .each(function (d) { d.type = "selection"; })
        .on("mousedown touchstart", brushcentered)

    function brushcentered() {
        var dx = x(1) - x(0), // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
        // console.log("Printing values "+ cx + " "+ x0 + " " + x1);
        d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }

    // select entire range
    gBrush.call(brush.move, range.map(x))

    // return svg.node ()
    var getRange = function () {
        // var range = d3.brushSelection(gBrush.node()).map(d => Math.round(x.invert(d)));

        dateRange.push(rangeData[String(s).split(",")[0]]);
        dateRange.push(rangeData[String(s).split(",")[1]]);
        return dateRange;
    }

    return dateRange;
}

//slider(0,25)


export function initTimeSlider() {

    var rangeData = [];

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
    rangeData.push("2012-04-07 00:00");
    
    slider(0, 2.89, rangeData);
    // slider(0, max)

};

