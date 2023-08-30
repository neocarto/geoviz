/**
 * The `render` function returns the svg document
 *
 * @param {SVGSVGElement} svg - SVG container to display. This can be generated using the `container.init` function.
 * @param {object} param0 - Options
 * @param {object[]} param0.order - Array determining the order of layers. This option is only useful in Observable (because of its topological nature). 
 * @example
 * container.render(svg, {order: [basemap, roads, cities]})
 * @returns {SVGSVGElement} - A pretty map in SVG format :-)

 */
export function render(svg, { order = [] } = {}) {
  order.forEach((d) => {
    svg.select(`${d}`).raise();
  });

  // raise tooltips
  svg.select("#_geoviztooltip").raise();
  // Add metadata
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
