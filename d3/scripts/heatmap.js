export {Heatmap};
import {getIPBucket} from './utils.js';


var file = "../data/aggregated_data.csv"
var tooltipDiv;
var svg;
var heatmapData;
var margin = {top: 40, right: 50, bottom: 150, left: 90};
const svgScreenWidth = +d3.select("#heatmap_div").style("width").slice(0,-2);
var width = svgScreenWidth;
var height = 450 - margin.top - margin.bottom;
const BAR_HEIGHT = 20;
const COLOR_START = "#fac2c2", COLOR_END = "#f03434";
const titlex = width / 2;
const titley = 1;
const xlabelx = width / 2;
const xlabely = height + margin.top + 40;
const ylabelx = 25;
const ylabely = (height  + margin.top)/ 2;

function Heatmap(startTime, endTime, machine = undefined) {
    if(heatmapData == undefined) {
        tooltipDiv = d3.select('div.tooltip');
        svg = d3.select("#heatmap_div").append("svg");
        readData().then(data => {
            heatmapData = data;
            svg
                .attr("width", width )
                .attr("height", height + margin.top + margin.bottom);
            drawHeatMap(startTime, endTime, machine);
            drawAxis();
        }).catch(err => {
            console.error(err);
            return;
        });
    } else {
        drawHeatMap(startTime, endTime, machine);
        drawAxis();
    }
}

function drawHeatMap(startTime, endTime, machine) {
    svg.selectAll("*").remove();
    let filteredData = heatmapData.filter(record => record.datetime >= startTime && record.datetime <= endTime);
    
    if(machine)
        filteredData = filteredData.filter(record => getIPBucket(record.sourceIP).machine.toLowerCase() == machine.toLowerCase())
    
    const ip_addresses = ['DNS', 'IDS', 'Firewall', 'Workstation', 'Websites', 'Log Server', 'Financial Server'];
    const portSet = new Set([21, 22, 53, 80, 1433, 1521, 3306, 5432, 6667, -1, -2, -3, -4, -5]);
    const ports = Array.from(portSet).map(String);
    const portMachineMap = {
        "21": "FTP",
        "22": "SSH",
        "53": "DNS",
        "80": "HTTP",
        "1433": "MSSQL",
        "1521": "Oracle",
        "3306": "MySQL",
        "5432": "PostgreSQL", 
        "6667": "IRC"
    }
    const portRangeMap = {
        "-1": "0-1k",
        "-2": "1k-2k",
        "-3": "2k-3k",
        "-4": "3k-4k",
        "-5": "4k-5k"
    }
    let events = [];

    let event_groups = d3.group(filteredData, 
        d => getIPBucket(d.sourceIP).machine, 
        d => {
            let port = +d.destinationPort, portVal;
            if(portSet.has(port))
                portVal = port;
            else if(d.sourcePort === '6667')
                portVal = 6667;
            else 
                portVal = getPortRange(port)
            return portVal;
        }
    );

    event_groups.forEach((v, machine) => {
        v.forEach((attacks, portVal) => {
            let conn = {
                ip: machine,
                port: portVal,
                numAttacks: attacks.length
            }
            events.push(conn);
        });
    });

    let dataMap = {};
    events.forEach(e => {
        if(!(e.ip in dataMap))
            dataMap[e.ip]= new Set();
        dataMap[e.ip].add(e.port);
    });

    for(const ip of ip_addresses) {
        for(const p of portSet) {
            if(!(ip in dataMap) || !(dataMap[ip].has(p)))
                events.push({
                    ip: ip,
                    port: p,
                    numAttacks: 0
                });
        }
    }

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ 0, width - margin.left - margin.right ])
        .domain(ports)
        .padding(0.05);
        svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top + 10) + ")")
        .call(d3.axisBottom(x).tickSize(0).tickFormat(function(d) {
            if(d in portRangeMap)
                return portRangeMap[d];
            return d;
            }))
        .select(".domain").remove();

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(ip_addresses)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove();

    // Build color scale
    var max = d3.max(events, function (d) { return d.numAttacks});
    
    var colorScale = d3.scaleLinear()
        .range([COLOR_START, COLOR_END])
        .domain([0, max]);
    drawLegend(colorScale);

    var mouseover = function(e, d, elt) {
        drawTooltip(e, d);
        d3.select(elt)
            .style("stroke", "#aaa")
            .style("stroke-width", 2);
    }
    var mousemove = function(e) {
        tooltipDiv
            .style("left", (e.pageX + 20) + "px")
            .style("top", (e.pageY - 10) + "px");
    }
    var mouseleave = function(elt) {
        tooltipDiv.html('');
        tooltipDiv
            .style("opacity", 0)
            .style("border-color", "transparent");
        
        
    d3.select(elt)
        .style("stroke", "none")
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth());
    }

    // add the squares
    svg.append("g").attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
    .selectAll()
        .data(events)
        .enter()
        .append("rect")
        .attr("class", "heatmap-rects")
        .attr("x", function(d) { return x(""+d.port) })
        .attr("y", function(d) { return y(d.ip) })
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function(d) { 
            if(machine && (machine.toLowerCase() == d.ip.toLowerCase()))
                return colorScale(d.numAttacks);
            else if(!machine)
                return colorScale(d.numAttacks);
            else return "#ccc";
            })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 1)
        .on("mouseover", function(e,d) { mouseover(e, d, this) })
        .on("mousemove", function(e) { mousemove(e)})
        .on("mouseleave", function() { mouseleave(this)});
}

