// src/physics/PhysicsWorld.js

export class PhysicsWorld {

	constructor() {

		// Typische Werte für Restitution:

		// Stahl auf Stahl: 	~0.9
		// Gummi auf Beton:		~0.7
		// Knete:				~0
		// Superball:			~0.95
		// Hartgummi: 			0.7 - 0.8
		// Holz auf Holz		0.5 – 0.7
		// Tennisball (neu):	~0.7

		this.restitution = 0.85; 
		this.bodies = [];
	}

	add(body) {
		this.bodies.push(body);
	}

	update(dt) {

		// ------------------------------------------------------------
		// 1) Bewegung: klassische Euler-Integration
		// p = p + v * dt
		// ------------------------------------------------------------
		for (const b of this.bodies) {
			b.position = this.add(
				b.position,
				this.scale(b.velocity, dt)
			);
		}

		// ------------------------------------------------------------
		// 2) Paarweise Kollision prüfen
		// ------------------------------------------------------------
		for (let i = 0; i < this.bodies.length; i++) {
			for (let j = i + 1; j < this.bodies.length; j++) {
				this.resolveCollision(this.bodies[i], this.bodies[j]);
			}
		}
	}

	// ============================================================
	// Vektor-Operationen
	// ============================================================

	addInPlace(target, v) {
		target.x += v.x;
		target.y += v.y;
		target.z += v.z;
	}

	subInPlace(target, v) {
		target.x -= v.x;
		target.y -= v.y;
		target.z -= v.z;
	}

	scaleInPlace(target, s) {
		target.x *= s;
		target.y *= s;
		target.z *= s;
	}

	scaleTo(out, v, s) {
		out.x = v.x * s;
		out.y = v.y * s;
		out.z = v.z * s;
	}

	add(a, b) {
		return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
	}

	sub(a, b) {
		return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
	}

	scale(v, s) {
		return { x: v.x * s, y: v.y * s, z: v.z * s };
	}

	dot(a, b) {
		return a.x*b.x + a.y*b.y + a.z*b.z;
	}

	length(v) {
		return Math.sqrt(this.dot(v, v));
	}

	normalize(v) {
		const len = this.length(v);
		if (len < 1e-8) return null;
		return this.scale(v, 1 / len);
	}

	dot(a, b) {
		return a.x*b.x + a.y*b.y + a.z*b.z;
	}

	// ============================================================
	// Kugel-Kugel-Kollision (elastisch) 3d (didaktische Version, unten ist schneller Version)
	// ============================================================

