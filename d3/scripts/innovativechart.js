export { storyTellingChart }
import { drawNetworkChart } from "./networkchart.js"

var NameProvider = ["Port Scanning", "FTP/SSH Attack", "SQL Attack", "Data Outage", "DNS Attack"];

var matrix = [
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1]
];

var colors = ["#C8125C", "#008FC8", "#10218B", "#134B24", "#737373"];
var simulation;

/*Initiate the color scale*/
var fill = d3.scaleOrdinal()
    .domain(d3.range(NameProvider.length))
    .range(colors);


var margin = { top: 30, right: 25, bottom: 20, left: 25 },
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    innerRadius = (Math.min(width, height) - 100) * .39,
    outerRadius = innerRadius * 1.04;


var chord = d3.chord()
    .padAngle(.04)
    .sortSubgroups(d3.descending) /*sort the chords inside an arc from high to low*/
    .sortChords(d3.descending); /*which chord should be shown on top when chords cross. Now the biggest chord is at the bottom*/

var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);


/*//////////////////////////////////////////////////////////
//////////////// Storyboarding Steps ///////////////////////
//////////////////////////////////////////////////////////*/

var counter = 1,
    buttonTexts = ["Ok", "Go on", "Continue", "Continue", "Go on", "Okay", "Okay", "Continue",
        "Continue", "Continue", "Continue", "Continue", "Continue", "Finish"],
    opacityValueBase = 0.8,
    opacityValue = 0.4;

var svg;
var g;
var ticks;
var progressColor;
var progressBar;
var progressClass;
var prgsWidth;
var prgsHeight;
var textCenter;
var middleTextTop;
var middleTextBottom;

function storyTellingChart() {
    /*Initiate the SVG*/
    svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
        .datum(chord(matrix));

    /*//////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
//////////////////////////////////////////////////////////*/

    g = svg.selectAll("g.group")
        .data(function (chords) { return chords.groups; })
        .enter().append("g")
        .attr("class", function (d) { return "group " + NameProvider[d.index]; });

    g.append("path")
        .attr("class", "arc")
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .attr("d", arc)
        .style("opacity", 0)
        .transition().duration(1000)
        .style("opacity", 0.4);

    /*//////////////////////////////////////////////////////////
    ////////////////// Initiate Ticks //////////////////////////
    //////////////////////////////////////////////////////////*/

    ticks = svg.selectAll("g.group").append("g")
        .attr("class", function (d) { return "ticks " + NameProvider[d.index]; })
        .selectAll("g.ticks")
        .attr("class", "ticks")
        .data(groupTicks)
        .enter().append("g")
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + outerRadius + 40 + ",0)";
        });


    /*Append the tick around the arcs*/
    ticks.append("svg:line")
        .attr("x1", 1)
        .attr("y1", 0)
        .attr("x2", 5)
        .attr("y2", 0)
        .attr("class", "ticks")
        .style("stroke", "#FFF");


    /*//////////////////////////////////////////////////////////
    ////////////////// Initiate Names //////////////////////////
    //////////////////////////////////////////////////////////*/

    g.append("text")
        .each(function (d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "titles")
        .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius + 55) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .attr('opacity', 0)
        .text(function (d, i) { return NameProvider[i]; });


    /*//////////////////////////////////////////////////////////	
/*//////////////////////////////////////////////////////////	
    /*//////////////////////////////////////////////////////////	
    ///////////// Initiate Progress Bar ////////////////////////
    //////////////////////////////////////////////////////////*/

    /*Initiate variables for bar*/
    progressColor = ["#D1D1D1", "#949494"],
        progressClass = ["prgsBehind", "prgsFront"],
        prgsWidth = 0.4 * 650,
        prgsHeight = 3;
    /*Create SVG to visualize bar in*/
    progressBar = d3.select("#progress").append("svg")
        .attr("width", prgsWidth)
        .attr("height", 3 * prgsHeight);
    /*Create two bars of which one has a width of zero*/
    progressBar.selectAll("rect")
        .data([prgsWidth, 0])
        .enter()
        .append("rect")
        .attr("class", function (d, i) { return progressClass[i]; })
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", function (d) { return d; })
        .attr("height", prgsHeight)
        .attr("fill", function (d, i) { return progressColor[i]; });

    /*//////////////////////////////////////////////////////////	
/*//////////////////////////////////////////////////////////	
    /*//////////////////////////////////////////////////////////	
    /////////// Initiate the Center Texts //////////////////////
    //////////////////////////////////////////////////////////*/
    /*Create wrapper for center text*/
    textCenter = svg.append("g")
        .attr("class", "explanationWrapper");

    /*Starting text middle top*/
    middleTextTop = textCenter.append("text")
        .attr("class", "explanation")
        .attr("id", "text1")
        .attr("text-anchor", "middle")
        .attr("x", 0 + "px")
        .attr("y", -24 * 10 / 2 + "px")
        .attr("dy", "1em")
        .attr("opacity", 1)
        .text("Our organization Bank Of Money hosts about a million devices/workstations. ")
        .call(wrap, 350, "#text1");

    /*Starting text middle bottom*/
    middleTextBottom = textCenter.append("text")

        .attr("class", "explanation")
        .attr("id", "text2")
        .attr("text-anchor", "middle")

        .attr("x", 0 + "px")
        .attr("y", 24 * 3 / 2 + "px")
        .attr("dy", "1em")
        .attr('opacity', 1)
        .text("It is imperative that we have a cyber security system that prevents the organization from getting compromised by attackers.")
        .call(wrap, 350, "#text2");

    /*Internal network glyph */
    d3.csv("../data/Internalnetwork.csv").then(data => {
        data = data.map(function (d) { d.value = +d["Type"]; return d; });
        drawNetworkGlyph(data);
    })

    /*Reload page*/
    d3.select("#reset")
        .on("click", function (e) { location.reload(); });

    /*Skip to final visual right away*/
    d3.select("#skip")
        .on("click", finalChord);


    /*Order of steps when clicking button*/
    d3.select("#clicker")
        .on("click", function (e) {
            //updateReadings(10);
            if (counter == 1) Draw1();
            else if (counter == 2) Draw2();
            else if (counter == 3) Draw3();
            else if (counter == 4) Draw4();
            else if (counter == 5) Draw5();
            else if (counter == 6) Draw6();
            else if (counter == 7) finalChord();

            counter = counter + 1;
        });

}





