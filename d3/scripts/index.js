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
var machine;
var applybutton;
export function timechange(machine=undefined) {
    // let startTime = d3.select('#starttime').property('value')
    // let endTime = d3.select('#endtime').property('value')
    // let date = d3.select('#date').property('value')
    // console.log(Date.parse(date + ' ' + startTime));
    // console.log(Date.parse(date + ' ' + endTime));


    drawNetworkChart(starttime, endtime, machine);
    Heatmap(Date.parse("2012-04-05 01:27"), Date.parse("2012-04-05 20:36"), machine);
    drawLineChart(starttime, endtime, machine);
    drawRadialChart(starttime, endtime);
}

export function reset(id) {
    document.getElementById(id).selectedIndex = 0;
    machine = undefined;
    timechange();
}


function init() {
    network();
    storyTellingChart();
    Heatmap(Date.parse("2012-04-05 01:27"), Date.parse("2012-04-05 20:36"));
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
    d3.select('#machine').on('change', function(e) {
        console.log(e);
        machine = d3.select('#machine').property('value');
        timechange(machine);
    });
    // timechange(starttime, endtime)
})
