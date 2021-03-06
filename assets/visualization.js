let height = 600;
let width = 1000;
let margin = { top: 10, bottom: 10, left: 10, right: 40 };
let active = d3.select(null);
var tempColor,
  cityOrdinates,
  cityDetails,
  cityData,
  sgdDataCombined,
  statesData,
  indCityCount;

let projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale([1200]);
const path = d3.geoPath().projection(projection);
let colorScale = d3.scaleSqrt().domain([2, 20]).range(d3.schemeYlGn[9]);
let svg = d3
  .select("#usmap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("background", "lightgray");
let g = svg.append("g");

const cityTooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltipCity")
  .style("opacity", 0);

Promise.all([
  d3.json("data/us-states.json"),
  d3.json("data/us-states-count.json"),
  d3.json("data/freq_by_city.json"),
  d3.json("data/sgd_data.json"),
  d3.csv("data/us-states-postal-code.csv"),
  d3.csv("data/freq_by_state.csv"),
]).then(([data, stData, cityData, allData, states, freqState]) => {
  plotMap(data, stData, cityData, allData, states, freqState, "all");
});

let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "stateToolTip")
  .style("position", "absolute")
  .style("padding", "0 10px")
  .style("margin", "20px")
  // .style("background", "white")
  .style("opacity", 0.2)
  .style("font-size", "2rem")
  .style("font-weight", "bold");

var ramp = d3.scaleSequential(d3.interpolateYlGn).domain([0, 1447]);

$(document).ready(function () {
  $("#message").hide();
  $("#genderButton").click(function () {
    let gender = "all";
    if ($("#selectGender").val() == "male") {
      ramp = d3.scaleSequential(d3.interpolatePuBu).domain([0, 1447]);
      gender = "male";
      $("#message").show();
    } else if ($("#selectGender").val() == "female") {
      gender = "female";
      ramp = d3.scaleSequential(d3.interpolateRdPu).domain([0, 1447]);
      $("#message").show();
    } else {
      ramp = d3.scaleSequential(d3.interpolateYlGn).domain([0, 1447]);
      gender = "all";
      $("#message").hide();
    }

    Promise.all([
      d3.json("data/us-states.json"),
      d3.json("data/us-states-count.json"),
      d3.json("data/freq_by_city.json"),
      d3.json("data/sgd_data.json"),
      d3.csv("data/us-states-postal-code.csv"),
      d3.csv("data/freq_by_state.csv"),
    ]).then(([data, stData, cityData, allData, states, freqState]) => {
      plotMap(data, stData, cityData, allData, states, freqState, gender);
    });
  });
});
var onlyMalesCount, onlyFemalesCount;

function plotMap(data, stateData, ctData, allData, states, freqState, gender) {
  cityData = ctData;
  statesData = states;
  let usStates = topojson.feature(data, data.objects.collection).features;

  sgdDataCombined = allData;
  malesCount = getCounts(sgdDataCombined, "M");
  femalesCount = getCounts(sgdDataCombined, "F");

  onlyMalesCount = malesCount.age1 + malesCount.age2 + malesCount.age3;
  onlyFemalesCount = femalesCount.age1 + femalesCount.age2 + femalesCount.age3;

  g.append("g")
    .selectAll("path")
    .data(usStates)
    .enter()
    .append("path")
    .style("stroke", "black")
    .attr("d", path)
    .on("click", zoom)
    .attr("fill", function (d) {
      let name = d.properties.NAME;
      if (name in stateData)
        return ramp((d.rate = stateData[d.properties.NAME]["count"]));
      else return ramp((d.rate = 0));
    })
    .attr("cursor", "pointer")
    .on("mouseover", function (d) {
      var malesC = freqState.find((t) => t.NAME === d.properties.NAME).males;
      var femalesC = freqState.find((t) => t.NAME === d.properties.NAME)
        .females;
      let tooltipText = "";
      if (gender === "male") {
        tooltipText =
          '<span class="tooltip__variable">Total:' + malesC + "</span>";
      } else if (gender === "female") {
        tooltipText =
          '<span class="tooltip__variable">Total:' + femalesC + "</span>";
      } else {
        tooltipText =
          "<div >" +
          '<span class="tooltip__title">' +
          d.properties.NAME +
          "</span> <br>" +
          '<span class="tooltip__variable">Total deaths:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].count +
          "</span><br>" +
          '<span class="tooltip__variable">Males:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].genderMale +
          "</span><br>" +
          '<span class="tooltip__variable">Females:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].genderFemale +
          "</span><br>" +
          '<span class="tooltip__variable">Gender not recorded:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].genderUnknown +
          "</span><br>" +
          "<br>" +
          '<span class="tooltip__variable">Children:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].ageGroup1 +
          "</span><br>" +
          '<span class="tooltip__variable">Adolescent:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].ageGroup2 +
          "</span><br>" +
          '<span class="tooltip__variable">Adult:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].ageGroup3 +
          "</span><br>" +
          '<span class="tooltip__variable">Age not recorded:</span>' +
          '<span class="tooltip__value">' +
          stateData[d.properties.NAME].ageGroupUnknown +
          "</span><br>" +
          "</div>";
      }

      d3.select(this).style("stroke", "black").style("stroke-width", "4px");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(tooltipText)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 50 + "px");
      tempColor = this.style.fill;
    })
    .on("mouseout", function (d) {
      tooltip.html("");
      d3.select(this).style("stroke", "black").style("stroke-width", "1px");

      d3.select(this).style("fill", tempColor);
    });

  // Bottom Scale Bar

  axisScale = d3.scaleLinear().domain(ramp.domain()).range([50, 550]);
  axisBottom = (g) =>
    g
      .attr("class", `x-axis`)
      .attr("transform", "translate(210,600)")
      .call(d3.axisBottom(axisScale).ticks(10).tickSize(-10));
  const linearGradient = svg
    .append("linearGradient")
    .attr("id", "linear-gradient");
  linearGradient
    .selectAll("stop")
    .data(
      ramp.ticks().map((t, i, n) => ({
        offset: `${(100 * i) / n.length}%`,
        color: ramp(t),
      }))
    )
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);
  g.append("g")
    .attr("transform", "translate(250,530)")
    .append("rect")
    .attr("transform", "translate(10,50)")
    .attr("width", 501)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)");
  g.append("g").call(axisBottom);
}

