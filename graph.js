const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value(d => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

//color scheme for pie sections
const colors = d3.scaleOrdinal(d3["schemeSet3"]);

const update = data => {
  //join data to elements
  const paths = graph.selectAll("path").data(pie(data));

  //map colors scheme to names
  colors.domain(data.map(d => d.name));

  //remove exit selection
  paths
    .exit()
    .transition()
    .duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

  //update current shapes
  paths
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  //append new shapes
  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    // .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", d => colors(d.data.name))
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);
};

let data = [];

db.collection("expenses").onSnapshot(res => {
  res.docChanges().forEach(change => {
    // console.log("change: ", change);
    const doc = { ...change.doc.data(), id: change.doc.id };
    if (change.type === "added") {
      data.push(doc);
    } else if (change.type === "modified") {
      const index = data.findIndex(item => item.id === doc.id);
      console.log("index: ", index);
      data[index] = doc;
    } else if (change.type === "removed") {
      data = data.filter(item => item.id !== doc.id);
    }
  });
  //   console.log("data: ", data);

  update(data);
});

const arcTweenEnter = d => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = d => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
  console.log(this._current, d);
  // interpolate between the two objects
  var i = d3.interpolate(this._current, d);
  // update the current prop with new updated data
  this._current = i(1);

  return function(t) {
    // i(t) returns a value of d (data object) which we pass to arcPath
    return arcPath(i(t));
  };
}
