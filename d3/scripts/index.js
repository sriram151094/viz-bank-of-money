import { network, drawNetworkChart } from './networkchart.js'
import { storyTellingChart } from './innovativechart.js'
import { Heatmap } from './heatmap.js';
import { linechart, drawLineChart } from './lineChart.js'
import { initRadialChart, drawRadialChart} from './radial-bar-chart.js'

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
    drawRadialChart(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
}

function init() {
    let startTime = d3.select('#starttime').property('value')
    let endTime = d3.select('#endtime').property('value')
    let date = d3.select('#date').property('value')
    network();
    storyTellingChart();
    Heatmap(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
    linechart();
    initRadialChart(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
}

init()