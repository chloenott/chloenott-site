import * as React from "react";
import * as d3 from "d3";
import styles from '../styles/Home.module.css'

function drawChart(svgRef) {
  d3.json("/data/character-tree.json").then(data => {
  const height = window.innerHeight;
  const width = window.innerWidth;

  const svg = d3.select(svgRef.current);
  svg
    .attr("width", width)
    .attr("height", height)
    .style("margin-top", 0)
    .style("margin-left", 0)

  const link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#000000")
      .style("opacity", 0.1)

  const node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr("r", function(d) {
          return d.size ? 10 : 2;
        })
        .style("fill", "#000000")

  const text = svg
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
        .text(d => d.name)
        .style("font-size", function(d) {
          return d.size ? "1.5rem" : "0.8rem"
        })
        .style("font-family", "Ovo-Regular")
        .style("fill", "#000000")
        .style("text-anchor", "middle")
        .style("opacity", 1)

  let ticked = () => {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("cx", function (d) { return d.x })
      .attr("cy", function(d) { return d.y; });

    text
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
  }

  const simulation = d3.forceSimulation(data.nodes)
    .force("charge", d3.forceManyBody()
      .strength(-500)
    )
    .force('linkStrong', d3.forceLink()
      .id(function(d) { return d.id; })
      .links(data.links.filter(d => d.source == 1))
      .strength(1)
    )
    .force("link", d3.forceLink()
      .id(function(d) { return d.id; })
      .links(data.links)
      .strength(0.2)
    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(.1)
    .on("tick", ticked)
  });
}

const Chart = () => {
  const svg = React.useRef(null);
  React.useEffect(() => {
    drawChart(svg);
  }, [svg]);

  return (
    <div className={styles.character_tree}>
      <svg ref={svg} />
    </div>
  );
};

export default Chart;
