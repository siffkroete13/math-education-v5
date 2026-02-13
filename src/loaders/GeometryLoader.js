/*
Warum heisst es GeometryLoader.js, es tut doch nur json laden und kein Geometrie-Objekt?

JSON ist Data pur.
Unsere Geometry ist Data pur.
Also sind sie konzeptionell dasselbe.

*/



export async function loadGeometry(url) {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error("Failed to load geometry: " + url);
	}
	return await res.json();
}