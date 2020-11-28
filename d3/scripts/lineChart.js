var lineChartSvg;

const margin = 30;
const width = 1000;
const height = 500;
const inner_width = width - margin;
const inner_height = height - margin;

var startTime = '7:00';
var endTime = '12:00';
var startDate = '2012-04-06';
var endDate = '2012-04-06';
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

window.addEventListener('DOMContentLoaded', (event) => {
    var chartWindow = d3.select('#lineChart');
    lineSvg = chartWindow.append('svg')
        .attr('id', 'lineChart')
        .attr('width', width + margin + "px")
        .attr('height', height + margin + "px")
        .attr("transform", `translate(${margin},${margin})`);
    toolDiv = d3.select('#lineChart').append("div").style("opacity", 0);

    drawLineChart(Date.parse(startDate + ' ' + startTime), Date.parse(endDate + ' ' + endTime));
});

function getData(start, end) {
    return new Promise((resolve, reject) => {
  
        d3.csv('./data/aggregated_data_sort.csv').then(res => {
            console.log(res.length)
            filteredData = res.filter(log => {
                let d = Date.parse(log['date_time'])
                return (d >= start && d <= end)
            })

            console.log("Length of filtered data",filteredData.length)

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

                date_map = new Map();
                if (operation_map.has(row['operation'])) {
                    date_map = operation_map.get(row['operation'])
                }

                key = row['date_time']
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
                d = { 'name': operation }
                values = []
                date_array.forEach(date => {
                    val = 0
                    if (operation_map.has(operation)) {
                        if (operation_map.get(operation).has(date)) {
                            val = operation_map.get(operation).get(date)
                        }
                    }
                    values.push({ 'date':date,'count':val})                    
                })
                d['values'] = values
                lineChartData.push(d)
            })
            console.log(lineChartData)

            resolve("True")
        })
    })
}



function drawLineChart(starttime, endtime) {

    getData(starttime, endtime).then(data => {

        if (data == "False") {
            console.log("Handling empty cases")
            lineSvg.append("text").attr("x", (width - margin) / 2).attr("y", (height - margin) / 2).text("Data Not Available");
            xScale.domain([new Date(starttime), new Date(endtime)])
            yScale.domain([0, 100])
            createAxis()
            createLegends()
            return
        }

        //find max extent
        max_y = 0
        lineChartData.forEach(row => {
            temp = d3.max(row.values, d => d.count)
            max_y = (temp > max_y)? temp : max_y 
        })
        xScale.domain(d3.extent(lineChartData[0].values, d => new Date(d.date)))
        yScale.domain([0, max_y + 25])

        var line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.count));
        var lines = lineSvg.append('g');

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

        /*  animation
        var totalLength = lines.selectAll('path').node().getTotalLength();

        lines.selectAll('path')
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition() 
            .duration(3000) 
            .ease(d3.easeLinear) 
            .attr("stroke-dashoffset", 0);
        */    

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
        }, 10);// 3000);
        
        createLegends()

    })

    function drawTooltip(event, d) {
        console.log(event,d)
        
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
        var gap = 150
        lineSvg.selectAll("rect")
            .data(keys).enter()
            .append("rect")
            .attr("x", function (d, i) { return width/2 + i * gap - 200 }) 
            .attr("y", 10)
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) { return color(d) })

        lineSvg.selectAll("mylabels")
            .data(keys).enter()
            .append("text")
            .attr("x", function (d, i) { return width / 2 + i * gap - 180 })
            .attr("y", 20)
            .style("fill", function (d) { return color(d) })
            .text(function (d) { return d })
            //.attr("text-anchor", "left")
            //.style("alignment-baseline", "middle")
    }

    function createAxis() {
        var xAxis = d3.axisBottom(xScale).ticks(10);
        var yAxis = d3.axisLeft(yScale).ticks(10);

        var xAxisGrid = d3.axisBottom(xScale).tickSize(-inner_height).tickFormat('').ticks(10);
        var yAxisGrid = d3.axisLeft(yScale).tickSize(-inner_width).tickFormat('').ticks(10);

        lineSvg.append("g")
            .attr("transform", `translate(30, ${height - margin})`)
            .call(xAxis)
        lineSvg.append("text")
            .attr("x", width / 2)
            .attr("y", height)
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            .style("font-weight", 700)
            .text("Time");

        lineSvg.append("g")
            .attr("transform", `translate(30,0)`)
            .call(yAxis)
            .append('text')
            .attr("y", 15)
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
            .attr('transform', 'translate(30,' + inner_height + ')')
            .call(xAxisGrid);
        lineSvg.append('g')
            .attr("transform", `translate(30,0)`)
            .style('stroke', 'lightgrey')
            .style('stroke-opacity', '0.2')
            .call(yAxisGrid);
    }
}