export { drawLineChart, linechart }
import { getIPBucket } from './utils.js';

var lineSvg;
var filteredData;

const margin = 60;
const padding = 15;
var width = 1000;
const height = 500;
const inner_width = width - margin - padding;
const inner_height = height - margin - padding;

var startTime = '20:30';
var endTime = '21:30';
var startDate = '2012-04-05';
var endDate = '2012-04-05';
var toolDiv;
var lineChartData;
var xScale = d3.scaleTime().range([0, width - margin]);
var yScale = d3.scaleLinear().range([height - margin, 0]);

var keys = ["Deny", "Deny by ACL", "Built", "Success", "Teardown"]
var color = d3.scaleOrdinal()
    .domain(keys)
    .range(["red", "orange", "blue", "green", "brown"]);


//python -m http.server 8000
//https://codepen.io/zakariachowdhury/pen/JEmjwq

function linechart() {
    width = +d3.select("#linechart").style("width").slice(0, -2);
    var chartWindow = d3.select('#lineChart');
    lineSvg = chartWindow.append('svg')
        .attr('id', 'lineChart')
        .attr('width', width)
        .attr('height', height)
    //.attr("transform", `translate(${margin},${margin})`);
    toolDiv = d3.select('div.tooltip');

    xScale = d3.scaleTime().range([margin - padding, width - margin]);
    yScale = d3.scaleLinear().range([height - margin, margin]);

    drawLineChart(Date.parse(startDate + ' ' + startTime), Date.parse(endDate + ' ' + endTime));
};

function getData(start, end, machine) {
    return new Promise((resolve, reject) => {

        d3.csv('./data/aggregated_data.csv').then(res => {
            console.log(res.length)
            filteredData = res.filter(log => {
                let d = Date.parse(log['date_time'])
                return (d >= start && d <= end)
            })

            if (machine)
                filteredData = filteredData.filter(record =>
                    getIPBucket(record['source_ip']).machine.toLowerCase() == machine.toLowerCase())

            console.log("Length of filtered data", filteredData.length)

            if (filteredData.length == 0)
                return resolve("False")

            let operation_map = new Map()
            let data_set = new Set()
            let date_array = new Array()
            let operation_set = new Set()
            filteredData.forEach(row => {
                if (!(data_set.has(row['date_time']))) {
                    date_array.push(row['date_time'])
                    data_set.add(row['date_time'])
                }
                //console.log(date_array)
                operation_set.add(row['operation'])

                var date_map = new Map();
                if (operation_map.has(row['operation'])) {
                    date_map = operation_map.get(row['operation'])
                }

                var key = row['date_time']
                if (date_map.has(key)) {
                    date_map.set(key, date_map.get(key) + 1)
                }
                else {
                    date_map.set(key, 1)
                }
                operation_map.set(row['operation'], date_map)
            })
            console.log(operation_map)

            lineChartData = []

            operation_set.forEach(operation => {
                let d = { 'name': operation }
                let values = []
                date_array.forEach(date => {
                    let val = 0
                    if (operation_map.has(operation)) {
                        if (operation_map.get(operation).has(date)) {
                            val = operation_map.get(operation).get(date)
                        }
                    }
                    values.push({ 'date': date, 'count': val })
                })
                d['values'] = values
                lineChartData.push(d)
            })
            console.log(lineChartData)

            resolve("True")
        })
    })
}


