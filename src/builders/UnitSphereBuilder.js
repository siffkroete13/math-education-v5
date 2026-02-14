// builders/UnitSphereBuilder.js

export function buildUnitSphere(latSegments = 12, lonSegments = 12) {

    const positions = [];

    for (let lat = 0; lat <= latSegments; lat++) {

        const theta = lat * Math.PI / latSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= lonSegments; lon++) {

            const phi = lon * 2 * Math.PI / lonSegments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            positions.push(x, y, z);
        }
    }

    return positions;
}