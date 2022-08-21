import * as React from "react";
import * as d3 from "d3";
import styles from '../styles/Home.module.css';
import Router from 'next/router';

function drawChart(svgRef) {
  d3.json("/data/character-tree.json").then(data => {

    const heightScalar = 2.0;
    const height = window.innerHeight*heightScalar;
    const width = window.innerWidth;
    const isDesktopDevice = window.innerWidth > window.innerHeight || window.innerWidth > 1600;
    const defaultZoomScale = isDesktopDevice ? 1.0 : 0.5 * window.innerWidth/390;

    const hubNodes = [2, 46, 77, 92];
    const glowColorOn = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? '#000000' : '#ffffff';
    const glowColorOff = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? '#ffffff' : '#000000';
    const backgroundColor = window.matchMedia("(prefers-color-scheme: light)").matches ? '#BDC4C8' : '#3b3c3d';
    document.body.style.backgroundColor = backgroundColor;

    let isSleeping = false;

    data.nodes.forEach(function(d) {
      d.x = isDesktopDevice ? width * 1/3 : Math.random() + width;
      d.y = isDesktopDevice ? height * 1/2 / heightScalar : 0;
    })

    let zoom = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.5, 1.5])
      .on("zoom", (event, d) => {
        d3.select('svg g').attr("transform", event.transform)
      })

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("margin-top", 0)
      .style("margin-left", 0)
      .call(
        zoom
      ).on("dblclick.zoom", null)
      .append('g')
      .style("opacity", 0);
    
    // Slow fade in to mask initial simulation chaos. If changed, check out startTransition's setTimeout.
    svg
      .transition()
      .duration(1500)
      .style("opacity", 1)
    
    // Zoom out by default on mobile.
    if (!isDesktopDevice) {
      zoom
        .transform(d3.select('svg'), d3.zoomIdentity.translate(0, 0).scale(defaultZoomScale))
    }

    const link = svg
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
        .style("stroke", function(d) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
            return "#ffffff";
          else {
            return "#000000";
          }
        })
        .style("opacity", function(d) {
          if (d.target == 99 && d.source == 1) {
            return 0;
          } else if (d.target == 1 && d.source == 106) {
            return 0;
          } else {
            return 1;
          }
        })
        .attr("id", function(d) {
          return `lineId${d.source}To${d.target}`;
        })

    const node = svg
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
          .attr("r", function(d) {
            if (d.size == 2) {  // Todo d.size as a name is unclear. Currently d.size represents text size but text size probably shouldn't be the driver anyway.
              return 5;
            } else if (d.id == 106) { 
              return 3;
            } else if (d.id == 1) {
              return 5;
            } else { 
              return 2;
            }
          })
          .style("fill", function(d) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
              return "#ffffff";
            else {
              return "#000000";
            }
          })
          .style("opacity", 1)
          .attr("id", function(d) {
            return `nodeId${d.id}`;
          })
          .on('pointerdown', function(d) {
            d.stopPropagation();
            d.preventDefault();

            if (d3.select(this).attr('id') == 'nodeId1') {
              simulation.alphaDecay(0.1);
              simulation.alphaTarget(isSleeping ? 0.4 : 0.5)
              simulation.alpha(isSleeping ? 0.4 : 0.5)
              setTimeout(() => simulation.alphaTarget(0.2));
              simulation.restart();
            }
          })

    const startTransition = () => {
      for (let i = 1; i <= data.nodes.length; i++) {
        if (hubNodes.includes(i)) {
          d3.select(`#nodeId${i}`)
            .transition()
            .duration(3000)
            .style("fill", glowColorOn)
        } else if (i == 106) {
          continue;
        } else {
          d3.select(`#nodeId${i}`)
            .transition()
            .duration(2000)
            .style("fill", glowColorOn)
        }
      }

      d3.select('#lineId1To92')
        .transition()
        .delay(2000)
        .duration(2000)
        .style("stroke", glowColorOn)

      d3.select('#lineId92To99')
        .transition()
        .delay(2000)
        .duration(2500)
        .style("stroke", glowColorOn)
      
      d3.select('#lineId99To106')
        .transition()
        .delay(2000)
        .duration(3000)
        .style("stroke", glowColorOn)

      d3.select('#nodeId1')
        .transition()
        .duration(5000)
        .attr("r", 30)
        .style("fill", glowColorOn)
        .on("end", function() {
          endTransition(1, false);
        })
    }

    const endTransition = (durationScalar, lastTransition) => {
      for (let i = 1; i <= data.nodes.length; i++) {
        if (hubNodes.includes(i)) {
          d3.select(`#nodeId${i}`)
            .transition()
            .duration(3000*durationScalar)
            .style("fill", glowColorOff)
        } else if (i == 106) {
          continue;
        } else {
          d3.select(`#nodeId${i}`)
            .transition()
            .duration(2000*durationScalar)
            .style("fill", glowColorOff)
        }
      }
      
      d3.select('#lineId1To92')
        .transition()
        .duration(2000*durationScalar)
        .style("stroke", glowColorOff)

      d3.select('#lineId92To99')
        .transition()
        .duration(3000*durationScalar)
        .style("stroke", glowColorOff)
      
      d3.select('#lineId99To106')
        .transition()
        .duration(4000*durationScalar)
        .style("stroke", glowColorOff)

      d3.select('#nodeId106')
        .attr("r", 3)
        .style('opacity', 1)

      d3.select('#nodeId106')
        .transition()
        .delay(2200)
        .duration(1000)
        .attr("r", 7)
        .style('opacity', 0)
        .on('end', function() {
          d3.select('#nodeId106')
            .transition()
            .delay(2000)
            .duration(0)
            .attr("r", 0)
            .style('opacity', 1)
            .on('end', function() {
              d3.select('#nodeId106')
                .transition()
                .duration(5000)
                .attr("r", 3)
                .style('opacity', 1)
            })
        })

      d3.select('#nodeId1')
        .transition()
        .duration(4000*durationScalar)
        .attr("r", 6)
        .style("fill", glowColorOff)
        .on("end", function() {
          if (lastTransition) {
            return;
          } else {
            startTransition()
          }
        })
    }

    // Delay transition until svg is done fading in on load.
    if (isDesktopDevice) {
      setTimeout(startTransition, 500);
    } else {
      setTimeout(startTransition, 500);
    }

    const text = svg
      .selectAll("text")
      .data(data.nodes.filter(d => d.id != 1))
      .enter()
      .append("text")
          .text(d => d.name)
          .style("font-size", function(d) {
            if (d.size) {
              return `${d.size}rem`;
            } else if (d.id == 106) { 
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

      // ctrl+f tags: pointer, hover, mouse, selected, tap, touch, link, penguin, route
      .on("pointerover", function(d) {
        d.stopPropagation();
        d.preventDefault();

        // Graph falls asleep when penguin node is pointed at.
        if (d3.select(this).attr('id') == 'textId106') {

          // Turn off lights and relax tension.
          endTransition(2, true);
          simulation.alphaTarget(1)
          simulation.alpha(1)
          simulation.alphaTarget(0.005);
          simulation.alphaDecay(0.99);
          simulation.force("link").strength(1);
          simulation.force("linkPenguin").strength(0.7);

          // Start transition indicator to go to next page (grow penguin node), and then go to next page
          d3.select("#nodeId106")
            .transition()
            .duration(4500) // There's this amount of time to interrupt going to the next page.
            .attr("r", 100)
            .style('opacity', 1)
            .style("fill", glowColorOn)
            .on("end", function() {
              d3.select("#nodeId106")
                .transition()
                .duration(2000) // Technically this much time extra, but ya gotta be quick!
                .attr("r", Math.max(height, width))
                .style("fill", '#3b3c3d')
                .on("end", function() {
                  Router.push('/sample');
                })
            })

          text
            .transition()
            .duration(100)
            .style("opacity", 0)

          isSleeping = true;
        }

        // Show labels when nodes are hovered (desktop).
        if (isDesktopDevice) {
          d3.select(this)
            .transition()
            .duration(25)
            .style("opacity", function(d) {
              if (d.id == 106 || d.id == 1) {
                return 0;
              } else { 
                return 1;
              }
            })

        // Bubbly show all labels when a node is tapped (mobile), then reset tensions + restart transition loop (in case penguin node put graph to sleep).
        } else if (d3.select(this).attr("id") != 'textId106') {
          for (let i = 1; i <= data.nodes.length; i++) {
            if (i == 106 || i == 1) continue;
            d3.select(`#textId${i}`)
              .transition()
              .delay(Math.random() * 1000)
              .duration(1000 + Math.random() * 2000)
              .style("opacity", 1)
              .on("end", function() {
                d3.select(`#textId${i}`)
                .transition()
                .duration(1000 + Math.random() * 2000)
                .style("opacity", 0)
              })
          }

          // Graph wakes back up after tapping on a node.
          if (isSleeping) {
            simulation.alphaTarget(0.2);
            simulation.alphaDecay(0.1);
            simulation.force("link").strength(0.3);
            simulation.force("linkPenguin").strength(0.5);
            simulation.restart();
            startTransition();
            isSleeping = false;
          }
  
          d3.select("#nodeId106")
            .transition()
            .duration(1500)
            .attr("r", 3)
            .style("fill", glowColorOff)
        }

      })

      .on("pointerout", function(d) {
        d.stopPropagation();
        d.preventDefault();

        // Wakes up graph when penguin node un-pointed at (desktop). For mobile, "un-pointed" is determined by a pointerover event on any node (technically the text of any node).
        if (isDesktopDevice) {
          if (d3.select(this).attr('id') == 'textId106') {

            // Todo: Refactor. Make this block a function; currently is used two or three times.
            simulation.alphaTarget(0.2);
            simulation.alphaDecay(0.1);
            simulation.force("link").strength(0.3);
            simulation.force("linkPenguin").strength(0.5);
            simulation.restart();
            startTransition();
            isSleeping = false;

            d3.select("#nodeId106")
              .transition()
              .duration(1500)
              .attr("r", 3)
              .style("fill", glowColorOff)
          }

          // Slowly hide label when node is un-hovered (desktop).
          d3.select(this)
            .transition()
            .duration(5000)
            .style("opacity", 0)
        }
      })

    let ticked = () => {
      
      node
        .attr("cx", function (d) {
          if (isDesktopDevice) {
            if (d.id == 1) {
              return d.fx = width * (1/3 + 1/30);   // Todo: all these fx/fy values should not be checked every tick.
            } else if (d.id == 99) {
              return d.fx = width * (2/3 + 1/30);   // Todo: 1/30 should be a constant pixel value since graph's size is fixed to that.
            } else {
              return d.x
            }
          } else {
            if (d.id == 1) {
              return d.fx = width * 1/2 / defaultZoomScale
            } else if (d.id == 99) {
              return d.fx = width * 1/2 / defaultZoomScale
            } else {
              return d.x
            }
          }
        })
        .attr("cy", function(d) {
          if (isDesktopDevice) {
            if (d.id == 1) {
              return d.fy = height/2/heightScalar
            } else if (d.id == 99) {
              return d.fy = height/2/heightScalar
            } else {
              return d.y
            }
          } else {
            if (d.id == 1) {
              return d.fy = (height + 75) / heightScalar * 1/3 / defaultZoomScale
            } else if (d.id == 99) {
              return d.fy = (height + 75) / heightScalar * 3/4 / defaultZoomScale
            } else {
              return d.y
            }
          }
        })

      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      text
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
    }

    const simulation = d3.forceSimulation(data.nodes)
      .force("charge", d3.forceManyBody()
        .strength(-200)
      )
      .force('linkStrong', d3.forceLink() // Todo: Come back and review these link forces when I know better... something fishy is going on.
        .id(function(d) { return d.id; })
        .links(data.links.filter(d => d.source == 1 && d.target != 99))
        .strength(0.4)
      )
      .force("link", d3.forceLink()
        .id(function(d) { return d.id; })
        .links(data.links.filter(d => d.target != 106))
        .strength(0.3)
      )
      .force('linkPenguin', d3.forceLink()
        .id(function(d) { return d.id; })
        .links(data.links.filter(d => d.target == 106))
        .strength(0.5)
      )
      .alphaTarget(0.2)
      .alphaDecay(0.1)
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
