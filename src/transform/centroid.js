// Imports

import { geoArea, geoCentroid, geoIdentity, geoPath } from "d3-geo";

const d3 = Object.assign({}, { geoArea, geoCentroid, geoIdentity, geoPath });

/**
 * Calculate the centroid of all the geometries given in a
 * GeoJSON FeatureCollection / array of Features / array of Geometries.
 *
 * By default, the centroid is placed in the largest polygon of each geometry.
 * This can be changed by setting the <code>options.largest</code> parameter
 * to <code>false</code>.
 *
 * Example: {@link https://observablehq.com/@neocartocnrs/centroid?collection=@neocartocnrs/geotoolbox Observable notebook}
 *
 * @param {object|array} geojson - The GeoJSON FeatureCollection / array of Features / array of Geometries
 * @param {object} options - Optional parameters
 * @param {boolean} [options.largest=true] - Place the centroid in the largest polygon.
 * @param {boolean} [options.geocoords=false] - Use geographic coordinates.
 * @returns {{features: {geometry: {}, type: string, properties: {}}[], type: string}} - The resulting GeoJSON FeatureCollection
 *
 */
export function centroid(geojson, { largest = true, geocoords = true } = {}) {
  let path = d3.geoPath(d3.geoIdentity());

  geojson = JSON.parse(JSON.stringify(geojson));
  const largestPolygon = function (d) {
    var best = {};
    var bestArea = 0;
    d.geometry.coordinates.forEach(function (coords) {
      var poly = { type: "Polygon", coordinates: coords };
      var area = geocoords ? d3.geoArea(poly) : path.area(poly);
      if (area > bestArea) {
        bestArea = area;
        best = poly;
      }
    });
    return best;
  };

  let centers = geojson.features
    .filter((d) => d.geometry != null)
    .map((d) => {
      if (geocoords) {
        d.geometry.coordinates = d3.geoCentroid(
          largest == true
            ? d.geometry.type == "Polygon"
              ? d
              : largestPolygon(d)
            : d
        );
      } else {
        d.geometry.coordinates = path.centroid(
          largest == true
            ? d.geometry.type == "Polygon"
              ? d
              : largestPolygon(d)
            : d
        );
      }

      d.geometry.type = "Point";
      return d;
    });

  geojson.features = centers;

  return geojson;
}
