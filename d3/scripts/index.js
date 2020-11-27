import { network, drawNetworkChart } from './networkchart.js'
import { storyTellingChart } from './innovativechart.js'
import {Heatmap} from './heatmap.js';

export function buttonclick() {
    console.log("Change")
}

export function timechange() {
    let startTime = d3.select('#starttime').property('value')
    let endTime = d3.select('#endtime').property('value')
    let date = d3.select('#date').property('value')
    console.log(Date.parse(date + ' ' + startTime));
    console.log(Date.parse(date + ' ' + endTime));
    drawNetworkChart(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
    Heatmap(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
}

function init() {
    let startTime = d3.select('#starttime').property('value')
    let endTime = d3.select('#endtime').property('value')
    let date = d3.select('#date').property('value')
    network();
    storyTellingChart();
    Heatmap(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
}

init()


// var NameProvider = ["Port Scanning", "FTP/SSH Attack", "SQL Attack", "Data Outage", "DNS Attack"];

// var matrix = [
//     [0, 0, 0, 1, 1],
//     [0, 0, 0, 0, 1],
//     [1, 1, 1, 1, 1],
//     [1, 1, 1, 0, 0],
//     [0, 0, 0, 0, 1]
// ];

// var colors = ["#C8125C", "#008FC8", "#10218B", "#134B24", "#737373"];

// /*Initiate the color scale*/
// var fill = d3.scaleOrdinal()
//     .domain(d3.range(NameProvider.length))
//     .range(colors);


// var margin = { top: 30, right: 25, bottom: 20, left: 25 },
//     width = 650 - margin.left - margin.right,
//     height = 600 - margin.top - margin.bottom,
//     innerRadius = Math.min(width, height) * .39,
//     outerRadius = innerRadius * 1.04;


// var chord = d3.chord()
//     .padAngle(.04)
//     .sortSubgroups(d3.descending) /*sort the chords inside an arc from high to low*/
//     .sortChords(d3.descending); /*which chord should be shown on top when chords cross. Now the biggest chord is at the bottom*/

// var arc = d3.arc()
//     .innerRadius(innerRadius)
//     .outerRadius(outerRadius);

// /*Initiate the SVG*/
// var svg = d3.select("#chart")
//     .attr("width", 1240)
//     .attr("height", 565)
//     .append("g")
//     .attr("transform", "translate(" + (margin.left - 100 + margin.bottom + width / 2) + "," + (margin.top + margin.top + height / 2) + ")")
//     .datum(chord(matrix));

// /*//////////////////////////////////////////////////////////
// ////////////////// Draw outer Arcs /////////////////////////
// //////////////////////////////////////////////////////////*/

// var g = svg.selectAll("g.group")
//     .data(function (chords) { return chords.groups; })
//     .enter().append("g")
//     .attr("class", function (d) { return "group " + NameProvider[d.index]; });

// g.append("path")
//     .attr("class", "arc")
//     .style("stroke", function (d) { return fill(d.index); })
//     .style("fill", function (d) { return fill(d.index); })
//     .attr("d", arc)
//     .style("opacity", 0)
//     .transition().duration(1000)
//     .style("opacity", 0.4);

// /*//////////////////////////////////////////////////////////
// ////////////////// Initiate Ticks //////////////////////////
// //////////////////////////////////////////////////////////*/

// var ticks = svg.selectAll("g.group").append("g")
//     .attr("class", function (d) { return "ticks " + NameProvider[d.index]; })
//     .selectAll("g.ticks")
//     .attr("class", "ticks")
//     .data(groupTicks)
//     .enter().append("g")
//     .attr("transform", function (d) {
//         return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
//             + "translate(" + outerRadius + 40 + ",0)";
//     });


// /*Append the tick around the arcs*/
// ticks.append("svg:line")
//     .attr("x1", 1)
//     .attr("y1", 0)
//     .attr("x2", 5)
//     .attr("y2", 0)
//     .attr("class", "ticks")
//     .style("stroke", "#FFF");


// /*//////////////////////////////////////////////////////////
// ////////////////// Initiate Names //////////////////////////
// //////////////////////////////////////////////////////////*/

// g.append("text")
//     .each(function (d) { d.angle = (d.startAngle + d.endAngle) / 2; })
//     .attr("dy", ".35em")
//     .attr("class", "titles")
//     .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
//     .attr("transform", function (d) {
//         return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius + 55) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
//     })
//     .attr('opacity', 0)
//     .text(function (d, i) { return NameProvider[i]; });


// /*//////////////////////////////////////////////////////////	
// ///////////// Initiate Progress Bar ////////////////////////
// //////////////////////////////////////////////////////////*/

// /*Initiate variables for bar*/
// var progressColor = ["#D1D1D1", "#949494"],
//     progressClass = ["prgsBehind", "prgsFront"],
//     prgsWidth = 0.4 * 650,
//     prgsHeight = 3;
// /*Create SVG to visualize bar in*/
// var progressBar = d3.select("#progress").append("svg")
//     .attr("width", prgsWidth)
//     .attr("height", 3 * prgsHeight);
// /*Create two bars of which one has a width of zero*/
// progressBar.selectAll("rect")
//     .data([prgsWidth, 0])
//     .enter()
//     .append("rect")
//     .attr("class", function (d, i) { return progressClass[i]; })
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("width", function (d) { return d; })
//     .attr("height", prgsHeight)
//     .attr("fill", function (d, i) { return progressColor[i]; });

// /*//////////////////////////////////////////////////////////	
// /////////// Initiate the Center Texts //////////////////////
// //////////////////////////////////////////////////////////*/
// /*Create wrapper for center text*/
// var textCenter = svg.append("g")
//     .attr("class", "explanationWrapper");

// /*Starting text middle top*/
// var middleTextTop = textCenter.append("text")
//     .attr("class", "explanation")
//     .attr("id", "text1")
//     .attr("text-anchor", "middle")
//     .attr("x", 0 + "px")
//     .attr("y", -24 * 10 / 2 + "px")
//     .attr("dy", "1em")
//     .attr("opacity", 1)
//     .text("Our organization Bank Of Money hosts about a million devices/workstations. ")
//     .call(wrap, 350, "#text1");

// /*Starting text middle bottom*/
// var middleTextBottom = textCenter.append("text")

//     .attr("class", "explanation")
//     .attr("id", "text2")
//     .attr("text-anchor", "middle")

//     .attr("x", 0 + "px")
//     .attr("y", 24 * 3 / 2 + "px")
//     .attr("dy", "1em")
//     .attr('opacity', 1)
//     .text("It is imperative that we have a cyber security system that prevents the organization from getting compromised by attackers.")
//     .call(wrap, 350, "#text2");

// /*//////////////////////////////////////////////////////////
// //////////////// Storyboarding Steps ///////////////////////
// //////////////////////////////////////////////////////////*/

// var counter = 1,
//     buttonTexts = ["Ok", "Go on", "Continue", "Continue", "Go on", "Okay", "Okay", "Continue",
//         "Continue", "Continue", "Continue", "Continue", "Continue", "Finish"],
//     opacityValueBase = 0.8,
//     opacityValue = 0.4;

// /*Reload page*/
// d3.select("#reset")
//     .on("click", function (e) { location.reload(); });

// /*Skip to final visual right away*/
// d3.select("#skip")
//     .on("click", finalChord);


// /*Order of steps when clicking button*/
// d3.select("#clicker")
//     .on("click", function (e) {
//         updateReadings(10);
//         if (counter == 1) Draw1();
//         else if (counter == 2) Draw2();
//         else if (counter == 3) Draw3();
//         else if (counter == 4) Draw4();
//         else if (counter == 5) Draw5();
//         else if (counter == 6) Draw6();
//         else if (counter == 7) finalChord();

//         counter = counter + 1;
//     });



// /*//////////////////////////////////////////////////////////	
// //Introduction
// ///////////////////////////////////////////////////////////*/
// function Draw1() {
//     console.log("Draw1 function")

//     /*First disable click event on clicker button*/
//     stopClicker();

//     /*Show and run the progressBar*/
//     runProgressBar(time = 700 * 11);

//     changeTopText( "The Bank of Money is experiencing difficulties with its security infrastructure" +
//         "and it’s becoming difficult to drill down the issue causing it.",
//          4 / 2,  0,  1);

//     changeBottomText( "Let's start by drawing out the attacks faced over the past two days",
//          1 / 2,  0,  10);

//     changeTopText( "In the next few steps we would like to introduce you to the issues faced by our organization ",
//          8 / 2,  9,  1,  true);

//     //Remove arcs again
//     // d3.selectAll(".arc")
//     // 	.transition().delay(9*700).duration(2100)
//     // 	.style("opacity", 0)
//     // 	.on("end", function() {d3.selectAll(".arc").remove();});

// };/*Draw1*/

// /*//////////////////////////////////////////////////////////	
// //Show Arc of Port Scanning
// //////////////////////////////////////////////////////////*/
// function Draw2() {
//     console.log("Draw2 function")

//     /*First disable click event on clicker button*/
//     stopClicker();

//     /*Show and run the progressBar*/
//     runProgressBar(time = 700 * 2);

//     /*Initiate all arcs but only show the Port Scanning arc (d.index = 0)*/
//     g.append("path")
//         .style("stroke", function (d) { return fill(d.index); })
//         .style("fill", function (d) { return fill(d.index); })
//         .transition().duration(700)
//         .attr("d", arc)
//         .attrTween("d", function (d) {
//             if (d.index == 0) {
//                 var i = d3.interpolate(d.startAngle, d.endAngle);
//                 return function (t) {
//                     d.endAngle = i(t);
//                     return arc(d);
//                 }
//             }
//         });

//     /*Show the tick around the arc*/
//     d3.selectAll("g.group").selectAll("line")
//         .transition().delay(700).duration(1000)
//         .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

//     /*Show the  name*/
//     d3.selectAll(".titles")
//         .transition().duration(2000)
//         .attr("opacity", function (d, i) { return d.index ? 0 : 1; });

//     /*Switch  texts*/
//     changeTopText( "Firstly, a series of Port scanning events occur implying the presence of some external botnet trying to compromise the system",
//          1 / 2,  0,  1,  true);

//     changeBottomText( "",
//          0 / 2,  0,  1);

//     updateReadings(8);

// };/*Draw2*/

// /*///////////////////////////////////////////////////////////  
// //Draw arc for FTP/SSH Attack
// //////////////////////////////////////////////////////////*/
// function Draw3() {
//     console.log("Draw3 function")
//     /*First disable click event on clicker button*/
//     stopClicker();

//     /*Show and run the progressBar*/
//     runProgressBar(time = 700 * 2);

//     g.append("path")
//         .style("stroke", function (d) { return fill(d.index); })
//         .style("fill", function (d) { return fill(d.index); })
//         .transition().duration(700)
//         .attr("d", arc)
//         .attrTween("d", function (d) {
//             if (d.index == 1) {
//                 var i = d3.interpolate(d.startAngle, d.endAngle);
//                 return function (t) {
//                     d.endAngle = i(t);
//                     return arc(d);
//                 }
//             }
//         });

//     /*Make the other strokes black as well*/
//     d3.selectAll("g.group")
//         .transition().delay(700).duration(1000)
//         .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

//     /*Show the  name*/
//     d3.selectAll(".titles")
//         .transition().duration(2000)
//         .attr("opacity", function (d, i) { return d.index == 0 || d.index == 1 ? 1 : 0; });

//     changeTopText( "HTC has 5% of the market share",
//          6 / 2,  0,  1,  true);

//     changeBottomText( "Huawei came from practically no share in 2013 to 2.4% in 2014 thereby taking its place in the biggest 7 brands in the Netherlands",
//          -2 / 2,  0,  1);
//     updateReadings(6);
// };/*Draw3*/

// /*///////////////////////////////////////////////////////////  
// //Draw arc for SQL Attack
// //////////////////////////////////////////////////////////*/
// function Draw4() {
//     console.log("Draw4 function")
//     /*First disable click event on clicker button*/
//     stopClicker();

//     /*Show and run the progressBar*/
//     runProgressBar(time = 700 * 2);

//     g.append("path")
//         .style("stroke", function (d) { return fill(d.index); })
//         .style("fill", function (d) { return fill(d.index); })
//         .transition().duration(700)
//         .attr("d", arc)
//         .attrTween("d", function (d) {
//             if (d.index == 2) {
//                 var i = d3.interpolate(d.startAngle, d.endAngle);
//                 return function (t) {
//                     d.endAngle = i(t);
//                     return arc(d);
//                 }
//             }
//         });

//     /*Make the other strokes black as well*/
//     d3.selectAll("g.group")
//         .transition().delay(700).duration(1000)
//         .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

//     /*Add the labels for the %'s*/
//     d3.selectAll("g.group").selectAll(".tickLabels")
//         .transition().delay(700).duration(2000)
//         .attr("opacity", 0);

//     /*Show the  name*/
//     d3.selectAll(".titles")
//         .transition().duration(2000)
//         .attr("opacity", function (d, i) { return d.index == 0 || d.index == 1 || d.index == 2 ? 1 : 0; });

//     changeTopText( "LG has almost 5% of the market",
//          6 / 2,  0,  1,  true);

//     changeBottomText( "Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
//          -2 / 2,  0,  1);
//     updateReadings(4);

// };


// /*///////////////////////////////////////////////////////////  
// //Draw arc for Data Outage
// //////////////////////////////////////////////////////////*/
// function Draw5() {
//     console.log("Draw5 function")
//     /*First disable click event on clicker button*/
//     stopClicker();

//     /*Show and run the progressBar*/
//     runProgressBar(time = 700 * 2);

//     g.append("path")
//         .style("stroke", function (d) { return fill(d.index); })
//         .style("fill", function (d) { return fill(d.index); })
//         .transition().duration(700)
//         .attr("d", arc)
//         .attrTween("d", function (d) {
//             if (d.index == 3) {
//                 var i = d3.interpolate(d.startAngle, d.endAngle);
//                 return function (t) {
//                     d.endAngle = i(t);
//                     return arc(d);
//                 }
//             }
//         });

//     /*Make the other strokes black as well*/
//     d3.selectAll("g.group")
//         .transition().delay(700).duration(1000)
//         .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });

//     /*Show the  name*/
//     d3.selectAll(".titles")
//         .transition().duration(2000)
//         .attr("opacity", function (d, i) { return d.index == 0 || d.index == 1 || d.index == 2 || d.index == 3 ? 1 : 0; });


//     changeTopText( "LG has almost 5% of the market",
//          6 / 2,  0,  1,  true);

//     changeBottomText( "Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
//          -2 / 2,  0,  1);
//     updateReadings(2);

// };
// /*///////////////////////////////////////////////////////////  
// //Draw arc for DNS attack
// //////////////////////////////////////////////////////////*/
// function Draw6() {
//     console.log("Draw6 function")
//     /*First disable click event on clicker button*/
//     stopClicker();

//     /*Show and run the progressBar*/
//     runProgressBar(time = 700 * 2);

//     g.append("path")
//         .style("stroke", function (d) { return fill(d.index); })
//         .style("fill", function (d) { return fill(d.index); })
//         .transition().duration(700)
//         .attr("d", arc)
//         .attrTween("d", function (d) {
//             if (d.index == 4) {
//                 var i = d3.interpolate(d.startAngle, d.endAngle);
//                 return function (t) {
//                     d.endAngle = i(t);
//                     return arc(d);
//                 }
//             }
//         });

//     /*Make the other strokes black as well*/
//     d3.selectAll("g.group")
//         .transition().delay(700).duration(1000)
//         .style("stroke", function (d, i, j) { return j ? 0 : "#000"; });


//     /*Show the  name*/
//     d3.selectAll(".titles")
//         .transition().duration(2000)
//         .attr("opacity", 1);

//     changeTopText( "LG has almost 5% of the market",
//          6 / 2,  0,  1,  true);

//     changeBottomText( "Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
//          -2 / 2,  0,  1);
//     updateReadings(0);
// };

// /*Go to the final bit*/
// function finalChord() {

//     /*Remove button*/
//     d3.select("#clicker")
//         .style("visibility", "hidden");
//     d3.select("#skip")
//         .style("visibility", "hidden");
//     d3.select("#progress")
//         .style("visibility", "hidden");

//     /*Remove texts*/
//     changeTopText( "",
//          0,  0,  1);
//     changeBottomText( "",
//          0,  0,  1);

//     /*Create arcs or show them, depending on the point in the visual*/
//     if (counter <= 4) {
//         g.append("svg:path")
//             .style("stroke", function (d) { return fill(d.index); })
//             .style("fill", function (d) { return fill(d.index); })
//             .attr("d", arc)
//             .style("opacity", 0)
//             .transition().duration(1000)
//             .style("opacity", 1);

//     } else {
//         /*Make all arc visible*/
//         svg.selectAll("g.group").select("path")
//             .transition().duration(1000)
//             .style("opacity", 1);
//     };

//     /*Make mouse over and out possible*/
//     d3.selectAll(".group")
//         .on("mouseover", fade(.02))
//         .on("mouseout", fade(.80));


//     /*Show all the text*/
//     d3.selectAll("g.group").selectAll("line")
//         .transition().duration(100)
//         .style("stroke", "#000");

//     /*And the Names of each Arc*/
//     svg.selectAll("g.group")
//         .transition().duration(100)
//         .selectAll(".titles").style("opacity", 1);

// };

// /*//////////////////////////////////////////////////////////
// ////////////////// Extra Functions /////////////////////////
// //////////////////////////////////////////////////////////*/

// /*Returns an event handler for fading a given chord group*/
// function fade(opacity) {
//     return function (d, i) {
//         svg.selectAll("path.chord")
//             .filter(function (d) { return d.source.index != i && d.target.index != i; })
//             .transition()
//             .style("stroke-opacity", opacity)
//             .style("fill-opacity", opacity);
//     };
// };/*fade*/

// /*Returns an array of tick angles and labels, given a group*/
// function groupTicks(d) {
//     var k = (d.endAngle - d.startAngle) / d.value;
//     return d3.range(0, d.value, 1).map(function (v, i) {
//         return {
//             angle: v * k + d.startAngle,
//             label: i % 5 ? null : v + "%"
//         };
//     });
// };/*groupTicks*/

// /*Taken from https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
// //Calls a function only after the total transition ends*/
// function endall(transition, callback) {
//     var n = 0;
//     transition
//         .each(function () { ++n; })
//         .on("end", function () {
//             if (!--n)
//                 callback.apply(this, arguments);
//         });
// };/*endall*/

// /*Taken from http://bl.ocks.org/mbostock/7555321
// //Wraps SVG text*/
// function wrap(text, width, id) {
//     var text = d3.select(id),
//         words = text.text().split(/\s+/).reverse(),
//         word,
//         line = [],
//         lineNumber = 0,
//         lineHeight = 1.4,
//         y = text.attr("y"),
//         x = text.attr("x"),
//         dy = parseFloat(text.attr("dy")),
//         tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

//     while (word = words.pop()) {
//         line.push(word);
//         tspan.text(line.join(" "));
//         if (tspan.node().getComputedTextLength() > width) {
//             line.pop();
//             tspan.text(line.join(" "));
//             line = [word];
//             tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
//         };
//     };
// };


// /*Transition the top circle text*/
// function changeTopText(newText, loc, delayDisappear, delayAppear, finalText, xloc, w) {
//     /*If finalText is not provided, it is not the last text of the Draw step*/
//     if (typeof (finalText) === 'undefined')  false;

//     if (typeof (xloc) === 'undefined') x 0;
//     if (typeof (w) === 'undefined') w = 350;

//     middleTextTop
//         /*Current text disappear*/
//         .transition().delay(700 * delayDisappear).duration(700)
//         .attr('opacity', 0)
//         /*New text appear*/
//         .call(endall, function () {
//             middleTextTop.text(newText)
//                 .attr("id", "middleText")
//                 .attr("y", -24 * loc + "px")
//                 .attr("x", xloc + "px")
//                 .call(wrap, w, "#middleText");
//         })
//         .transition().delay(700 * delayAppear).duration(700)
//         .attr('opacity', 1)
//         .call(endall, function () {
//             if (= true) {
//                 d3.select("#clicker")
//                     .text(buttonTexts[counter - 2])
//                     .style("pointer-events", "auto")
//                     .transition().duration(400)
//                     .style("border-color", "#363636")
//                     .style("color", "#363636");
//             };
//         });
// };/*changeTopText */

// /*Transition the bottom circle text*/
// function changeBottomText(newText, loc, delayDisappear, delayAppear) {
//     middleTextBottom
//         /*Current text disappear*/
//         .transition().delay(700 * delayDisappear).duration(700)
//         .attr('opacity', 0)
//         .attr("id", "bottomText")
//         /*New text appear*/
//         .call(endall, function () {
//             console.log(d3.select(this))
//             middleTextBottom.text(newText)

//                 .attr("y", 24 * loc + "px")
//                 .call(wrap, 350, "#bottomText");
//         })
//         .transition().delay(700 * delayAppear).duration(700)
//         .attr('opacity', 1);
//     ;
// }/*changeTopText*/

// /*Stop clicker from working*/
// function stopClicker() {
//     d3.select("#clicker")
//         .style("pointer-events", "none")
//         .transition().duration(400)
//         .style("border-color", "#D3D3D3")
//         .style("color", "#D3D3D3");
// };/*stopClicker*/

// /*Run the progress bar during an animation*/
// function runProgressBar(time) {

//     /*Make the progress div visible*/
//     d3.selectAll("#progress")
//         .style("visibility", "visible");

//     /*Linearly increase the width of the bar
//     //After it is done, hide div again*/
//     d3.selectAll(".prgsFront")
//         .transition().duration(time).ease(d3.easeLinear)
//         .attr("width", prgsWidth)
//         .call(endall, function () {
//             d3.selectAll("#progress")
//                 .style("visibility", "hidden");
//         });

//     /*Reset to zero width*/
//     d3.selectAll(".prgsFront")
//         .attr("width", 0);

// };/*runProgressBar*/

// var gauge = function (container, configuration) {
//     var that = {};
//     var config = {
//         size: 200,
//         clipWidth: 200,
//         clipHeight: 110,
//         ringInset: 20,
//         ringWidth: 20,

//         pointerWidth: 10,
//         pointerTailLength: 5,
//         pointerHeadLengthPercent: 0.9,

//         minValue: 100,
//         maxValue: 0,

//         minAngle: -90,
//         maxAngle: +90,

//         transitionMs: 750,

//         majorTicks: 5,
//         labelFormat: d3.format(''),
//         labelInset: 11,

//         arcColorFn: d3.interpolateHsl(d3.rgb('#eb1313'), d3.rgb('#ed8a9c'))
//     };
//     var rangeGauge = undefined;
//     var r = undefined;
//     var pointerHeadLength = undefined;
//     var value = 0;

//     var arc_gauge = undefined;
//     var scale_gauge = undefined;
//     var ticks_gauge = undefined;
//     var tickData_gauge = undefined;
//     var pointer = undefined;

//     var donut = d3.pie();

//     function deg2rad(deg) {
//         return deg * Math.PI / 180;
//     }

//     function newAngle(d) {
//         var ratio = scale_gauge(d);
//         var newAngle = config.minAngle + (ratio * rangeGauge);
//         return newAngle;
//     }

//     function configure(configuration) {
//         var prop = undefined;
//         for (prop in configuration) {
//             config[prop] = configuration[prop];
//         }

//         rangeGauge = config.maxAngle - config.minAngle;
//         r = config.size / 2;
//         pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);
//         // a linear scale that maps domain values to a percent from 0..1
//         scale_gauge = d3.scaleLinear()
//             //.range([0,1])
//             .domain([100, 0]);


//         ticks_gauge = scale_gauge.ticks(config.majorTicks);
//         tickData_gauge = d3.range(config.majorTicks).map(function () { var x = 1 / config.majorTicks; return Number(x); });

//         arc_gauge = d3.arc()
//             .innerRadius(r - config.ringWidth - config.ringInset)
//             .outerRadius(r - config.ringInset)
//             .startAngle(function (d, i) {
//                 var ratio = d * i;
//                 return deg2rad(config.minAngle + (ratio * rangeGauge));
//             })
//             .endAngle(function (d, i) {
//                 var ratio = d * (i + 1);
//                 return deg2rad(config.minAngle + (ratio * rangeGauge));
//             });
//     }
//     that.configure = configure;

//     function centerTranslation() {
//         console.log("Radius");
//         console.log(r);
//         return 'translate(' + (r + 400) + ',' + (r - 300) + ')';
//     }

//     function isRendered() {
//         return (svg !== undefined);
//     }
//     that.isRendered = isRendered;

//     function render(newValue) {

//         // svg = d3.select(container)
//         // 	.append('svg:svg')
//         // 		.attr('class', 'gauge')
//         // 		.attr('width', config.clipWidth)
//         // 		.attr('height', config.clipHeight);

//         var centerTx = centerTranslation();

//         var arcs_gauge = svg.append('g')
//             .attr('class', 'arc')
//             .attr('transform', centerTx);

//         arcs_gauge.selectAll('path')
//             .data(tickData_gauge)
//             .enter().append('path')
//             .attr('fill', function (d, i) {
//                 return config.arcColorFn(d * i);
//             })
//             .attr('d', arc_gauge);

//         var lg = svg.append('g')
//             .attr('class', 'label')
//             .attr('transform', centerTx);
//         lg.selectAll('text')
//             .data(ticks_gauge)
//             .enter().append('text')
//             .attr('transform', function (d) {
//                 var ratio = scale_gauge(d);
//                 var newAngle = config.minAngle + (ratio * rangeGauge);
//                 return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
//             })
//             .text(config.labelFormat);

//         var lineData = [[config.pointerWidth / 2, 0],
//         [0, -pointerHeadLength],
//         [-(config.pointerWidth / 2), 0],
//         [0, config.pointerTailLength],
//         [config.pointerWidth / 2, 0]];
//         var pointerLine = d3.line().curve(d3.curveMonotoneX);
//         var pg = svg.append('g').data([lineData])
//             .attr('class', 'pointer')
//             .attr('transform', centerTx);


//         pointer = pg.append('path')
//             .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/)
//             .attr('transform', 'rotate(' + config.maxAngle + ')');

//         update(newValue === undefined ? 0 : newValue);
//     }
//     that.render = render;

//     function update(newValue, newConfiguration) {
//         if (newConfiguration !== undefined) {
//             configure(newConfiguration);
//         }
//         var ratio = scale_gauge(newValue);
//         var newAngle = config.minAngle + (ratio * rangeGauge);
//         console.log("Min angle ::: " + newAngle + "ratio:::::" + ratio + "newAngle:::::" + newAngle);
//         pointer.transition()
//             .duration(config.transitionMs)
//             //.ease('elastic')
//             .attr('transform', 'rotate(' + newAngle + ')');
//     }
//     that.update = update;

//     configure(configuration);

//     return that;
// };



// var powerGauge = gauge('#power-gauge', {
//     size: 300,
//     clipWidth: 300,
//     clipHeight: 300,
//     ringWidth: 60,
//     maxValue: 0,
//     transitionMs: 4000,
// });
// powerGauge.render();
// //var i =10;

// function updateReadings(i) {
//     // just pump in random data here...
//     if (i >= 0) {
//         powerGauge.update(i * 10);
//         i--;
//     } else {
//         i = 10;
//     }
// }


// // every few seconds update reading values
// // updateReadings();
// // setInterval(function() {
// // 	updateReadings();
// // }, 5 * 1000);
