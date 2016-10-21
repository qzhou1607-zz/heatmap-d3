/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var colors = ["#F7FBFF", "#DEEBF7", "#C6DBEF", "#9ECAE1","#6BAED6","#4292C6", "#2171B5", "#08519C","#08306B"];
var margin = {
    top:10,
    bottom:100,
    left:80,
    right:50
};
var width = 1200 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;
//json
$.getJSON(url, function(jsonData) {
    var baseTemp = jsonData.baseTemperature;
    var monthlyVar = jsonData.monthlyVariance;
    //find out time span
    var years = monthlyVar.map(function(data) {
        return data.year;
    });
    var tempVars = monthlyVar.map(function(data) {
        return data.variance;
    });
    //deduplicate
    var uniqueYears = [];
    years.forEach(function(year) {
        if(uniqueYears.indexOf(year) === -1) {
            uniqueYears.push(year);
        }
    });
    var startYear = d3.min(uniqueYears);
    var endYear = d3.max(uniqueYears);
    var lowTemp = d3.min(tempVars);
    var highTemp = d3.max(tempVars);
    var gridWidth = width/uniqueYears.length;
    var gridHeight = height/12;
    console.log(gridHeight);
    //x axis
    var chart = d3.select(".chart")
                .attr("width",margin.left + width + margin.right)
                .attr("height",margin.top + height + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    var x = d3.time.scale()
            .domain([new Date(startYear,0), new Date(endYear,0)])
            .range([0,width]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    chart.append("g")
            .attr("class","x axis")
            .attr("transform","translate(0," + height + ")")
            .call(xAxis);
    
    //y axis
    chart.selectAll(".month")
            .data(month)
        .enter().append("text")
            .text(function(month) { return month; })
            .attr("x",0)
            .attr("y",function(m,i) {
                return i * gridHeight;
            })
            .attr("class","month")
            .style("text-anchor","end")
            .attr("transform","translate(-6," + gridHeight/2 + ")");
    //grid
    var colorScale = d3.scale.quantile()
            .domain([lowTemp+baseTemp,highTemp+baseTemp])
            .range(colors);
    var grid = chart.selectAll(".temp")
            .data(monthlyVar)
        .enter().append("rect")
            .attr("width",gridWidth)
            .attr("height",gridHeight)
            .attr("x",function(d) {
                return x(new Date(d.year,0));
            })
            .attr("y",function(d) {
                return (d.month-1)*gridHeight;
            })
            .style("fill", function(d) {
                return colorScale(d.variance + baseTemp);
            });
    //x axis label
    chart.append("g")
            .attr("transform","translate(" + (width/2) + "," + (height + 50) + ")")
        .append("text")
            .attr("class","x axis-label")
            .text("Years")
            .attr("text-anchor","middle");
    
    //y axis label
    chart.append("g")
            .attr("transform","translate(-60," + (height/2) +  ")")
        .append("text")
            .text("Month")
            .attr("class","y axis-label")
            .attr("text-anchor","middle")
            .attr("transform","rotate(-90)");
            
    //tooltip
    var tooltip = d3.select(".tooltip");
    grid.on("mouseover",function(d) {
        var currYear = d.year;
        var currMonth = d.month;
        var varTemp = d.variance;
        var temp = varTemp + baseTemp;
        $('.current-year').text(currYear);
        $('.current-month').text(lookupMonth(currMonth));
        $('.temp').text(temp.toFixed(2));
        $('.varTemp').text(varTemp.toFixed(2));
        tooltip.style("left",(d3.event.pageX -$('.tooltip').width()/2) + "px")
                .style("top",(d3.event.pageY - 100) + "px")
                .transition().duration(100)
                .style("opacity",1);
        d3.select(this).style("stroke","black");
    });
    grid.on("mouseout",function(d) {
        tooltip.transition().duration(100).style("opacity",0);
        d3.select(this).style("stroke","transparent");
        });
    //legend
    var legendWidth = 35;
    var colorDigits = [0].concat(colorScale.quantiles());
    var legend = chart.append("g")
                        .attr("class","legend")
                        .attr("transform","translate(" + (width - legendWidth * colors.length) + "," + (height + 50) + ")");
    var legendGrid = legend.selectAll(".legend-grid")
                            .data(colorDigits)
                        .enter().append("rect")
                            .attr("class","lengend-grid")
                            .attr("width",legendWidth)
                            .attr("height",gridHeight/2)
                            .style("fill",function(d,i) {
                                return colors[i];
                            });
    legendGrid.attr("transform",function(d,i) {
        return "translate(" + legendWidth*i + ",0)";
    });
    legend.selectAll(".legend-text") 
                .data(colorDigits)
            .enter().append("text")
                .attr("class","legend-text")
                .text(function(d,i) {
                    return d.toFixed(1);
                })
                .attr("text-anchor","middle")
                .attr("transform",function(d,i) {
                    return "translate(" + (legendWidth*i + legendWidth/2) + ",40)";
                });
    
});

//helper function
function lookupMonth(m) {
    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return month[m];
}

