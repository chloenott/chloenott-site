import * as React from "react";
import * as d3 from "d3";
import styles from '../styles/Home.module.css'
import { transition } from "d3";

function drawChart(svgRef) {
  d3.json("/data/character-tree.json").then(data => {
  const height = window.innerHeight*1.2;
  const width = window.innerWidth*1;

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
      .style("stroke", function(d) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
          return d.name == "Penguins Are Forever" ? "#c4d98f" : "#ffffff";
        else {
          return d.name == "Penguins Are Forever" ? "#c4d98f" : "#000000";
        }
      })
      .style("opacity", function(d) {
        return d.target == 99 && d.source == 1 ? 0 : 1;
      })

  const node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr("r", function(d) {
          if (d.size) {
            return 5;
          } else if (d.name == "Penguins Are Forever") { 
            return 10;
          } else { 
            return 2;
          }
        })
        .style("fill", function(d) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
            return d.name == "Penguins Are Forever" ? "#c4d98f" : "#ffffff";
          else {
            return d.name == "Penguins Are Forever" ? "#c4d98f" : "#000000";
          }
        })
        .style("opacity", 1)

  const text = svg
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
        .text(d => d.name)
        .style("font-size", function(d) {
          return d.size || d.name == "Penguins Are Forever" ? "1.5rem" : "0.8rem"
        })
        .style("font-family", "Ovo-Regular")
        .attr("text-align", "center")
        .attr("text-anchor", "middle")
        .style("padding", "1rem")
        .style("fill", function(d) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
            return "#000000";
          else {
            return "#FFFFFF";
          }
        })
        .style("opacity", 0)
        .on("mouseover", function(d) {
          d3.select(this)
          .transition()
          .duration(50)
          .style("opacity", 1)
        })
        .on("mouseout", function(d) {
          d3.select(this)
          .transition()
          .duration(5000)
          .style("opacity", 0)
        })
        .on("touchstart", function(d) {
          d3.select(this)
          .transition()
          .duration(50)
          .style("opacity", 1)
        })
        .on("touchend", function(d) {
          d3.select(this)
          .transition()
          .duration(5000)
          .style("opacity", 0)
        })

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
      .attr("y", function(d) { return d.y; })
  }

  const simulation = d3.forceSimulation(data.nodes)
    .force("charge", d3.forceManyBody()
      .strength(-200)
    )
    .force('linkStrong', d3.forceLink()
      .id(function(d) { return d.id; })
      .links(data.links.filter(d => d.source == 1))
      .strength(0.5)
    )
    .force("link", d3.forceLink()
      .id(function(d) { return d.id; })
      .links(data.links)
      .strength(0.2)
    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(.3)
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
