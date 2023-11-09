import { tooltip } from "../helpers/tooltip";
import { addconst } from "../helpers/addconst";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { scaleLinear } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleLinear, max, descending, geoPath, geoIdentity }
);

/**
 * The `spike` function allows to create a layer with spikes from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {number|string} options.height - a number or the name of a property containing numerical values.
 * @param {number} options.width - width
 * @param {boolean} options.reverse - to flip the spikes
 * @param {number} options.k - height of the highest spike (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the spikes with height `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {boolean|function} options.tip - a function to display the tip. Use true tu display all fields
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let spikes = geoviz.layer.spike(main, { data: cities, height: "population" })
 * @returns {SVGSVGElement|string} - the function adds a layer with spikes to the SVG container and returns the layer identifier.
 */

export function spike(
  svg,
  {
    id = unique(),
    projection,
    data,
    height,
    width = 10,
    k = 50,
    fixmax = null,
    fill = "#c9225a",
    stroke = "none",
    reverse = false,
    tip,
    tipstyle,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg
        .append("g")
        .attr("id", id)
        .attr("class", svg.inset ? "nozoom" : "zoomablespike")
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke"],
  });

  // Projection
  let prj = projection == "none" ? "none" : "svg";
  projection = projection == "none" ? d3.geoIdentity() : svg.projection;

  // String or number?
  let features =
    typeof height == "string" ? data.features : addconst(data.features, height);
  height = typeof height == "string" ? height : "___const";
  const valmax =
    fixmax != undefined
      ? fixmax
      : d3.max(features, (d) => Math.abs(+d.properties[height]));
  const yScale =
    height == "___const"
      ? (d) => d
      : d3.scaleLinear().domain([0, valmax]).range([0, k]);

  let updown = reverse ? -1 : 1;

  // layer data
  layer.attr(
    "data-layer",
    JSON.stringify({
      width,
      height,
      k,
      fixmax,
      features: features,
      prj,
      updown,
    })
  );

  layer
    .selectAll("path")
    .data(
      features
        .filter((d) => d.geometry)
        .filter((d) => d.properties[height] != undefined)
        .sort((a, b) =>
          d3.descending(
            Math.abs(+a.properties[height]),
            Math.abs(+b.properties[height])
          )
        )
    )
    .join("path")

    .attr(
      "d",
      (d) =>
        `M ${d3.geoPath(projection).centroid(d.geometry)[0] - width / 2}, ${
          d3.geoPath(projection).centroid(d.geometry)[1]
        } ${d3.geoPath(projection).centroid(d.geometry)[0]}, ${
          d3.geoPath(projection).centroid(d.geometry)[1] -
          yScale(d.properties[height] * updown)
        } ${d3.geoPath(projection).centroid(d.geometry)[0] + width / 2}, ${
          d3.geoPath(projection).centroid(d.geometry)[1]
        }`
    )
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("visibility", (d) =>
      isNaN(d3.geoPath(projection).centroid(d.geometry)[0])
        ? "hidden"
        : "visible"
    );

  if (tip) {
    tooltip(layer, data, svg, tip, tipstyle);
  }

  return `#${id}`;
}