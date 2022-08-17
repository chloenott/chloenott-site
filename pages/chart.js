import * as React from "react";
import * as d3 from "d3";
import styles from '../styles/Home.module.css'
import { transition } from "d3";

function drawChart(svgRef) {
  d3.json("/data/character-tree.json").then(data => {
  const heightScalar = 1.5
  const height = window.innerHeight*heightScalar;
  const width = window.innerWidth;

  const svg = d3.select(svgRef.current)
    .attr("width", width)
    .attr("height", height)
    .style("margin-top", 0)
    .style("margin-left", 0)
    .call(
      d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 1.5])
        .on("zoom", (event, d) => {
          d3.select('svg g').attr("transform", event.transform);
        })
    )
    .append('g');

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
            return 3;
          } else if (d.id == 1) {
            return 0;
          } else { 
            return 2;
          }
        })
        .style("fill", function(d) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
            return d.name == "Penguins Are Forever" ? "#5c5e55" : "#ffffff";
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
          return d.size || d.name == "Penguins Are Forever" ? "3.0rem" : "1.5rem"
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
    .on("pointerover", function(d) {
      d.stopPropagation();
      d.preventDefault();
      d3.select(this)
        .transition()
        .duration(25)
        .style("font-size", function(d) {
          return d.size || d.name == "Penguins Are Forever" ? "1.5rem" : "0.8rem"
        })
        .style("opacity", 1)
        .style("opacity", 1)
    })
    .on("pointerout", function(d) {
      d.stopPropagation();
      d.preventDefault();
      d3.select(this)
        .transition()
        .duration(5000)
        .style("opacity", 0)
        .style("font-size",function(d) {
          return d.size || d.name == "Penguins Are Forever" ? "3.0rem" : "1.5rem"
        })
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
      .attr("y", function(d) { return d.y; });
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
    .force("center", d3.forceCenter(width / 2, height / 2 / heightScalar))
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
      <svg ref={svg} className={styles.network_chart} />
    </div>
  );
};

export default Chart;
