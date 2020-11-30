import { network, drawNetworkChart } from './networkchart.js'
import { storyTellingChart } from './innovativechart.js'
import { Heatmap } from './heatmap.js';
import { linechart, drawLineChart } from './lineChart.js'
import { initRadialChart, drawRadialChart } from './radial-bar-chart.js'
import { initTimeSlider, setTime } from './d3-slider.js'


var eventIntervals = {'portscan':"2012-04-05 18:27,2012-04-05 20:36",
                      'sshftpattack':"2012-04-05 20:37,2012-04-05 21:21",
                      'sqlattack':"2012-04-05 21:47,2012-04-06 03:27",
                      'dataoutage':"2012-04-06 02:00,2012-04-06 18:00",
                      'dnsattack':"2012-04-06 17:26,2012-04-06 18:27",
                    };

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
    storyTellingChart();
    network(Date.parse("2012-04-05 18:27"), Date.parse("2012-04-05 20:36"));
    Heatmap(Date.parse("2012-04-05 01:27"), Date.parse("2012-04-05 20:36"));
    linechart();
    initRadialChart(Date.parse("2012-04-05 18:27"), Date.parse("2012-04-05 20:36"));

}

export function eventChange() {
    var eventValue = d3.select("#eventType").property('value');
    console.log("The event val "+eventIntervals[eventValue]);
    var start = eventIntervals[eventValue].split(",")[0];
    var end = eventIntervals[eventValue].split(",")[1];
    setTime(start, end, eventValue);

}

//init()

window.addEventListener('DOMContentLoaded', (event) => {
    init()
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
