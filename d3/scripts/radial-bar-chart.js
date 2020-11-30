export { initRadialChart, drawRadialChart }
import { getIPBucket } from './utils.js';
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
var startTime = '02:30';
var endTime = '21:30';
var startDate = '2012-04-05';
var endDate = '2012-04-05';

var sshscan = 0;
var sshscanoutbound = 0;

var radialSvg;
var tooltip;
var data1;
var data2;

function initRadialChart(starttime, endtime) {
    width = +d3.select("#radialBarChart").style("width").slice(0, -2);

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
}

function getData(starttime, endtime, machine) {

    // filteredData = res.filter(log => {
    //     let d = Date.parse(log['date_time'])
    //     return (d >= start && d <= end)
    // })
    data1 = data.filter(d => { return Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime });
    // data = data.filter(function (d) { return Date.parse(d.date_time) >= starttime && Date.parse(d.date_time) <= endtime });
    if (machine) {
        data2 = data1.filter(record => getIPBucket(record['source_ip']).machine.toLowerCase() == machine.toLowerCase() ||
            (machine == 'dns' && getIPBucket(record['destination_ip']).machine.toLowerCase() == machine.toLowerCase()))
        console.log(data2)
        dnsupdateexternal = data2.filter(d => { return d.label.includes("DNS Update From External net") }).length;
        ircauth = data2.filter(d => { return (d.label.includes("IRC authorization message")) }).length;
        postgressql = data2.filter(d => { return (d.label.includes("PostgreSQL")) }).length;
        mysql = data2.filter(d => { return (d.label.includes("mySQL")) }).length;
        mssql = data2.filter(d => { return (d.label.includes("MSSQL")) }).length;
        oraclesql = data2.filter(d => { return (d.label.includes("Oracle SQL")) }).length;
        portscan5800 = data2.filter(d => { return (d.label.includes("VNC Scan 5800-5820")) }).length;
        portscan5900 = data2.filter(d => { return (d.label.includes("VNC Scan 5900-5920")) }).length;
        sshscan = data2.filter(d => { return (d.label.includes("[1:2001219:18] ET SCAN Potential SSH Scan")) }).length;
        sshscanoutbound = data2.filter(d => { return (d.label.includes("SSH Scan OUTBOUND")) }).length;
    }
    else {
        dnsupdateexternal = data1.filter(d => { return d.label.includes("DNS Update From External net") }).length;
        ircauth = data1.filter(d => { return (d.label.includes("IRC authorization message")) }).length;
        postgressql = data1.filter(d => { return (d.label.includes("PostgreSQL")) }).length;
        mysql = data1.filter(d => { return (d.label.includes("mySQL")) }).length;
        mssql = data1.filter(d => { return (d.label.includes("MSSQL")) }).length;
        oraclesql = data1.filter(d => { return (d.label.includes("Oracle SQL")) }).length;
        portscan5800 = data1.filter(d => { return (d.label.includes("VNC Scan 5800-5820")) }).length;
        portscan5900 = data1.filter(d => { return (d.label.includes("VNC Scan 5900-5920")) }).length;
        sshscan = data1.filter(d => { return (d.label.includes("[1:2001219:18] ET SCAN Potential SSH Scan")) }).length;
        sshscanoutbound = data1.filter(d => { return (d.label.includes("SSH Scan OUTBOUND")) }).length;
    }


    events = [
        { name: "Port Scan 5800-5820", value: portscan5800 },
        { name: "Port Scan 5900-5920", value: portscan5900 },
        { name: "SSH Scan", value: sshscan },
        { name: "SSH Scan Outbound", value: sshscanoutbound },
        { name: "DNS Update From External Net", value: dnsupdateexternal },
        { name: "IRC Authorization message", value: ircauth },
        { name: "PostgreSQL Attack", value: postgressql },
        { name: "MySQL Attack", value: mysql },
        { name: "MS SQL Attack", value: mssql },
        { name: "Oracle SQL Attack", value: oraclesql },
    ];

}


function drawRadialChart(starttime, endtime, machine = undefined) {
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
    d3.selectAll("#conntext")
        .remove();

    // TODO : remove/handle : Temp fix
    if (!starttime || !endtime) {
        starttime = Date.parse(startDate + ' ' + startTime);
        endtime = Date.parse(endDate + ' ' + endTime);
    }

    getData(starttime, endtime, machine);

    if (machine) {
        if (data2.length == 0) {
            d3.selectAll("#radialbar").append('text')
                .attr("id", "conntext")
                .attr('x', (width - 15) / 2.5)
                .attr('y', height / 2)
                //.style('font-size', '20px')
                .text('No flags found for the selected machine')
            return;
        }
    }

    let scale = d3.scaleLinear()
        .domain([0, d3.max(events, function (d) {
            return d.value;
        }) * 1.1])
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

    arcs.on('mousemove', (e, d) => showTooltip(e, d))
    arcs.on('mouseout', hideTooltip)

    function arcTween(d, i) {
        let interpolate = d3.interpolate(0, d.value);
        return t => arc(interpolate(t), i);
    }

    function showTooltip(event, d) {
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
            .html("Number of flags raised by Intrusion Detection System : " + d.value);
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

