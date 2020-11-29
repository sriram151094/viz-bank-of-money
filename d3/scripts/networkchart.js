export { network, drawNetworkChart };
import { getIPBucket } from './utils.js';

var networkSvg;
var width = 500;
var height = 500;
var startTime;
var endTime;
var date;
var defs
var toolTip
var margin = { top: 15, bottom: 10, left: 15, right: 10 }
var fullData = []

function network(start, end) {
    startTime = start
    endTime = end
    const svgScreenWidth = +d3.select("#networkChart").style("width").slice(0, -2);
    width = svgScreenWidth - margin.left - margin.right;
    var chartWindow = d3.select('#networkChart');
    networkSvg = chartWindow.append('svg')
        .attr('id', 'network')
        //.attr("viewBox", [-width / 4, -height / 4, width, height])
        .attr('width', width)
        .attr('height', height)
    d3.csv('../data/aggregated_data.csv').then(res => {
        fullData = res;
        drawNetworkChart(startTime, endTime);
    })

    toolTip = d3.select("body").append("div")
        .attr("class", "tooltip")
}


function getFireWallData(start, end, machine) {
    return new Promise((resolve, reject) => {
        // TODO : remove/handle : Temp fix
        if (!start || !end) {
            start = Date.parse(date + ' ' + startTime);
            end = Date.parse(date + ' ' + endTime);
        }

        let filteredData = fullData.filter(log => {
            let d = Date.parse(log['date_time'])
            return (d >= start && d <= end)
        })

        if (machine)
            filteredData = filteredData.filter(record =>
                getIPBucket(record['source_ip']).machine.toLowerCase() == machine.toLowerCase()
            );

        let node_set = new Set();
        filteredData.forEach(row => {
            node_set.add(row['source_ip'])
            node_set.add(row['destination_ip'])
        })
        let nodes = []
        for (const ip of node_set) {
            let d = {}
            d['id'] = ip;
            if (ip.includes('172.23.'))
                d['type'] = 'Workstation'
            if (ip.includes('10.32.'))
                d['type'] = 'External Websites'
            if (ip == '10.32.0.100' || ip == '172.23.0.1')
                d['type'] = 'Firewall'
            else if (ip == '172.23.0.10')
                d['type'] = 'DNS'
            if (ip.includes('172.28.'))
                d['type'] = 'Potentially Harmful Websites'

            nodes.push(d)
        }

        // Form links

        let links = []

        for (const row of filteredData) {
            links.push({
                source: row['source_ip'],
                target: row['destination_ip'],
                // source_port : row['source_port'],
                // destination_port : row['destination_port'],
                operation: row['operation'],
                date_time: row['date_time']
            })
        }

        let data = {
            'nodes': nodes,
            'links': links
        }

        resolve(data)

    })
}


function drawNetworkChart(starttime, endtime, machine = undefined) {
    networkSvg.selectAll('g').remove()
    networkSvg.selectAll('text').remove()
    getFireWallData(starttime, endtime, machine).then(data => {

        if (data['nodes'].length == 0) {
            networkSvg.append('text')
                .attr('x', width / 2.5)
                .attr('y', height / 2)
                //.style('font-size', '20px')
                .text('No connections to show')
            return
        }


        const link = networkSvg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", 1)
            .call(g =>
                g.on('mouseover', function (event, d) {
                    highlightSelected(event, d, "link", this)
                    //drawTooltip(event, d, "link", this)
                }
                )
                    .on('mouseout', function (event, d) {
                        dehighlightSelected(this, "link", d)
                        //removeTooltip(this)
                    })
            );

        const node = networkSvg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", 5)
            .attr("id", d => d.id)
            .attr("fill", d => color(d.type))
            .call(g =>
                g.on('mouseover', function (event, d) {
                    highlightSelected(event, d, "node", this)
                    //drawTooltip(event, d, "node", this)
                }
                )
                    .on('mouseout', function (event) {
                        dehighlightSelected(this, "node")
                        //removeTooltip(this)
                    })
            )
            .call(drag(simulation));

        // node.append("title")
        //     .text(d => d.id);


        var simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(50))
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x + width / 2)
                .attr("y1", d => d.source.y + height / 2)
                .attr("x2", d => d.target.x + width / 2)
                .attr("y2", d => d.target.y + height / 2);

            node
                .attr("cx", d => Math.max(5, Math.min(width - 5, d.x + width / 2)))
                .attr("cy", d => Math.max(5, Math.min(height - 5, d.y + height / 2)))
        });

        //invalidation.then(() => simulation.stop());
    })

    drawLegend()
}