/*//////////////////////////////////////////////////////////	
//Introduction
///////////////////////////////////////////////////////////*/
function Draw1() {
    console.log("Draw1 function")

    /*First disable click event on clicker button*/
    stopClicker();

    /*Show and run the progressBar*/
    runProgressBar(700 * 11);

    changeTopText("The Bank of Money is experiencing difficulties with its security infrastructure" +
        "and it’s becoming difficult to drill down the issue causing it.",
        4 / 2, 0, 1);

    changeBottomText("Let's start by drawing out the attacks faced over the past two days",
        1 / 2, 0, 10);

    changeTopText("In the next few steps we would like to introduce you to the issues faced by our organization ",
        8 / 2, 9, 1, true);

    //Remove arcs again
    // d3.selectAll(".arc")
    // 	.transition().delay(9*700).duration(2100)
    // 	.style("opacity", 0)
    // 	.on("end", function() {d3.selectAll(".arc").remove();});

};/*Draw1*/

/*//////////////////////////////////////////////////////////	
//Show Arc of Port Scanning
//////////////////////////////////////////////////////////*/
function Draw2() {
    console.log("Draw2 function")

    /*First disable click event on clicker button*/
    stopClicker();

    /*Show and run the progressBar*/
    runProgressBar(700 * 2);

    /*Initiate all arcs but only show the Port Scanning arc (d.index = 0)*/
    g.append("path")
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .transition().duration(700)
        .attr("d", arc)
        .attr('cursor', 'pointer')
        .attrTween("d", function (d) {
            if (d.index == 0) {
                var i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            }
        })

    // Call other charts changes from here on click of a chord/event    
    g.on('click', (event, d) => {
        console.log(d);
        drawNetworkChart(Date.parse("2012-04-05 20:30"), Date.parse("2012-04-05 21:30"))
    });

    /*Show the tick around the arc*/
    d3.selectAll("g.group").selectAll("line")
        .transition().delay(700).duration(1000)
        .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

    /*Show the  name*/
    d3.selectAll(".titles")
        .transition().duration(2000)
        .attr("opacity", function (d, i) { return d.index ? 0 : 1; });

    /*Switch  texts*/
    changeTopText("Firstly, a series of Port scanning events occur implying the presence of some external botnet trying to compromise the system",
        1 / 2, 0, 1, true);

    changeBottomText("",
        0 / 2, 0, 1);

    //updateReadings(8);

};/*Draw2*/

