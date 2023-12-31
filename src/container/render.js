import { getDOMids } from "../helpers/getDOMids";
import { zoomandpan } from "../helpers/zoomandpan";
import { zoomversor } from "../helpers/zoomversor";
import { getsize } from "../helpers/utils";

/**
 * @description The `render` function returns the svg document
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz}
 *
 * @param {SVGSVGElement} svg - SVG container to display. This can be generated using the `container.init` function.
 * @param {object} arg - options and parameters
 * @param {object[]} arg.order - array determining the order of layers. This option is only useful in Observable (because of its topological nature). 
 * @example
 * geoviz.render(svg, {order: [basemap, roads, cities]}) // where svg is the container
 * svg.render({order: [basemap, roads, cities]}) // where svg is the container
 * @returns {SVGSVGElement} - a pretty map in SVG format :-)

 */
export function render(svg, { order = [] } = {}) {
  // Adjust extent // TODO
  // const size = getsize(svg);
  // svg
  //   .attr("width", size.width)
  //   .attr("height", size.height)
  //   .attr("viewBox", [size.x, size.y, size.width, size.height]);

  // Reorder layers
  if (order.length > 0) {
    order = order.flat();
    if (getDOMids(svg).toString() !== order) {
      order.forEach((d) => {
        svg.select(`${d}`).raise();
      });
    }
  }

  // Zoom
  if (svg.zoomable) {
    if (svg.zoomable == "versor") {
      zoomversor(svg);
    } else {
      zoomandpan(svg);
    }
  }

  if (svg.versor) {
  }

  // raise tooltips
  svg.selectAll("#geoviztooltip").raise();
  // Add metadata
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });

  // render
  return svg.node();
}
