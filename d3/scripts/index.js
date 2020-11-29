import { network, drawNetworkChart } from './networkchart.js'
import { storyTellingChart } from './innovativechart.js'
import { Heatmap } from './heatmap.js';
import { linechart, drawLineChart } from './lineChart.js'
import { initRadialChart, drawRadialChart } from './radial-bar-chart.js'
import { initTimeSlider } from './d3-slider.js'

export function buttonclick() {
    console.log("Change")
}

var starttime;
var endtime;
var applybutton;

export function timechange() {
    drawNetworkChart(starttime, endtime);
    Heatmap(starttime, endtime);
    drawRadialChart(starttime, endtime);
}

function init() {
    network();
    storyTellingChart();
    Heatmap(Date.parse("2012-04-05 18:27"), Date.parse("2012-04-05 20:36"));
    linechart();
    initRadialChart(Date.parse("2012-04-05 18:27"), Date.parse("2012-04-05 20:36"));

}

function eventChange() {
    //var eventValue = d3.select("#y-attr-select").value;
    console.log("The event val ");
}

init()

window.addEventListener('DOMContentLoaded', (event) => {

    applybutton = d3.select('#filter-apply');
    initTimeSlider()
    d3.select('#eventhandler').on('change', function (e, d) {
        starttime = Date.parse(e.detail['first']);
        endtime = Date.parse(e.detail['second']);
        applybutton.classed('disable-button', false);
    })
    timechange(starttime, endtime)
})