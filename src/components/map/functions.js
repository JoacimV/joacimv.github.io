import { along } from "@turf/along";
import { multiPolygon, point, lineString } from "@turf/helpers";
import { pointsWithinPolygon } from "@turf/points-within-polygon";
import { lineSplit } from "@turf/line-split";
import { booleanPointOnLine } from "@turf/boolean-point-on-line";
import { nearestPointOnLine } from "@turf/nearest-point-on-line";
import dk from "../../resources/geojson/denmark-coastal-line.json";
import municipalities from "../../resources/geojson/municipalities.json";


export const findNearestMunicipality = (position) => {
    // Create a bounding box around the position
    const geojson = multiPolygon(municipalities)
    let nearest;
    // Find the nearest municipality to the position
    for (const municipality of geojson.geometry.coordinates.features) {
        // Check if the position is inside the municipality
        const { features } = pointsWithinPolygon(point([position.lng, position.lat]), municipality)
        if (features.length > 0) {
            nearest = municipality.properties
        }
    }
    return nearest;
}

export const findNearestCoastline = (position) => {
    const p = point([position.lng, position.lat]);
    // Load the coastline GeoJSON data
    const coastline = multiPolygon(dk.features[0].geometry.coordinates);
    // Find the nearest point on the coastline
    const lineStrings = [];
    for (const feater of coastline.geometry.coordinates) {
        lineStrings.push(lineString(feater[0]));
    }

    const nps = [];
    for (const line of lineStrings) {
        nps.push({ np: nearestPointOnLine(line, p), line });
    }

    // Find the point with the shortest distance to the position, look at np.properties.dist for the distance
    const np = nps.reduce((nearest, point) => {
        if (!nearest || point.np.properties.dist < nearest.np.properties.dist) {
            return point;
        }
        return nearest;
    }, undefined);

    const split = lineSplit(np.line, np.np);
    const l = booleanPointOnLine(np.np, split.features[0], { ignoreEndVertices: true }) ? split.features[0] : split.features[1];
    const np2 = along(l, 1, { units: 'meters' });
    return { split, nearestPoint: { lat: np.np.geometry.coordinates[1], lng: np.np.geometry.coordinates[0] }, nearestNextPoint: { lat: np2.geometry.coordinates[1], lng: np2.geometry.coordinates[0] } }
}
