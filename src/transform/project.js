import { geoProject } from "d3-geo-projection";
const d3 = Object.assign({}, { geoProject });
/**
 * This function use geoproject from d3-geo-projection to project a geoJSON.
 *
 * @param {object} data - a GeoJSON FeatureCollection
 * @param {object} options - options and parameters
 * @param {function} options.projection - projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection)
 * @example
 * let newGeoJSON = transform.project(world, { projection: d3.geoOrthographic()})
 * @returns {object} - a GeoJSON FeatureCollection with coordinates in the page map.
 */
export function project(data, { projection = null } = {}) {
  return projection == null ? data : d3.geoProject(data, projection);
}