	resolveCollision(bodyA, bodyB) {

		// ------------------------------------------------------------
		// 1) Abstand der Mittelpunkte
		// ------------------------------------------------------------
		const centerOffset = this.sub(bodyB.position, bodyA.position);
		const distance = this.length(centerOffset);

		const minimumDistance = bodyA.radius + bodyB.radius;

		// Keine Berührung → nichts tun
		if (distance >= minimumDistance) return;

		// ------------------------------------------------------------
		// 2) Kollisions-Normale (Einheitsvektor). Ist die Gerade die die 2 Mittelpunkte verbindet: n= (pB​−pA) / (​∥pB​ − pA​​∥​) 
		// ------------------------------------------------------------
		const collisionNormalVector = this.normalize(centerOffset);
		if (!collisionNormalVector) return;

		// ------------------------------------------------------------
		// 3) Relative Geschwindigkeit (Vektor)
		// ------------------------------------------------------------
		const relativeVelocity = this.sub(bodyA.velocity, bodyB.velocity);

		// ------------------------------------------------------------
		// 4) Relative Geschwindigkeit entlang der Normalen (Skalar)
		// ------------------------------------------------------------
		const relativeVelocityAlongNormal = this.dot(relativeVelocity, collisionNormalVector);

		// Wenn sie sich bereits trennen → kein Impuls
		if (relativeVelocityAlongNormal > 0) return;

		// ------------------------------------------------------------
		// 5) Impulsfaktor (aus Impuls- und Energieerhaltung)
		// ------------------------------------------------------------
		const massA = bodyA.mass;
		const massB = bodyB.mass;
		const totalMass = massA + massB;

		if (totalMass === 0) return;

		// Ohne Restitution
		// const factorA = (2 * massB) / totalMass;
		// const factorB = (2 * massA) / totalMass;

		// Mit Restitution
		const factorA = ((1 + this.restitution) * massB) / totalMass;
		const factorB = ((1 + this.restitution) * massA) / totalMass;

		// ------------------------------------------------------------
		// 6) Impulsvektor entlang der Normalen
		// ------------------------------------------------------------
		const normalVelocityVector = this.scale(collisionNormalVector, relativeVelocityAlongNormal);

		// ------------------------------------------------------------
		// 7) Neue Geschwindigkeiten (exakte Formel)
		// ------------------------------------------------------------
		bodyA.velocity = this.sub(
			bodyA.velocity,
			this.scale(normalVelocityVector, factorA)
		);

		bodyB.velocity = this.add(
			bodyB.velocity,
			this.scale(normalVelocityVector, factorB)
		);

		// ------------------------------------------------------------
		// 8) Positionskorrektur (gegen Überlappung)
		// ------------------------------------------------------------
		const overlap = minimumDistance - distance;

		const correction = this.scale(collisionNormalVector, overlap / 2);

		his.subInPlace(bodyA.position, correction);

		this.addInPlace(bodyB.position, correction);
	}

	
	// ============================================================
	// Kugel-Kugel-Kollision (elastisch oder teilweise elastisch)
	// 3D-Version, ohne Garbage, In-Place Berechnung
	// ============================================================
	resolveCollisionFast(bodyA, bodyB) {

		// ------------------------------------------------------------
		// 1) Abstand der Mittelpunkte berechnen
		// ------------------------------------------------------------
		// Wir bilden den Vektor von A nach B:
		//
		//   d = pB - pA
		//
		// dx, dy, dz sind die Komponenten dieses Verbindungsvektors.
		//
		const dx = bodyB.position.x - bodyA.position.x;
		const dy = bodyB.position.y - bodyA.position.y;
		const dz = bodyB.position.z - bodyA.position.z;

		// Quadrat der Distanz:
		//
		//   distSq = dx² + dy² + dz²
		//
		// Das ist ||pB - pA||²
		//
		const distSq = dx*dx + dy*dy + dz*dz;

		// Echte Distanz (Betrag des Vektors)
		//
		//   dist = √(distSq)
		//
		const dist = Math.sqrt(distSq);

		// Falls Distanz extrem klein ist,
		// ist die Richtung (Normale) nicht definiert.
		// Dann brechen wir ab.
		if (dist < 1e-8) return;

		// Minimaler erlaubter Abstand der Mittelpunkte:
		//
		// Zwei Kugeln berühren sich genau dann,
		// wenn der Abstand ihrer Mittelpunkte
		// gleich der Summe ihrer Radien ist.
		//
		const minDist = bodyA.radius + bodyB.radius;

		// Wenn sie weiter auseinander sind → keine Kollision
		if (dist >= minDist) return;


		// ------------------------------------------------------------
		// 2) Kollisions-Normale berechnen
		// ------------------------------------------------------------
		// Die Kollisions-Normale ist der Einheitsvektor
		// entlang der Verbindungslinie der Mittelpunkte.
		//
		// Mathematisch:
		//
		//   n = (pB - pA) / ||pB - pA||
		//
		// Das ist die Richtung, in der die Kontaktkraft wirkt.
		//
		const nx = dx / dist;
		const ny = dy / dist;
		const nz = dz / dist;


		// ------------------------------------------------------------
		// 3) Relative Geschwindigkeit berechnen
		// ------------------------------------------------------------
		// Wir betrachten die Geschwindigkeit von A relativ zu B:
		//
		//   v_rel = vA - vB
		//
		const rvx = bodyA.velocity.x - bodyB.velocity.x;
		const rvy = bodyA.velocity.y - bodyB.velocity.y;
		const rvz = bodyA.velocity.z - bodyB.velocity.z;


		// ------------------------------------------------------------
		// 4) Anteil dieser Geschwindigkeit entlang der Normale
		// ------------------------------------------------------------
		// Wir projizieren die relative Geschwindigkeit
		// auf die Kollisions-Normale.
		//
		// Skalarprodukt:
		//
		//   relativeNormalVelocity = v_rel · n
		//
		// Das Ergebnis ist eine ZAHL (kein Vektor).
		//
		// Bedeutung:
		//   < 0 → sie bewegen sich aufeinander zu
		//   > 0 → sie entfernen sich
		//
		const relativeNormalVelocity =
			rvx*nx + rvy*ny + rvz*nz;

		// Wenn sie sich bereits voneinander entfernen,
		// dann wenden wir keinen Impuls mehr an.
		if (relativeNormalVelocity > 0) return;


		// ------------------------------------------------------------
		// 5) Massen
		// ------------------------------------------------------------
		const m1 = bodyA.mass;
		const m2 = bodyB.mass;

		const totalMass = m1 + m2;


		// ------------------------------------------------------------
		// 6) Restitution berücksichtigen
		// ------------------------------------------------------------
		// restitution e:
		//
		// e = 1  → perfekt elastisch
		// e = 0  → komplett inelastisch (kein Rückprall)
		//
		// Die Stoßstärke wird skaliert mit (1 + e).
		//
		const factor =
			((1 + this.restitution) * relativeNormalVelocity)
			/ totalMass;


		// ------------------------------------------------------------
		// 7) Geschwindigkeiten aktualisieren
		// ------------------------------------------------------------
		//
		// Hergeleitete Formel:
		//
		// vA' = vA - factor * m2 * n
		// vB' = vB + factor * m1 * n
		//
		// Interpretation:
		// - Schwere Kugel ändert sich weniger
		// - Leichte Kugel ändert sich stärker
		//
		bodyA.velocity.x -= factor * m2 * nx;
		bodyA.velocity.y -= factor * m2 * ny;
		bodyA.velocity.z -= factor * m2 * nz;

		bodyB.velocity.x += factor * m1 * nx;
		bodyB.velocity.y += factor * m1 * ny;
		bodyB.velocity.z += factor * m1 * nz;


		// ------------------------------------------------------------
		// 8) Positionskorrektur (gegen Überlappung)
		// ------------------------------------------------------------
		//
		// Da wir diskret simulieren,
		// können sich Kugeln leicht überlappen.
		//
		// overlap = wie viel sie zu nahe sind
		//
		const overlap = minDist - dist;

		// Wir verteilen die Korrektur symmetrisch:
		// Jede Kugel bewegt sich um die Hälfte.
		//
		const correction = overlap / 2;

		bodyA.position.x -= correction * nx;
		bodyA.position.y -= correction * ny;
		bodyA.position.z -= correction * nz;

		bodyB.position.x += correction * nx;
		bodyB.position.y += correction * ny;
		bodyB.position.z += correction * nz;
	}
}
