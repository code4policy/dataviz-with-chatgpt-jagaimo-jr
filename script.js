// script.js
// D3 horizontal bar chart for top 10 311 call reasons

d3.csv("boston_311_2025_by_reason.csv").then(function(data) {
  // Debug: log first row to check column names
  console.log("First row:", data[0]);

  // Try to detect correct column names
  const firstRow = data[0];
  const reasonKey = Object.keys(firstRow).find(k => k.toLowerCase().includes("reason"));
  const countKey = Object.keys(firstRow).find(k => k.toLowerCase().includes("count"));

  data.forEach(d => d[countKey] = +d[countKey]);
  data = data.sort((a, b) => d3.descending(a[countKey], b[countKey])).slice(0, 10);

  const margin = {top: 40, right: 70, bottom: 40, left: 220},
        width = 800 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand()
    .domain(data.map(d => d[reasonKey]))
    .range([0, height])
    .padding(0.15);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[countKey])])
    .range([0, width]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("class", "axis-label");

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6))
    .selectAll("text")
    .attr("class", "axis-label");

  // Color scheme: highlight the top reason in red, others in gray
  const highlightColor = "#e74c3c"; // red for top reason
  const mutedColor = "#cccccc"; // gray for others

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d[reasonKey]))
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("width", d => x(d[countKey]))
    .attr("fill", (d, i) => i === 0 ? highlightColor : mutedColor)
    .on("mouseover", function(event, d, i) {
      d3.select(this).attr("fill", i === 0 ? "#c0392b" : "#888888");
    })
    .on("mouseout", function(event, d, i) {
      d3.select(this).attr("fill", (d, i) => i === 0 ? highlightColor : mutedColor);
    });

  // Add value labels
  svg.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => x(d[countKey]) + 6)
    .attr("y", d => y(d[reasonKey]) + y.bandwidth()/2 + 4)
    .text(d => d[countKey])
    .attr("fill", "#333")
    .attr("font-size", "1em");
});
