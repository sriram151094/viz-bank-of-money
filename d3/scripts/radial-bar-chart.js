export { initRadialChart, drawRadialChart }
var width = 960, height = 450, chartRadius = height / 2 - 40;
var events;


const color = d3.scaleOrdinal(d3.schemeCategory10);

const PI = Math.PI,
    arcMinRadius = 10,
    arcPadding = 10,
    labelPadding = -5,
    numTicks = 10;

var data;
var numArcs;
var arcWidth;

var mssql = 0;
var postgressql = 0;
var mysql = 0;
var oraclesql = 0;
var dnsupdateexternal = 0;
var ircauth = 0;
var portscan5800 = 0;
var portscan5900 = 0;

var sshscan = 0;
var sshscanoutbound = 0;

var radialSvg;
var tooltip;

function initRadialChart(starttime, endtime) {
    width = +d3.select("#radialBarChart").style("width").slice(0, -2);
    window.addEventListener('DOMContentLoaded', (event) => {
    
        

        var chartWindow = d3.select('#radialBarChart');
        radialSvg = chartWindow.append('svg')
            .attr('id', 'radialBar')
            //.attr("viewBox", [-width / 4, -height / 4, width, height])
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + (height + 25) / 2 + ')');
    
        tooltip = d3.select(".tooltip");
    
        Promise.all([d3.csv('./data/aggregated_data.csv')])
        .then(vals => {
            data = vals[0];
            drawRadialChart(starttime, endtime);
    
        });
    
    });
}

function getData(starttime, endtime) { 
    dnsupdateexternal = data.filter(function (d) { return (d.label.includes("DNS Update From External net") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    ircauth = data.filter(function (d) { return (d.label.includes("IRC authorization message") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    postgressql = data.filter(function (d) { return (d.label.includes("PostgreSQL") && Date.parse(d.datetime) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    mysql = data.filter(function (d) { return (d.label.includes("mySQL") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    mssql = data.filter(function (d) { return (d.label.includes("MSSQL") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    oraclesql= data.filter(function (d) { return (d.label.includes("Oracle SQL") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    portscan5800 = data.filter(function (d) { return (d.label.includes("VNC Scan 5800-5820") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    portscan5900 = data.filter(function (d) { return (d.label.includes("VNC Scan 5900-5920") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    sshscan = data.filter(function (d) { return (d.label.includes("[1:2001219:18] ET SCAN Potential SSH Scan") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    sshscanoutbound = data.filter(function (d) { return (d.label.includes("SSH Scan OUTBOUND") && Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime) }).length;
    
    events = [
        { name: "Port Scan 5800-5820", value: portscan5800 },
        { name: "Port Scan 5900-5920", value: portscan5900 },
        { name: "SSH Scan", value: sshscan },
        { name: "SSH Scan Outbound", value: sshscanoutbound },
        { name: "DNS Update From External Net", value: dnsupdateexternal },
        { name: "IRC authorization message", value: ircauth },
        { name: "PostgreSQL Attack", value: postgressql },
        { name: "My SQL Attack", value: mysql },
        { name: "MS SQL Attack", value: mssql },
        { name: "Oracle SQL Attack", value: oraclesql },
    ];

}


function drawRadialChart(starttime, endtime) {
    d3.selectAll("#aaxis")
        .remove();
    d3.selectAll("#radialaxis")
        .remove();
    d3.selectAll("#arcs")
        .remove();
    d3.selectAll("#radialline")
        .remove();
    d3.selectAll("#labels")
        .remove();

    getData(starttime, endtime);

    let scale = d3.scaleLinear()
        .domain([0, d3.max(events, function (d) { return d.value; }) * 1.1])
        .range([0, 2 * PI]);

    let ticks = scale.ticks(numTicks).slice(0, -1);
    let keys = events.map((d, i) => d.name);
    //   let keys = events;
    //number of arcs
    numArcs = keys.length;
    arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

    let arc = d3.arc()
        .innerRadius((d, i) => getInnerRadius(i))
        .outerRadius((d, i) => getOuterRadius(i))
        .startAngle(0)
        .endAngle((d, i) => scale(d))

    let radialAxis = radialSvg.append('g')
        .attr('class', 'r axis')
        .attr("id", "radialaxis")
        .selectAll('g')
        .data(events)
        .enter().append('g');

    radialAxis.append('circle')
        .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

    radialAxis.append('text')
        .attr('x', labelPadding)
        .attr("id", "labels")
        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
        .text(d => d.name);

    let axialAxis = radialSvg.append('g')
        .attr('class', 'a axis')
        .attr("id", "aaxis")
        .selectAll('g')
        .data(ticks)
        .enter().append('g')
        .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

    axialAxis.append('line')
        .attr('x2', chartRadius)
        .attr("id", "radialline");

    axialAxis.append('text')
        .attr('x', chartRadius + 10)
        .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
        .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
        .text(d => d);

    //data arcs
    let arcs = radialSvg.append('g')
        .attr('class', 'data')
        .attr("id", "arcs")
        .selectAll('path')
        .data(events)
        .enter().append('path')
        .attr('class', 'arc')
        .style('fill', (d, i) => color(i))

    arcs.transition()
        .delay((d, i) => i * 200)
        .duration(1000)
        .attrTween('d', arcTween);

    arcs.on('mousemove', (e,d) => showTooltip(e,d))
    arcs.on('mouseout', hideTooltip)

    function arcTween(d, i) {
        let interpolate = d3.interpolate(0, d.value);
        return t => arc(interpolate(t), i);
    }

    function showTooltip(event,d) {
        // tooltip.style('left', (event.pageX + 10) + 'px')
        //     .style('top', (event.pageY - 25) + 'px')
        //     .style('display', 'inline-block')
        //     .html(d.value);
        tooltip.transition()
        .duration(50)
        .style("opacity", 1);

        tooltip.style("left", (event.pageX + 20) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("text-align", "left")
        .html("Number of flags raised by Intrusion Detection System : "+d.value);
    }


    function hideTooltip() {
        // tooltip.style('display', 'none');
        tooltip.transition()
        .duration('50')
        .style("opacity", 0);
    }

    function rad2deg(angle) {
        return angle * 180 / PI;
    }
    
    function getInnerRadius(index) {
        return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
    }
    
    function getOuterRadius(index) {
        return getInnerRadius(index) + arcWidth;
    }

    
}

