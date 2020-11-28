export function Heatmap(startTime, endTime) {
    var file = "../data/aggregated_data.csv"
    var tooltipDiv = d3.select('div.tooltip');
    var svg;
    var heatmapData;
    var margin = {top: 40, right: 10, bottom: 150, left: 80};
    const svgScreenWidth = +d3.select("#heatmap_div").style("width").slice(0,-2);
    var width = svgScreenWidth - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
    const BAR_HEIGHT = 20;
    const COLOR_START = "#fac2c2", COLOR_END = "#f03434";
    const titlex = width / 2;
    const titley = -25;
    const xlabelx = width / 2;
    const xlabely = height + 45;
    const ylabelx = -65;
    const ylabely = height / 2;
    loadChart();

    function loadChart() {
        if(heatmapData == undefined) {
            readData().then(data => {
                heatmapData = data;
                drawHeatMap();
            }).catch(err => {
                console.error(err);
                return;
            });
        } else {
            drawHeatMap();
        }
    }

    function drawHeatMap() {
        const filteredData = heatmapData.filter(record => record.datetime >= startTime && record.datetime <= endTime);
        const ip_addresses = ['DNS', 'IDS', 'Firewall', 'Workstation', 'Websites', 'Log Server', 'Financial Server'];
        const portSet = new Set([21, 22, 53, 80, 1433, 1521, 3306, 5432, 6667, -1, -2, -3, -4, -5]);
        const ports = Array.from(portSet).map(String);
        const portRangeMap = {
            "-1": "0-1k",
            "-2": "1k-2k",
            "-3": "2k-3k",
            "-4": "3k-4k",
            "-5": "4k-5k"
        }
        let events = [];

        const ipRanges = [
            {start: '172.23.0.10', end: '172.23.0.10', machine: 'DNS'},
            {start: '10.99.99.2', end: '10.99.99.2', machine: 'IDS'},
            {start: '10.32.0.100', end: '10.32.0.100', machine: 'Firewall'},
            {start: '172.25.0.1', end: '172.25.0.1', machine: 'Firewall'},
            {start: '172.23.0.1', end: '172.23.0.1', machine: 'Firewall'},
            {start: '10.32.0.1', end: '10.32.0.1', machine: 'Firewall'},
            {start: '10.32.1.201', end: '10.32.1.206', machine: 'Websites'},
            {start: '10.32.5.1', end: '10.32.5.254', machine: 'Websites'},
            {start: '10.32.1.100', end: '10.32.1.100', machine: 'Websites'},
            {start: '10.32.0.201', end: '10.32.0.210', machine: 'Websites'},
            {start: '172.23.0.2', end: '172.23.0.2', machine: 'Log Server'},
            {start: '172.23.0.3', end: '172.23.0.9', machine: 'Workstation'},
            {start: '172.23.0.11', end: '172.23.50.255', machine: 'Workstation'},
            {start: '172.23.51.0', end: '172.23.100.255', machine: 'Workstation'},
            {start: '172.23.101.0', end: '172.23.150.255', machine: 'Workstation'},
            {start: '172.23.151.0', end: '172.23.200.255', machine: 'Workstation'},
            {start: '172.23.201.0', end: '172.23.213.255', machine: 'Workstation'},
            {start: '172.23.230.0', end: '172.23.255.255', machine: 'Workstation'},
            {start: '172.23.214.0', end: '172.23.229.255', machine: 'Financial Server'}
        ];

        let event_groups = d3.group(filteredData, 
            d => ipRanges[getIPBucket(d.sourceIP, ipRanges)].machine, 
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

        let dataMap = {}
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
                    })
            }
        }

        svg = d3.select("#heatmap_div").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(ports)
            .padding(0.05);
            svg.append("g")
            .style("font-size", 15)
            .attr("transform", "translate(0," + (height + 10) + ")")
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
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();

        // Build color scale
        var max = d3.max(events, function (d) { return d.numAttacks});

        var colorScale = d3.scaleLinear()
        .range([COLOR_START, COLOR_END])
        .domain([0, max]);
        drawLegend(colorScale);
        
        drawAxis();

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
            .attr("height", y.bandwidth())
            .style("opacity", 0.8);
        }

        // add the squares
        svg.selectAll()
            .data(events)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(""+d.port) })
            .attr("y", function(d) { return y(d.ip) })
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function(d) { return colorScale(d.numAttacks)} )
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

    function getIPBucket(ipAddr, ipBuckets) {
        let idx = 0;
        for(const ipDict of ipBuckets) {
            if(compareIP(ipAddr, ipDict.start, ipDict.end)) {
                return idx;
            }
            idx++;
        }
        return -1;
    }

    function compareIP(ipO, ipS, ipE) {
        ipO = ipO.split(".");
        ipS = ipS.split(".");
        ipE = ipE.split(".");
        let i = 0;
        while(i < 4) {
            let x = parseInt(ipO[i]), y = parseInt(ipS[i]), z = parseInt(ipE[i])
            i++;
            if(x === y && x === z)
                continue;
            else if(x >= y && x <= z)
                continue;
            else
                return false;
        }

        return true;
    }

    function drawTooltip(event, d) {
        tooltipDiv.attr("class", "tooltip");
        tooltipDiv.transition()
            .duration(50)
            .style("opacity", 1);
        tooltipDiv.html(
                "From: " + d.ip + "<br>" +
                "To: " + d.port + "<br>" +
                "Num of Connections: " + d.numAttacks
            );
        tooltipDiv
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("text-align", "left");
    }

    function drawLegend(colorScale) {

        const defs = svg.append("defs");
        const axisScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, width]);

        const axisBottom = g => g
            .attr("class", `x-axis`)
            .attr("transform", `translate(0,${(height + margin.top + 2 * BAR_HEIGHT)})`)
            .call(d3.axisBottom(axisScale)
                    .ticks(width/100)
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
          .attr("transform", `translate(0,${height + margin.top + BAR_HEIGHT})`)
          .append("rect")
          .attr("width", width)
          .attr("height", BAR_HEIGHT)
          .style("fill", "url(#linear-gradient)")
          .style("position", "absolute");
        
        svg.append("text")
            .attr("x", "-15px")
            .attr("y", (height + margin.top + 3 * BAR_HEIGHT))
            .text("Connections")
        svg.append("text")
            .attr("x", (width - 50))
            .attr("y", (height + margin.top + 3 * BAR_HEIGHT))
            .text("Connections")

        
        svg.append('g').call(axisBottom);
    }

    function drawAxis() {
        // Add title to graph
        svg.append("text")
            .attr("x", titlex)
            .attr("y", titley)
            .attr("text-anchor", "middle")
            .style("font-size", "1.25em")
            .text("Connections made from machines to ports");

        svg.append("text")
            .attr("x", xlabelx)
            .attr("y", xlabely)
            .attr("text-anchor", "middle")
            .style("font-size", "1em")
            .text("Ports connected/attacked");

        // adapted from https://stackoverflow.com/a/30417969
        svg.append("g")
            .attr('transform', 'translate(' + ylabelx + ', ' + ylabely + ')')
            .append('text')
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "1em")
            .text("Machine");
    }

    return;
}