/*///////////////////////////////////////////////////////////  
//Draw arc for FTP/SSH Attack
//////////////////////////////////////////////////////////*/
function Draw3() {
    console.log("Draw3 function")
    /*First disable click event on clicker button*/
    stopClicker();

    /*Show and run the progressBar*/
    runProgressBar(700 * 2);

    g.append("path")
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .transition().duration(700)
        .attr("d", arc)
        .attrTween("d", function (d) {
            if (d.index == 1) {
                var i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            }
        });

    /*Make the other strokes black as well*/
    d3.selectAll("g.group")
        .transition().delay(700).duration(1000)
        .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

    /*Show the  name*/
    d3.selectAll(".titles")
        .transition().duration(2000)
        .attr("opacity", function (d, i) { return d.index == 0 || d.index == 1 ? 1 : 0; });

    changeTopText("HTC has 5% of the market share",
        6 / 2, 0, 1, true);

    changeBottomText("Huawei came from practically no share in 2013 to 2.4% in 2014 thereby taking its place in the biggest 7 brands in the Netherlands",
        -2 / 2, 0, 1);
    //updateReadings(6);
};/*Draw3*/

/*///////////////////////////////////////////////////////////  
//Draw arc for SQL Attack
//////////////////////////////////////////////////////////*/
function Draw4() {
    console.log("Draw4 function")
    /*First disable click event on clicker button*/
    stopClicker();

    /*Show and run the progressBar*/
    runProgressBar(700 * 2);

    g.append("path")
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .transition().duration(700)
        .attr("d", arc)
        .attrTween("d", function (d) {
            if (d.index == 2) {
                var i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            }
        });

    /*Make the other strokes black as well*/
    d3.selectAll("g.group")
        .transition().delay(700).duration(1000)
        .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

    /*Add the labels for the %'s*/
    d3.selectAll("g.group").selectAll(".tickLabels")
        .transition().delay(700).duration(2000)
        .attr("opacity", 0);

    /*Show the  name*/
    d3.selectAll(".titles")
        .transition().duration(2000)
        .attr("opacity", function (d, i) { return d.index == 0 || d.index == 1 || d.index == 2 ? 1 : 0; });

    changeTopText("LG has almost 5% of the market",
        6 / 2, 0, 1, true);

    changeBottomText("Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
        -2 / 2, 0, 1);
    //updateReadings(4);

};


/*///////////////////////////////////////////////////////////  
//Draw arc for Data Outage
//////////////////////////////////////////////////////////*/
function Draw5() {
    console.log("Draw5 function")
    /*First disable click event on clicker button*/
    stopClicker();

    /*Show and run the progressBar*/
    runProgressBar(700 * 2);

    g.append("path")
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .transition().duration(700)
        .attr("d", arc)
        .attrTween("d", function (d) {
            if (d.index == 3) {
                var i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            }
        });

    /*Make the other strokes black as well*/
    d3.selectAll("g.group")
        .transition().delay(700).duration(1000)
        .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

    /*Show the  name*/
    d3.selectAll(".titles")
        .transition().duration(2000)
        .attr("opacity", function (d, i) { return d.index == 0 || d.index == 1 || d.index == 2 || d.index == 3 ? 1 : 0; });


    changeTopText("LG has almost 5% of the market",
        6 / 2, 0, 1, true);

    changeBottomText("Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
        -2 / 2, 0, 1);
    //updateReadings(2);

};
/*///////////////////////////////////////////////////////////  
//Draw arc for DNS attack
//////////////////////////////////////////////////////////*/
function Draw6() {
    console.log("Draw6 function")
    /*First disable click event on clicker button*/
    stopClicker();

    /*Show and run the progressBar*/
    runProgressBar(700 * 2);

    g.append("path")
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .transition().duration(700)
        .attr("d", arc)
        .attrTween("d", function (d) {
            if (d.index == 4) {
                var i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            }
        });

    /*Make the other strokes black as well*/
    d3.selectAll("g.group")
        .transition().delay(700).duration(1000)
        .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });


    /*Show the  name*/
    d3.selectAll(".titles")
        .transition().duration(2000)
        .attr("opacity", 1);

    changeTopText("LG has almost 5% of the market",
        6 / 2, 0, 1, true);

    changeBottomText("Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
        -2 / 2, 0, 1);
    //updateReadings(0);
};

