/*//////////////////////////////////////////////////////////
////////////////// Set up the Data /////////////////////////
//////////////////////////////////////////////////////////*/

var NameProvider = ["Port Scanning","SQL Attack","FTP/SSH Attack","Data Outage","DNS Attack"];
	
var matrix = [
[9.6899,0.8859,0.0554,0.443,2.5471,2.4363,0.5537,2.5471], /*Apple 24.4738*/
[0.0554,0.2769,0.2215,0.2215,0.3876,0.8306,0.0554,0.3322], /*Huawei 2.3811*/
[0.2215,0.443,0,0.2769,10.4097,1.2182,0.4983,2.8239], /*Nokia 20.7088*/
[1.1628,2.6024,0,1.3843,8.7486,16.8328,1.7165,5.5925], /*Samsung 38.0399*/
[0.0554,0.4983,0,0.3322,0.443,0.8859,1.7719,0.443]
];
/*Sums up to exactly 100*/

var colors = ["#C8125C","#008FC8","#10218B","#134B24","#737373"];

/*Initiate the color scale*/
var fill = d3.scaleOrdinal()
    .domain(d3.range(NameProvider.length))
    .range(colors);
	
/*//////////////////////////////////////////////////////////
/////////////// Initiate Chord Diagram /////////////////////
//////////////////////////////////////////////////////////*/
var margin = {top: 30, right: 25, bottom: 20, left: 25},
    width = 650 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.04;


var chord = d3.chord()
    .padAngle(.04)
    .sortSubgroups(d3.descending) /*sort the chords inside an arc from high to low*/
	.sortChords(d3.descending); /*which chord should be shown on top when chords cross. Now the biggest chord is at the bottom*/
	
var arc = d3.arc()
    .innerRadius(innerRadius)
	.outerRadius(outerRadius);
	
/*Initiate the SVG*/
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")")
	.datum(chord(matrix));

/*//////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
//////////////////////////////////////////////////////////*/

var g = svg.selectAll("g.group")
	.data(function(chords) { return chords.groups; })
	.enter().append("g")
	.attr("class", function(d) {return "group " + NameProvider[d.index];});
	
g.append("path")
	  .attr("class", "arc")
	  .style("stroke", function(d) { return fill(d.index); })
	  .style("fill", function(d) { return fill(d.index); })
	  .attr("d", arc)
	  .style("opacity", 0)
	  .transition().duration(1000)
	  .style("opacity", 0.4);

/*//////////////////////////////////////////////////////////
////////////////// Initiate Ticks //////////////////////////
//////////////////////////////////////////////////////////*/

var ticks = svg.selectAll("g.group").append("g")
	.attr("class", function(d) {return "ticks " + NameProvider[d.index];})
	.selectAll("g.ticks")
	.attr("class", "ticks")
    .data(groupTicks)
	.enter().append("g")
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + outerRadius+40 + ",0)";
	});
	

/*Append the tick around the arcs*/
ticks.append("svg:line")
	.attr("x1", 1)
	.attr("y1", 0)
	.attr("x2", 5)
	.attr("y2", 0)
	.attr("class", "ticks")
	.style("stroke", "#FFF");
	
/*Add the labels for the %'s*/
ticks.append("svg:text")
	.attr("x", 8)
	.attr("dy", ".35em")
	.attr("class", "tickLabels")
	.attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
	.style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	.text(function(d) { return d.label; })
	.attr('opacity', 0);

/*//////////////////////////////////////////////////////////
////////////////// Initiate Names //////////////////////////
//////////////////////////////////////////////////////////*/

g.append("text")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".35em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius + 55) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .attr('opacity', 0)
  .text(function(d,i) { return NameProvider[i]; }); 


/*//////////////////////////////////////////////////////////	
///////////// Initiate Progress Bar ////////////////////////
//////////////////////////////////////////////////////////*/