function zoom(d) {
  cityOrdinates = new Map();
  cityDetails = new Array();

  g.selectAll("circle").remove();

  if (d3.select(".background").node() === this) return reset();
  if (active.node() === this) return reset();

  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  stateDetails = d;

  cityData.forEach((city) => {
    if (city.statename === d.properties.NAME) {
      cityOrdinates.set(city.city, [city.lng, city.lat]);
      cityDetails.push(city);
    }
  });

  deathsMax = Math.max.apply(
    Math,
    cityDetails.map(function (o) {
      return o.males + o.females;
    })
  );

  deathsMin = Math.min.apply(
    Math,
    cityDetails.map(function (o) {
      return o.males + o.females;
    })
  );

  radiusScaler = d3.scaleLinear().domain([deathsMin, deathsMax]).range([1, 10]);

  let bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale = 0.5 / Math.max(dx / width, dy / height),
    translate = [width / 2 - scale * x, height / 2 - scale * y];

  g.transition()
    .duration(750)
    .style("stroke-width", 1.5 / scale + "px")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  cities = [];
  for (let coord of cityOrdinates.entries()) {
    cities.push(coord);
  }

  g.selectAll("circle")
    .data(cities)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return projection(d[1])[0];
    })
    .attr("cy", function (d) {
      return projection(d[1])[1];
    })
    .attr("r", (d, i) => {
      indCityCount = cityDetails.find(({ city }) => city === d[0]);
      return radiusScaler(indCityCount.males + indCityCount.females) + "px";
    })
    .attr("fill", "skyblue")

    .style("opacity", 0.4)
    .attr("stroke", "black")
    .attr("stroke-width", "0.5px")
    .on("mouseover", zoomCity)
    .on("mouseout", zoomOutCity);
}

function zoomCity(d, i) {
  d3.selectAll("tooltip").remove();
  tooltip.transition().duration(200).style("opacity", 0.9);
  tooltip
    .html(cityToolTip(cityDetails[i]))
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY + "px");
  d3.select(this).style("opacity", 0.75);
}
function zoomOutCity() {
  cityTooltip.transition().style("opacity", 0);
  d3.select(this).style("opacity", 0.4);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  g.transition()
    .delay(100)
    .duration(750)
    .style("stroke-width", "1.5px")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g.selectAll("circle").remove();
  d3.select(".cityState").text("United States of America");
  d3.select("#details").selectAll("text").remove();
}

function getCounts(sgdDataCombined, type) {
  const age1 = sgdDataCombined.filter((states) => {
    return states.gender === type && states.agegroup === 1;
  }).length;
  const age2 = sgdDataCombined.filter((states) => {
    return states.gender === type && states.agegroup === 2;
  }).length;
  const age3 = sgdDataCombined.filter((states) => {
    return states.gender === type && states.agegroup === 3;
  }).length;
  const age9 = sgdDataCombined.filter((states) => {
    return states.gender === type && states.agegroup === 9;
  }).length;
  return {
    age1,
    age2,
    age3,
    age9,
  };
}

function cityToolTip(cityTipData) {
  html = `<span><b>` + cityTipData.city + `</b></span>`;
  html +=
    `<div class='cityToolTip'><table><tr><td>Total Deaths: </td><td style="text-align:right">` +
    (cityTipData.males + cityTipData.females) +
    `</td></tr><tr><td>Deaths(Male): </td><td style="text-align:right">` +
    cityTipData.males +
    `</td></tr><tr><td>Deaths(Female): </td><td style="text-align:right">` +
    cityTipData.females +
    `</td></tr></table></div>`;
  return html;
}