/*Go to the final bit*/
function finalChord() {

    /*Remove button*/
    d3.select("#clicker")
        .style("visibility", "hidden");
    d3.select("#skip")
        .style("visibility", "hidden");
    d3.select("#progress")
        .style("visibility", "hidden");

    /*Remove texts*/
    changeTopText("", 0, 0, 1);
    changeBottomText("", 0, 0, 1);

    /*Create arcs or show them, depending on the point in the visual*/
    if (counter <= 4) {
        g.append("svg:path")
            .style("stroke", function (d) { return fill(d.index); })
            .style("fill", function (d) { return fill(d.index); })
            .attr("d", arc)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1);

    } else {
        /*Make all arc visible*/
        svg.selectAll("g.group").select("path")
            .transition().duration(1000)
            .style("opacity", 1);
    };

    /*Make mouse over and out possible*/
    d3.selectAll(".group")
        .on("mouseover", fade(.02))
        .on("mouseout", fade(.80));


    /*Show all the text*/
    d3.selectAll("g.group").selectAll("line")
        .transition().duration(100)
        .style("stroke", "#000");

    /*And the Names of each Arc*/
    svg.selectAll("g.group")
        .transition().duration(100)
        .selectAll(".titles").style("opacity", 1);

};

/*//////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
//////////////////////////////////////////////////////////*/

/*Returns an event handler for fading a given chord group*/
function fade(opacity) {
    return function (d, i) {
        svg.selectAll("path.chord")
            .filter(function (d) { return d.source.index != i && d.target.index != i; })
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);
    };
};/*fade*/

/*Returns an array of tick angles and labels, given a group*/
function groupTicks(d) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 1).map(function (v, i) {
        return {
            angle: v * k + d.startAngle,
            label: i % 5 ? null : v + "%"
        };
    });
};/*groupTicks*/

/*Taken from https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
//Calls a function only after the total transition ends*/
function endall(transition, callback) {
    var n = 0;
    transition
        .each(function () { ++n; })
        .on("end", function () {
            if (!--n)
                callback.apply(this, arguments);
        });
};/*endall*/

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width, id) {
    var text = d3.select(id),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4,
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        };
    };
};


/*Transition the top circle text*/
function changeTopText(newText, loc, delayDisappear, delayAppear, finalText, xloc, w) {
    /*If finalText is not provided, it is not the last text of the Draw step*/
    if (typeof (finalText) === 'undefined') finalText = false;

    if (typeof (xloc) === 'undefined') xloc = 0;
    if (typeof (w) === 'undefined') w = 350;

    middleTextTop
        /*Current text disappear*/
        .transition().delay(700 * delayDisappear).duration(700)
        .attr('opacity', 0)
        /*New text appear*/
        .call(endall, function () {
            middleTextTop.text(newText)
                .attr("id", "middleText")
                .attr("y", -24 * loc + "px")
                .attr("x", xloc + "px")
                .call(wrap, w, "#middleText");
        })
        .transition().delay(700 * delayAppear).duration(700)
        .attr('opacity', 1)
        .call(endall, function () {
            if (finalText == true) {
                d3.select("#clicker")
                    .text(buttonTexts[counter - 2])
                    .style("pointer-events", "auto")
                    .transition().duration(400)
                    .style("border-color", "#363636")
                    .style("color", "#363636");
            };
        });
};/*changeTopText */

/*Transition the bottom circle text*/
function changeBottomText(newText, loc, delayDisappear, delayAppear) {
    middleTextBottom
        /*Current text disappear*/
        .transition().delay(700 * delayDisappear).duration(700)
        .attr('opacity', 0)
        .attr("id", "bottomText")
        /*New text appear*/
        .call(endall, function () {
            console.log(d3.select(this))
            middleTextBottom.text(newText)

                .attr("y", 24 * loc + "px")
                .call(wrap, 350, "#bottomText");
        })
        .transition().delay(700 * delayAppear).duration(700)
        .attr('opacity', 1);
    ;
}/*changeTopText*/

/*Stop clicker from working*/
function stopClicker() {
    d3.select("#clicker")
        .style("pointer-events", "none")
        .transition().duration(400)
        .style("border-color", "#D3D3D3")
        .style("color", "#D3D3D3");
};/*stopClicker*/