function drawLineChart(starttime, endtime, machine = undefined) {
    console.log(lineSvg.selectAll('g').remove())

    // TODO : remove/handle : Temp fix
    if (!starttime || !endtime) {
        starttime = Date.parse(startDate + ' ' + startTime);
        endtime = Date.parse(endDate + ' ' + endTime);
    }

    getData(starttime, endtime, machine).then(data => {

        xScale.domain([new Date(starttime), new Date(endtime)])
        lineSvg.selectAll("*").remove();
        if (data == "False") {
            console.log("Handling empty cases")
            lineSvg.append("text").attr("x", (width - margin) / 2).attr("y", (height - margin) / 2).text("Data Not Available");
            yScale.domain([0, 100])
            createAxis()
            createLegends()
            return
        }

        //find max extent
        let max_y = 0
        lineChartData.forEach(row => {
            let temp = d3.max(row.values, d => d.count)
            max_y = (temp > max_y) ? temp : max_y
        })

        yScale.domain([0, max_y + 10])

        var line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.count));
        var lines = lineSvg.append('g');
        createAxis()


        lines.selectAll('path')
            .data(lineChartData).enter()
            .append('g')
            .append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.values))
            .attr('transform', `translate(30,0)`)
            .style('stroke', d => color(d.name))
            .style('fill', 'none')
            .style('stroke-width', '1');

        //animation
        lines.selectAll('path')
            .attr("stroke-dasharray",
                function (d) {
                    const pathLength = this.getTotalLength();
                    return `${pathLength} ${pathLength}`
                })
            .attr("stroke-dashoffset", function (d) {
                const pathLength = this.getTotalLength();
                return `${pathLength}`
            })
            .transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        setTimeout(() => {
            lines.selectAll('circle').data(lineChartData).enter()
                .append("g")
                .style("fill", (d) => color(d.name))
                .selectAll("circle")
                .data(d => d.values).enter()
                .filter(function (d) { return d.count > 0 })   // filter to reduce clutter 
                .append("g")
                .attr("class", "circle")
                .on("mouseover", function (e, d) {
                    drawTooltip(e, d);
                })
                .on("mouseout", function (d) {
                    removeTooltip()
                })
                .append("circle")
                .attr("cx", d => xScale(new Date(d.date)))
                .attr("cy", d => yScale(d.count))
                .attr("transform", `translate(30,0)`)
                .attr("r", "2")
                .style("opacity", "1");
        }, 3000);// 3000);

        createLegends()

    })

    function drawTooltip(event, d) {
        console.log(event, d)

        toolDiv.transition()
            .duration(50)
            .style("opacity", 1);

        toolDiv.html("<span class='badge badge-pill badge-secondary' style='font-size:1em;'> Request </span> <br>" +
            "Date: " + d.date + "<br>" +
            "Count: " + d.count + "<br>"
        );
        toolDiv.style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("text-align", "left");

    }

    function removeTooltip() {
        toolDiv.transition()
            .duration('50')
            .style("opacity", 0)
    }

    function createLegends() {
        var size = 10
        var gap = 100
        lineSvg.selectAll("rect")
            .data(keys).enter()
            .append("rect")
            .attr("x", function (d, i) { return width / 2 + i * gap - 200 })
            .attr("y", padding + 5)
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) { return color(d) })

        lineSvg.selectAll("mylabels")
            .data(keys).enter()
            .append("text")
            .attr("x", function (d, i) { return width / 2 + i * gap - 180 })
            .attr("y", 2 * padding)
            .style('font-size', '12px')
            .style("fill", function (d) { return color(d) })
            .text(function (d) { return d })
        //.attr("text-anchor", "left")
        //.style("alignment-baseline", "middle")
    }

    function createAxis() {
        var xAxis = d3.axisBottom(xScale).ticks(10);
        var yAxis = d3.axisLeft(yScale).ticks(10);

        var xAxisGrid = d3.axisBottom(xScale).tickSize(-height + (margin * 2)).tickFormat('').ticks(10);
        var yAxisGrid = d3.axisLeft(yScale).tickSize(-width + margin * 2 - padding).tickFormat('').ticks(10);

        lineSvg.append("g")
            .attr("transform", `translate(${margin - padding * 2}, ${height - margin})`)
            .call(xAxis)
        lineSvg.append("text")
            .attr("x", width / 2)
            .attr("y", height - padding)
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            .style("font-weight", 700)
            .text("Time");

        lineSvg.append("g")
            .attr("transform", `translate(${margin + padding},0)`)
            .call(yAxis)
            .append('text')
            .attr("x", -(height - margin) / 2 + 15)
            .attr("y", -margin + padding)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            .style("font-weight", 700)
            .text("Total values");

        //grids
        lineSvg.append('g')
            .style('stroke', 'lightgrey')
            .style('stroke-opacity', '0.2')
            .style("stroke-dasharray", ("3, 3"))
            .attr('transform', `translate(${margin - padding * 2}, ${height - margin})`)
            .call(xAxisGrid);
        lineSvg.append('g')
            .attr("transform", `translate(${margin + padding},0)`)
            .style('stroke', 'lightgrey')
            .style('stroke-opacity', '0.2')
            .style("stroke-dasharray", ("3, 3"))
            .call(yAxisGrid);
    }
}
