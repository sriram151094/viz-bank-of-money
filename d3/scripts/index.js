import { network, drawNetworkChart } from './networkchart.js'
import { storyTellingChart } from './innovativechart.js'
import { Heatmap } from './heatmap.js';
import { linechart, drawLineChart } from './lineChart.js'
import { initRadialChart, drawRadialChart } from './radial-bar-chart.js'
import { initTimeSlider, setTime, getEventVal, setEventVal } from './d3-slider.js'


var eventIntervals = {'Port Scanning':"2012-04-05 18:27,2012-04-05 20:36",
                      'FTP/SSH Attack':"2012-04-05 20:37,2012-04-05 21:21",
                      'SQL Attack':"2012-04-05 21:47,2012-04-06 03:27",
                      'Data Outage':"2012-04-06 02:00,2012-04-06 18:00",
                      'DNS Attack':"2012-04-06 17:26,2012-04-06 18:27",
                    };

var starttime;
var endtime;
var machine;
var applybutton;
var eventval = "";
export function timechange(machine=undefined) {
    drawNetworkChart(starttime, endtime, machine);
    Heatmap(starttime, endtime, machine);
    drawLineChart(starttime, endtime, machine);
    drawRadialChart(starttime, endtime, machine);
}

export function reset(id) {
    document.getElementById(id).selectedIndex = 0;
    machine = undefined;
    timechange();
}


function init() {
    starttime = Date.parse("2012-04-05 18:27");
    endtime = Date.parse("2012-04-05 20:36");
    storyTellingChart();
    network(starttime, endtime);
    Heatmap(starttime, endtime);
    linechart();
    initRadialChart(starttime, endtime);

}

export function eventChange() {
    var eventValue = d3.select("#eventType").property('value');
    var start = eventIntervals[eventValue].split(",")[0];
    var end = eventIntervals[eventValue].split(",")[1];
    setTime(start, end, eventValue);
    starttime = Date.parse(start);
    endtime = Date.parse(end);
    timechange();
}


window.addEventListener('DOMContentLoaded', (event) => {
    init()
    applybutton = d3.select('#filter-apply');
    initTimeSlider()
    d3.select('#eventhandler').on('change', function (e, d) {
        starttime = Date.parse(e.detail['first']);
        endtime = Date.parse(e.detail['second']);
        if(getEventVal() != "") {
            starttime = Date.parse(eventIntervals[e.detail['third']].split(",")[0])
            endtime = Date.parse(eventIntervals[e.detail['third']].split(",")[1])
            setEventVal();
        }
        timechange()
        //applybutton.classed('disable-button', false);
    })
    d3.select('#machine').on('change', function(e) {
        machine = d3.select('#machine').property('value');
        timechange(machine);
    });
    // timechange(starttime, endtime)
})