/*Initiate variables for bar*/
var progressColor = ["#D1D1D1","#949494"],
progressClass = ["prgsBehind","prgsFront"],
prgsWidth = 0.4*650,
prgsHeight = 3;
/*Create SVG to visualize bar in*/
var progressBar = d3.select("#progress").append("svg")
.attr("width", prgsWidth)
.attr("height", 3*prgsHeight);
/*Create two bars of which one has a width of zero*/
progressBar.selectAll("rect")
.data([prgsWidth, 0])
.enter()
.append("rect")
.attr("class", function(d,i) {return progressClass[i];})
.attr("x", 0)
.attr("y", 0)
.attr("width", function (d) {return d;})
.attr("height", prgsHeight)
.attr("fill", function(d,i) {return progressColor[i];});

/*//////////////////////////////////////////////////////////	
/////////// Initiate the Center Texts //////////////////////
//////////////////////////////////////////////////////////*/
/*Create wrapper for center text*/
var textCenter = svg.append("g")
					.attr("class", "explanationWrapper");

/*Starting text middle top*/
var middleTextTop = textCenter.append("text")
	.attr("class", "explanation")
	.attr("text-anchor", "middle")
	.attr("x", 0 + "px")
	.attr("y", -24*10/2 + "px")
	.attr("dy", "1em")
	.attr("opacity", 1)
	.text("Our organization Bank Of Money hosts about a million devices/workstations. ")
	//.call(wrap, 350);

/*Starting text middle bottom*/
var middleTextBottom = textCenter.append("text")
	.attr("class", "explanation")
	.attr("text-anchor", "middle")
	.attr("x", 0 + "px")
	.attr("y", 24*3/2 + "px")
	.attr("dy", "1em")
	.attr('opacity', 1)
	.text("It is imperative that we have a cyber security system that prevents the organization from getting compromised by attackers.")
	//.call(wrap, 350);

/*//////////////////////////////////////////////////////////
//////////////// Storyboarding Steps ///////////////////////
//////////////////////////////////////////////////////////*/

var counter = 1,
	buttonTexts = ["Ok","Go on","Continue","Okay","Go on","Continue","Okay","Continue",
				   "Continue","Continue","Continue","Continue","Continue","Finish"],
	opacityValueBase = 0.8,
	opacityValue = 0.4;

/*Reload page*/
d3.select("#reset")
	.on("click", function(e) {location.reload();});

/*Skip to final visual right away*/
d3.select("#skip")
	.on("click", finalChord);
	
/*Order of steps when clicking button*/
d3.select("#clicker")      
	.on("click", function(e){
	
		if(counter == 1) Draw1();
		else if(counter == 2) Draw2();
		else if(counter == 3) Draw3();
		else if(counter == 4) Draw4();
		else if(counter == 5) Draw5();
		else if(counter == 6) Draw6();
		else if(counter == 7) Draw7();
		else if(counter == 8) Draw8();
		else if(counter == 9) Draw9();
		else if(counter == 10) Draw10();
		else if(counter == 11) Draw11();
		else if(counter == 12) Draw12();
		else if(counter == 13) Draw13();
		else if(counter == 14) Draw14();
		else if(counter == 15) finalChord();
		
		counter = counter + 1;
	});




/*//////////////////////////////////////////////////////////	
//Introduction
///////////////////////////////////////////////////////////*/
function Draw1(){
	console.log("Draw1 function")
	/*First disable click event on clicker button*/
	stopClicker();
		
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);
		
	changeTopText(newText = "The Bank of Money is experiencing difficulties with its security infrastructure" + 
							"and it’s becoming difficult to drill down the issue causing it.",
	loc = 4/2, delayDisappear = 0, delayAppear = 1);

	changeTopText(newText = "In the next few steps we would like to introduce you to the issues faced by our organization ",
	loc = 8/2, delayDisappear = 9, delayAppear = 10, finalText = true);
	
	changeBottomText(newText = "Let's start by drawing out the attacks faced over the past two days",
	loc = 1/2, delayDisappear = 0, delayAppear = 10);
	
	//Remove arcs again
	d3.selectAll(".arc")
		.transition().delay(9*700).duration(2100)
		.style("opacity", 0)
		.on("end", function() {d3.selectAll(".arc").remove();});
		
};/*Draw1*/

