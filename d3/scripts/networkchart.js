export { network, drawNetworkChart };

var networkSvg;
var width = 500;
var height = 500;
var startTime = '20:20';
var endTime = '20:50';
var date = '2012-04-05';
var defs
var toolTip
var margin = { top: 10, bottom: 10, left: 10, right: 10 }

function network() {

    window.addEventListener('DOMContentLoaded', (event) => {
        var chartWindow = d3.select('#networkChart');
        networkSvg = chartWindow.append('svg')
            .attr('id', 'network')
            //.attr("viewBox", [-width / 4, -height / 4, width, height])
            .attr('width', width)
            .attr('height', height)


        importExternalSVGs();
        drawNetworkChart(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
    });

    toolTip = d3.select("body").append("div")
        .attr("class", "tooltip")
}



function importExternalSVGs() {
    defs = networkSvg.append('svg:defs')

    d3.xml("../img/laptop.svg").then(res => {
        defs.append('pattern')
            .attr('id', 'laptop')
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 5)
            .attr('height', 5)
            // Append svg to pattern
            .append('svg')
            .attr('x', 5)
            .attr('y', 5)
            .attr('width', 10)
            .attr('height', 10)
            .append(() => res.getElementsByTagName("svg")[0])
    })
}


function getFireWallData(start, end) {
    return new Promise((resolve, reject) => {
        console.log(start)
        console.log(end)

        d3.csv('../data/aggregated_data.csv').then(res => {
            console.log(res)
            let filteredData = res.filter(log => {
                let d = Date.parse(log['date_time'])
                return (d >= start && d <= end)
            })
            console.log("filtered data=================")
            console.log(filteredData)

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

                nodes.push(d)
            }
            console.log(nodes)

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

            console.log(links)

            let data = {
                'nodes': nodes,
                'links': links
            }

            resolve(data)

        })
    })
}


function drawNetworkChart(starttime, endtime) {
    console.log(networkSvg.selectAll('g').remove())
    getFireWallData(starttime, endtime).then(data => {
        console.log("network data ", data)

        const link = networkSvg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", 1)
            .call(g =>
                g.on('mouseover', function (event, d) {
                    drawTooltip(event, d, "link")
                }
                )
                    .on('mouseout', function (event) { removeTooltip(this) })
            );

        const node = networkSvg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", 5)
            .attr("fill", d => color(d.type))
            .call(g =>
                g.on('mouseover', function (event, d) {
                    drawTooltip(event, d, "node")
                }
                )
                    .on('mouseout', function (event) { removeTooltip(this) })
            )
            .call(drag(simulation));

        // node.append("title")
        //     .text(d => d.id);


        var simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(40))
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
                .attr("cx", d => d.x + width / 2)
                .attr("cy", d => d.y + height / 2)
        });

        //invalidation.then(() => simulation.stop());
    })

    drawLegend()
}

function drag(simulation) {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
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
    networkSvg.append("g")
        .attr('id', 'lengend1')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(g => g.append('circle')
            .attr('r', 5)
            .attr('fill', 'blue')
        )
        .call(g => g.append('text')
            .attr('x', margin.left + 5)
            .attr('y', margin.top)
            .text('Workstation')
        )
}

function drawTooltip(event, data, eventType) {
    console.log(data);
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


