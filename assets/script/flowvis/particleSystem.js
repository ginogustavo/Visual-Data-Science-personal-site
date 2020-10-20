/* author: Andrew Burks */
"use strict";

/* Get or create the application global variable */
var App = App || {};

const ParticleSystem = function () {
  // setup the pointer to the scope 'this' variable
  const self = this;

  // data container
  const data = [];

  // scene graph group for the particle system
  const sceneObject = new THREE.Group();

  // bounds of the data
  const bounds = {};

  // create the containment box.
  // This cylinder is only to guide development.
  // TODO: Remove after the data has been rendered
  self.drawContainment = function () {
    // get the radius and height based on the data bounds
    const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
    const height = bounds.maxY - bounds.minY + 1;

    // create a cylinder to contain the particle system
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
    });
    const cylinder = new THREE.Mesh(geometry, material);

    // add the containment to the scene
    sceneObject.add(cylinder);
  };
  var materialPoints;
  var points;
  var geometryPoints = new THREE.BufferGeometry();
  var colorsScalarRed = [];
  var colorsScalarGreen = [];
  var colorsScalarBlue = [];
  var colorsScalarYellow = [];
  var colorsScalarMix = [];

  // creates the particle system
  self.createParticleSystem = function (selectedColor) {
    // use self.data to create the particle system
    // draw your particle system here!
    var vertices = [];
    var colors = [];
    var color = new THREE.Color();

    let index = 0;
    for (var i = 0; i < data.length; i++) {
      vertices.push(data[i].X, data[i].Z, data[i].Y);
      color.setRGB(data[i].U, data[i].W, data[i].V);
      colorsScalarMix.push(color.r, color.g, color.b);
      let tColor = self.convertRGB(redPoints(data[i].concentration));
      colors[index] = tColor.r;
      colors[index + 1] = tColor.g;
      colors[index + 2] = tColor.b;
      let tColorRed = self.convertRGB(redPoints(data[i].concentration));
      let tColorGreen = self.convertRGB(greenPoints(data[i].concentration));
      let tColorBlue = self.convertRGB(bluePoints(data[i].concentration));
      let tColorYellow = self.convertRGB(yellowPoints(data[i].concentration));
      colorsScalarRed[index] = tColorRed.r;
      colorsScalarRed[index + 1] = tColorRed.g;
      colorsScalarRed[index + 2] = tColorRed.b;
      colorsScalarGreen[index] = tColorGreen.r;
      colorsScalarGreen[index + 1] = tColorGreen.g;
      colorsScalarGreen[index + 2] = tColorGreen.b;
      colorsScalarBlue[index] = tColorBlue.r;
      colorsScalarBlue[index + 1] = tColorBlue.g;
      colorsScalarBlue[index + 2] = tColorBlue.b;
      colorsScalarYellow[index] = tColorYellow.r;
      colorsScalarYellow[index + 1] = tColorYellow.g;
      colorsScalarYellow[index + 2] = tColorYellow.b;
      index += 3;
    }

    geometryPoints.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometryPoints.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colorsScalarRed, 3)
    );
    materialPoints = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: THREE.VertexColors,
    });
    points = new THREE.Points(geometryPoints, materialPoints);
    sceneObject.add(points);
  };

  self.changePointsMaterial = function (selectedColor) {
    switch (selectedColor) {
      case "red":
        geometryPoints.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colorsScalarRed, 3)
        );
        break;
      case "green":
        geometryPoints.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colorsScalarGreen, 3)
        );
        break;
      case "blue":
        geometryPoints.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colorsScalarBlue, 3)
        );
        break;
      case "yellow":
        geometryPoints.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colorsScalarYellow, 3)
        );
        break;
      default:
        //mix
        geometryPoints.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colorsScalarMix, 3)
        );
        break;
    }
  };

  let redPoints, greenPoints, bluePoints, yellowPoints;
  self.generateColorOptions = function () {
    redPoints = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.concentration),
        d3.max(data, (d) => d.concentration),
      ])
      .range(["#dedede", "#ab0303"]);
    greenPoints = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.concentration),
        d3.max(data, (d) => d.concentration),
      ])
      .range(["#dedede", "#024a02"]);
    bluePoints = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.concentration),
        d3.max(data, (d) => d.concentration),
      ])
      .range(["#dedede", "#001ac2"]);
    yellowPoints = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.concentration),
        d3.max(data, (d) => d.concentration),
      ])
      .range(["#dedede", "#ad9f00"]);
  };

  self.convertRGB = function (rgb) {
    let rRGB = {};
    let trgb = rgb.substr(4).split(")")[0].split(",");
    rRGB.r = Number(trgb[0]) / 255;
    rRGB.g = Number(trgb[1]) / 255;
    rRGB.b = Number(trgb[2]) / 255;
    return rRGB;
  };

  let svg;
  self.create2DPanelViewDataPoints = function () {
    let height = 500;
    let width = 500;
    let margin = { top: 10, bottom: 10, left: 10, right: 40 };
    svg = d3
      .select("#view2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", "#ffe2b0")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear().domain([-6, 6]).range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0,490)")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([-1, 11]).range([height, 0]);
    svg
      .append("g")
      .attr("transform", "translate(250,0)") //delete
      .call(d3.axisLeft(y));

    // Add dots
    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.X);
      })
      .attr("cy", function (d) {
        return y(d.Z);
      })
      .attr("r", 0.5)
      .style("fill", "#3d13e8");
  };

  var geometry2DPlane;
  var plane;
  var material2DPlane;

  self.create2DPlane = function () {
    geometry2DPlane = new THREE.PlaneGeometry(14, 14); //, 32
    material2DPlane = new THREE.MeshBasicMaterial({
      color: "#3d13e8",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    plane = new THREE.Mesh(geometry2DPlane, material2DPlane);
    geometry2DPlane.translate(0, 5, 0);
    sceneObject.add(plane);
  };

  self.addToggleForTransparency = function () {
    var controlsView = d3.select("#viewControls");
    var div = controlsView.append("div").attr("class", "slidecontainer");
    div
      .append("span")
      .attr("class", "titleControl")
      .html("Plane transparency: ");
    var labelSwitch = div.append("label").attr("class", "switch");
    labelSwitch
      .append("input")
      .attr("type", "checkbox")
      .attr("name", "toggleTran")
      .attr("id", "toggleTran")
      .property("checked", true);
    labelSwitch.append("span").attr("class", "slider round");

    d3.selectAll("input[name='toggleTran']").on("change", function () {
      if (document.getElementById("toggleTran").checked) {
        material2DPlane.opacity = 0.5;
      } else {
        material2DPlane.opacity = 1;
      }
    });
  };

  self.addSliderForPlane = function () {
    var controlsView = d3.select("#viewControls");

    var div = controlsView.append("div").attr("class", "slidecontainer");

    div
      .append("span")
      .attr("class", "titleControl")
      .html("Panel Control (Z axis): ");
    div
      .append("input")
      .attr("type", "range")
      .attr("min", "-6")
      .attr("max", "6")
      .attr("value", 0)
      .attr("id", "planeControl")
      .attr("class", "sliderPlane");

    var slider = document.getElementById("planeControl");
    slider.oninput = function () {
      self.translate2DPlane(this.value);
    };
  };

  self.addSliderForThickness = function () {
    var controlsView = d3.select("#viewControls");
    var div = controlsView.append("div").attr("class", "slidecontainer");
    div.append("span").attr("class", "titleControl").html("Points Thickness: ");
    div
      .append("input")
      .attr("type", "range")
      .attr("min", 30)
      .attr("max", 120)
      .attr("value", 75)
      .attr("id", "thicknessControl")
      .attr("class", "sliderPlane");

    var sliderThick = document.getElementById("thicknessControl");
    sliderThick.oninput = function () {
      materialPoints.size = this.value / 1000;
    };
  };

  self.addColorControl = function () {
    var controlDiv = d3
      .select("#viewControls")
      .append("div")
      .attr("class", "switch-field");

    controlDiv
      .append("span")
      .attr("class", "titleControl")
      .html("Points Color: ");

    controlDiv
      .append("input")
      .attr("type", "radio")
      .attr("name", "radioColor")
      .attr("id", "redradio")
      .attr("value", "red")
      .property("checked", true);
    controlDiv.append("label").attr("for", "redradio").html("Red");

    controlDiv
      .append("input")
      .attr("type", "radio")
      .attr("name", "radioColor")
      .attr("id", "greenradio")
      .attr("value", "green");
    controlDiv.append("label").attr("for", "greenradio").html("Green");

    controlDiv
      .append("input")
      .attr("type", "radio")
      .attr("name", "radioColor")
      .attr("id", "blueradio")
      .attr("value", "blue");
    controlDiv.append("label").attr("for", "blueradio").html("Blue");

    controlDiv
      .append("input")
      .attr("type", "radio")
      .attr("name", "radioColor")
      .attr("id", "yellowradio")
      .attr("value", "yellow");
    controlDiv.append("label").attr("for", "yellowradio").html("Yellow");

    controlDiv
      .append("input")
      .attr("type", "radio")
      .attr("name", "radioColor")
      .attr("id", "mixradio")
      .attr("value", "mix");
    controlDiv.append("label").attr("for", "mixradio").html("Mix");

    d3.selectAll("input[name='radioColor']").on("change", function () {
      self.changePointsMaterial(this.value);
    });
  };

  self.translate2DPlane = function (zValue) {
    plane.position.z = zValue;
    self.update2DPlane(zValue);
  };

  self.update2DPlane = function (zValue) {
    svg.selectAll("*").remove();

    // Add X axis
    var x = d3.scaleLinear().domain([-6, 6]).range([0, 500]);
    svg
      .append("g")
      .attr("transform", "translate(0,490)")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([-1, 11]).range([500, 0]);
    svg
      .append("g")
      .attr("transform", "translate(250,0)") //delete
      .call(d3.axisLeft(y));

    svg
      .append("g")
      .selectAll("dot")
      .data(self.getPointsByPlane(zValue))
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.X);
      })
      .attr("cy", function (d) {
        return y(d.Z);
      })
      .attr("r", 1.5)
      .style("fill", "#3d13e8");
  };

  self.getPointsByPlane = function (zValue) {
    var range = 0.1;
    var rangeMax = (zValue * 10 + range * 10) / 10;
    var rangeMin = (zValue * 10 - range * 10) / 10;
    var filteredData = data.filter(function (d) {
      if (d.Y >= rangeMin && d.Y <= rangeMax) {
        return true;
      }
      return false;
    });
    return filteredData;
  };

  // data loading function
  self.loadData = function (file) {
    // read the csv file
    d3.csv(file)
      // iterate over the rows of the csv file
      .row(function (d) {
        // get the min bounds
        bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
        bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
        bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

        // get the max bounds
        bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
        bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
        bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);

        // add the element to the data collection
        data.push({
          // concentration density
          concentration: Number(d.concentration),
          // Position
          X: Number(d.Points0),
          Y: Number(d.Points1),
          Z: Number(d.Points2),
          // Velocity
          U: Number(d.velocity0),
          V: Number(d.velocity1),
          W: Number(d.velocity2),
        });
      })
      // when done loading
      .get(function () {
        // draw the containment cylinder
        // TODO: Remove after the data has been rendered
        //self.drawContainment();

        self.generateColorOptions();

        // create the particle system
        //self.createParticleSystem();
        self.createParticleSystem("red");

        self.create2DPanelViewDataPoints();
        self.create2DPlane();
        self.addSliderForPlane();
        self.addColorControl();
        self.addSliderForThickness();
        self.addToggleForTransparency();
      });
  };

  // publicly available functions
  self.public = {
    // load the data and setup the system
    initialize: function (file) {
      self.loadData(file);
    },

    // accessor for the particle system
    getParticleSystems: function () {
      return sceneObject;
    },
  };

  return self.public;
};
