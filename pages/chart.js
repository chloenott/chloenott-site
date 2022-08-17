import * as React from "react";
import * as d3 from "d3";
import styles from '../styles/Home.module.css'

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
    ).on("dblclick.zoom", null)
    .append('g');

  const link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", function(d) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
          return d.id == 104 ? "#c4d98f" : "#888888";
        else {
          return d.id == 104 ? "#c4d98f" : "#000000";
        }
      })
      .style("opacity", function(d) {
        if (d.target == 99 && d.source == 1) {
          return 0;
        } else if (d.target == 1 && d.source == 104) {
          return 0;
        } else {
          return 1;
        }
      })

  const node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr("r", function(d) {
          if (d.size) {
            return 5;
          } else if (d.id == 104) { 
            return 3;
          } else if (d.id == 1) {
            return 5;
          } else { 
            return 2;
          }
        })
        .style("fill", function(d) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
            return d.id == 104 ? "#888888" : "#888888";
          else {
            return d.id == 104 ? "#000000" : "#000000";
          }
        })
        .style("opacity", 1)
        .attr("id", function(d) {
          return `nodeId${d.id}`;
        })

  const hubNodes = [2, 46, 77, 92]
  const glowColorOn = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? '#ffffff' : '#ffffff'
  const glowColorOff = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? '#888888' : '#000000'

  const startTransition = () => {
    for (let i = 1; i <= data.nodes.length; i++) {
      if (hubNodes.includes(i)) {
        d3.select(`#nodeId${i}`)
          .transition()
          .duration(3000)
          .style("fill", glowColorOn)
      } else if (i == 104) {
        continue;
      } else {
        d3.select(`#nodeId${i}`)
          .transition()
          .duration(2000)
          .style("fill", glowColorOn)
      }
    }

    d3.select('#nodeId1')
      .transition()
      .duration(5000)
      .attr("r", 30)
      .style("fill", glowColorOn)
      .on("end", function() {
        endTransition(1);
      })
  }

  const endTransition = (durationScalar) => {
    for (let i = 1; i <= data.nodes.length; i++) {
      if (hubNodes.includes(i)) {
        d3.select(`#nodeId${i}`)
          .transition()
          .duration(3000*durationScalar)
          .style("fill", glowColorOff)
      } else if (i == 104) {
        continue;
      } else {
        d3.select(`#nodeId${i}`)
          .transition()
          .duration(2000*durationScalar)
          .style("fill", glowColorOff)
      }
    }

    d3.select('#nodeId1')
      .transition()
      .duration(5000*durationScalar)
      .attr("r", 6)
      .style("fill", glowColorOff)
      .on("end", startTransition)
  }

  startTransition();

  const text = svg
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
        .text(d => d.name)
        .style("font-size", function(d) {
          if (d.size) {
            return "2.0rem";
          } else if (d.id == 104) { 
            return "3.0rem";
          } else { 
            return "0.8rem";
          }
        })
        .style("font-family", "Ovo-Regular")
        .attr("text-align", "center")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("padding", "1rem")
        .style("fill", function(d) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
            return "#000000";
          else {
            return "#FFFFFF";
          }
        })
    .style("opacity", 0)
    .attr("id", function(d) {
      return `textId${d.id}`;
    })
    .on("pointerover", function(d) {
      d.stopPropagation();
      d.preventDefault();
      if (d3.select(this).attr('id') == 'textId104') {
        endTransition(0.1);
        d3.select("#nodeId104")
          .transition()
          .duration(200)
          .attr("r", 20)
          .style("fill", glowColorOn)
        text
          .transition()
          .duration(200)
          .style("opacity", 0)
      }
      d3.select(this)
        .transition()
        .duration(25)
        .style("opacity", function(d) {
          if (d.id == 104 || d.id == 1) {
            return 0;
          } else { 
            return 1;
          }
        })
    })
    .on("pointerout", function(d) {
      d.stopPropagation();
      d.preventDefault();
      if (d3.select(this).attr('id') == 'textId104') {
        d3.select("#nodeId104")
          .transition()
          .duration(1500)
          .attr("r", 3)
          .style("fill", glowColorOff)
      }
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
      .attr("y", function(d) { return d.y; });
  }

  const simulation = d3.forceSimulation(data.nodes)
    .force("charge", d3.forceManyBody()
      .strength(-200)
    )
    .force('linkStrong', d3.forceLink()
      .id(function(d) { return d.id; })
      .links(data.links.filter(d => d.source == 1))
      .strength(0.8)
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
