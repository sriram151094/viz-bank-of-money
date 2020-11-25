import { network, drawNetworkChart } from './networkchart.js'

export function buttonclick() {
    console.log("Change")
}

export function timechange() {
    let startTime = d3.select('#starttime').property('value')
    let endTime = d3.select('#endtime').property('value')
    let date = d3.select('#date').property('value')
    console.log(Date.parse(date + ' ' + startTime));
    console.log(Date.parse(date + ' ' + endTime));
    drawNetworkChart(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime))
}

network()