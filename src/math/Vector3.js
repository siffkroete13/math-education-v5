export class Vector3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	toArray() {
		return [this.x, this.y, this.z];
	}

	static fromArray(a) {
		return new Vector3(a[0], a[1], a[2]);
	}
}