/*//////////////////////////////////////////////////////////	
//Show Arc of Port Scanning
//////////////////////////////////////////////////////////*/
function Draw2(){ 
	console.log("Draw2 function")

	/*First disable click event on clicker button*/
	stopClicker();
	
	/*Show and run the progressBar*/
	runProgressBar(time=700*2);
				
	/*Initiate all arcs but only show the Apple arc (d.index = 0)*/
	g.append("path")
	  .style("stroke", function(d) { return fill(d.index); })
	  .style("fill", function(d) { return fill(d.index); })
	  .transition().duration(700)
	  .attr("d", arc)
	  .attrTween("d", function(d) {
		if(d.index == 0) {
		   var i = d3.interpolate(d.startAngle, d.endAngle);
		   return function(t) {
			   d.endAngle = i(t);
			 return arc(d);
		   }
		}
	  });
	  
	/*Show the tick around the arc*/
	d3.selectAll("g.group").selectAll("line")
		.transition().delay(700).duration(1000)
		.style("stroke", function(d, i, j) {return j ? 0 : "#000"; });

	/*Add the labels for the %'s*/
	d3.selectAll("g.group").selectAll(".tickLabels")
		.transition().delay(700).duration(2000)
		.attr("opacity", function(d, i, j) {return j ? 0 : 1; });

	/*Show the  name*/
	d3.selectAll(".titles")
	  .transition().duration(2000)
	  .attr("opacity", function(d, i) {return d.index ? 0 : 1; });
	  
	/*Switch  texts*/
	changeTopText(newText = "Firstly, a series of Port scanning events occur implying the presence of some external botnet trying to compromise the system",
	loc = 1/2, delayDisappear = 0, delayAppear = 1, finalText = true);
	
	changeBottomText(newText = "",
	loc = 0/2, delayDisappear = 0, delayAppear = 1)	;
	
};/*Draw2*/

