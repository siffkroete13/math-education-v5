export class Geometry {
	constructor({ positions, colors, primitiveType }) {
		this.positions = positions;
		this.colors = colors;
		this.primitiveType = primitiveType;
		this.vertexCount = positions.length / 3;
	}
}