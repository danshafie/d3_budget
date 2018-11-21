const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

const svg = d3
  .select("canvas")
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

const arcPath = d3.arc().outerRadius(dims.radius);

const update = data => {
  console.log("data: ", data);
};

let data = [];

db.collection("expenses").onSnapshot(res => {
  res.docChanges().forEach(change => {
    console.log("change: ", change);
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

  update(data);
});