function readData() {
    return new Promise((resolve, reject) => {
        d3.csv(file, function(d) {
            return {
                // extract important data features
                datetime : Date.parse(d['date_time']),
                sourceIP : d['source_ip'],
                destinationPort : d['destination_port'],
                sourcePort : d['source_port'],
                numAttacks: 0
            }
        }).then(function(data) {
            resolve(data);
        }).catch(function(err) {
            reject(err);
        });
    });
}

function getPortRange(port) {
    let portVal;

    switch (true) {
        case port >= 0 && port <= 1000:
            portVal = -1;
            break;
        case port > 1000 && port <= 2000:
            portVal = -2;
            break;
        case port > 2000 && port <= 3000:
            portVal = -3;
            break;
        case port > 3000 && port <= 4000:
            portVal = -4;
            break;
        case port > 4000 && port <= 5000:
            portVal = -5;
            break;
    }
    return portVal;
}

function drawTooltip(event, d) {
    const portRangeMap = {
        "-1": "Others (0-1000)",
        "-2": "Others (1000-2000)",
        "-3": "Others (2000-3000)",
        "-4": "Others (3000-4000)",
        "-5": "Others (4000-5000)"
    }
    const portMachineMap = {
        "21": "FTP",
        "22": "SSH",
        "53": "DNS",
        "80": "HTTP",
        "1433": "MSSQL",
        "1521": "Oracle",
        "3306": "MySQL",
        "5432": "PostgreSQL", 
        "6667": "IRC"
    }
    tooltipDiv.transition()
        .duration(50)
        .style("opacity", 1);
    
    let port;
    if(d.port in portRangeMap) {
        port = portRangeMap[d.port];
    } else
        port = portMachineMap[d.port] + " (" + d.port + ")";
    tooltipDiv.html(
            "From: " + d.ip + "<br>" +
            "To: " + port + "<br>" +
            "Num of Connections: " + d.numAttacks
        );

    tooltipDiv
        .style("left", (event.pageX + 20) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("text-align", "left");
}

function drawLegend(colorScale) {

    let newWidth = width - margin.left - margin.right;
    const defs = svg.append("defs");
    const axisScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, newWidth]);

    const axisBottom = g => g
        .attr("class", `x-axis`)
        .attr("transform", `translate(${margin.left},${(height + 2 * margin.top + 2 * BAR_HEIGHT)})`)
        .call(d3.axisBottom(axisScale)
                .ticks(newWidth/100)
                .tickSize(-BAR_HEIGHT)
            );

    const linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");
    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svg.append('g')
        .attr("transform", `translate(${margin.left},${height + 2 * margin.top + BAR_HEIGHT})`)
        .append("rect")
        .attr("width", newWidth)
        .attr("height", BAR_HEIGHT)
        .style("fill", "url(#linear-gradient)")
        .style("position", "absolute");
    
    svg.append("text")
        .attr("x", margin.left-15)
        .attr("y", (height + 2 * margin.top + 3 * BAR_HEIGHT))
        .text("Connections");

    svg.append("text")
        .attr("x", (newWidth + 50))
        .attr("y", (height + 2 * margin.top + 3 * BAR_HEIGHT))
        .text("Connections");

    svg.append('g').call(axisBottom);
}

function drawAxis() {

    svg.append("text")
        .attr("x", xlabelx)
        .attr("y", xlabely)
        .attr("text-anchor", "middle")
        .style("font-size", "1em")
        .text("Ports connected / attacked");

    // adapted from https://stackoverflow.com/a/30417969
    svg.append("g")
        .attr('transform', 'translate(' + ylabelx + ', ' + ylabely + ')')
        .append('text')
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "1em")
        .text("Machine");
}