/*///////////////////////////////////////////////////////////  
//Draw the other arcs as well
//////////////////////////////////////////////////////////*/
function Draw3(){
	console.log("Draw3 function")
	/*First disable click event on clicker button*/
	stopClicker();

	var arcDelay = [0,1,2,12,13,23,33,34,35,40,47];
	/*Show and run the progressBar*/
	runProgressBar(time=700*(arcDelay[(arcDelay.length-1)]+1));	
		
   /*Fill in the other arcs*/
   svg.selectAll("g.group").select("path")
	.transition().delay(function(d, i) { return 700*arcDelay[i];}).duration(1000)
	.attrTween("d", function(d) {
		if(d.index != 0) {
		   var i = d3.interpolate(d.startAngle, d.endAngle);
		   return function(t) {
			   d.endAngle = i(t);
			 return arc(d);
		   }
		}
    });
 
  /*Make the other strokes black as well*/
  svg.selectAll("g.group")
	.transition().delay(function(d,i) { return 700*arcDelay[i]; }).duration(700)
	.selectAll("g").selectAll("line").style("stroke", "#000");
  /*Same for the %'s*/
  svg.selectAll("g.group")
	.transition().delay(function(d,i) { return 700*arcDelay[i]; }).duration(700)
	.selectAll("g").selectAll("text").style("opacity", 1);
  /*And the Names of each Arc*/	
  svg.selectAll("g.group")
	.transition().delay(function(d,i) { return 700*arcDelay[i]; }).duration(700)
	.selectAll("text").style("opacity", 1);

	/*Change the text of the top section inside the circle accordingly*/
	/*HTC*/
	changeTopText(newText = "HTC has 5% of the market share",
		loc = 6/2, delayDisappear = 0, delayAppear = arcDelay[2]);
	/*LG*/
	changeTopText(newText = "LG has almost 5% of the market",
		loc = 6/2, delayDisappear = arcDelay[3], delayAppear = arcDelay[4]);
	/*Samsung*/
	changeTopText(newText = "Samsung has the biggest share by far, with 38% of respondents using a Samsung as their main phone",
		loc = 3/2, delayDisappear = (arcDelay[5]-1), delayAppear = arcDelay[5]);
	/*Sony*/
	changeTopText(newText = "Sony has slightly more than 4% share",
		loc = 4/2, delayDisappear = arcDelay[6], delayAppear = (arcDelay[8]-1));		
	/*100%*/
	changeTopText(newText = "Together that sums up to 100%",
		loc = 1/2, delayDisappear = (arcDelay[9]-1), delayAppear = arcDelay[9]);		
	/*Chord intro*/
	changeTopText(newText = "This circle shows how the respondents are currently divided between the brands",
		loc = 8/2, delayDisappear = (arcDelay[10]-1), delayAppear = arcDelay[10], finalText = true);					
	
	/*Change the text of the bottom section inside the circle accordingly*/
	/*Huawei*/
	changeBottomText(newText = "Huawei came from practically no share in 2013 to 2.4% in 2014 thereby taking its place in the biggest 7 brands in the Netherlands",
		loc = -2/2, delayDisappear = 0, delayAppear = arcDelay[2]);
	/*Nokia*/
	changeBottomText(newText = "Nokia is still owned by 15% of the respondents. However practically all of these phones are ordinary phones, not smartphones",
		loc = -1/2, delayDisappear = arcDelay[3], delayAppear = arcDelay[4]);	
	/*Other*/
	changeBottomText(newText = "Brands combined in \"Other\" are Blackberry, Motorola, Google Nexus and Operator branded",
		loc = -1/2, delayDisappear = (arcDelay[5]-1), delayAppear = (arcDelay[8]-1));	
	/*Chord intro*/
	changeBottomText(newText = "Now we're going to look at how these respondents flowed from their previous phone to their present one",
		loc = 1/2, delayDisappear = (arcDelay[9]-1), delayAppear = arcDelay[10]);	

};/*Draw3*/


/*///////////////////////////////////////////////////////////
//Draw the original Chord diagram
///////////////////////////////////////////////////////////*/
/*Go to the final bit*/
function finalChord() {
	
	/*Remove button*/
	d3.select("#clicker")
		.style("visibility", "hidden");
	d3.select("#skip")
		.style("visibility", "hidden");
	d3.select("#progress")
		.style("visibility", "hidden");
	
	/*Remove texts*/
	changeTopText(newText = "",
		loc = 0, delayDisappear = 0, delayAppear = 1);
	changeBottomText(newText = "",
		loc = 0, delayDisappear = 0, delayAppear = 1);			

	/*Create arcs or show them, depending on the point in the visual*/
	if (counter <= 4 ) {
		g.append("svg:path")
		  .style("stroke", function(d) { return fill(d.index); })
		  .style("fill", function(d) { return fill(d.index); })
		  .attr("d", arc)
		  .style("opacity", 0)
		  .transition().duration(1000)
		  .style("opacity", 1);
		  
	} else {
		 /*Make all arc visible*/
		svg.selectAll("g.group").select("path")
			.transition().duration(1000)
			.style("opacity", 1);
	};
	
	/*Make mouse over and out possible*/
	d3.selectAll(".group")
		.on("mouseover", fade(.02))
		.on("mouseout", fade(.80));
		
	// /*Show all chords*/
	// chords.transition().duration(1000)
	// 	.style("opacity", opacityValueBase);

	/*Show all the text*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(100)
		.style("stroke","#000");
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(100)
		.selectAll(".tickLabels").style("opacity",1);
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(100)
		.selectAll(".titles").style("opacity",1);		

};/*finalChord*/

/*//////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
//////////////////////////////////////////////////////////*/

/*Returns an event handler for fading a given chord group*/
function fade(opacity) {
	return function(d, i) {
	  svg.selectAll("path.chord")
		  .filter(function(d) { return d.source.index != i && d.target.index != i; })
		  .transition()
		  .style("stroke-opacity", opacity)
		  .style("fill-opacity", opacity);
	};
  };/*fade*/
  
  /*Returns an array of tick angles and labels, given a group*/
  function groupTicks(d) {
	var k = (d.endAngle - d.startAngle) / d.value;
	return d3.range(0, d.value, 1).map(function(v, i) {
	  return {
		angle: v * k + d.startAngle,
		label: i % 5 ? null : v + "%"
	  };
	});
  };/*groupTicks*/

  /*Taken from https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
//Calls a function only after the total transition ends*/
function endall(transition, callback) { 
    var n = 0; 
    transition 
        .each(function() { ++n; }) 
        .on("end", function() { 
			if (!--n) 
				callback.apply(this, arguments); 
			}); 
};/*endall*/ 

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
	console.log(d3.select(this))
    var text = d3.select(this)[0][0],
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, 
        y = text.attr("y"),
		x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
		
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      };
    };  
};