/*Run the progress bar during an animation*/
function runProgressBar(time) {

    /*Make the progress div visible*/
    d3.selectAll("#progress")
        .style("visibility", "visible");

    /*Linearly increase the width of the bar
    //After it is done, hide div again*/
    d3.selectAll(".prgsFront")
        .transition().duration(time).ease(d3.easeLinear)
        .attr("width", prgsWidth)
        .call(endall, function () {
            d3.selectAll("#progress")
                .style("visibility", "hidden");
        });

    /*Reset to zero width*/
    d3.selectAll(".prgsFront")
        .attr("width", 0);

};/*runProgressBar*/


var workstationSvg;
var firewallSvg;
var dnsSvg;
var databaseSvg;
var defs;

function loadSvgs() {
    defs = svg.append('svg:defs')
    var workstationdefs = svg.append("defs");

    d3.xml("../d3/img/workstation.svg").then(res => {
        workstationSvg = res;

        defs.append('pattern')
            .attr('id', 'workstation')
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 25)
            .attr('height', 25)
            // Append svg to pattern
            .append('svg')
            .attr('x', 12)
            .attr('y', 13)
            .attr('width', 25)
            .attr('height', 25)
            .append(() => res.getElementsByTagName("svg")[0])
    })

    d3.xml("../d3/img/firewall.svg").then(res => {
        firewallSvg = res;

        defs.append('pattern')
            .attr('id', 'firewall')
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 10)
            .attr('height', 10)
            // Append svg to pattern
            .append('svg')
            .attr('x', 12)
            .attr('y', 13)
            .attr('width', 25)
            .attr('height', 25)
            .append(() => res.getElementsByTagName("svg")[0])
    })

    d3.xml("../d3/img/dns.svg").then(res => {
        dnsSvg = res;

        defs.append('pattern')
            .attr('id', 'dns')
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 10)
            .attr('height', 10)
            // Append svg to pattern
            .append('svg')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', 30)
            .attr('height', 30)
            .append(() => res.getElementsByTagName("svg")[0])
    })

    d3.xml("../d3/img/database.svg").then(res => {
        databaseSvg = res;

        defs.append('pattern')
            .attr('id', 'database')
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 10)
            .attr('height', 10)
            // Append svg to pattern
            .append('svg')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', 30)
            .attr('height', 30)
            .append(() => res.getElementsByTagName("svg")[0])
    })
}

function drawNetworkGlyph(data) {
    console.log(data)


    loadSvgs();

    var forceXSeparate = function (force) {
        return d3.forceX(force).strength(0.1)
    }

    // d3.forceX(function (d) {
    //     if (d.Type == "Workstation")
    //         return 200;
    //     else
    //         return 200;
    // }).strength(0.1)

    var forceYSeparate = function (force) {
        return d3.forceY(force).strength(0.1)
    }


    // d3.forceY(function (d) {
    //     if (d.Type == "Workstation")
    //         return -250;
    //     else
    //         return -250;
    // }).strength(0.1)

    // simulation = d3.forceSimulation()
    //     .force("x", forceXSeparate(200))
    //     .force("y", forceYSeparate(-250))
    //     .force("collide", d3.forceCollide(25))



    let forces = [[200, -250], [300, -50], [-200, 250], [-300, -50], [-200, -250]]
    for (let i = 0; i < 5; i++) {

        let sim = d3.forceSimulation()
            .force("x", forceXSeparate(forces[i][0]))
            .force("y", forceYSeparate(forces[i][1]))
            .force("collide", d3.forceCollide(25))

        let g = svg.append('g')
        g.attr('id', '#cluster' + i)

        let elements = g.selectAll('.bubble')
            .data(data)
            .enter()
            .append('g')
            .attr('id', d => d.Name + i)

        let circles = elements.append("circle")
            .attr("class", "bubble")
            .attr("r", "20")
            .attr("fill", function (d) {
                return "lightgreen"
            })

        let bg = elements.append('path')
            .attr("d", d3.symbol().size(2500).type(d3.symbolSquare))
            .style("fill", function (d) {
                if (d.Type == "Workstation")
                    return `url(${location}#workstation)`
                else if (d.Type == "DNS")
                    return `url(${location}#dns)`
                else
                    return `url(${location}#firewall)`
            })

        sim.nodes(data)
            .on("tick", function (d) {
                circles
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    })

                bg.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")" })
            })
    }



    function ticked(circles, bg) {
        circles
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })

        bg.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")" })

    }


}