import {Heatmap} from './heatmap.js';

var startTime = '20:36';
var endTime = '22:00';
var date = '2012-04-05';
Heatmap(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