/*Transition the top circle text*/
function changeTopText (newText, loc, delayDisappear, delayAppear, finalText, xloc, w) {

	/*If finalText is not provided, it is not the last text of the Draw step*/
	if(typeof(finalText)==='undefined') finalText = false;
	
	if(typeof(xloc)==='undefined') xloc = 0;
	if(typeof(w)==='undefined') w = 350;
	
	middleTextTop	
		/*Current text disappear*/
		.transition().delay(700 * delayDisappear).duration(700)
		.attr('opacity', 0)	
		/*New text appear*/
		.call(endall,  function() {
			middleTextTop.text(newText)
			.attr("y", -24*loc + "px")
			.attr("x", xloc + "px")
			//.call(wrap, w);	
		})
		.transition().delay(700 * delayAppear).duration(700)
		.attr('opacity', 1)
		.call(endall,  function() {
			if (finalText == true) {
				d3.select("#clicker")
					.text(buttonTexts[counter-2])
					.style("pointer-events", "auto")
					.transition().duration(400)
					.style("border-color", "#363636")
					.style("color", "#363636");
				};
		});
};/*changeTopText */

/*Transition the bottom circle text*/
function changeBottomText (newText, loc, delayDisappear, delayAppear) {
	middleTextBottom
		/*Current text disappear*/
		.transition().delay(700 * delayDisappear).duration(700)
		.attr('opacity', 0)
		/*New text appear*/
		.call(endall,  function() {
			middleTextBottom.text(newText)
			.attr("y", 24*loc + "px")
			//.call(wrap, 350);	
		})
		.transition().delay(700 * delayAppear).duration(700)
		.attr('opacity', 1);
;}/*changeTopText*/

/*Stop clicker from working*/
function stopClicker() {
	d3.select("#clicker")
		.style("pointer-events", "none")
		.transition().duration(400)
		.style("border-color", "#D3D3D3")
		.style("color", "#D3D3D3");
};/*stopClicker*/

/*Run the progress bar during an animation*/
function runProgressBar(time) {	
	
	/*Make the progress div visible*/
	d3.selectAll("#progress")
		.style("visibility", "visible");
	
	/*Linearly increase the width of the bar
	//After it is done, hide div again*/
	d3.selectAll(".prgsFront")
		.transition().duration(time).ease(d3.easeLinear)
		.attr("width", prgsWidth)
		.call(endall,  function() {
			d3.selectAll("#progress")
				.style("visibility", "hidden");
		});
	
	/*Reset to zero width*/
	d3.selectAll(".prgsFront")
		.attr("width", 0);
		
};/*runProgressBar*/

