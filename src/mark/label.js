import { create } from "../container/create";
import { render } from "../container/render";
import { mergeoptions } from "../helpers/mergeoptions";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { centroid } from "../transform/centroid";
import { implantation } from "../helpers/implantation";
import { check } from "../helpers/check";
import { propertiesentries } from "../helpers/propertiesentries";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });

/**
 * The `label` function allows to create a label layer from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.text - text to display. Name of the property or a function
 * @param {string|function} options.fill - fill color
 * @param {string|function} options.stroke - stroke color
 * @param {string|function} options.dx - horizontal displacement
 * @param {string|function} options.dy - vertical displacement
 * @param {string|function} options.fontSize - font size
 * @param {string|function} options.dominantBaseline - dominant-baseline
 * @param {string|function} options.textAnchor - text-anchor
 * @param {string} options.paintOrder - paint-order
 * @param {string} options.strokeLinecap - stroke-linecap
 * @param {string} options.strokeLinejoin - stroke-Linejoin
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.label(main, { data: cities, text: "population", fontSize:20 })
 * @returns {SVGSVGElement|string} - the function adds a layer with labels to the SVG container and returns the layer identifier.
 */

export function label(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create({ zoomable: true }) : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "label",
      id: unique(),
      latlong: true,
      data: undefined,
      text: undefined,
      fill: "black",
      stroke: "none",
      fontSize: 14,
      fontFamily: svg.fontFamily,
      dx: 0,
      dy: 0,
      paintOrder: "stroke",
      strokeLinejoin: "round",
      strokeLinecap: "round",
      dominantBaseline: "central",
      textAnchor: "middle",
    },
    newcontainer ? arg1 : arg2
  );

  // Arguments to functions
  const fields = propertiesentries(opts.data);
  ["text", "fill"].forEach((d) => {
    opts[d] = check(opts[d], fields);
  });

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Centroid
  opts.data =
    implantation(opts.data) == 3
      ? centroid(opts.data, { latlong: opts.latlong })
      : opts.data;

  // zoomable layer
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  // Attr with specific default values
  layer
    .attr("paint-order", opts.paintOrder)
    .attr("stroke-linejoin", opts.strokeLinejoin)
    .attr("stroke-linecap", opts.strokeLinecap)
    .attr("font-family", opts.fontFamily);

  //...attr
  addattr({
    layer,
    args: opts,
    exclude: [
      "text",
      "fill",
      "stroke",
      "fontSize",
      "dx",
      "dy",
      "dominantBaseline",
      "textAnchor",
    ],
  });

  // Projection
  let projection =
    opts.latlong == false
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

  layer
    .selectAll("text")
    .data(opts.data.features.filter((d) => d.geometry.coordinates != undefined))
    .join("text")
    .attr("x", (d) => d3.geoPath(projection).centroid(d.geometry)[0])
    .attr("y", (d) => d3.geoPath(projection).centroid(d.geometry)[1])
    .attr("fill", opts.fill)
    .attr("stroke", opts.stroke)
    .attr("font-size", opts.fontSize)
    .attr("dx", opts.dx)
    .attr("dy", opts.dy)
    .attr("dominant-baseline", opts.dominantBaseline)
    .attr("text-anchor", opts.textAnchor)
    .attr("visibility", (d) =>
      isNaN(d3.geoPath(projection).centroid(d.geometry)[0])
        ? "hidden"
        : "visible"
    )
    .text(opts.text);

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
