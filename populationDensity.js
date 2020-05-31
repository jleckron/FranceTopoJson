//sections of code sourced from Mike Bostok
//https://bl.ocks.org/mbostock/5562380
var margin = {left: 100, right: 100, top: 0, bottom: 50 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 
    var proj = d3.geoAlbers()
    .rotate([-2.8, 3])
    .translate([width / 2, height + 400])
    .scale(3500);

var path = d3.geoPath()
    .projection(proj);


// ---- Beginning of sourced code ----
// Sourced from Mike Bostok with modifications
var color = d3.scaleThreshold()
        .domain([1, 20, 70, 150, 300, 600, 1000])
        .range(d3.schemeYlOrRd[8]);

var color2 = d3.scaleThreshold()
        .domain([1, 10, 20, 30, 40, 50])
        .range(d3.schemeYlGnBu[7]);

var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

var x2 = d3.scaleLinear()
    .domain([0, 110])
    .rangeRound([412, 975]);

// Creates color scale
var info = svg.selectAll("rect")
    .data(color
    .range()
    .map(function (d) {
        d = color.invertExtent(d);
        if (d[0] === null) {
            d[0] = x.domain()[0];
        }
        if (d[1] === null) {
            d[1] = x.domain()[1];
        }
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8);

// Label legend
var text = svg.append("text")
    .attr("class", "caption")
    .attr("x", 500)
    .attr("y", 40)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold");


//----- End of sourced code ---- 

function rowConverter(data, _, columns) {
    return {
        region : data.region,
        pop: +data.population,
        area: +data.area,
        density: +data.density,
        gdp: +data.gdp,
        gdpCap: +data.gdpCap
    };
}

d3.csv("DepartmentDensity.csv", rowConverter).then(function (data) {
    console.log("Data", data);
    d3.json("gadm36_FRA.json").then(function (topology) {
        console.log("Topology", topology);
        var geo = topology.objects.gadm36_FRA_2;
        console.log("Geo", geo);

        for (var i=0; i<data.length;i++) {
            for (var j=0; j<geo.geometries.length;j++) {
                if (data[i].region==geo.geometries[j].properties.NAME_2) {
                    geo.geometries[j].properties.CC_1=+data[i].density;
                    geo.geometries[j].properties.CC_2=+data[i].gdpCap/1000;
                    break;
                }
            }
        }
        
        var shps = svg.selectAll("path")
            .data(topojson.feature(topology, geo).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke-width",  0.5)
            .attr("stroke", "black")
            .attr("fill", function(d) {return color(d.properties.CC_1)});
        
        render(1)

        //function called on button press
        function render(pop) {
            if(pop==1){ //if populations density button pressed
                shps.attr("fill", function(d) { //edit various field to show pop density data
                    return color(d.properties.CC_1);
                });
                info.data(color
                .range()
                .map(function (d) {
                    d = color.invertExtent(d);
                    if (d[0] === null) {
                        d[0] = x.domain()[0];
                    }
                    if (d[1] === null) {
                        d[1] = x.domain()[1];
                    }
                    return d;
                }))
                .attr("x", function (d) { return x(d[0]); })
                .attr("width", function (d) { return x(d[1]) - x(d[0])+100; })
                .attr("fill", function (d) { return color(d[0]); });
                text.text("Population per square kilometer");
                svg.call(d3.axisBottom(x)
                        .tickSize(13)
                        .tickValues(color.domain()))
                        .select(".domain")
                        .remove();
            }
            else{ //else
                shps.attr("fill", function(d) { //edit various fields to show gdp per capita data
                    return color2(d.properties.CC_2);
                })
                info.data(color2
                .range()
                .map(function (d) {
                    d = color2.invertExtent(d);
                    if (d[0] === null) {
                        d[0] = x2.domain()[0];
                    }
                    if (d[1] === null) {
                        d[1] = x2.domain()[1];
                    }
                    return d;
                }))
                .attr("x", function (d) { return x2(d[0]); })
                .attr("width", function (d) { return x2(d[1]) - x2(d[0])+100; })
                .attr("fill", function (d) { return color2(d[0]); });             text.text("GDP per Capita (Thousand $)");
                svg.call(d3.axisBottom(x2)
                        .tickSize(13)
                        .tickValues(color2.domain()))
                        .select(".domain")
                        .remove();
            }
        }

        //toggle buttons referenced from https://bl.ocks.org/oikonang/c645e2aa3a4fe313269afc1c39c8a05d
        d3.select("#population")
          .on("click", function(d, i) {
            render(1)
          });
        d3.select("#gdp")
          .on("click", function(d, i) {
            render(0)
          });
   })  
});  