function drag(simulation) {

    function dragstarted(event, d) {
        //if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        //if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

let color = type => {
    if (type == 'Firewall')
        return 'green'
    else if (type == 'Workstation')
        return 'blue'
    else if (type == 'DNS')
        return 'orange'
    else
        return 'red'

}

function drawLegend() {
    let legend_arr = [
        {
            name: 'Workstation',
            color: 'blue'
        },
        {
            name: 'Firewall',
            color: 'green'
        },
        {
            name: 'DNS',
            color: 'orange'
        },
        {
            name: 'External Websites',
            color: 'red'
        }
    ]

    for (let i = 0; i < legend_arr.length; i++) {
        networkSvg.append("g")
            .attr('id', 'lengend1')
            //.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(g => g.append('circle')
                .attr('r', 7)
                .attr('cx', margin.left)
                .attr('cy', margin.top + (i * 15))
                .attr('fill', legend_arr[i]['color'])
            )
            .call(g => g.append('text')
                .attr('x', margin.left + 10)
                .attr('y', margin.top + 5 + (i * 15))
                .attr('font-size', '12px')
                .text(legend_arr[i]['name'])
            )
    }

    // networkSvg.append('rect')
    //     .attr('x', 2)
    //     .attr('y', 2)
    //     .attr('width', 125)
    //     .attr('height', 72)
    //     .attr('stroke', 'black')
    //     .attr('stroke-dasharray', 1)
    //     .attr('fill', 'transparent')

}

function highlightSelected(event, data, eventType, element) {

    d3.select(element).raise()

    if (eventType == 'link') {
        d3.select(element)
            .transition(100)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)

        let node1 = data['source'].id
        let node2 = data['target'].id

        d3.select("[id='" + node1 + "']")
            .transition(100)
            .attr('r', 8)

        d3.select("[id='" + node2 + "']")
            .transition(100)
            .attr('r', 8)
    }
    else {
        d3.select(element)
            .transition(100)
            .attr('r', 8)
    }
    drawTooltip(event, data, eventType)
}

function dehighlightSelected(element, eventType, data) {
    if (eventType == 'link') {
        d3.select(element)
            .transition(100)
            .attr('stroke', '#999')
            .attr('stroke-width', 1)

        let node1 = data['source'].id
        let node2 = data['target'].id

        d3.select("[id='" + node1 + "']")
            .transition(100)
            .attr('r', 5)

        d3.select("[id='" + node2 + "']")
            .transition(100)
            .attr('r', 5)
    }
    else {
        d3.select(element)
            //.select('circle')
            .transition(100)
            .attr('r', 5)
    }
    removeTooltip()
}

function drawTooltip(event, data, eventType) {
    toolTip.transition()
        .duration(50)
        .style("opacity", 1);

    if (eventType == 'link') {
        toolTip.html("<span class='badge badge-pill badge-secondary' style='font-size:1em;'> Connection </span> <br>" +
            "From: " + data['source'].id + "<br>" +
            "To: " + data['target'].id + "<br>" +
            "Status: " + data.operation + "<br>" +
            "Time: " + data.date_time
        )
    }
    else {
        toolTip.html("<span class='badge badge-pill badge-secondary' style='font-size:1em;'> Node </span> <br>" +
            "IP address: " + data.id + "<br>" +
            "Type: " + data.type
        )
    }

    toolTip.style("left", (event.pageX + 20) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("text-align", "left");
}

function removeTooltip() {
    toolTip.transition()
        .duration('50')
        .style("opacity", 0)
}


