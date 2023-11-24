import { forceX, forceY, forceCollide, forceSimulation } from "d3-force";
import { max } from "d3-array";
import { scaleSqrt } from "d3-scale";
const d3 = Object.assign(
  {},
  { forceX, forceY, forceCollide, forceSimulation, max, scaleSqrt }
);

/**
 * This function use d3.forceSimulation to spread dots or circles of  given in a GeoJSON FeatureCollection (points).
 * It returns the coordinates in the page map. It can be used to create a dorling cartogram
 *
 * @param {object} data - a GeoJSON FeatureCollection
 * @param {object} options - options and parameters
 * @param {function} options.projection - d3 projection function
 * @param {boolean} options.geocoords - use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @param {number|string} options.r - a number or the name of a property containing numerical values.
 * @param {number} options.k - radius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {number} options.iteration - number of iterations
 * @param {number} options.gap - space between points/circles
 * @example
 * let dots = geoviz.transform.dodge(world, { projection: d3.geoOrthographic(), r: "population", k: 40 })
 * @returns {object} - a GeoJSON FeatureCollection (points) with coordinates in the page map.
 */

export function dodge(
  data,
  {
    projection = (d) => d,
    iteration = 200,
    r = 10,
    k = 50,
    fixmax = null,
    gap = 0,
  } = {}
) {
  let rawfeatures = JSON.parse(JSON.stringify(data))
    .features.filter((d) => d.geometry)
    .filter((d) => d.geometry.coordinates != undefined);

  let features = JSON.parse(JSON.stringify(rawfeatures));

  let simulation;
  if (typeof r == "string") {
    const valmax =
      fixmax != undefined
        ? fixmax
        : d3.max(features, (d) => Math.abs(+d.properties[r]));
    let radius = d3.scaleSqrt([0, valmax], [0, k]);

    simulation = d3
      .forceSimulation(features)
      .force(
        "x",
        d3.forceX((d) => projection(d.geometry.coordinates)[0])
      )
      .force(
        "y",
        d3.forceY((d) => projection(d.geometry.coordinates)[1])
      )
      .force(
        "collide",
        d3.forceCollide((d) => radius(Math.abs(d.properties[r])) + gap)
      );
  }

  if (typeof r == "number") {
    simulation = d3
      .forceSimulation(features)
      .force(
        "x",
        d3.forceX((d) => projection(d.geometry.coordinates)[0])
      )
      .force(
        "y",
        d3.forceY((d) => projection(d.geometry.coordinates)[1])
      )
      .force("collide", d3.forceCollide(r + gap));
  }

  for (let i = 0; i < iteration; i++) {
    simulation.tick();
  }

  rawfeatures.map(
    (d, i) => (d.geometry.coordinates = [features[i].x, features[i].y])
  );

  return { type: "FeatureCollection", crs: null, features: rawfeatures };
}