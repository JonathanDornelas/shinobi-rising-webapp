// @ts-nocheck
// Gerado em ../fingersMap por npm run levar-para-mesa. Não edite aqui.
var e = 1e3, t = 1001, n = 1002, r = 1003, i = 1006, a = 1008, o = 1009, s = 1012, c = 1014, l = 1015, u = 1016, d = 1017, f = 1018, p = 1020, m = 1023, h = 1026, g = 1027, _ = 1029, v = 1030, y = 1031, b = 1033, x = 2300, S = 2301, C = 2302, w = 2303, T = 2400, E = 2401, D = 2402, O = "srgb", k = "srgb-linear", A = "linear", j = "srgb", M = 7680, N = 35044, P = 35048, F = "300 es", I = 2e3;
function L(e) {
	for (let t = e.length - 1; t >= 0; --t) if (e[t] >= 65535) return !0;
	return !1;
}
function R(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function ee(e) {
	return document.createElementNS("http://www.w3.org/1999/xhtml", e);
}
function te() {
	let e = ee("canvas");
	return e.style.display = "block", e;
}
var z = {};
function ne(...e) {
	let t = "THREE." + e.shift();
	console.log(t, ...e);
}
function re(e) {
	let t = e[0];
	if (typeof t == "string" && t.startsWith("TSL:")) {
		let t = e[1];
		t && t.isStackTrace ? e[0] += " " + t.getLocation() : e[1] = "Stack trace not available. Enable \"THREE.Node.captureStackTrace\" to capture stack traces.";
	}
	return e;
}
function B(...e) {
	e = re(e);
	let t = "THREE." + e.shift();
	{
		let n = e[0];
		n && n.isStackTrace ? console.warn(n.getError(t)) : console.warn(t, ...e);
	}
}
function V(...e) {
	e = re(e);
	let t = "THREE." + e.shift();
	{
		let n = e[0];
		n && n.isStackTrace ? console.error(n.getError(t)) : console.error(t, ...e);
	}
}
function ie(...e) {
	let t = e.join(" ");
	t in z || (z[t] = !0, B(...e));
}
function ae(e, t, n) {
	return new Promise(function(r, i) {
		function a() {
			switch (e.clientWaitSync(t, e.SYNC_FLUSH_COMMANDS_BIT, 0)) {
				case e.WAIT_FAILED:
					i();
					break;
				case e.TIMEOUT_EXPIRED:
					setTimeout(a, n);
					break;
				default: r();
			}
		}
		setTimeout(a, n);
	});
}
var oe = {
	0: 0,
	2: 6,
	4: 4,
	3: 5,
	1: 1,
	6: 2,
	7: 7,
	5: 3
}, se = class {
	addEventListener(e, t) {
		this._listeners === void 0 && (this._listeners = {});
		let n = this._listeners;
		n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
	}
	hasEventListener(e, t) {
		let n = this._listeners;
		return n !== void 0 && n[e] !== void 0 && n[e].indexOf(t) !== -1;
	}
	removeEventListener(e, t) {
		let n = this._listeners;
		if (n === void 0) return;
		let r = n[e];
		if (r !== void 0) {
			let e = r.indexOf(t);
			e !== -1 && r.splice(e, 1);
		}
	}
	dispatchEvent(e) {
		let t = this._listeners;
		if (t === void 0) return;
		let n = t[e.type];
		if (n !== void 0) {
			e.target = this;
			let t = n.slice(0);
			for (let n = 0, r = t.length; n < r; n++) t[n].call(this, e);
			e.target = null;
		}
	}
}, ce = /* @__PURE__ */ "00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff".split("."), H = Math.PI / 180, le = 180 / Math.PI;
function ue() {
	let e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0, r = Math.random() * 4294967295 | 0;
	return (ce[e & 255] + ce[e >> 8 & 255] + ce[e >> 16 & 255] + ce[e >> 24 & 255] + "-" + ce[t & 255] + ce[t >> 8 & 255] + "-" + ce[t >> 16 & 15 | 64] + ce[t >> 24 & 255] + "-" + ce[n & 63 | 128] + ce[n >> 8 & 255] + "-" + ce[n >> 16 & 255] + ce[n >> 24 & 255] + ce[r & 255] + ce[r >> 8 & 255] + ce[r >> 16 & 255] + ce[r >> 24 & 255]).toLowerCase();
}
function U(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function de(e, t) {
	return (e % t + t) % t;
}
function fe(e, t, n) {
	return (1 - n) * e + n * t;
}
function pe(e) {
	return 2 ** Math.floor(Math.log(e) / Math.LN2);
}
function me(e) {
	switch (e.constructor) {
		case Uint32Array: return 4294967295;
		case Uint16Array: return 65535;
		case Uint8Array:
		case Uint8ClampedArray: return 255;
		case Int32Array: return 2147483647;
		case Int16Array: return 32767;
		case Int8Array: return 127;
		default: return;
	}
}
function he(e, t) {
	if (t.constructor === Float32Array) return e;
	let n = me(t);
	if (n === void 0) throw Error("THREE.MathUtils: Invalid component type.");
	return Math.max(e / n, -1);
}
function ge(e, t) {
	if (t.constructor === Float32Array) return e;
	let n = me(t);
	if (n === void 0) throw Error("THREE.MathUtils: Invalid component type.");
	return Math.round(e * n);
}
var W = class {
	static {
		this.prototype.isVector2 = !0;
	}
	constructor(e = 0, t = 0) {
		this.x = e, this.y = t;
	}
	get width() {
		return this.x;
	}
	set width(e) {
		this.x = e;
	}
	get height() {
		return this.y;
	}
	set height(e) {
		this.y = e;
	}
	set(e, t) {
		return this.x = e, this.y = t, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			default: throw Error("THREE.Vector2: index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			default: throw Error("THREE.Vector2: index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this;
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	applyMatrix3(e) {
		let t = this.x, n = this.y, r = e.elements;
		return this.x = r[0] * t + r[3] * n + r[6], this.y = r[1] * t + r[4] * n + r[7], this;
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
	}
	clamp(e, t) {
		return this.x = U(this.x, e.x, t.x), this.y = U(this.y, e.y, t.y), this;
	}
	clampScalar(e, t) {
		return this.x = U(this.x, e, t), this.y = U(this.y, e, t), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(U(n, e, t));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y;
	}
	cross(e) {
		return this.x * e.y - this.y * e.x;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	angle() {
		return Math.atan2(-this.y, -this.x) + Math.PI;
	}
	angleTo(e) {
		let t = Math.sqrt(this.lengthSq() * e.lengthSq());
		if (t === 0) return Math.PI / 2;
		let n = this.dot(e) / t;
		return Math.acos(U(n, -1, 1));
	}
	distanceTo(e) {
		return Math.sqrt(this.distanceToSquared(e));
	}
	distanceToSquared(e) {
		let t = this.x - e.x, n = this.y - e.y;
		return t * t + n * n;
	}
	manhattanDistanceTo(e) {
		return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this;
	}
	rotateAround(e, t) {
		let n = Math.cos(t), r = Math.sin(t), i = this.x - e.x, a = this.y - e.y;
		return this.x = i * n - a * r + e.x, this.y = i * r + a * n + e.y, this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y;
	}
}, _e = class {
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = r;
	}
	static slerpFlat(e, t, n, r, i, a, o) {
		let s = n[r + 0], c = n[r + 1], l = n[r + 2], u = n[r + 3], d = i[a + 0], f = i[a + 1], p = i[a + 2], m = i[a + 3];
		if (u !== m || s !== d || c !== f || l !== p) {
			let e = s * d + c * f + l * p + u * m;
			e < 0 && (d = -d, f = -f, p = -p, m = -m, e = -e);
			let t = 1 - o;
			if (e < .9995) {
				let n = Math.acos(e), r = Math.sin(n);
				t = Math.sin(t * n) / r, o = Math.sin(o * n) / r, s = s * t + d * o, c = c * t + f * o, l = l * t + p * o, u = u * t + m * o;
			} else {
				s = s * t + d * o, c = c * t + f * o, l = l * t + p * o, u = u * t + m * o;
				let e = 1 / Math.sqrt(s * s + c * c + l * l + u * u);
				s *= e, c *= e, l *= e, u *= e;
			}
		}
		e[t] = s, e[t + 1] = c, e[t + 2] = l, e[t + 3] = u;
	}
	static multiplyQuaternionsFlat(e, t, n, r, i, a) {
		let o = n[r], s = n[r + 1], c = n[r + 2], l = n[r + 3], u = i[a], d = i[a + 1], f = i[a + 2], p = i[a + 3];
		return e[t] = o * p + l * u + s * f - c * d, e[t + 1] = s * p + l * d + c * u - o * f, e[t + 2] = c * p + l * f + o * d - s * u, e[t + 3] = l * p - o * u - s * d - c * f, e;
	}
	get x() {
		return this._x;
	}
	set x(e) {
		this._x = e, this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y(e) {
		this._y = e, this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z(e) {
		this._z = e, this._onChangeCallback();
	}
	get w() {
		return this._w;
	}
	set w(e) {
		this._w = e, this._onChangeCallback();
	}
	set(e, t, n, r) {
		return this._x = e, this._y = t, this._z = n, this._w = r, this._onChangeCallback(), this;
	}
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._w);
	}
	copy(e) {
		return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
	}
	setFromEuler(e, t = !0) {
		let n = e._x, r = e._y, i = e._z, a = e._order, o = Math.cos, s = Math.sin, c = o(n / 2), l = o(r / 2), u = o(i / 2), d = s(n / 2), f = s(r / 2), p = s(i / 2);
		switch (a) {
			case "XYZ":
				this._x = d * l * u + c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "YXZ":
				this._x = d * l * u + c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u + d * f * p;
				break;
			case "ZXY":
				this._x = d * l * u - c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "ZYX":
				this._x = d * l * u - c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u + d * f * p;
				break;
			case "YZX":
				this._x = d * l * u + c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "XZY":
				this._x = d * l * u - c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u + d * f * p;
				break;
			default: B("Quaternion: .setFromEuler() encountered an unknown order: " + a);
		}
		return t === !0 && this._onChangeCallback(), this;
	}
	setFromAxisAngle(e, t) {
		let n = t / 2, r = Math.sin(n);
		return this._x = e.x * r, this._y = e.y * r, this._z = e.z * r, this._w = Math.cos(n), this._onChangeCallback(), this;
	}
	setFromRotationMatrix(e) {
		let t = e.elements, n = t[0], r = t[4], i = t[8], a = t[1], o = t[5], s = t[9], c = t[2], l = t[6], u = t[10], d = n + o + u;
		if (d > 0) {
			let e = .5 / Math.sqrt(d + 1);
			this._w = .25 / e, this._x = (l - s) * e, this._y = (i - c) * e, this._z = (a - r) * e;
		} else if (n > o && n > u) {
			let e = 2 * Math.sqrt(1 + n - o - u);
			this._w = (l - s) / e, this._x = .25 * e, this._y = (r + a) / e, this._z = (i + c) / e;
		} else if (o > u) {
			let e = 2 * Math.sqrt(1 + o - n - u);
			this._w = (i - c) / e, this._x = (r + a) / e, this._y = .25 * e, this._z = (s + l) / e;
		} else {
			let e = 2 * Math.sqrt(1 + u - n - o);
			this._w = (a - r) / e, this._x = (i + c) / e, this._y = (s + l) / e, this._z = .25 * e;
		}
		return this._onChangeCallback(), this;
	}
	setFromUnitVectors(e, t) {
		let n = e.dot(t) + 1;
		return n < 1e-8 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
	}
	angleTo(e) {
		return 2 * Math.acos(Math.abs(U(this.dot(e), -1, 1)));
	}
	rotateTowards(e, t) {
		let n = this.angleTo(e);
		if (n === 0) return this;
		let r = Math.min(1, t / n);
		return this.slerp(e, r), this;
	}
	identity() {
		return this.set(0, 0, 0, 1);
	}
	invert() {
		return this.conjugate();
	}
	conjugate() {
		return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
	}
	dot(e) {
		return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
	}
	lengthSq() {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	}
	length() {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	}
	normalize() {
		let e = this.length();
		return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x *= e, this._y *= e, this._z *= e, this._w *= e), this._onChangeCallback(), this;
	}
	multiply(e) {
		return this.multiplyQuaternions(this, e);
	}
	premultiply(e) {
		return this.multiplyQuaternions(e, this);
	}
	multiplyQuaternions(e, t) {
		let n = e._x, r = e._y, i = e._z, a = e._w, o = t._x, s = t._y, c = t._z, l = t._w;
		return this._x = n * l + a * o + r * c - i * s, this._y = r * l + a * s + i * o - n * c, this._z = i * l + a * c + n * s - r * o, this._w = a * l - n * o - r * s - i * c, this._onChangeCallback(), this;
	}
	slerp(e, t) {
		let n = e._x, r = e._y, i = e._z, a = e._w, o = this.dot(e);
		o < 0 && (n = -n, r = -r, i = -i, a = -a, o = -o);
		let s = 1 - t;
		if (o < .9995) {
			let e = Math.acos(o), c = Math.sin(e);
			s = Math.sin(s * e) / c, t = Math.sin(t * e) / c, this._x = this._x * s + n * t, this._y = this._y * s + r * t, this._z = this._z * s + i * t, this._w = this._w * s + a * t, this._onChangeCallback();
		} else this._x = this._x * s + n * t, this._y = this._y * s + r * t, this._z = this._z * s + i * t, this._w = this._w * s + a * t, this.normalize();
		return this;
	}
	slerpQuaternions(e, t, n) {
		return this.copy(e).slerp(t, n);
	}
	random() {
		let e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), r = Math.sqrt(1 - n), i = Math.sqrt(n);
		return this.set(r * Math.sin(e), r * Math.cos(e), i * Math.sin(t), i * Math.cos(t));
	}
	equals(e) {
		return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
	}
	fromArray(e, t = 0) {
		return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
	}
	fromBufferAttribute(e, t) {
		return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
	}
	toJSON() {
		return this.toArray();
	}
	_onChange(e) {
		return this._onChangeCallback = e, this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x, yield this._y, yield this._z, yield this._w;
	}
}, G = class {
	static {
		this.prototype.isVector3 = !0;
	}
	constructor(e = 0, t = 0, n = 0) {
		this.x = e, this.y = t, this.z = n;
	}
	set(e, t, n) {
		return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this.z = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setZ(e) {
		return this.z = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			case 2:
				this.z = t;
				break;
			default: throw Error("THREE.Vector3: index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw Error("THREE.Vector3: index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y, this.z);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this.z += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this.z -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this.z *= e, this;
	}
	multiplyVectors(e, t) {
		return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
	}
	applyEuler(e) {
		return this.applyQuaternion(ye.setFromEuler(e));
	}
	applyAxisAngle(e, t) {
		return this.applyQuaternion(ye.setFromAxisAngle(e, t));
	}
	applyMatrix3(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements;
		return this.x = i[0] * t + i[3] * n + i[6] * r, this.y = i[1] * t + i[4] * n + i[7] * r, this.z = i[2] * t + i[5] * n + i[8] * r, this;
	}
	applyNormalMatrix(e) {
		return this.applyMatrix3(e).normalize();
	}
	applyMatrix4(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements, a = 1 / (i[3] * t + i[7] * n + i[11] * r + i[15]);
		return this.x = (i[0] * t + i[4] * n + i[8] * r + i[12]) * a, this.y = (i[1] * t + i[5] * n + i[9] * r + i[13]) * a, this.z = (i[2] * t + i[6] * n + i[10] * r + i[14]) * a, this;
	}
	applyQuaternion(e) {
		let t = this.x, n = this.y, r = this.z, i = e.x, a = e.y, o = e.z, s = e.w, c = 2 * (a * r - o * n), l = 2 * (o * t - i * r), u = 2 * (i * n - a * t);
		return this.x = t + s * c + a * u - o * l, this.y = n + s * l + o * c - i * u, this.z = r + s * u + i * l - a * c, this;
	}
	project(e) {
		return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
	}
	unproject(e) {
		return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
	}
	transformDirection(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements;
		return this.x = i[0] * t + i[4] * n + i[8] * r, this.y = i[1] * t + i[5] * n + i[9] * r, this.z = i[2] * t + i[6] * n + i[10] * r, this.normalize();
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
	}
	clamp(e, t) {
		return this.x = U(this.x, e.x, t.x), this.y = U(this.y, e.y, t.y), this.z = U(this.z, e.z, t.z), this;
	}
	clampScalar(e, t) {
		return this.x = U(this.x, e, t), this.y = U(this.y, e, t), this.z = U(this.z, e, t), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(U(n, e, t));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
	}
	cross(e) {
		return this.crossVectors(this, e);
	}
	crossVectors(e, t) {
		let n = e.x, r = e.y, i = e.z, a = t.x, o = t.y, s = t.z;
		return this.x = r * s - i * o, this.y = i * a - n * s, this.z = n * o - r * a, this;
	}
	projectOnVector(e) {
		let t = e.lengthSq();
		if (t === 0) return this.set(0, 0, 0);
		let n = e.dot(this) / t;
		return this.copy(e).multiplyScalar(n);
	}
	projectOnPlane(e) {
		return ve.copy(this).projectOnVector(e), this.sub(ve);
	}
	reflect(e) {
		return this.sub(ve.copy(e).multiplyScalar(2 * this.dot(e)));
	}
	angleTo(e) {
		let t = Math.sqrt(this.lengthSq() * e.lengthSq());
		if (t === 0) return Math.PI / 2;
		let n = this.dot(e) / t;
		return Math.acos(U(n, -1, 1));
	}
	distanceTo(e) {
		return Math.sqrt(this.distanceToSquared(e));
	}
	distanceToSquared(e) {
		let t = this.x - e.x, n = this.y - e.y, r = this.z - e.z;
		return t * t + n * n + r * r;
	}
	manhattanDistanceTo(e) {
		return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
	}
	setFromSpherical(e) {
		return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
	}
	setFromSphericalCoords(e, t, n) {
		let r = Math.sin(t) * e;
		return this.x = r * Math.sin(n), this.y = Math.cos(t) * e, this.z = r * Math.cos(n), this;
	}
	setFromCylindrical(e) {
		return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
	}
	setFromCylindricalCoords(e, t, n) {
		return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
	}
	setFromMatrixPosition(e) {
		let t = e.elements;
		return this.x = t[12], this.y = t[13], this.z = t[14], this;
	}
	setFromMatrixScale(e) {
		let t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), r = this.setFromMatrixColumn(e, 2).length();
		return this.x = t, this.y = n, this.z = r, this;
	}
	setFromMatrixColumn(e, t) {
		return this.fromArray(e.elements, t * 4);
	}
	setFromMatrix3Column(e, t) {
		return this.fromArray(e.elements, t * 3);
	}
	setFromEuler(e) {
		return this.x = e._x, this.y = e._y, this.z = e._z, this;
	}
	setFromColor(e) {
		return this.x = e.r, this.y = e.g, this.z = e.b, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y && e.z === this.z;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
	}
	randomDirection() {
		let e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
		return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y, yield this.z;
	}
}, ve = /*@__PURE__*/ new G(), ye = /*@__PURE__*/ new _e(), K = class {
	static {
		this.prototype.isMatrix3 = !0;
	}
	constructor(e, t, n, r, i, a, o, s, c) {
		this.elements = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		], e !== void 0 && this.set(e, t, n, r, i, a, o, s, c);
	}
	set(e, t, n, r, i, a, o, s, c) {
		let l = this.elements;
		return l[0] = e, l[1] = r, l[2] = o, l[3] = t, l[4] = i, l[5] = s, l[6] = n, l[7] = a, l[8] = c, this;
	}
	identity() {
		return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
	}
	copy(e) {
		let t = this.elements, n = e.elements;
		return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
	}
	extractBasis(e, t, n) {
		return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
	}
	setFromMatrix4(e) {
		let t = e.elements;
		return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
	premultiply(e) {
		return this.multiplyMatrices(e, this);
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[3], s = n[6], c = n[1], l = n[4], u = n[7], d = n[2], f = n[5], p = n[8], m = r[0], h = r[3], g = r[6], _ = r[1], v = r[4], y = r[7], b = r[2], x = r[5], S = r[8];
		return i[0] = a * m + o * _ + s * b, i[3] = a * h + o * v + s * x, i[6] = a * g + o * y + s * S, i[1] = c * m + l * _ + u * b, i[4] = c * h + l * v + u * x, i[7] = c * g + l * y + u * S, i[2] = d * m + f * _ + p * b, i[5] = d * h + f * v + p * x, i[8] = d * g + f * y + p * S, this;
	}
	multiplyScalar(e) {
		let t = this.elements;
		return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
	}
	determinant() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8];
		return t * a * l - t * o * c - n * i * l + n * o * s + r * i * c - r * a * s;
	}
	invert() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = l * a - o * c, d = o * s - l * i, f = c * i - a * s, p = t * u + n * d + r * f;
		if (p === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
		let m = 1 / p;
		return e[0] = u * m, e[1] = (r * c - l * n) * m, e[2] = (o * n - r * a) * m, e[3] = d * m, e[4] = (l * t - r * s) * m, e[5] = (r * i - o * t) * m, e[6] = f * m, e[7] = (n * s - c * t) * m, e[8] = (a * t - n * i) * m, this;
	}
	transpose() {
		let e, t = this.elements;
		return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
	}
	getNormalMatrix(e) {
		return this.setFromMatrix4(e).invert().transpose();
	}
	transposeIntoArray(e) {
		let t = this.elements;
		return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
	}
	setUvTransform(e, t, n, r, i, a, o) {
		let s = Math.cos(i), c = Math.sin(i);
		return this.set(n * s, n * c, -n * (s * a + c * o) + a + e, -r * c, r * s, -r * (-c * a + s * o) + o + t, 0, 0, 1), this;
	}
	scale(e, t) {
		return ie("Matrix3: .scale() is deprecated. Use .makeScale() instead."), this.premultiply(be.makeScale(e, t)), this;
	}
	rotate(e) {
		return ie("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."), this.premultiply(be.makeRotation(-e)), this;
	}
	translate(e, t) {
		return ie("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."), this.premultiply(be.makeTranslation(e, t)), this;
	}
	makeTranslation(e, t) {
		return e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1), this;
	}
	makeRotation(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this;
	}
	makeScale(e, t) {
		return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this;
	}
	equals(e) {
		let t = this.elements, n = e.elements;
		for (let e = 0; e < 9; e++) if (t[e] !== n[e]) return !1;
		return !0;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
		return this;
	}
	toArray(e = [], t = 0) {
		let n = this.elements;
		return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
	}
	clone() {
		return new this.constructor().fromArray(this.elements);
	}
}, be = /*@__PURE__*/ new K(), xe = /*@__PURE__*/ new K().set(.4123908, .3575843, .1804808, .212639, .7151687, .0721923, .0193308, .1191948, .9505322), Se = /*@__PURE__*/ new K().set(3.2409699, -1.5373832, -.4986108, -.9692436, 1.8759675, .0415551, .0556301, -.203977, 1.0569715);
function Ce() {
	let e = {
		enabled: !0,
		workingColorSpace: k,
		spaces: {},
		convert: function(e, t, n) {
			return this.enabled === !1 || t === n || !t || !n || (this.spaces[t].transfer === "srgb" && (e.r = we(e.r), e.g = we(e.g), e.b = we(e.b)), this.spaces[t].primaries !== this.spaces[n].primaries && (e.applyMatrix3(this.spaces[t].toXYZ), e.applyMatrix3(this.spaces[n].fromXYZ)), this.spaces[n].transfer === "srgb" && (e.r = Te(e.r), e.g = Te(e.g), e.b = Te(e.b))), e;
		},
		workingToColorSpace: function(e, t) {
			return this.convert(e, this.workingColorSpace, t);
		},
		colorSpaceToWorking: function(e, t) {
			return this.convert(e, t, this.workingColorSpace);
		},
		getPrimaries: function(e) {
			return this.spaces[e].primaries;
		},
		getTransfer: function(e) {
			return e === "" ? A : this.spaces[e].transfer;
		},
		getToneMappingMode: function(e) {
			return this.spaces[e].outputColorSpaceConfig.toneMappingMode || "standard";
		},
		getLuminanceCoefficients: function(e, t = this.workingColorSpace) {
			return e.fromArray(this.spaces[t].luminanceCoefficients);
		},
		define: function(e) {
			Object.assign(this.spaces, e);
		},
		_getMatrix: function(e, t, n) {
			return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ);
		},
		_getDrawingBufferColorSpace: function(e) {
			return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace;
		},
		_getUnpackColorSpace: function(e = this.workingColorSpace) {
			return this.spaces[e].workingColorSpaceConfig.unpackColorSpace;
		}
	}, t = [
		.64,
		.33,
		.3,
		.6,
		.15,
		.06
	], n = [
		.2126,
		.7152,
		.0722
	], r = [.3127, .329];
	return e.define({
		[k]: {
			primaries: t,
			whitePoint: r,
			transfer: A,
			toXYZ: xe,
			fromXYZ: Se,
			luminanceCoefficients: n,
			workingColorSpaceConfig: { unpackColorSpace: O },
			outputColorSpaceConfig: { drawingBufferColorSpace: O }
		},
		[O]: {
			primaries: t,
			whitePoint: r,
			transfer: j,
			toXYZ: xe,
			fromXYZ: Se,
			luminanceCoefficients: n,
			outputColorSpaceConfig: { drawingBufferColorSpace: O }
		}
	}), e;
}
var q = /*@__PURE__*/ Ce();
function we(e) {
	return e < .04045 ? e * .0773993808 : (e * .9478672986 + .0521327014) ** 2.4;
}
function Te(e) {
	return e < .0031308 ? e * 12.92 : 1.055 * e ** .41666 - .055;
}
var Ee, De = class {
	static getDataURL(e, t = "image/png") {
		if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
		let n;
		if (e instanceof HTMLCanvasElement) n = e;
		else {
			Ee === void 0 && (Ee = ee("canvas")), Ee.width = e.width, Ee.height = e.height;
			let t = Ee.getContext("2d");
			e instanceof ImageData ? t.putImageData(e, 0, 0) : t.drawImage(e, 0, 0, e.width, e.height), n = Ee;
		}
		return n.toDataURL(t);
	}
	static sRGBToLinear(e) {
		if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
			let t = ee("canvas");
			t.width = e.width, t.height = e.height;
			let n = t.getContext("2d");
			n.drawImage(e, 0, 0, e.width, e.height);
			let r = n.getImageData(0, 0, e.width, e.height), i = r.data;
			for (let e = 0; e < i.length; e++) i[e] = we(i[e] / 255) * 255;
			return n.putImageData(r, 0, 0), t;
		}
		if (e.data) {
			let t = e.data.slice(0);
			for (let e = 0; e < t.length; e++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[e] = Math.floor(we(t[e] / 255) * 255) : t[e] = we(t[e]);
			return {
				data: t,
				width: e.width,
				height: e.height
			};
		}
		return B("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
	}
}, Oe = 0, ke = class {
	constructor(e = null) {
		this.isTextureSource = !0, Object.defineProperty(this, "id", { value: Oe++ }), this.uuid = ue(), this.data = e, this.dataReady = !0, this.version = 0;
	}
	getSize(e) {
		let t = this.data;
		return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : typeof VideoFrame < "u" && t instanceof VideoFrame ? e.set(t.displayWidth, t.displayHeight, 0) : t === null ? e.set(0, 0, 0) : e.set(t.width || 0, t.height || 0, t.depth || 0), e;
	}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
		let n = {
			uuid: this.uuid,
			url: ""
		}, r = this.data;
		if (r !== null) {
			let e;
			if (Array.isArray(r)) {
				e = [];
				for (let t = 0, n = r.length; t < n; t++) r[t].isDataTexture ? e.push(Ae(r[t].image)) : e.push(Ae(r[t]));
			} else e = Ae(r);
			n.url = e;
		}
		return t || (e.images[this.uuid] = n), n;
	}
};
function Ae(e) {
	return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap ? De.getDataURL(e) : e.data ? {
		data: Array.from(e.data),
		width: e.width,
		height: e.height,
		type: e.data.constructor.name
	} : (B("Texture: Unable to serialize Texture."), {});
}
var J = 0, je = /*@__PURE__*/ new G(), Me = class r extends se {
	constructor(e = r.DEFAULT_IMAGE, n = r.DEFAULT_MAPPING, s = t, c = t, l = i, u = a, d = m, f = o, p = r.DEFAULT_ANISOTROPY, h = "") {
		super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: J++ }), this.uuid = ue(), this.name = "", this.source = new ke(e), this.mipmaps = [], this.mapping = n, this.channel = 0, this.wrapS = s, this.wrapT = c, this.magFilter = l, this.minFilter = u, this.anisotropy = p, this.format = d, this.internalFormat = null, this.type = f, this.offset = new W(0, 0), this.repeat = new W(1, 1), this.center = new W(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new K(), this.generateMipmaps = !0, this.mipmapsAutoUpdate = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(e && e.depth && e.depth > 1), this.pmremVersion = 0, this.isPMREMTexture = !1, this.normalized = !1;
	}
	get width() {
		return this.source.getSize(je).x;
	}
	get height() {
		return this.source.getSize(je).y;
	}
	get depth() {
		return this.source.getSize(je).z;
	}
	get image() {
		return this.source.data;
	}
	set image(e) {
		this.source.data = e;
	}
	updateMatrix() {
		this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
	}
	addUpdateRange(e, t) {
		this.updateRanges.push({
			start: e,
			count: t
		});
	}
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.normalized = e.normalized, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.mipmapsAutoUpdate = e.mipmapsAutoUpdate, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.renderTarget = e.renderTarget, this.isRenderTargetTexture = e.isRenderTargetTexture, this.isPMREMTexture = e.isPMREMTexture, this.isArrayTexture = e.isArrayTexture, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
	}
	setValues(e) {
		for (let t in e) {
			let n = e[t];
			if (n === void 0) {
				B(`Texture.setValues(): parameter '${t}' has value of undefined.`);
				continue;
			}
			let r = this[t];
			r === void 0 ? B(`Texture.setValues(): property '${t}' does not exist.`) : r && n && r.isVector2 && n.isVector2 || r && n && r.isVector3 && n.isVector3 || r && n && r.isMatrix3 && n.isMatrix3 ? r.copy(n) : this[t] = n;
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
		let n = {
			metadata: {
				version: 4.7,
				type: "Texture",
				generator: "Texture.toJSON"
			},
			uuid: this.uuid,
			name: this.name,
			image: this.source.toJSON(e).uuid,
			mapping: this.mapping,
			channel: this.channel,
			repeat: [this.repeat.x, this.repeat.y],
			offset: [this.offset.x, this.offset.y],
			center: [this.center.x, this.center.y],
			rotation: this.rotation,
			wrap: [this.wrapS, this.wrapT],
			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			normalized: this.normalized,
			colorSpace: this.colorSpace,
			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,
			flipY: this.flipY,
			generateMipmaps: this.generateMipmaps,
			mipmapsAutoUpdate: this.mipmapsAutoUpdate,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment
		};
		return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	transformUv(r) {
		if (this.mapping !== 300) return r;
		if (r.applyMatrix3(this.matrix), r.x < 0 || r.x > 1) switch (this.wrapS) {
			case e:
				r.x -= Math.floor(r.x);
				break;
			case t:
				r.x = r.x < 0 ? 0 : 1;
				break;
			case n: Math.abs(Math.floor(r.x) % 2) === 1 ? r.x = Math.ceil(r.x) - r.x : r.x -= Math.floor(r.x);
		}
		if (r.y < 0 || r.y > 1) switch (this.wrapT) {
			case e:
				r.y -= Math.floor(r.y);
				break;
			case t:
				r.y = r.y < 0 ? 0 : 1;
				break;
			case n: Math.abs(Math.floor(r.y) % 2) === 1 ? r.y = Math.ceil(r.y) - r.y : r.y -= Math.floor(r.y);
		}
		return this.flipY && (r.y = 1 - r.y), r;
	}
	set needsUpdate(e) {
		e === !0 && (this.version++, this.source.needsUpdate = !0);
	}
	set needsPMREMUpdate(e) {
		e === !0 && this.pmremVersion++;
	}
};
Me.DEFAULT_IMAGE = null, Me.DEFAULT_MAPPING = 300, Me.DEFAULT_ANISOTROPY = 1;
var Ne = class {
	static {
		this.prototype.isVector4 = !0;
	}
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.x = e, this.y = t, this.z = n, this.w = r;
	}
	get width() {
		return this.z;
	}
	set width(e) {
		this.z = e;
	}
	get height() {
		return this.w;
	}
	set height(e) {
		this.w = e;
	}
	set(e, t, n, r) {
		return this.x = e, this.y = t, this.z = n, this.w = r, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this.z = e, this.w = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setZ(e) {
		return this.z = e, this;
	}
	setW(e) {
		return this.w = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			case 2:
				this.z = t;
				break;
			case 3:
				this.w = t;
				break;
			default: throw Error("THREE.Vector4: index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
			default: throw Error("THREE.Vector4: index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y, this.z, this.w);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w === void 0 ? 1 : e.w, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this.z += e, this.w += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
	}
	applyMatrix4(e) {
		let t = this.x, n = this.y, r = this.z, i = this.w, a = e.elements;
		return this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * i, this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * i, this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * i, this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * i, this;
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this.z /= e.z, this.w /= e.w, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	setAxisAngleFromQuaternion(e) {
		this.w = 2 * Math.acos(e.w);
		let t = Math.sqrt(1 - e.w * e.w);
		return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
	}
	setAxisAngleFromRotationMatrix(e) {
		let t, n, r, i, a = .01, o = .1, s = e.elements, c = s[0], l = s[4], u = s[8], d = s[1], f = s[5], p = s[9], m = s[2], h = s[6], g = s[10];
		if (Math.abs(l - d) < a && Math.abs(u - m) < a && Math.abs(p - h) < a) {
			if (Math.abs(l + d) < o && Math.abs(u + m) < o && Math.abs(p + h) < o && Math.abs(c + f + g - 3) < o) return this.set(1, 0, 0, 0), this;
			t = Math.PI;
			let e = (c + 1) / 2, s = (f + 1) / 2, _ = (g + 1) / 2, v = (l + d) / 4, y = (u + m) / 4, b = (p + h) / 4;
			return e > s && e > _ ? e < a ? (n = 0, r = .707106781, i = .707106781) : (n = Math.sqrt(e), r = v / n, i = y / n) : s > _ ? s < a ? (n = .707106781, r = 0, i = .707106781) : (r = Math.sqrt(s), n = v / r, i = b / r) : _ < a ? (n = .707106781, r = .707106781, i = 0) : (i = Math.sqrt(_), n = y / i, r = b / i), this.set(n, r, i, t), this;
		}
		let _ = Math.sqrt((h - p) * (h - p) + (u - m) * (u - m) + (d - l) * (d - l));
		return Math.abs(_) < .001 && (_ = 1), this.x = (h - p) / _, this.y = (u - m) / _, this.z = (d - l) / _, this.w = Math.acos((c + f + g - 1) / 2), this;
	}
	setFromMatrixPosition(e) {
		let t = e.elements;
		return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
	}
	clamp(e, t) {
		return this.x = U(this.x, e.x, t.x), this.y = U(this.y, e.y, t.y), this.z = U(this.z, e.z, t.z), this.w = U(this.w, e.w, t.w), this;
	}
	clampScalar(e, t) {
		return this.x = U(this.x, e, t), this.y = U(this.y, e, t), this.z = U(this.z, e, t), this.w = U(this.w, e, t), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(U(n, e, t));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y, yield this.z, yield this.w;
	}
}, Pe = class extends se {
	constructor(e = 1, t = 1, n = {}) {
		super(), n = Object.assign({
			generateMipmaps: !1,
			internalFormat: null,
			minFilter: i,
			depthBuffer: !0,
			stencilBuffer: !1,
			resolveColorBuffer: !0,
			resolveDepthBuffer: !0,
			resolveStencilBuffer: !0,
			storeMultisampledColorBuffer: !0,
			storeMultisampledDepthBuffer: !0,
			storeMultisampledStencilBuffer: !0,
			depthTexture: null,
			samples: 0,
			count: 1,
			depth: 1,
			multiview: !1,
			useArrayDepthTexture: !1
		}, n), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth, this.scissor = new Ne(0, 0, e, t), this.scissorTest = !1, this.viewport = new Ne(0, 0, e, t), this.textures = [];
		let r = n.count;
		for (let i = 0; i < r; i++) this.textures[i] = new Me({
			width: e,
			height: t,
			depth: n.depth
		}), this.textures[i].isRenderTargetTexture = !0, this.textures[i].renderTarget = this;
		this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveColorBuffer = n.resolveColorBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.storeMultisampledColorBuffer = n.storeMultisampledColorBuffer, this.storeMultisampledDepthBuffer = n.storeMultisampledDepthBuffer, this.storeMultisampledStencilBuffer = n.storeMultisampledStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview, this.useArrayDepthTexture = n.useArrayDepthTexture;
	}
	_setTextureOptions(e = {}) {
		let t = {
			minFilter: i,
			generateMipmaps: !1,
			flipY: !1,
			internalFormat: null
		};
		e.mapping !== void 0 && (t.mapping = e.mapping), e.wrapS !== void 0 && (t.wrapS = e.wrapS), e.wrapT !== void 0 && (t.wrapT = e.wrapT), e.wrapR !== void 0 && (t.wrapR = e.wrapR), e.magFilter !== void 0 && (t.magFilter = e.magFilter), e.minFilter !== void 0 && (t.minFilter = e.minFilter), e.format !== void 0 && (t.format = e.format), e.type !== void 0 && (t.type = e.type), e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace), e.flipY !== void 0 && (t.flipY = e.flipY), e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps), e.mipmapsAutoUpdate !== void 0 && (t.mipmapsAutoUpdate = e.mipmapsAutoUpdate), e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
		for (let e = 0; e < this.textures.length; e++) this.textures[e].setValues(t);
	}
	get texture() {
		return this.textures[0];
	}
	set texture(e) {
		this.textures[0] = e;
	}
	set depthTexture(e) {
		this._depthTexture !== null && this._depthTexture.renderTarget === this && (this._depthTexture.renderTarget = null), e !== null && e.renderTarget === null && (e.renderTarget = this), this._depthTexture = e;
	}
	get depthTexture() {
		return this._depthTexture;
	}
	setSize(e, t, n = 1) {
		if (this.width !== e || this.height !== t || this.depth !== n) {
			this.width = e, this.height = t, this.depth = n;
			for (let r = 0, i = this.textures.length; r < i; r++) this.textures[r].image.width = e, this.textures[r].image.height = t, this.textures[r].image.depth = n, this.textures[r].isData3DTexture !== !0 && (this.textures[r].isArrayTexture = this.textures[r].image.depth > 1);
			this.dispose();
		}
		this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
		for (let t = 0, n = e.textures.length; t < n; t++) {
			this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
			let n = Object.assign({}, e.textures[t].image);
			this.textures[t].source = new ke(n);
		}
		if (this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveColorBuffer = e.resolveColorBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, this.storeMultisampledColorBuffer = e.storeMultisampledColorBuffer, this.storeMultisampledDepthBuffer = e.storeMultisampledDepthBuffer, this.storeMultisampledStencilBuffer = e.storeMultisampledStencilBuffer, e.depthTexture !== null) {
			if (e.depthTexture.renderTarget === e) {
				let t = e.depthTexture.clone();
				t.renderTarget = null, this.depthTexture = t;
			} else this.depthTexture = e.depthTexture;
		} else this.depthTexture = null;
		return this.samples = e.samples, this.multiview = e.multiview, this.useArrayDepthTexture = e.useArrayDepthTexture, this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, Fe = class extends Pe {
	constructor(e = 1, t = 1, n = {}) {
		super(e, t, n), this.isWebGLRenderTarget = !0;
	}
}, Y = class extends Me {
	constructor(e = null, n = 1, i = 1, a = 1) {
		super(null), this.isDataArrayTexture = !0, this.image = {
			data: e,
			width: n,
			height: i,
			depth: a
		}, this.magFilter = r, this.minFilter = r, this.wrapR = t, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
	}
	copy(e) {
		return super.copy(e), this.wrapR = e.wrapR, this;
	}
	addLayerUpdate(e) {
		this.layerUpdates.add(e);
	}
	clearLayerUpdates() {
		this.layerUpdates.clear();
	}
}, Ie = class extends Me {
	constructor(e = null, n = 1, i = 1, a = 1) {
		super(null), this.isData3DTexture = !0, this.image = {
			data: e,
			width: n,
			height: i,
			depth: a
		}, this.magFilter = r, this.minFilter = r, this.wrapR = t, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
	}
	copy(e) {
		return super.copy(e), this.wrapR = e.wrapR, this;
	}
}, Le = class e {
	static {
		this.prototype.isMatrix4 = !0;
	}
	constructor(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		this.elements = [
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		], e !== void 0 && this.set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h);
	}
	set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		let g = this.elements;
		return g[0] = e, g[4] = t, g[8] = n, g[12] = r, g[1] = i, g[5] = a, g[9] = o, g[13] = s, g[2] = c, g[6] = l, g[10] = u, g[14] = d, g[3] = f, g[7] = p, g[11] = m, g[15] = h, this;
	}
	identity() {
		return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
	}
	clone() {
		return new e().fromArray(this.elements);
	}
	copy(e) {
		let t = this.elements, n = e.elements;
		return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
	}
	copyPosition(e) {
		let t = this.elements, n = e.elements;
		return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
	}
	setFromMatrix3(e) {
		let t = e.elements;
		return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this;
	}
	extractBasis(e, t, n) {
		return this.determinantAffine() === 0 ? (e.set(1, 0, 0), t.set(0, 1, 0), n.set(0, 0, 1), this) : (e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this);
	}
	makeBasis(e, t, n) {
		return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this;
	}
	extractRotation(e) {
		if (e.determinantAffine() === 0) return this.identity();
		let t = this.elements, n = e.elements, r = 1 / X.setFromMatrixColumn(e, 0).length(), i = 1 / X.setFromMatrixColumn(e, 1).length(), a = 1 / X.setFromMatrixColumn(e, 2).length();
		return t[0] = n[0] * r, t[1] = n[1] * r, t[2] = n[2] * r, t[3] = 0, t[4] = n[4] * i, t[5] = n[5] * i, t[6] = n[6] * i, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
	}
	makeRotationFromEuler(e) {
		let t = this.elements, n = e.x, r = e.y, i = e.z, a = Math.cos(n), o = Math.sin(n), s = Math.cos(r), c = Math.sin(r), l = Math.cos(i), u = Math.sin(i);
		if (e.order === "XYZ") {
			let e = a * l, n = a * u, r = o * l, i = o * u;
			t[0] = s * l, t[4] = -s * u, t[8] = c, t[1] = n + r * c, t[5] = e - i * c, t[9] = -o * s, t[2] = i - e * c, t[6] = r + n * c, t[10] = a * s;
		} else if (e.order === "YXZ") {
			let e = s * l, n = s * u, r = c * l, i = c * u;
			t[0] = e + i * o, t[4] = r * o - n, t[8] = a * c, t[1] = a * u, t[5] = a * l, t[9] = -o, t[2] = n * o - r, t[6] = i + e * o, t[10] = a * s;
		} else if (e.order === "ZXY") {
			let e = s * l, n = s * u, r = c * l, i = c * u;
			t[0] = e - i * o, t[4] = -a * u, t[8] = r + n * o, t[1] = n + r * o, t[5] = a * l, t[9] = i - e * o, t[2] = -a * c, t[6] = o, t[10] = a * s;
		} else if (e.order === "ZYX") {
			let e = a * l, n = a * u, r = o * l, i = o * u;
			t[0] = s * l, t[4] = r * c - n, t[8] = e * c + i, t[1] = s * u, t[5] = i * c + e, t[9] = n * c - r, t[2] = -c, t[6] = o * s, t[10] = a * s;
		} else if (e.order === "YZX") {
			let e = a * s, n = a * c, r = o * s, i = o * c;
			t[0] = s * l, t[4] = i - e * u, t[8] = r * u + n, t[1] = u, t[5] = a * l, t[9] = -o * l, t[2] = -c * l, t[6] = n * u + r, t[10] = e - i * u;
		} else if (e.order === "XZY") {
			let e = a * s, n = a * c, r = o * s, i = o * c;
			t[0] = s * l, t[4] = -u, t[8] = c * l, t[1] = e * u + i, t[5] = a * l, t[9] = n * u - r, t[2] = r * u - n, t[6] = o * l, t[10] = i * u + e;
		}
		return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
	}
	makeRotationFromQuaternion(e) {
		return this.compose(Re, e, ze);
	}
	lookAt(e, t, n) {
		let r = this.elements;
		return He.subVectors(e, t), He.lengthSq() === 0 && (He.z = 1), He.normalize(), Be.crossVectors(n, He), Be.lengthSq() === 0 && (Math.abs(n.z) === 1 ? He.x += 1e-4 : He.z += 1e-4, He.normalize(), Be.crossVectors(n, He)), Be.normalize(), Ve.crossVectors(He, Be), r[0] = Be.x, r[4] = Ve.x, r[8] = He.x, r[1] = Be.y, r[5] = Ve.y, r[9] = He.y, r[2] = Be.z, r[6] = Ve.z, r[10] = He.z, this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
	premultiply(e) {
		return this.multiplyMatrices(e, this);
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[4], s = n[8], c = n[12], l = n[1], u = n[5], d = n[9], f = n[13], p = n[2], m = n[6], h = n[10], g = n[14], _ = n[3], v = n[7], y = n[11], b = n[15], x = r[0], S = r[4], C = r[8], w = r[12], T = r[1], E = r[5], D = r[9], O = r[13], k = r[2], A = r[6], j = r[10], M = r[14], N = r[3], P = r[7], F = r[11], I = r[15];
		return i[0] = a * x + o * T + s * k + c * N, i[4] = a * S + o * E + s * A + c * P, i[8] = a * C + o * D + s * j + c * F, i[12] = a * w + o * O + s * M + c * I, i[1] = l * x + u * T + d * k + f * N, i[5] = l * S + u * E + d * A + f * P, i[9] = l * C + u * D + d * j + f * F, i[13] = l * w + u * O + d * M + f * I, i[2] = p * x + m * T + h * k + g * N, i[6] = p * S + m * E + h * A + g * P, i[10] = p * C + m * D + h * j + g * F, i[14] = p * w + m * O + h * M + g * I, i[3] = _ * x + v * T + y * k + b * N, i[7] = _ * S + v * E + y * A + b * P, i[11] = _ * C + v * D + y * j + b * F, i[15] = _ * w + v * O + y * M + b * I, this;
	}
	multiplyScalar(e) {
		let t = this.elements;
		return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
	}
	determinant() {
		let e = this.elements, t = e[0], n = e[4], r = e[8], i = e[12], a = e[1], o = e[5], s = e[9], c = e[13], l = e[2], u = e[6], d = e[10], f = e[14], p = e[3], m = e[7], h = e[11], g = e[15], _ = s * f - c * d, v = o * f - c * u, y = o * d - s * u, b = a * f - c * l, x = a * d - s * l, S = a * u - o * l;
		return t * (m * _ - h * v + g * y) - n * (p * _ - h * b + g * x) + r * (p * v - m * b + g * S) - i * (p * y - m * x + h * S);
	}
	determinantAffine() {
		let e = this.elements, t = e[0], n = e[4], r = e[8], i = e[1], a = e[5], o = e[9], s = e[2], c = e[6], l = e[10];
		return t * (a * l - o * c) - n * (i * l - o * s) + r * (i * c - a * s);
	}
	transpose() {
		let e = this.elements, t;
		return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
	}
	setPosition(e, t, n) {
		let r = this.elements;
		return e.isVector3 ? (r[12] = e.x, r[13] = e.y, r[14] = e.z) : (r[12] = e, r[13] = t, r[14] = n), this;
	}
	invert() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = e[9], d = e[10], f = e[11], p = e[12], m = e[13], h = e[14], g = e[15], _ = t * o - n * a, v = t * s - r * a, y = t * c - i * a, b = n * s - r * o, x = n * c - i * o, S = r * c - i * s, C = l * m - u * p, w = l * h - d * p, T = l * g - f * p, E = u * h - d * m, D = u * g - f * m, O = d * g - f * h, k = _ * O - v * D + y * E + b * T - x * w + S * C;
		if (k === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		let A = 1 / k;
		return e[0] = (o * O - s * D + c * E) * A, e[1] = (r * D - n * O - i * E) * A, e[2] = (m * S - h * x + g * b) * A, e[3] = (d * x - u * S - f * b) * A, e[4] = (s * T - a * O - c * w) * A, e[5] = (t * O - r * T + i * w) * A, e[6] = (h * y - p * S - g * v) * A, e[7] = (l * S - d * y + f * v) * A, e[8] = (a * D - o * T + c * C) * A, e[9] = (n * T - t * D - i * C) * A, e[10] = (p * x - m * y + g * _) * A, e[11] = (u * y - l * x - f * _) * A, e[12] = (o * w - a * E - s * C) * A, e[13] = (t * E - n * w + r * C) * A, e[14] = (m * v - p * b - h * _) * A, e[15] = (l * b - u * v + d * _) * A, this;
	}
	scale(e) {
		let t = this.elements, n = e.x, r = e.y, i = e.z;
		return t[0] *= n, t[4] *= r, t[8] *= i, t[1] *= n, t[5] *= r, t[9] *= i, t[2] *= n, t[6] *= r, t[10] *= i, t[3] *= n, t[7] *= r, t[11] *= i, this;
	}
	getMaxScaleOnAxis() {
		let e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
		return Math.sqrt(Math.max(t, n, r));
	}
	makeTranslation(e, t, n) {
		return e.isVector3 ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1) : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1), this;
	}
	makeRotationX(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this;
	}
	makeRotationY(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this;
	}
	makeRotationZ(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
	}
	makeRotationAxis(e, t) {
		let n = Math.cos(t), r = Math.sin(t), i = 1 - n, a = e.x, o = e.y, s = e.z, c = i * a, l = i * o;
		return this.set(c * a + n, c * o - r * s, c * s + r * o, 0, c * o + r * s, l * o + n, l * s - r * a, 0, c * s - r * o, l * s + r * a, i * s * s + n, 0, 0, 0, 0, 1), this;
	}
	makeScale(e, t, n) {
		return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
	}
	makeShear(e, t, n, r, i, a) {
		return this.set(1, n, i, 0, e, 1, a, 0, t, r, 1, 0, 0, 0, 0, 1), this;
	}
	compose(e, t, n) {
		let r = this.elements, i = t._x, a = t._y, o = t._z, s = t._w, c = i + i, l = a + a, u = o + o, d = i * c, f = i * l, p = i * u, m = a * l, h = a * u, g = o * u, _ = s * c, v = s * l, y = s * u, b = n.x, x = n.y, S = n.z;
		return r[0] = (1 - (m + g)) * b, r[1] = (f + y) * b, r[2] = (p - v) * b, r[3] = 0, r[4] = (f - y) * x, r[5] = (1 - (d + g)) * x, r[6] = (h + _) * x, r[7] = 0, r[8] = (p + v) * S, r[9] = (h - _) * S, r[10] = (1 - (d + m)) * S, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
	}
	decompose(e, t, n) {
		let r = this.elements;
		e.x = r[12], e.y = r[13], e.z = r[14];
		let i = this.determinantAffine();
		if (i === 0) return n.set(1, 1, 1), t.identity(), this;
		let a = X.set(r[0], r[1], r[2]).length(), o = X.set(r[4], r[5], r[6]).length(), s = X.set(r[8], r[9], r[10]).length();
		i < 0 && (a = -a), Z.copy(this);
		let c = 1 / a, l = 1 / o, u = 1 / s;
		return Z.elements[0] *= c, Z.elements[1] *= c, Z.elements[2] *= c, Z.elements[4] *= l, Z.elements[5] *= l, Z.elements[6] *= l, Z.elements[8] *= u, Z.elements[9] *= u, Z.elements[10] *= u, t.setFromRotationMatrix(Z), n.x = a, n.y = o, n.z = s, this;
	}
	makePerspective(e, t, n, r, i, a, o = I, s = !1) {
		let c = this.elements, l = 2 * i / (t - e), u = 2 * i / (n - r), d = (t + e) / (t - e), f = (n + r) / (n - r), p, m;
		if (s) p = i / (a - i), m = a * i / (a - i);
		else if (o === 2e3) p = -(a + i) / (a - i), m = -2 * a * i / (a - i);
		else if (o === 2001) p = -a / (a - i), m = -a * i / (a - i);
		else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
		return c[0] = l, c[4] = 0, c[8] = d, c[12] = 0, c[1] = 0, c[5] = u, c[9] = f, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = p, c[14] = m, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
	}
	makeOrthographic(e, t, n, r, i, a, o = I, s = !1) {
		let c = this.elements, l = 2 / (t - e), u = 2 / (n - r), d = -(t + e) / (t - e), f = -(n + r) / (n - r), p, m;
		if (s) p = 1 / (a - i), m = a / (a - i);
		else if (o === 2e3) p = -2 / (a - i), m = -(a + i) / (a - i);
		else if (o === 2001) p = -1 / (a - i), m = -i / (a - i);
		else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
		return c[0] = l, c[4] = 0, c[8] = 0, c[12] = d, c[1] = 0, c[5] = u, c[9] = 0, c[13] = f, c[2] = 0, c[6] = 0, c[10] = p, c[14] = m, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
	}
	equals(e) {
		let t = this.elements, n = e.elements;
		for (let e = 0; e < 16; e++) if (t[e] !== n[e]) return !1;
		return !0;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
		return this;
	}
	toArray(e = [], t = 0) {
		let n = this.elements;
		return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
	}
}, X = /*@__PURE__*/ new G(), Z = /*@__PURE__*/ new Le(), Re = /*@__PURE__*/ new G(0, 0, 0), ze = /*@__PURE__*/ new G(1, 1, 1), Be = /*@__PURE__*/ new G(), Ve = /*@__PURE__*/ new G(), He = /*@__PURE__*/ new G(), Ue = /*@__PURE__*/ new Le(), We = /*@__PURE__*/ new _e(), Ge = class e {
	constructor(t = 0, n = 0, r = 0, i = e.DEFAULT_ORDER) {
		this.isEuler = !0, this._x = t, this._y = n, this._z = r, this._order = i;
	}
	get x() {
		return this._x;
	}
	set x(e) {
		this._x = e, this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y(e) {
		this._y = e, this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z(e) {
		this._z = e, this._onChangeCallback();
	}
	get order() {
		return this._order;
	}
	set order(e) {
		this._order = e, this._onChangeCallback();
	}
	set(e, t, n, r = this._order) {
		return this._x = e, this._y = t, this._z = n, this._order = r, this._onChangeCallback(), this;
	}
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._order);
	}
	copy(e) {
		return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
	}
	setFromRotationMatrix(e, t = this._order, n = !0) {
		let r = e.elements, i = r[0], a = r[4], o = r[8], s = r[1], c = r[5], l = r[9], u = r[2], d = r[6], f = r[10];
		switch (t) {
			case "XYZ":
				this._y = Math.asin(U(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-l, f), this._z = Math.atan2(-a, i)) : (this._x = Math.atan2(d, c), this._z = 0);
				break;
			case "YXZ":
				this._x = Math.asin(-U(l, -1, 1)), Math.abs(l) < .9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(s, c)) : (this._y = Math.atan2(-u, i), this._z = 0);
				break;
			case "ZXY":
				this._x = Math.asin(U(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(s, i));
				break;
			case "ZYX":
				this._y = Math.asin(-U(u, -1, 1)), Math.abs(u) < .9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(s, i)) : (this._x = 0, this._z = Math.atan2(-a, c));
				break;
			case "YZX":
				this._z = Math.asin(U(s, -1, 1)), Math.abs(s) < .9999999 ? (this._x = Math.atan2(-l, c), this._y = Math.atan2(-u, i)) : (this._x = 0, this._y = Math.atan2(o, f));
				break;
			case "XZY":
				this._z = Math.asin(-U(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, i)) : (this._x = Math.atan2(-l, f), this._y = 0);
				break;
			default: B("Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
		}
		return this._order = t, n === !0 && this._onChangeCallback(), this;
	}
	setFromQuaternion(e, t, n) {
		return Ue.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Ue, t, n);
	}
	setFromVector3(e, t = this._order) {
		return this.set(e.x, e.y, e.z, t);
	}
	reorder(e) {
		return We.setFromEuler(this), this.setFromQuaternion(We, e);
	}
	equals(e) {
		return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
	}
	fromArray(e) {
		return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
	}
	_onChange(e) {
		return this._onChangeCallback = e, this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x, yield this._y, yield this._z, yield this._order;
	}
};
Ge.DEFAULT_ORDER = "XYZ";
var Ke = class {
	constructor() {
		this.mask = 1;
	}
	set(e) {
		this.mask = 1 << e >>> 0;
	}
	enable(e) {
		this.mask |= 1 << e;
	}
	enableAll() {
		this.mask = -1;
	}
	toggle(e) {
		this.mask ^= 1 << e;
	}
	disable(e) {
		this.mask &= ~(1 << e);
	}
	disableAll() {
		this.mask = 0;
	}
	test(e) {
		return (this.mask & e.mask) !== 0;
	}
	isEnabled(e) {
		return !!(this.mask & 1 << e);
	}
}, qe = 0, Je = /*@__PURE__*/ new G(), Ye = /*@__PURE__*/ new _e(), Xe = /*@__PURE__*/ new Le(), Ze = /*@__PURE__*/ new G(), Qe = /*@__PURE__*/ new G(), $e = /*@__PURE__*/ new G(), et = /*@__PURE__*/ new _e(), tt = /*@__PURE__*/ new G(1, 0, 0), nt = /*@__PURE__*/ new G(0, 1, 0), rt = /*@__PURE__*/ new G(0, 0, 1), it = { type: "added" }, at = { type: "removed" }, ot = {
	type: "childadded",
	child: null
}, st = {
	type: "childremoved",
	child: null
}, ct = class e extends se {
	constructor() {
		super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: qe++ }), this.uuid = ue(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = e.DEFAULT_UP.clone();
		let t = new G(), n = new Ge(), r = new _e(), i = new G(1, 1, 1);
		function a() {
			r.setFromEuler(n, !1);
		}
		function o() {
			n.setFromQuaternion(r, void 0, !1);
		}
		n._onChange(a), r._onChange(o), Object.defineProperties(this, {
			position: {
				configurable: !0,
				enumerable: !0,
				value: t
			},
			rotation: {
				configurable: !0,
				enumerable: !0,
				value: n
			},
			quaternion: {
				configurable: !0,
				enumerable: !0,
				value: r
			},
			scale: {
				configurable: !0,
				enumerable: !0,
				value: i
			},
			modelViewMatrix: { value: new Le() },
			normalMatrix: { value: new K() }
		}), this.matrix = new Le(), this.matrixWorld = new Le(), this.matrixAutoUpdate = e.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Ke(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.static = !1, this.userData = {}, this.pivot = null;
	}
	onBeforeShadow() {}
	onAfterShadow() {}
	onBeforeRender() {}
	onAfterRender() {}
	applyMatrix4(e) {
		this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale), this.pivot !== null && this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot);
	}
	applyQuaternion(e) {
		return this.quaternion.premultiply(e), this;
	}
	setRotationFromAxisAngle(e, t) {
		this.quaternion.setFromAxisAngle(e, t);
	}
	setRotationFromEuler(e) {
		this.quaternion.setFromEuler(e, !0);
	}
	setRotationFromMatrix(e) {
		this.quaternion.setFromRotationMatrix(e);
	}
	setRotationFromQuaternion(e) {
		this.quaternion.copy(e);
	}
	rotateOnAxis(e, t) {
		return Ye.setFromAxisAngle(e, t), this.quaternion.multiply(Ye), this;
	}
	rotateOnWorldAxis(e, t) {
		return Ye.setFromAxisAngle(e, t), this.quaternion.premultiply(Ye), this;
	}
	rotateX(e) {
		return this.rotateOnAxis(tt, e);
	}
	rotateY(e) {
		return this.rotateOnAxis(nt, e);
	}
	rotateZ(e) {
		return this.rotateOnAxis(rt, e);
	}
	translateOnAxis(e, t) {
		return Je.copy(e).applyQuaternion(this.quaternion), this.position.add(Je.multiplyScalar(t)), this;
	}
	translateX(e) {
		return this.translateOnAxis(tt, e);
	}
	translateY(e) {
		return this.translateOnAxis(nt, e);
	}
	translateZ(e) {
		return this.translateOnAxis(rt, e);
	}
	localToWorld(e) {
		return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
	}
	worldToLocal(e) {
		return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Xe.copy(this.matrixWorld).invert());
	}
	lookAt(e, t, n) {
		e.isVector3 ? Ze.copy(e) : Ze.set(e, t, n);
		let r = this.parent;
		this.updateWorldMatrix(!0, !1), Qe.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Xe.lookAt(Qe, Ze, this.up) : Xe.lookAt(Ze, Qe, this.up), this.quaternion.setFromRotationMatrix(Xe), r && (Xe.extractRotation(r.matrixWorld), Ye.setFromRotationMatrix(Xe), this.quaternion.premultiply(Ye.invert()));
	}
	add(e) {
		if (arguments.length > 1) {
			for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
			return this;
		}
		return e === this ? (V("Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(it), ot.child = e, this.dispatchEvent(ot), ot.child = null) : V("Object3D.add: object not an instance of THREE.Object3D.", e), this);
	}
	remove(e) {
		if (arguments.length > 1) {
			for (let e = 0; e < arguments.length; e++) this.remove(arguments[e]);
			return this;
		}
		let t = this.children.indexOf(e);
		return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(at), st.child = e, this.dispatchEvent(st), st.child = null), this;
	}
	removeFromParent() {
		let e = this.parent;
		return e !== null && e.remove(this), this;
	}
	clear() {
		return this.remove(...this.children);
	}
	attach(e) {
		return this.updateWorldMatrix(!0, !1), Xe.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Xe.multiply(e.parent.matrixWorld)), e.applyMatrix4(Xe), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(it), ot.child = e, this.dispatchEvent(ot), ot.child = null, this;
	}
	getObjectById(e) {
		return this.getObjectByProperty("id", e);
	}
	getObjectByName(e) {
		return this.getObjectByProperty("name", e);
	}
	getObjectByProperty(e, t) {
		if (this[e] === t) return this;
		for (let n = 0, r = this.children.length; n < r; n++) {
			let r = this.children[n].getObjectByProperty(e, t);
			if (r !== void 0) return r;
		}
	}
	getObjectsByProperty(e, t, n = []) {
		this[e] === t && n.push(this);
		let r = this.children;
		for (let i = 0, a = r.length; i < a; i++) r[i].getObjectsByProperty(e, t, n);
		return n;
	}
	getWorldPosition(e) {
		return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
	}
	getWorldQuaternion(e) {
		return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Qe, e, $e), e;
	}
	getWorldScale(e) {
		return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Qe, et, e), e;
	}
	getWorldDirection(e) {
		this.updateWorldMatrix(!0, !1);
		let t = this.matrixWorld.elements;
		return e.set(t[8], t[9], t[10]).normalize();
	}
	raycast() {}
	intersectsFrustum() {
		return !0;
	}
	traverse(e) {
		e(this);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].traverse(e);
	}
	traverseVisible(e) {
		if (this.visible === !1) return;
		e(this);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].traverseVisible(e);
	}
	traverseAncestors(e) {
		let t = this.parent;
		t !== null && (e(t), t.traverseAncestors(e));
	}
	updateMatrix() {
		this.matrix.compose(this.position, this.quaternion, this.scale);
		let e = this.pivot;
		if (e !== null) {
			let t = e.x, n = e.y, r = e.z, i = this.matrix.elements;
			i[12] += t - i[0] * t - i[4] * n - i[8] * r, i[13] += n - i[1] * t - i[5] * n - i[9] * r, i[14] += r - i[2] * t - i[6] * n - i[10] * r;
		}
		this.matrixWorldNeedsUpdate = !0;
	}
	updateMatrixWorld(e) {
		this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].updateMatrixWorld(e);
	}
	updateWorldMatrix(e, t, n = !1) {
		let r = this.parent;
		if (e === !0 && r !== null && r.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || n) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, n = !0), t === !0) {
			let e = this.children;
			for (let t = 0, r = e.length; t < r; t++) e[t].updateWorldMatrix(!1, !0, n);
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string", n = {};
		t && (e = {
			geometries: {},
			materials: {},
			textures: {},
			images: {},
			shapes: {},
			skeletons: {},
			animations: {},
			nodes: {}
		}, n.metadata = {
			version: 4.7,
			type: "Object",
			generator: "Object3D.toJSON"
		});
		let r = {};
		r.uuid = this.uuid, r.type = this.type, r.name = this.name, r.castShadow = this.castShadow, r.receiveShadow = this.receiveShadow, r.visible = this.visible, r.frustumCulled = this.frustumCulled, r.renderOrder = this.renderOrder, r.static = this.static, r.matrixAutoUpdate = this.matrixAutoUpdate, Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.pivot !== null && (r.pivot = this.pivot.toArray()), this.morphTargetDictionary !== void 0 && (r.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary)), this.morphTargetInfluences !== void 0 && (r.morphTargetInfluences = this.morphTargetInfluences.slice()), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.geometryInfo = this._geometryInfo.map((e) => ({
			...e,
			boundingBox: e.boundingBox ? e.boundingBox.toJSON() : void 0,
			boundingSphere: e.boundingSphere ? e.boundingSphere.toJSON() : void 0
		})), r.instanceInfo = this._instanceInfo.map((e) => ({ ...e })), r.availableInstanceIds = this._availableInstanceIds.slice(), r.availableGeometryIds = this._availableGeometryIds.slice(), r.nextIndexStart = this._nextIndexStart, r.nextVertexStart = this._nextVertexStart, r.geometryCount = this._geometryCount, r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.matricesTexture = this._matricesTexture.toJSON(e), r.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
		function i(t, n) {
			return t[n.uuid] === void 0 && (t[n.uuid] = n.toJSON(e)), n.uuid;
		}
		if (this.isScene) this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(e).uuid);
		else if (this.isMesh || this.isLine || this.isPoints) {
			r.geometry = i(e.geometries, this.geometry);
			let t = this.geometry.parameters;
			if (t !== void 0 && t.shapes !== void 0) {
				let n = t.shapes;
				if (Array.isArray(n)) for (let t = 0, r = n.length; t < r; t++) {
					let r = n[t];
					i(e.shapes, r);
				}
				else i(e.shapes, n);
			}
		}
		if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (i(e.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0) {
			if (Array.isArray(this.material)) {
				let t = [];
				for (let n = 0, r = this.material.length; n < r; n++) t.push(i(e.materials, this.material[n]));
				r.material = t;
			} else r.material = i(e.materials, this.material);
		}
		if (this.children.length > 0) {
			r.children = [];
			for (let t = 0; t < this.children.length; t++) r.children.push(this.children[t].toJSON(e).object);
		}
		if (this.animations.length > 0) {
			r.animations = [];
			for (let t = 0; t < this.animations.length; t++) {
				let n = this.animations[t];
				r.animations.push(i(e.animations, n));
			}
		}
		if (t) {
			let t = a(e.geometries), r = a(e.materials), i = a(e.textures), o = a(e.images), s = a(e.shapes), c = a(e.skeletons), l = a(e.animations), u = a(e.nodes);
			t.length > 0 && (n.geometries = t), r.length > 0 && (n.materials = r), i.length > 0 && (n.textures = i), o.length > 0 && (n.images = o), s.length > 0 && (n.shapes = s), c.length > 0 && (n.skeletons = c), l.length > 0 && (n.animations = l), u.length > 0 && (n.nodes = u);
		}
		return n.object = r, n;
		function a(e) {
			let t = [];
			for (let n in e) {
				let r = e[n];
				delete r.metadata, t.push(r);
			}
			return t;
		}
	}
	clone(e) {
		return new this.constructor().copy(this, e);
	}
	copy(e, t = !0) {
		if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.pivot = e.pivot === null ? null : e.pivot.clone(), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.static = e.static, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0) for (let t = 0; t < e.children.length; t++) {
			let n = e.children[t];
			this.add(n.clone());
		}
		return this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
};
ct.DEFAULT_UP = /*@__PURE__*/ new G(0, 1, 0), ct.DEFAULT_MATRIX_AUTO_UPDATE = !0, ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var lt = class extends ct {
	constructor() {
		super(), this.isGroup = !0, this.type = "Group";
	}
}, ut = { type: "move" }, dt = class {
	constructor() {
		this._targetRay = null, this._grip = null, this._hand = null;
	}
	getHandSpace() {
		return this._hand === null && (this._hand = new lt(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
	}
	getTargetRaySpace() {
		return this._targetRay === null && (this._targetRay = new lt(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new G(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new G()), this._targetRay;
	}
	getGripSpace() {
		return this._grip === null && (this._grip = new lt(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new G(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new G(), this._grip.eventsEnabled = !1), this._grip;
	}
	dispatchEvent(e) {
		return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
	}
	connect(e) {
		if (e && e.hand) {
			let t = this._hand;
			if (t) for (let n of e.hand.values()) this._getHandJoint(t, n);
		}
		return this.dispatchEvent({
			type: "connected",
			data: e
		}), this;
	}
	disconnect(e) {
		return this.dispatchEvent({
			type: "disconnected",
			data: e
		}), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
	}
	update(e, t, n) {
		let r = null, i = null, a = null, o = this._targetRay, s = this._grip, c = this._hand;
		if (e && t.session.visibilityState !== "visible-blurred") {
			if (c && e.hand) {
				a = !0;
				for (let r of e.hand.values()) {
					let e = t.getJointPose(r, n), i = this._getHandJoint(c, r);
					e !== null && (i.matrix.fromArray(e.transform.matrix), i.matrix.decompose(i.position, i.quaternion, i.scale), i.matrixWorldNeedsUpdate = !0, i.jointRadius = e.radius), i.visible = e !== null;
				}
				let r = c.joints["index-finger-tip"], i = c.joints["thumb-tip"], o = r.position.distanceTo(i.position);
				c.inputState.pinching && o > .025 ? (c.inputState.pinching = !1, this.dispatchEvent({
					type: "pinchend",
					handedness: e.handedness,
					target: this
				})) : !c.inputState.pinching && o <= .015 && (c.inputState.pinching = !0, this.dispatchEvent({
					type: "pinchstart",
					handedness: e.handedness,
					target: this
				}));
			} else s !== null && e.gripSpace && (i = t.getPose(e.gripSpace, n), i !== null && (s.matrix.fromArray(i.transform.matrix), s.matrix.decompose(s.position, s.quaternion, s.scale), s.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (s.hasLinearVelocity = !0, s.linearVelocity.copy(i.linearVelocity)) : s.hasLinearVelocity = !1, i.angularVelocity ? (s.hasAngularVelocity = !0, s.angularVelocity.copy(i.angularVelocity)) : s.hasAngularVelocity = !1, s.eventsEnabled && s.dispatchEvent({
				type: "gripUpdated",
				data: e,
				target: this
			})));
			o !== null && (r = t.getPose(e.targetRaySpace, n), r === null && i !== null && (r = i), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.quaternion, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(ut)));
		}
		return o !== null && (o.visible = r !== null), s !== null && (s.visible = i !== null), c !== null && (c.visible = a !== null), this;
	}
	_getHandJoint(e, t) {
		if (e.joints[t.jointName] === void 0) {
			let n = new lt();
			n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
		}
		return e.joints[t.jointName];
	}
}, ft = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
}, pt = {
	h: 0,
	s: 0,
	l: 0
}, mt = {
	h: 0,
	s: 0,
	l: 0
};
function ht(e, t, n) {
	return n < 0 && (n += 1), n > 1 && --n, n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * 6 * (2 / 3 - n) : e;
}
var gt = class {
	constructor(e, t, n) {
		return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
	}
	set(e, t, n) {
		if (t === void 0 && n === void 0) {
			let t = e;
			t && t.isColor ? this.copy(t) : typeof t == "number" ? this.setHex(t) : typeof t == "string" && this.setStyle(t);
		} else this.setRGB(e, t, n);
		return this;
	}
	setScalar(e) {
		return this.r = e, this.g = e, this.b = e, this;
	}
	setHex(e, t = O) {
		return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, q.colorSpaceToWorking(this, t), this;
	}
	setRGB(e, t, n, r = q.workingColorSpace) {
		return this.r = e, this.g = t, this.b = n, q.colorSpaceToWorking(this, r), this;
	}
	setHSL(e, t, n, r = q.workingColorSpace) {
		if (e = de(e, 1), t = U(t, 0, 1), n = U(n, 0, 1), t === 0) this.r = this.g = this.b = n;
		else {
			let r = n <= .5 ? n * (1 + t) : n + t - n * t, i = 2 * n - r;
			this.r = ht(i, r, e + 1 / 3), this.g = ht(i, r, e), this.b = ht(i, r, e - 1 / 3);
		}
		return q.colorSpaceToWorking(this, r), this;
	}
	setStyle(e, t = O) {
		function n(t) {
			t !== void 0 && parseFloat(t) < 1 && B("Color: Alpha component of " + e + " will be ignored.");
		}
		let r;
		if (r = /^(\w+)\(([^\)]*)\)/.exec(e)) {
			let i, a = r[1], o = r[2];
			switch (a) {
				case "rgb":
				case "rgba":
					if (i = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(i[4]), this.setRGB(Math.min(255, parseInt(i[1], 10)) / 255, Math.min(255, parseInt(i[2], 10)) / 255, Math.min(255, parseInt(i[3], 10)) / 255, t);
					if (i = /^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(i[4]), this.setRGB(Math.min(100, parseFloat(i[1])) / 100, Math.min(100, parseFloat(i[2])) / 100, Math.min(100, parseFloat(i[3])) / 100, t);
					break;
				case "hsl":
				case "hsla":
					if (i = /^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o)) return n(i[4]), this.setHSL(parseFloat(i[1]) / 360, parseFloat(i[2]) / 100, parseFloat(i[3]) / 100, t);
					break;
				default: B("Color: Unknown color model " + e);
			}
		} else if (r = /^\#([A-Fa-f\d]+)$/.exec(e)) {
			let n = r[1], i = n.length;
			if (i === 3) return this.setRGB(parseInt(n.charAt(0), 16) / 15, parseInt(n.charAt(1), 16) / 15, parseInt(n.charAt(2), 16) / 15, t);
			if (i === 6) return this.setHex(parseInt(n, 16), t);
			B("Color: Invalid hex color " + e);
		} else if (e && e.length > 0) return this.setColorName(e, t);
		return this;
	}
	setColorName(e, t = O) {
		let n = ft[e.toLowerCase()];
		return n === void 0 ? B("Color: Unknown color " + e) : this.setHex(n, t), this;
	}
	clone() {
		return new this.constructor(this.r, this.g, this.b);
	}
	copy(e) {
		return this.r = e.r, this.g = e.g, this.b = e.b, this;
	}
	copySRGBToLinear(e) {
		return this.r = we(e.r), this.g = we(e.g), this.b = we(e.b), this;
	}
	copyLinearToSRGB(e) {
		return this.r = Te(e.r), this.g = Te(e.g), this.b = Te(e.b), this;
	}
	convertSRGBToLinear() {
		return this.copySRGBToLinear(this), this;
	}
	convertLinearToSRGB() {
		return this.copyLinearToSRGB(this), this;
	}
	getHex(e = O) {
		return q.workingToColorSpace(_t.copy(this), e), Math.round(U(_t.r * 255, 0, 255)) * 65536 + Math.round(U(_t.g * 255, 0, 255)) * 256 + Math.round(U(_t.b * 255, 0, 255));
	}
	getHexString(e = O) {
		return ("000000" + this.getHex(e).toString(16)).slice(-6);
	}
	getHSL(e, t = q.workingColorSpace) {
		q.workingToColorSpace(_t.copy(this), t);
		let n = _t.r, r = _t.g, i = _t.b, a = Math.max(n, r, i), o = Math.min(n, r, i), s, c, l = (o + a) / 2;
		if (o === a) s = 0, c = 0;
		else {
			let e = a - o;
			switch (c = l <= .5 ? e / (a + o) : e / (2 - a - o), a) {
				case n:
					s = (r - i) / e + (r < i ? 6 : 0);
					break;
				case r:
					s = (i - n) / e + 2;
					break;
				case i: s = (n - r) / e + 4;
			}
			s /= 6;
		}
		return e.h = s, e.s = c, e.l = l, e;
	}
	getRGB(e, t = q.workingColorSpace) {
		return q.workingToColorSpace(_t.copy(this), t), e.r = _t.r, e.g = _t.g, e.b = _t.b, e;
	}
	getStyle(e = O) {
		q.workingToColorSpace(_t.copy(this), e);
		let t = _t.r, n = _t.g, r = _t.b;
		return e === "srgb" ? `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})` : `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`;
	}
	offsetHSL(e, t, n) {
		return this.getHSL(pt), this.setHSL(pt.h + e, pt.s + t, pt.l + n);
	}
	add(e) {
		return this.r += e.r, this.g += e.g, this.b += e.b, this;
	}
	addColors(e, t) {
		return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
	}
	addScalar(e) {
		return this.r += e, this.g += e, this.b += e, this;
	}
	sub(e) {
		return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
	}
	multiply(e) {
		return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
	}
	multiplyScalar(e) {
		return this.r *= e, this.g *= e, this.b *= e, this;
	}
	lerp(e, t) {
		return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
	}
	lerpColors(e, t, n) {
		return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
	}
	lerpHSL(e, t) {
		this.getHSL(pt), e.getHSL(mt);
		let n = fe(pt.h, mt.h, t), r = fe(pt.s, mt.s, t), i = fe(pt.l, mt.l, t);
		return this.setHSL(n, r, i), this;
	}
	setFromVector3(e) {
		return this.r = e.x, this.g = e.y, this.b = e.z, this;
	}
	applyMatrix3(e) {
		let t = this.r, n = this.g, r = this.b, i = e.elements;
		return this.r = i[0] * t + i[3] * n + i[6] * r, this.g = i[1] * t + i[4] * n + i[7] * r, this.b = i[2] * t + i[5] * n + i[8] * r, this;
	}
	equals(e) {
		return e.r === this.r && e.g === this.g && e.b === this.b;
	}
	fromArray(e, t = 0) {
		return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
	}
	fromBufferAttribute(e, t) {
		return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
	}
	toJSON() {
		return this.getHex();
	}
	*[Symbol.iterator]() {
		yield this.r, yield this.g, yield this.b;
	}
}, _t = /*@__PURE__*/ new gt();
gt.NAMES = ft;
var vt = class extends ct {
	constructor() {
		super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Ge(), this.environmentIntensity = 1, this.environmentRotation = new Ge(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	copy(e, t) {
		return super.copy(e, t), this.background = e.background === null ? null : e.background.clone(), this.environment = e.environment === null ? null : e.environment.clone(), this.fog = e.fog === null ? null : e.fog.clone(), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), this.overrideMaterial = e.overrideMaterial === null ? null : e.overrideMaterial.clone(), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return this.fog !== null && (t.object.fog = this.fog.toJSON()), t.object.backgroundBlurriness = this.backgroundBlurriness, t.object.backgroundIntensity = this.backgroundIntensity, t.object.backgroundRotation = this.backgroundRotation.toArray(), t.object.environmentIntensity = this.environmentIntensity, t.object.environmentRotation = this.environmentRotation.toArray(), t;
	}
}, yt = /*@__PURE__*/ new G(), bt = /*@__PURE__*/ new G(), xt = /*@__PURE__*/ new G(), St = /*@__PURE__*/ new G(), Ct = /*@__PURE__*/ new G(), wt = /*@__PURE__*/ new G(), Tt = /*@__PURE__*/ new G(), Et = /*@__PURE__*/ new G(), Dt = /*@__PURE__*/ new G(), Ot = /*@__PURE__*/ new G(), kt = /*@__PURE__*/ new Ne(), At = /*@__PURE__*/ new Ne(), jt = /*@__PURE__*/ new Ne(), Mt = class e {
	constructor(e = new G(), t = new G(), n = new G()) {
		this.a = e, this.b = t, this.c = n;
	}
	static getNormal(e, t, n, r) {
		r.subVectors(n, t), yt.subVectors(e, t), r.cross(yt);
		let i = r.lengthSq();
		return i > 0 ? r.multiplyScalar(1 / Math.sqrt(i)) : r.set(0, 0, 0);
	}
	static getBarycoord(e, t, n, r, i) {
		yt.subVectors(r, t), bt.subVectors(n, t), xt.subVectors(e, t);
		let a = yt.dot(yt), o = yt.dot(bt), s = yt.dot(xt), c = bt.dot(bt), l = bt.dot(xt), u = a * c - o * o;
		if (u === 0) return i.set(0, 0, 0), null;
		let d = 1 / u, f = (c * s - o * l) * d, p = (a * l - o * s) * d;
		return i.set(1 - f - p, p, f);
	}
	static containsPoint(e, t, n, r) {
		return this.getBarycoord(e, t, n, r, St) !== null && St.x >= 0 && St.y >= 0 && St.x + St.y <= 1;
	}
	static getInterpolation(e, t, n, r, i, a, o, s) {
		return this.getBarycoord(e, t, n, r, St) === null ? (s.x = 0, s.y = 0, "z" in s && (s.z = 0), "w" in s && (s.w = 0), null) : (s.setScalar(0), s.addScaledVector(i, St.x), s.addScaledVector(a, St.y), s.addScaledVector(o, St.z), s);
	}
	static getInterpolatedAttribute(e, t, n, r, i, a) {
		return kt.setScalar(0), At.setScalar(0), jt.setScalar(0), kt.fromBufferAttribute(e, t), At.fromBufferAttribute(e, n), jt.fromBufferAttribute(e, r), a.setScalar(0), a.addScaledVector(kt, i.x), a.addScaledVector(At, i.y), a.addScaledVector(jt, i.z), a;
	}
	static isFrontFacing(e, t, n, r) {
		return yt.subVectors(n, t), bt.subVectors(e, t), yt.cross(bt).dot(r) < 0;
	}
	set(e, t, n) {
		return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
	}
	setFromPointsAndIndices(e, t, n, r) {
		return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this;
	}
	setFromAttributeAndIndices(e, t, n, r) {
		return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, r), this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
	}
	getArea() {
		return yt.subVectors(this.c, this.b), bt.subVectors(this.a, this.b), yt.cross(bt).length() * .5;
	}
	getMidpoint(e) {
		return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
	}
	getNormal(t) {
		return e.getNormal(this.a, this.b, this.c, t);
	}
	getPlane(e) {
		return e.setFromCoplanarPoints(this.a, this.b, this.c);
	}
	getBarycoord(t, n) {
		return e.getBarycoord(t, this.a, this.b, this.c, n);
	}
	getInterpolation(t, n, r, i, a) {
		return e.getInterpolation(t, this.a, this.b, this.c, n, r, i, a);
	}
	containsPoint(t) {
		return e.containsPoint(t, this.a, this.b, this.c);
	}
	isFrontFacing(t) {
		return e.isFrontFacing(this.a, this.b, this.c, t);
	}
	intersectsBox(e) {
		return e.intersectsTriangle(this);
	}
	closestPointToPoint(e, t) {
		let n = this.a, r = this.b, i = this.c, a, o;
		Ct.subVectors(r, n), wt.subVectors(i, n), Et.subVectors(e, n);
		let s = Ct.dot(Et), c = wt.dot(Et);
		if (s <= 0 && c <= 0) return t.copy(n);
		Dt.subVectors(e, r);
		let l = Ct.dot(Dt), u = wt.dot(Dt);
		if (l >= 0 && u <= l) return t.copy(r);
		let d = s * u - l * c;
		if (d <= 0 && s >= 0 && l <= 0 && s - l > 0) return a = s / (s - l), t.copy(n).addScaledVector(Ct, a);
		Ot.subVectors(e, i);
		let f = Ct.dot(Ot), p = wt.dot(Ot);
		if (p >= 0 && f <= p) return t.copy(i);
		let m = f * c - s * p;
		if (m <= 0 && c >= 0 && p <= 0) return o = c / (c - p), t.copy(n).addScaledVector(wt, o);
		let h = l * p - f * u;
		if (h <= 0 && u - l >= 0 && f - p >= 0) return Tt.subVectors(i, r), o = (u - l) / (u - l + (f - p)), t.copy(r).addScaledVector(Tt, o);
		let g = 1 / (h + m + d);
		return a = m * g, o = d * g, t.copy(n).addScaledVector(Ct, a).addScaledVector(wt, o);
	}
	equals(e) {
		return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
	}
}, Nt = class {
	constructor(e = new G(Infinity, Infinity, Infinity), t = new G(-Infinity, -Infinity, -Infinity)) {
		this.isBox3 = !0, this.min = e, this.max = t;
	}
	set(e, t) {
		return this.min.copy(e), this.max.copy(t), this;
	}
	setFromArray(e) {
		this.makeEmpty();
		for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(Ft.fromArray(e, t));
		return this;
	}
	setFromBufferAttribute(e) {
		this.makeEmpty();
		for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(Ft.fromBufferAttribute(e, t));
		return this;
	}
	setFromPoints(e) {
		this.makeEmpty();
		for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
		return this;
	}
	setFromCenterAndSize(e, t) {
		let n = Ft.copy(t).multiplyScalar(.5);
		return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
	}
	setFromObject(e, t = !1) {
		return this.makeEmpty(), this.expandByObject(e, t);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.min.copy(e.min), this.max.copy(e.max), this;
	}
	makeEmpty() {
		return this.min.x = this.min.y = this.min.z = Infinity, this.max.x = this.max.y = this.max.z = -Infinity, this;
	}
	isEmpty() {
		return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
	}
	getCenter(e) {
		return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5);
	}
	getSize(e) {
		return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
	}
	expandByPoint(e) {
		return this.min.min(e), this.max.max(e), this;
	}
	expandByVector(e) {
		return this.min.sub(e), this.max.add(e), this;
	}
	expandByScalar(e) {
		return this.min.addScalar(-e), this.max.addScalar(e), this;
	}
	expandByObject(e, t = !1) {
		e.updateWorldMatrix(!1, !1);
		let n = e.geometry;
		if (n !== void 0) {
			let r = n.getAttribute("position");
			if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0 && e.isBatchedMesh !== !0) for (let t = 0, n = r.count; t < n; t++) e.isMesh === !0 ? e.getVertexPosition(t, Ft) : Ft.fromBufferAttribute(r, t), Ft.applyMatrix4(e.matrixWorld), this.expandByPoint(Ft);
			else e.boundingBox === void 0 ? (n.boundingBox === null && n.computeBoundingBox(), It.copy(n.boundingBox)) : (e.boundingBox === null && e.computeBoundingBox(), It.copy(e.boundingBox)), It.applyMatrix4(e.matrixWorld), this.union(It);
		}
		let r = e.children;
		for (let e = 0, n = r.length; e < n; e++) this.expandByObject(r[e], t);
		return this;
	}
	containsPoint(e) {
		return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
	}
	containsBox(e) {
		return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
	}
	getParameter(e, t) {
		return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
	}
	intersectsBox(e) {
		return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
	}
	intersectsSphere(e) {
		return this.clampPoint(e.center, Ft), Ft.distanceToSquared(e.center) <= e.radius * e.radius;
	}
	intersectsPlane(e) {
		let t, n;
		return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
	}
	intersectsTriangle(e) {
		if (this.isEmpty()) return !1;
		this.getCenter(Ut), Wt.subVectors(this.max, Ut), Lt.subVectors(e.a, Ut), Rt.subVectors(e.b, Ut), zt.subVectors(e.c, Ut), Bt.subVectors(Rt, Lt), Vt.subVectors(zt, Rt), Ht.subVectors(Lt, zt);
		let t = [
			0,
			-Bt.z,
			Bt.y,
			0,
			-Vt.z,
			Vt.y,
			0,
			-Ht.z,
			Ht.y,
			Bt.z,
			0,
			-Bt.x,
			Vt.z,
			0,
			-Vt.x,
			Ht.z,
			0,
			-Ht.x,
			-Bt.y,
			Bt.x,
			0,
			-Vt.y,
			Vt.x,
			0,
			-Ht.y,
			Ht.x,
			0
		];
		return !qt(t, Lt, Rt, zt, Wt) || (t = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		], !qt(t, Lt, Rt, zt, Wt)) ? !1 : (Gt.crossVectors(Bt, Vt), t = [
			Gt.x,
			Gt.y,
			Gt.z
		], qt(t, Lt, Rt, zt, Wt));
	}
	clampPoint(e, t) {
		return t.copy(e).clamp(this.min, this.max);
	}
	distanceToPoint(e) {
		return this.clampPoint(e, Ft).distanceTo(e);
	}
	getBoundingSphere(e) {
		return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Ft).length() * .5), e;
	}
	intersect(e) {
		return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
	}
	union(e) {
		return this.min.min(e.min), this.max.max(e.max), this;
	}
	applyMatrix4(e) {
		return this.isEmpty() || (Pt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Pt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Pt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Pt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Pt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Pt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Pt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Pt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Pt)), this;
	}
	translate(e) {
		return this.min.add(e), this.max.add(e), this;
	}
	equals(e) {
		return e.min.equals(this.min) && e.max.equals(this.max);
	}
	toJSON() {
		return {
			min: this.min.toArray(),
			max: this.max.toArray()
		};
	}
	fromJSON(e) {
		return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
	}
}, Pt = [
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G(),
	/*@__PURE__*/ new G()
], Ft = /*@__PURE__*/ new G(), It = /*@__PURE__*/ new Nt(), Lt = /*@__PURE__*/ new G(), Rt = /*@__PURE__*/ new G(), zt = /*@__PURE__*/ new G(), Bt = /*@__PURE__*/ new G(), Vt = /*@__PURE__*/ new G(), Ht = /*@__PURE__*/ new G(), Ut = /*@__PURE__*/ new G(), Wt = /*@__PURE__*/ new G(), Gt = /*@__PURE__*/ new G(), Kt = /*@__PURE__*/ new G();
function qt(e, t, n, r, i) {
	for (let a = 0, o = e.length - 3; a <= o; a += 3) {
		Kt.fromArray(e, a);
		let o = i.x * Math.abs(Kt.x) + i.y * Math.abs(Kt.y) + i.z * Math.abs(Kt.z), s = t.dot(Kt), c = n.dot(Kt), l = r.dot(Kt);
		if (Math.max(-Math.max(s, c, l), Math.min(s, c, l)) > o) return !1;
	}
	return !0;
}
var Jt = /*@__PURE__*/ new G(), Yt = /*@__PURE__*/ new W(), Xt = 0, Zt = class extends se {
	constructor(e, t, n = !1) {
		if (super(), Array.isArray(e)) throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");
		this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Xt++ }), this.name = "", this.array = e, this.itemSize = t, this.count = e === void 0 ? 0 : e.length / t, this.normalized = n, this.usage = N, this.updateRanges = [], this.gpuType = l, this.version = 0, this._normalizationScale = e === void 0 ? void 0 : me(e);
	}
	onUploadCallback() {}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	setUsage(e) {
		return this.usage = e, this;
	}
	addUpdateRange(e, t) {
		this.updateRanges.push({
			start: e,
			count: t
		});
	}
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	copy(e) {
		return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this._normalizationScale = e._normalizationScale, this;
	}
	copyAt(e, t, n) {
		e *= this.itemSize, n *= t.itemSize;
		for (let r = 0, i = this.itemSize; r < i; r++) this.array[e + r] = t.array[n + r];
		return this;
	}
	copyArray(e) {
		return this.array.set(e), this;
	}
	applyMatrix3(e) {
		if (this.itemSize === 2) for (let t = 0, n = this.count; t < n; t++) Yt.fromBufferAttribute(this, t), Yt.applyMatrix3(e), this.setXY(t, Yt.x, Yt.y);
		else if (this.itemSize === 3) for (let t = 0, n = this.count; t < n; t++) Jt.fromBufferAttribute(this, t), Jt.applyMatrix3(e), this.setXYZ(t, Jt.x, Jt.y, Jt.z);
		return this;
	}
	applyMatrix4(e) {
		for (let t = 0, n = this.count; t < n; t++) Jt.fromBufferAttribute(this, t), Jt.applyMatrix4(e), this.setXYZ(t, Jt.x, Jt.y, Jt.z);
		return this;
	}
	applyNormalMatrix(e) {
		for (let t = 0, n = this.count; t < n; t++) Jt.fromBufferAttribute(this, t), Jt.applyNormalMatrix(e), this.setXYZ(t, Jt.x, Jt.y, Jt.z);
		return this;
	}
	transformDirection(e) {
		for (let t = 0, n = this.count; t < n; t++) Jt.fromBufferAttribute(this, t), Jt.transformDirection(e), this.setXYZ(t, Jt.x, Jt.y, Jt.z);
		return this;
	}
	set(e, t = 0) {
		return this.array.set(e, t), this;
	}
	getComponent(e, t) {
		let n = this.array[e * this.itemSize + t];
		return this.normalized && (n = this._denormalize(n)), n;
	}
	setComponent(e, t, n) {
		return this.normalized && (n = this._normalize(n)), this.array[e * this.itemSize + t] = n, this;
	}
	getX(e) {
		let t = this.array[e * this.itemSize];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	setX(e, t) {
		return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize] = t, this;
	}
	getY(e) {
		let t = this.array[e * this.itemSize + 1];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	setY(e, t) {
		return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 1] = t, this;
	}
	getZ(e) {
		let t = this.array[e * this.itemSize + 2];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	setZ(e, t) {
		return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 2] = t, this;
	}
	getW(e) {
		let t = this.array[e * this.itemSize + 3];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	setW(e, t) {
		return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 3] = t, this;
	}
	setXY(e, t, n) {
		return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n)), this.array[e + 0] = t, this.array[e + 1] = n, this;
	}
	setXYZ(e, t, n, r) {
		return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n), r = this._normalize(r)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this;
	}
	setXYZW(e, t, n, r, i) {
		return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n), r = this._normalize(r), i = this._normalize(i)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this.array[e + 3] = i, this;
	}
	onUpload(e) {
		return this.onUploadCallback = e, this;
	}
	clone() {
		return new this.constructor(this.array, this.itemSize).copy(this);
	}
	toJSON() {
		let e = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from(this.array),
			normalized: this.normalized
		};
		return e.name = this.name, e.usage = this.usage, e.gpuType = this.gpuType, e;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	_denormalize(e) {
		let t = this._normalizationScale;
		return t === void 0 ? he(e, this.array) : Math.max(e / t, -1);
	}
	_normalize(e) {
		let t = this._normalizationScale;
		return t === void 0 ? ge(e, this.array) : Math.round(e * t);
	}
}, Qt = class extends Zt {
	constructor(e, t, n) {
		super(new Uint16Array(e), t, n);
	}
}, $t = class extends Zt {
	constructor(e, t, n) {
		super(new Uint32Array(e), t, n);
	}
}, en = class extends Zt {
	constructor(e, t, n) {
		super(new Float32Array(e), t, n);
	}
}, tn = /*@__PURE__*/ new Nt(), nn = /*@__PURE__*/ new G(), rn = /*@__PURE__*/ new G(), an = class {
	constructor(e = new G(), t = -1) {
		this.isSphere = !0, this.center = e, this.radius = t;
	}
	set(e, t) {
		return this.center.copy(e), this.radius = t, this;
	}
	setFromPoints(e, t) {
		let n = this.center;
		t === void 0 ? tn.setFromPoints(e).getCenter(n) : n.copy(t);
		let r = 0;
		for (let t = 0, i = e.length; t < i; t++) r = Math.max(r, n.distanceToSquared(e[t]));
		return this.radius = Math.sqrt(r), this;
	}
	copy(e) {
		return this.center.copy(e.center), this.radius = e.radius, this;
	}
	isEmpty() {
		return this.radius < 0;
	}
	makeEmpty() {
		return this.center.set(0, 0, 0), this.radius = -1, this;
	}
	containsPoint(e) {
		return e.distanceToSquared(this.center) <= this.radius * this.radius;
	}
	distanceToPoint(e) {
		return e.distanceTo(this.center) - this.radius;
	}
	intersectsSphere(e) {
		let t = this.radius + e.radius;
		return e.center.distanceToSquared(this.center) <= t * t;
	}
	intersectsBox(e) {
		return e.intersectsSphere(this);
	}
	intersectsPlane(e) {
		return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
	}
	clampPoint(e, t) {
		let n = this.center.distanceToSquared(e);
		return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
	}
	getBoundingBox(e) {
		return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
	}
	applyMatrix4(e) {
		return this.center.applyMatrix4(e), this.radius *= e.getMaxScaleOnAxis(), this;
	}
	translate(e) {
		return this.center.add(e), this;
	}
	expandByPoint(e) {
		if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
		nn.subVectors(e, this.center);
		let t = nn.lengthSq();
		if (t > this.radius * this.radius) {
			let e = Math.sqrt(t), n = (e - this.radius) * .5;
			this.center.addScaledVector(nn, n / e), this.radius += n;
		}
		return this;
	}
	union(e) {
		return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (rn.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(nn.copy(e.center).add(rn)), this.expandByPoint(nn.copy(e.center).sub(rn))), this);
	}
	equals(e) {
		return e.center.equals(this.center) && e.radius === this.radius;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	toJSON() {
		return {
			radius: this.radius,
			center: this.center.toArray()
		};
	}
	fromJSON(e) {
		return this.radius = e.radius, this.center.fromArray(e.center), this;
	}
}, on = 0, sn = /*@__PURE__*/ new Le(), cn = /*@__PURE__*/ new ct(), ln = /*@__PURE__*/ new G(), un = /*@__PURE__*/ new Nt(), dn = /*@__PURE__*/ new Nt(), fn = /*@__PURE__*/ new G(), pn = class e extends se {
	constructor() {
		super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: on++ }), this.uuid = ue(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.indirectOffset = 0, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
			start: 0,
			count: Infinity
		}, this.userData = {}, this._transformed = !1;
	}
	getIndex() {
		return this.index;
	}
	setIndex(e) {
		return this.index = Array.isArray(e) ? new (L(e) ? $t : Qt)(e, 1) : e, this;
	}
	setIndirect(e, t = 0) {
		return this.indirect = e, this.indirectOffset = t, this;
	}
	getIndirect() {
		return this.indirect;
	}
	getAttribute(e) {
		return this.attributes[e];
	}
	setAttribute(e, t) {
		return this.attributes[e] = t, this;
	}
	deleteAttribute(e) {
		return delete this.attributes[e], this;
	}
	hasAttribute(e) {
		return this.attributes[e] !== void 0;
	}
	addGroup(e, t, n = 0) {
		this.groups.push({
			start: e,
			count: t,
			materialIndex: n
		});
	}
	clearGroups() {
		this.groups = [];
	}
	setDrawRange(e, t) {
		this.drawRange.start = e, this.drawRange.count = t;
	}
	applyMatrix4(e) {
		let t = this.attributes.position;
		t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
		let n = this.attributes.normal;
		if (n !== void 0) {
			let t = new K().getNormalMatrix(e);
			n.applyNormalMatrix(t), n.needsUpdate = !0;
		}
		let r = this.attributes.tangent;
		return r !== void 0 && (r.transformDirection(e), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this._transformed = !0, this;
	}
	applyQuaternion(e) {
		return sn.makeRotationFromQuaternion(e), this.applyMatrix4(sn), this;
	}
	rotateX(e) {
		return sn.makeRotationX(e), this.applyMatrix4(sn), this;
	}
	rotateY(e) {
		return sn.makeRotationY(e), this.applyMatrix4(sn), this;
	}
	rotateZ(e) {
		return sn.makeRotationZ(e), this.applyMatrix4(sn), this;
	}
	translate(e, t, n) {
		return sn.makeTranslation(e, t, n), this.applyMatrix4(sn), this;
	}
	scale(e, t, n) {
		return sn.makeScale(e, t, n), this.applyMatrix4(sn), this;
	}
	lookAt(e) {
		return cn.lookAt(e), cn.updateMatrix(), this.applyMatrix4(cn.matrix), this;
	}
	center() {
		return this.computeBoundingBox(), this.boundingBox.getCenter(ln).negate(), this.translate(ln.x, ln.y, ln.z), this;
	}
	setFromPoints(e) {
		let t = this.getAttribute("position");
		if (t === void 0) {
			let t = [];
			for (let n = 0, r = e.length; n < r; n++) {
				let r = e[n];
				t.push(r.x, r.y, r.z || 0);
			}
			this.setAttribute("position", new en(t, 3));
		} else {
			let n = Math.min(e.length, t.count);
			for (let r = 0; r < n; r++) {
				let n = e[r];
				t.setXYZ(r, n.x, n.y, n.z || 0);
			}
			e.length > t.count && B("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), t.needsUpdate = !0;
		}
		return this;
	}
	computeBoundingBox() {
		this.boundingBox === null && (this.boundingBox = new Nt());
		let e = this.attributes.position, t = this.morphAttributes.position;
		if (e && e.isGLBufferAttribute) V("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new G(-Infinity, -Infinity, -Infinity), new G(Infinity, Infinity, Infinity));
		else {
			if (e !== void 0) {
				if (this.boundingBox.setFromBufferAttribute(e), t) for (let e = 0, n = t.length; e < n; e++) {
					let n = t[e];
					un.setFromBufferAttribute(n), this.morphTargetsRelative ? (fn.addVectors(this.boundingBox.min, un.min), this.boundingBox.expandByPoint(fn), fn.addVectors(this.boundingBox.max, un.max), this.boundingBox.expandByPoint(fn)) : (this.boundingBox.expandByPoint(un.min), this.boundingBox.expandByPoint(un.max));
				}
			} else this.boundingBox.makeEmpty();
			(isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && V("BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	computeBoundingSphere() {
		this.boundingSphere === null && (this.boundingSphere = new an());
		let e = this.attributes.position, t = this.morphAttributes.position;
		if (e && e.isGLBufferAttribute) V("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new G(), Infinity);
		else if (e) {
			let n = this.boundingSphere.center;
			if (un.setFromBufferAttribute(e), t) for (let e = 0, n = t.length; e < n; e++) {
				let n = t[e];
				dn.setFromBufferAttribute(n), this.morphTargetsRelative ? (fn.addVectors(un.min, dn.min), un.expandByPoint(fn), fn.addVectors(un.max, dn.max), un.expandByPoint(fn)) : (un.expandByPoint(dn.min), un.expandByPoint(dn.max));
			}
			un.getCenter(n);
			let r = 0;
			for (let t = 0, i = e.count; t < i; t++) fn.fromBufferAttribute(e, t), r = Math.max(r, n.distanceToSquared(fn));
			if (t) for (let i = 0, a = t.length; i < a; i++) {
				let a = t[i], o = this.morphTargetsRelative;
				for (let t = 0, i = a.count; t < i; t++) fn.fromBufferAttribute(a, t), o && (ln.fromBufferAttribute(e, t), fn.add(ln)), r = Math.max(r, n.distanceToSquared(fn));
			}
			this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && V("BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	computeTangents() {
		let e = this.index, t = this.attributes;
		if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
			V("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
			return;
		}
		let n = t.position, r = t.normal, i = t.uv, a = this.getAttribute("tangent");
		(a === void 0 || a.count !== n.count) && (a = new Zt(new Float32Array(4 * n.count), 4), this.setAttribute("tangent", a));
		let o = [], s = [], c = new Uint8Array(n.count);
		for (let e = 0; e < n.count; e++) o[e] = new G(), s[e] = new G();
		let l = new G(), u = new G(), d = new G(), f = new W(), p = new W(), m = new W(), h = new G(), g = new G();
		function _(e, t, r) {
			c[e] = c[t] = c[r] = 1, l.fromBufferAttribute(n, e), u.fromBufferAttribute(n, t), d.fromBufferAttribute(n, r), f.fromBufferAttribute(i, e), p.fromBufferAttribute(i, t), m.fromBufferAttribute(i, r), u.sub(l), d.sub(l), p.sub(f), m.sub(f);
			let a = 1 / (p.x * m.y - m.x * p.y);
			isFinite(a) && (h.copy(u).multiplyScalar(m.y).addScaledVector(d, -p.y).multiplyScalar(a), g.copy(d).multiplyScalar(p.x).addScaledVector(u, -m.x).multiplyScalar(a), o[e].add(h), o[t].add(h), o[r].add(h), s[e].add(g), s[t].add(g), s[r].add(g));
		}
		let v = this.groups;
		v.length === 0 && (v = [{
			start: 0,
			count: e.count
		}]);
		for (let t = 0, n = v.length; t < n; ++t) {
			let n = v[t], r = n.start, i = n.count;
			for (let t = r, n = r + i; t < n; t += 3) _(e.getX(t + 0), e.getX(t + 1), e.getX(t + 2));
		}
		let y = new G(), b = new G(), x = new G(), S = new G();
		function C(e) {
			x.fromBufferAttribute(r, e), S.copy(x);
			let t = o[e];
			y.copy(t), y.sub(x.multiplyScalar(x.dot(t))).normalize(), b.crossVectors(S, t);
			let n = b.dot(s[e]) < 0 ? -1 : 1;
			a.setXYZW(e, y.x, y.y, y.z, n);
		}
		for (let e = 0, t = n.count; e < t; ++e) c[e] && C(e);
		this._transformed = !0;
	}
	computeVertexNormals() {
		let e = this.index, t = this.getAttribute("position");
		if (t !== void 0) {
			let n = this.getAttribute("normal");
			if (n === void 0 || n.count !== t.count) n = new Zt(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
			else for (let e = 0, t = n.count; e < t; e++) n.setXYZ(e, 0, 0, 0);
			let r = new G(), i = new G(), a = new G(), o = new G(), s = new G(), c = new G(), l = new G(), u = new G();
			if (e) for (let d = 0, f = e.count; d < f; d += 3) {
				let f = e.getX(d + 0), p = e.getX(d + 1), m = e.getX(d + 2);
				r.fromBufferAttribute(t, f), i.fromBufferAttribute(t, p), a.fromBufferAttribute(t, m), l.subVectors(a, i), u.subVectors(r, i), l.cross(u), o.fromBufferAttribute(n, f), s.fromBufferAttribute(n, p), c.fromBufferAttribute(n, m), o.add(l), s.add(l), c.add(l), n.setXYZ(f, o.x, o.y, o.z), n.setXYZ(p, s.x, s.y, s.z), n.setXYZ(m, c.x, c.y, c.z);
			}
			else for (let e = 0, o = t.count; e < o; e += 3) r.fromBufferAttribute(t, e + 0), i.fromBufferAttribute(t, e + 1), a.fromBufferAttribute(t, e + 2), l.subVectors(a, i), u.subVectors(r, i), l.cross(u), n.setXYZ(e + 0, l.x, l.y, l.z), n.setXYZ(e + 1, l.x, l.y, l.z), n.setXYZ(e + 2, l.x, l.y, l.z);
			this.normalizeNormals(), n.needsUpdate = !0;
		}
	}
	normalizeNormals() {
		let e = this.attributes.normal;
		for (let t = 0, n = e.count; t < n; t++) fn.fromBufferAttribute(e, t), fn.normalize(), e.setXYZ(t, fn.x, fn.y, fn.z);
	}
	toNonIndexed() {
		function t(e, t) {
			let n = e.array, r = e.itemSize, i = e.normalized, a = new n.constructor(t.length * r), o = 0, s = 0;
			for (let i = 0, c = t.length; i < c; i++) {
				o = e.isInterleavedBufferAttribute ? t[i] * e.data.stride + e.offset : t[i] * r;
				for (let e = 0; e < r; e++) a[s++] = n[o++];
			}
			return new Zt(a, r, i);
		}
		if (this.index === null) return B("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
		let n = new e(), r = this.index.array, i = this.attributes;
		for (let e in i) {
			let a = i[e], o = t(a, r);
			n.setAttribute(e, o);
		}
		let a = this.morphAttributes;
		for (let e in a) {
			let i = [], o = a[e];
			for (let e = 0, n = o.length; e < n; e++) {
				let n = o[e], a = t(n, r);
				i.push(a);
			}
			n.morphAttributes[e] = i;
		}
		n.morphTargetsRelative = this.morphTargetsRelative;
		let o = this.groups;
		for (let e = 0, t = o.length; e < t; e++) {
			let t = o[e];
			n.addGroup(t.start, t.count, t.materialIndex);
		}
		return n;
	}
	toJSON() {
		let e = { metadata: {
			version: 4.7,
			type: "BufferGeometry",
			generator: "BufferGeometry.toJSON"
		} };
		if (e.uuid = this.uuid, e.type = this.parameters !== void 0 && this._transformed === !0 ? "BufferGeometry" : this.type, e.name = this.name, Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0 && this._transformed !== !0) {
			let t = this.parameters;
			for (let n in t) t[n] !== void 0 && (e[n] = t[n]);
			return e;
		}
		e.data = { attributes: {} };
		let t = this.index;
		t !== null && (e.data.index = {
			type: t.array.constructor.name,
			array: Array.prototype.slice.call(t.array)
		});
		let n = this.attributes;
		for (let t in n) {
			let r = n[t];
			e.data.attributes[t] = r.toJSON(e.data);
		}
		let r = {}, i = !1;
		for (let t in this.morphAttributes) {
			let n = this.morphAttributes[t], a = [];
			for (let t = 0, r = n.length; t < r; t++) {
				let r = n[t];
				a.push(r.toJSON(e.data));
			}
			a.length > 0 && (r[t] = a, i = !0);
		}
		i && (e.data.morphAttributes = r, e.data.morphTargetsRelative = this.morphTargetsRelative);
		let a = this.groups;
		a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
		let o = this.boundingSphere;
		return o !== null && (e.data.boundingSphere = o.toJSON()), e;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
		let t = {};
		this.name = e.name;
		let n = e.index;
		n !== null && this.setIndex(n.clone());
		let r = e.attributes;
		for (let e in r) {
			let n = r[e];
			this.setAttribute(e, n.clone(t));
		}
		let i = e.morphAttributes;
		for (let e in i) {
			let n = [], r = i[e];
			for (let e = 0, i = r.length; e < i; e++) n.push(r[e].clone(t));
			this.morphAttributes[e] = n;
		}
		this.morphTargetsRelative = e.morphTargetsRelative;
		let a = e.groups;
		for (let e = 0, t = a.length; e < t; e++) {
			let t = a[e];
			this.addGroup(t.start, t.count, t.materialIndex);
		}
		let o = e.boundingBox;
		o !== null && (this.boundingBox = o.clone());
		let s = e.boundingSphere;
		return s !== null && (this.boundingSphere = s.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this._transformed = e._transformed, this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, mn = class {
	constructor(e, t) {
		this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e === void 0 ? 0 : e.length / t, this.usage = N, this.updateRanges = [], this.version = 0, this.uuid = ue();
	}
	onUploadCallback() {}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	setUsage(e) {
		return this.usage = e, this;
	}
	addUpdateRange(e, t) {
		this.updateRanges.push({
			start: e,
			count: t
		});
	}
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	copy(e) {
		return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this;
	}
	copyAt(e, t, n) {
		e *= this.stride, n *= t.stride;
		for (let r = 0, i = this.stride; r < i; r++) this.array[e + r] = t.array[n + r];
		return this;
	}
	set(e, t = 0) {
		return this.array.set(e, t), this;
	}
	clone(e) {
		e.arrayBuffers === void 0 && (e.arrayBuffers = {});
		let t = hn(this.array);
		e.arrayBuffers[t] === void 0 && (e.arrayBuffers[t] = this.array.slice(0).buffer);
		let n = new this.array.constructor(e.arrayBuffers[t]), r = new this.constructor(n, this.stride);
		return r.setUsage(this.usage), r;
	}
	onUpload(e) {
		return this.onUploadCallback = e, this;
	}
	toJSON(e) {
		e.arrayBuffers === void 0 && (e.arrayBuffers = {});
		let t = hn(this.array);
		e.arrayBuffers[t] === void 0 && (e.arrayBuffers[t] = Array.from(new Uint32Array(this.array.slice(0).buffer)));
		let n = {
			uuid: this.uuid,
			buffer: t,
			type: this.array.constructor.name,
			stride: this.stride
		};
		return n.usage = this.usage, n;
	}
};
function hn(e) {
	return e.buffer._uuid === void 0 && (e.buffer._uuid = ue()), e.byteOffset === 0 && e.byteLength === e.buffer.byteLength ? e.buffer._uuid : e.buffer._uuid + ":" + e.byteOffset + ":" + e.byteLength;
}
var gn = /*@__PURE__*/ new G(), _n = class e {
	constructor(e, t, n, r = !1) {
		this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = t, this.offset = n, this.normalized = r, this._normalizationScale = e === void 0 ? void 0 : me(e.array);
	}
	get count() {
		return this.data.count;
	}
	get array() {
		return this.data.array;
	}
	set needsUpdate(e) {
		this.data.needsUpdate = e;
	}
	applyMatrix4(e) {
		for (let t = 0, n = this.data.count; t < n; t++) gn.fromBufferAttribute(this, t), gn.applyMatrix4(e), this.setXYZ(t, gn.x, gn.y, gn.z);
		return this;
	}
	applyNormalMatrix(e) {
		for (let t = 0, n = this.count; t < n; t++) gn.fromBufferAttribute(this, t), gn.applyNormalMatrix(e), this.setXYZ(t, gn.x, gn.y, gn.z);
		return this;
	}
	transformDirection(e) {
		for (let t = 0, n = this.count; t < n; t++) gn.fromBufferAttribute(this, t), gn.transformDirection(e), this.setXYZ(t, gn.x, gn.y, gn.z);
		return this;
	}
	getComponent(e, t) {
		let n = this.array[e * this.data.stride + this.offset + t];
		return this.normalized && (n = this._denormalize(n)), n;
	}
	setComponent(e, t, n) {
		return this.normalized && (n = this._normalize(n)), this.data.array[e * this.data.stride + this.offset + t] = n, this;
	}
	setX(e, t) {
		return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset] = t, this;
	}
	setY(e, t) {
		return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 1] = t, this;
	}
	setZ(e, t) {
		return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 2] = t, this;
	}
	setW(e, t) {
		return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 3] = t, this;
	}
	getX(e) {
		let t = this.data.array[e * this.data.stride + this.offset];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	getY(e) {
		let t = this.data.array[e * this.data.stride + this.offset + 1];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	getZ(e) {
		let t = this.data.array[e * this.data.stride + this.offset + 2];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	getW(e) {
		let t = this.data.array[e * this.data.stride + this.offset + 3];
		return this.normalized && (t = this._denormalize(t)), t;
	}
	setXY(e, t, n) {
		return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this;
	}
	setXYZ(e, t, n, r) {
		return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n), r = this._normalize(r)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = r, this;
	}
	setXYZW(e, t, n, r, i) {
		return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n), r = this._normalize(r), i = this._normalize(i)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = r, this.data.array[e + 3] = i, this;
	}
	clone(t) {
		if (t === void 0) {
			ne("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
			let e = [];
			for (let t = 0; t < this.count; t++) {
				let n = t * this.data.stride + this.offset;
				for (let t = 0; t < this.itemSize; t++) e.push(this.data.array[n + t]);
			}
			return new Zt(new this.array.constructor(e), this.itemSize, this.normalized);
		}
		return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new e(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
	}
	toJSON(e) {
		if (e === void 0) {
			ne("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
			let e = [];
			for (let t = 0; t < this.count; t++) {
				let n = t * this.data.stride + this.offset;
				for (let t = 0; t < this.itemSize; t++) e.push(this.data.array[n + t]);
			}
			return {
				itemSize: this.itemSize,
				type: this.array.constructor.name,
				array: e,
				normalized: this.normalized
			};
		}
		return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
			isInterleavedBufferAttribute: !0,
			itemSize: this.itemSize,
			data: this.data.uuid,
			offset: this.offset,
			normalized: this.normalized
		};
	}
	_denormalize(e) {
		let t = this._normalizationScale;
		return t === void 0 ? he(e, this.data.array) : Math.max(e / t, -1);
	}
	_normalize(e) {
		let t = this._normalizationScale;
		return t === void 0 ? ge(e, this.data.array) : Math.round(e * t);
	}
}, vn = /*@__PURE__*/ new G(), yn = /*@__PURE__*/ new G(), bn = /*@__PURE__*/ new K(), xn = class {
	constructor(e = new G(1, 0, 0), t = 0) {
		this.isPlane = !0, this.normal = e, this.constant = t;
	}
	set(e, t) {
		return this.normal.copy(e), this.constant = t, this;
	}
	setComponents(e, t, n, r) {
		return this.normal.set(e, t, n), this.constant = r, this;
	}
	setFromNormalAndCoplanarPoint(e, t) {
		return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
	}
	setFromCoplanarPoints(e, t, n) {
		let r = vn.subVectors(n, t).cross(yn.subVectors(e, t)).normalize();
		return this.setFromNormalAndCoplanarPoint(r, e), this;
	}
	copy(e) {
		return this.normal.copy(e.normal), this.constant = e.constant, this;
	}
	normalize() {
		let e = 1 / this.normal.length();
		return this.normal.multiplyScalar(e), this.constant *= e, this;
	}
	negate() {
		return this.constant *= -1, this.normal.negate(), this;
	}
	distanceToPoint(e) {
		return this.normal.dot(e) + this.constant;
	}
	distanceToSphere(e) {
		return this.distanceToPoint(e.center) - e.radius;
	}
	projectPoint(e, t) {
		return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
	}
	intersectLine(e, t, n = !0) {
		let r = e.delta(vn), i = this.normal.dot(r);
		if (i === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
		let a = -(e.start.dot(this.normal) + this.constant) / i;
		return n === !0 && (a < 0 || a > 1) ? null : t.copy(e.start).addScaledVector(r, a);
	}
	intersectsLine(e) {
		let t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
		return t < 0 && n > 0 || n < 0 && t > 0;
	}
	intersectsBox(e) {
		return e.intersectsPlane(this);
	}
	intersectsSphere(e) {
		return e.intersectsPlane(this);
	}
	coplanarPoint(e) {
		return e.copy(this.normal).multiplyScalar(-this.constant);
	}
	applyMatrix4(e, t) {
		let n = t || bn.getNormalMatrix(e), r = this.coplanarPoint(vn).applyMatrix4(e), i = this.normal.applyMatrix3(n).normalize();
		return this.constant = -r.dot(i), this;
	}
	translate(e) {
		return this.constant -= e.dot(this.normal), this;
	}
	equals(e) {
		return e.normal.equals(this.normal) && e.constant === this.constant;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	toJSON() {
		return {
			normal: this.normal.toArray(),
			constant: this.constant
		};
	}
	fromJSON(e) {
		return this.normal.fromArray(e.normal), this.constant = e.constant, this;
	}
}, Sn = 0, Cn = class extends se {
	constructor() {
		super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Sn++ }), this.uuid = ue(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new gt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = M, this.stencilZFail = M, this.stencilZPass = M, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
	}
	get alphaTest() {
		return this._alphaTest;
	}
	set alphaTest(e) {
		this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
	}
	onBeforeRender() {}
	onBeforeCompile() {}
	customProgramCacheKey() {
		return this.onBeforeCompile.toString();
	}
	setValues(e) {
		if (e !== void 0) for (let t in e) {
			let n = e[t];
			if (n === void 0) {
				B(`Material: parameter '${t}' has value of undefined.`);
				continue;
			}
			let r = this[t];
			r === void 0 ? B(`Material: '${t}' is not a property of THREE.${this.type}.`) : r && r.isColor ? r.set(n) : r && r.isVector2 && n && n.isVector2 || r && r.isEuler && n && n.isEuler || r && r.isVector3 && n && n.isVector3 ? r.copy(n) : this[t] = n;
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		t && (e = {
			textures: {},
			images: {}
		});
		let n = { metadata: {
			version: 4.7,
			type: "Material",
			generator: "Material.toJSON"
		} };
		n.uuid = this.uuid, n.type = this.type, n.blending = this.blending, n.side = this.side, n.shadowSide = this.shadowSide, n.vertexColors = this.vertexColors, n.opacity = this.opacity, n.transparent = this.transparent, n.blendSrc = this.blendSrc, n.blendDst = this.blendDst, n.blendEquation = this.blendEquation, n.blendSrcAlpha = this.blendSrcAlpha, n.blendDstAlpha = this.blendDstAlpha, n.blendEquationAlpha = this.blendEquationAlpha, n.blendColor = this.blendColor.getHex(), n.blendAlpha = this.blendAlpha, n.depthFunc = this.depthFunc, n.depthTest = this.depthTest, n.depthWrite = this.depthWrite, n.colorWrite = this.colorWrite, n.clipIntersection = this.clipIntersection, n.clipShadows = this.clipShadows, n.stencilWriteMask = this.stencilWriteMask, n.stencilFunc = this.stencilFunc, n.stencilRef = this.stencilRef, n.stencilFuncMask = this.stencilFuncMask, n.stencilFail = this.stencilFail, n.stencilZFail = this.stencilZFail, n.stencilZPass = this.stencilZPass, n.stencilWrite = this.stencilWrite, n.polygonOffset = this.polygonOffset, n.polygonOffsetFactor = this.polygonOffsetFactor, n.polygonOffsetUnits = this.polygonOffsetUnits, n.dithering = this.dithering, n.alphaTest = this.alphaTest, n.alphaHash = this.alphaHash, n.alphaToCoverage = this.alphaToCoverage, n.premultipliedAlpha = this.premultipliedAlpha, n.forceSinglePass = this.forceSinglePass, n.allowOverride = this.allowOverride, n.visible = this.visible, n.toneMapped = this.toneMapped, n.name = this.name, this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.diffuseRoughness !== void 0 && (n.diffuseRoughness = this.diffuseRoughness), this.diffuseRoughnessMap && this.diffuseRoughnessMap.isTexture && (n.diffuseRoughnessMap = this.diffuseRoughnessMap.toJSON(e).uuid), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.retroreflectivity !== void 0 && (n.retroreflectivity = this.retroreflectivity), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessMinimum !== void 0 && (n.iridescenceThicknessMinimum = this.iridescenceThicknessMinimum), this.iridescenceThicknessMaximum !== void 0 && (n.iridescenceThicknessMaximum = this.iridescenceThicknessMaximum), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), Array.isArray(this.clippingPlanes) && this.clippingPlanes.length > 0 && (n.clippingPlanes = this.clippingPlanes.map((e) => e.toJSON())), this.rotation !== void 0 && (n.rotation = this.rotation), this.depthPacking !== void 0 && (n.depthPacking = this.depthPacking), this.linewidth !== void 0 && (n.linewidth = this.linewidth), this.linecap !== void 0 && (n.linecap = this.linecap), this.linejoin !== void 0 && (n.linejoin = this.linejoin), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.wireframe !== void 0 && (n.wireframe = this.wireframe), this.wireframeLinewidth !== void 0 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== void 0 && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== void 0 && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading !== void 0 && (n.flatShading = this.flatShading), this.fog !== void 0 && (n.fog = this.fog), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
		function r(e) {
			let t = [];
			for (let n in e) {
				let r = e[n];
				delete r.metadata, t.push(r);
			}
			return t;
		}
		if (t) {
			let t = r(e.textures), i = r(e.images);
			t.length > 0 && (n.textures = t), i.length > 0 && (n.images = i);
		}
		return n;
	}
	fromJSON(e, t) {
		if (e.uuid !== void 0 && (this.uuid = e.uuid), e.name !== void 0 && (this.name = e.name), e.color !== void 0 && this.color !== void 0 && this.color.setHex(e.color), e.roughness !== void 0 && (this.roughness = e.roughness), e.metalness !== void 0 && (this.metalness = e.metalness), e.sheen !== void 0 && (this.sheen = e.sheen), e.sheenColor !== void 0 && (this.sheenColor = new gt().setHex(e.sheenColor)), e.sheenRoughness !== void 0 && (this.sheenRoughness = e.sheenRoughness), e.emissive !== void 0 && this.emissive !== void 0 && this.emissive.setHex(e.emissive), e.specular !== void 0 && this.specular !== void 0 && this.specular.setHex(e.specular), e.specularIntensity !== void 0 && (this.specularIntensity = e.specularIntensity), e.specularColor !== void 0 && this.specularColor !== void 0 && this.specularColor.setHex(e.specularColor), e.shininess !== void 0 && (this.shininess = e.shininess), e.clearcoat !== void 0 && (this.clearcoat = e.clearcoat), e.clearcoatRoughness !== void 0 && (this.clearcoatRoughness = e.clearcoatRoughness), e.diffuseRoughness !== void 0 && (this.diffuseRoughness = e.diffuseRoughness), e.dispersion !== void 0 && (this.dispersion = e.dispersion), e.retroreflectivity !== void 0 && (this.retroreflectivity = e.retroreflectivity), e.iridescence !== void 0 && (this.iridescence = e.iridescence), e.iridescenceIOR !== void 0 && (this.iridescenceIOR = e.iridescenceIOR), e.iridescenceThicknessMinimum !== void 0 && (this.iridescenceThicknessMinimum = e.iridescenceThicknessMinimum), e.iridescenceThicknessMaximum !== void 0 && (this.iridescenceThicknessMaximum = e.iridescenceThicknessMaximum), e.iridescenceThicknessRange !== void 0 && (this.iridescenceThicknessMinimum = e.iridescenceThicknessRange[0], this.iridescenceThicknessMaximum = e.iridescenceThicknessRange[1]), e.transmission !== void 0 && (this.transmission = e.transmission), e.thickness !== void 0 && (this.thickness = e.thickness), e.attenuationDistance !== void 0 && (this.attenuationDistance = e.attenuationDistance), e.attenuationColor !== void 0 && this.attenuationColor !== void 0 && this.attenuationColor.setHex(e.attenuationColor), e.anisotropy !== void 0 && (this.anisotropy = e.anisotropy), e.anisotropyRotation !== void 0 && (this.anisotropyRotation = e.anisotropyRotation), e.fog !== void 0 && (this.fog = e.fog), e.flatShading !== void 0 && (this.flatShading = e.flatShading), e.blending !== void 0 && (this.blending = e.blending), e.combine !== void 0 && (this.combine = e.combine), e.side !== void 0 && (this.side = e.side), e.shadowSide !== void 0 && (this.shadowSide = e.shadowSide), e.opacity !== void 0 && (this.opacity = e.opacity), e.transparent !== void 0 && (this.transparent = e.transparent), e.alphaTest !== void 0 && (this.alphaTest = e.alphaTest), e.alphaHash !== void 0 && (this.alphaHash = e.alphaHash), e.depthFunc !== void 0 && (this.depthFunc = e.depthFunc), e.depthTest !== void 0 && (this.depthTest = e.depthTest), e.depthWrite !== void 0 && (this.depthWrite = e.depthWrite), e.colorWrite !== void 0 && (this.colorWrite = e.colorWrite), e.clippingPlanes !== void 0 && (this.clippingPlanes = e.clippingPlanes.map((e) => new xn().fromJSON(e))), e.clipIntersection !== void 0 && (this.clipIntersection = e.clipIntersection), e.clipShadows !== void 0 && (this.clipShadows = e.clipShadows), e.depthPacking !== void 0 && (this.depthPacking = e.depthPacking), e.blendSrc !== void 0 && (this.blendSrc = e.blendSrc), e.blendDst !== void 0 && (this.blendDst = e.blendDst), e.blendEquation !== void 0 && (this.blendEquation = e.blendEquation), e.blendSrcAlpha !== void 0 && (this.blendSrcAlpha = e.blendSrcAlpha), e.blendDstAlpha !== void 0 && (this.blendDstAlpha = e.blendDstAlpha), e.blendEquationAlpha !== void 0 && (this.blendEquationAlpha = e.blendEquationAlpha), e.blendColor !== void 0 && this.blendColor !== void 0 && this.blendColor.setHex(e.blendColor), e.blendAlpha !== void 0 && (this.blendAlpha = e.blendAlpha), e.stencilWriteMask !== void 0 && (this.stencilWriteMask = e.stencilWriteMask), e.stencilFunc !== void 0 && (this.stencilFunc = e.stencilFunc), e.stencilRef !== void 0 && (this.stencilRef = e.stencilRef), e.stencilFuncMask !== void 0 && (this.stencilFuncMask = e.stencilFuncMask), e.stencilFail !== void 0 && (this.stencilFail = e.stencilFail), e.stencilZFail !== void 0 && (this.stencilZFail = e.stencilZFail), e.stencilZPass !== void 0 && (this.stencilZPass = e.stencilZPass), e.stencilWrite !== void 0 && (this.stencilWrite = e.stencilWrite), e.wireframe !== void 0 && (this.wireframe = e.wireframe), e.wireframeLinewidth !== void 0 && (this.wireframeLinewidth = e.wireframeLinewidth), e.wireframeLinecap !== void 0 && (this.wireframeLinecap = e.wireframeLinecap), e.wireframeLinejoin !== void 0 && (this.wireframeLinejoin = e.wireframeLinejoin), e.rotation !== void 0 && (this.rotation = e.rotation), e.linewidth !== void 0 && (this.linewidth = e.linewidth), e.linecap !== void 0 && (this.linecap = e.linecap), e.linejoin !== void 0 && (this.linejoin = e.linejoin), e.dashSize !== void 0 && (this.dashSize = e.dashSize), e.gapSize !== void 0 && (this.gapSize = e.gapSize), e.scale !== void 0 && (this.scale = e.scale), e.polygonOffset !== void 0 && (this.polygonOffset = e.polygonOffset), e.polygonOffsetFactor !== void 0 && (this.polygonOffsetFactor = e.polygonOffsetFactor), e.polygonOffsetUnits !== void 0 && (this.polygonOffsetUnits = e.polygonOffsetUnits), e.dithering !== void 0 && (this.dithering = e.dithering), e.alphaToCoverage !== void 0 && (this.alphaToCoverage = e.alphaToCoverage), e.premultipliedAlpha !== void 0 && (this.premultipliedAlpha = e.premultipliedAlpha), e.forceSinglePass !== void 0 && (this.forceSinglePass = e.forceSinglePass), e.allowOverride !== void 0 && (this.allowOverride = e.allowOverride), e.visible !== void 0 && (this.visible = e.visible), e.toneMapped !== void 0 && (this.toneMapped = e.toneMapped), e.userData !== void 0 && (this.userData = e.userData), e.vertexColors !== void 0 && (this.vertexColors = typeof e.vertexColors == "number" ? e.vertexColors > 0 : e.vertexColors), e.size !== void 0 && (this.size = e.size), e.sizeAttenuation !== void 0 && (this.sizeAttenuation = e.sizeAttenuation), e.map !== void 0 && (this.map = t[e.map] || null), e.matcap !== void 0 && (this.matcap = t[e.matcap] || null), e.alphaMap !== void 0 && (this.alphaMap = t[e.alphaMap] || null), e.bumpMap !== void 0 && (this.bumpMap = t[e.bumpMap] || null), e.bumpScale !== void 0 && (this.bumpScale = e.bumpScale), e.normalMap !== void 0 && (this.normalMap = t[e.normalMap] || null), e.normalMapType !== void 0 && (this.normalMapType = e.normalMapType), e.normalScale !== void 0) {
			let t = e.normalScale;
			Array.isArray(t) === !1 && (t = [t, t]), this.normalScale = new W().fromArray(t);
		}
		return e.displacementMap !== void 0 && (this.displacementMap = t[e.displacementMap] || null), e.displacementScale !== void 0 && (this.displacementScale = e.displacementScale), e.displacementBias !== void 0 && (this.displacementBias = e.displacementBias), e.roughnessMap !== void 0 && (this.roughnessMap = t[e.roughnessMap] || null), e.metalnessMap !== void 0 && (this.metalnessMap = t[e.metalnessMap] || null), e.emissiveMap !== void 0 && (this.emissiveMap = t[e.emissiveMap] || null), e.emissiveIntensity !== void 0 && (this.emissiveIntensity = e.emissiveIntensity), e.specularMap !== void 0 && (this.specularMap = t[e.specularMap] || null), e.specularIntensityMap !== void 0 && (this.specularIntensityMap = t[e.specularIntensityMap] || null), e.specularColorMap !== void 0 && (this.specularColorMap = t[e.specularColorMap] || null), e.envMap !== void 0 && (this.envMap = t[e.envMap] || null), e.envMapRotation !== void 0 && this.envMapRotation.fromArray(e.envMapRotation), e.envMapIntensity !== void 0 && (this.envMapIntensity = e.envMapIntensity), e.reflectivity !== void 0 && (this.reflectivity = e.reflectivity), e.refractionRatio !== void 0 && (this.refractionRatio = e.refractionRatio), e.lightMap !== void 0 && (this.lightMap = t[e.lightMap] || null), e.lightMapIntensity !== void 0 && (this.lightMapIntensity = e.lightMapIntensity), e.aoMap !== void 0 && (this.aoMap = t[e.aoMap] || null), e.aoMapIntensity !== void 0 && (this.aoMapIntensity = e.aoMapIntensity), e.gradientMap !== void 0 && (this.gradientMap = t[e.gradientMap] || null), e.clearcoatMap !== void 0 && (this.clearcoatMap = t[e.clearcoatMap] || null), e.clearcoatRoughnessMap !== void 0 && (this.clearcoatRoughnessMap = t[e.clearcoatRoughnessMap] || null), e.clearcoatNormalMap !== void 0 && (this.clearcoatNormalMap = t[e.clearcoatNormalMap] || null), e.clearcoatNormalScale !== void 0 && (this.clearcoatNormalScale = new W().fromArray(e.clearcoatNormalScale)), e.diffuseRoughnessMap !== void 0 && (this.diffuseRoughnessMap = t[e.diffuseRoughnessMap] || null), e.iridescenceMap !== void 0 && (this.iridescenceMap = t[e.iridescenceMap] || null), e.iridescenceThicknessMap !== void 0 && (this.iridescenceThicknessMap = t[e.iridescenceThicknessMap] || null), e.transmissionMap !== void 0 && (this.transmissionMap = t[e.transmissionMap] || null), e.thicknessMap !== void 0 && (this.thicknessMap = t[e.thicknessMap] || null), e.anisotropyMap !== void 0 && (this.anisotropyMap = t[e.anisotropyMap] || null), e.sheenColorMap !== void 0 && (this.sheenColorMap = t[e.sheenColorMap] || null), e.sheenRoughnessMap !== void 0 && (this.sheenRoughnessMap = t[e.sheenRoughnessMap] || null), this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
		let t = e.clippingPlanes, n = null;
		if (t !== null) {
			let e = t.length;
			n = Array(e);
			for (let r = 0; r !== e; ++r) n[r] = t[r].clone();
		}
		return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.allowOverride = e.allowOverride, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
}, wn = /*@__PURE__*/ new G(), Tn = /*@__PURE__*/ new G(), En = /*@__PURE__*/ new G(), Dn = /*@__PURE__*/ new G(), On = class {
	constructor(e = new G(), t = new G(0, 0, -1)) {
		this.origin = e, this.direction = t;
	}
	set(e, t) {
		return this.origin.copy(e), this.direction.copy(t), this;
	}
	copy(e) {
		return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
	}
	at(e, t) {
		return t.copy(this.origin).addScaledVector(this.direction, e);
	}
	lookAt(e) {
		return this.direction.copy(e).sub(this.origin).normalize(), this;
	}
	recast(e) {
		return this.origin.copy(this.at(e, wn)), this;
	}
	closestPointToPoint(e, t) {
		t.subVectors(e, this.origin);
		let n = t.dot(this.direction);
		return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
	}
	distanceToPoint(e) {
		return Math.sqrt(this.distanceSqToPoint(e));
	}
	distanceSqToPoint(e) {
		let t = wn.subVectors(e, this.origin).dot(this.direction);
		return t < 0 ? this.origin.distanceToSquared(e) : (wn.copy(this.origin).addScaledVector(this.direction, t), wn.distanceToSquared(e));
	}
	distanceSqToSegment(e, t, n, r) {
		Tn.copy(e).add(t).multiplyScalar(.5), En.copy(t).sub(e).normalize(), Dn.copy(this.origin).sub(Tn);
		let i = e.distanceTo(t) * .5, a = -this.direction.dot(En), o = Dn.dot(this.direction), s = -Dn.dot(En), c = Dn.lengthSq(), l = Math.abs(1 - a * a), u, d, f, p;
		if (l > 0) {
			if (u = a * s - o, d = a * o - s, p = i * l, u >= 0) {
				if (d >= -p) {
					if (d <= p) {
						let e = 1 / l;
						u *= e, d *= e, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * s) + c;
					} else d = i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
				} else d = -i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
			} else d <= -p ? (u = Math.max(0, -(-a * i + o)), d = u > 0 ? -i : Math.min(Math.max(-i, -s), i), f = -u * u + d * (d + 2 * s) + c) : d <= p ? (u = 0, d = Math.min(Math.max(-i, -s), i), f = d * (d + 2 * s) + c) : (u = Math.max(0, -(a * i + o)), d = u > 0 ? i : Math.min(Math.max(-i, -s), i), f = -u * u + d * (d + 2 * s) + c);
		} else d = a > 0 ? -i : i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
		return n && n.copy(this.origin).addScaledVector(this.direction, u), r && r.copy(Tn).addScaledVector(En, d), f;
	}
	intersectSphere(e, t) {
		if (e.radius < 0) return null;
		wn.subVectors(e.center, this.origin);
		let n = wn.dot(this.direction), r = wn.dot(wn) - n * n, i = e.radius * e.radius;
		if (r > i) return null;
		let a = Math.sqrt(i - r), o = n - a, s = n + a;
		return s < 0 ? null : o < 0 ? this.at(s, t) : this.at(o, t);
	}
	intersectsSphere(e) {
		return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
	}
	distanceToPlane(e) {
		let t = e.normal.dot(this.direction);
		if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
		let n = -(this.origin.dot(e.normal) + e.constant) / t;
		return n >= 0 ? n : null;
	}
	intersectPlane(e, t) {
		let n = this.distanceToPlane(e);
		return n === null ? null : this.at(n, t);
	}
	intersectsPlane(e) {
		let t = e.distanceToPoint(this.origin);
		return t === 0 || e.normal.dot(this.direction) * t < 0;
	}
	intersectBox(e, t) {
		let n, r, i, a, o, s, c = 1 / this.direction.x, l = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
		return c >= 0 ? (n = (e.min.x - d.x) * c, r = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, r = (e.min.x - d.x) * c), l >= 0 ? (i = (e.min.y - d.y) * l, a = (e.max.y - d.y) * l) : (i = (e.max.y - d.y) * l, a = (e.min.y - d.y) * l), n > a || i > r || ((i > n || isNaN(n)) && (n = i), (a < r || isNaN(r)) && (r = a), u >= 0 ? (o = (e.min.z - d.z) * u, s = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, s = (e.min.z - d.z) * u), n > s || o > r) || ((o > n || n !== n) && (n = o), (s < r || r !== r) && (r = s), r < 0) ? null : this.at(n >= 0 ? n : r, t);
	}
	intersectsBox(e) {
		return this.intersectBox(e, wn) !== null;
	}
	intersectTriangle(e, t, n, r, i) {
		let a = this.origin, o = this.direction, s = o.x, c = o.y, l = o.z, u = e.x - a.x, d = e.y - a.y, f = e.z - a.z, p = t.x - a.x, m = t.y - a.y, h = t.z - a.z, g = n.x - a.x, _ = n.y - a.y, v = n.z - a.z, y = Math.abs(s), b = Math.abs(c), x = Math.abs(l), S, C, w, T, E, D, O, k, A, j, M, N;
		if (y >= b && y >= x ? (w = s, D = u, A = p, N = g, s >= 0 ? (S = c, C = l, T = d, E = f, O = m, k = h, j = _, M = v) : (S = l, C = c, T = f, E = d, O = h, k = m, j = v, M = _)) : b >= x ? (w = c, D = d, A = m, N = _, c >= 0 ? (S = l, C = s, T = f, E = u, O = h, k = p, j = v, M = g) : (S = s, C = l, T = u, E = f, O = p, k = h, j = g, M = v)) : (w = l, D = f, A = h, N = v, l >= 0 ? (S = s, C = c, T = u, E = d, O = p, k = m, j = g, M = _) : (S = c, C = s, T = d, E = u, O = m, k = p, j = _, M = g)), w === 0) return null;
		let P = S / w, F = C / w, I = 1 / w, L = T - P * D, R = E - F * D, ee = O - P * A, te = k - F * A, z = j - P * N, ne = M - F * N, re = z * te - ne * ee, B = L * ne - R * z, V = ee * R - te * L;
		if (r) {
			if (re < 0 || B < 0 || V < 0) return null;
		} else if ((re < 0 || B < 0 || V < 0) && (re > 0 || B > 0 || V > 0)) return null;
		let ie = re + B + V;
		if (ie === 0) return null;
		let ae = I * (re * D + B * A + V * N);
		return (ie > 0 ? ae < 0 : ae > 0) ? null : this.at(ae / ie, i);
	}
	applyMatrix4(e) {
		return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
	}
	equals(e) {
		return e.origin.equals(this.origin) && e.direction.equals(this.direction);
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, kn = class extends Cn {
	constructor(e) {
		super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new gt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Ge(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
	}
}, An = /*@__PURE__*/ new Le(), jn = /*@__PURE__*/ new On(), Mn = /*@__PURE__*/ new an(), Nn = /*@__PURE__*/ new G(), Pn = /*@__PURE__*/ new G(), Fn = /*@__PURE__*/ new G(), In = /*@__PURE__*/ new G(), Ln = /*@__PURE__*/ new G(), Rn = /*@__PURE__*/ new G(), zn = /*@__PURE__*/ new G(), Bn = /*@__PURE__*/ new G(), Vn = class extends ct {
	constructor(e = new pn(), t = new kn()) {
		super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
	}
	copy(e, t) {
		return super.copy(e, t), this.morphTargetInfluences = e.morphTargetInfluences === void 0 ? void 0 : e.morphTargetInfluences.slice(), this.morphTargetDictionary = e.morphTargetDictionary === void 0 ? void 0 : Object.assign({}, e.morphTargetDictionary), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
	}
	updateMorphTargets() {
		let e = this.geometry.morphAttributes, t = Object.keys(e);
		if (t.length > 0) {
			let n = e[t[0]];
			if (n !== void 0) {
				this.morphTargetInfluences = [], this.morphTargetDictionary = {};
				for (let e = 0, t = n.length; e < t; e++) {
					let t = n[e].name || String(e);
					this.morphTargetInfluences.push(0), this.morphTargetDictionary[t] = e;
				}
			}
		}
	}
	getVertexPosition(e, t) {
		let n = this.geometry, r = n.attributes.position, i = n.morphAttributes.position, a = n.morphTargetsRelative;
		t.fromBufferAttribute(r, e);
		let o = this.morphTargetInfluences;
		if (i && o) {
			Rn.set(0, 0, 0);
			for (let n = 0, r = i.length; n < r; n++) {
				let r = o[n], s = i[n];
				r !== 0 && (Ln.fromBufferAttribute(s, e), a ? Rn.addScaledVector(Ln, r) : Rn.addScaledVector(Ln.sub(t), r));
			}
			t.add(Rn);
		}
		return t;
	}
	intersectsFrustum(e) {
		return e.intersectsObject(this);
	}
	raycast(e, t) {
		let n = this.geometry, r = this.material, i = this.matrixWorld;
		r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Mn.copy(n.boundingSphere), Mn.applyMatrix4(i), jn.copy(e.ray).recast(e.near), Mn.containsPoint(jn.origin) === !1 && (jn.intersectSphere(Mn, Nn) === null || jn.origin.distanceToSquared(Nn) > (e.far - e.near) ** 2) || (An.copy(i).invert(), jn.copy(e.ray).applyMatrix4(An), (n.boundingBox === null || jn.intersectsBox(n.boundingBox) !== !1) && this._computeIntersections(e, t, jn)));
	}
	_computeIntersections(e, t, n) {
		let r, i = this.geometry, a = this.material, o = i.index, s = i.attributes.position, c = i.attributes.uv, l = i.attributes.uv1, u = i.attributes.normal, d = i.groups, f = i.drawRange;
		if (o !== null) {
			if (Array.isArray(a)) for (let i = 0, s = d.length; i < s; i++) {
				let s = d[i], p = a[s.materialIndex], m = Math.max(s.start, f.start), h = Math.min(o.count, Math.min(s.start + s.count, f.start + f.count));
				for (let i = m, a = h; i < a; i += 3) {
					let a = o.getX(i), d = o.getX(i + 1), f = o.getX(i + 2);
					r = Un(this, p, e, n, c, l, u, a, d, f), r && (r.faceIndex = Math.floor(i / 3), r.face.materialIndex = s.materialIndex, t.push(r));
				}
			}
			else {
				let i = Math.max(0, f.start), s = Math.min(o.count, f.start + f.count);
				for (let d = i, f = s; d < f; d += 3) {
					let i = o.getX(d), s = o.getX(d + 1), f = o.getX(d + 2);
					r = Un(this, a, e, n, c, l, u, i, s, f), r && (r.faceIndex = Math.floor(d / 3), t.push(r));
				}
			}
		} else if (s !== void 0) {
			if (Array.isArray(a)) for (let i = 0, o = d.length; i < o; i++) {
				let o = d[i], p = a[o.materialIndex], m = Math.max(o.start, f.start), h = Math.min(s.count, Math.min(o.start + o.count, f.start + f.count));
				for (let i = m, a = h; i < a; i += 3) {
					let a = i, s = i + 1, d = i + 2;
					r = Un(this, p, e, n, c, l, u, a, s, d), r && (r.faceIndex = Math.floor(i / 3), r.face.materialIndex = o.materialIndex, t.push(r));
				}
			}
			else {
				let i = Math.max(0, f.start), o = Math.min(s.count, f.start + f.count);
				for (let s = i, d = o; s < d; s += 3) {
					let i = s, o = s + 1, d = s + 2;
					r = Un(this, a, e, n, c, l, u, i, o, d), r && (r.faceIndex = Math.floor(s / 3), t.push(r));
				}
			}
		}
	}
};
function Hn(e, t, n, r, i, a, o, s) {
	let c;
	if (c = t.side === 1 ? r.intersectTriangle(o, a, i, !0, s) : r.intersectTriangle(i, a, o, t.side === 0, s), c === null) return null;
	Bn.copy(s), Bn.applyMatrix4(e.matrixWorld);
	let l = n.ray.origin.distanceTo(Bn);
	return l < n.near || l > n.far ? null : {
		distance: l,
		point: Bn.clone(),
		object: e
	};
}
function Un(e, t, n, r, i, a, o, s, c, l) {
	e.getVertexPosition(s, Pn), e.getVertexPosition(c, Fn), e.getVertexPosition(l, In);
	let u = Hn(e, t, n, r, Pn, Fn, In, zn);
	if (u) {
		let e = new G();
		Mt.getBarycoord(zn, Pn, Fn, In, e), i && (u.uv = Mt.getInterpolatedAttribute(i, s, c, l, e, new W())), a && (u.uv1 = Mt.getInterpolatedAttribute(a, s, c, l, e, new W())), o && (u.normal = Mt.getInterpolatedAttribute(o, s, c, l, e, new G()), u.normal.dot(r.direction) > 0 && u.normal.multiplyScalar(-1));
		let t = {
			a: s,
			b: c,
			c: l,
			normal: new G(),
			materialIndex: 0
		};
		Mt.getNormal(Pn, Fn, In, t.normal), u.face = t, u.barycoord = e;
	}
	return u;
}
var Wn = class extends Me {
	constructor(e = null, t = 1, n = 1, i, a, o, s, c, l = r, u = r, d, f) {
		super(null, o, s, c, l, u, i, a, d, f), this.isDataTexture = !0, this.image = {
			data: e,
			width: t,
			height: n
		}, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
	}
}, Gn = class extends Zt {
	constructor(e, t, n, r = 1) {
		super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = r;
	}
	copy(e) {
		return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e;
	}
}, Kn = /*@__PURE__*/ new an(), qn = /*@__PURE__*/ new W(.5, .5), Jn = /*@__PURE__*/ new G(), Yn = class {
	constructor(e = new xn(), t = new xn(), n = new xn(), r = new xn(), i = new xn(), a = new xn()) {
		this.planes = [
			e,
			t,
			n,
			r,
			i,
			a
		];
	}
	set(e, t, n, r, i, a) {
		let o = this.planes;
		return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(i), o[5].copy(a), this;
	}
	copy(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
		return this;
	}
	setFromProjectionMatrix(e, t = I, n = !1) {
		let r = this.planes, i = e.elements, a = i[0], o = i[1], s = i[2], c = i[3], l = i[4], u = i[5], d = i[6], f = i[7], p = i[8], m = i[9], h = i[10], g = i[11], _ = i[12], v = i[13], y = i[14], b = i[15];
		if (r[0].setComponents(c - a, f - l, g - p, b - _).normalize(), r[1].setComponents(c + a, f + l, g + p, b + _).normalize(), r[2].setComponents(c + o, f + u, g + m, b + v).normalize(), r[3].setComponents(c - o, f - u, g - m, b - v).normalize(), n) r[4].setComponents(s, d, h, y).normalize(), r[5].setComponents(c - s, f - d, g - h, b - y).normalize();
		else if (r[4].setComponents(c - s, f - d, g - h, b - y).normalize(), t === 2e3) r[5].setComponents(c + s, f + d, g + h, b + y).normalize();
		else if (t === 2001) r[5].setComponents(s, d, h, y).normalize();
		else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
		return this;
	}
	intersectsObject(e) {
		if (e.boundingSphere !== void 0) e.boundingSphere === null && e.computeBoundingSphere(), Kn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
		else {
			let t = e.geometry;
			t.boundingSphere === null && t.computeBoundingSphere(), Kn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
		}
		return this.intersectsSphere(Kn);
	}
	intersectsSprite(e) {
		return Kn.center.set(0, 0, 0), Kn.radius = .7071067811865476 + qn.distanceTo(e.center), Kn.applyMatrix4(e.matrixWorld), this.intersectsSphere(Kn);
	}
	intersectsSphere(e) {
		let t = this.planes, n = e.center, r = -e.radius;
		for (let e = 0; e < 6; e++) if (t[e].distanceToPoint(n) < r) return !1;
		return !0;
	}
	intersectsBox(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) {
			let r = t[n];
			if (Jn.x = r.normal.x > 0 ? e.max.x : e.min.x, Jn.y = r.normal.y > 0 ? e.max.y : e.min.y, Jn.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(Jn) < 0) return !1;
		}
		return !0;
	}
	containsPoint(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
		return !0;
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, Xn = /*@__PURE__*/ new Le(), Zn = class e {
	constructor() {
		this.coordinateSystem = I, this._frustums = [], this._count = 0;
	}
	setFromArrayCamera(e) {
		let t = e.cameras, n = this._frustums;
		for (let e = 0; e < t.length; e++) {
			let r = t[e];
			Xn.multiplyMatrices(r.projectionMatrix, r.matrixWorldInverse), n[e] === void 0 && (n[e] = new Yn()), n[e].setFromProjectionMatrix(Xn, r.coordinateSystem, r.reversedDepth);
		}
		return this._count = t.length, this;
	}
	getFrustum(e) {
		return this._frustums[e];
	}
	intersectsObject(e) {
		let t = this._frustums;
		for (let n = 0; n < this._count; n++) if (t[n].intersectsObject(e)) return !0;
		return !1;
	}
	intersectsSprite(e) {
		let t = this._frustums;
		for (let n = 0; n < this._count; n++) if (t[n].intersectsSprite(e)) return !0;
		return !1;
	}
	intersectsSphere(e) {
		let t = this._frustums;
		for (let n = 0; n < this._count; n++) if (t[n].intersectsSphere(e)) return !0;
		return !1;
	}
	intersectsBox(e) {
		let t = this._frustums;
		for (let n = 0; n < this._count; n++) if (t[n].intersectsBox(e)) return !0;
		return !1;
	}
	containsPoint(e) {
		let t = this._frustums;
		for (let n = 0; n < this._count; n++) if (t[n].containsPoint(e)) return !0;
		return !1;
	}
	copy(e) {
		this.coordinateSystem = e.coordinateSystem;
		let t = this._frustums, n = e._frustums;
		for (let r = 0; r < e._count; r++) t[r] === void 0 && (t[r] = new Yn()), t[r].copy(n[r]);
		return this._count = e._count, this;
	}
	clone() {
		return new e().copy(this);
	}
}, Qn = class extends Me {
	constructor(e = [], t = 301, n, r, i, a, o, s, c, l) {
		super(e, t, n, r, i, a, o, s, c, l), this.isCubeTexture = !0, this.flipY = !1;
	}
	get images() {
		return this.image;
	}
	set images(e) {
		this.image = e;
	}
}, $n = class extends Me {
	constructor(e, t, n, r, i, a, o, s, c) {
		super(e, t, n, r, i, a, o, s, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
	}
}, er = class extends Me {
	constructor(e, t, n = c, i, a, o, s = r, l = r, u, d = h, f = 1) {
		if (d !== 1026 && d !== 1027) throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
		super({
			width: e,
			height: t,
			depth: f
		}, i, a, o, s, l, d, n, u), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
	}
	copy(e) {
		return super.copy(e), this.source = new ke(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.compareFunction = this.compareFunction, t;
	}
}, tr = class extends er {
	constructor(e, t = c, n = 301, i, a, o = r, s = r, l, u = h) {
		let d = {
			width: e,
			height: e,
			depth: 1
		}, f = [
			d,
			d,
			d,
			d,
			d,
			d
		];
		super(e, e, t, n, i, a, o, s, l, u), this.image = f, this.isCubeDepthTexture = !0, this.isCubeTexture = !0;
	}
	get images() {
		return this.image;
	}
	set images(e) {
		this.image = e;
	}
}, nr = class extends Me {
	constructor(e = null) {
		super(), this.sourceTexture = e, this.isExternalTexture = !0;
	}
	copy(e) {
		return super.copy(e), this.sourceTexture = e.sourceTexture, this;
	}
}, rr = class e extends pn {
	constructor(e = 1, t = 1, n = 1, r = 1, i = 1, a = 1) {
		super(), this.type = "BoxGeometry", this.parameters = {
			width: e,
			height: t,
			depth: n,
			widthSegments: r,
			heightSegments: i,
			depthSegments: a
		};
		let o = this;
		r = Math.floor(r), i = Math.floor(i), a = Math.floor(a);
		let s = [], c = [], l = [], u = [], d = 0, f = 0;
		p("z", "y", "x", -1, -1, n, t, e, a, i, 0), p("z", "y", "x", 1, -1, n, t, -e, a, i, 1), p("x", "z", "y", 1, 1, e, n, t, r, a, 2), p("x", "z", "y", 1, -1, e, n, -t, r, a, 3), p("x", "y", "z", 1, -1, e, t, n, r, i, 4), p("x", "y", "z", -1, -1, e, t, -n, r, i, 5), this.setIndex(s), this.setAttribute("position", new en(c, 3)), this.setAttribute("normal", new en(l, 3)), this.setAttribute("uv", new en(u, 2));
		function p(e, t, n, r, i, a, p, m, h, g, _) {
			let v = a / h, y = p / g, b = a / 2, x = p / 2, S = m / 2, C = h + 1, w = g + 1, T = 0, E = 0, D = new G();
			for (let a = 0; a < w; a++) {
				let o = a * y - x;
				for (let s = 0; s < C; s++) D[e] = (s * v - b) * r, D[t] = o * i, D[n] = S, c.push(D.x, D.y, D.z), D[e] = 0, D[t] = 0, D[n] = m > 0 ? 1 : -1, l.push(D.x, D.y, D.z), u.push(s / h), u.push(1 - a / g), T += 1;
			}
			for (let e = 0; e < g; e++) for (let t = 0; t < h; t++) {
				let n = d + t + C * e, r = d + t + C * (e + 1), i = d + (t + 1) + C * (e + 1), a = d + (t + 1) + C * e;
				s.push(n, r, a), s.push(r, i, a), E += 6;
			}
			o.addGroup(f, E, _), f += E, d += T;
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
	}
}, ir = class e extends pn {
	constructor(e = 1, t = 1, n = 1, r = 1) {
		super(), this.type = "PlaneGeometry", this.parameters = {
			width: e,
			height: t,
			widthSegments: n,
			heightSegments: r
		};
		let i = e / 2, a = t / 2, o = Math.floor(n), s = Math.floor(r), c = o + 1, l = s + 1, u = e / o, d = t / s, f = [], p = [], m = [], h = [];
		for (let e = 0; e < l; e++) {
			let t = e * d - a;
			for (let n = 0; n < c; n++) {
				let r = n * u - i;
				p.push(r, -t, 0), m.push(0, 0, 1), h.push(n / o), h.push(1 - e / s);
			}
		}
		for (let e = 0; e < s; e++) for (let t = 0; t < o; t++) {
			let n = t + c * e, r = t + c * (e + 1), i = t + 1 + c * (e + 1), a = t + 1 + c * e;
			f.push(n, r, a), f.push(r, i, a);
		}
		this.setIndex(f), this.setAttribute("position", new en(p, 3)), this.setAttribute("normal", new en(m, 3)), this.setAttribute("uv", new en(h, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.width, t.height, t.widthSegments, t.heightSegments);
	}
};
function ar(e) {
	let t = {};
	for (let n in e) {
		t[n] = {};
		for (let r in e[n]) {
			let i = e[n][r];
			if (sr(i)) i.isRenderTargetTexture ? (B("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[n][r] = null) : t[n][r] = i.clone();
			else if (Array.isArray(i)) {
				if (sr(i[0])) {
					let e = [];
					for (let t = 0, n = i.length; t < n; t++) e[t] = i[t].clone();
					t[n][r] = e;
				} else t[n][r] = i.slice();
			} else t[n][r] = i;
		}
	}
	return t;
}
function or(e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = ar(e[n]);
		for (let e in r) t[e] = r[e];
	}
	return t;
}
function sr(e) {
	return e && (e.isColor || e.isMatrix3 || e.isMatrix4 || e.isVector2 || e.isVector3 || e.isVector4 || e.isTexture || e.isQuaternion);
}
function cr(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) t.push(e[n].clone());
	return t;
}
function lr(e) {
	let t = e.getRenderTarget();
	return t === null ? e.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : q.workingColorSpace;
}
var ur = {
	clone: ar,
	merge: or
}, dr = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", fr = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", pr = class extends Cn {
	constructor(e) {
		super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = dr, this.fragmentShader = fr, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
			clipCullDistance: !1,
			multiDraw: !1
		}, this.defaultAttributeValues = {
			color: [
				1,
				1,
				1
			],
			uv: [0, 0],
			uv1: [0, 0]
		}, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = ar(e.uniforms), this.uniformsGroups = cr(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this.defaultAttributeValues = Object.assign({}, e.defaultAttributeValues), this.index0AttributeName = e.index0AttributeName, this.uniformsNeedUpdate = e.uniformsNeedUpdate, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		t.glslVersion = this.glslVersion, t.uniforms = {};
		for (let n in this.uniforms) {
			let r = this.uniforms[n].value;
			r && r.isTexture ? t.uniforms[n] = {
				type: "t",
				value: r.toJSON(e).uuid
			} : r && r.isColor ? t.uniforms[n] = {
				type: "c",
				value: r.getHex()
			} : r && r.isVector2 ? t.uniforms[n] = {
				type: "v2",
				value: r.toArray()
			} : r && r.isVector3 ? t.uniforms[n] = {
				type: "v3",
				value: r.toArray()
			} : r && r.isVector4 ? t.uniforms[n] = {
				type: "v4",
				value: r.toArray()
			} : r && r.isMatrix3 ? t.uniforms[n] = {
				type: "m3",
				value: r.toArray()
			} : r && r.isMatrix4 ? t.uniforms[n] = {
				type: "m4",
				value: r.toArray()
			} : t.uniforms[n] = { value: r };
		}
		Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
		let n = {};
		for (let e in this.extensions) this.extensions[e] === !0 && (n[e] = !0);
		return Object.keys(n).length > 0 && (t.extensions = n), t;
	}
	fromJSON(e, t) {
		if (super.fromJSON(e, t), e.uniforms !== void 0) for (let n in e.uniforms) {
			let r = e.uniforms[n];
			switch (this.uniforms[n] = {}, r.type) {
				case "t":
					this.uniforms[n].value = t[r.value] || null;
					break;
				case "c":
					this.uniforms[n].value = new gt().setHex(r.value);
					break;
				case "v2":
					this.uniforms[n].value = new W().fromArray(r.value);
					break;
				case "v3":
					this.uniforms[n].value = new G().fromArray(r.value);
					break;
				case "v4":
					this.uniforms[n].value = new Ne().fromArray(r.value);
					break;
				case "m3":
					this.uniforms[n].value = new K().fromArray(r.value);
					break;
				case "m4":
					this.uniforms[n].value = new Le().fromArray(r.value);
					break;
				default: this.uniforms[n].value = r.value;
			}
		}
		if (e.defines !== void 0 && (this.defines = e.defines), e.vertexShader !== void 0 && (this.vertexShader = e.vertexShader), e.fragmentShader !== void 0 && (this.fragmentShader = e.fragmentShader), e.glslVersion !== void 0 && (this.glslVersion = e.glslVersion), e.extensions !== void 0) for (let t in e.extensions) this.extensions[t] = e.extensions[t];
		return e.lights !== void 0 && (this.lights = e.lights), e.clipping !== void 0 && (this.clipping = e.clipping), this;
	}
}, mr = class extends pr {
	constructor(e) {
		super(e), this.isRawShaderMaterial = !0, this.type = "RawShaderMaterial";
	}
}, hr = class extends Cn {
	constructor(e) {
		super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
	}
}, gr = class extends Cn {
	constructor(e) {
		super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
	}
};
function _r(e, t) {
	return !e || e.constructor === t ? e : typeof t.BYTES_PER_ELEMENT == "number" ? new t(e) : Array.prototype.slice.call(e);
}
function vr(e) {
	return e !== void 0 && e.inTangents !== void 0 && e.outTangents !== void 0;
}
var yr = class {
	constructor(e, t, n, r) {
		this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = r === void 0 ? new t.constructor(n) : r, this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
	}
	evaluate(e) {
		let t = this.parameterPositions, n = this._cachedIndex, r = t[n], i = t[n - 1];
		validate_interval: {
			seek: {
				let a;
				linear_scan: {
					forward_scan: if (!(e < r)) {
						for (let a = n + 2;;) {
							if (r === void 0) {
								if (e < i) break forward_scan;
								return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
							}
							if (n === a) break;
							if (i = r, r = t[++n], e < r) break seek;
						}
						a = t.length;
						break linear_scan;
					}
					if (!(e >= i)) {
						let o = t[1];
						e < o && (n = 2, i = o);
						for (let a = n - 2;;) {
							if (i === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
							if (n === a) break;
							if (r = i, i = t[--n - 1], e >= i) break seek;
						}
						a = n, n = 0;
						break linear_scan;
					}
					break validate_interval;
				}
				for (; n < a;) {
					let r = n + a >>> 1;
					e < t[r] ? a = r : n = r + 1;
				}
				if (r = t[n], i = t[n - 1], i === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
				if (r === void 0) return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
			}
			this._cachedIndex = n, this.intervalChanged_(n, i, r);
		}
		return this.interpolate_(n, i, e, r);
	}
	getSettings_() {
		return this.settings || this.DefaultSettings_;
	}
	copySampleValue_(e) {
		let t = this.resultBuffer, n = this.sampleValues, r = this.valueSize, i = e * r;
		for (let e = 0; e !== r; ++e) t[e] = n[i + e];
		return t;
	}
	interpolate_() {
		throw Error("THREE.Interpolant: Call to abstract method.");
	}
	intervalChanged_() {}
}, br = class extends yr {
	constructor(e, t, n, r) {
		super(e, t, n, r), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
			endingStart: T,
			endingEnd: T
		};
	}
	intervalChanged_(e, t, n) {
		let r = this.parameterPositions, i = e - 2, a = e + 1, o = r[i], s = r[a];
		if (o === void 0) switch (this.getSettings_().endingStart) {
			case E:
				i = e, o = 2 * t - n;
				break;
			case D:
				i = r.length - 2, o = t + r[i] - r[i + 1];
				break;
			default: i = e, o = n;
		}
		if (s === void 0) switch (this.getSettings_().endingEnd) {
			case E:
				a = e, s = 2 * n - t;
				break;
			case D:
				a = 1, s = n + r[1] - r[0];
				break;
			default: a = e - 1, s = t;
		}
		let c = (n - t) * .5, l = this.valueSize;
		this._weightPrev = c / (t - o), this._weightNext = c / (s - n), this._offsetPrev = i * l, this._offsetNext = a * l;
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, f = this._weightNext, p = (n - t) / (r - t), m = p * p, h = m * p, g = -d * h + 2 * d * m - d * p, _ = (1 + d) * h + (-1.5 - 2 * d) * m + (-.5 + d) * p + 1, v = (-1 - f) * h + (1.5 + f) * m + .5 * p, y = f * h - f * m;
		for (let e = 0; e !== o; ++e) i[e] = g * a[l + e] + _ * a[c + e] + v * a[s + e] + y * a[u + e];
		return i;
	}
}, xr = class extends yr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = (n - t) / (r - t), u = 1 - l;
		for (let e = 0; e !== o; ++e) i[e] = a[c + e] * u + a[s + e] * l;
		return i;
	}
}, Sr = class extends yr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e) {
		return this.copySampleValue_(e - 1);
	}
}, Cr = class extends yr {
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = this.inTangents, u = this.outTangents;
		if (!l || !u) {
			let e = (n - t) / (r - t), l = 1 - e;
			for (let t = 0; t !== o; ++t) i[t] = a[c + t] * l + a[s + t] * e;
			return i;
		}
		let d = o * 2, f = e - 1;
		for (let p = 0; p !== o; ++p) {
			let o = a[c + p], m = a[s + p], h = f * d + p * 2, g = u[h], _ = u[h + 1], v = e * d + p * 2, y = l[v], b = l[v + 1], x = Er(n, t, g, y, r);
			i[p] = wr(x, o, _, b, m);
		}
		return i;
	}
};
function wr(e, t, n, r, i) {
	let a = 1 - e;
	return a * a * a * t + 3 * a * a * e * n + 3 * a * e * e * r + e * e * e * i;
}
function Tr(e, t, n, r, i) {
	let a = 1 - e;
	return 3 * a * a * (n - t) + 6 * a * e * (r - n) + 3 * e * e * (i - r);
}
function Er(e, t, n, r, i) {
	let a = (e - t) / (i - t);
	for (let o = 0; o < 8; o++) {
		let o = wr(a, t, n, r, i) - e;
		if (Math.abs(o) < 1e-10) break;
		let s = Tr(a, t, n, r, i);
		if (Math.abs(s) < 1e-10) break;
		a = Math.max(0, Math.min(1, a - o / s));
	}
	return a;
}
var Dr = class {
	constructor(e, t, n, r) {
		if (e === void 0) throw Error("THREE.KeyframeTrack: track name is undefined");
		if (t === void 0 || t.length === 0) throw Error("THREE.KeyframeTrack: no keyframes in track named " + e);
		this.name = e, this.times = _r(t, this.TimeBufferType), this.values = _r(n, this.ValueBufferType), this.setInterpolation(r || this.DefaultInterpolation);
	}
	static toJSON(e) {
		let t = e.constructor, n;
		if (t.toJSON !== this.toJSON) n = t.toJSON(e);
		else {
			n = {
				name: e.name,
				times: _r(e.times, Array),
				values: _r(e.values, Array)
			};
			let t = e.getInterpolation();
			t !== e.DefaultInterpolation && (n.interpolation = t), vr(e.settings) && (n.settings = {
				inTangents: _r(e.settings.inTangents, Array),
				outTangents: _r(e.settings.outTangents, Array)
			});
		}
		return n.type = e.ValueTypeName, n;
	}
	InterpolantFactoryMethodDiscrete(e) {
		return new Sr(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodLinear(e) {
		return new xr(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodSmooth(e) {
		return new br(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodBezier(e) {
		let t = new Cr(this.times, this.values, this.getValueSize(), e);
		return this.settings && (t.inTangents = this.settings.inTangents, t.outTangents = this.settings.outTangents), t;
	}
	setInterpolation(e) {
		let t;
		switch (e) {
			case x:
				t = this.InterpolantFactoryMethodDiscrete;
				break;
			case S:
				t = this.InterpolantFactoryMethodLinear;
				break;
			case C:
				t = this.InterpolantFactoryMethodSmooth;
				break;
			case w: t = this.InterpolantFactoryMethodBezier;
		}
		if (t === void 0) {
			let t = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
			if (this.createInterpolant === void 0) {
				if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
				else throw Error(t);
			}
			return B("KeyframeTrack:", t), this;
		}
		return this.createInterpolant = t, this;
	}
	getInterpolation() {
		switch (this.createInterpolant) {
			case this.InterpolantFactoryMethodDiscrete: return x;
			case this.InterpolantFactoryMethodLinear: return S;
			case this.InterpolantFactoryMethodSmooth: return C;
			case this.InterpolantFactoryMethodBezier: return w;
		}
	}
	getValueSize() {
		return this.values.length / this.times.length;
	}
	shift(e) {
		if (e !== 0) {
			let t = this.times;
			for (let n = 0, r = t.length; n !== r; ++n) t[n] += e;
			vr(this.settings) && (Or(this.settings.inTangents, e), Or(this.settings.outTangents, e));
		}
		return this;
	}
	scale(e) {
		if (e !== 1) {
			let t = this.times;
			for (let n = 0, r = t.length; n !== r; ++n) t[n] *= e;
			vr(this.settings) && (kr(this.settings.inTangents, e), kr(this.settings.outTangents, e));
		}
		return this;
	}
	trim(e, t) {
		let n = this.times, r = n.length, i = 0, a = r - 1;
		for (; i !== r && n[i] < e;) ++i;
		for (; a !== -1 && n[a] > t;) --a;
		if (++a, i !== 0 || a !== r) {
			i >= a && (a = Math.max(a, 1), i = a - 1);
			let e = this.getValueSize();
			this.times = n.slice(i, a), this.values = this.values.slice(i * e, a * e);
		}
		return this;
	}
	validate() {
		let e = !0, t = this.getValueSize();
		t - Math.floor(t) !== 0 && (V("KeyframeTrack: Invalid value size in track.", this), e = !1);
		let n = this.times, r = this.values, i = n.length;
		i === 0 && (V("KeyframeTrack: Track is empty.", this), e = !1);
		let a = null;
		for (let t = 0; t !== i; t++) {
			let r = n[t];
			if (typeof r == "number" && isNaN(r)) {
				V("KeyframeTrack: Time is not a valid number.", this, t, r), e = !1;
				break;
			}
			if (a !== null && a > r) {
				V("KeyframeTrack: Out of order keys.", this, t, r, a), e = !1;
				break;
			}
			a = r;
		}
		if (r !== void 0 && R(r)) for (let t = 0, n = r.length; t !== n; ++t) {
			let n = r[t];
			if (isNaN(n)) {
				V("KeyframeTrack: Value is not a valid number.", this, t, n), e = !1;
				break;
			}
		}
		return e;
	}
	optimize() {
		let e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), r = this.getInterpolation() === C, i = e.length - 1, a = 1;
		for (let o = 1; o < i; ++o) {
			let i = !1, s = e[o];
			if (s !== e[o + 1] && (o !== 1 || s !== e[0])) {
				if (r) i = !0;
				else {
					let e = o * n, r = e - n, a = e + n;
					for (let o = 0; o !== n; ++o) {
						let n = t[e + o];
						if (n !== t[r + o] || n !== t[a + o]) {
							i = !0;
							break;
						}
					}
				}
			}
			if (i) {
				if (o !== a) {
					e[a] = e[o];
					let r = o * n, i = a * n;
					for (let e = 0; e !== n; ++e) t[i + e] = t[r + e];
				}
				++a;
			}
		}
		if (i > 0) {
			e[a] = e[i];
			for (let e = i * n, r = a * n, o = 0; o !== n; ++o) t[r + o] = t[e + o];
			++a;
		}
		return a === e.length ? (this.times = e, this.values = t) : (this.times = e.slice(0, a), this.values = t.slice(0, a * n)), this;
	}
	clone() {
		let e = this.times.slice(), t = this.values.slice(), n = this.constructor, r = new n(this.name, e, t);
		return r.createInterpolant = this.createInterpolant, vr(this.settings) && (r.settings = {
			inTangents: this.settings.inTangents.slice(),
			outTangents: this.settings.outTangents.slice()
		}), r;
	}
};
function Or(e, t) {
	for (let n = 0, r = e.length; n !== r; n += 2) e[n] += t;
}
function kr(e, t) {
	for (let n = 0, r = e.length; n !== r; n += 2) e[n] *= t;
}
Dr.prototype.ValueTypeName = "", Dr.prototype.TimeBufferType = Float32Array, Dr.prototype.ValueBufferType = Float32Array, Dr.prototype.DefaultInterpolation = S;
var Ar = class extends Dr {
	constructor(e, t, n) {
		super(e, t, n);
	}
};
Ar.prototype.ValueTypeName = "bool", Ar.prototype.ValueBufferType = Array, Ar.prototype.DefaultInterpolation = x, Ar.prototype.InterpolantFactoryMethodLinear = void 0, Ar.prototype.InterpolantFactoryMethodSmooth = void 0;
var jr = class extends Dr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
};
jr.prototype.ValueTypeName = "color";
var Mr = class extends Dr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
};
Mr.prototype.ValueTypeName = "number";
var Nr = class extends yr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = (n - t) / (r - t), c = e * o;
		for (let e = c + o; c !== e; c += 4) _e.slerpFlat(i, 0, a, c - o, a, c, s);
		return i;
	}
}, Pr = class extends Dr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	InterpolantFactoryMethodLinear(e) {
		return new Nr(this.times, this.values, this.getValueSize(), e);
	}
};
Pr.prototype.ValueTypeName = "quaternion", Pr.prototype.InterpolantFactoryMethodSmooth = void 0;
var Fr = class extends Dr {
	constructor(e, t, n) {
		super(e, t, n);
	}
};
Fr.prototype.ValueTypeName = "string", Fr.prototype.ValueBufferType = Array, Fr.prototype.DefaultInterpolation = x, Fr.prototype.InterpolantFactoryMethodLinear = void 0, Fr.prototype.InterpolantFactoryMethodSmooth = void 0;
var Ir = class extends Dr {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
};
Ir.prototype.ValueTypeName = "vector";
var Lr = /*@__PURE__*/ new G(), Rr = /*@__PURE__*/ new _e(), zr = /*@__PURE__*/ new G(), Br = class extends ct {
	constructor() {
		super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Le(), this.projectionMatrix = new Le(), this.projectionMatrixInverse = new Le(), this.coordinateSystem = I, this._reversedDepth = !1;
	}
	get reversedDepth() {
		return this._reversedDepth;
	}
	copy(e, t) {
		return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
	}
	getWorldDirection(e) {
		return super.getWorldDirection(e).negate();
	}
	updateMatrixWorld(e) {
		super.updateMatrixWorld(e), this.matrixWorld.decompose(Lr, Rr, zr), zr.x === 1 && zr.y === 1 && zr.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(Lr, Rr, zr.set(1, 1, 1)).invert();
	}
	updateWorldMatrix(e, t, n = !1) {
		super.updateWorldMatrix(e, t, n), this.matrixWorld.decompose(Lr, Rr, zr), zr.x === 1 && zr.y === 1 && zr.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(Lr, Rr, zr.set(1, 1, 1)).invert();
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, Vr = /*@__PURE__*/ new G(), Hr = /*@__PURE__*/ new W(), Ur = /*@__PURE__*/ new W(), Wr = class extends Br {
	constructor(e = 50, t = 1, n = .1, r = 2e3) {
		super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = r, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
	}
	copy(e, t) {
		return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
	}
	setFocalLength(e) {
		let t = .5 * this.getFilmHeight() / e;
		this.fov = le * 2 * Math.atan(t), this.updateProjectionMatrix();
	}
	getFocalLength() {
		let e = Math.tan(H * .5 * this.fov);
		return .5 * this.getFilmHeight() / e;
	}
	getEffectiveFOV() {
		return le * 2 * Math.atan(Math.tan(H * .5 * this.fov) / this.zoom);
	}
	getFilmWidth() {
		return this.filmGauge * Math.min(this.aspect, 1);
	}
	getFilmHeight() {
		return this.filmGauge / Math.max(this.aspect, 1);
	}
	getViewBounds(e, t, n) {
		Vr.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse), t.set(Vr.x, Vr.y).multiplyScalar(-e / Vr.z), Vr.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse), n.set(Vr.x, Vr.y).multiplyScalar(-e / Vr.z);
	}
	getViewSize(e, t) {
		return this.getViewBounds(e, Hr, Ur), t.subVectors(Ur, Hr);
	}
	setViewOffset(e, t, n, r, i, a) {
		this.aspect = e / t, this.view === null && (this.view = {
			enabled: !0,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		}), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = i, this.view.height = a, this.updateProjectionMatrix();
	}
	clearViewOffset() {
		this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
	}
	updateProjectionMatrix() {
		let e = this.near, t = e * Math.tan(H * .5 * this.fov) / this.zoom, n = 2 * t, r = this.aspect * n, i = -.5 * r, a = this.view;
		if (this.view !== null && this.view.enabled) {
			let e = a.fullWidth, o = a.fullHeight;
			i += a.offsetX * r / e, t -= a.offsetY * n / o, r *= a.width / e, n *= a.height / o;
		}
		let o = this.filmOffset;
		o !== 0 && (i += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(i, i + r, t, t - n, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
	}
}, Gr = class extends Br {
	constructor(e = -1, t = 1, n = 1, r = -1, i = .1, a = 2e3) {
		super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = r, this.near = i, this.far = a, this.updateProjectionMatrix();
	}
	copy(e, t) {
		return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
	}
	setViewOffset(e, t, n, r, i, a) {
		this.view === null && (this.view = {
			enabled: !0,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		}), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = i, this.view.height = a, this.updateProjectionMatrix();
	}
	clearViewOffset() {
		this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
	}
	updateProjectionMatrix() {
		let e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2, i = n - e, a = n + e, o = r + t, s = r - t;
		if (this.view !== null && this.view.enabled) {
			let e = (this.right - this.left) / this.view.fullWidth / this.zoom, t = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
			i += e * this.view.offsetX, a = i + e * this.view.width, o -= t * this.view.offsetY, s = o - t * this.view.height;
		}
		this.projectionMatrix.makeOrthographic(i, a, o, s, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
	}
}, Kr = class extends pn {
	constructor() {
		super(), this.isInstancedBufferGeometry = !0, this.type = "InstancedBufferGeometry", this.instanceCount = Infinity;
	}
	copy(e) {
		return super.copy(e), this.instanceCount = e.instanceCount, this;
	}
	toJSON() {
		let e = super.toJSON();
		return e.instanceCount = this.instanceCount, e.isInstancedBufferGeometry = !0, e;
	}
}, qr = -90, Jr = 1, Yr = class extends ct {
	constructor(e, t, n) {
		super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
		let r = new Wr(qr, Jr, e, t);
		r.layers = this.layers, this.add(r);
		let i = new Wr(qr, Jr, e, t);
		i.layers = this.layers, this.add(i);
		let a = new Wr(qr, Jr, e, t);
		a.layers = this.layers, this.add(a);
		let o = new Wr(qr, Jr, e, t);
		o.layers = this.layers, this.add(o);
		let s = new Wr(qr, Jr, e, t);
		s.layers = this.layers, this.add(s);
		let c = new Wr(qr, Jr, e, t);
		c.layers = this.layers, this.add(c);
	}
	updateCoordinateSystem() {
		let e = this.coordinateSystem, t = this.children.concat(), [n, r, i, a, o, s] = t;
		for (let e of t) this.remove(e);
		if (e === 2e3) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), i.up.set(0, 0, -1), i.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), s.up.set(0, 1, 0), s.lookAt(0, 0, -1);
		else if (e === 2001) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), i.up.set(0, 0, 1), i.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), s.up.set(0, -1, 0), s.lookAt(0, 0, -1);
		else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
		for (let e of t) this.add(e), e.updateMatrixWorld();
	}
	update(e, t) {
		this.parent === null && this.updateMatrixWorld();
		let { renderTarget: n, activeMipmapLevel: r } = this;
		this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
		let [i, a, o, s, c, l] = this.children, u = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), p = e.xr.enabled;
		e.xr.enabled = !1;
		let m = n.texture.mipmapsAutoUpdate;
		n.texture.mipmapsAutoUpdate = !1;
		let h = !1;
		h = e.isWebGLRenderer === !0 ? e.state.buffers.depth.getReversed() : e.reversedDepthBuffer, e.setRenderTarget(n, 0, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, i), e.setRenderTarget(n, 1, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, a), e.setRenderTarget(n, 2, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, o), e.setRenderTarget(n, 3, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, s), e.setRenderTarget(n, 4, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, c), n.texture.mipmapsAutoUpdate = m, e.setRenderTarget(n, 5, r), h && e.autoClear === !1 && e.clearDepth(), e.render(t, l), e.setRenderTarget(u, d, f), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0;
	}
}, Xr = class extends Wr {
	constructor(e = []) {
		super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e, this.perCameraFrustumCulled = !1;
	}
}, Zr = "\\[\\]\\.:\\/", Qr = /* @__PURE__ */ RegExp("[\\[\\]\\.:\\/]", "g"), $r = "[^\\[\\]\\.:\\/]", ei = "[^" + Zr.replace("\\.", "") + "]", ti = /*@__PURE__*/ "((?:WC+[\\/:])*)".replace("WC", $r), ni = /*@__PURE__*/ "(WCOD+)?".replace("WCOD", ei), ri = /*@__PURE__*/ "(?:\\.(WC+)(?:\\[(.+)\\])?)?".replace("WC", $r), ii = /*@__PURE__*/ "\\.(WC+)(?:\\[(.+)\\])?".replace("WC", $r), ai = RegExp("^" + ti + ni + ri + ii + "$"), oi = [
	"material",
	"materials",
	"bones",
	"map"
], si = class {
	constructor(e, t, n) {
		let r = n || ci.parseTrackName(t);
		this._targetGroup = e, this._bindings = e.subscribe_(t, r);
	}
	getValue(e, t) {
		this.bind();
		let n = this._targetGroup.nCachedObjects_, r = this._bindings[n];
		r !== void 0 && r.getValue(e, t);
	}
	setValue(e, t) {
		let n = this._bindings;
		for (let r = this._targetGroup.nCachedObjects_, i = n.length; r !== i; ++r) n[r].setValue(e, t);
	}
	bind() {
		let e = this._bindings;
		for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind();
	}
	unbind() {
		let e = this._bindings;
		for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind();
	}
}, ci = class e {
	constructor(t, n, r) {
		this.path = n, this.parsedPath = r || e.parseTrackName(n), this.node = e.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
	}
	static create(t, n, r) {
		return t && t.isAnimationObjectGroup ? new e.Composite(t, n, r) : new e(t, n, r);
	}
	static sanitizeNodeName(e) {
		return e.replace(/\s/g, "_").replace(Qr, "");
	}
	static parseTrackName(e) {
		let t = ai.exec(e);
		if (t === null) throw Error("THREE.PropertyBinding: Cannot parse trackName: " + e);
		let n = {
			nodeName: t[2],
			objectName: t[3],
			objectIndex: t[4],
			propertyName: t[5],
			propertyIndex: t[6]
		}, r = n.nodeName && n.nodeName.lastIndexOf(".");
		if (r !== void 0 && r !== -1) {
			let e = n.nodeName.substring(r + 1);
			oi.indexOf(e) !== -1 && (n.nodeName = n.nodeName.substring(0, r), n.objectName = e);
		}
		if (n.propertyName === null || n.propertyName.length === 0) throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: " + e);
		return n;
	}
	static findNode(e, t) {
		if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid) return e;
		if (e.skeleton) {
			let n = e.skeleton.getBoneByName(t);
			if (n !== void 0) return n;
		}
		if (e.children) {
			let n = function(e) {
				for (let r = 0; r < e.length; r++) {
					let i = e[r];
					if (i.name === t || i.uuid === t) return i;
					let a = n(i.children);
					if (a) return a;
				}
				return null;
			}, r = n(e.children);
			if (r) return r;
		}
		return null;
	}
	_getValue_unavailable() {}
	_setValue_unavailable() {}
	_getValue_direct(e, t) {
		e[t] = this.targetObject[this.propertyName];
	}
	_getValue_array(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) e[t++] = n[r];
	}
	_getValue_arrayElement(e, t) {
		e[t] = this.resolvedProperty[this.propertyIndex];
	}
	_getValue_toArray(e, t) {
		this.resolvedProperty.toArray(e, t);
	}
	_setValue_direct(e, t) {
		this.targetObject[this.propertyName] = e[t];
	}
	_setValue_direct_setNeedsUpdate(e, t) {
		this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0;
	}
	_setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
		this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_array(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
	}
	_setValue_array_setNeedsUpdate(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
		this.targetObject.needsUpdate = !0;
	}
	_setValue_array_setMatrixWorldNeedsUpdate(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
		this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_arrayElement(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t];
	}
	_setValue_arrayElement_setNeedsUpdate(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0;
	}
	_setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_fromArray(e, t) {
		this.resolvedProperty.fromArray(e, t);
	}
	_setValue_fromArray_setNeedsUpdate(e, t) {
		this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0;
	}
	_setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
		this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_getValue_unbound(e, t) {
		this.bind(), this.getValue(e, t);
	}
	_setValue_unbound(e, t) {
		this.bind(), this.setValue(e, t);
	}
	bind() {
		let t = this.node, n = this.parsedPath, r = n.objectName, i = n.propertyName, a = n.propertyIndex;
		if (t || (t = e.findNode(this.rootNode, n.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
			B("PropertyBinding: No target node found for track: " + this.path + ".");
			return;
		}
		if (r) {
			let e = n.objectIndex;
			switch (r) {
				case "materials":
					if (!t.material) {
						V("PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!t.material.materials) {
						V("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
						return;
					}
					t = t.material.materials;
					break;
				case "bones":
					if (!t.skeleton) {
						V("PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
						return;
					}
					t = t.skeleton.bones;
					for (let n = 0; n < t.length; n++) if (t[n].name === e) {
						e = n;
						break;
					}
					break;
				case "map":
					if ("map" in t) {
						t = t.map;
						break;
					}
					if (!t.material) {
						V("PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!t.material.map) {
						V("PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
						return;
					}
					t = t.material.map;
					break;
				default:
					if (t[r] === void 0) {
						V("PropertyBinding: Can not bind to objectName of node undefined.", this);
						return;
					}
					t = t[r];
			}
			if (e !== void 0) {
				if (t[e] === void 0) {
					V("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
					return;
				}
				t = t[e];
			}
		}
		let o = t[i];
		if (o === void 0) {
			let e = n.nodeName;
			V("PropertyBinding: Trying to update property for track: " + e + "." + i + " but it wasn't found.", t);
			return;
		}
		let s = this.Versioning.None;
		this.targetObject = t, t.isMaterial === !0 ? s = this.Versioning.NeedsUpdate : t.isObject3D === !0 && (s = this.Versioning.MatrixWorldNeedsUpdate);
		let c = this.BindingType.Direct;
		if (a !== void 0) {
			if (i === "morphTargetInfluences") {
				if (!t.geometry) {
					V("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
					return;
				}
				if (!t.geometry.morphAttributes) {
					V("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
					return;
				}
				t.morphTargetDictionary[a] !== void 0 && (a = t.morphTargetDictionary[a]);
			}
			c = this.BindingType.ArrayElement, this.resolvedProperty = o, this.propertyIndex = a;
		} else o.fromArray !== void 0 && o.toArray !== void 0 ? (c = this.BindingType.HasFromToArray, this.resolvedProperty = o) : Array.isArray(o) ? (c = this.BindingType.EntireArray, this.resolvedProperty = o) : this.propertyName = i;
		this.getValue = this.GetterByBindingType[c], this.setValue = this.SetterByBindingTypeAndVersioning[c][s];
	}
	unbind() {
		this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
	}
};
ci.Composite = si, ci.prototype.BindingType = {
	Direct: 0,
	EntireArray: 1,
	ArrayElement: 2,
	HasFromToArray: 3
}, ci.prototype.Versioning = {
	None: 0,
	NeedsUpdate: 1,
	MatrixWorldNeedsUpdate: 2
}, ci.prototype.GetterByBindingType = [
	ci.prototype._getValue_direct,
	ci.prototype._getValue_array,
	ci.prototype._getValue_arrayElement,
	ci.prototype._getValue_toArray
], ci.prototype.SetterByBindingTypeAndVersioning = [
	[
		ci.prototype._setValue_direct,
		ci.prototype._setValue_direct_setNeedsUpdate,
		ci.prototype._setValue_direct_setMatrixWorldNeedsUpdate
	],
	[
		ci.prototype._setValue_array,
		ci.prototype._setValue_array_setNeedsUpdate,
		ci.prototype._setValue_array_setMatrixWorldNeedsUpdate
	],
	[
		ci.prototype._setValue_arrayElement,
		ci.prototype._setValue_arrayElement_setNeedsUpdate,
		ci.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
	],
	[
		ci.prototype._setValue_fromArray,
		ci.prototype._setValue_fromArray_setNeedsUpdate,
		ci.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
	]
];
var li = class extends mn {
	constructor(e, t, n = 1) {
		super(e, t), this.isInstancedInterleavedBuffer = !0, this.meshPerAttribute = n;
	}
	copy(e) {
		return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
	}
	clone(e) {
		let t = super.clone(e);
		return t.meshPerAttribute = this.meshPerAttribute, t;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.isInstancedInterleavedBuffer = !0, t.meshPerAttribute = this.meshPerAttribute, t;
	}
};
(class {
	static {
		this.prototype.isMatrix2 = !0;
	}
	constructor(e, t, n, r) {
		this.elements = [
			1,
			0,
			0,
			1
		], e !== void 0 && this.set(e, t, n, r);
	}
	identity() {
		return this.set(1, 0, 0, 1), this;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 4; n++) this.elements[n] = e[n + t];
		return this;
	}
	set(e, t, n, r) {
		let i = this.elements;
		return i[0] = e, i[2] = t, i[1] = n, i[3] = r, this;
	}
});
function ui(e, t, n, r) {
	let i = di(r);
	switch (n) {
		case 1021: return e * t;
		case 1028: return e * t / i.components * i.byteLength;
		case _: return e * t / i.components * i.byteLength;
		case v: return e * t * 2 / i.components * i.byteLength;
		case y: return e * t * 2 / i.components * i.byteLength;
		case 1022: return e * t * 3 / i.components * i.byteLength;
		case m: return e * t * 4 / i.components * i.byteLength;
		case b: return e * t * 4 / i.components * i.byteLength;
		case 33776:
		case 33777: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
		case 33778:
		case 33779: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
		case 35841:
		case 35843: return Math.max(e, 16) * Math.max(t, 8) / 4;
		case 35840:
		case 35842: return Math.max(e, 8) * Math.max(t, 8) / 2;
		case 36196:
		case 37492:
		case 37488:
		case 37489: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
		case 37496:
		case 37490:
		case 37491: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
		case 37808: return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
		case 37809: return Math.floor((e + 4) / 5) * Math.floor((t + 3) / 4) * 16;
		case 37810: return Math.floor((e + 4) / 5) * Math.floor((t + 4) / 5) * 16;
		case 37811: return Math.floor((e + 5) / 6) * Math.floor((t + 4) / 5) * 16;
		case 37812: return Math.floor((e + 5) / 6) * Math.floor((t + 5) / 6) * 16;
		case 37813: return Math.floor((e + 7) / 8) * Math.floor((t + 4) / 5) * 16;
		case 37814: return Math.floor((e + 7) / 8) * Math.floor((t + 5) / 6) * 16;
		case 37815: return Math.floor((e + 7) / 8) * Math.floor((t + 7) / 8) * 16;
		case 37816: return Math.floor((e + 9) / 10) * Math.floor((t + 4) / 5) * 16;
		case 37817: return Math.floor((e + 9) / 10) * Math.floor((t + 5) / 6) * 16;
		case 37818: return Math.floor((e + 9) / 10) * Math.floor((t + 7) / 8) * 16;
		case 37819: return Math.floor((e + 9) / 10) * Math.floor((t + 9) / 10) * 16;
		case 37820: return Math.floor((e + 11) / 12) * Math.floor((t + 9) / 10) * 16;
		case 37821: return Math.floor((e + 11) / 12) * Math.floor((t + 11) / 12) * 16;
		case 36492:
		case 36494:
		case 36495: return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
		case 36283:
		case 36284: return Math.ceil(e / 4) * Math.ceil(t / 4) * 8;
		case 36285:
		case 36286: return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
	}
	throw Error(`Unable to determine texture byte length for ${n} format.`);
}
function di(e) {
	switch (e) {
		case o:
		case 1010: return {
			byteLength: 1,
			components: 1
		};
		case s:
		case 1011:
		case u: return {
			byteLength: 2,
			components: 1
		};
		case d:
		case f: return {
			byteLength: 2,
			components: 4
		};
		case c:
		case 1013:
		case l: return {
			byteLength: 4,
			components: 1
		};
		case 35902:
		case 35899: return {
			byteLength: 4,
			components: 3
		};
	}
	throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "187" } })), typeof window < "u" && (window.__THREE__ ? B("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "187");
// ../../node_modules/three/build/three.module.js
function fi() {
	let e = null, t = !1, n = null, r = null;
	function i(t, a) {
		r = e.requestAnimationFrame(i), n(t, a);
	}
	return {
		start: function() {
			t !== !0 && n !== null && e !== null && (r = e.requestAnimationFrame(i), t = !0);
		},
		stop: function() {
			e !== null && e.cancelAnimationFrame(r), t = !1;
		},
		setAnimationLoop: function(e) {
			n = e;
		},
		setContext: function(t) {
			e = t;
		}
	};
}
function pi(e) {
	let t = /* @__PURE__ */ new WeakMap();
	function n(t, n) {
		let r = t.array, i = t.usage, a = r.byteLength, o = e.createBuffer();
		e.bindBuffer(n, o), e.bufferData(n, r, i), t.onUploadCallback();
		let s;
		if (r instanceof Float32Array) s = e.FLOAT;
		else if (typeof Float16Array < "u" && r instanceof Float16Array) s = e.HALF_FLOAT;
		else if (r instanceof Uint16Array) s = t.isFloat16BufferAttribute ? e.HALF_FLOAT : e.UNSIGNED_SHORT;
		else if (r instanceof Int16Array) s = e.SHORT;
		else if (r instanceof Uint32Array) s = e.UNSIGNED_INT;
		else if (r instanceof Int32Array) s = e.INT;
		else if (r instanceof Int8Array) s = e.BYTE;
		else if (r instanceof Uint8Array) s = e.UNSIGNED_BYTE;
		else if (r instanceof Uint8ClampedArray) s = e.UNSIGNED_BYTE;
		else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: " + r);
		return {
			buffer: o,
			type: s,
			bytesPerElement: r.BYTES_PER_ELEMENT,
			version: t.version,
			size: a
		};
	}
	function r(t, n, r) {
		let i = n.array, a = n.updateRanges;
		if (e.bindBuffer(r, t), a.length === 0) e.bufferSubData(r, 0, i);
		else {
			a.sort((e, t) => e.start - t.start);
			let t = 0;
			for (let e = 1; e < a.length; e++) {
				let n = a[t], r = a[e];
				r.start <= n.start + n.count + 1 ? n.count = Math.max(n.count, r.start + r.count - n.start) : (++t, a[t] = r);
			}
			a.length = t + 1;
			for (let t = 0, n = a.length; t < n; t++) {
				let n = a[t];
				e.bufferSubData(r, n.start * i.BYTES_PER_ELEMENT, i, n.start, n.count);
			}
			n.clearUpdateRanges();
		}
		n.onUploadCallback();
	}
	function i(e) {
		return e.isInterleavedBufferAttribute && (e = e.data), t.get(e);
	}
	function a(n) {
		n.isInterleavedBufferAttribute && (n = n.data);
		let r = t.get(n);
		r && (e.deleteBuffer(r.buffer), t.delete(n));
	}
	function o(e, i) {
		if (e.isInterleavedBufferAttribute && (e = e.data), e.isGLBufferAttribute) {
			let n = t.get(e);
			(!n || n.version < e.version) && t.set(e, {
				buffer: e.buffer,
				type: e.type,
				bytesPerElement: e.elementSize,
				version: e.version
			});
			return;
		}
		let a = t.get(e);
		if (a === void 0) t.set(e, n(e, i));
		else if (a.version < e.version) {
			if (a.size !== e.array.byteLength) throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
			r(a.buffer, e, i), a.version = e.version;
		}
	}
	return {
		get: i,
		remove: a,
		update: o
	};
}
var Q = {
	alphahash_fragment: "#ifdef USE_ALPHAHASH\n	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;\n#endif",
	alphahash_pars_fragment: "#ifdef USE_ALPHAHASH\n	const float ALPHA_HASH_SCALE = 0.05;\n	float hash2D( vec2 value ) {\n		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );\n	}\n	float hash3D( vec3 value ) {\n		return hash2D( vec2( hash2D( value.xy ), value.z ) );\n	}\n	float getAlphaHashThreshold( vec3 position ) {\n		float maxDeriv = max(\n			length( dFdx( position.xyz ) ),\n			length( dFdy( position.xyz ) )\n		);\n		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );\n		vec2 pixScales = vec2(\n			exp2( floor( log2( pixScale ) ) ),\n			exp2( ceil( log2( pixScale ) ) )\n		);\n		vec2 alpha = vec2(\n			hash3D( floor( pixScales.x * position.xyz ) ),\n			hash3D( floor( pixScales.y * position.xyz ) )\n		);\n		float lerpFactor = fract( log2( pixScale ) );\n		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;\n		float a = min( lerpFactor, 1.0 - lerpFactor );\n		vec3 cases = vec3(\n			x * x / ( 2.0 * a * ( 1.0 - a ) ),\n			( x - 0.5 * a ) / ( 1.0 - a ),\n			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )\n		);\n		float threshold = ( x < ( 1.0 - a ) )\n			? ( ( x < a ) ? cases.x : cases.y )\n			: cases.z;\n		return clamp( threshold , 1.0e-6, 1.0 );\n	}\n#endif",
	alphamap_fragment: "#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;\n#endif",
	alphamap_pars_fragment: "#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif",
	alphatest_fragment: "#ifdef USE_ALPHATEST\n	#ifdef ALPHA_TO_COVERAGE\n	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );\n	if ( diffuseColor.a == 0.0 ) discard;\n	#else\n	if ( diffuseColor.a < alphaTest ) discard;\n	#endif\n#endif",
	alphatest_pars_fragment: "#ifdef USE_ALPHATEST\n	uniform float alphaTest;\n#endif",
	aomap_fragment: "#ifdef USE_AOMAP\n	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;\n	reflectedLight.indirectDiffuse *= ambientOcclusion;\n	#if defined( USE_CLEARCOAT ) \n		clearcoatSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_SHEEN ) \n		sheenSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( STANDARD )\n		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n	#endif\n#endif",
	aomap_pars_fragment: "#ifdef USE_AOMAP\n	uniform sampler2D aoMap;\n	uniform float aoMapIntensity;\n#endif",
	batching_pars_vertex: "#ifdef USE_BATCHING\n	#if ! defined( GL_ANGLE_multi_draw )\n	#define gl_DrawID _gl_DrawID\n	uniform int _gl_DrawID;\n	#endif\n	uniform highp sampler2D batchingTexture;\n	uniform highp usampler2D batchingIdTexture;\n	mat4 getBatchingMatrix( const in float i ) {\n		int size = textureSize( batchingTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n	float getIndirectIndex( const in int i ) {\n		int size = textureSize( batchingIdTexture, 0 ).x;\n		int x = i % size;\n		int y = i / size;\n		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );\n	}\n#endif\n#ifdef USE_BATCHING_COLOR\n	uniform sampler2D batchingColorTexture;\n	vec4 getBatchingColor( const in float i ) {\n		int size = textureSize( batchingColorTexture, 0 ).x;\n		int j = int( i );\n		int x = j % size;\n		int y = j / size;\n		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );\n	}\n#endif",
	batching_vertex: "#ifdef USE_BATCHING\n	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );\n#endif",
	begin_vertex: "vec3 transformed = vec3( position );\n#ifdef USE_ALPHAHASH\n	vPosition = vec3( position );\n#endif",
	beginnormal_vertex: "vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n	vec3 objectTangent = vec3( tangent.xyz );\n#endif",
	bsdfs: "float G_BlinnPhong_Implicit( ) {\n	return 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( specularColor, 1.0, dotVH );\n	float G = G_BlinnPhong_Implicit( );\n	float D = D_BlinnPhong( shininess, dotNH );\n	return F * ( G * D );\n} // validated",
	iridescence_fragment: "#ifdef USE_IRIDESCENCE\n	const mat3 XYZ_TO_REC709 = mat3(\n		 3.2404542, -0.9692660,  0.0556434,\n		-1.5371385,  1.8760108, -0.2040259,\n		-0.4985314,  0.0415560,  1.0572252\n	);\n	vec3 Fresnel0ToIor( vec3 fresnel0 ) {\n		vec3 sqrtF0 = sqrt( fresnel0 );\n		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );\n	}\n	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );\n	}\n	float IorToFresnel0( float transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));\n	}\n	vec3 evalSensitivity( float OPD, vec3 shift ) {\n		float phase = 2.0 * PI * OPD * 1.0e-9;\n		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );\n		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );\n		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );\n		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );\n		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );\n		xyz /= 1.0685e-7;\n		vec3 rgb = XYZ_TO_REC709 * xyz;\n		return rgb;\n	}\n	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {\n		vec3 I;\n		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );\n		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );\n		float cosTheta2Sq = 1.0 - sinTheta2Sq;\n		if ( cosTheta2Sq < 0.0 ) {\n			return vec3( 1.0 );\n		}\n		float cosTheta2 = sqrt( cosTheta2Sq );\n		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );\n		float R12 = F_Schlick( R0, 1.0, cosTheta1 );\n		float T121 = 1.0 - R12;\n		float phi12 = 0.0;\n		if ( iridescenceIOR < outsideIOR ) phi12 = PI;\n		float phi21 = PI - phi12;\n		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );\n		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );\n		vec3 phi23 = vec3( 0.0 );\n		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;\n		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;\n		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;\n		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;\n		vec3 phi = vec3( phi21 ) + phi23;\n		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );\n		vec3 r123 = sqrt( R123 );\n		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );\n		vec3 C0 = R12 + Rs;\n		I = C0;\n		vec3 Cm = Rs - T121;\n		for ( int m = 1; m <= 2; ++ m ) {\n			Cm *= r123;\n			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );\n			I += Cm * Sm;\n		}\n		return max( I, vec3( 0.0 ) );\n	}\n#endif",
	bumpmap_pars_fragment: "#ifdef USE_BUMPMAP\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n	vec2 dHdxy_fwd() {\n		vec2 dSTdx = dFdx( vBumpMapUv );\n		vec2 dSTdy = dFdy( vBumpMapUv );\n		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;\n		return vec2( dBx, dBy );\n	}\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {\n		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );\n		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );\n		vec3 vN = surf_norm;\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n		float fDet = dot( vSigmaX, R1 ) * faceDirection;\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n	}\n#endif",
	clipping_planes_fragment: "#if NUM_CLIPPING_PLANES > 0\n	vec4 plane;\n	#ifdef ALPHA_TO_COVERAGE\n		float distanceToPlane, distanceGradient;\n		float clipOpacity = 1.0;\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n			distanceGradient = fwidth( distanceToPlane ) / 2.0;\n			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			if ( clipOpacity == 0.0 ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			float unionClipOpacity = 1.0;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n				distanceGradient = fwidth( distanceToPlane ) / 2.0;\n				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			}\n			#pragma unroll_loop_end\n			clipOpacity *= 1.0 - unionClipOpacity;\n		#endif\n		diffuseColor.a *= clipOpacity;\n		if ( diffuseColor.a == 0.0 ) discard;\n	#else\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			bool clipped = true;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n			}\n			#pragma unroll_loop_end\n			if ( clipped ) discard;\n		#endif\n	#endif\n#endif",
	clipping_planes_pars_fragment: "#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif",
	clipping_planes_pars_vertex: "#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n#endif",
	clipping_planes_vertex: "#if NUM_CLIPPING_PLANES > 0\n	vClipPosition = - mvPosition.xyz;\n#endif",
	color_fragment: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n	diffuseColor *= vColor;\n#endif",
	color_pars_fragment: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n	varying vec4 vColor;\n#endif",
	color_pars_vertex: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )\n	varying vec4 vColor;\n#endif",
	color_vertex: "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )\n	vColor = vec4( 1.0 );\n#endif\n#ifdef USE_COLOR_ALPHA\n	vColor *= color;\n#elif defined( USE_COLOR )\n	vColor.rgb *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n	vColor.rgb *= instanceColor.rgb;\n#endif\n#ifdef USE_BATCHING_COLOR\n	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );\n#endif",
	common: "#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement( a ) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nvec3 pow2( const in vec3 x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }\nfloat average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }\nhighp float rand( const in vec2 uv ) {\n	const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n	return fract( sin( sn ) * c );\n}\n#ifdef HIGH_PRECISION\n	float precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n	float precisionSafeLength( vec3 v ) {\n		float maxComponent = max3( abs( v ) );\n		return length( v / maxComponent ) * maxComponent;\n	}\n#endif\nstruct IncidentLight {\n	vec3 color;\n	vec3 direction;\n	bool visible;\n};\nstruct ReflectedLight {\n	vec3 directDiffuse;\n	vec3 directSpecular;\n	vec3 indirectDiffuse;\n	vec3 indirectSpecular;\n};\n#ifdef USE_ALPHAHASH\n	varying vec3 vPosition;\n#endif\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\n#define inverseTransformDirection transformDirectionByInverseViewMatrix\nvec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {\n	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );\n}\nvec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {\n	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n	return m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n	return vec2( u, v );\n}\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n	return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n}\nfloat F_Schlick( const in float f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n} // validated",
	defaultnormal_vertex: "vec3 transformedNormal = objectNormal;\n#ifdef USE_TANGENT\n	vec3 transformedTangent = objectTangent;\n#endif\n#ifdef USE_BATCHING\n	mat3 bm = mat3( batchingMatrix );\n	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );\n	transformedNormal = bm * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = bm * transformedTangent;\n	#endif\n#endif\n#ifdef USE_INSTANCING\n	mat3 im = mat3( instanceMatrix );\n	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );\n	transformedNormal = im * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = im * transformedTangent;\n	#endif\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n	transformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;\n#endif",
	displacementmap_pars_vertex: "#ifdef USE_DISPLACEMENTMAP\n	uniform sampler2D displacementMap;\n	uniform float displacementScale;\n	uniform float displacementBias;\n#endif",
	displacementmap_vertex: "#ifdef USE_DISPLACEMENTMAP\n	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );\n#endif",
	emissivemap_fragment: "#ifdef USE_EMISSIVEMAP\n	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE\n		emissiveColor = sRGBTransferEOTF( emissiveColor );\n	#endif\n	totalEmissiveRadiance *= emissiveColor.rgb;\n#endif",
	emissivemap_pars_fragment: "#ifdef USE_EMISSIVEMAP\n	uniform sampler2D emissiveMap;\n#endif",
	colorspace_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
	colorspace_pars_fragment: "vec4 LinearTransferOETF( in vec4 value ) {\n	return value;\n}\nvec4 sRGBTransferEOTF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );\n}\nvec4 sRGBTransferOETF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}",
	envmap_fragment: "#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vec3 cameraToFrag;\n		if ( isOrthographic ) {\n			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToFrag = normalize( vWorldPosition - cameraPosition );\n		}\n		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vec3 reflectVec = reflect( cameraToFrag, worldNormal );\n		#else\n			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n		#endif\n	#else\n		vec3 reflectVec = vReflect;\n	#endif\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );\n		#ifdef ENVMAP_BLENDING_MULTIPLY\n			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n		#elif defined( ENVMAP_BLENDING_MIX )\n			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n		#elif defined( ENVMAP_BLENDING_ADD )\n			outgoingLight += envColor.xyz * specularStrength * reflectivity;\n		#endif\n	#endif\n#endif",
	envmap_common_pars_fragment: "#ifdef USE_ENVMAP\n	uniform float envMapIntensity;\n	uniform mat3 envMapRotation;\n	uniform samplerCube envMap;\n	#ifdef ENVMAP_TYPE_PMREM\n		float roughnessToMip( const in float roughness ) {\n			float r = clamp( roughness, 0.0, 1.0 );\n			return ENVMAP_MAX_LOD * r * ( 2.0 - r );\n		}\n	#endif\n#endif",
	envmap_pars_fragment: "#ifdef USE_ENVMAP\n	uniform float reflectivity;\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		varying vec3 vWorldPosition;\n		uniform float refractionRatio;\n	#else\n		varying vec3 vReflect;\n	#endif\n#endif",
	envmap_pars_vertex: "#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		\n		varying vec3 vWorldPosition;\n	#else\n		varying vec3 vReflect;\n		uniform float refractionRatio;\n	#endif\n#endif",
	envmap_physical_pars_fragment: "#ifdef USE_ENVMAP\n	vec3 getIBLIrradiance( const in vec3 normal ) {\n		#ifdef ENVMAP_TYPE_PMREM\n			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );\n			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );\n			return PI * envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n		#ifdef ENVMAP_TYPE_PMREM\n			vec3 reflectVec = reflect( - viewDir, normal );\n			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );\n			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );\n			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );\n			return envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	#ifdef USE_RETROREFLECTION\n		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n			#ifdef ENVMAP_TYPE_PMREM\n				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );\n				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );\n				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );\n				return envMapColor.rgb * envMapIntensity;\n			#else\n				return vec3( 0.0 );\n			#endif\n		}\n	#endif\n	#ifdef USE_ANISOTROPY\n		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {\n			#ifdef ENVMAP_TYPE_PMREM\n				vec3 bentNormal = cross( bitangent, viewDir );\n				bentNormal = normalize( cross( bentNormal, bitangent ) );\n				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );\n				return getIBLRadiance( viewDir, bentNormal, roughness );\n			#else\n				return vec3( 0.0 );\n			#endif\n		}\n		#ifdef USE_RETROREFLECTION\n			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {\n				#ifdef ENVMAP_TYPE_PMREM\n					vec3 bentNormal = cross( bitangent, viewDir );\n					bentNormal = normalize( cross( bentNormal, bitangent ) );\n					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );\n					return getIBLRetroRadiance( viewDir, bentNormal, roughness );\n				#else\n					return vec3( 0.0 );\n				#endif\n			}\n		#endif\n	#endif\n#endif",
	envmap_vertex: "#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vWorldPosition = worldPosition.xyz;\n	#else\n		vec3 cameraToVertex;\n		if ( isOrthographic ) {\n			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n		}\n		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vReflect = reflect( cameraToVertex, worldNormal );\n		#else\n			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n		#endif\n	#endif\n#endif",
	fog_vertex: "#ifdef USE_FOG\n	vFogDepth = - mvPosition.z;\n#endif",
	fog_pars_vertex: "#ifdef USE_FOG\n	varying float vFogDepth;\n#endif",
	fog_fragment: "#ifdef USE_FOG\n	#ifdef FOG_EXP2\n		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n	#else\n		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n	#endif\n	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif",
	fog_pars_fragment: "#ifdef USE_FOG\n	uniform vec3 fogColor;\n	varying float vFogDepth;\n	#ifdef FOG_EXP2\n		uniform float fogDensity;\n	#else\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n#endif",
	gradientmap_pars_fragment: "#ifdef USE_GRADIENTMAP\n	uniform sampler2D gradientMap;\n#endif\nvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n	float dotNL = dot( normal, lightDirection );\n	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n	#ifdef USE_GRADIENTMAP\n		return vec3( texture2D( gradientMap, coord ).r );\n	#else\n		vec2 fw = fwidth( coord ) * 0.5;\n		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );\n	#endif\n}",
	lightmap_pars_fragment: "#ifdef USE_LIGHTMAP\n	uniform sampler2D lightMap;\n	uniform float lightMapIntensity;\n#endif",
	lights_lambert_fragment: "LambertMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularStrength = specularStrength;",
	lights_lambert_pars_fragment: "varying vec3 vViewPosition;\nstruct LambertMaterial {\n	vec3 diffuseColor;\n	float specularStrength;\n};\nvoid RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Lambert\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert",
	lights_pars_begin: "uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\n#if defined( USE_LIGHT_PROBES )\n	uniform vec3 lightProbe[ 9 ];\n#endif\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n	float x = normal.x, y = normal.y, z = normal.z;\n	vec3 result = shCoefficients[ 0 ] * 0.886227;\n	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n	return result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {\n	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );\n	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n	return irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n	vec3 irradiance = ambientLightColor;\n	return irradiance;\n}\nfloat getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n	if ( cutoffDistance > 0.0 ) {\n		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n	}\n	return distanceFalloff;\n}\nfloat getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {\n	return smoothstep( coneCosine, penumbraCosine, angleCosine );\n}\n#if NUM_SUN_LIGHTS > 0\n	struct SunLight {\n		vec3 direction;\n		vec3 color;\n	};\n	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];\n	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {\n		light.color = sunLight.color;\n		light.direction = sunLight.direction;\n		light.visible = true;\n	}\n#endif\n#if NUM_DIR_LIGHTS > 0\n	struct DirectionalLight {\n		vec3 direction;\n		vec3 color;\n	};\n	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {\n		light.color = directionalLight.color;\n		light.direction = directionalLight.direction;\n		light.visible = true;\n	}\n#endif\n#if NUM_POINT_LIGHTS > 0\n	struct PointLight {\n		vec3 position;\n		vec3 color;\n		float distance;\n		float decay;\n	};\n	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = pointLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float lightDistance = length( lVector );\n		light.color = pointLight.color;\n		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );\n		light.visible = ( light.color != vec3( 0.0 ) );\n	}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n	struct SpotLight {\n		vec3 position;\n		vec3 direction;\n		vec3 color;\n		float distance;\n		float decay;\n		float coneCos;\n		float penumbraCos;\n	};\n	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = spotLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float angleCos = dot( light.direction, spotLight.direction );\n		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n		if ( spotAttenuation > 0.0 ) {\n			float lightDistance = length( lVector );\n			light.color = spotLight.color * spotAttenuation;\n			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );\n			light.visible = ( light.color != vec3( 0.0 ) );\n		} else {\n			light.color = vec3( 0.0 );\n			light.visible = false;\n		}\n	}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n	struct RectAreaLight {\n		vec3 color;\n		vec3 position;\n		vec3 halfWidth;\n		vec3 halfHeight;\n	};\n	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;\n	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n	struct HemisphereLight {\n		vec3 direction;\n		vec3 skyColor;\n		vec3 groundColor;\n	};\n	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {\n		float dotNL = dot( normal, hemiLight.direction );\n		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n		return irradiance;\n	}\n#endif\n#include <lightprobes_pars_fragment>",
	lights_toon_fragment: "ToonMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;",
	lights_toon_pars_fragment: "varying vec3 vViewPosition;\nstruct ToonMaterial {\n	vec3 diffuseColor;\n};\nvoid RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Toon\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon",
	lights_phong_fragment: "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;",
	lights_phong_pars_fragment: "varying vec3 vViewPosition;\nstruct BlinnPhongMaterial {\n	vec3 diffuseColor;\n	vec3 specularColor;\n	float specularShininess;\n	float specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_BlinnPhong\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong",
	lights_physical_fragment: "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.metalness = metalnessFactor;\nvec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.roughness = max( roughnessFactor, 0.045 );\nmaterial.roughness += geometryRoughness;\nmaterial.roughness = min( material.roughness, 1.0 );\n#ifdef USE_DIFFUSE_ROUGHNESS\n	float diffuseRoughnessFactor = diffuseRoughness;\n	#ifdef USE_DIFFUSE_ROUGHNESSMAP\n		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;\n	#endif\n	material.diffuseRoughness = saturate( diffuseRoughnessFactor );\n#endif\n#ifdef IOR\n	material.ior = ior;\n	#ifdef USE_SPECULAR\n		float specularIntensityFactor = specularIntensity;\n		vec3 specularColorFactor = specularColor;\n		#ifdef USE_SPECULAR_COLORMAP\n			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\n		#endif\n		#ifdef USE_SPECULAR_INTENSITYMAP\n			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\n		#endif\n		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\n	#else\n		float specularIntensityFactor = 1.0;\n		vec3 specularColorFactor = vec3( 1.0 );\n		material.specularF90 = 1.0;\n	#endif\n	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;\n	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );\n#else\n	material.specularColor = vec3( 0.04 );\n	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );\n	material.specularF90 = 1.0;\n#endif\n#ifdef USE_CLEARCOAT\n	material.clearcoat = clearcoat;\n	material.clearcoatRoughness = clearcoatRoughness;\n	material.clearcoatF0 = vec3( 0.04 );\n	material.clearcoatF90 = 1.0;\n	#ifdef USE_CLEARCOATMAP\n		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\n	#endif\n	#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\n	#endif\n	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );\n	material.clearcoatRoughness += geometryRoughness;\n	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_DISPERSION\n	material.dispersion = dispersion;\n#endif\n#ifdef USE_RETROREFLECTION\n	material.retroreflectivity = retroreflectivity;\n#endif\n#ifdef USE_IRIDESCENCE\n	material.iridescence = iridescence;\n	material.iridescenceIOR = iridescenceIOR;\n	#ifdef USE_IRIDESCENCEMAP\n		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\n	#endif\n	#ifdef USE_IRIDESCENCE_THICKNESSMAP\n		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\n	#else\n		material.iridescenceThickness = iridescenceThicknessMaximum;\n	#endif\n#endif\n#ifdef USE_SHEEN\n	material.sheenColor = sheenColor;\n	#ifdef USE_SHEEN_COLORMAP\n		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\n	#endif\n	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	#ifdef USE_ANISOTROPYMAP\n		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );\n		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;\n		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;\n	#else\n		vec2 anisotropyV = anisotropyVector;\n	#endif\n	material.anisotropy = length( anisotropyV );\n	if( material.anisotropy == 0.0 ) {\n		anisotropyV = vec2( 1.0, 0.0 );\n	} else {\n		anisotropyV /= material.anisotropy;\n		material.anisotropy = saturate( material.anisotropy );\n	}\n	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );\n	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;\n	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;\n#endif",
	lights_physical_pars_fragment: "uniform sampler2D dfgLUT;\nstruct PhysicalMaterial {\n	vec3 diffuseColor;\n	vec3 diffuseContribution;\n	vec3 specularColor;\n	vec3 specularColorBlended;\n	float roughness;\n	float metalness;\n	float specularF90;\n	float dispersion;\n	vec2 dfg;\n	vec3 multiScatteringCompensation;\n	#ifdef USE_DIFFUSE_ROUGHNESS\n		float diffuseRoughness;\n	#endif\n	#ifdef USE_RETROREFLECTION\n		float retroreflectivity;\n	#endif\n	#ifdef USE_CLEARCOAT\n		float clearcoat;\n		float clearcoatRoughness;\n		vec3 clearcoatF0;\n		float clearcoatF90;\n	#endif\n	#ifdef USE_IRIDESCENCE\n		float iridescence;\n		float iridescenceIOR;\n		float iridescenceThickness;\n		vec3 iridescenceFresnel;\n		vec3 iridescenceF0Dielectric;\n		vec3 iridescenceF0Metallic;\n	#endif\n	#ifdef USE_SHEEN\n		vec3 sheenColor;\n		float sheenRoughness;\n	#endif\n	#ifdef IOR\n		float ior;\n	#endif\n	#ifdef USE_TRANSMISSION\n		float transmission;\n		float transmissionAlpha;\n		float thickness;\n		float attenuationDistance;\n		vec3 attenuationColor;\n	#endif\n	#ifdef USE_ANISOTROPY\n		float anisotropy;\n		float alphaT;\n		vec3 anisotropyT;\n		vec3 anisotropyB;\n	#endif\n};\nvec3 clearcoatSpecularDirect = vec3( 0.0 );\nvec3 clearcoatSpecularIndirect = vec3( 0.0 );\nvec3 sheenSpecularDirect = vec3( 0.0 );\nvec3 sheenSpecularIndirect = vec3(0.0 );\nvec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {\n    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );\n    float x2 = x * x;\n    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );\n    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );\n}\n#ifdef USE_DIFFUSE_ROUGHNESS\n	const float EON_EPSILON = 1e-7;\n	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {\n		float muComp = 1.0 - mu;\n		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );\n		return A * ( 1.0 + roughness * gOverPi );\n	}\n	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {\n		vec3 rho = saturate( diffuseColor );\n		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );\n		float dotNL = saturate( dot( normal, lightDir ) );\n		float dotNV = saturate( dot( normal, viewDir ) );\n		float s = dot( lightDir, viewDir ) - dotNL * dotNV;\n		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;\n		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );\n		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );\n		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );\n		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );\n		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );\n		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );\n		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI\n			* max( EON_EPSILON, 1.0 - albedoV )\n			* max( EON_EPSILON, 1.0 - albedoL )\n			/ max( EON_EPSILON, 1.0 - averageAlbedo );\n		return singleScatter + multiScatter;\n	}\n	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {\n		vec3 rho = saturate( diffuseColor );\n		if ( roughness <= EON_EPSILON ) return rho;\n		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );\n		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );\n		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );\n		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );\n		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );\n	}\n#endif\nfloat V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n	float a2 = pow2( alpha );\n	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n	return 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n	float a2 = pow2( alpha );\n	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n	return RECIPROCAL_PI * a2 / pow2( denom );\n}\n#ifdef USE_ANISOTROPY\n	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {\n		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );\n		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );\n		return 0.5 / max( gv + gl, EPSILON );\n	}\n	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {\n		float a2 = alphaT * alphaB;\n		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );\n		highp float v2 = dot( v, v );\n		float w2 = a2 / v2;\n		return RECIPROCAL_PI * a2 * pow2 ( w2 );\n	}\n#endif\n#ifdef USE_CLEARCOAT\n	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {\n		vec3 f0 = material.clearcoatF0;\n		float f90 = material.clearcoatF90;\n		float roughness = max( material.clearcoatRoughness, 0.045 );\n		float alpha = pow2( roughness );\n		vec3 halfDir = normalize( lightDir + viewDir );\n		float dotNL = saturate( dot( normal, lightDir ) );\n		float dotNV = saturate( dot( normal, viewDir ) );\n		float dotNH = saturate( dot( normal, halfDir ) );\n		float dotVH = saturate( dot( viewDir, halfDir ) );\n		vec3 F = F_Schlick( f0, f90, dotVH );\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n		return F * ( V * D );\n	}\n#endif\nvec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {\n	vec3 f0 = material.specularColorBlended;\n	float f90 = material.specularF90;\n	float roughness = max( material.roughness, 0.045 );\n	float alpha = pow2( roughness );\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( f0, f90, dotVH );\n	#ifdef USE_IRIDESCENCE\n		F = mix( F, material.iridescenceFresnel, material.iridescence );\n	#endif\n	#ifdef USE_ANISOTROPY\n		float dotTL = dot( material.anisotropyT, lightDir );\n		float dotTV = dot( material.anisotropyT, viewDir );\n		float dotTH = dot( material.anisotropyT, halfDir );\n		float dotBL = dot( material.anisotropyB, lightDir );\n		float dotBV = dot( material.anisotropyB, viewDir );\n		float dotBH = dot( material.anisotropyB, halfDir );\n		float alphaT = max( material.alphaT, alpha );\n		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );\n		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );\n	#else\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n	#endif\n	return F * ( V * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n	const float LUT_SIZE = 64.0;\n	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n	const float LUT_BIAS = 0.5 / LUT_SIZE;\n	float dotNV = saturate( dot( N, V ) );\n	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n	uv = uv * LUT_SCALE + LUT_BIAS;\n	return uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n	float l = length( f );\n	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n	float x = dot( v1, v2 );\n	float y = abs( x );\n	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n	float b = 3.4175940 + ( 4.1616724 + y ) * y;\n	float v = a / b;\n	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n	return cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n	vec3 lightNormal = cross( v1, v2 );\n	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n	vec3 T1, T2;\n	T1 = normalize( V - N * dot( V, N ) );\n	T2 = - cross( N, T1 );\n	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );\n	vec3 coords[ 4 ];\n	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n	coords[ 0 ] = normalize( coords[ 0 ] );\n	coords[ 1 ] = normalize( coords[ 1 ] );\n	coords[ 2 ] = normalize( coords[ 2 ] );\n	coords[ 3 ] = normalize( coords[ 3 ] );\n	vec3 vectorFormFactor = vec3( 0.0 );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n	return vec3( result );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie( float roughness, float dotNH ) {\n	float alpha = pow2( roughness );\n	float invAlpha = 1.0 / alpha;\n	float cos2h = dotNH * dotNH;\n	float sin2h = max( 1.0 - cos2h, 0.0078125 );\n	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );\n}\nfloat V_Neubelt( float dotNV, float dotNL ) {\n	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );\n}\nvec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float D = D_Charlie( sheenRoughness, dotNH );\n	float V = V_Neubelt( dotNV, dotNL );\n	return sheenColor * ( D * V );\n}\n#endif\nfloat IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float r2 = roughness * roughness;\n	float rInv = 1.0 / ( roughness + 0.1 );\n	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;\n	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;\n	float DG = exp( a * dotNV + b );\n	return saturate( DG );\n}\nvec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;\n	return specularColor * fab.x + specularF90 * fab.y;\n}\n#ifdef USE_IRIDESCENCE\nvoid computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#else\nvoid computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#endif\n	#ifdef USE_IRIDESCENCE\n		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );\n	#else\n		vec3 Fr = specularColor;\n	#endif\n	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;\n	float Ess = fab.x + fab.y;\n	float Ems = 1.0 - Ess;\n	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n	singleScatter += FssEss;\n	multiScatter += Fms * Ems;\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n		vec3 normal = geometryNormal;\n		vec3 viewDir = geometryViewDir;\n		vec3 position = geometryPosition;\n		vec3 lightPos = rectAreaLight.position;\n		vec3 halfWidth = rectAreaLight.halfWidth;\n		vec3 halfHeight = rectAreaLight.halfHeight;\n		vec3 lightColor = rectAreaLight.color;\n		float roughness = material.roughness;\n		vec3 rectCoords[ 4 ];\n		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n		vec2 uv = LTC_Uv( normal, viewDir, roughness );\n		vec4 t1 = texture2D( ltc_1, uv );\n		vec4 t2 = texture2D( ltc_2, uv );\n		mat3 mInv = mat3(\n			vec3( t1.x, 0, t1.y ),\n			vec3(    0, 1,    0 ),\n			vec3( t1.z, 0, t1.w )\n		);\n		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );\n		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n		#ifdef USE_CLEARCOAT\n			vec3 Ncc = geometryClearcoatNormal;\n			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );\n			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );\n			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );\n			mat3 mInvClearcoat = mat3(\n				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),\n				vec3(             0, 1,             0 ),\n				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )\n			);\n			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;\n			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );\n		#endif\n	}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	#ifdef USE_CLEARCOAT\n		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );\n		vec3 ccIrradiance = dotNLcc * directLight.color;\n		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );\n	#endif\n	#ifdef USE_SHEEN\n \n 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );\n \n 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );\n \n 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );\n \n 		irradiance *= sheenEnergyComp;\n \n 	#endif\n	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );\n	#ifdef USE_RETROREFLECTION\n		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );\n		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );\n		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );\n	#endif\n	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;\n	vec3 halfDir = normalize( directLight.direction + geometryViewDir );\n	float dotVH = saturate( dot( geometryViewDir, halfDir ) );\n	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );\n	#ifdef USE_RETROREFLECTION\n		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );\n		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );\n		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );\n		F = mix( F, retroF, saturate( material.retroreflectivity ) );\n	#endif\n	#ifdef USE_DIFFUSE_ROUGHNESS\n		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );\n	#else\n		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );\n	#endif\n	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 singleScattering = vec3( 0.0 );\n	vec3 multiScattering = vec3( 0.0 );\n	#ifdef USE_IRIDESCENCE\n		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );\n	#else\n		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );\n	#endif\n	#ifdef USE_DIFFUSE_ROUGHNESS\n		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );\n		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );\n	#else\n		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );\n	#endif\n	#ifdef USE_SHEEN\n		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;\n		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;\n		diffuse *= sheenEnergyComp;\n	#endif\n	reflectedLight.indirectDiffuse += diffuse;\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n	#ifdef USE_CLEARCOAT\n		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n	#endif\n	#ifdef USE_SHEEN\n		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;\n 	#endif\n	vec3 singleScatteringDielectric = vec3( 0.0 );\n	vec3 multiScatteringDielectric = vec3( 0.0 );\n	vec3 singleScatteringMetallic = vec3( 0.0 );\n	vec3 multiScatteringMetallic = vec3( 0.0 );\n	#ifdef USE_IRIDESCENCE\n		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );\n		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );\n	#else\n		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );\n		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );\n	#endif\n	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );\n	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );\n	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;\n	#ifdef USE_DIFFUSE_ROUGHNESS\n		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );\n	#else\n		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );\n	#endif\n	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n	vec3 indirectSpecular = radiance * singleScattering;\n	indirectSpecular += multiScattering * cosineWeightedIrradiance;\n	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;\n	#ifdef USE_SHEEN\n		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;\n		indirectSpecular *= sheenEnergyComp;\n		indirectDiffuse *= sheenEnergyComp;\n	#endif\n	reflectedLight.indirectSpecular += indirectSpecular;\n	reflectedLight.indirectDiffuse += indirectDiffuse;\n}\n#define RE_Direct				RE_Direct_Physical\n#define RE_Direct_RectArea		RE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular		RE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}",
	lights_fragment_begin: "\nvec3 geometryPosition = - vViewPosition;\nvec3 geometryNormal = normal;\nvec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\nvec3 geometryClearcoatNormal = vec3( 0.0 );\n#ifdef USE_CLEARCOAT\n	geometryClearcoatNormal = clearcoatNormal;\n#endif\n#ifdef USE_IRIDESCENCE\n	float dotNVi = saturate( dot( normal, geometryViewDir ) );\n	if ( material.iridescenceThickness == 0.0 ) {\n		material.iridescence = 0.0;\n	} else {\n		material.iridescence = saturate( material.iridescence );\n	}\n	if ( material.iridescence > 0.0 ) {\n		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );\n		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );\n		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );\n		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );\n		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );\n	}\n#endif\n#ifdef STANDARD\n	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );\n	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;\n	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )\n		float EssMs = material.dfg.x + material.dfg.y;\n		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );\n	#endif\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n	PointLight pointLight;\n	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n	PointLightShadow pointLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		pointLight = pointLights[ i ];\n		getPointLightInfo( pointLight, geometryPosition, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )\n		pointLightShadow = pointLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n	SpotLight spotLight;\n	vec4 spotColor;\n	vec3 spotLightCoord;\n	bool inSpotLightMap;\n	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		spotLight = spotLights[ i ];\n		getSpotLightInfo( spotLight, geometryPosition, directLight );\n		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX\n		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS\n		#else\n		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#endif\n		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )\n			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;\n			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );\n			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );\n			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;\n		#endif\n		#undef SPOT_LIGHT_MAP_INDEX\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		spotLightShadow = spotLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )\n	SunLight sunLight;\n	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0\n	SunLightShadow sunLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {\n		sunLight = sunLights[ i ];\n		getSunLightInfo( sunLight, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )\n		sunLightShadow = sunLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n	DirectionalLight directionalLight;\n	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		directionalLight = directionalLights[ i ];\n		getDirectionalLightInfo( directionalLight, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n		directionalLightShadow = directionalLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n	RectAreaLight rectAreaLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n		rectAreaLight = rectAreaLights[ i ];\n		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n	vec3 iblIrradiance = vec3( 0.0 );\n	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n	#if defined( USE_LIGHT_PROBES )\n		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );\n	#endif\n	#if ( NUM_HEMI_LIGHTS > 0 )\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );\n		}\n		#pragma unroll_loop_end\n	#endif\n	#if NUM_LIGHT_PROBE_GRIDS > 0\n		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;\n		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );\n		int probeGrid = - 1;\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {\n			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;\n		}\n		#pragma unroll_loop_end\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {\n			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );\n		}\n		#pragma unroll_loop_end\n	#endif\n#endif\n#if defined( RE_IndirectSpecular )\n	vec3 radiance = vec3( 0.0 );\n	vec3 clearcoatRadiance = vec3( 0.0 );\n#endif",
	lights_fragment_maps: "#if defined( RE_IndirectDiffuse )\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n		irradiance += lightMapIrradiance;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )\n		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )\n			iblIrradiance += getIBLIrradiance( geometryNormal );\n		#endif\n	#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n	#ifdef USE_ANISOTROPY\n		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );\n	#else\n		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );\n	#endif\n	#ifdef USE_RETROREFLECTION\n		#ifdef USE_ANISOTROPY\n			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );\n		#else\n			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );\n		#endif\n		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );\n	#endif\n	radiance += iblRadiance;\n	#ifdef USE_CLEARCOAT\n		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );\n	#endif\n#endif",
	lights_fragment_end: "#if defined( RE_IndirectDiffuse )\n	#if defined( LAMBERT ) || defined( PHONG )\n		irradiance += iblIrradiance;\n	#endif\n	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif",
	lightprobes_pars_fragment: "#if NUM_LIGHT_PROBE_GRIDS > 0\nuniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];\nuniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];\nuniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];\nuniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];\nbool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {\n	vec3 spacing = ( probesMax - probesMin ) / probesResolution;\n	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;\n	vec3 margin = spacing * 0.01;\n	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );\n}\nvec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {\n	vec3 res = probesResolution;\n	vec3 gridRange = probesMax - probesMin;\n	vec3 probeSpacing = gridRange / res;\n	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;\n	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );\n	float nz          = res.z;\n	float paddedSlices = nz + 2.0;\n	float atlasDepth  = 7.0 * paddedSlices;\n	float uvZBase     = uvw.z * nz + 1.0;\n	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );\n	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );\n	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );\n	vec3 c0 = s0.xyz;\n	vec3 c1 = vec3( s0.w, s1.xy );\n	vec3 c2 = vec3( s1.zw, s2.x );\n	vec3 c3 = s2.yzw;\n	vec3 c4 = s3.xyz;\n	vec3 c5 = vec3( s3.w, s4.xy );\n	vec3 c6 = vec3( s4.zw, s5.x );\n	vec3 c7 = s5.yzw;\n	vec3 c8 = s6.xyz;\n	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;\n	vec3 result = c0 * 0.886227;\n	result += c1 * 2.0 * 0.511664 * y;\n	result += c2 * 2.0 * 0.511664 * z;\n	result += c3 * 2.0 * 0.511664 * x;\n	result += c4 * 2.0 * 0.429043 * x * y;\n	result += c5 * 2.0 * 0.429043 * y * z;\n	result += c6 * ( 0.743125 * z * z - 0.247708 );\n	result += c7 * 2.0 * 0.429043 * x * z;\n	result += c8 * 0.429043 * ( x * x - y * y );\n	return max( result, vec3( 0.0 ) );\n}\n#endif",
	logdepthbuf_fragment: "#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )\n	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif",
	logdepthbuf_pars_fragment: "#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )\n	uniform float logDepthBufFC;\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif",
	logdepthbuf_pars_vertex: "#ifdef USE_LOGARITHMIC_DEPTH_BUFFER\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif",
	logdepthbuf_vertex: "#ifdef USE_LOGARITHMIC_DEPTH_BUFFER\n	vFragDepth = 1.0 + gl_Position.w;\n	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n#endif",
	map_fragment: "#ifdef USE_MAP\n	vec4 sampledDiffuseColor = texture2D( map, vMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );\n	#endif\n	diffuseColor *= sampledDiffuseColor;\n#endif",
	map_pars_fragment: "#ifdef USE_MAP\n	uniform sampler2D map;\n#endif",
	map_particle_fragment: "#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n	#if defined( USE_POINTS_UV )\n		vec2 uv = vUv;\n	#else\n		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n	#endif\n#endif\n#ifdef USE_MAP\n	diffuseColor *= texture2D( map, uv );\n#endif\n#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, uv ).g;\n#endif",
	map_particle_pars_fragment: "#if defined( USE_POINTS_UV )\n	varying vec2 vUv;\n#else\n	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n		uniform mat3 uvTransform;\n	#endif\n#endif\n#ifdef USE_MAP\n	uniform sampler2D map;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif",
	metalnessmap_fragment: "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );\n	metalnessFactor *= texelMetalness.b;\n#endif",
	metalnessmap_pars_fragment: "#ifdef USE_METALNESSMAP\n	uniform sampler2D metalnessMap;\n#endif",
	morphinstance_vertex: "#ifdef USE_INSTANCING_MORPH\n	float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;\n	}\n#endif",
	morphcolor_vertex: "#if defined( USE_MORPHCOLORS )\n	#if defined( USE_COLOR_ALPHA )\n		vColor *= morphTargetBaseInfluence;\n	#elif defined( USE_COLOR )\n		vColor.rgb *= morphTargetBaseInfluence;\n	#endif\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		#if defined( USE_COLOR_ALPHA )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];\n		#elif defined( USE_COLOR )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];\n		#endif\n	}\n#endif",
	morphnormal_vertex: "#ifdef USE_MORPHNORMALS\n	objectNormal *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];\n	}\n#endif",
	morphtarget_pars_vertex: "#ifdef USE_MORPHTARGETS\n	#ifndef USE_INSTANCING_MORPH\n		uniform float morphTargetBaseInfluence;\n		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n	#endif\n	uniform sampler2DArray morphTargetsTexture;\n	uniform ivec2 morphTargetsTextureSize;\n	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {\n		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;\n		int y = texelIndex / morphTargetsTextureSize.x;\n		int x = texelIndex - y * morphTargetsTextureSize.x;\n		ivec3 morphUV = ivec3( x, y, morphTargetIndex );\n		return texelFetch( morphTargetsTexture, morphUV, 0 );\n	}\n#endif",
	morphtarget_vertex: "#ifdef USE_MORPHTARGETS\n	transformed *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];\n	}\n#endif",
	normal_fragment_begin: "float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;\n#ifdef FLAT_SHADED\n	vec3 fdx = dFdx( vViewPosition );\n	vec3 fdy = dFdy( vViewPosition );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n#else\n	vec3 normal = normalize( vNormal );\n	#ifdef DOUBLE_SIDED\n		normal *= faceDirection;\n	#endif\n#endif\n#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )\n	#ifdef USE_TANGENT\n		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn = getTangentFrame( - vViewPosition, normal,\n		#if defined( USE_NORMALMAP )\n			vNormalMapUv\n		#elif defined( USE_CLEARCOAT_NORMALMAP )\n			vClearcoatNormalMapUv\n		#else\n			vUv\n		#endif\n		);\n	#endif\n	#ifdef DOUBLE_SIDED\n		tbn[0] *= faceDirection;\n		tbn[1] *= faceDirection;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	#ifdef USE_TANGENT\n		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );\n	#endif\n	#ifdef DOUBLE_SIDED\n		tbn2[0] *= faceDirection;\n		tbn2[1] *= faceDirection;\n	#endif\n#endif\nvec3 nonPerturbedNormal = normal;",
	normal_fragment_maps: "#ifdef USE_NORMALMAP_OBJECTSPACE\n	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#ifdef FLIP_SIDED\n		normal = - normal;\n	#endif\n	#ifdef DOUBLE_SIDED\n		normal = normal * faceDirection;\n	#endif\n	normal = normalize( normalMatrix * normal );\n#elif defined( USE_NORMALMAP_TANGENTSPACE )\n	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#if defined( USE_PACKED_NORMALMAP )\n		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );\n	#endif\n	mapN.xy *= normalScale;\n	normal = normalize( tbn * mapN );\n#elif defined( USE_BUMPMAP )\n	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );\n#endif",
	normal_pars_fragment: "#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif",
	normal_pars_vertex: "#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif",
	normal_vertex: "#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n	#ifdef USE_TANGENT\n		vTangent = normalize( transformedTangent );\n		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n		#ifdef FLIP_SIDED\n			vBitangent = - vBitangent;\n		#endif\n	#endif\n#endif",
	normalmap_pars_fragment: "#ifdef USE_NORMALMAP\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n#endif\n#ifdef USE_NORMALMAP_OBJECTSPACE\n	uniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )\n	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( uv.st );\n		vec2 st1 = dFdy( uv.st );\n		vec3 N = surf_norm;\n		vec3 q1perp = cross( q1, N );\n		vec3 q0perp = cross( N, q0 );\n		vec3 T = q1perp * st0.x + q0perp * st1.x;\n		vec3 B = q1perp * st0.y + q0perp * st1.y;\n		float det = max( dot( T, T ), dot( B, B ) );\n		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );\n		return mat3( T * scale, B * scale, N );\n	}\n#endif",
	clearcoat_normal_fragment_begin: "#ifdef USE_CLEARCOAT\n	vec3 clearcoatNormal = nonPerturbedNormal;\n#endif",
	clearcoat_normal_fragment_maps: "#ifdef USE_CLEARCOAT_NORMALMAP\n	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;\n	clearcoatMapN.xy *= clearcoatNormalScale;\n	clearcoatNormal = normalize( tbn2 * clearcoatMapN );\n#endif",
	clearcoat_pars_fragment: "#ifdef USE_CLEARCOATMAP\n	uniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform sampler2D clearcoatNormalMap;\n	uniform vec2 clearcoatNormalScale;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform sampler2D clearcoatRoughnessMap;\n#endif",
	iridescence_pars_fragment: "#ifdef USE_IRIDESCENCEMAP\n	uniform sampler2D iridescenceMap;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform sampler2D iridescenceThicknessMap;\n#endif",
	opaque_fragment: "#ifdef OPAQUE\ndiffuseColor.a = 1.0;\n#endif\n#ifdef USE_TRANSMISSION\ndiffuseColor.a *= material.transmissionAlpha;\n#endif\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	packing: "vec3 packNormalToRGB( const in vec3 normal ) {\n	return normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n	return 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;\nconst float Inv255 = 1. / 255.;\nconst vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );\nconst vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );\nconst vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );\nconst vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );\nvec4 packDepthToRGBA( const in float v ) {\n	if( v <= 0.0 )\n		return vec4( 0., 0., 0., 0. );\n	if( v >= 1.0 )\n		return vec4( 1., 1., 1., 1. );\n	float vuf;\n	float af = modf( v * PackFactors.a, vuf );\n	float bf = modf( vuf * ShiftRight8, vuf );\n	float gf = modf( vuf * ShiftRight8, vuf );\n	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );\n}\nvec3 packDepthToRGB( const in float v ) {\n	if( v <= 0.0 )\n		return vec3( 0., 0., 0. );\n	if( v >= 1.0 )\n		return vec3( 1., 1., 1. );\n	float vuf;\n	float bf = modf( v * PackFactors.b, vuf );\n	float gf = modf( vuf * ShiftRight8, vuf );\n	return vec3( vuf * Inv255, gf * PackUpscale, bf );\n}\nvec2 packDepthToRG( const in float v ) {\n	if( v <= 0.0 )\n		return vec2( 0., 0. );\n	if( v >= 1.0 )\n		return vec2( 1., 1. );\n	float vuf;\n	float gf = modf( v * 256., vuf );\n	return vec2( vuf * Inv255, gf );\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n	return dot( v, UnpackFactors4 );\n}\nfloat unpackRGBToDepth( const in vec3 v ) {\n	return dot( v, UnpackFactors3 );\n}\nfloat unpackRGToDepth( const in vec2 v ) {\n	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;\n}\nvec4 pack2HalfToRGBA( const in vec2 v ) {\n	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );\n	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );\n}\nvec2 unpackRGBATo2Half( const in vec4 v ) {\n	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n	\n		return depth * ( far - near ) - far;\n	#else\n		return depth * ( near - far ) - near;\n	#endif\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n		return ( near * far ) / ( ( near - far ) * depth - near );\n	#else\n		return ( near * far ) / ( ( far - near ) * depth - far );\n	#endif\n}",
	premultiplied_alpha_fragment: "#ifdef PREMULTIPLIED_ALPHA\n	gl_FragColor.rgb *= gl_FragColor.a;\n#endif",
	project_vertex: "vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_BATCHING\n	mvPosition = batchingMatrix * mvPosition;\n#endif\n#ifdef USE_INSTANCING\n	mvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;",
	dithering_fragment: "#ifdef DITHERING\n	gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif",
	dithering_pars_fragment: "#ifdef DITHERING\n	vec3 dithering( vec3 color ) {\n		float grid_position = rand( gl_FragCoord.xy );\n		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n		return color + dither_shift_RGB;\n	}\n#endif",
	roughnessmap_fragment: "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );\n	roughnessFactor *= texelRoughness.g;\n#endif",
	roughnessmap_pars_fragment: "#ifdef USE_ROUGHNESSMAP\n	uniform sampler2D roughnessMap;\n#endif",
	shadowmap_pars_fragment: "#if NUM_SPOT_LIGHT_COORDS > 0\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#if NUM_SPOT_LIGHT_MAPS > 0\n	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		#define SUN_LIGHT_CASCADES 2\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];\n		#endif\n		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];\n		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];\n		varying vec4 vSunShadowWorldPosition;\n		varying vec3 vSunShadowWorldNormal;\n		struct SunLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		#endif\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		#endif\n		struct SpotLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		#elif defined( SHADOWMAP_TYPE_BASIC )\n			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		#endif\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n	#if defined( SHADOWMAP_TYPE_PCF )\n		float interleavedGradientNoise( vec2 position ) {\n			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );\n		}\n		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {\n			const float goldenAngle = 2.399963229728653;\n			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );\n			float theta = float( sampleIndex ) * goldenAngle + phi;\n			return vec2( cos( theta ), sin( theta ) ) * r;\n		}\n	#endif\n	#if defined( SHADOWMAP_TYPE_PCF )\n		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n				vec2 radius = shadowRadius * texelSize;\n				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;\n				shadow = (\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )\n				) * 0.2;\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#elif defined( SHADOWMAP_TYPE_VSM )\n		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;\n				float mean = distribution.x;\n				float variance = distribution.y * distribution.y;\n				#ifdef USE_REVERSED_DEPTH_BUFFER\n					float hard_shadow = step( mean, shadowCoord.z );\n				#else\n					float hard_shadow = step( shadowCoord.z, mean );\n				#endif\n				\n				if ( hard_shadow == 1.0 ) {\n					shadow = 1.0;\n				} else {\n					variance = max( variance, 0.0000001 );\n					float d = shadowCoord.z - mean;\n					float p_max = variance / ( variance + d * d );\n					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );\n					shadow = max( hard_shadow, p_max );\n				}\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#else\n		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				float depth = texture2D( shadowMap, shadowCoord.xy ).r;\n				#ifdef USE_REVERSED_DEPTH_BUFFER\n					shadow = step( depth, shadowCoord.z );\n				#else\n					shadow = step( shadowCoord.z, depth );\n				#endif\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#endif\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		float getSunShadow(\n			#if defined( SHADOWMAP_TYPE_PCF )\n				sampler2DShadow shadowMap,\n			#else\n				sampler2D shadowMap,\n			#endif\n			SunLightShadow sunLightShadow,\n			int shadowIndex\n		) {\n			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );\n			float viewDepth = vSunShadowWorldPosition.w;\n			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;\n			float shadow = 1.0;\n			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {\n				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];\n				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {\n					float cascadeShadow = getShadow(\n						shadowMap,\n						sunLightShadow.shadowMapSize,\n						sunLightShadow.shadowIntensity,\n						sunLightShadow.shadowBias,\n						sunLightShadow.shadowRadius,\n						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition\n					);\n					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );\n				}\n			}\n			return shadow;\n		}\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n	#if defined( SHADOWMAP_TYPE_PCF )\n	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 bd3D = normalize( lightToPosition );\n		vec3 absVec = abs( lightToPosition );\n		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );\n		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {\n			float lightDistance = length( lightToPosition );\n			float depthRange = shadowCameraFar - shadowCameraNear;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				float depthA = - shadowCameraNear / depthRange - shadowBias;\n				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );\n			#else\n				float depthA = shadowCameraFar / depthRange + shadowBias;\n				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );\n			#endif\n			float texelSize = shadowRadius / shadowMapSize.x;\n			vec3 absDir = abs( bd3D );\n			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );\n			tangent = normalize( cross( bd3D, tangent ) );\n			vec3 bitangent = cross( bd3D, tangent );\n			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;\n			shadow = 0.0;\n			for ( int i = 0; i < 5; i ++ ) {\n				vec2 offset = vogelDiskSample( i, 5, phi );\n				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;\n				vec3 absDirection = abs( direction );\n				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );\n				shadow += texture( shadowMap, vec4( direction, dp ) );\n			}\n			shadow *= 0.2;\n		}\n		return mix( 1.0, shadow, shadowIntensity );\n	}\n	#elif defined( SHADOWMAP_TYPE_BASIC )\n	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 absVec = abs( lightToPosition );\n		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );\n		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {\n			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n			dp += shadowBias;\n			vec3 bd3D = normalize( lightToPosition );\n			float depth = textureCube( shadowMap, bd3D ).r;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				depth = 1.0 - depth;\n			#endif\n			shadow = step( dp, depth );\n		}\n		return mix( 1.0, shadow, shadowIntensity );\n	}\n	#endif\n	#endif\n#endif",
	shadowmap_pars_vertex: "#if NUM_SPOT_LIGHT_COORDS > 0\n	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		varying vec4 vSunShadowWorldPosition;\n		varying vec3 vSunShadowWorldNormal;\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		struct SpotLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n#endif",
	shadowmap_vertex: "#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )\n	#ifdef HAS_NORMAL\n		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );\n	#else\n		vec3 shadowWorldNormal = vec3( 0.0 );\n	#endif\n	vec4 shadowWorldPosition;\n#endif\n#if defined( USE_SHADOWMAP )\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );\n		vSunShadowWorldNormal = shadowWorldNormal;\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n#endif\n#if NUM_SPOT_LIGHT_COORDS > 0\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {\n		shadowWorldPosition = worldPosition;\n		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;\n		#endif\n		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;\n	}\n	#pragma unroll_loop_end\n#endif",
	shadowmask_pars_fragment: "float getShadowMask() {\n	float shadow = 1.0;\n	#ifdef USE_SHADOWMAP\n	#if NUM_SUN_LIGHT_SHADOWS > 0\n	SunLightShadow sunLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {\n		sunLight = sunLightShadows[ i ];\n		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n		directionalLight = directionalLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n		spotLight = spotLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )\n	PointLightShadow pointLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n		pointLight = pointLightShadows[ i ];\n		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#endif\n	return shadow;\n}",
	skinbase_vertex: "#ifdef USE_SKINNING\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",
	skinning_pars_vertex: "#ifdef USE_SKINNING\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n	uniform highp sampler2D boneTexture;\n	mat4 getBoneMatrix( const in float i ) {\n		int size = textureSize( boneTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n#endif",
	skinning_vertex: "#ifdef USE_SKINNING\n	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	transformed = ( bindMatrixInverse * skinned ).xyz;\n#endif",
	skinnormal_vertex: "#ifdef USE_SKINNING\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n	#ifdef USE_TANGENT\n		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n	#endif\n#endif",
	specularmap_fragment: "float specularStrength;\n#ifdef USE_SPECULARMAP\n	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );\n	specularStrength = texelSpecular.r;\n#else\n	specularStrength = 1.0;\n#endif",
	specularmap_pars_fragment: "#ifdef USE_SPECULARMAP\n	uniform sampler2D specularMap;\n#endif",
	tonemapping_fragment: "#if defined( TONE_MAPPING )\n	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif",
	tonemapping_pars_fragment: "#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n	return saturate( toneMappingExposure * color );\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	return saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 CineonToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	color = max( vec3( 0.0 ), color - 0.004 );\n	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n	return a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n	const mat3 ACESInputMat = mat3(\n		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),\n		vec3( 0.04823, 0.01566, 0.83777 )\n	);\n	const mat3 ACESOutputMat = mat3(\n		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),\n		vec3( -0.07367, -0.00605,  1.07602 )\n	);\n	color *= toneMappingExposure / 0.6;\n	color = ACESInputMat * color;\n	color = RRTAndODTFit( color );\n	color = ACESOutputMat * color;\n	return saturate( color );\n}\nconst mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(\n	vec3( 1.6605, - 0.1246, - 0.0182 ),\n	vec3( - 0.5876, 1.1329, - 0.1006 ),\n	vec3( - 0.0728, - 0.0083, 1.1187 )\n);\nconst mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(\n	vec3( 0.6274, 0.0691, 0.0164 ),\n	vec3( 0.3293, 0.9195, 0.0880 ),\n	vec3( 0.0433, 0.0113, 0.8956 )\n);\nvec3 agxDefaultContrastApprox( vec3 x ) {\n	vec3 x2 = x * x;\n	vec3 x4 = x2 * x2;\n	return + 15.5 * x4 * x2\n		- 40.14 * x4 * x\n		+ 31.96 * x4\n		- 6.868 * x2 * x\n		+ 0.4298 * x2\n		+ 0.1191 * x\n		- 0.00232;\n}\nvec3 AgXToneMapping( vec3 color ) {\n	const mat3 AgXInsetMatrix = mat3(\n		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),\n		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),\n		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )\n	);\n	const mat3 AgXOutsetMatrix = mat3(\n		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),\n		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),\n		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )\n	);\n	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;\n	color *= toneMappingExposure;\n	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;\n	color = AgXInsetMatrix * color;\n	color = max( color, 1e-10 );	color = log2( color );\n	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );\n	color = clamp( color, 0.0, 1.0 );\n	color = agxDefaultContrastApprox( color );\n	color = AgXOutsetMatrix * color;\n	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );\n	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;\n	color = clamp( color, 0.0, 1.0 );\n	return color;\n}\nvec3 NeutralToneMapping( vec3 color ) {\n	const float StartCompression = 0.8 - 0.04;\n	const float Desaturation = 0.15;\n	color *= toneMappingExposure;\n	float x = min( color.r, min( color.g, color.b ) );\n	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;\n	color -= offset;\n	float peak = max( color.r, max( color.g, color.b ) );\n	if ( peak < StartCompression ) return color;\n	float d = 1. - StartCompression;\n	float newPeak = 1. - d * d / ( peak + d - StartCompression );\n	color *= newPeak / peak;\n	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );\n	return mix( color, vec3( newPeak ), g );\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }",
	transmission_fragment: "#ifdef USE_TRANSMISSION\n	material.transmission = transmission;\n	material.transmissionAlpha = 1.0;\n	material.thickness = thickness;\n	material.attenuationDistance = attenuationDistance;\n	material.attenuationColor = attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;\n	#endif\n	vec3 pos = vWorldPosition;\n	vec3 v = normalize( cameraPosition - pos );\n	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );\n	vec4 transmitted = getIBLVolumeRefraction(\n		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,\n		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,\n		material.attenuationColor, material.attenuationDistance );\n	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );\n	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );\n#endif",
	transmission_pars_fragment: "#ifdef USE_TRANSMISSION\n	uniform float transmission;\n	uniform float thickness;\n	uniform float attenuationDistance;\n	uniform vec3 attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		uniform sampler2D transmissionMap;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		uniform sampler2D thicknessMap;\n	#endif\n	uniform vec2 transmissionSamplerSize;\n	uniform sampler2D transmissionSamplerMap;\n	uniform mat4 modelMatrix;\n	uniform mat4 projectionMatrix;\n	varying vec3 vWorldPosition;\n	float w0( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );\n	}\n	float w1( float a ) {\n		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );\n	}\n	float w2( float a ){\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );\n	}\n	float w3( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * a * a );\n	}\n	float g0( float a ) {\n		return w0( a ) + w1( a );\n	}\n	float g1( float a ) {\n		return w2( a ) + w3( a );\n	}\n	float h0( float a ) {\n		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );\n	}\n	float h1( float a ) {\n		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );\n	}\n	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {\n		uv = uv * texelSize.zw + 0.5;\n		vec2 iuv = floor( uv );\n		vec2 fuv = fract( uv );\n		float g0x = g0( fuv.x );\n		float g1x = g1( fuv.x );\n		float h0x = h0( fuv.x );\n		float h1x = h1( fuv.x );\n		float h0y = h0( fuv.y );\n		float h1y = h1( fuv.y );\n		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +\n			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );\n	}\n	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {\n		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );\n		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );\n		vec2 fLodSizeInv = 1.0 / fLodSize;\n		vec2 cLodSizeInv = 1.0 / cLodSize;\n		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );\n		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );\n		return mix( fSample, cSample, fract( lod ) );\n	}\n	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {\n		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n		vec3 modelScale;\n		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n		return normalize( refractionVector ) * thickness * modelScale;\n	}\n	float applyIorToRoughness( const in float roughness, const in float ior ) {\n		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );\n	}\n	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {\n		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );\n		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );\n	}\n	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {\n		if ( isinf( attenuationDistance ) ) {\n			return vec3( 1.0 );\n		} else {\n			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;\n			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;\n		}\n	}\n	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,\n		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,\n		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,\n		const in vec3 attenuationColor, const in float attenuationDistance ) {\n		vec4 transmittedLight;\n		vec3 transmittance;\n		#ifdef USE_DISPERSION\n			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;\n			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );\n			for ( int i = 0; i < 3; i ++ ) {\n				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );\n				vec3 refractedRayExit = position + transmissionRay;\n				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n				vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n				refractionCoords += 1.0;\n				refractionCoords /= 2.0;\n				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );\n				transmittedLight[ i ] = transmissionSample[ i ];\n				transmittedLight.a += transmissionSample.a;\n				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];\n			}\n			transmittedLight.a /= 3.0;\n		#else\n			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );\n			vec3 refractedRayExit = position + transmissionRay;\n			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n			vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n			refractionCoords += 1.0;\n			refractionCoords /= 2.0;\n			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );\n			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );\n		#endif\n		vec3 attenuatedColor = transmittance * transmittedLight.rgb;\n		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );\n		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;\n		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );\n	}\n#endif",
	uv_pars_fragment: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_DIFFUSE_ROUGHNESSMAP\n	varying vec2 vDiffuseRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif",
	uv_pars_vertex: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	uniform mat3 mapTransform;\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform mat3 alphaMapTransform;\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	uniform mat3 lightMapTransform;\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	uniform mat3 aoMapTransform;\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	uniform mat3 bumpMapTransform;\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	uniform mat3 normalMapTransform;\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	uniform mat3 displacementMapTransform;\n	varying vec2 vDisplacementMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	uniform mat3 emissiveMapTransform;\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	uniform mat3 metalnessMapTransform;\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	uniform mat3 roughnessMapTransform;\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_DIFFUSE_ROUGHNESSMAP\n	uniform mat3 diffuseRoughnessMapTransform;\n	varying vec2 vDiffuseRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	uniform mat3 anisotropyMapTransform;\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	uniform mat3 clearcoatMapTransform;\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform mat3 clearcoatNormalMapTransform;\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform mat3 clearcoatRoughnessMapTransform;\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	uniform mat3 sheenColorMapTransform;\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	uniform mat3 sheenRoughnessMapTransform;\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	uniform mat3 iridescenceMapTransform;\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform mat3 iridescenceThicknessMapTransform;\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	uniform mat3 specularMapTransform;\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	uniform mat3 specularColorMapTransform;\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	uniform mat3 specularIntensityMapTransform;\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif",
	uv_vertex: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	vUv = vec3( uv, 1 ).xy;\n#endif\n#ifdef USE_MAP\n	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ALPHAMAP\n	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_LIGHTMAP\n	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_AOMAP\n	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_BUMPMAP\n	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_NORMALMAP\n	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_EMISSIVEMAP\n	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_METALNESSMAP\n	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_DIFFUSE_ROUGHNESSMAP\n	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOATMAP\n	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULARMAP\n	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_THICKNESSMAP\n	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;\n#endif",
	worldpos_vertex: "#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0\n	vec4 worldPosition = vec4( transformed, 1.0 );\n	#ifdef USE_BATCHING\n		worldPosition = batchingMatrix * worldPosition;\n	#endif\n	#ifdef USE_INSTANCING\n		worldPosition = instanceMatrix * worldPosition;\n	#endif\n	worldPosition = modelMatrix * worldPosition;\n#endif",
	background_vert: "varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	gl_Position = vec4( position.xy, 1.0, 1.0 );\n}",
	background_frag: "uniform sampler2D t2D;\nuniform float backgroundIntensity;\nvarying vec2 vUv;\nvoid main() {\n	vec4 texColor = texture2D( t2D, vUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	backgroundCube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}",
	backgroundCube_frag: "uniform float backgroundBlurriness;\nuniform float backgroundIntensity;\nuniform mat3 backgroundRotation;\nvarying vec3 vWorldDirection;\n#include <envmap_common_pars_fragment>\nvoid main() {\n	#ifdef ENVMAP_TYPE_PMREM\n		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );\n	#else\n		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	cube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}",
	cube_frag: "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldDirection;\nvoid main() {\n	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );\n	gl_FragColor = texColor;\n	gl_FragColor.a *= opacity;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	depth_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#include <morphinstance_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vHighPrecisionZW = gl_Position.zw;\n}",
	depth_frag: "#if DEPTH_PACKING == 3200\n	uniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#if DEPTH_PACKING == 3200\n		diffuseColor.a = opacity;\n	#endif\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <logdepthbuf_fragment>\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];\n	#else\n		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;\n	#endif\n	#if DEPTH_PACKING == 3200\n		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );\n	#elif DEPTH_PACKING == 3201\n		gl_FragColor = packDepthToRGBA( fragCoordZ );\n	#elif DEPTH_PACKING == 3202\n		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );\n	#elif DEPTH_PACKING == 3203\n		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );\n	#endif\n}",
	distance_vert: "#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#include <morphinstance_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <worldpos_vertex>\n	#include <clipping_planes_vertex>\n	vWorldPosition = worldPosition.xyz;\n}",
	distance_frag: "#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	float dist = length( vWorldPosition - referencePosition );\n	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n	dist = saturate( dist );\n	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );\n}",
	equirect_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n}",
	equirect_frag: "uniform sampler2D tEquirect;\nvarying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vec3 direction = normalize( vWorldDirection );\n	vec2 sampleUV = equirectUv( direction );\n	gl_FragColor = texture2D( tEquirect, sampleUV );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	linedashed_vert: "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	vLineDistance = scale * lineDistance;\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}",
	linedashed_frag: "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	if ( mod( vLineDistance, totalSize ) > dashSize ) {\n		discard;\n	}\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	meshbasic_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinbase_vertex>\n		#include <skinnormal_vertex>\n		#include <defaultnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <fog_vertex>\n}",
	meshbasic_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;\n	#else\n		reflectedLight.indirectDiffuse += vec3( 1.0 );\n	#endif\n	#include <aomap_fragment>\n	reflectedLight.indirectDiffuse *= diffuseColor.rgb;\n	vec3 outgoingLight = reflectedLight.indirectDiffuse;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshlambert_vert: "#define LAMBERT\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshlambert_frag: "#define LAMBERT\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_lambert_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_lambert_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshmatcap_vert: "#define MATCAP\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n	vViewPosition = - mvPosition.xyz;\n}",
	meshmatcap_frag: "#define MATCAP\nuniform vec3 diffuse;\nuniform float opacity;\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	vec3 viewDir = normalize( vViewPosition );\n	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );\n	vec3 y = cross( viewDir, x );\n	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;\n	#ifdef USE_MATCAP\n		vec4 matcapColor = texture2D( matcap, uv );\n	#else\n		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );\n	#endif\n	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshnormal_vert: "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	vViewPosition = - mvPosition.xyz;\n#endif\n}",
	meshnormal_frag: "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <uv_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );\n	#ifdef OPAQUE\n		gl_FragColor.a = 1.0;\n	#endif\n}",
	meshphong_vert: "#define PHONG\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshphong_frag: "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_phong_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshphysical_vert: "#define STANDARD\nvarying vec3 vViewPosition;\n#ifdef USE_TRANSMISSION\n	varying vec3 vWorldPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n#ifdef USE_TRANSMISSION\n	vWorldPosition = worldPosition.xyz;\n#endif\n}",
	meshphysical_frag: "#define STANDARD\n#ifdef PHYSICAL\n	#define IOR\n	#define USE_SPECULAR\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef IOR\n	uniform float ior;\n#endif\n#ifdef USE_SPECULAR\n	uniform float specularIntensity;\n	uniform vec3 specularColor;\n	#ifdef USE_SPECULAR_COLORMAP\n		uniform sampler2D specularColorMap;\n	#endif\n	#ifdef USE_SPECULAR_INTENSITYMAP\n		uniform sampler2D specularIntensityMap;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT\n	uniform float clearcoat;\n	uniform float clearcoatRoughness;\n#endif\n#ifdef USE_DIFFUSE_ROUGHNESS\n	uniform float diffuseRoughness;\n	#ifdef USE_DIFFUSE_ROUGHNESSMAP\n		uniform sampler2D diffuseRoughnessMap;\n	#endif\n#endif\n#ifdef USE_DISPERSION\n	uniform float dispersion;\n#endif\n#ifdef USE_RETROREFLECTION\n	uniform float retroreflectivity;\n#endif\n#ifdef USE_IRIDESCENCE\n	uniform float iridescence;\n	uniform float iridescenceIOR;\n	uniform float iridescenceThicknessMinimum;\n	uniform float iridescenceThicknessMaximum;\n#endif\n#ifdef USE_SHEEN\n	uniform vec3 sheenColor;\n	uniform float sheenRoughness;\n	#ifdef USE_SHEEN_COLORMAP\n		uniform sampler2D sheenColorMap;\n	#endif\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		uniform sampler2D sheenRoughnessMap;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	uniform vec2 anisotropyVector;\n	#ifdef USE_ANISOTROPYMAP\n		uniform sampler2D anisotropyMap;\n	#endif\n#endif\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <iridescence_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_physical_pars_fragment>\n#include <transmission_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <iridescence_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <roughnessmap_fragment>\n	#include <metalnessmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <clearcoat_normal_fragment_begin>\n	#include <clearcoat_normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_physical_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n	#include <transmission_fragment>\n	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n	#ifdef USE_SHEEN\n \n		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;\n \n 	#endif\n	#ifdef USE_CLEARCOAT\n		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );\n		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;\n	#endif\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshtoon_vert: "#define TOON\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshtoon_frag: "#define TOON\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_toon_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_toon_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	points_vert: "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#ifdef USE_POINTS_UV\n	varying vec2 vUv;\n	uniform mat3 uvTransform;\n#endif\nvoid main() {\n	#ifdef USE_POINTS_UV\n		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	#endif\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	gl_PointSize = size;\n	#ifdef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );\n	#endif\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <fog_vertex>\n}",
	points_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_particle_fragment>\n	#include <color_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	shadow_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	shadow_frag: "uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <logdepthbuf_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n	#include <logdepthbuf_fragment>\n	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	sprite_vert: "uniform float rotation;\nuniform vec2 center;\n#include <common>\n#include <uv_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	vec4 mvPosition = modelViewMatrix[ 3 ];\n	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );\n	#ifndef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) scale *= - mvPosition.z;\n	#endif\n	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;\n	vec2 rotatedPosition;\n	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n	mvPosition.xy += rotatedPosition;\n	gl_Position = projectionMatrix * mvPosition;\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}",
	sprite_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n}"
}, $ = {
	common: {
		diffuse: { value: /*@__PURE__*/ new gt(16777215) },
		opacity: { value: 1 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new K() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new K() },
		alphaTest: { value: 0 }
	},
	specularmap: {
		specularMap: { value: null },
		specularMapTransform: { value: /*@__PURE__*/ new K() }
	},
	envmap: {
		envMap: { value: null },
		envMapRotation: { value: /*@__PURE__*/ new K() },
		reflectivity: { value: 1 },
		ior: { value: 1.5 },
		refractionRatio: { value: .98 },
		dfgLUT: { value: null }
	},
	aomap: {
		aoMap: { value: null },
		aoMapIntensity: { value: 1 },
		aoMapTransform: { value: /*@__PURE__*/ new K() }
	},
	lightmap: {
		lightMap: { value: null },
		lightMapIntensity: { value: 1 },
		lightMapTransform: { value: /*@__PURE__*/ new K() }
	},
	bumpmap: {
		bumpMap: { value: null },
		bumpMapTransform: { value: /*@__PURE__*/ new K() },
		bumpScale: { value: 1 }
	},
	normalmap: {
		normalMap: { value: null },
		normalMapTransform: { value: /*@__PURE__*/ new K() },
		normalScale: { value: /*@__PURE__*/ new W(1, 1) }
	},
	displacementmap: {
		displacementMap: { value: null },
		displacementMapTransform: { value: /*@__PURE__*/ new K() },
		displacementScale: { value: 1 },
		displacementBias: { value: 0 }
	},
	emissivemap: {
		emissiveMap: { value: null },
		emissiveMapTransform: { value: /*@__PURE__*/ new K() }
	},
	metalnessmap: {
		metalnessMap: { value: null },
		metalnessMapTransform: { value: /*@__PURE__*/ new K() }
	},
	roughnessmap: {
		roughnessMap: { value: null },
		roughnessMapTransform: { value: /*@__PURE__*/ new K() }
	},
	gradientmap: { gradientMap: { value: null } },
	fog: {
		fogDensity: { value: 25e-5 },
		fogNear: { value: 1 },
		fogFar: { value: 2e3 },
		fogColor: { value: /*@__PURE__*/ new gt(16777215) }
	},
	lights: {
		ambientLightColor: { value: [] },
		lightProbe: { value: [] },
		sunLights: {
			value: [],
			properties: {
				direction: {},
				color: {}
			}
		},
		sunLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		sunShadowMatrix: { value: [] },
		sunShadowCascade: { value: [] },
		directionalLights: {
			value: [],
			properties: {
				direction: {},
				color: {}
			}
		},
		directionalLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		directionalShadowMatrix: { value: [] },
		spotLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				direction: {},
				distance: {},
				coneCos: {},
				penumbraCos: {},
				decay: {}
			}
		},
		spotLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		spotLightMap: { value: [] },
		spotLightMatrix: { value: [] },
		pointLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				decay: {},
				distance: {}
			}
		},
		pointLightShadows: {
			value: [],
			properties: {
				shadowIntensity: 1,
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {},
				shadowCameraNear: {},
				shadowCameraFar: {}
			}
		},
		pointShadowMatrix: { value: [] },
		hemisphereLights: {
			value: [],
			properties: {
				direction: {},
				skyColor: {},
				groundColor: {}
			}
		},
		rectAreaLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				width: {},
				height: {}
			}
		},
		ltc_1: { value: null },
		ltc_2: { value: null },
		probesSH: { value: [] },
		probesMin: { value: [] },
		probesMax: { value: [] },
		probesResolution: { value: [] }
	},
	points: {
		diffuse: { value: /*@__PURE__*/ new gt(16777215) },
		opacity: { value: 1 },
		size: { value: 1 },
		scale: { value: 1 },
		map: { value: null },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new K() },
		alphaTest: { value: 0 },
		uvTransform: { value: /*@__PURE__*/ new K() }
	},
	sprite: {
		diffuse: { value: /*@__PURE__*/ new gt(16777215) },
		opacity: { value: 1 },
		center: { value: /*@__PURE__*/ new W(.5, .5) },
		rotation: { value: 0 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new K() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new K() },
		alphaTest: { value: 0 }
	}
}, mi = {
	basic: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.specularmap,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.fog
		]),
		vertexShader: Q.meshbasic_vert,
		fragmentShader: Q.meshbasic_frag
	},
	lambert: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.specularmap,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.fog,
			$.lights,
			{
				emissive: { value: /*@__PURE__*/ new gt(0) },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Q.meshlambert_vert,
		fragmentShader: Q.meshlambert_frag
	},
	phong: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.specularmap,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.fog,
			$.lights,
			{
				emissive: { value: /*@__PURE__*/ new gt(0) },
				specular: { value: /*@__PURE__*/ new gt(1118481) },
				shininess: { value: 30 },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Q.meshphong_vert,
		fragmentShader: Q.meshphong_frag
	},
	standard: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.envmap,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.roughnessmap,
			$.metalnessmap,
			$.fog,
			$.lights,
			{
				emissive: { value: /*@__PURE__*/ new gt(0) },
				roughness: { value: 1 },
				metalness: { value: 0 },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Q.meshphysical_vert,
		fragmentShader: Q.meshphysical_frag
	},
	toon: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.aomap,
			$.lightmap,
			$.emissivemap,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.gradientmap,
			$.fog,
			$.lights,
			{ emissive: { value: /*@__PURE__*/ new gt(0) } }
		]),
		vertexShader: Q.meshtoon_vert,
		fragmentShader: Q.meshtoon_frag
	},
	matcap: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			$.fog,
			{ matcap: { value: null } }
		]),
		vertexShader: Q.meshmatcap_vert,
		fragmentShader: Q.meshmatcap_frag
	},
	points: {
		uniforms: /*@__PURE__*/ or([$.points, $.fog]),
		vertexShader: Q.points_vert,
		fragmentShader: Q.points_frag
	},
	dashed: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.fog,
			{
				scale: { value: 1 },
				dashSize: { value: 1 },
				totalSize: { value: 2 }
			}
		]),
		vertexShader: Q.linedashed_vert,
		fragmentShader: Q.linedashed_frag
	},
	depth: {
		uniforms: /*@__PURE__*/ or([$.common, $.displacementmap]),
		vertexShader: Q.depth_vert,
		fragmentShader: Q.depth_frag
	},
	normal: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.bumpmap,
			$.normalmap,
			$.displacementmap,
			{ opacity: { value: 1 } }
		]),
		vertexShader: Q.meshnormal_vert,
		fragmentShader: Q.meshnormal_frag
	},
	sprite: {
		uniforms: /*@__PURE__*/ or([$.sprite, $.fog]),
		vertexShader: Q.sprite_vert,
		fragmentShader: Q.sprite_frag
	},
	background: {
		uniforms: {
			uvTransform: { value: /*@__PURE__*/ new K() },
			t2D: { value: null },
			backgroundIntensity: { value: 1 }
		},
		vertexShader: Q.background_vert,
		fragmentShader: Q.background_frag
	},
	backgroundCube: {
		uniforms: {
			envMap: { value: null },
			backgroundBlurriness: { value: 0 },
			backgroundIntensity: { value: 1 },
			backgroundRotation: { value: /*@__PURE__*/ new K() }
		},
		vertexShader: Q.backgroundCube_vert,
		fragmentShader: Q.backgroundCube_frag
	},
	cube: {
		uniforms: {
			tCube: { value: null },
			tFlip: { value: -1 },
			opacity: { value: 1 }
		},
		vertexShader: Q.cube_vert,
		fragmentShader: Q.cube_frag
	},
	equirect: {
		uniforms: { tEquirect: { value: null } },
		vertexShader: Q.equirect_vert,
		fragmentShader: Q.equirect_frag
	},
	distance: {
		uniforms: /*@__PURE__*/ or([
			$.common,
			$.displacementmap,
			{
				referencePosition: { value: /*@__PURE__*/ new G() },
				nearDistance: { value: 1 },
				farDistance: { value: 1e3 }
			}
		]),
		vertexShader: Q.distance_vert,
		fragmentShader: Q.distance_frag
	},
	shadow: {
		uniforms: /*@__PURE__*/ or([
			$.lights,
			$.fog,
			{
				color: { value: /*@__PURE__*/ new gt(0) },
				opacity: { value: 1 }
			}
		]),
		vertexShader: Q.shadow_vert,
		fragmentShader: Q.shadow_frag
	}
};
mi.physical = {
	uniforms: /*@__PURE__*/ or([mi.standard.uniforms, {
		clearcoat: { value: 0 },
		clearcoatMap: { value: null },
		clearcoatMapTransform: { value: /*@__PURE__*/ new K() },
		clearcoatNormalMap: { value: null },
		clearcoatNormalMapTransform: { value: /*@__PURE__*/ new K() },
		clearcoatNormalScale: { value: /*@__PURE__*/ new W(1, 1) },
		clearcoatRoughness: { value: 0 },
		clearcoatRoughnessMap: { value: null },
		clearcoatRoughnessMapTransform: { value: /*@__PURE__*/ new K() },
		diffuseRoughness: { value: 0 },
		diffuseRoughnessMap: { value: null },
		diffuseRoughnessMapTransform: { value: /*@__PURE__*/ new K() },
		dispersion: { value: 0 },
		retroreflectivity: { value: 0 },
		iridescence: { value: 0 },
		iridescenceMap: { value: null },
		iridescenceMapTransform: { value: /*@__PURE__*/ new K() },
		iridescenceIOR: { value: 1.3 },
		iridescenceThicknessMinimum: { value: 100 },
		iridescenceThicknessMaximum: { value: 400 },
		iridescenceThicknessMap: { value: null },
		iridescenceThicknessMapTransform: { value: /*@__PURE__*/ new K() },
		sheen: { value: 0 },
		sheenColor: { value: /*@__PURE__*/ new gt(0) },
		sheenColorMap: { value: null },
		sheenColorMapTransform: { value: /*@__PURE__*/ new K() },
		sheenRoughness: { value: 1 },
		sheenRoughnessMap: { value: null },
		sheenRoughnessMapTransform: { value: /*@__PURE__*/ new K() },
		transmission: { value: 0 },
		transmissionMap: { value: null },
		transmissionMapTransform: { value: /*@__PURE__*/ new K() },
		transmissionSamplerSize: { value: /*@__PURE__*/ new W() },
		transmissionSamplerMap: { value: null },
		thickness: { value: 0 },
		thicknessMap: { value: null },
		thicknessMapTransform: { value: /*@__PURE__*/ new K() },
		attenuationDistance: { value: 0 },
		attenuationColor: { value: /*@__PURE__*/ new gt(0) },
		specularColor: { value: /*@__PURE__*/ new gt(1, 1, 1) },
		specularColorMap: { value: null },
		specularColorMapTransform: { value: /*@__PURE__*/ new K() },
		specularIntensity: { value: 1 },
		specularIntensityMap: { value: null },
		specularIntensityMapTransform: { value: /*@__PURE__*/ new K() },
		anisotropyVector: { value: /*@__PURE__*/ new W() },
		anisotropyMap: { value: null },
		anisotropyMapTransform: { value: /*@__PURE__*/ new K() }
	}]),
	vertexShader: Q.meshphysical_vert,
	fragmentShader: Q.meshphysical_frag
};
var hi = {
	r: 0,
	b: 0,
	g: 0
}, gi = /*@__PURE__*/ new Le(), _i = /*@__PURE__*/ new K();
_i.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
function vi(e, t, n, r, i, a) {
	let o = new gt(0), s = i === !0 ? 0 : 1, c, l, u = null, d = 0, f = null;
	function p(e) {
		let n = e.isScene === !0 ? e.background : null;
		if (n && n.isTexture) {
			let r = e.backgroundBlurriness > 0;
			n = t.get(n, r);
		}
		return n;
	}
	function m(t) {
		let r = !1, i = p(t);
		i === null ? g(o, s) : i && i.isColor && (g(i, 1), r = !0);
		let c = e.xr.getEnvironmentBlendMode();
		c === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : c === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (e.autoClear || r) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil));
	}
	function h(t, n) {
		let i = p(n);
		i && i.isCubeTexture ? (l === void 0 && (l = new Vn(new rr(1, 1, 1), new pr({
			name: "BackgroundCubeMaterial",
			uniforms: ar(mi.backgroundCube.uniforms),
			vertexShader: mi.backgroundCube.vertexShader,
			fragmentShader: mi.backgroundCube.fragmentShader,
			side: 1,
			depthTest: !1,
			depthWrite: !1,
			fog: !1,
			allowOverride: !1
		})), l.geometry.deleteAttribute("normal"), l.geometry.deleteAttribute("uv"), l.onBeforeRender = function(e, t, n) {
			this.matrixWorld.copyPosition(n.matrixWorld);
		}, Object.defineProperty(l.material, "envMap", { get: function() {
			return this.uniforms.envMap.value;
		} }), r.update(l)), l.material.uniforms.envMap.value = i, l.material.uniforms.backgroundBlurriness.value = n.backgroundBlurriness, l.material.uniforms.backgroundIntensity.value = n.backgroundIntensity, l.material.uniforms.backgroundRotation.value.setFromMatrix4(gi.makeRotationFromEuler(n.backgroundRotation)).transpose(), i.isRenderTargetTexture === !1 && l.material.uniforms.backgroundRotation.value.premultiply(_i), l.material.toneMapped = q.getTransfer(i.colorSpace) !== j, (u !== i || d !== i.version || f !== e.toneMapping) && (l.material.needsUpdate = !0, u = i, d = i.version, f = e.toneMapping), l.layers.enableAll(), t.unshift(l, l.geometry, l.material, 0, 0, null)) : i && i.isTexture && (c === void 0 && (c = new Vn(new ir(2, 2), new pr({
			name: "BackgroundMaterial",
			uniforms: ar(mi.background.uniforms),
			vertexShader: mi.background.vertexShader,
			fragmentShader: mi.background.fragmentShader,
			side: 0,
			depthTest: !1,
			depthWrite: !1,
			fog: !1,
			allowOverride: !1
		})), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", { get: function() {
			return this.uniforms.t2D.value;
		} }), r.update(c)), c.material.uniforms.t2D.value = i, c.material.uniforms.backgroundIntensity.value = n.backgroundIntensity, c.material.toneMapped = q.getTransfer(i.colorSpace) !== j, i.matrixAutoUpdate === !0 && i.updateMatrix(), c.material.uniforms.uvTransform.value.copy(i.matrix), (u !== i || d !== i.version || f !== e.toneMapping) && (c.material.needsUpdate = !0, u = i, d = i.version, f = e.toneMapping), c.layers.enableAll(), t.unshift(c, c.geometry, c.material, 0, 0, null));
	}
	function g(t, r) {
		t.getRGB(hi, lr(e)), n.buffers.color.setClear(hi.r, hi.g, hi.b, r, a);
	}
	function _() {
		l !== void 0 && (l.geometry.dispose(), l.material.dispose(), l = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
	}
	return {
		getClearColor: function() {
			return o;
		},
		setClearColor: function(e, t = 1) {
			o.set(e), s = t, g(o, s);
		},
		getClearAlpha: function() {
			return s;
		},
		setClearAlpha: function(e) {
			s = e, g(o, s);
		},
		render: m,
		addToRenderList: h,
		dispose: _
	};
}
function yi(e, t) {
	let n = e.getParameter(e.MAX_VERTEX_ATTRIBS), r = {}, i = f(null), a = i, o = !1;
	function s(n, r, i, s, c) {
		let u = !1, f = d(n, s, i, r);
		a !== f && (a = f, l(a.object)), u = p(n, s, i, c), u && m(n, s, i, c), c !== null && t.update(c, e.ELEMENT_ARRAY_BUFFER), (u || o) && (o = !1, b(n, r, i, s), c !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, t.get(c).buffer));
	}
	function c() {
		return e.createVertexArray();
	}
	function l(t) {
		return e.bindVertexArray(t);
	}
	function u(t) {
		return e.deleteVertexArray(t);
	}
	function d(e, t, n, i) {
		let a = i.wireframe === !0, o = r[t.id];
		o === void 0 && (o = {}, r[t.id] = o);
		let s = e.isInstancedMesh === !0 ? e.id : 0, l = o[s];
		l === void 0 && (l = {}, o[s] = l);
		let u = l[n.id];
		u === void 0 && (u = {}, l[n.id] = u);
		let d = u[a];
		return d === void 0 && (d = f(c()), u[a] = d), d;
	}
	function f(e) {
		let t = [], r = [], i = [];
		for (let e = 0; e < n; e++) t[e] = 0, r[e] = 0, i[e] = 0;
		return {
			geometry: null,
			program: null,
			wireframe: !1,
			newAttributes: t,
			enabledAttributes: r,
			attributeDivisors: i,
			object: e,
			attributes: {},
			index: null
		};
	}
	function p(e, t, n, r) {
		let i = a.attributes, o = t.attributes, s = 0, c = n.getAttributes();
		for (let t in c) if (c[t].location >= 0) {
			let n = i[t], r = o[t];
			if (r === void 0 && (t === "instanceMatrix" && e.instanceMatrix && (r = e.instanceMatrix), t === "instanceColor" && e.instanceColor && (r = e.instanceColor)), n === void 0 || n.attribute !== r || r && n.data !== r.data) return !0;
			s++;
		}
		return a.attributesNum !== s || a.index !== r;
	}
	function m(e, t, n, r) {
		let i = {}, o = t.attributes, s = 0, c = n.getAttributes();
		for (let t in c) if (c[t].location >= 0) {
			let n = o[t];
			n === void 0 && (t === "instanceMatrix" && e.instanceMatrix && (n = e.instanceMatrix), t === "instanceColor" && e.instanceColor && (n = e.instanceColor));
			let r = {};
			r.attribute = n, n && n.data && (r.data = n.data), i[t] = r, s++;
		}
		a.attributes = i, a.attributesNum = s, a.index = r;
	}
	function h() {
		let e = a.newAttributes;
		for (let t = 0, n = e.length; t < n; t++) e[t] = 0;
	}
	function g(e) {
		_(e, 0);
	}
	function _(t, n) {
		let r = a.newAttributes, i = a.enabledAttributes, o = a.attributeDivisors;
		r[t] = 1, i[t] === 0 && (e.enableVertexAttribArray(t), i[t] = 1), o[t] !== n && (e.vertexAttribDivisor(t, n), o[t] = n);
	}
	function v() {
		let t = a.newAttributes, n = a.enabledAttributes;
		for (let r = 0, i = n.length; r < i; r++) n[r] !== t[r] && (e.disableVertexAttribArray(r), n[r] = 0);
	}
	function y(t, n, r, i, a, o, s) {
		s === !0 ? e.vertexAttribIPointer(t, n, r, a, o) : e.vertexAttribPointer(t, n, r, i, a, o);
	}
	function b(n, r, i, a) {
		h();
		let o = a.attributes, s = i.getAttributes(), c = r.defaultAttributeValues;
		for (let r in s) {
			let i = s[r];
			if (i.location >= 0) {
				let s = o[r];
				if (s === void 0 && (r === "instanceMatrix" && n.instanceMatrix && (s = n.instanceMatrix), r === "instanceColor" && n.instanceColor && (s = n.instanceColor)), s !== void 0) {
					let r = s.normalized, o = s.itemSize, c = t.get(s);
					if (c === void 0) continue;
					let l = c.buffer, u = c.type, d = c.bytesPerElement, f = u === e.INT || u === e.UNSIGNED_INT || s.gpuType === 1013;
					if (s.isInterleavedBufferAttribute) {
						let t = s.data, c = t.isInterleavedBuffer === !0 ? t.stride : t.itemSize, p = s.offset;
						if (t.isInstancedInterleavedBuffer || t.isInstancedBufferAttribute) {
							for (let e = 0; e < i.locationSize; e++) _(i.location + e, t.meshPerAttribute);
							n.isInstancedMesh !== !0 && a._maxInstanceCount === void 0 && (a._maxInstanceCount = t.meshPerAttribute * t.count);
						} else for (let e = 0; e < i.locationSize; e++) g(i.location + e);
						e.bindBuffer(e.ARRAY_BUFFER, l);
						for (let e = 0; e < i.locationSize; e++) y(i.location + e, o / i.locationSize, u, r, c * d, (p + o / i.locationSize * e) * d, f);
					} else {
						if (s.isInstancedBufferAttribute) {
							for (let e = 0; e < i.locationSize; e++) _(i.location + e, s.meshPerAttribute);
							n.isInstancedMesh !== !0 && a._maxInstanceCount === void 0 && (a._maxInstanceCount = s.meshPerAttribute * s.count);
						} else for (let e = 0; e < i.locationSize; e++) g(i.location + e);
						e.bindBuffer(e.ARRAY_BUFFER, l);
						for (let e = 0; e < i.locationSize; e++) y(i.location + e, o / i.locationSize, u, r, o * d, o / i.locationSize * e * d, f);
					}
				} else if (c !== void 0) {
					let t = c[r];
					if (t !== void 0) switch (t.length) {
						case 2:
							e.vertexAttrib2fv(i.location, t);
							break;
						case 3:
							e.vertexAttrib3fv(i.location, t);
							break;
						case 4:
							e.vertexAttrib4fv(i.location, t);
							break;
						default: e.vertexAttrib1fv(i.location, t);
					}
				}
			}
		}
		v();
	}
	function x() {
		T();
		for (let e in r) {
			let t = r[e];
			for (let e in t) {
				let n = t[e];
				for (let e in n) {
					let t = n[e];
					for (let e in t) u(t[e].object), delete t[e];
					delete n[e];
				}
			}
			delete r[e];
		}
	}
	function S(e) {
		if (r[e.id] === void 0) return;
		let t = r[e.id];
		for (let e in t) {
			let n = t[e];
			for (let e in n) {
				let t = n[e];
				for (let e in t) u(t[e].object), delete t[e];
				delete n[e];
			}
		}
		delete r[e.id];
	}
	function C(e) {
		for (let t in r) {
			let n = r[t];
			for (let t in n) {
				let r = n[t];
				if (r[e.id] === void 0) continue;
				let i = r[e.id];
				for (let e in i) u(i[e].object), delete i[e];
				delete r[e.id];
			}
		}
	}
	function w(e) {
		for (let t in r) {
			let n = r[t], i = e.isInstancedMesh === !0 ? e.id : 0, a = n[i];
			if (a !== void 0) {
				for (let e in a) {
					let t = a[e];
					for (let e in t) u(t[e].object), delete t[e];
					delete a[e];
				}
				delete n[i], Object.keys(n).length === 0 && delete r[t];
			}
		}
	}
	function T() {
		E(), o = !0, a !== i && (a = i, l(a.object));
	}
	function E() {
		i.geometry = null, i.program = null, i.wireframe = !1;
	}
	return {
		setup: s,
		reset: T,
		resetDefaultState: E,
		dispose: x,
		releaseStatesOfGeometry: S,
		releaseStatesOfObject: w,
		releaseStatesOfProgram: C,
		initAttributes: h,
		enableAttribute: g,
		disableUnusedAttributes: v
	};
}
function bi(e, t, n) {
	let r;
	function i(e) {
		r = e;
	}
	function a(t, i) {
		e.drawArrays(r, t, i), n.update(i, r, 1);
	}
	function o(t, i, a) {
		a !== 0 && (e.drawArraysInstanced(r, t, i, a), n.update(i, r, a));
	}
	function s(e, i, a) {
		if (a === 0) return;
		t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r, e, 0, i, 0, a);
		let o = 0;
		for (let e = 0; e < a; e++) o += i[e];
		n.update(o, r, 1);
	}
	this.setMode = i, this.render = a, this.renderInstances = o, this.renderMultiDraw = s;
}
function xi(e, t, n, r) {
	let i;
	function a() {
		if (i !== void 0) return i;
		if (t.has("EXT_texture_filter_anisotropic") === !0) {
			let n = t.get("EXT_texture_filter_anisotropic");
			i = e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		} else i = 0;
		return i;
	}
	function o(t) {
		return t === 1023 || r.convert(t) === e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT);
	}
	function s(n) {
		let i = n === 1016 && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
		return !(n !== 1009 && n !== 1015 && !i && r.convert(n) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE));
	}
	function c(t) {
		if (t === "highp") {
			if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0) return "highp";
			t = "mediump";
		}
		return t === "mediump" && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
	}
	let l = n.precision === void 0 ? "highp" : n.precision, u = c(l);
	u !== l && (B("WebGLRenderer:", l, "not supported, using", u, "instead."), l = u);
	let d = n.reversedDepthBuffer === !0 && t.has("EXT_clip_control"), f = n.logarithmicDepthBuffer === !0 && d === !1;
	n.reversedDepthBuffer === !0 && d === !1 && B("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."), n.logarithmicDepthBuffer === !0 && d === !0 && B("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");
	let p = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), m = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), h = e.getParameter(e.MAX_TEXTURE_SIZE), g = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), _ = e.getParameter(e.MAX_VERTEX_ATTRIBS), v = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), y = e.getParameter(e.MAX_VARYING_VECTORS), b = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), x = e.getParameter(e.MAX_SAMPLES), S = e.getParameter(e.SAMPLES);
	return {
		isWebGL2: !0,
		getMaxAnisotropy: a,
		getMaxPrecision: c,
		textureFormatReadable: o,
		textureTypeReadable: s,
		precision: l,
		logarithmicDepthBuffer: f,
		reversedDepthBuffer: d,
		maxTextures: p,
		maxVertexTextures: m,
		maxTextureSize: h,
		maxCubemapSize: g,
		maxAttributes: _,
		maxVertexUniforms: v,
		maxVaryings: y,
		maxFragmentUniforms: b,
		maxSamples: x,
		samples: S
	};
}
function Si(e) {
	let t = this, n = null, r = 0, i = !1, a = !1, o = new xn(), s = new K(), c = {
		value: null,
		needsUpdate: !1
	};
	this.uniform = c, this.numPlanes = 0, this.numIntersection = 0, this.init = function(e, t) {
		let n = e.length !== 0 || t || r !== 0 || i;
		return i = t, r = e.length, n;
	}, this.beginShadows = function() {
		a = !0, u(null);
	}, this.endShadows = function() {
		a = !1;
	}, this.setGlobalState = function(e, t) {
		n = u(e, t, 0);
	}, this.setState = function(t, o, s) {
		let d = t.clippingPlanes, f = t.clipIntersection, p = t.clipShadows, m = e.get(t);
		if (!i || d === null || d.length === 0 || a && !p) a ? u(null) : l();
		else {
			let e = a ? 0 : r, t = e * 4, i = m.clippingState || null;
			c.value = i, i = u(d, o, t, s);
			for (let e = 0; e !== t; ++e) i[e] = n[e];
			m.clippingState = i, this.numIntersection = f ? this.numPlanes : 0, this.numPlanes += e;
		}
	};
	function l() {
		c.value !== n && (c.value = n, c.needsUpdate = r > 0), t.numPlanes = r, t.numIntersection = 0;
	}
	function u(e, n, r, i) {
		let a = e === null ? 0 : e.length, l = null;
		if (a !== 0) {
			if (l = c.value, i !== !0 || l === null) {
				let t = r + a * 4, i = n.matrixWorldInverse;
				s.getNormalMatrix(i), (l === null || l.length < t) && (l = new Float32Array(t));
				for (let t = 0, n = r; t !== a; ++t, n += 4) o.copy(e[t]).applyMatrix4(i, s), o.normal.toArray(l, n), l[n + 3] = o.constant;
			}
			c.value = l, c.needsUpdate = !0;
		}
		return t.numPlanes = a, t.numIntersection = 0, l;
	}
}
var Ci = class extends Fe {
	constructor(e = 1, t = {}) {
		super(e, e, t), this.isWebGLCubeRenderTarget = !0;
		let n = {
			width: e,
			height: e,
			depth: 1
		}, r = [
			n,
			n,
			n,
			n,
			n,
			n
		];
		this.texture = new Qn(r), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0;
	}
	fromEquirectangularTexture(e, t) {
		this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
		let n = {
			uniforms: { tEquirect: { value: null } },
			vertexShader: "\n\n				varying vec3 vWorldDirection;\n\n				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\n					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n\n				}\n\n				void main() {\n\n					vWorldDirection = transformDirection( position, modelMatrix );\n\n					#include <begin_vertex>\n					#include <project_vertex>\n\n				}\n			",
			fragmentShader: "\n\n				uniform sampler2D tEquirect;\n\n				varying vec3 vWorldDirection;\n\n				#include <common>\n\n				void main() {\n\n					vec3 direction = normalize( vWorldDirection );\n\n					vec2 sampleUV = equirectUv( direction );\n\n					gl_FragColor = texture2D( tEquirect, sampleUV );\n\n				}\n			"
		}, r = new rr(5, 5, 5), a = new pr({
			name: "CubemapFromEquirect",
			uniforms: ar(n.uniforms),
			vertexShader: n.vertexShader,
			fragmentShader: n.fragmentShader,
			side: 1,
			blending: 0
		});
		a.uniforms.tEquirect.value = t;
		let o = new Vn(r, a), s = t.minFilter;
		return t.minFilter === 1008 && (t.minFilter = i), new Yr(1, 10, this).update(e, o), t.minFilter = s, o.geometry.dispose(), o.material.dispose(), this;
	}
	clear(e, t = !0, n = !0, r = !0) {
		let i = e.getRenderTarget();
		for (let i = 0; i < 6; i++) e.setRenderTarget(this, i), e.clear(t, n, r);
		e.setRenderTarget(i);
	}
}, wi = 256, Ti = 3, Ei = 20, Di = 256, Oi = 16, ki = 3, Ai = /*@__PURE__*/ new G(), ji = /*@__PURE__*/ new gt(), Mi = class e {
	constructor(e) {
		this._renderer = e, this._cubeSize = 0, this._sourceTarget = null, this._cubeCamera = new Yr(1, 10, null), this._boxMesh = new Vn(new rr(5, 5, 5), null), this._cubemapMaterial = null, this._equirectMaterial = null, this._blurMaterial = null, this._ggxMaterial = null, this._integrationMaterial = null;
	}
	fromScene(e, t = 0, n = .1, r = 100, i = {}) {
		let { size: a = 256, position: o = Ai } = i, s = this._renderer;
		this._setSize(a);
		let c = this._allocateTarget(), l = this._getSourceTarget(!0);
		t > 0 && (l.texture.mipmapsAutoUpdate = !1);
		let u = s.autoClear, d = s.autoClearColor, f = s.autoClearDepth, p = s.autoClearStencil, m = e.background;
		s.autoClear = !0, s.autoClearColor = !0, s.autoClearDepth = !0, s.autoClearStencil = !0, m === null && (e.background = s.getClearColor(ji));
		let h = new Yr(n, r, l);
		return h.position.copy(o), h.update(s, e), s.autoClear = u, s.autoClearColor = d, s.autoClearDepth = f, s.autoClearStencil = p, e.background = m, t > 0 && (l.texture.mipmapsAutoUpdate = !0, this._blur(c, t)), this._applyPMREM(c), c;
	}
	fromEquirectangular(e, t = null) {
		return this._fromTexture(e, t);
	}
	fromCubemap(e, t = null) {
		return this._fromTexture(e, t);
	}
	compileCubemapShader() {
		this._cubemapMaterial === null && (this._cubemapMaterial = zi(), this._compileMaterial(this._cubemapMaterial));
	}
	compileEquirectangularShader() {
		this._equirectMaterial === null && (this._equirectMaterial = Ri(), this._compileMaterial(this._equirectMaterial));
	}
	dispose() {
		this._sourceTarget !== null && this._sourceTarget.dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose(), this._blurMaterial !== null && this._blurMaterial.dispose(), this._ggxMaterial !== null && this._ggxMaterial.dispose(), this._integrationMaterial !== null && this._integrationMaterial.dispose(), this._boxMesh.geometry.dispose();
	}
	static lodToRoughness(e, t) {
		return t > 0 ? 1 - Math.sqrt(1 - e / t) : 0;
	}
	_setSize(e) {
		this._cubeSize = Math.max(wi, pe(e));
	}
	_fromTexture(e, t) {
		e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? wi : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4);
		let n = t || this._allocateTarget();
		return this._textureToCubemap(e), this._applyPMREM(n), n;
	}
	_allocateTarget() {
		let e = this._cubeSize, t = Ni(e, !1, !1), n = Math.log2(e) - Ti;
		for (let r = 0; r <= n; r++) t.texture.mipmaps.push({
			width: e >> r,
			height: e >> r
		});
		return t.texture.name = "PMREM", t.texture.isPMREMTexture = !0, t;
	}
	_getSourceTarget(e = !1) {
		let t = this._cubeSize, n = this._sourceTarget;
		return (n === null || n.width !== t || e && n.depthBuffer === !1) && (n !== null && n.dispose(), this._sourceTarget = Ni(t, !0, e)), this._sourceTarget;
	}
	_compileMaterial(e) {
		this._boxMesh.material = e, this._renderer.compile(this._boxMesh, this._cubeCamera.children[0]);
	}
	_renderCube(e, t, n) {
		let r = this._boxMesh, i = this._cubeCamera;
		r.material = n, i.renderTarget = e, i.activeMipmapLevel = t;
		let a = e.width >> t;
		e.viewport.set(0, 0, a, a), i.update(this._renderer, r), e.viewport.set(0, 0, e.width, e.height);
	}
	_textureToCubemap(e) {
		let t;
		e.mapping === 301 || e.mapping === 302 ? (this._cubemapMaterial === null && (this._cubemapMaterial = zi()), t = this._cubemapMaterial, t.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : (this._equirectMaterial === null && (this._equirectMaterial = Ri()), t = this._equirectMaterial), t.uniforms.envMap.value = e, this._renderCube(this._getSourceTarget(), 0, t);
	}
	_applyPMREM(t) {
		this._ggxMaterial === null && (this._ggxMaterial = Fi(), this._integrationMaterial = Ii());
		let n = this._cubeSize, r = t.texture.mipmaps.length - 1, i = this._ggxMaterial.uniforms;
		i.envMap.value = this._sourceTarget.texture;
		let a = this._integrationMaterial.uniforms;
		a.envMap.value = this._sourceTarget.texture, a.sourceLod.value = Math.log2(n / Oi);
		for (let o = 0; o <= r; o++) {
			let s = e.lodToRoughness(o, r);
			if (o > r - ki) a.roughness.value = s, this._renderCube(t, o, this._integrationMaterial);
			else {
				let e = s > 0 ? Math.log2(n) + .5 * Math.log2(6 / (Di * s ** 4)) + .5 : 0;
				i.roughness.value = s, i.lodBias.value = e, this._renderCube(t, o, this._ggxMaterial);
			}
		}
	}
	_blur(e, t) {
		this._blurMaterial === null && (this._blurMaterial = Li());
		let n = this._blurMaterial, r = n.uniforms, i = this._sourceTarget;
		r.sigma.value = Math.min(t, Math.PI) / Math.SQRT2, r.envMap.value = i.texture, this._renderCube(e, 0, n), r.envMap.value = e.texture, this._renderCube(i, 0, n);
	}
};
function Ni(e, t, n) {
	return new Ci(e, {
		minFilter: a,
		generateMipmaps: t,
		type: u,
		colorSpace: k,
		depthBuffer: n
	});
}
function Pi(e, t, n) {
	return new pr({
		name: e,
		uniforms: t,
		vertexShader: Q.cube_vert,
		fragmentShader: n,
		side: 1,
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function Fi() {
	return Pi("PMREMGGXConvolution", {
		envMap: { value: null },
		roughness: { value: 0 },
		lodBias: { value: 0 }
	}, `

		#define GGX_SAMPLES ${Di}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`);
}
function Ii() {
	return Pi("PMREMGGXIntegration", {
		envMap: { value: null },
		roughness: { value: 0 },
		sourceLod: { value: 0 },
		sourceSize: { value: Oi }
	}, "\n\n		varying vec3 vWorldDirection;\n\n		uniform samplerCube envMap;\n		uniform float roughness;\n		uniform float sourceLod;\n		uniform int sourceSize;\n\n		void main() {\n\n			vec3 N = normalize( vWorldDirection );\n\n			float alpha = roughness * roughness;\n			float alpha2 = alpha * alpha;\n\n			float texelSize = 2.0 / float( sourceSize );\n\n			vec3 prefilteredColor = vec3( 0.0 );\n			float totalWeight = 0.0;\n\n			// Pair opposite texels: only the one in N's hemisphere contributes.\n			for ( int face = 0; face < 3; face ++ ) {\n\n				for ( int y = 0; y < sourceSize; y ++ ) {\n\n					for ( int x = 0; x < sourceSize; x ++ ) {\n\n						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;\n						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );\n\n						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );\n						float NdotL = dot( N, texelDirection );\n						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;\n						NdotL = abs( NdotL ) * invDistance;\n\n						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors\n						// in the GGX distribution and texel solid angle cancel when normalized.\n						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;\n						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );\n\n						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;\n						totalWeight += weight;\n\n					}\n\n				}\n\n			}\n\n			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );\n\n		}\n	");
}
function Li() {
	return Pi("PMREMSphericalGaussianBlur", {
		envMap: { value: null },
		sigma: { value: 0 }
	}, `

		#define SAMPLES ${Ei}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`);
}
function Ri() {
	return Pi("PMREMEquirectangularToCubemap", { envMap: { value: null } }, "\n\n		varying vec3 vWorldDirection;\n\n		uniform sampler2D envMap;\n\n		#include <common>\n\n		void main() {\n\n			// Average four subpixel samples to preserve small, bright features.\n			vec3 direction = normalize( vWorldDirection );\n			vec3 dx = dFdx( direction ) * 0.25;\n			vec3 dy = dFdy( direction ) * 0.25;\n\n			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;\n			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;\n			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;\n			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;\n			gl_FragColor = vec4( color * 0.25, 1.0 );\n\n		}\n	");
}
function zi() {
	return Pi("PMREMCubemapToCubemap", {
		envMap: { value: null },
		flipEnvMap: { value: -1 }
	}, "\n\n		varying vec3 vWorldDirection;\n\n		uniform samplerCube envMap;\n		uniform float flipEnvMap;\n\n		void main() {\n\n			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );\n\n		}\n	");
}
function Bi(e) {
	let t = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap(), r = null;
	function i(e, t = !1) {
		return e == null ? null : t ? o(e) : a(e);
	}
	function a(n) {
		if (n && n.isTexture) {
			let r = n.mapping;
			if (r === 303 || r === 304) {
				if (t.has(n)) {
					let e = t.get(n).texture;
					return s(e, n.mapping);
				}
				{
					let r = n.image;
					if (r && r.height > 0) {
						let i = new Ci(r.height);
						return i.fromEquirectangularTexture(e, n), t.set(n, i), n.addEventListener("dispose", l), s(i.texture, n.mapping);
					}
					return null;
				}
			}
		}
		return n;
	}
	function o(t) {
		if (t && t.isTexture && t.isPMREMTexture !== !0) {
			let i = t.mapping, a = i === 303 || i === 304, o = i === 301 || i === 302;
			if (a || o) {
				let i = n.get(t), s = i === void 0 ? 0 : i.texture.pmremVersion;
				if (t.isRenderTargetTexture && t.pmremVersion !== s) return r === null && (r = new Mi(e)), i = a ? r.fromEquirectangular(t, i) : r.fromCubemap(t, i), i.texture.pmremVersion = t.pmremVersion, n.set(t, i), i.texture;
				if (i !== void 0) return i.texture;
				{
					let s = t.image;
					return a && s && s.height > 0 || o && s && c(s) ? (r === null && (r = new Mi(e)), i = a ? r.fromEquirectangular(t) : r.fromCubemap(t), i.texture.pmremVersion = t.pmremVersion, n.set(t, i), t.addEventListener("dispose", u), i.texture) : null;
				}
			}
		}
		return t;
	}
	function s(e, t) {
		return t === 303 ? e.mapping = 301 : t === 304 && (e.mapping = 302), e;
	}
	function c(e) {
		let t = 0;
		for (let n = 0; n < 6; n++) e[n] !== void 0 && t++;
		return t === 6;
	}
	function l(e) {
		let n = e.target;
		n.removeEventListener("dispose", l);
		let r = t.get(n);
		r !== void 0 && (t.delete(n), r.dispose());
	}
	function u(e) {
		let t = e.target;
		t.removeEventListener("dispose", u);
		let r = n.get(t);
		r !== void 0 && (n.delete(t), r.dispose());
	}
	function d() {
		t = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap(), r !== null && (r.dispose(), r = null);
	}
	return {
		get: i,
		dispose: d
	};
}
function Vi(e) {
	let t = {};
	function n(n) {
		if (t[n] !== void 0) return t[n];
		let r = e.getExtension(n);
		return t[n] = r, r;
	}
	return {
		has: function(e) {
			return n(e) !== null;
		},
		init: function() {
			n("EXT_color_buffer_float"), n("WEBGL_clip_cull_distance"), n("OES_texture_float_linear"), n("EXT_color_buffer_half_float"), n("WEBGL_multisampled_render_to_texture"), n("WEBGL_render_shared_exponent");
		},
		get: function(e) {
			let t = n(e);
			return t === null && ie("WebGLRenderer: " + e + " extension not supported."), t;
		}
	};
}
function Hi(e, t, n, r) {
	let i = {}, a = /* @__PURE__ */ new WeakMap(), o = new FinalizationRegistry((e) => delete i[e]);
	function s(e) {
		c(e.target);
	}
	function c(e) {
		e.index !== null && t.remove(e.index);
		for (let n in e.attributes) t.remove(e.attributes[n]);
		e.removeEventListener("dispose", s), delete i[e.id], o.unregister(e);
		let c = a.get(e);
		c && (t.remove(c), a.delete(e)), r.releaseStatesOfGeometry(e), e.isInstancedBufferGeometry === !0 && delete e._maxInstanceCount, n.memory.geometries--;
	}
	function l(e, t) {
		return i[t.id] === void 0 && (t.addEventListener("dispose", s), i[t.id] = new WeakRef(t), o.register(t, t.id, t), n.memory.geometries++), t;
	}
	function u(n) {
		let r = n.attributes;
		for (let n in r) t.update(r[n], e.ARRAY_BUFFER);
	}
	function d(e) {
		let n = e.index, r = e.attributes.position, i = 0;
		if (r === void 0) return;
		let o = n === null ? r.array.length / 3 - 1 : n.array.length, s = new (r.count >= 65535 ? $t : Qt)(Math.ceil(o / 3) * 6, 1), c = s.array;
		if (n !== null) {
			let e = n.array;
			i = n.version;
			for (let t = 0, n = 0; t < o; t += 3) {
				let r = e[t + 0], i = e[t + 1], a = e[t + 2];
				c[n++] = r, c[n++] = i, c[n++] = i, c[n++] = a, c[n++] = a, c[n++] = r;
			}
		} else {
			i = r.version;
			for (let e = 0, t = 0; e < o; e += 3) {
				let n = e + 0, r = e + 1, i = e + 2;
				c[t++] = n, c[t++] = r, c[t++] = r, c[t++] = i, c[t++] = i, c[t++] = n;
			}
		}
		s.version = i;
		let l = a.get(e);
		l && t.remove(l), a.set(e, s);
	}
	function f(e) {
		let t = a.get(e);
		if (t) {
			let n = e.index;
			n !== null && t.version < n.version && d(e);
		} else d(e);
		return a.get(e);
	}
	function p() {
		for (let e in i) {
			let t = i[e].deref();
			t !== void 0 && c(t);
		}
	}
	return {
		get: l,
		update: u,
		getWireframeAttribute: f,
		dispose: p
	};
}
function Ui(e, t, n) {
	let r;
	function i(e) {
		r = e;
	}
	let a, o;
	function s(e) {
		a = e.type, o = e.bytesPerElement;
	}
	function c(t, i) {
		e.drawElements(r, i, a, t * o), n.update(i, r, 1);
	}
	function l(t, i, s) {
		s !== 0 && (e.drawElementsInstanced(r, i, a, t * o, s), n.update(i, r, s));
	}
	function u(e, i, o) {
		if (o === 0) return;
		t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r, i, 0, a, e, 0, o);
		let s = 0;
		for (let e = 0; e < o; e++) s += i[e];
		n.update(s, r, 1);
	}
	this.setMode = i, this.setIndex = s, this.render = c, this.renderInstances = l, this.renderMultiDraw = u;
}
function Wi(e) {
	let t = {
		geometries: 0,
		textures: 0
	}, n = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};
	function r(t, r, i) {
		switch (n.calls++, r) {
			case e.TRIANGLES:
				n.triangles += t / 3 * i;
				break;
			case e.LINES:
				n.lines += t / 2 * i;
				break;
			case e.LINE_STRIP:
				n.lines += i * (t - 1);
				break;
			case e.LINE_LOOP:
				n.lines += i * t;
				break;
			case e.POINTS:
				n.points += i * t;
				break;
			default: V("WebGLInfo: Unknown draw mode:", r);
		}
	}
	function i() {
		n.calls = 0, n.triangles = 0, n.points = 0, n.lines = 0;
	}
	return {
		memory: t,
		render: n,
		programs: null,
		autoReset: !0,
		reset: i,
		update: r
	};
}
function Gi(e, t, n) {
	let r = /* @__PURE__ */ new WeakMap(), i = new Ne();
	function a(a, o, s) {
		let c = a.morphTargetInfluences, u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = u === void 0 ? 0 : u.length, f = r.get(o);
		if (f === void 0 || f.count !== d) {
			f !== void 0 && f.texture.dispose();
			let e = o.morphAttributes.position !== void 0, n = o.morphAttributes.normal !== void 0, a = o.morphAttributes.color !== void 0, s = o.morphAttributes.position || [], c = o.morphAttributes.normal || [], u = o.morphAttributes.color || [], p = 0;
			e === !0 && (p = 1), n === !0 && (p = 2), a === !0 && (p = 3);
			let m = o.attributes.position.count * p, h = 1;
			m > t.maxTextureSize && (h = Math.ceil(m / t.maxTextureSize), m = t.maxTextureSize);
			let g = new Float32Array(m * h * 4 * d), _ = new Y(g, m, h, d);
			_.type = l, _.needsUpdate = !0;
			let v = p * 4;
			for (let t = 0; t < d; t++) {
				let r = s[t], o = c[t], l = u[t], d = m * h * 4 * t;
				for (let t = 0; t < r.count; t++) {
					let s = t * v;
					e === !0 && (i.fromBufferAttribute(r, t), g[d + s + 0] = i.x, g[d + s + 1] = i.y, g[d + s + 2] = i.z, g[d + s + 3] = 0), n === !0 && (i.fromBufferAttribute(o, t), g[d + s + 4] = i.x, g[d + s + 5] = i.y, g[d + s + 6] = i.z, g[d + s + 7] = 0), a === !0 && (i.fromBufferAttribute(l, t), g[d + s + 8] = i.x, g[d + s + 9] = i.y, g[d + s + 10] = i.z, g[d + s + 11] = l.itemSize === 4 ? i.w : 1);
				}
			}
			f = {
				count: d,
				texture: _,
				size: new W(m, h)
			}, r.set(o, f);
			function y() {
				_.dispose(), r.delete(o), o.removeEventListener("dispose", y);
			}
			o.addEventListener("dispose", y);
		}
		if (a.isInstancedMesh === !0 && a.morphTexture !== null) s.getUniforms().setValue(e, "morphTexture", a.morphTexture, n);
		else {
			let t = 0;
			for (let e = 0; e < c.length; e++) t += c[e];
			let n = o.morphTargetsRelative ? 1 : 1 - t;
			s.getUniforms().setValue(e, "morphTargetBaseInfluence", n), s.getUniforms().setValue(e, "morphTargetInfluences", c);
		}
		s.getUniforms().setValue(e, "morphTargetsTexture", f.texture, n), s.getUniforms().setValue(e, "morphTargetsTextureSize", f.size);
	}
	return { update: a };
}
function Ki(e, t, n, r, i) {
	let a = /* @__PURE__ */ new WeakMap();
	function o(r) {
		let o = i.render.frame, s = r.geometry, l = t.get(r, s);
		if (a.get(l) !== o && (t.update(l), a.set(l, o)), r.isInstancedMesh && (r.hasEventListener("dispose", c) === !1 && r.addEventListener("dispose", c), a.get(r) !== o && (n.update(r.instanceMatrix, e.ARRAY_BUFFER), r.instanceColor !== null && n.update(r.instanceColor, e.ARRAY_BUFFER), a.set(r, o))), r.isSkinnedMesh) {
			let e = r.skeleton;
			a.get(e) !== o && (e.update(), a.set(e, o));
		}
		return l;
	}
	function s() {
		a = /* @__PURE__ */ new WeakMap();
	}
	function c(e) {
		let t = e.target;
		t.removeEventListener("dispose", c), r.releaseStatesOfObject(t), n.remove(t.instanceMatrix), t.instanceColor !== null && n.remove(t.instanceColor);
	}
	return {
		update: o,
		dispose: s
	};
}
var qi = {
	1: "LINEAR_TONE_MAPPING",
	2: "REINHARD_TONE_MAPPING",
	3: "CINEON_TONE_MAPPING",
	4: "ACES_FILMIC_TONE_MAPPING",
	6: "AGX_TONE_MAPPING",
	7: "NEUTRAL_TONE_MAPPING",
	5: "CUSTOM_TONE_MAPPING"
};
function Ji(e, t, n, r, i, a) {
	let o = new Fe(t, n, {
		type: e,
		depthBuffer: i,
		stencilBuffer: a,
		samples: r ? 4 : 0,
		storeMultisampledDepthBuffer: !1,
		storeMultisampledStencilBuffer: !1,
		resolveDepthBuffer: !1,
		resolveStencilBuffer: !1
	}), s = null, c = null, l = null, d = new pn();
	d.setAttribute("position", new en([
		-1,
		3,
		0,
		-1,
		-1,
		0,
		3,
		-1,
		0
	], 3)), d.setAttribute("uv", new en([
		0,
		2,
		0,
		0,
		2,
		0
	], 2));
	let f = new mr({
		uniforms: { tDiffuse: { value: null } },
		vertexShader: "\n			precision highp float;\n\n			uniform mat4 modelViewMatrix;\n			uniform mat4 projectionMatrix;\n\n			attribute vec3 position;\n			attribute vec2 uv;\n\n			varying vec2 vUv;\n\n			void main() {\n				vUv = uv;\n				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n			}",
		fragmentShader: "\n			precision highp float;\n\n			uniform sampler2D tDiffuse;\n\n			varying vec2 vUv;\n\n			#include <tonemapping_pars_fragment>\n			#include <colorspace_pars_fragment>\n\n			void main() {\n				gl_FragColor = texture2D( tDiffuse, vUv );\n\n				#ifdef LINEAR_TONE_MAPPING\n					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );\n				#elif defined( REINHARD_TONE_MAPPING )\n					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );\n				#elif defined( CINEON_TONE_MAPPING )\n					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );\n				#elif defined( ACES_FILMIC_TONE_MAPPING )\n					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );\n				#elif defined( AGX_TONE_MAPPING )\n					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );\n				#elif defined( NEUTRAL_TONE_MAPPING )\n					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );\n				#elif defined( CUSTOM_TONE_MAPPING )\n					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );\n				#endif\n\n				#ifdef SRGB_TRANSFER\n					gl_FragColor = sRGBTransferOETF( gl_FragColor );\n				#endif\n			}",
		depthTest: !1,
		depthWrite: !1
	}), m = new Vn(d, f), h = new Gr(-1, 1, 1, -1, 0, 1), _ = null, v = null, y = !1, b, x = null, S = [], C = !1;
	this.setSize = function(e, t) {
		o.setSize(e, t), s !== null && s.setSize(e, t), c !== null && c.setSize(e, t);
		for (let n = 0; n < S.length; n++) {
			let r = S[n];
			r.setSize && r.setSize(e, t);
		}
	}, this.setEffects = function(e) {
		S = e, C = S.length > 0 && S[0].isRenderPass === !0;
		let t = o.width, n = o.height;
		S.length > 0 && s === null && (s = new Fe(t, n, {
			type: u,
			depthBuffer: !1,
			stencilBuffer: !1
		}), c = new Fe(t, n, {
			type: u,
			depthBuffer: !1,
			stencilBuffer: !1
		}));
		let r = i === !0 && S.some((e) => e.needsDepthTexture === !0);
		r !== (o.depthTexture !== null) && (r === !0 && l === null && (l = new er(t, n), a === !0 && (l.format = g, l.type = p)), o.dispose(), o.depthTexture = r ? l : null, o.resolveDepthBuffer = r, o.storeMultisampledDepthBuffer = r);
		for (let e = 0; e < S.length; e++) {
			let i = S[e];
			i.setSize && i.setSize(t, n), r && i.needsDepthTexture === !0 && i.setDepthTexture && i.setDepthTexture(l);
		}
	}, this.begin = function(e, t) {
		if (y || e.toneMapping === 0 && S.length === 0) return !1;
		if (x = t, t !== null) {
			let e = t.width, n = t.height;
			(o.width !== e || o.height !== n) && this.setSize(e, n);
		}
		return C === !1 && e.setRenderTarget(o), b = e.toneMapping, e.toneMapping = 0, !0;
	}, this.hasRenderPass = function() {
		return C;
	}, this.end = function(e, t) {
		e.toneMapping = b, y = !0;
		let n = o, r = s;
		for (let i = 0; i < S.length; i++) {
			let a = S[i];
			a.enabled !== !1 && (a.render(e, r, n, t), a.needsSwap !== !1 && (n = r, r = r === s ? c : s));
		}
		if (_ !== e.outputColorSpace || v !== e.toneMapping) {
			_ = e.outputColorSpace, v = e.toneMapping, f.defines = {}, q.getTransfer(_) === "srgb" && (f.defines.SRGB_TRANSFER = "");
			let t = qi[v];
			t && (f.defines[t] = ""), f.needsUpdate = !0;
		}
		f.uniforms.tDiffuse.value = n.texture, e.setRenderTarget(x), e.render(m, h), x = null, y = !1;
	}, this.isCompositing = function() {
		return y;
	}, this.dispose = function() {
		o.dispose(), s !== null && s.dispose(), c !== null && c.dispose(), d.dispose(), f.dispose();
	};
}
var Yi = /*@__PURE__*/ new Me(), Xi = /*@__PURE__*/ new er(1, 1), Zi = /*@__PURE__*/ new tr(1), Qi = /*@__PURE__*/ new Y(), $i = /*@__PURE__*/ new Ie(), ea = /*@__PURE__*/ new Qn(), ta = [], na = [], ra = /* @__PURE__ */ new Float32Array(16), ia = /* @__PURE__ */ new Float32Array(9), aa = /* @__PURE__ */ new Float32Array(4);
function oa(e, t, n) {
	let r = e[0];
	if (r <= 0 || r > 0) return e;
	let i = t * n, a = ta[i];
	if (a === void 0 && (a = new Float32Array(i), ta[i] = a), t !== 0) {
		r.toArray(a, 0);
		for (let r = 1, i = 0; r !== t; ++r) i += n, e[r].toArray(a, i);
	}
	return a;
}
function sa(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0, r = e.length; n < r; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function ca(e, t) {
	for (let n = 0, r = t.length; n < r; n++) e[n] = t[n];
}
function la(e, t) {
	let n = na[t];
	n === void 0 && (n = new Int32Array(t), na[t] = n);
	for (let r = 0; r !== t; ++r) n[r] = e.allocateTextureUnit();
	return n;
}
function ua(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1f(this.addr, t), n[0] = t);
}
function da(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2f(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (sa(n, t)) return;
		e.uniform2fv(this.addr, t), ca(n, t);
	}
}
function fa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3f(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else if (t.r !== void 0) (n[0] !== t.r || n[1] !== t.g || n[2] !== t.b) && (e.uniform3f(this.addr, t.r, t.g, t.b), n[0] = t.r, n[1] = t.g, n[2] = t.b);
	else {
		if (sa(n, t)) return;
		e.uniform3fv(this.addr, t), ca(n, t);
	}
}
function pa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4f(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (sa(n, t)) return;
		e.uniform4fv(this.addr, t), ca(n, t);
	}
}
function ma(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (sa(n, t)) return;
		e.uniformMatrix2fv(this.addr, !1, t), ca(n, t);
	} else {
		if (sa(n, r)) return;
		aa.set(r), e.uniformMatrix2fv(this.addr, !1, aa), ca(n, r);
	}
}
function ha(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (sa(n, t)) return;
		e.uniformMatrix3fv(this.addr, !1, t), ca(n, t);
	} else {
		if (sa(n, r)) return;
		ia.set(r), e.uniformMatrix3fv(this.addr, !1, ia), ca(n, r);
	}
}
function ga(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (sa(n, t)) return;
		e.uniformMatrix4fv(this.addr, !1, t), ca(n, t);
	} else {
		if (sa(n, r)) return;
		ra.set(r), e.uniformMatrix4fv(this.addr, !1, ra), ca(n, r);
	}
}
function _a(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1i(this.addr, t), n[0] = t);
}
function va(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2i(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (sa(n, t)) return;
		e.uniform2iv(this.addr, t), ca(n, t);
	}
}
function ya(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3i(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else {
		if (sa(n, t)) return;
		e.uniform3iv(this.addr, t), ca(n, t);
	}
}
function ba(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4i(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (sa(n, t)) return;
		e.uniform4iv(this.addr, t), ca(n, t);
	}
}
function xa(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1ui(this.addr, t), n[0] = t);
}
function Sa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2ui(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (sa(n, t)) return;
		e.uniform2uiv(this.addr, t), ca(n, t);
	}
}
function Ca(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3ui(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else {
		if (sa(n, t)) return;
		e.uniform3uiv(this.addr, t), ca(n, t);
	}
}
function wa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4ui(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (sa(n, t)) return;
		e.uniform4uiv(this.addr, t), ca(n, t);
	}
}
function Ta(e) {
	return e.version === 0 && (e.compareFunction = 519, e.needsUpdate = !0), e;
}
function Ea(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i);
	let a;
	a = this.type === e.SAMPLER_2D_SHADOW ? Ta(Xi) : Yi, n.setTexture2D(t || a, i);
}
function Da(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTexture3D(t || $i, i);
}
function Oa(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i);
	let a;
	a = this.type === e.SAMPLER_CUBE_SHADOW ? Ta(Zi) : ea, n.setTextureCube(t || a, i);
}
function ka(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTexture2DArray(t || Qi, i);
}
function Aa(e) {
	switch (e) {
		case 5126: return ua;
		case 35664: return da;
		case 35665: return fa;
		case 35666: return pa;
		case 35674: return ma;
		case 35675: return ha;
		case 35676: return ga;
		case 5124:
		case 35670: return _a;
		case 35667:
		case 35671: return va;
		case 35668:
		case 35672: return ya;
		case 35669:
		case 35673: return ba;
		case 5125: return xa;
		case 36294: return Sa;
		case 36295: return Ca;
		case 36296: return wa;
		case 35678:
		case 36198:
		case 36298:
		case 36306:
		case 35682: return Ea;
		case 35679:
		case 36299:
		case 36307: return Da;
		case 35680:
		case 36300:
		case 36308:
		case 36293: return Oa;
		case 36289:
		case 36303:
		case 36311:
		case 36292: return ka;
	}
}
function ja(e, t) {
	e.uniform1fv(this.addr, t);
}
function Ma(e, t) {
	let n = oa(t, this.size, 2);
	e.uniform2fv(this.addr, n);
}
function Na(e, t) {
	let n = oa(t, this.size, 3);
	e.uniform3fv(this.addr, n);
}
function Pa(e, t) {
	let n = oa(t, this.size, 4);
	e.uniform4fv(this.addr, n);
}
function Fa(e, t) {
	let n = oa(t, this.size, 4);
	e.uniformMatrix2fv(this.addr, !1, n);
}
function Ia(e, t) {
	let n = oa(t, this.size, 9);
	e.uniformMatrix3fv(this.addr, !1, n);
}
function La(e, t) {
	let n = oa(t, this.size, 16);
	e.uniformMatrix4fv(this.addr, !1, n);
}
function Ra(e, t) {
	e.uniform1iv(this.addr, t);
}
function za(e, t) {
	e.uniform2iv(this.addr, t);
}
function Ba(e, t) {
	e.uniform3iv(this.addr, t);
}
function Va(e, t) {
	e.uniform4iv(this.addr, t);
}
function Ha(e, t) {
	e.uniform1uiv(this.addr, t);
}
function Ua(e, t) {
	e.uniform2uiv(this.addr, t);
}
function Wa(e, t) {
	e.uniform3uiv(this.addr, t);
}
function Ga(e, t) {
	e.uniform4uiv(this.addr, t);
}
function Ka(e, t, n) {
	let r = this.cache, i = t.length, a = la(n, i);
	sa(r, a) || (e.uniform1iv(this.addr, a), ca(r, a));
	let o;
	o = this.type === e.SAMPLER_2D_SHADOW ? Ta(Xi) : Yi;
	for (let e = 0; e !== i; ++e) n.setTexture2D(t[e] || o, a[e]);
}
function qa(e, t, n) {
	let r = this.cache, i = t.length, a = la(n, i);
	sa(r, a) || (e.uniform1iv(this.addr, a), ca(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture3D(t[e] || $i, a[e]);
}
function Ja(e, t, n) {
	let r = this.cache, i = t.length, a = la(n, i);
	sa(r, a) || (e.uniform1iv(this.addr, a), ca(r, a));
	let o;
	o = this.type === e.SAMPLER_CUBE_SHADOW ? Ta(Zi) : ea;
	for (let e = 0; e !== i; ++e) n.setTextureCube(t[e] || o, a[e]);
}
function Ya(e, t, n) {
	let r = this.cache, i = t.length, a = la(n, i);
	sa(r, a) || (e.uniform1iv(this.addr, a), ca(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture2DArray(t[e] || Qi, a[e]);
}
function Xa(e) {
	switch (e) {
		case 5126: return ja;
		case 35664: return Ma;
		case 35665: return Na;
		case 35666: return Pa;
		case 35674: return Fa;
		case 35675: return Ia;
		case 35676: return La;
		case 5124:
		case 35670: return Ra;
		case 35667:
		case 35671: return za;
		case 35668:
		case 35672: return Ba;
		case 35669:
		case 35673: return Va;
		case 5125: return Ha;
		case 36294: return Ua;
		case 36295: return Wa;
		case 36296: return Ga;
		case 35678:
		case 36198:
		case 36298:
		case 36306:
		case 35682: return Ka;
		case 35679:
		case 36299:
		case 36307: return qa;
		case 35680:
		case 36300:
		case 36308:
		case 36293: return Ja;
		case 36289:
		case 36303:
		case 36311:
		case 36292: return Ya;
	}
}
var Za = class {
	constructor(e, t, n) {
		this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = Aa(t.type);
	}
}, Qa = class {
	constructor(e, t, n) {
		this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Xa(t.type);
	}
}, $a = class {
	constructor(e) {
		this.id = e, this.seq = [], this.map = {};
	}
	setValue(e, t, n) {
		let r = this.seq;
		for (let i = 0, a = r.length; i !== a; ++i) {
			let a = r[i];
			a.setValue(e, t[a.id], n);
		}
	}
}, eo = /(\w+)(\])?(\[|\.)?/g;
function to(e, t) {
	e.seq.push(t), e.map[t.id] = t;
}
function no(e, t, n) {
	let r = e.name, i = r.length;
	for (eo.lastIndex = 0;;) {
		let a = eo.exec(r), o = eo.lastIndex, s = a[1], c = a[2] === "]", l = a[3];
		if (c && (s |= 0), l === void 0 || l === "[" && o + 2 === i) {
			to(n, l === void 0 ? new Za(s, e, t) : new Qa(s, e, t));
			break;
		}
		{
			let e = n.map[s];
			e === void 0 && (e = new $a(s), to(n, e)), n = e;
		}
	}
}
var ro = class {
	constructor(e, t) {
		this.seq = [], this.map = {};
		let n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
		for (let r = 0; r < n; ++r) {
			let n = e.getActiveUniform(t, r);
			no(n, e.getUniformLocation(t, n.name), this);
		}
		let r = [], i = [];
		for (let t of this.seq) t.type === e.SAMPLER_2D_SHADOW || t.type === e.SAMPLER_CUBE_SHADOW || t.type === e.SAMPLER_2D_ARRAY_SHADOW ? r.push(t) : i.push(t);
		r.length > 0 && (this.seq = r.concat(i));
	}
	setValue(e, t, n, r) {
		let i = this.map[t];
		i !== void 0 && i.setValue(e, n, r);
	}
	setOptional(e, t, n) {
		let r = t[n];
		r !== void 0 && this.setValue(e, n, r);
	}
	static upload(e, t, n, r) {
		for (let i = 0, a = t.length; i !== a; ++i) {
			let a = t[i], o = n[a.id];
			o.needsUpdate !== !1 && a.setValue(e, o.value, r);
		}
	}
	static seqWithValue(e, t) {
		let n = [];
		for (let r = 0, i = e.length; r !== i; ++r) {
			let i = e[r];
			i.id in t && n.push(i);
		}
		return n;
	}
};
function io(e, t, n) {
	let r = e.createShader(t);
	return e.shaderSource(r, n), e.compileShader(r), r;
}
var ao = 37297, oo = 0;
function so(e, t) {
	let n = e.split("\n"), r = [], i = Math.max(t - 6, 0), a = Math.min(t + 6, n.length);
	for (let e = i; e < a; e++) {
		let i = e + 1;
		r.push(`${i === t ? ">" : " "} ${i}: ${n[e]}`);
	}
	return r.join("\n");
}
var co = /*@__PURE__*/ new K();
function lo(e) {
	q._getMatrix(co, q.workingColorSpace, e);
	let t = `mat3( ${co.elements.map((e) => e.toFixed(4))} )`;
	switch (q.getTransfer(e)) {
		case A: return [t, "LinearTransferOETF"];
		case j: return [t, "sRGBTransferOETF"];
		default: return B("WebGLProgram: Unsupported color space: ", e), [t, "LinearTransferOETF"];
	}
}
function uo(e, t, n) {
	let r = e.getShaderParameter(t, e.COMPILE_STATUS), i = (e.getShaderInfoLog(t) || "").trim();
	if (r && i === "") return "";
	let a = /ERROR: 0:(\d+)/.exec(i);
	if (a) {
		let r = parseInt(a[1]);
		return n.toUpperCase() + "\n\n" + i + "\n\n" + so(e.getShaderSource(t), r);
	}
	return i;
}
function fo(e, t) {
	let n = lo(t);
	return [
		`vec4 ${e}( vec4 value ) {`,
		`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,
		"}"
	].join("\n");
}
var po = {
	1: "Linear",
	2: "Reinhard",
	3: "Cineon",
	4: "ACESFilmic",
	6: "AgX",
	7: "Neutral",
	5: "Custom"
};
function mo(e, t) {
	let n = po[t];
	return n === void 0 ? (B("WebGLProgram: Unsupported toneMapping:", t), "vec3 " + e + "( vec3 color ) { return LinearToneMapping( color ); }") : "vec3 " + e + "( vec3 color ) { return " + n + "ToneMapping( color ); }";
}
var ho = /*@__PURE__*/ new G();
function go() {
	return q.getLuminanceCoefficients(ho), [
		"float luminance( const in vec3 rgb ) {",
		`	const vec3 weights = vec3( ${ho.x.toFixed(4)}, ${ho.y.toFixed(4)}, ${ho.z.toFixed(4)} );`,
		"	return dot( weights, rgb );",
		"}"
	].join("\n");
}
function _o(e) {
	return [e.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", e.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(bo).join("\n");
}
function vo(e) {
	let t = [];
	for (let n in e) {
		let r = e[n];
		r !== !1 && t.push("#define " + n + " " + r);
	}
	return t.join("\n");
}
function yo(e, t) {
	let n = {}, r = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES);
	for (let i = 0; i < r; i++) {
		let r = e.getActiveAttrib(t, i), a = r.name, o = 1;
		r.type === e.FLOAT_MAT2 && (o = 2), r.type === e.FLOAT_MAT3 && (o = 3), r.type === e.FLOAT_MAT4 && (o = 4), n[a] = {
			type: r.type,
			location: e.getAttribLocation(t, a),
			locationSize: o
		};
	}
	return n;
}
function bo(e) {
	return e !== "";
}
function xo(e, t) {
	let n = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
	return e.replace(/NUM_SUN_LIGHTS/g, t.numSunLights).replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, n).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g, t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g, t.numLightProbeGrids);
}
function So(e, t) {
	return e.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
var Co = /^[ \t]*#include +<([\w\d./]+)>/gm;
function wo(e) {
	return e.replace(Co, To);
}
function To(e, t) {
	let n = Q[t];
	if (n === void 0) throw Error("THREE.WebGLProgram: Can not resolve #include <" + t + ">");
	return wo(n);
}
var Eo = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Do(e) {
	return e.replace(Eo, Oo);
}
function Oo(e, t, n, r) {
	let i = "";
	for (let e = parseInt(t); e < parseInt(n); e++) i += r.replace(/\[\s*i\s*\]/g, "[ " + e + " ]").replace(/UNROLLED_LOOP_INDEX/g, e);
	return i;
}
function ko(e) {
	let t = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;
	return e.precision === "highp" ? t += "\n#define HIGH_PRECISION" : e.precision === "mediump" ? t += "\n#define MEDIUM_PRECISION" : e.precision === "lowp" && (t += "\n#define LOW_PRECISION"), t;
}
var Ao = {
	1: "SHADOWMAP_TYPE_PCF",
	3: "SHADOWMAP_TYPE_VSM"
};
function jo(e) {
	return Ao[e.shadowMapType] || "SHADOWMAP_TYPE_BASIC";
}
var Mo = { 302: "ENVMAP_MODE_REFRACTION" };
function No(e) {
	return e.envMap === !1 ? "ENVMAP_MODE_REFLECTION" : Mo[e.envMapMode] || "ENVMAP_MODE_REFLECTION";
}
var Po = {
	0: "ENVMAP_BLENDING_MULTIPLY",
	1: "ENVMAP_BLENDING_MIX",
	2: "ENVMAP_BLENDING_ADD"
};
function Fo(e) {
	return e.envMap === !1 ? "ENVMAP_BLENDING_NONE" : Po[e.combine] || "ENVMAP_BLENDING_NONE";
}
function Io(e, t, n, r) {
	let i = e.getContext(), a = n.defines, o = n.vertexShader, s = n.fragmentShader, c = jo(n), l = n.envMapPMREM === !0 ? "ENVMAP_TYPE_PMREM" : "ENVMAP_TYPE_CUBE", u = No(n), d = Fo(n), f = _o(n), p = vo(a), m = i.createProgram(), h, g, _ = n.glslVersion ? "#version " + n.glslVersion + "\n" : "";
	n.isRawShaderMaterial ? (h = [
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		p
	].filter(bo).join("\n"), h.length > 0 && (h += "\n"), g = [
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		p
	].filter(bo).join("\n"), g.length > 0 && (g += "\n")) : (h = [
		ko(n),
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		p,
		n.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
		n.batching ? "#define USE_BATCHING" : "",
		n.batchingColor ? "#define USE_BATCHING_COLOR" : "",
		n.instancing ? "#define USE_INSTANCING" : "",
		n.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
		n.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
		n.useFog && n.fog ? "#define USE_FOG" : "",
		n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
		n.map ? "#define USE_MAP" : "",
		n.envMap ? "#define USE_ENVMAP" : "",
		n.envMap ? "#define " + u : "",
		n.lightMap ? "#define USE_LIGHTMAP" : "",
		n.aoMap ? "#define USE_AOMAP" : "",
		n.bumpMap ? "#define USE_BUMPMAP" : "",
		n.normalMap ? "#define USE_NORMALMAP" : "",
		n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
		n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
		n.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
		n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
		n.anisotropy ? "#define USE_ANISOTROPY" : "",
		n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
		n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
		n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
		n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
		n.diffuseRoughnessMap ? "#define USE_DIFFUSE_ROUGHNESSMAP" : "",
		n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
		n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
		n.specularMap ? "#define USE_SPECULARMAP" : "",
		n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
		n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
		n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
		n.metalnessMap ? "#define USE_METALNESSMAP" : "",
		n.alphaMap ? "#define USE_ALPHAMAP" : "",
		n.alphaHash ? "#define USE_ALPHAHASH" : "",
		n.transmission ? "#define USE_TRANSMISSION" : "",
		n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
		n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
		n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
		n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
		n.mapUv ? "#define MAP_UV " + n.mapUv : "",
		n.alphaMapUv ? "#define ALPHAMAP_UV " + n.alphaMapUv : "",
		n.lightMapUv ? "#define LIGHTMAP_UV " + n.lightMapUv : "",
		n.aoMapUv ? "#define AOMAP_UV " + n.aoMapUv : "",
		n.emissiveMapUv ? "#define EMISSIVEMAP_UV " + n.emissiveMapUv : "",
		n.bumpMapUv ? "#define BUMPMAP_UV " + n.bumpMapUv : "",
		n.normalMapUv ? "#define NORMALMAP_UV " + n.normalMapUv : "",
		n.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + n.displacementMapUv : "",
		n.metalnessMapUv ? "#define METALNESSMAP_UV " + n.metalnessMapUv : "",
		n.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + n.roughnessMapUv : "",
		n.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + n.anisotropyMapUv : "",
		n.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + n.clearcoatMapUv : "",
		n.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + n.clearcoatNormalMapUv : "",
		n.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + n.clearcoatRoughnessMapUv : "",
		n.diffuseRoughnessMapUv ? "#define DIFFUSE_ROUGHNESSMAP_UV " + n.diffuseRoughnessMapUv : "",
		n.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + n.iridescenceMapUv : "",
		n.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + n.iridescenceThicknessMapUv : "",
		n.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + n.sheenColorMapUv : "",
		n.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + n.sheenRoughnessMapUv : "",
		n.specularMapUv ? "#define SPECULARMAP_UV " + n.specularMapUv : "",
		n.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + n.specularColorMapUv : "",
		n.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + n.specularIntensityMapUv : "",
		n.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + n.transmissionMapUv : "",
		n.thicknessMapUv ? "#define THICKNESSMAP_UV " + n.thicknessMapUv : "",
		n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
		n.vertexNormals ? "#define HAS_NORMAL" : "",
		n.vertexColors ? "#define USE_COLOR" : "",
		n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
		n.vertexUv1s ? "#define USE_UV1" : "",
		n.vertexUv2s ? "#define USE_UV2" : "",
		n.vertexUv3s ? "#define USE_UV3" : "",
		n.pointsUvs ? "#define USE_POINTS_UV" : "",
		n.flatShading ? "#define FLAT_SHADED" : "",
		n.skinning ? "#define USE_SKINNING" : "",
		n.morphTargets ? "#define USE_MORPHTARGETS" : "",
		n.morphNormals && n.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
		n.morphColors ? "#define USE_MORPHCOLORS" : "",
		n.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + n.morphTextureStride : "",
		n.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + n.morphTargetsCount : "",
		n.doubleSided ? "#define DOUBLE_SIDED" : "",
		n.flipSided ? "#define FLIP_SIDED" : "",
		n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
		n.shadowMapEnabled ? "#define " + c : "",
		n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
		n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
		n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
		n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
		"uniform mat4 modelMatrix;",
		"uniform mat4 modelViewMatrix;",
		"uniform mat4 projectionMatrix;",
		"uniform mat4 viewMatrix;",
		"uniform mat3 normalMatrix;",
		"uniform vec3 cameraPosition;",
		"uniform bool isOrthographic;",
		"#ifdef USE_INSTANCING",
		"	attribute mat4 instanceMatrix;",
		"#endif",
		"#ifdef USE_INSTANCING_COLOR",
		"	attribute vec3 instanceColor;",
		"#endif",
		"#ifdef USE_INSTANCING_MORPH",
		"	uniform sampler2D morphTexture;",
		"#endif",
		"attribute vec3 position;",
		"attribute vec3 normal;",
		"attribute vec2 uv;",
		"#ifdef USE_UV1",
		"	attribute vec2 uv1;",
		"#endif",
		"#ifdef USE_UV2",
		"	attribute vec2 uv2;",
		"#endif",
		"#ifdef USE_UV3",
		"	attribute vec2 uv3;",
		"#endif",
		"#ifdef USE_TANGENT",
		"	attribute vec4 tangent;",
		"#endif",
		"#if defined( USE_COLOR_ALPHA )",
		"	attribute vec4 color;",
		"#elif defined( USE_COLOR )",
		"	attribute vec3 color;",
		"#endif",
		"#ifdef USE_SKINNING",
		"	attribute vec4 skinIndex;",
		"	attribute vec4 skinWeight;",
		"#endif",
		"\n"
	].filter(bo).join("\n"), g = [
		ko(n),
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		p,
		n.useFog && n.fog ? "#define USE_FOG" : "",
		n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
		n.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
		n.map ? "#define USE_MAP" : "",
		n.matcap ? "#define USE_MATCAP" : "",
		n.envMap ? "#define USE_ENVMAP" : "",
		n.envMap ? "#define " + l : "",
		n.envMap ? "#define " + u : "",
		n.envMap ? "#define " + d : "",
		n.envMapPMREM ? "#define ENVMAP_MAX_LOD " + n.envMapMaxLod + ".0" : "",
		n.envMapPMREM ? "#define ENVMAP_SIZE " + n.envMapSize + ".0" : "",
		n.lightMap ? "#define USE_LIGHTMAP" : "",
		n.aoMap ? "#define USE_AOMAP" : "",
		n.bumpMap ? "#define USE_BUMPMAP" : "",
		n.normalMap ? "#define USE_NORMALMAP" : "",
		n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
		n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
		n.packedNormalMap ? "#define USE_PACKED_NORMALMAP" : "",
		n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
		n.anisotropy ? "#define USE_ANISOTROPY" : "",
		n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
		n.clearcoat ? "#define USE_CLEARCOAT" : "",
		n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
		n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
		n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
		n.diffuseRoughness ? "#define USE_DIFFUSE_ROUGHNESS" : "",
		n.diffuseRoughnessMap ? "#define USE_DIFFUSE_ROUGHNESSMAP" : "",
		n.dispersion ? "#define USE_DISPERSION" : "",
		n.retroreflection ? "#define USE_RETROREFLECTION" : "",
		n.iridescence ? "#define USE_IRIDESCENCE" : "",
		n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
		n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
		n.specularMap ? "#define USE_SPECULARMAP" : "",
		n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
		n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
		n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
		n.metalnessMap ? "#define USE_METALNESSMAP" : "",
		n.alphaMap ? "#define USE_ALPHAMAP" : "",
		n.alphaTest ? "#define USE_ALPHATEST" : "",
		n.alphaHash ? "#define USE_ALPHAHASH" : "",
		n.sheen ? "#define USE_SHEEN" : "",
		n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
		n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
		n.transmission ? "#define USE_TRANSMISSION" : "",
		n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
		n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
		n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
		n.vertexColors || n.instancingColor ? "#define USE_COLOR" : "",
		n.vertexAlphas || n.batchingColor ? "#define USE_COLOR_ALPHA" : "",
		n.vertexUv1s ? "#define USE_UV1" : "",
		n.vertexUv2s ? "#define USE_UV2" : "",
		n.vertexUv3s ? "#define USE_UV3" : "",
		n.pointsUvs ? "#define USE_POINTS_UV" : "",
		n.gradientMap ? "#define USE_GRADIENTMAP" : "",
		n.flatShading ? "#define FLAT_SHADED" : "",
		n.doubleSided ? "#define DOUBLE_SIDED" : "",
		n.flipSided ? "#define FLIP_SIDED" : "",
		n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
		n.shadowMapEnabled ? "#define " + c : "",
		n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
		n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
		n.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
		n.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
		n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
		n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
		"uniform mat4 viewMatrix;",
		"uniform vec3 cameraPosition;",
		"uniform bool isOrthographic;",
		n.toneMapping === 0 ? "" : "#define TONE_MAPPING",
		n.toneMapping === 0 ? "" : Q.tonemapping_pars_fragment,
		n.toneMapping === 0 ? "" : mo("toneMapping", n.toneMapping),
		n.dithering ? "#define DITHERING" : "",
		n.opaque ? "#define OPAQUE" : "",
		Q.colorspace_pars_fragment,
		fo("linearToOutputTexel", n.outputColorSpace),
		go(),
		n.useDepthPacking ? "#define DEPTH_PACKING " + n.depthPacking : "",
		"\n"
	].filter(bo).join("\n")), o = wo(o), o = xo(o, n), o = So(o, n), s = wo(s), s = xo(s, n), s = So(s, n), o = Do(o), s = Do(s), n.isRawShaderMaterial !== !0 && (_ = "#version 300 es\n", h = [
		f,
		"#define attribute in",
		"#define varying out",
		"#define texture2D texture"
	].join("\n") + "\n" + h, g = [
		"#define varying in",
		n.glslVersion === "300 es" ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
		n.glslVersion === "300 es" ? "" : "#define gl_FragColor pc_fragColor",
		"#define gl_FragDepthEXT gl_FragDepth",
		"#define texture2D texture",
		"#define textureCube texture",
		"#define texture2DProj textureProj",
		"#define texture2DLodEXT textureLod",
		"#define texture2DProjLodEXT textureProjLod",
		"#define textureCubeLodEXT textureLod",
		"#define texture2DGradEXT textureGrad",
		"#define texture2DProjGradEXT textureProjGrad",
		"#define textureCubeGradEXT textureGrad"
	].join("\n") + "\n" + g);
	let v = _ + h + o, y = _ + g + s, b = io(i, i.VERTEX_SHADER, v), x = io(i, i.FRAGMENT_SHADER, y);
	i.attachShader(m, b), i.attachShader(m, x), n.index0AttributeName === void 0 ? n.hasPositionAttribute === !0 && i.bindAttribLocation(m, 0, "position") : i.bindAttribLocation(m, 0, n.index0AttributeName), i.linkProgram(m);
	function S(t) {
		if (e.debug.checkShaderErrors) {
			let n = i.getProgramInfoLog(m) || "", r = i.getShaderInfoLog(b) || "", a = i.getShaderInfoLog(x) || "", o = n.trim(), s = r.trim(), c = a.trim(), l = !0, u = !0;
			if (i.getProgramParameter(m, i.LINK_STATUS) === !1) {
				if (l = !1, typeof e.debug.onShaderError == "function") e.debug.onShaderError(i, m, b, x);
				else {
					let e = uo(i, b, "vertex"), n = uo(i, x, "fragment");
					V("WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(m, i.VALIDATE_STATUS) + "\n\nMaterial Name: " + t.name + "\nMaterial Type: " + t.type + "\n\nProgram Info Log: " + o + "\n" + e + "\n" + n);
				}
			} else o === "" ? (s === "" || c === "") && (u = !1) : B("WebGLProgram: Program Info Log:", o);
			u && (t.diagnostics = {
				runnable: l,
				programLog: o,
				vertexShader: {
					log: s,
					prefix: h
				},
				fragmentShader: {
					log: c,
					prefix: g
				}
			});
		}
		i.deleteShader(b), i.deleteShader(x), C = new ro(i, m), w = yo(i, m);
	}
	let C;
	this.getUniforms = function() {
		return C === void 0 && S(this), C;
	};
	let w;
	this.getAttributes = function() {
		return w === void 0 && S(this), w;
	};
	let T = n.rendererExtensionParallelShaderCompile === !1;
	return this.isReady = function() {
		return T === !1 && (T = i.getProgramParameter(m, ao)), T;
	}, this.destroy = function() {
		r.releaseStatesOfProgram(this), i.deleteProgram(m), this.program = void 0;
	}, this.type = n.shaderType, this.name = n.shaderName, this.id = oo++, this.cacheKey = t, this.usedTimes = 1, this.program = m, this.vertexShader = b, this.fragmentShader = x, this;
}
var Lo = 0, Ro = class {
	constructor() {
		this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
	}
	update(e, t, n) {
		let r = this._getShaderCacheForMaterial(e);
		return r.has(t) === !1 && (r.add(t), t.usedTimes++), r.has(n) === !1 && (r.add(n), n.usedTimes++), this;
	}
	remove(e) {
		let t = this.materialCache.get(e);
		for (let e of t) e.usedTimes--, e.usedTimes === 0 && this.shaderCache.delete(e.code);
		return this.materialCache.delete(e), this;
	}
	getVertexShaderStage(e) {
		return this._getShaderStage(e.vertexShader);
	}
	getFragmentShaderStage(e) {
		return this._getShaderStage(e.fragmentShader);
	}
	dispose() {
		this.shaderCache.clear(), this.materialCache.clear();
	}
	_getShaderCacheForMaterial(e) {
		let t = this.materialCache, n = t.get(e);
		return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
	}
	_getShaderStage(e) {
		let t = this.shaderCache, n = t.get(e);
		return n === void 0 && (n = new zo(e), t.set(e, n)), n;
	}
}, zo = class {
	constructor(e) {
		this.id = Lo++, this.code = e, this.usedTimes = 0;
	}
};
function Bo(e) {
	return e === 1030 || e === 37490 || e === 36285;
}
function Vo(e, t, n, r, i, a) {
	let o = new Ke(), s = new Ro(), c = /* @__PURE__ */ new Set(), l = [], u = /* @__PURE__ */ new Map(), d = r.logarithmicDepthBuffer, f = {
		MeshDepthMaterial: "depth",
		MeshDistanceMaterial: "distance",
		MeshNormalMaterial: "normal",
		MeshBasicMaterial: "basic",
		MeshLambertMaterial: "lambert",
		MeshPhongMaterial: "phong",
		MeshToonMaterial: "toon",
		MeshStandardMaterial: "physical",
		MeshPhysicalMaterial: "physical",
		MeshMatcapMaterial: "matcap",
		LineBasicMaterial: "basic",
		LineDashedMaterial: "dashed",
		PointsMaterial: "points",
		ShadowMaterial: "shadow",
		SpriteMaterial: "sprite"
	};
	function p(e) {
		return c.add(e), e === 0 ? "uv" : `uv${e}`;
	}
	function m(i, o, l, u, m, h) {
		let g = u.fog, _ = m.geometry, v = i.isMeshStandardMaterial || i.isMeshLambertMaterial || i.isMeshPhongMaterial ? u.environment : null, y = i.isMeshStandardMaterial || i.isMeshLambertMaterial && !i.envMap || i.isMeshPhongMaterial && !i.envMap, b = t.get(i.envMap || v, y), x = f[i.type], S = r.precision;
		i.precision !== null && (S = r.getMaxPrecision(i.precision), S !== i.precision && B("WebGLProgram.getParameters:", i.precision, "not supported, using", S, "instead."));
		let C = _.morphAttributes.position || _.morphAttributes.normal || _.morphAttributes.color, w = C === void 0 ? 0 : C.length, T = 0;
		_.morphAttributes.position !== void 0 && (T = 1), _.morphAttributes.normal !== void 0 && (T = 2), _.morphAttributes.color !== void 0 && (T = 3);
		let E, D, O, k;
		if (x) {
			let e = mi[x];
			E = e.vertexShader, D = e.fragmentShader;
		} else {
			E = i.vertexShader, D = i.fragmentShader;
			let e = s.getVertexShaderStage(i), t = s.getFragmentShaderStage(i);
			s.update(i, e, t), O = e.id, k = t.id;
		}
		let A = e.getRenderTarget(), j = e.state.buffers.depth.getReversed(), M = m.isInstancedMesh === !0, N = m.isBatchedMesh === !0, P = !!i.map, F = !!i.matcap, I = !!b, L = I && b.isPMREMTexture === !0, R = !!i.aoMap, ee = !!i.lightMap, te = !!i.bumpMap && i.wireframe === !1, z = !!i.normalMap, ne = !!i.displacementMap, re = !!i.emissiveMap, V = !!i.metalnessMap, ie = !!i.roughnessMap, ae = i.anisotropy > 0, oe = i.clearcoat > 0, se = i.diffuseRoughness > 0, ce = i.dispersion > 0, H = i.retroreflectivity > 0, le = i.iridescence > 0, ue = i.sheen > 0, U = i.transmission > 0, de = ae && !!i.anisotropyMap, fe = oe && !!i.clearcoatMap, pe = oe && !!i.clearcoatNormalMap, me = oe && !!i.clearcoatRoughnessMap, he = se && !!i.diffuseRoughnessMap, ge = le && !!i.iridescenceMap, W = le && !!i.iridescenceThicknessMap, _e = ue && !!i.sheenColorMap, G = ue && !!i.sheenRoughnessMap, ve = !!i.specularMap, ye = !!i.specularColorMap, K = !!i.specularIntensityMap, be = U && !!i.transmissionMap, xe = U && !!i.thicknessMap, Se = !!i.gradientMap, Ce = !!i.alphaMap, we = i.alphaTest > 0, Te = !!i.alphaHash, Ee = !!i.extensions, De = 0;
		i.toneMapped && (A === null || A.isXRRenderTarget === !0) && (De = e.toneMapping);
		let Oe = L ? b.isCompressedCubeTexture ? b.image[0].mipmaps : b.mipmaps : null, ke = {
			shaderID: x,
			shaderType: i.type,
			shaderName: i.name,
			vertexShader: E,
			fragmentShader: D,
			defines: i.defines,
			customVertexShaderID: O,
			customFragmentShaderID: k,
			isRawShaderMaterial: i.isRawShaderMaterial === !0,
			glslVersion: i.glslVersion,
			precision: S,
			batching: N,
			batchingColor: N && m._colorsTexture !== null,
			instancing: M,
			instancingColor: M && m.instanceColor !== null,
			instancingMorph: M && m.morphTexture !== null,
			outputColorSpace: A === null ? e.outputColorSpace : A.isXRRenderTarget === !0 ? A.texture.colorSpace : q.workingColorSpace,
			alphaToCoverage: !!i.alphaToCoverage,
			map: P,
			matcap: F,
			envMap: I,
			envMapMode: I && b.mapping,
			envMapPMREM: L,
			envMapMaxLod: L ? Oe.length - 1 : null,
			envMapSize: L ? Oe[0].width : null,
			aoMap: R,
			lightMap: ee,
			bumpMap: te,
			normalMap: z,
			displacementMap: ne,
			emissiveMap: re,
			normalMapObjectSpace: z && i.normalMapType === 1,
			normalMapTangentSpace: z && i.normalMapType === 0,
			packedNormalMap: z && i.normalMapType === 0 && Bo(i.normalMap.format),
			metalnessMap: V,
			roughnessMap: ie,
			anisotropy: ae,
			anisotropyMap: de,
			clearcoat: oe,
			clearcoatMap: fe,
			clearcoatNormalMap: pe,
			clearcoatRoughnessMap: me,
			diffuseRoughness: se,
			diffuseRoughnessMap: he,
			dispersion: ce,
			retroreflection: H,
			iridescence: le,
			iridescenceMap: ge,
			iridescenceThicknessMap: W,
			sheen: ue,
			sheenColorMap: _e,
			sheenRoughnessMap: G,
			specularMap: ve,
			specularColorMap: ye,
			specularIntensityMap: K,
			transmission: U,
			transmissionMap: be,
			thicknessMap: xe,
			gradientMap: Se,
			opaque: i.transparent === !1 && i.blending === 1 && i.alphaToCoverage === !1,
			alphaMap: Ce,
			alphaTest: we,
			alphaHash: Te,
			combine: i.combine,
			mapUv: P && p(i.map.channel),
			aoMapUv: R && p(i.aoMap.channel),
			lightMapUv: ee && p(i.lightMap.channel),
			bumpMapUv: te && p(i.bumpMap.channel),
			normalMapUv: z && p(i.normalMap.channel),
			displacementMapUv: ne && p(i.displacementMap.channel),
			emissiveMapUv: re && p(i.emissiveMap.channel),
			metalnessMapUv: V && p(i.metalnessMap.channel),
			roughnessMapUv: ie && p(i.roughnessMap.channel),
			anisotropyMapUv: de && p(i.anisotropyMap.channel),
			clearcoatMapUv: fe && p(i.clearcoatMap.channel),
			clearcoatNormalMapUv: pe && p(i.clearcoatNormalMap.channel),
			clearcoatRoughnessMapUv: me && p(i.clearcoatRoughnessMap.channel),
			diffuseRoughnessMapUv: he && p(i.diffuseRoughnessMap.channel),
			iridescenceMapUv: ge && p(i.iridescenceMap.channel),
			iridescenceThicknessMapUv: W && p(i.iridescenceThicknessMap.channel),
			sheenColorMapUv: _e && p(i.sheenColorMap.channel),
			sheenRoughnessMapUv: G && p(i.sheenRoughnessMap.channel),
			specularMapUv: ve && p(i.specularMap.channel),
			specularColorMapUv: ye && p(i.specularColorMap.channel),
			specularIntensityMapUv: K && p(i.specularIntensityMap.channel),
			transmissionMapUv: be && p(i.transmissionMap.channel),
			thicknessMapUv: xe && p(i.thicknessMap.channel),
			alphaMapUv: Ce && p(i.alphaMap.channel),
			vertexTangents: !!_.attributes.tangent && (z || ae),
			vertexNormals: !!_.attributes.normal,
			vertexColors: i.vertexColors,
			vertexAlphas: i.vertexColors === !0 && !!_.attributes.color && _.attributes.color.itemSize === 4,
			pointsUvs: m.isPoints === !0 && !!_.attributes.uv && (P || Ce),
			fog: !!g,
			useFog: i.fog === !0,
			fogExp2: !!g && g.isFogExp2,
			flatShading: i.wireframe === !1 && (i.flatShading === !0 || _.attributes.normal === void 0 && z === !1 && (i.isMeshLambertMaterial || i.isMeshPhongMaterial || i.isMeshStandardMaterial || i.isMeshPhysicalMaterial)),
			sizeAttenuation: i.sizeAttenuation === !0,
			logarithmicDepthBuffer: d,
			reversedDepthBuffer: j,
			skinning: m.isSkinnedMesh === !0,
			hasPositionAttribute: _.attributes.position !== void 0,
			morphTargets: _.morphAttributes.position !== void 0,
			morphNormals: _.morphAttributes.normal !== void 0,
			morphColors: _.morphAttributes.color !== void 0,
			morphTargetsCount: w,
			morphTextureStride: T,
			numSunLights: o.sun.length,
			numDirLights: o.directional.length,
			numPointLights: o.point.length,
			numSpotLights: o.spot.length,
			numSpotLightMaps: o.spotLightMap.length,
			numRectAreaLights: o.rectArea.length,
			numHemiLights: o.hemi.length,
			numSunLightShadows: o.sunShadowMap.length,
			numDirLightShadows: o.directionalShadowMap.length,
			numPointLightShadows: o.pointShadowMap.length,
			numSpotLightShadows: o.spotShadowMap.length,
			numSpotLightShadowsWithMaps: o.numSpotLightShadowsWithMaps,
			numLightProbes: o.numLightProbes,
			numLightProbeGrids: h.filter((e) => e.texture !== null).length,
			numClippingPlanes: a.numPlanes,
			numClipIntersection: a.numIntersection,
			dithering: i.dithering,
			shadowMapEnabled: e.shadowMap.enabled && l.length > 0,
			shadowMapType: e.shadowMap.type,
			toneMapping: De,
			decodeVideoTexture: P && i.map.isVideoTexture === !0 && q.getTransfer(i.map.colorSpace) === "srgb",
			decodeVideoTextureEmissive: re && i.emissiveMap.isVideoTexture === !0 && q.getTransfer(i.emissiveMap.colorSpace) === "srgb",
			premultipliedAlpha: i.premultipliedAlpha,
			doubleSided: i.side === 2,
			flipSided: i.side === 1,
			useDepthPacking: i.depthPacking >= 0,
			depthPacking: i.depthPacking || 0,
			index0AttributeName: i.index0AttributeName,
			extensionClipCullDistance: Ee && i.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
			extensionMultiDraw: (Ee && i.extensions.multiDraw === !0 || N) && n.has("WEBGL_multi_draw"),
			rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
			customProgramCacheKey: i.customProgramCacheKey()
		};
		return ke.vertexUv1s = c.has(1), ke.vertexUv2s = c.has(2), ke.vertexUv3s = c.has(3), c.clear(), ke;
	}
	function h(t) {
		let n = [];
		if (t.shaderID ? n.push(t.shaderID) : (n.push(t.customVertexShaderID), n.push(t.customFragmentShaderID)), t.defines !== void 0) for (let e in t.defines) n.push(e), n.push(t.defines[e]);
		return t.isRawShaderMaterial === !1 && (g(n, t), _(n, t), n.push(e.outputColorSpace)), n.push(t.customProgramCacheKey), n.join();
	}
	function g(e, t) {
		e.push(t.precision), e.push(t.outputColorSpace), e.push(t.envMapMode), e.push(t.envMapPMREM), e.push(t.envMapMaxLod), e.push(t.envMapSize), e.push(t.mapUv), e.push(t.alphaMapUv), e.push(t.lightMapUv), e.push(t.aoMapUv), e.push(t.bumpMapUv), e.push(t.normalMapUv), e.push(t.displacementMapUv), e.push(t.emissiveMapUv), e.push(t.metalnessMapUv), e.push(t.roughnessMapUv), e.push(t.anisotropyMapUv), e.push(t.clearcoatMapUv), e.push(t.clearcoatNormalMapUv), e.push(t.clearcoatRoughnessMapUv), e.push(t.diffuseRoughnessMapUv), e.push(t.iridescenceMapUv), e.push(t.iridescenceThicknessMapUv), e.push(t.sheenColorMapUv), e.push(t.sheenRoughnessMapUv), e.push(t.specularMapUv), e.push(t.specularColorMapUv), e.push(t.specularIntensityMapUv), e.push(t.transmissionMapUv), e.push(t.thicknessMapUv), e.push(t.combine), e.push(t.fogExp2), e.push(t.sizeAttenuation), e.push(t.morphTargetsCount), e.push(t.numSunLights), e.push(t.numDirLights), e.push(t.numPointLights), e.push(t.numSpotLights), e.push(t.numSpotLightMaps), e.push(t.numHemiLights), e.push(t.numRectAreaLights), e.push(t.numSunLightShadows), e.push(t.numDirLightShadows), e.push(t.numPointLightShadows), e.push(t.numSpotLightShadows), e.push(t.numSpotLightShadowsWithMaps), e.push(t.numLightProbes), e.push(t.numLightProbeGrids), e.push(t.shadowMapType), e.push(t.toneMapping), e.push(t.numClippingPlanes), e.push(t.numClipIntersection), e.push(t.depthPacking);
	}
	function _(e, t) {
		o.disableAll(), t.instancing && o.enable(0), t.instancingColor && o.enable(1), t.instancingMorph && o.enable(2), t.matcap && o.enable(3), t.envMap && o.enable(4), t.normalMapObjectSpace && o.enable(5), t.normalMapTangentSpace && o.enable(6), t.clearcoat && o.enable(7), t.iridescence && o.enable(8), t.alphaTest && o.enable(9), t.vertexColors && o.enable(10), t.vertexAlphas && o.enable(11), t.vertexUv1s && o.enable(12), t.vertexUv2s && o.enable(13), t.vertexUv3s && o.enable(14), t.vertexTangents && o.enable(15), t.anisotropy && o.enable(16), t.alphaHash && o.enable(17), t.batching && o.enable(18), t.dispersion && o.enable(19), t.retroreflection && o.enable(24), t.diffuseRoughness && o.enable(25), t.batchingColor && o.enable(20), t.gradientMap && o.enable(21), t.packedNormalMap && o.enable(22), t.vertexNormals && o.enable(23), e.push(o.mask), o.disableAll(), t.fog && o.enable(0), t.useFog && o.enable(1), t.flatShading && o.enable(2), t.logarithmicDepthBuffer && o.enable(3), t.reversedDepthBuffer && o.enable(4), t.skinning && o.enable(5), t.morphTargets && o.enable(6), t.morphNormals && o.enable(7), t.morphColors && o.enable(8), t.premultipliedAlpha && o.enable(9), t.shadowMapEnabled && o.enable(10), t.doubleSided && o.enable(11), t.flipSided && o.enable(12), t.useDepthPacking && o.enable(13), t.dithering && o.enable(14), t.transmission && o.enable(15), t.sheen && o.enable(16), t.opaque && o.enable(17), t.pointsUvs && o.enable(18), t.decodeVideoTexture && o.enable(19), t.decodeVideoTextureEmissive && o.enable(20), t.alphaToCoverage && o.enable(21), t.numLightProbeGrids > 0 && o.enable(22), t.hasPositionAttribute && o.enable(23), e.push(o.mask);
	}
	function v(e) {
		let t = f[e.type], n;
		if (t) {
			let e = mi[t];
			n = ur.clone(e.uniforms);
		} else n = e.uniforms;
		return n;
	}
	function y(t, n) {
		let r = u.get(n);
		return r === void 0 ? (r = new Io(e, n, t, i), l.push(r), u.set(n, r)) : ++r.usedTimes, r;
	}
	function b(e) {
		if (--e.usedTimes === 0) {
			let t = l.indexOf(e);
			l[t] = l[l.length - 1], l.pop(), u.delete(e.cacheKey), e.destroy();
		}
	}
	function x(e) {
		s.remove(e);
	}
	function S() {
		s.dispose();
	}
	return {
		getParameters: m,
		getProgramCacheKey: h,
		getUniforms: v,
		acquireProgram: y,
		releaseProgram: b,
		releaseShaderCache: x,
		programs: l,
		dispose: S
	};
}
function Ho() {
	let e = /* @__PURE__ */ new WeakMap();
	function t(t) {
		return e.has(t);
	}
	function n(t) {
		let n = e.get(t);
		return n === void 0 && (n = {}, e.set(t, n)), n;
	}
	function r(t) {
		e.delete(t);
	}
	function i(t, n, r) {
		e.get(t)[n] = r;
	}
	function a() {
		e = /* @__PURE__ */ new WeakMap();
	}
	return {
		has: t,
		get: n,
		remove: r,
		update: i,
		dispose: a
	};
}
function Uo(e, t) {
	return e.groupOrder === t.groupOrder ? e.renderOrder === t.renderOrder ? e.material.id === t.material.id ? e.materialVariant === t.materialVariant ? e.z === t.z ? e.id - t.id : e.z - t.z : e.materialVariant - t.materialVariant : e.material.id - t.material.id : e.renderOrder - t.renderOrder : e.groupOrder - t.groupOrder;
}
function Wo(e, t) {
	return e.groupOrder === t.groupOrder ? e.renderOrder === t.renderOrder ? e.z === t.z ? e.id - t.id : t.z - e.z : e.renderOrder - t.renderOrder : e.groupOrder - t.groupOrder;
}
function Go() {
	let e = [], t = 0, n = [], r = [], i = [];
	function a() {
		t = 0, n.length = 0, r.length = 0, i.length = 0;
	}
	function o(e) {
		let t = 0;
		return e.isInstancedMesh && (t += 2), e.isSkinnedMesh && (t += 1), t;
	}
	function s(n, r, i, a, s, c) {
		let l = e[t];
		return l === void 0 ? (l = {
			id: n.id,
			object: n,
			geometry: r,
			material: i,
			materialVariant: o(n),
			groupOrder: a,
			renderOrder: n.renderOrder,
			z: s,
			group: c
		}, e[t] = l) : (l.id = n.id, l.object = n, l.geometry = r, l.material = i, l.materialVariant = o(n), l.groupOrder = a, l.renderOrder = n.renderOrder, l.z = s, l.group = c), t++, l;
	}
	function c(e, t, a, o, c, l, u) {
		u.reversedDepth === !0 && (c = -c);
		let d = s(e, t, a, o, c, l);
		a.transmission > 0 ? r.push(d) : a.transparent === !0 ? i.push(d) : n.push(d);
	}
	function l(e, t, a, o, c, l) {
		let u = s(e, t, a, o, c, l);
		a.transmission > 0 ? r.unshift(u) : a.transparent === !0 ? i.unshift(u) : n.unshift(u);
	}
	function u(e, t) {
		n.length > 1 && n.sort(e || Uo), r.length > 1 && r.sort(t || Wo), i.length > 1 && i.sort(t || Wo);
	}
	function d() {
		for (let n = t, r = e.length; n < r; n++) {
			let t = e[n];
			if (t.id === null) break;
			t.id = null, t.object = null, t.geometry = null, t.material = null, t.group = null;
		}
	}
	return {
		opaque: n,
		transmissive: r,
		transparent: i,
		init: a,
		push: c,
		unshift: l,
		finish: d,
		sort: u
	};
}
function Ko() {
	let e = /* @__PURE__ */ new WeakMap();
	function t(t, n) {
		let r = e.get(t), i;
		return r === void 0 ? (i = new Go(), e.set(t, [i])) : n >= r.length ? (i = new Go(), r.push(i)) : i = r[n], i;
	}
	function n() {
		e = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: t,
		dispose: n
	};
}
function qo() {
	let e = {};
	return { get: function(t) {
		if (e[t.id] !== void 0) return e[t.id];
		let n;
		switch (t.type) {
			case "SunLight":
			case "DirectionalLight":
				n = {
					direction: new G(),
					color: new gt()
				};
				break;
			case "SpotLight":
				n = {
					position: new G(),
					direction: new G(),
					color: new gt(),
					distance: 0,
					coneCos: 0,
					penumbraCos: 0,
					decay: 0
				};
				break;
			case "PointLight":
				n = {
					position: new G(),
					color: new gt(),
					distance: 0,
					decay: 0
				};
				break;
			case "HemisphereLight":
				n = {
					direction: new G(),
					skyColor: new gt(),
					groundColor: new gt()
				};
				break;
			case "RectAreaLight": n = {
				color: new gt(),
				position: new G(),
				halfWidth: new G(),
				halfHeight: new G()
			};
		}
		return e[t.id] = n, n;
	} };
}
function Jo() {
	let e = {};
	return { get: function(t) {
		if (e[t.id] !== void 0) return e[t.id];
		let n;
		switch (t.type) {
			case "SunLight":
			case "DirectionalLight":
				n = {
					shadowIntensity: 1,
					shadowBias: 0,
					shadowNormalBias: 0,
					shadowRadius: 1,
					shadowMapSize: new W()
				};
				break;
			case "SpotLight":
				n = {
					shadowIntensity: 1,
					shadowBias: 0,
					shadowNormalBias: 0,
					shadowRadius: 1,
					shadowMapSize: new W()
				};
				break;
			case "PointLight": n = {
				shadowIntensity: 1,
				shadowBias: 0,
				shadowNormalBias: 0,
				shadowRadius: 1,
				shadowMapSize: new W(),
				shadowCameraNear: 1,
				shadowCameraFar: 1e3
			};
		}
		return e[t.id] = n, n;
	} };
}
var Yo = 0;
function Xo(e, t) {
	return (t.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + +!!t.map - !!e.map;
}
function Zo(e) {
	let t = new qo(), n = Jo(), r = {
		version: 0,
		hash: {
			sunLength: -1,
			directionalLength: -1,
			pointLength: -1,
			spotLength: -1,
			rectAreaLength: -1,
			hemiLength: -1,
			numSunShadows: -1,
			numDirectionalShadows: -1,
			numPointShadows: -1,
			numSpotShadows: -1,
			numSpotMaps: -1,
			numLightProbes: -1
		},
		ambient: [
			0,
			0,
			0
		],
		probe: [],
		sun: [],
		sunShadow: [],
		sunShadowMap: [],
		sunShadowMatrix: [],
		sunShadowCascade: [],
		directional: [],
		directionalShadow: [],
		directionalShadowMap: [],
		directionalShadowMatrix: [],
		spot: [],
		spotLightMap: [],
		spotShadow: [],
		spotShadowMap: [],
		spotLightMatrix: [],
		rectArea: [],
		rectAreaLTC1: null,
		rectAreaLTC2: null,
		point: [],
		pointShadow: [],
		pointShadowMap: [],
		pointShadowMatrix: [],
		hemi: [],
		numSpotLightShadowsWithMaps: 0,
		numLightProbes: 0
	};
	for (let e = 0; e < 9; e++) r.probe.push(new G());
	let i = new G(), a = new Le(), o = new Le();
	function s(i) {
		let a = 0, o = 0, s = 0;
		for (let e = 0; e < 9; e++) r.probe[e].set(0, 0, 0);
		let c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0, h = 0, g = 0, _ = 0, v = 0, y = 0, b = 0, x = 0;
		i.sort(Xo);
		for (let e = 0, S = i.length; e < S; e++) {
			let S = i[e], C = S.color, w = S.intensity, T = S.distance, E = null;
			if (S.shadow && S.shadow.map && (E = S.shadow.map.texture.format === 1030 ? S.shadow.map.texture : S.shadow.map.depthTexture || S.shadow.map.texture), S.isAmbientLight) a += C.r * w, o += C.g * w, s += C.b * w;
			else if (S.isLightProbe) {
				for (let e = 0; e < 9; e++) r.probe[e].addScaledVector(S.sh.coefficients[e], w);
				x++;
			} else if (S.isSunLight) {
				let e = t.get(S);
				if (e.color.copy(S.color).multiplyScalar(S.intensity), S.castShadow) {
					let e = S.shadow, t = n.get(S);
					t.shadowIntensity = e.intensity, t.shadowBias = e.bias, t.shadowNormalBias = e.normalBias, t.shadowRadius = e.radius, t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()), r.sunShadow[l] = t, r.sunShadowMap[l] = E;
					let i = e.getViewportCount();
					for (let t = 0; t < i; t++) r.sunShadowMatrix[u + t] = e.getMatrix(t), r.sunShadowCascade[u + t] = e._cascadeData[t];
					u += i, l++;
				}
				r.sun[c] = e, c++;
			} else if (S.isDirectionalLight) {
				let e = t.get(S);
				if (e.color.copy(S.color).multiplyScalar(S.intensity), S.castShadow) {
					let e = S.shadow, t = n.get(S);
					t.shadowIntensity = e.intensity, t.shadowBias = e.bias, t.shadowNormalBias = e.normalBias, t.shadowRadius = e.radius, t.shadowMapSize = e.mapSize, r.directionalShadow[d] = t, r.directionalShadowMap[d] = E, r.directionalShadowMatrix[d] = S.shadow.matrix, g++;
				}
				r.directional[d] = e, d++;
			} else if (S.isSpotLight) {
				let e = t.get(S);
				e.position.setFromMatrixPosition(S.matrixWorld), e.color.copy(C).multiplyScalar(w), e.distance = T, e.coneCos = Math.cos(S.angle), e.penumbraCos = Math.cos(S.angle * (1 - S.penumbra)), e.decay = S.decay, r.spot[p] = e;
				let i = S.shadow;
				if (S.map && (r.spotLightMap[y] = S.map, y++, i.updateMatrices(S), S.castShadow && b++), r.spotLightMatrix[p] = i.matrix, S.castShadow) {
					let e = n.get(S);
					e.shadowIntensity = i.intensity, e.shadowBias = i.bias, e.shadowNormalBias = i.normalBias, e.shadowRadius = i.radius, e.shadowMapSize = i.mapSize, r.spotShadow[p] = e, r.spotShadowMap[p] = E, v++;
				}
				p++;
			} else if (S.isRectAreaLight) {
				let e = t.get(S);
				e.color.copy(C).multiplyScalar(w), e.halfWidth.set(S.width * .5, 0, 0), e.halfHeight.set(0, S.height * .5, 0), r.rectArea[m] = e, m++;
			} else if (S.isPointLight) {
				let e = t.get(S);
				if (e.color.copy(S.color).multiplyScalar(S.intensity), e.distance = S.distance, e.decay = S.decay, S.castShadow) {
					let e = S.shadow, t = n.get(S);
					t.shadowIntensity = e.intensity, t.shadowBias = e.bias, t.shadowNormalBias = e.normalBias, t.shadowRadius = e.radius, t.shadowMapSize = e.mapSize, t.shadowCameraNear = e.camera.near, t.shadowCameraFar = e.camera.far, r.pointShadow[f] = t, r.pointShadowMap[f] = E, r.pointShadowMatrix[f] = S.shadow.matrix, _++;
				}
				r.point[f] = e, f++;
			} else if (S.isHemisphereLight) {
				let e = t.get(S);
				e.skyColor.copy(S.color).multiplyScalar(w), e.groundColor.copy(S.groundColor).multiplyScalar(w), r.hemi[h] = e, h++;
			}
		}
		m > 0 && (e.has("OES_texture_float_linear") === !0 ? (r.rectAreaLTC1 = $.LTC_FLOAT_1, r.rectAreaLTC2 = $.LTC_FLOAT_2) : (r.rectAreaLTC1 = $.LTC_HALF_1, r.rectAreaLTC2 = $.LTC_HALF_2)), r.ambient[0] = a, r.ambient[1] = o, r.ambient[2] = s;
		let S = r.hash;
		(S.sunLength !== c || S.directionalLength !== d || S.pointLength !== f || S.spotLength !== p || S.rectAreaLength !== m || S.hemiLength !== h || S.numSunShadows !== l || S.numDirectionalShadows !== g || S.numPointShadows !== _ || S.numSpotShadows !== v || S.numSpotMaps !== y || S.numLightProbes !== x) && (r.sun.length = c, r.directional.length = d, r.spot.length = p, r.rectArea.length = m, r.point.length = f, r.hemi.length = h, r.sunShadow.length = l, r.sunShadowMap.length = l, r.sunShadowMatrix.length = u, r.sunShadowCascade.length = u, r.directionalShadow.length = g, r.directionalShadowMap.length = g, r.directionalShadowMatrix.length = g, r.pointShadow.length = _, r.pointShadowMap.length = _, r.pointShadowMatrix.length = _, r.spotShadow.length = v, r.spotShadowMap.length = v, r.spotLightMatrix.length = v + y - b, r.spotLightMap.length = y, r.numSpotLightShadowsWithMaps = b, r.numLightProbes = x, S.sunLength = c, S.directionalLength = d, S.pointLength = f, S.spotLength = p, S.rectAreaLength = m, S.hemiLength = h, S.numSunShadows = l, S.numDirectionalShadows = g, S.numPointShadows = _, S.numSpotShadows = v, S.numSpotMaps = y, S.numLightProbes = x, r.version = Yo++);
	}
	function c(e, t) {
		let n = 0, s = 0, c = 0, l = 0, u = 0, d = 0, f = t.matrixWorldInverse;
		for (let t = 0, p = e.length; t < p; t++) {
			let p = e[t];
			if (p.isSunLight) {
				let e = r.sun[n];
				e.direction.setFromMatrixPosition(p.matrixWorld), e.direction.transformDirection(f), n++;
			} else if (p.isDirectionalLight) {
				let e = r.directional[s];
				e.direction.setFromMatrixPosition(p.matrixWorld), i.setFromMatrixPosition(p.target.matrixWorld), e.direction.sub(i), e.direction.transformDirection(f), s++;
			} else if (p.isSpotLight) {
				let e = r.spot[l];
				e.position.setFromMatrixPosition(p.matrixWorld), e.position.applyMatrix4(f), e.direction.setFromMatrixPosition(p.matrixWorld), i.setFromMatrixPosition(p.target.matrixWorld), e.direction.sub(i), e.direction.transformDirection(f), l++;
			} else if (p.isRectAreaLight) {
				let e = r.rectArea[u];
				e.position.setFromMatrixPosition(p.matrixWorld), e.position.applyMatrix4(f), o.identity(), a.copy(p.matrixWorld), a.premultiply(f), o.extractRotation(a), e.halfWidth.set(p.width * .5, 0, 0), e.halfHeight.set(0, p.height * .5, 0), e.halfWidth.applyMatrix4(o), e.halfHeight.applyMatrix4(o), u++;
			} else if (p.isPointLight) {
				let e = r.point[c];
				e.position.setFromMatrixPosition(p.matrixWorld), e.position.applyMatrix4(f), c++;
			} else if (p.isHemisphereLight) {
				let e = r.hemi[d];
				e.direction.setFromMatrixPosition(p.matrixWorld), e.direction.transformDirection(f), d++;
			}
		}
	}
	return {
		setup: s,
		setupView: c,
		state: r
	};
}
function Qo(e) {
	let t = new Zo(e), n = [], r = [], i = [];
	function a(e) {
		u.camera = e, n.length = 0, r.length = 0, i.length = 0;
	}
	function o(e) {
		e.isLightProbeGrid ? i.push(e) : n.push(e);
	}
	function s(e) {
		r.push(e);
	}
	function c() {
		t.setup(n), i.sort((e, t) => e.priority - t.priority || e.id - t.id);
	}
	function l(e) {
		t.setupView(n, e);
	}
	let u = {
		lightsArray: n,
		shadowsArray: r,
		lightProbeGridArray: i,
		camera: null,
		lights: t,
		transmissionRenderTarget: {},
		textureUnits: 0
	};
	return {
		init: a,
		state: u,
		setupLights: c,
		setupLightsView: l,
		pushLight: o,
		pushShadow: s
	};
}
function $o(e) {
	let t = /* @__PURE__ */ new WeakMap();
	function n(n, r = 0) {
		let i = t.get(n), a;
		return i === void 0 ? (a = new Qo(e), t.set(n, [a])) : r >= i.length ? (a = new Qo(e), i.push(a)) : a = i[r], a;
	}
	function r() {
		t = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: n,
		dispose: r
	};
}
var es = "void main() {\n	gl_Position = vec4( position, 1.0 );\n}", ts = "uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\nvoid main() {\n	const float samples = float( VSM_SAMPLES );\n	float mean = 0.0;\n	float squared_mean = 0.0;\n	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );\n	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;\n	for ( float i = 0.0; i < samples; i ++ ) {\n		float uvOffset = uvStart + i * uvStride;\n		#ifdef HORIZONTAL_PASS\n			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;\n			mean += distribution.x;\n			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n		#else\n			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;\n			mean += depth;\n			squared_mean += depth * depth;\n		#endif\n	}\n	mean = mean / samples;\n	squared_mean = squared_mean / samples;\n	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );\n	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );\n}", ns = [
	/*@__PURE__*/ new G(1, 0, 0),
	/*@__PURE__*/ new G(-1, 0, 0),
	/*@__PURE__*/ new G(0, 1, 0),
	/*@__PURE__*/ new G(0, -1, 0),
	/*@__PURE__*/ new G(0, 0, 1),
	/*@__PURE__*/ new G(0, 0, -1)
], rs = [
	/*@__PURE__*/ new G(0, -1, 0),
	/*@__PURE__*/ new G(0, -1, 0),
	/*@__PURE__*/ new G(0, 0, 1),
	/*@__PURE__*/ new G(0, 0, -1),
	/*@__PURE__*/ new G(0, -1, 0),
	/*@__PURE__*/ new G(0, -1, 0)
], is = /*@__PURE__*/ new Le(), as = /*@__PURE__*/ new G(), os = /*@__PURE__*/ new G();
function ss(e, t, n) {
	let a = new Yn(), o = new W(), s = new W(), d = new Ne(), f = new hr(), p = new gr(), m = {}, g = n.maxTextureSize, _ = {
		0: 1,
		1: 0,
		2: 2
	}, y = new pr({
		defines: { VSM_SAMPLES: 8 },
		uniforms: {
			shadow_pass: { value: null },
			resolution: { value: new W() },
			radius: { value: 4 }
		},
		vertexShader: es,
		fragmentShader: ts
	}), b = y.clone();
	b.defines.HORIZONTAL_PASS = 1;
	let x = new pn();
	x.setAttribute("position", new Zt(new Float32Array([
		-1,
		-1,
		.5,
		3,
		-1,
		.5,
		-1,
		3,
		.5
	]), 3));
	let S = new Vn(x, y), C = this;
	this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
	let w = this.type;
	this.render = function(t, n, f) {
		if (C.enabled === !1 || C.autoUpdate === !1 && C.needsUpdate === !1 || t.length === 0) return;
		this.type === 2 && (B("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."), this.type = 1);
		let p = e.getRenderTarget(), m = e.getActiveCubeFace(), _ = e.getActiveMipmapLevel(), y = e.state;
		y.setBlending(0), y.buffers.depth.getReversed() === !0 ? y.buffers.color.setClear(0, 0, 0, 0) : y.buffers.color.setClear(1, 1, 1, 1), y.buffers.depth.setTest(!0), y.setScissorTest(!1);
		let b = w !== this.type;
		b && n.traverse(function(e) {
			e.material && (Array.isArray(e.material) ? e.material.forEach((e) => e.needsUpdate = !0) : e.material.needsUpdate = !0);
		});
		for (let p = 0, m = t.length; p < m; p++) {
			let m = t[p], _ = m.shadow;
			if (_ === void 0) {
				B("WebGLShadowMap:", m, "has no shadow.");
				continue;
			}
			if (_.autoUpdate === !1 && _.needsUpdate === !1) continue;
			o.copy(_.mapSize);
			let x = _.getFrameExtents();
			o.multiply(x), s.copy(_.mapSize), (o.x > g || o.y > g) && (o.x > g && (s.x = Math.floor(g / x.x), o.x = s.x * x.x, _.mapSize.x = s.x), o.y > g && (s.y = Math.floor(g / x.y), o.y = s.y * x.y, _.mapSize.y = s.y));
			let S = e.state.buffers.depth.getReversed();
			if (_.camera._reversedDepth = S, _.map === null || b === !0) {
				if (_.map !== null && (_.map.depthTexture !== null && (_.map.depthTexture.dispose(), _.map.depthTexture = null), _.map.dispose()), this.type === 3) {
					if (m.isPointLight) {
						B("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");
						continue;
					}
					_.map = new Fe(o.x, o.y, {
						format: v,
						type: u,
						minFilter: i,
						magFilter: i,
						generateMipmaps: !1
					}), _.map.texture.name = m.name + ".shadowMap", _.map.depthTexture = new er(o.x, o.y, l), _.map.depthTexture.name = m.name + ".shadowMapDepth", _.map.depthTexture.format = h, _.map.depthTexture.compareFunction = null, _.map.depthTexture.minFilter = r, _.map.depthTexture.magFilter = r;
				} else m.isPointLight ? (_.map = new Ci(o.x), _.map.depthTexture = new tr(o.x, c)) : (_.map = new Fe(o.x, o.y), _.map.depthTexture = new er(o.x, o.y, c)), _.map.depthTexture.name = m.name + ".shadowMap", _.map.depthTexture.format = h, this.type === 1 ? (_.map.depthTexture.compareFunction = S ? 518 : 515, _.map.depthTexture.minFilter = i, _.map.depthTexture.magFilter = i) : (_.map.depthTexture.compareFunction = null, _.map.depthTexture.minFilter = r, _.map.depthTexture.magFilter = r);
				_.camera.updateProjectionMatrix();
			}
			_.map.isWebGLCubeRenderTarget !== !0 && (_.map.width !== o.x || _.map.height !== o.y) && _.map.setSize(o.x, o.y);
			let C = _.map.isWebGLCubeRenderTarget ? 6 : _.getViewportCount();
			m.isPointLight !== !0 && _.updateMatrices(m, f);
			let w = _.camera.layers.mask & 4294967294 ? _.camera.layers : f.layers;
			for (let t = 0; t < C; t++) {
				let r = _.getCamera(t);
				if (m.isPointLight) {
					let e = _.camera, n = _.matrix, r = m.distance || e.far;
					r !== e.far && (e.far = r, e.updateProjectionMatrix()), as.setFromMatrixPosition(m.matrixWorld), e.position.copy(as), os.copy(e.position), os.add(ns[t]), e.up.copy(rs[t]), e.lookAt(os), e.updateMatrixWorld(), n.makeTranslation(-as.x, -as.y, -as.z), is.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), _._frustum.setFromProjectionMatrix(is, e.coordinateSystem, e.reversedDepth);
				}
				if (_.map.isWebGLCubeRenderTarget) e.setRenderTarget(_.map, t), e.clear();
				else {
					t === 0 && (e.setRenderTarget(_.map), e.clear());
					let n = _.getViewport(t);
					d.set(s.x * n.x, s.y * n.y, s.x * n.z, s.y * n.w), y.viewport(d);
				}
				a = _.getFrustum(t), D(n, f, r, m, w, this.type);
			}
			_.isPointLightShadow !== !0 && this.type === 3 && T(_, f), _.needsUpdate = !1;
		}
		w = this.type, C.needsUpdate = !1, e.setRenderTarget(p, m, _);
	};
	function T(n, r) {
		let i = t.update(S);
		y.defines.VSM_SAMPLES !== n.blurSamples && (y.defines.VSM_SAMPLES = n.blurSamples, b.defines.VSM_SAMPLES = n.blurSamples, y.needsUpdate = !0, b.needsUpdate = !0), n.mapPass === null ? n.mapPass = new Fe(o.x, o.y, {
			format: v,
			type: u
		}) : (n.mapPass.width !== n.map.width || n.mapPass.height !== n.map.height) && n.mapPass.setSize(n.map.width, n.map.height), y.uniforms.shadow_pass.value = n.map.depthTexture, y.uniforms.resolution.value.set(n.map.width, n.map.height), y.uniforms.radius.value = n.radius, e.setRenderTarget(n.mapPass), e.clear(), e.renderBufferDirect(r, null, i, y, S, null), b.uniforms.shadow_pass.value = n.mapPass.texture, b.uniforms.resolution.value.set(n.map.width, n.map.height), b.uniforms.radius.value = n.radius, e.setRenderTarget(n.map), e.clear(), e.renderBufferDirect(r, null, i, b, S, null);
	}
	function E(t, n, r, i) {
		let a = null, o = r.isPointLight === !0 ? t.customDistanceMaterial : t.customDepthMaterial;
		if (o !== void 0) a = o;
		else if (a = r.isPointLight === !0 ? p : f, e.localClippingEnabled && n.clipShadows === !0 && Array.isArray(n.clippingPlanes) && n.clippingPlanes.length !== 0 || n.displacementMap && n.displacementScale !== 0 || n.alphaMap && n.alphaTest > 0 || n.map && n.alphaTest > 0 || n.alphaToCoverage === !0) {
			let e = a.uuid, t = n.uuid, r = m[e];
			r === void 0 && (r = {}, m[e] = r);
			let i = r[t];
			i === void 0 && (i = a.clone(), r[t] = i, n.addEventListener("dispose", O)), a = i;
		}
		if (a.visible = n.visible, a.wireframe = n.wireframe, i === 3 ? a.side = n.shadowSide === null ? n.side : n.shadowSide : a.side = n.shadowSide === null ? _[n.side] : n.shadowSide, a.alphaMap = n.alphaMap, a.alphaTest = n.alphaToCoverage === !0 ? .5 : n.alphaTest, a.map = n.map, a.clipShadows = n.clipShadows, a.clippingPlanes = n.clippingPlanes, a.clipIntersection = n.clipIntersection, a.displacementMap = n.displacementMap, a.displacementScale = n.displacementScale, a.displacementBias = n.displacementBias, a.wireframeLinewidth = n.wireframeLinewidth, a.linewidth = n.linewidth, r.isPointLight === !0 && a.isMeshDistanceMaterial === !0) {
			let t = e.properties.get(a);
			t.light = r;
		}
		return a;
	}
	function D(n, r, i, o, s, c) {
		if (n.visible === !1) return;
		if (n.layers.test(s) && (n.isMesh || n.isLine || n.isPoints) && (n.castShadow || n.receiveShadow && c === 3) && (!n.frustumCulled || n.intersectsFrustum(a))) {
			n.modelViewMatrix.multiplyMatrices(i.matrixWorldInverse, n.matrixWorld);
			let a = t.update(n), s = n.material;
			if (Array.isArray(s)) {
				let t = a.groups;
				for (let l = 0, u = t.length; l < u; l++) {
					let u = t[l], d = s[u.materialIndex];
					if (d && d.visible) {
						let t = E(n, d, o, c);
						n.onBeforeShadow(e, n, r, i, a, t, u), e.renderBufferDirect(i, null, a, t, n, u), n.onAfterShadow(e, n, r, i, a, t, u);
					}
				}
			} else if (s.visible) {
				let t = E(n, s, o, c);
				n.onBeforeShadow(e, n, r, i, a, t, null), e.renderBufferDirect(i, null, a, t, n, null), n.onAfterShadow(e, n, r, i, a, t, null);
			}
		}
		let l = n.children;
		for (let e = 0, t = l.length; e < t; e++) D(l[e], r, i, o, s, c);
	}
	function O(e) {
		e.target.removeEventListener("dispose", O);
		for (let t in m) {
			let n = m[t], r = e.target.uuid;
			r in n && (n[r].dispose(), delete n[r]);
		}
	}
}
function cs(e, t) {
	function n() {
		let t = !1, n = new Ne(), r = null, i = new Ne(0, 0, 0, 0);
		return {
			setMask: function(n) {
				r !== n && !t && (e.colorMask(n, n, n, n), r = n);
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t, r, a, o, s) {
				s === !0 && (t *= o, r *= o, a *= o), n.set(t, r, a, o), i.equals(n) === !1 && (e.clearColor(t, r, a, o), i.copy(n));
			},
			reset: function() {
				t = !1, r = null, i.set(-1, 0, 0, 0);
			}
		};
	}
	function r() {
		let n = !1, r = !1, i = null, a = null, o = null;
		return {
			setReversed: function(e) {
				if (r !== e) {
					let n = t.get("EXT_clip_control");
					e ? n.clipControlEXT(n.LOWER_LEFT_EXT, n.ZERO_TO_ONE_EXT) : n.clipControlEXT(n.LOWER_LEFT_EXT, n.NEGATIVE_ONE_TO_ONE_EXT), r = e;
					let i = o;
					o = null, this.setClear(i);
				}
			},
			getReversed: function() {
				return r;
			},
			setTest: function(t) {
				t ? B(e.DEPTH_TEST) : ie(e.DEPTH_TEST);
			},
			setMask: function(t) {
				i !== t && !n && (e.depthMask(t), i = t);
			},
			setFunc: function(t) {
				if (r && (t = oe[t]), a !== t) {
					switch (t) {
						case 0:
							e.depthFunc(e.NEVER);
							break;
						case 1:
							e.depthFunc(e.ALWAYS);
							break;
						case 2:
							e.depthFunc(e.LESS);
							break;
						case 3:
							e.depthFunc(e.LEQUAL);
							break;
						case 4:
							e.depthFunc(e.EQUAL);
							break;
						case 5:
							e.depthFunc(e.GEQUAL);
							break;
						case 6:
							e.depthFunc(e.GREATER);
							break;
						case 7:
							e.depthFunc(e.NOTEQUAL);
							break;
						default: e.depthFunc(e.LEQUAL);
					}
					a = t;
				}
			},
			setLocked: function(e) {
				n = e;
			},
			setClear: function(t) {
				o !== t && (o = t, r && (t = 1 - t), e.clearDepth(t));
			},
			reset: function() {
				n = !1, i = null, a = null, o = null, r = !1;
			}
		};
	}
	function i() {
		let t = !1, n = null, r = null, i = null, a = null, o = null, s = null, c = null, l = null;
		return {
			setTest: function(n) {
				t || (n ? B(e.STENCIL_TEST) : ie(e.STENCIL_TEST));
			},
			setMask: function(r) {
				n !== r && !t && (e.stencilMask(r), n = r);
			},
			setFunc: function(t, n, o) {
				(r !== t || i !== n || a !== o) && (e.stencilFunc(t, n, o), r = t, i = n, a = o);
			},
			setOp: function(t, n, r) {
				(o !== t || s !== n || c !== r) && (e.stencilOp(t, n, r), o = t, s = n, c = r);
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t) {
				l !== t && (e.clearStencil(t), l = t);
			},
			reset: function() {
				t = !1, n = null, r = null, i = null, a = null, o = null, s = null, c = null, l = null;
			}
		};
	}
	let a = new n(), o = new r(), s = new i(), c = {}, l = /* @__PURE__ */ new WeakMap(), u = {}, d = {}, f = {}, p = /* @__PURE__ */ new WeakMap(), m = [], h = null, g = !1, _ = null, v = null, y = null, b = null, x = null, S = null, C = null, w = new gt(0, 0, 0), T = 0, E = !1, D = null, O = null, k = null, A = null, j = null, M = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS), N = !1, P = 0, F = e.getParameter(e.VERSION);
	F.indexOf("WebGL") === -1 ? F.indexOf("OpenGL ES") !== -1 && (P = parseFloat(/^OpenGL ES (\d)/.exec(F)[1]), N = P >= 2) : (P = parseFloat(/^WebGL (\d)/.exec(F)[1]), N = P >= 1);
	let I = null, L = {}, R = e.getParameter(e.SCISSOR_BOX), ee = e.getParameter(e.VIEWPORT), te = new Ne().fromArray(R), z = new Ne().fromArray(ee);
	function ne(t, n, r, i) {
		let a = /* @__PURE__ */ new Uint8Array(4), o = e.createTexture();
		e.bindTexture(t, o), e.texParameteri(t, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(t, e.TEXTURE_MAG_FILTER, e.NEAREST);
		for (let o = 0; o < r; o++) t === e.TEXTURE_3D || t === e.TEXTURE_2D_ARRAY ? e.texImage3D(n, 0, e.RGBA, 1, 1, i, 0, e.RGBA, e.UNSIGNED_BYTE, a) : e.texImage2D(n + o, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, a);
		return o;
	}
	let re = {};
	re[e.TEXTURE_2D] = ne(e.TEXTURE_2D, e.TEXTURE_2D, 1), re[e.TEXTURE_CUBE_MAP] = ne(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6), re[e.TEXTURE_2D_ARRAY] = ne(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1), re[e.TEXTURE_3D] = ne(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1), a.setClear(0, 0, 0, 1), o.setClear(1), s.setClear(0), B(e.DEPTH_TEST), o.setFunc(3), de(!1), fe(1), B(e.CULL_FACE), ue(0);
	function B(t) {
		u[t] !== !0 && (e.enable(t), u[t] = !0);
	}
	function ie(t) {
		u[t] !== !1 && (e.disable(t), u[t] = !1);
	}
	function ae(t, n) {
		return f[t] !== n && (e.bindFramebuffer(t, n), f[t] = n, t === e.DRAW_FRAMEBUFFER && (f[e.FRAMEBUFFER] = n), t === e.FRAMEBUFFER && (f[e.DRAW_FRAMEBUFFER] = n), !0);
	}
	function se(t, n) {
		let r = m, i = !1;
		if (t) {
			r = p.get(n), r === void 0 && (r = [], p.set(n, r));
			let a = t.textures;
			if (r.length !== a.length || r[0] !== e.COLOR_ATTACHMENT0) {
				for (let t = 0, n = a.length; t < n; t++) r[t] = e.COLOR_ATTACHMENT0 + t;
				r.length = a.length, i = !0;
			}
		} else r[0] !== e.BACK && (r[0] = e.BACK, i = !0);
		i && e.drawBuffers(r);
	}
	function ce(t) {
		return h !== t && (e.useProgram(t), h = t, !0);
	}
	let H = {
		100: e.FUNC_ADD,
		101: e.FUNC_SUBTRACT,
		102: e.FUNC_REVERSE_SUBTRACT
	};
	H[103] = e.MIN, H[104] = e.MAX;
	let le = {
		200: e.ZERO,
		201: e.ONE,
		202: e.SRC_COLOR,
		204: e.SRC_ALPHA,
		210: e.SRC_ALPHA_SATURATE,
		208: e.DST_COLOR,
		206: e.DST_ALPHA,
		203: e.ONE_MINUS_SRC_COLOR,
		205: e.ONE_MINUS_SRC_ALPHA,
		209: e.ONE_MINUS_DST_COLOR,
		207: e.ONE_MINUS_DST_ALPHA,
		211: e.CONSTANT_COLOR,
		212: e.ONE_MINUS_CONSTANT_COLOR,
		213: e.CONSTANT_ALPHA,
		214: e.ONE_MINUS_CONSTANT_ALPHA
	};
	function ue(t, n, r, i, a, o, s, c, l, u) {
		if (t === 0) g === !0 && (ie(e.BLEND), g = !1);
		else if (g === !1 && (B(e.BLEND), g = !0), t !== 5) {
			if (t !== _ || u !== E) {
				if ((v !== 100 || x !== 100) && (e.blendEquation(e.FUNC_ADD), v = 100, x = 100), u) switch (t) {
					case 1:
						e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
						break;
					case 2:
						e.blendFunc(e.ONE, e.ONE);
						break;
					case 3:
						e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
						break;
					case 4:
						e.blendFuncSeparate(e.DST_COLOR, e.ONE_MINUS_SRC_ALPHA, e.ZERO, e.ONE);
						break;
					default: V("WebGLState: Invalid blending: ", t);
				}
				else switch (t) {
					case 1:
						e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
						break;
					case 2:
						e.blendFuncSeparate(e.SRC_ALPHA, e.ONE, e.ONE, e.ONE);
						break;
					case 3:
						V("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
						break;
					case 4:
						V("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
						break;
					default: V("WebGLState: Invalid blending: ", t);
				}
				y = null, b = null, S = null, C = null, w.set(0, 0, 0), T = 0, _ = t, E = u;
			}
		} else a ||= n, o ||= r, s ||= i, (n !== v || a !== x) && (e.blendEquationSeparate(H[n], H[a]), v = n, x = a), (r !== y || i !== b || o !== S || s !== C) && (e.blendFuncSeparate(le[r], le[i], le[o], le[s]), y = r, b = i, S = o, C = s), (c.equals(w) === !1 || l !== T) && (e.blendColor(c.r, c.g, c.b, l), w.copy(c), T = l), _ = t, E = !1;
	}
	function U(t, n) {
		t.side === 2 ? ie(e.CULL_FACE) : B(e.CULL_FACE);
		let r = t.side === 1;
		n && (r = !r), de(r), t.blending === 1 && t.transparent === !1 ? ue(0) : ue(t.blending, t.blendEquation, t.blendSrc, t.blendDst, t.blendEquationAlpha, t.blendSrcAlpha, t.blendDstAlpha, t.blendColor, t.blendAlpha, t.premultipliedAlpha), o.setFunc(t.depthFunc), o.setTest(t.depthTest), o.setMask(t.depthWrite), a.setMask(t.colorWrite);
		let i = t.stencilWrite;
		s.setTest(i), i && (s.setMask(t.stencilWriteMask), s.setFunc(t.stencilFunc, t.stencilRef, t.stencilFuncMask), s.setOp(t.stencilFail, t.stencilZFail, t.stencilZPass)), me(t.polygonOffset, t.polygonOffsetFactor, t.polygonOffsetUnits), t.alphaToCoverage === !0 ? B(e.SAMPLE_ALPHA_TO_COVERAGE) : ie(e.SAMPLE_ALPHA_TO_COVERAGE);
	}
	function de(t) {
		D !== t && (t ? e.frontFace(e.CW) : e.frontFace(e.CCW), D = t);
	}
	function fe(t) {
		t === 0 ? ie(e.CULL_FACE) : (B(e.CULL_FACE), t !== O && (t === 1 ? e.cullFace(e.BACK) : t === 2 ? e.cullFace(e.FRONT) : e.cullFace(e.FRONT_AND_BACK))), O = t;
	}
	function pe(t) {
		t !== k && (N && e.lineWidth(t), k = t);
	}
	function me(t, n, r) {
		t ? (B(e.POLYGON_OFFSET_FILL), (A !== n || j !== r) && (A = n, j = r, o.getReversed() && (n = -n, r = -r), e.polygonOffset(n, r))) : ie(e.POLYGON_OFFSET_FILL);
	}
	function he(t) {
		t ? B(e.SCISSOR_TEST) : ie(e.SCISSOR_TEST);
	}
	function ge(t) {
		t === void 0 && (t = e.TEXTURE0 + M - 1), I !== t && (e.activeTexture(t), I = t);
	}
	function W(t, n, r) {
		r === void 0 && (r = I === null ? e.TEXTURE0 + M - 1 : I);
		let i = L[r];
		i === void 0 && (i = {
			type: void 0,
			texture: void 0
		}, L[r] = i), (i.type !== t || i.texture !== n) && (I !== r && (e.activeTexture(r), I = r), e.bindTexture(t, n || re[t]), i.type = t, i.texture = n);
	}
	function _e() {
		let t = L[I];
		t !== void 0 && t.type !== void 0 && (e.bindTexture(t.type, null), t.type = void 0, t.texture = void 0);
	}
	function G() {
		try {
			e.compressedTexImage2D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function ve() {
		try {
			e.compressedTexImage3D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function ye() {
		try {
			e.texSubImage2D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function K() {
		try {
			e.texSubImage3D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function be() {
		try {
			e.compressedTexSubImage2D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function xe() {
		try {
			e.compressedTexSubImage3D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function Se() {
		try {
			e.texStorage2D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function Ce() {
		try {
			e.texStorage3D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function q() {
		try {
			e.texImage2D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function we() {
		try {
			e.texImage3D(...arguments);
		} catch (e) {
			V("WebGLState:", e);
		}
	}
	function Te(t) {
		return d[t] === void 0 ? e.getParameter(t) : d[t];
	}
	function Ee(t, n) {
		d[t] !== n && (e.pixelStorei(t, n), d[t] = n);
	}
	function De(t) {
		te.equals(t) === !1 && (e.scissor(t.x, t.y, t.z, t.w), te.copy(t));
	}
	function Oe(t) {
		z.equals(t) === !1 && (e.viewport(t.x, t.y, t.z, t.w), z.copy(t));
	}
	function ke(t, n) {
		let r = l.get(n);
		r === void 0 && (r = /* @__PURE__ */ new WeakMap(), l.set(n, r));
		let i = r.get(t);
		i === void 0 && (i = e.getUniformBlockIndex(n, t.name), e.uniformBlockBinding(n, i, i), r.set(t, i));
	}
	function Ae(t, n, r) {
		let i = l.get(n).get(t);
		c[i] !== r && (e.bindBufferBase(e.UNIFORM_BUFFER, i, r), c[i] = r);
	}
	function J() {
		e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.POLYGON_OFFSET_FILL), e.disable(e.SCISSOR_TEST), e.disable(e.STENCIL_TEST), e.disable(e.SAMPLE_ALPHA_TO_COVERAGE), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ONE, e.ZERO), e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO), e.blendColor(0, 0, 0, 0), e.colorMask(!0, !0, !0, !0), e.clearColor(0, 0, 0, 0), e.depthMask(!0), e.depthFunc(e.LESS), o.setReversed(!1), e.clearDepth(1), e.stencilMask(4294967295), e.stencilFunc(e.ALWAYS, 0, 4294967295), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.clearStencil(0), e.cullFace(e.BACK), e.frontFace(e.CCW), e.polygonOffset(0, 0), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, null), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), e.bindFramebuffer(e.READ_FRAMEBUFFER, null), e.useProgram(null), e.lineWidth(1), e.scissor(0, 0, e.canvas.width, e.canvas.height), e.viewport(0, 0, e.canvas.width, e.canvas.height), e.pixelStorei(e.PACK_ALIGNMENT, 4), e.pixelStorei(e.UNPACK_ALIGNMENT, 4), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !1), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, e.BROWSER_DEFAULT_WEBGL), e.pixelStorei(e.PACK_ROW_LENGTH, 0), e.pixelStorei(e.PACK_SKIP_PIXELS, 0), e.pixelStorei(e.PACK_SKIP_ROWS, 0), e.pixelStorei(e.UNPACK_ROW_LENGTH, 0), e.pixelStorei(e.UNPACK_IMAGE_HEIGHT, 0), e.pixelStorei(e.UNPACK_SKIP_PIXELS, 0), e.pixelStorei(e.UNPACK_SKIP_ROWS, 0), e.pixelStorei(e.UNPACK_SKIP_IMAGES, 0), u = {}, d = {}, I = null, L = {}, f = {}, c = {}, p = /* @__PURE__ */ new WeakMap(), m = [], h = null, g = !1, _ = null, v = null, y = null, b = null, x = null, S = null, C = null, w = new gt(0, 0, 0), T = 0, E = !1, D = null, O = null, k = null, A = null, j = null, te.set(0, 0, e.canvas.width, e.canvas.height), z.set(0, 0, e.canvas.width, e.canvas.height), a.reset(), o.reset(), s.reset();
	}
	return {
		buffers: {
			color: a,
			depth: o,
			stencil: s
		},
		enable: B,
		disable: ie,
		bindFramebuffer: ae,
		drawBuffers: se,
		useProgram: ce,
		setBlending: ue,
		setMaterial: U,
		setFlipSided: de,
		setCullFace: fe,
		setLineWidth: pe,
		setPolygonOffset: me,
		setScissorTest: he,
		activeTexture: ge,
		bindTexture: W,
		unbindTexture: _e,
		compressedTexImage2D: G,
		compressedTexImage3D: ve,
		texImage2D: q,
		texImage3D: we,
		pixelStorei: Ee,
		getParameter: Te,
		updateUBOMapping: ke,
		uniformBlockBinding: Ae,
		texStorage2D: Se,
		texStorage3D: Ce,
		texSubImage2D: ye,
		texSubImage3D: K,
		compressedTexSubImage2D: be,
		compressedTexSubImage3D: xe,
		scissor: De,
		viewport: Oe,
		reset: J
	};
}
function ls(o, s, c, l, u, d, f) {
	let p = s.has("WEBGL_multisampled_render_to_texture") ? s.get("WEBGL_multisampled_render_to_texture") : null, m = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), h = new W(), _ = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new Set(), y, b = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new Set(), S = new FinalizationRegistry((e) => x.delete(e)), C = !1;
	try {
		C = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
	} catch {}
	function w(e, t) {
		return C ? new OffscreenCanvas(e, t) : ee("canvas");
	}
	function T(e, t, n) {
		let r = 1, i = je(e);
		if ((i.width > n || i.height > n) && (r = n / Math.max(i.width, i.height)), r < 1) {
			if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof VideoFrame < "u" && e instanceof VideoFrame) {
				let n = Math.floor(r * i.width), a = Math.floor(r * i.height);
				y === void 0 && (y = w(n, a));
				let o = t ? w(n, a) : y;
				return o.width = n, o.height = a, o.getContext("2d").drawImage(e, 0, 0, n, a), B("WebGLRenderer: Texture has been resized from (" + i.width + "x" + i.height + ") to (" + n + "x" + a + ")."), o;
			}
			return "data" in e && B("WebGLRenderer: Image in DataTexture is too big (" + i.width + "x" + i.height + ")."), e;
		}
		return e;
	}
	function E(e) {
		return e.generateMipmaps;
	}
	function D(e) {
		o.generateMipmap(e);
	}
	function O(e) {
		return e.isWebGLCubeRenderTarget ? o.TEXTURE_CUBE_MAP : e.isWebGL3DRenderTarget ? o.TEXTURE_3D : e.isWebGLArrayRenderTarget || e.isCompressedArrayTexture ? o.TEXTURE_2D_ARRAY : o.TEXTURE_2D;
	}
	function k(e, t, n, r, i, a = !1) {
		if (e !== null) {
			if (o[e] !== void 0) return o[e];
			B("WebGLRenderer: Attempt to use non-existing WebGL internal format '" + e + "'");
		}
		let c;
		r && (c = s.get("EXT_texture_norm16"), c || B("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));
		let l = t;
		if (t === o.RED && (n === o.FLOAT && (l = o.R32F), n === o.HALF_FLOAT && (l = o.R16F), n === o.UNSIGNED_BYTE && (l = o.R8), n === o.UNSIGNED_SHORT && c && (l = c.R16_EXT), n === o.SHORT && c && (l = c.R16_SNORM_EXT)), t === o.RED_INTEGER && (n === o.UNSIGNED_BYTE && (l = o.R8UI), n === o.UNSIGNED_SHORT && (l = o.R16UI), n === o.UNSIGNED_INT && (l = o.R32UI), n === o.BYTE && (l = o.R8I), n === o.SHORT && (l = o.R16I), n === o.INT && (l = o.R32I)), t === o.RG && (n === o.FLOAT && (l = o.RG32F), n === o.HALF_FLOAT && (l = o.RG16F), n === o.UNSIGNED_BYTE && (l = o.RG8), n === o.UNSIGNED_SHORT && c && (l = c.RG16_EXT), n === o.SHORT && c && (l = c.RG16_SNORM_EXT)), t === o.RG_INTEGER && (n === o.UNSIGNED_BYTE && (l = o.RG8UI), n === o.UNSIGNED_SHORT && (l = o.RG16UI), n === o.UNSIGNED_INT && (l = o.RG32UI), n === o.BYTE && (l = o.RG8I), n === o.SHORT && (l = o.RG16I), n === o.INT && (l = o.RG32I)), t === o.RGB_INTEGER && (n === o.UNSIGNED_BYTE && (l = o.RGB8UI), n === o.UNSIGNED_SHORT && (l = o.RGB16UI), n === o.UNSIGNED_INT && (l = o.RGB32UI), n === o.BYTE && (l = o.RGB8I), n === o.SHORT && (l = o.RGB16I), n === o.INT && (l = o.RGB32I)), t === o.RGBA_INTEGER && (n === o.UNSIGNED_BYTE && (l = o.RGBA8UI), n === o.UNSIGNED_SHORT && (l = o.RGBA16UI), n === o.UNSIGNED_INT && (l = o.RGBA32UI), n === o.BYTE && (l = o.RGBA8I), n === o.SHORT && (l = o.RGBA16I), n === o.INT && (l = o.RGBA32I)), t === o.RGB && (n === o.UNSIGNED_SHORT && c && (l = c.RGB16_EXT), n === o.SHORT && c && (l = c.RGB16_SNORM_EXT), n === o.UNSIGNED_INT_5_9_9_9_REV && (l = o.RGB9_E5), n === o.UNSIGNED_INT_10F_11F_11F_REV && (l = o.R11F_G11F_B10F)), t === o.RGBA) {
			let e = a ? A : q.getTransfer(i);
			n === o.FLOAT && (l = o.RGBA32F), n === o.HALF_FLOAT && (l = o.RGBA16F), n === o.UNSIGNED_BYTE && (l = e === "srgb" ? o.SRGB8_ALPHA8 : o.RGBA8), n === o.UNSIGNED_SHORT && c && (l = c.RGBA16_EXT), n === o.SHORT && c && (l = c.RGBA16_SNORM_EXT), n === o.UNSIGNED_SHORT_4_4_4_4 && (l = o.RGBA4), n === o.UNSIGNED_SHORT_5_5_5_1 && (l = o.RGB5_A1);
		}
		return (l === o.R16F || l === o.R32F || l === o.RG16F || l === o.RG32F || l === o.RGBA16F || l === o.RGBA32F) && s.get("EXT_color_buffer_float"), l;
	}
	function j(e, t) {
		let n;
		return e ? t === null || t === 1014 || t === 1020 ? n = o.DEPTH24_STENCIL8 : t === 1015 ? n = o.DEPTH32F_STENCIL8 : t === 1012 && (n = o.DEPTH24_STENCIL8, B("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : t === null || t === 1014 || t === 1020 ? n = o.DEPTH_COMPONENT24 : t === 1015 ? n = o.DEPTH_COMPONENT32F : t === 1012 && (n = o.DEPTH_COMPONENT16), n;
	}
	function M(e, t) {
		return E(e) === !0 || e.isFramebufferTexture && e.minFilter !== 1003 && e.minFilter !== 1006 ? Math.log2(Math.max(t.width, t.height)) + 1 : e.mipmaps.length > 0 ? e.mipmaps.length : e.isCompressedTexture && Array.isArray(e.image) ? t.mipmaps.length : 1;
	}
	function N(e) {
		let t = new WeakRef(e);
		l.get(e).__ref = t, x.add(t), S.register(e, t, t);
	}
	function P(e) {
		let t = l.get(e).__ref;
		t !== void 0 && (x.delete(t), S.unregister(t));
	}
	function F(e) {
		L(e.target);
	}
	function I(e) {
		R(e.target);
	}
	function L(e) {
		e.removeEventListener("dispose", F), P(e), z(e), e.isVideoTexture && _.delete(e), e.isHTMLTexture && v.delete(e);
	}
	function R(e) {
		e.removeEventListener("dispose", I), P(e), re(e);
	}
	function te() {
		for (let e of x) {
			let t = e.deref();
			t !== void 0 && (t.isRenderTarget === !0 ? R(t) : L(t));
		}
		x.clear(), v.clear();
	}
	function z(e) {
		let t = l.get(e);
		if (t.__webglInit === void 0) return;
		let n = e.source, r = b.get(n);
		if (r) {
			let i = r[t.__cacheKey];
			i.usedTimes--, i.usedTimes === 0 && ne(e), Object.keys(r).length === 0 && b.delete(n);
		}
		l.remove(e);
	}
	function ne(e) {
		let t = l.get(e);
		o.deleteTexture(t.__webglTexture);
		let n = e.source, r = b.get(n);
		delete r[t.__cacheKey], f.memory.textures--;
	}
	function re(e) {
		let t = l.get(e);
		t.__depthDisposeCallback && t.__depthDisposeCallback();
		let n = e.depthTexture;
		if (n && n.renderTarget === e && L(n), e.isWebGLCubeRenderTarget) for (let e = 0; e < 6; e++) {
			if (Array.isArray(t.__webglFramebuffer[e])) for (let n = 0; n < t.__webglFramebuffer[e].length; n++) o.deleteFramebuffer(t.__webglFramebuffer[e][n]);
			else o.deleteFramebuffer(t.__webglFramebuffer[e]);
			t.__webglDepthbuffer && o.deleteRenderbuffer(t.__webglDepthbuffer[e]);
		}
		else {
			if (Array.isArray(t.__webglFramebuffer)) for (let e = 0; e < t.__webglFramebuffer.length; e++) o.deleteFramebuffer(t.__webglFramebuffer[e]);
			else o.deleteFramebuffer(t.__webglFramebuffer);
			if (t.__webglDepthbuffer && o.deleteRenderbuffer(t.__webglDepthbuffer), t.__webglMultisampledFramebuffer && o.deleteFramebuffer(t.__webglMultisampledFramebuffer), t.__webglColorRenderbuffer) for (let e = 0; e < t.__webglColorRenderbuffer.length; e++) t.__webglColorRenderbuffer[e] && o.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);
			t.__webglDepthRenderbuffer && o.deleteRenderbuffer(t.__webglDepthRenderbuffer);
		}
		let r = e.textures;
		for (let e = 0, t = r.length; e < t; e++) {
			let t = l.get(r[e]);
			t.__webglTexture && (o.deleteTexture(t.__webglTexture), f.memory.textures--), l.remove(r[e]);
		}
		l.remove(e);
	}
	let ie = 0;
	function ae() {
		ie = 0;
	}
	function oe() {
		return ie;
	}
	function se(e) {
		ie = e;
	}
	function ce() {
		let e = ie;
		return e >= u.maxTextures && B("WebGLTextures: Trying to use " + (e + 1) + " texture units while this GPU supports only " + u.maxTextures), ie += 1, e;
	}
	function H(e) {
		let t = [];
		return t.push(e.wrapS), t.push(e.wrapT), t.push(e.wrapR || 0), t.push(e.magFilter), t.push(e.minFilter), t.push(e.anisotropy), t.push(e.internalFormat), t.push(e.format), t.push(e.type), t.push(e.generateMipmaps), t.push(e.mipmapsAutoUpdate), t.push(e.premultiplyAlpha), t.push(e.flipY), t.push(e.unpackAlignment), t.push(e.colorSpace), t.join();
	}
	function le(e, t) {
		let n = l.get(e);
		if (e.isVideoTexture && Ae(e), e.isRenderTargetTexture === !1 && e.isExternalTexture !== !0 && e.version > 0 && n.__version !== e.version) {
			let r = e.image;
			if (r === null) B("WebGLRenderer: Texture marked for update but no image data found.");
			else if (r.complete === !1) B("WebGLRenderer: Texture marked for update but image is incomplete");
			else {
				ve(n, e, t);
				return;
			}
		} else e.isExternalTexture && (n.__webglTexture = e.sourceTexture ? e.sourceTexture : null);
		c.bindTexture(o.TEXTURE_2D, n.__webglTexture, o.TEXTURE0 + t);
	}
	function ue(e, t) {
		let n = l.get(e);
		e.isRenderTargetTexture === !1 && e.version > 0 && n.__version !== e.version ? ve(n, e, t) : (e.isExternalTexture && (n.__webglTexture = e.sourceTexture ? e.sourceTexture : null), c.bindTexture(o.TEXTURE_2D_ARRAY, n.__webglTexture, o.TEXTURE0 + t));
	}
	function U(e, t) {
		let n = l.get(e);
		e.isRenderTargetTexture === !1 && e.version > 0 && n.__version !== e.version ? ve(n, e, t) : c.bindTexture(o.TEXTURE_3D, n.__webglTexture, o.TEXTURE0 + t);
	}
	function de(e, t) {
		let n = l.get(e);
		e.version > 0 && n.__version !== e.version ? ye(n, e, t) : c.bindTexture(o.TEXTURE_CUBE_MAP, n.__webglTexture, o.TEXTURE0 + t);
	}
	let fe = {
		[e]: o.REPEAT,
		[t]: o.CLAMP_TO_EDGE,
		[n]: o.MIRRORED_REPEAT
	}, pe = {
		[r]: o.NEAREST,
		1004: o.NEAREST_MIPMAP_NEAREST,
		1005: o.NEAREST_MIPMAP_LINEAR,
		[i]: o.LINEAR,
		1007: o.LINEAR_MIPMAP_NEAREST,
		[a]: o.LINEAR_MIPMAP_LINEAR
	}, me = {
		512: o.NEVER,
		519: o.ALWAYS,
		513: o.LESS,
		515: o.LEQUAL,
		514: o.EQUAL,
		518: o.GEQUAL,
		516: o.GREATER,
		517: o.NOTEQUAL
	};
	function he(e, t) {
		if (t.type === 1015 && s.has("OES_texture_float_linear") === !1 && (t.magFilter === 1006 || t.magFilter === 1007 || t.magFilter === 1005 || t.magFilter === 1008 || t.minFilter === 1006 || t.minFilter === 1007 || t.minFilter === 1005 || t.minFilter === 1008) && B("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), o.texParameteri(e, o.TEXTURE_WRAP_S, fe[t.wrapS]), o.texParameteri(e, o.TEXTURE_WRAP_T, fe[t.wrapT]), (e === o.TEXTURE_3D || e === o.TEXTURE_2D_ARRAY) && o.texParameteri(e, o.TEXTURE_WRAP_R, fe[t.wrapR]), o.texParameteri(e, o.TEXTURE_MAG_FILTER, pe[t.magFilter]), o.texParameteri(e, o.TEXTURE_MIN_FILTER, pe[t.minFilter]), t.compareFunction && (o.texParameteri(e, o.TEXTURE_COMPARE_MODE, o.COMPARE_REF_TO_TEXTURE), o.texParameteri(e, o.TEXTURE_COMPARE_FUNC, me[t.compareFunction])), s.has("EXT_texture_filter_anisotropic") === !0) {
			if (t.magFilter === 1003 || t.minFilter !== 1005 && t.minFilter !== 1008 || t.type === 1015 && s.has("OES_texture_float_linear") === !1) return;
			if (t.anisotropy > 1 || l.get(t).__currentAnisotropy) {
				let n = s.get("EXT_texture_filter_anisotropic");
				o.texParameterf(e, n.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(t.anisotropy, u.getMaxAnisotropy())), l.get(t).__currentAnisotropy = t.anisotropy;
			}
		}
	}
	function ge(e, t) {
		let n = !1;
		e.__webglInit === void 0 && (e.__webglInit = !0, t.addEventListener("dispose", F), N(t));
		let r = t.source, i = b.get(r);
		i === void 0 && (i = {}, b.set(r, i));
		let a = H(t);
		if (a !== e.__cacheKey) {
			i[a] === void 0 && (i[a] = {
				texture: o.createTexture(),
				usedTimes: 0
			}, f.memory.textures++, n = !0), i[a].usedTimes++;
			let r = i[e.__cacheKey];
			r !== void 0 && (i[e.__cacheKey].usedTimes--, r.usedTimes === 0 && ne(t)), e.__cacheKey = a, e.__webglTexture = i[a].texture;
		}
		return n;
	}
	function _e(e, t, n) {
		return Math.floor(Math.floor(e / n) / t);
	}
	function G(e, t, n, r) {
		let i = e.updateRanges;
		if (i.length === 0) c.texSubImage2D(o.TEXTURE_2D, 0, 0, 0, t.width, t.height, n, r, t.data);
		else {
			i.sort((e, t) => e.start - t.start);
			let a = 0;
			for (let e = 1; e < i.length; e++) {
				let n = i[a], r = i[e], o = n.start + n.count, s = _e(r.start, t.width, 4), c = _e(n.start, t.width, 4);
				r.start <= o + 1 && s === c && _e(r.start + r.count - 1, t.width, 4) === s ? n.count = Math.max(n.count, r.start + r.count - n.start) : (++a, i[a] = r);
			}
			i.length = a + 1;
			let s = c.getParameter(o.UNPACK_ROW_LENGTH), l = c.getParameter(o.UNPACK_SKIP_PIXELS), u = c.getParameter(o.UNPACK_SKIP_ROWS);
			c.pixelStorei(o.UNPACK_ROW_LENGTH, t.width);
			for (let e = 0, a = i.length; e < a; e++) {
				let a = i[e], s = Math.floor(a.start / 4), l = Math.ceil(a.count / 4), u = s % t.width, d = Math.floor(s / t.width), f = l;
				c.pixelStorei(o.UNPACK_SKIP_PIXELS, u), c.pixelStorei(o.UNPACK_SKIP_ROWS, d), c.texSubImage2D(o.TEXTURE_2D, 0, u, d, f, 1, n, r, t.data);
			}
			e.clearUpdateRanges(), c.pixelStorei(o.UNPACK_ROW_LENGTH, s), c.pixelStorei(o.UNPACK_SKIP_PIXELS, l), c.pixelStorei(o.UNPACK_SKIP_ROWS, u);
		}
	}
	function ve(e, t, n) {
		let r = o.TEXTURE_2D;
		(t.isDataArrayTexture || t.isCompressedArrayTexture) && (r = o.TEXTURE_2D_ARRAY), t.isData3DTexture && (r = o.TEXTURE_3D);
		let i = ge(e, t), a = t.source;
		c.bindTexture(r, e.__webglTexture, o.TEXTURE0 + n);
		let s = l.get(a);
		if (a.version !== s.__version || i === !0) {
			if (c.activeTexture(o.TEXTURE0 + n), !(typeof ImageBitmap < "u" && t.image instanceof ImageBitmap)) {
				let e = q.getPrimaries(q.workingColorSpace), n = t.colorSpace === "" ? null : q.getPrimaries(t.colorSpace), r = t.colorSpace === "" || e === n ? o.NONE : o.BROWSER_DEFAULT_WEBGL;
				c.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, t.flipY), c.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha), c.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL, r);
			}
			c.pixelStorei(o.UNPACK_ALIGNMENT, t.unpackAlignment);
			let e = T(t.image, !1, u.maxTextureSize);
			e = J(t, e);
			let l = d.convert(t.format, t.colorSpace), f = d.convert(t.type), p = k(t.internalFormat, l, f, t.normalized, t.colorSpace, t.isVideoTexture);
			he(r, t);
			let m, h = t.mipmaps, _ = t.isVideoTexture !== !0, y = s.__version === void 0 || i === !0, b = a.dataReady, x = M(t, e);
			if (t.isDepthTexture) p = j(t.format === g, t.type), y && (_ ? c.texStorage2D(o.TEXTURE_2D, 1, p, e.width, e.height) : c.texImage2D(o.TEXTURE_2D, 0, p, e.width, e.height, 0, l, f, null));
			else if (t.isDataTexture) {
				if (h.length > 0) {
					_ && y && c.texStorage2D(o.TEXTURE_2D, x, p, h[0].width, h[0].height);
					for (let e = 0, t = h.length; e < t; e++) m = h[e], _ ? b && c.texSubImage2D(o.TEXTURE_2D, e, 0, 0, m.width, m.height, l, f, m.data) : c.texImage2D(o.TEXTURE_2D, e, p, m.width, m.height, 0, l, f, m.data);
					t.generateMipmaps = !1;
				} else _ ? (y && c.texStorage2D(o.TEXTURE_2D, x, p, e.width, e.height), b && G(t, e, l, f)) : c.texImage2D(o.TEXTURE_2D, 0, p, e.width, e.height, 0, l, f, e.data);
			} else if (t.isCompressedTexture) {
				if (t.isCompressedArrayTexture) {
					_ && y && c.texStorage3D(o.TEXTURE_2D_ARRAY, x, p, h[0].width, h[0].height, e.depth);
					for (let n = 0, r = h.length; n < r; n++) if (m = h[n], t.format !== 1023) {
						if (l !== null) {
							if (_) {
								if (b) {
									if (t.layerUpdates.size > 0) {
										let e = ui(m.width, m.height, t.format, t.type);
										for (let r of t.layerUpdates) {
											let t = m.data.subarray(r * e / m.data.BYTES_PER_ELEMENT, (r + 1) * e / m.data.BYTES_PER_ELEMENT);
											c.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY, n, 0, 0, r, m.width, m.height, 1, l, t);
										}
									} else c.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY, n, 0, 0, 0, m.width, m.height, e.depth, l, m.data);
								}
							} else c.compressedTexImage3D(o.TEXTURE_2D_ARRAY, n, p, m.width, m.height, e.depth, 0, m.data, 0, 0);
						} else B("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
					} else _ ? b && c.texSubImage3D(o.TEXTURE_2D_ARRAY, n, 0, 0, 0, m.width, m.height, e.depth, l, f, m.data) : c.texImage3D(o.TEXTURE_2D_ARRAY, n, p, m.width, m.height, e.depth, 0, l, f, m.data);
					t.layerUpdates.size > 0 && t.clearLayerUpdates();
				} else {
					_ && y && c.texStorage2D(o.TEXTURE_2D, x, p, h[0].width, h[0].height);
					for (let e = 0, n = h.length; e < n; e++) m = h[e], t.format === 1023 ? _ ? b && c.texSubImage2D(o.TEXTURE_2D, e, 0, 0, m.width, m.height, l, f, m.data) : c.texImage2D(o.TEXTURE_2D, e, p, m.width, m.height, 0, l, f, m.data) : l === null ? B("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : _ ? b && c.compressedTexSubImage2D(o.TEXTURE_2D, e, 0, 0, m.width, m.height, l, m.data) : c.compressedTexImage2D(o.TEXTURE_2D, e, p, m.width, m.height, 0, m.data);
				}
			} else if (t.isDataArrayTexture) {
				if (_) {
					if (y && c.texStorage3D(o.TEXTURE_2D_ARRAY, x, p, e.width, e.height, e.depth), b) {
						if (t.layerUpdates.size > 0) {
							let n = ui(e.width, e.height, t.format, t.type);
							for (let r of t.layerUpdates) {
								let t = e.data.subarray(r * n / e.data.BYTES_PER_ELEMENT, (r + 1) * n / e.data.BYTES_PER_ELEMENT);
								c.texSubImage3D(o.TEXTURE_2D_ARRAY, 0, 0, 0, r, e.width, e.height, 1, l, f, t);
							}
							t.clearLayerUpdates();
						} else c.texSubImage3D(o.TEXTURE_2D_ARRAY, 0, 0, 0, 0, e.width, e.height, e.depth, l, f, e.data);
					}
				} else c.texImage3D(o.TEXTURE_2D_ARRAY, 0, p, e.width, e.height, e.depth, 0, l, f, e.data);
			} else if (t.isData3DTexture) _ ? (y && c.texStorage3D(o.TEXTURE_3D, x, p, e.width, e.height, e.depth), b && c.texSubImage3D(o.TEXTURE_3D, 0, 0, 0, 0, e.width, e.height, e.depth, l, f, e.data)) : c.texImage3D(o.TEXTURE_3D, 0, p, e.width, e.height, e.depth, 0, l, f, e.data);
			else if (t.isFramebufferTexture) {
				if (y) {
					if (_) c.texStorage2D(o.TEXTURE_2D, x, p, e.width, e.height);
					else {
						let t = e.width, n = e.height;
						for (let e = 0; e < x; e++) c.texImage2D(o.TEXTURE_2D, e, p, t, n, 0, l, f, null), t >>= 1, n >>= 1;
					}
				}
			} else if (t.isHTMLTexture) {
				if ("texElementImage2D" in o) {
					let n = o.canvas;
					if (n.hasAttribute("layoutsubtree") || n.setAttribute("layoutsubtree", "true"), e.parentNode !== n) {
						n.appendChild(e), v.add(t), n.onpaint = (e) => {
							let t = e.changedElements;
							for (let e of v) t.includes(e.image) && (e.needsUpdate = !0);
						}, n.requestPaint();
						return;
					}
					if (o.texElementImage2D.length === 3) o.texElementImage2D(o.TEXTURE_2D, o.RGBA8, e);
					else {
						let t = o.RGBA, n = o.RGBA, r = o.UNSIGNED_BYTE;
						o.texElementImage2D(o.TEXTURE_2D, 0, t, n, r, e);
					}
					o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.LINEAR), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_S, o.CLAMP_TO_EDGE), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_T, o.CLAMP_TO_EDGE);
				}
			} else if (h.length > 0) {
				if (_ && y) {
					let e = je(h[0]);
					c.texStorage2D(o.TEXTURE_2D, x, p, e.width, e.height);
				}
				for (let e = 0, t = h.length; e < t; e++) m = h[e], _ ? b && c.texSubImage2D(o.TEXTURE_2D, e, 0, 0, l, f, m) : c.texImage2D(o.TEXTURE_2D, e, p, l, f, m);
				t.generateMipmaps = !1;
			} else if (_) {
				if (y) {
					let t = je(e);
					c.texStorage2D(o.TEXTURE_2D, x, p, t.width, t.height);
				}
				b && c.texSubImage2D(o.TEXTURE_2D, 0, 0, 0, l, f, e);
			} else c.texImage2D(o.TEXTURE_2D, 0, p, l, f, e);
			E(t) && t.mipmapsAutoUpdate === !0 && D(r), s.__version = a.version, t.onUpdate && t.onUpdate(t);
		}
		e.__version = t.version;
	}
	function ye(e, t, n) {
		if (t.image.length !== 6) return;
		let r = ge(e, t), i = t.source;
		c.bindTexture(o.TEXTURE_CUBE_MAP, e.__webglTexture, o.TEXTURE0 + n);
		let a = l.get(i);
		if (i.version !== a.__version || r === !0) {
			c.activeTexture(o.TEXTURE0 + n);
			let e = q.getPrimaries(q.workingColorSpace), s = t.colorSpace === "" ? null : q.getPrimaries(t.colorSpace), l = t.colorSpace === "" || e === s ? o.NONE : o.BROWSER_DEFAULT_WEBGL;
			c.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, t.flipY), c.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha), c.pixelStorei(o.UNPACK_ALIGNMENT, t.unpackAlignment), c.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL, l);
			let f = t.isCompressedTexture || t.image[0].isCompressedTexture, p = t.image[0] && t.image[0].isDataTexture, m = [];
			for (let e = 0; e < 6; e++) !f && !p ? m[e] = T(t.image[e], !0, u.maxCubemapSize) : m[e] = p ? t.image[e].image : t.image[e], m[e] = J(t, m[e]);
			let h = m[0], _ = d.convert(t.format, t.colorSpace), v = d.convert(t.type), y = k(t.internalFormat, _, v, t.normalized, t.colorSpace), b = t.isVideoTexture !== !0, x = a.__version === void 0 || r === !0, S = i.dataReady, C = M(t, h);
			he(o.TEXTURE_CUBE_MAP, t);
			let w;
			if (t.isDepthTexture) {
				if (y = j(t.format === g, t.type), x) {
					if (b) c.texStorage2D(o.TEXTURE_CUBE_MAP, 1, y, h.width, h.height);
					else for (let e = 0; e < 6; e++) c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, y, h.width, h.height, 0, _, v, null);
				}
			} else if (f) {
				b && x && c.texStorage2D(o.TEXTURE_CUBE_MAP, C, y, h.width, h.height);
				for (let e = 0; e < 6; e++) {
					w = m[e].mipmaps;
					for (let n = 0; n < w.length; n++) {
						let r = w[n];
						t.format === 1023 ? b ? S && c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, 0, 0, r.width, r.height, _, v, r.data) : c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, y, r.width, r.height, 0, _, v, r.data) : _ === null ? B("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : b ? S && c.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, 0, 0, r.width, r.height, _, r.data) : c.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, y, r.width, r.height, 0, r.data);
					}
				}
			} else {
				if (w = t.mipmaps, b && x) {
					w.length > 0 && C++;
					let e = je(m[0]);
					c.texStorage2D(o.TEXTURE_CUBE_MAP, C, y, e.width, e.height);
				}
				for (let e = 0; e < 6; e++) if (p) {
					b ? S && c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, 0, 0, m[e].width, m[e].height, _, v, m[e].data) : c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, y, m[e].width, m[e].height, 0, _, v, m[e].data);
					for (let t = 0; t < w.length; t++) {
						let n = w[t].image[e].image;
						b ? S && c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, t + 1, 0, 0, n.width, n.height, _, v, n.data) : c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, t + 1, y, n.width, n.height, 0, _, v, n.data);
					}
				} else {
					b ? S && c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, 0, 0, _, v, m[e]) : c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, y, _, v, m[e]);
					for (let t = 0; t < w.length; t++) {
						let n = w[t];
						b ? S && c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, t + 1, 0, 0, _, v, n.image[e]) : c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X + e, t + 1, y, _, v, n.image[e]);
					}
				}
			}
			E(t) && t.mipmapsAutoUpdate === !0 && D(o.TEXTURE_CUBE_MAP), a.__version = i.version, t.onUpdate && t.onUpdate(t);
		}
		e.__version = t.version;
	}
	function K(e, t, n, r, i, a) {
		let s = d.convert(n.format, n.colorSpace), u = d.convert(n.type), f = k(n.internalFormat, s, u, n.normalized, n.colorSpace), m = l.get(t), h = l.get(n);
		if (h.__renderTarget = t, !m.__hasExternalTextures) {
			let e = Math.max(1, t.width >> a), n = Math.max(1, t.height >> a);
			i === o.TEXTURE_3D || i === o.TEXTURE_2D_ARRAY ? c.texImage3D(i, a, f, e, n, t.depth, 0, s, u, null) : c.texImage2D(i, a, f, e, n, 0, s, u, null);
		}
		c.bindFramebuffer(o.FRAMEBUFFER, e), ke(t) ? p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER, r, i, h.__webglTexture, 0, Oe(t)) : (i === o.TEXTURE_2D || i >= o.TEXTURE_CUBE_MAP_POSITIVE_X && i <= o.TEXTURE_CUBE_MAP_NEGATIVE_Z) && o.framebufferTexture2D(o.FRAMEBUFFER, r, i, h.__webglTexture, a), c.bindFramebuffer(o.FRAMEBUFFER, null);
	}
	function be(e, t, n) {
		if (o.bindRenderbuffer(o.RENDERBUFFER, e), t.depthBuffer) {
			let r = t.depthTexture, i = r && r.isDepthTexture ? r.type : null, a = j(t.stencilBuffer, i), s = t.stencilBuffer ? o.DEPTH_STENCIL_ATTACHMENT : o.DEPTH_ATTACHMENT;
			ke(t) ? p.renderbufferStorageMultisampleEXT(o.RENDERBUFFER, Oe(t), a, t.width, t.height) : n ? o.renderbufferStorageMultisample(o.RENDERBUFFER, Oe(t), a, t.width, t.height) : o.renderbufferStorage(o.RENDERBUFFER, a, t.width, t.height), o.framebufferRenderbuffer(o.FRAMEBUFFER, s, o.RENDERBUFFER, e);
		} else {
			let e = t.textures;
			for (let r = 0; r < e.length; r++) {
				let i = e[r], a = d.convert(i.format, i.colorSpace), s = d.convert(i.type), c = k(i.internalFormat, a, s, i.normalized, i.colorSpace);
				ke(t) ? p.renderbufferStorageMultisampleEXT(o.RENDERBUFFER, Oe(t), c, t.width, t.height) : n ? o.renderbufferStorageMultisample(o.RENDERBUFFER, Oe(t), c, t.width, t.height) : o.renderbufferStorage(o.RENDERBUFFER, c, t.width, t.height);
			}
		}
		o.bindRenderbuffer(o.RENDERBUFFER, null);
	}
	function xe(e, t, n) {
		let r = t.isWebGLCubeRenderTarget === !0;
		if (c.bindFramebuffer(o.FRAMEBUFFER, e), !(t.depthTexture && t.depthTexture.isDepthTexture)) throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");
		let i = l.get(t.depthTexture);
		i.__renderTarget = t;
		let a = r ? t.depthTexture.image[0] : t.depthTexture.image;
		i.__webglTexture && a.width === t.width && a.height === t.height || (a.width = t.width, a.height = t.height, t.depthTexture.needsUpdate = !0), r ? de(t.depthTexture, 0) : le(t.depthTexture, 0);
		let s = i.__webglTexture, u = Oe(t), d = r ? o.TEXTURE_CUBE_MAP_POSITIVE_X + n : o.TEXTURE_2D, f = t.depthTexture.format === 1027 ? o.DEPTH_STENCIL_ATTACHMENT : o.DEPTH_ATTACHMENT;
		if (t.depthTexture.format === 1026) ke(t) ? p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER, f, d, s, 0, u) : o.framebufferTexture2D(o.FRAMEBUFFER, f, d, s, 0);
		else if (t.depthTexture.format === 1027) ke(t) ? p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER, f, d, s, 0, u) : o.framebufferTexture2D(o.FRAMEBUFFER, f, d, s, 0);
		else throw Error("THREE.WebGLTextures: Unknown depthTexture format.");
	}
	function Se(e) {
		let t = l.get(e), n = e.isWebGLCubeRenderTarget === !0;
		if (t.__boundDepthTexture !== e.depthTexture) {
			let n = e.depthTexture;
			if (t.__depthDisposeCallback && t.__depthDisposeCallback(), n) {
				let e = () => {
					delete t.__boundDepthTexture, delete t.__depthDisposeCallback, n.removeEventListener("dispose", e);
				};
				n.addEventListener("dispose", e), t.__depthDisposeCallback = e;
			}
			t.__boundDepthTexture = n;
		}
		if (e.depthTexture && !t.__autoAllocateDepthBuffer) {
			if (n) for (let n = 0; n < 6; n++) xe(t.__webglFramebuffer[n], e, n);
			else e.texture.mipmaps.length > 0 ? xe(t.__webglFramebuffer[0], e, 0) : xe(t.__webglFramebuffer, e, 0);
		} else if (n) {
			t.__webglDepthbuffer = [];
			for (let n = 0; n < 6; n++) if (c.bindFramebuffer(o.FRAMEBUFFER, t.__webglFramebuffer[n]), t.__webglDepthbuffer[n] === void 0) t.__webglDepthbuffer[n] = o.createRenderbuffer(), be(t.__webglDepthbuffer[n], e, !1);
			else {
				let r = e.stencilBuffer ? o.DEPTH_STENCIL_ATTACHMENT : o.DEPTH_ATTACHMENT, i = t.__webglDepthbuffer[n];
				o.bindRenderbuffer(o.RENDERBUFFER, i), o.framebufferRenderbuffer(o.FRAMEBUFFER, r, o.RENDERBUFFER, i);
			}
		} else if (e.texture.mipmaps.length > 0 ? c.bindFramebuffer(o.FRAMEBUFFER, t.__webglFramebuffer[0]) : c.bindFramebuffer(o.FRAMEBUFFER, t.__webglFramebuffer), t.__webglDepthbuffer === void 0) t.__webglDepthbuffer = o.createRenderbuffer(), be(t.__webglDepthbuffer, e, !1);
		else {
			let n = e.stencilBuffer ? o.DEPTH_STENCIL_ATTACHMENT : o.DEPTH_ATTACHMENT, r = t.__webglDepthbuffer;
			o.bindRenderbuffer(o.RENDERBUFFER, r), o.framebufferRenderbuffer(o.FRAMEBUFFER, n, o.RENDERBUFFER, r);
		}
		c.bindFramebuffer(o.FRAMEBUFFER, null);
	}
	function Ce(e, t, n) {
		let r = l.get(e);
		t !== void 0 && K(r.__webglFramebuffer, e, e.texture, o.COLOR_ATTACHMENT0, o.TEXTURE_2D, 0), n !== void 0 && Se(e);
	}
	function we(e) {
		let t = e.texture, n = l.get(e), r = l.get(t);
		e.addEventListener("dispose", I), N(e);
		let i = e.textures, a = e.isWebGLCubeRenderTarget === !0, s = i.length > 1;
		if (s || (r.__webglTexture === void 0 && (r.__webglTexture = o.createTexture()), r.__version = t.version, f.memory.textures++), a) {
			n.__webglFramebuffer = [];
			for (let e = 0; e < 6; e++) if (t.mipmaps.length > 0) {
				n.__webglFramebuffer[e] = [];
				for (let r = 0; r < t.mipmaps.length; r++) n.__webglFramebuffer[e][r] = o.createFramebuffer();
			} else n.__webglFramebuffer[e] = o.createFramebuffer();
		} else {
			if (t.mipmaps.length > 0) {
				n.__webglFramebuffer = [];
				for (let e = 0; e < t.mipmaps.length; e++) n.__webglFramebuffer[e] = o.createFramebuffer();
			} else n.__webglFramebuffer = o.createFramebuffer();
			if (s) for (let e = 0, t = i.length; e < t; e++) {
				let t = l.get(i[e]);
				t.__webglTexture === void 0 && (t.__webglTexture = o.createTexture(), f.memory.textures++);
			}
			if (e.samples > 0 && ke(e) === !1) {
				n.__webglMultisampledFramebuffer = o.createFramebuffer(), n.__webglColorRenderbuffer = [], c.bindFramebuffer(o.FRAMEBUFFER, n.__webglMultisampledFramebuffer);
				for (let t = 0; t < i.length; t++) {
					let r = i[t];
					n.__webglColorRenderbuffer[t] = o.createRenderbuffer(), o.bindRenderbuffer(o.RENDERBUFFER, n.__webglColorRenderbuffer[t]);
					let a = d.convert(r.format, r.colorSpace), s = d.convert(r.type), c = k(r.internalFormat, a, s, r.normalized, r.colorSpace, e.isXRRenderTarget === !0), l = Oe(e);
					o.renderbufferStorageMultisample(o.RENDERBUFFER, l, c, e.width, e.height), o.framebufferRenderbuffer(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0 + t, o.RENDERBUFFER, n.__webglColorRenderbuffer[t]);
				}
				o.bindRenderbuffer(o.RENDERBUFFER, null), e.depthBuffer && (n.__webglDepthRenderbuffer = o.createRenderbuffer(), be(n.__webglDepthRenderbuffer, e, !0)), c.bindFramebuffer(o.FRAMEBUFFER, null);
			}
		}
		if (a) {
			c.bindTexture(o.TEXTURE_CUBE_MAP, r.__webglTexture), he(o.TEXTURE_CUBE_MAP, t);
			for (let r = 0; r < 6; r++) if (t.mipmaps.length > 0) for (let i = 0; i < t.mipmaps.length; i++) K(n.__webglFramebuffer[r][i], e, t, o.COLOR_ATTACHMENT0, o.TEXTURE_CUBE_MAP_POSITIVE_X + r, i);
			else K(n.__webglFramebuffer[r], e, t, o.COLOR_ATTACHMENT0, o.TEXTURE_CUBE_MAP_POSITIVE_X + r, 0);
			E(t) ? D(o.TEXTURE_CUBE_MAP) : t.mipmaps.length > 0 && o.texParameteri(o.TEXTURE_CUBE_MAP, o.TEXTURE_MAX_LEVEL, t.mipmaps.length - 1), c.unbindTexture();
		} else if (s) {
			for (let t = 0, r = i.length; t < r; t++) {
				let r = i[t], a = l.get(r), s = o.TEXTURE_2D;
				(e.isWebGL3DRenderTarget || e.isWebGLArrayRenderTarget) && (s = e.isWebGL3DRenderTarget ? o.TEXTURE_3D : o.TEXTURE_2D_ARRAY), c.bindTexture(s, a.__webglTexture), he(s, r), K(n.__webglFramebuffer, e, r, o.COLOR_ATTACHMENT0 + t, s, 0), E(r) && D(s);
			}
			c.unbindTexture();
		} else {
			let i = o.TEXTURE_2D;
			if ((e.isWebGL3DRenderTarget || e.isWebGLArrayRenderTarget) && (i = e.isWebGL3DRenderTarget ? o.TEXTURE_3D : o.TEXTURE_2D_ARRAY), c.bindTexture(i, r.__webglTexture), he(i, t), t.mipmaps.length > 0) for (let r = 0; r < t.mipmaps.length; r++) K(n.__webglFramebuffer[r], e, t, o.COLOR_ATTACHMENT0, i, r);
			else K(n.__webglFramebuffer, e, t, o.COLOR_ATTACHMENT0, i, 0);
			E(t) ? D(i) : t.mipmaps.length > 0 && o.texParameteri(i, o.TEXTURE_MAX_LEVEL, t.mipmaps.length - 1), c.unbindTexture();
		}
		e.depthBuffer && Se(e);
	}
	function Te(e) {
		let t = e.textures;
		for (let n = 0, r = t.length; n < r; n++) {
			let r = t[n];
			if (E(r) && r.mipmapsAutoUpdate === !0) {
				let t = O(e), n = l.get(r).__webglTexture;
				c.bindTexture(t, n), D(t), c.unbindTexture();
			}
		}
	}
	let Ee = [];
	function De(e) {
		if (e.samples > 0) {
			if (ke(e) === !1) {
				let t = e.textures, n = e.width, r = e.height, i = o.COLOR_BUFFER_BIT, a = e.stencilBuffer ? o.DEPTH_STENCIL_ATTACHMENT : o.DEPTH_ATTACHMENT, s = l.get(e), u = t.length > 1;
				if (u) for (let e = 0; e < t.length; e++) c.bindFramebuffer(o.FRAMEBUFFER, s.__webglMultisampledFramebuffer), o.framebufferRenderbuffer(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0 + e, o.RENDERBUFFER, null), c.bindFramebuffer(o.FRAMEBUFFER, s.__webglFramebuffer), o.framebufferTexture2D(o.DRAW_FRAMEBUFFER, o.COLOR_ATTACHMENT0 + e, o.TEXTURE_2D, null, 0);
				c.bindFramebuffer(o.READ_FRAMEBUFFER, s.__webglMultisampledFramebuffer), e.texture.mipmaps.length > 0 ? c.bindFramebuffer(o.DRAW_FRAMEBUFFER, s.__webglFramebuffer[0]) : c.bindFramebuffer(o.DRAW_FRAMEBUFFER, s.__webglFramebuffer);
				for (let c = 0; c < t.length; c++) {
					if (e.resolveDepthBuffer && (e.depthBuffer && (i |= o.DEPTH_BUFFER_BIT), e.stencilBuffer && e.resolveStencilBuffer && (i |= o.STENCIL_BUFFER_BIT)), u) {
						o.framebufferRenderbuffer(o.READ_FRAMEBUFFER, o.COLOR_ATTACHMENT0, o.RENDERBUFFER, s.__webglColorRenderbuffer[c]);
						let e = l.get(t[c]).__webglTexture;
						o.framebufferTexture2D(o.DRAW_FRAMEBUFFER, o.COLOR_ATTACHMENT0, o.TEXTURE_2D, e, 0);
					}
					o.blitFramebuffer(0, 0, n, r, 0, 0, n, r, i, o.NEAREST), m === !0 && (Ee.length = 0, Ee.push(o.COLOR_ATTACHMENT0 + c), e.depthBuffer && e.storeMultisampledDepthBuffer === !1 && Ee.push(a), o.invalidateFramebuffer(o.READ_FRAMEBUFFER, Ee));
				}
				if (c.bindFramebuffer(o.READ_FRAMEBUFFER, null), c.bindFramebuffer(o.DRAW_FRAMEBUFFER, null), u) for (let e = 0; e < t.length; e++) {
					c.bindFramebuffer(o.FRAMEBUFFER, s.__webglMultisampledFramebuffer), o.framebufferRenderbuffer(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0 + e, o.RENDERBUFFER, s.__webglColorRenderbuffer[e]);
					let n = l.get(t[e]).__webglTexture;
					c.bindFramebuffer(o.FRAMEBUFFER, s.__webglFramebuffer), o.framebufferTexture2D(o.DRAW_FRAMEBUFFER, o.COLOR_ATTACHMENT0 + e, o.TEXTURE_2D, n, 0);
				}
				c.bindFramebuffer(o.DRAW_FRAMEBUFFER, s.__webglMultisampledFramebuffer);
			} else if (e.depthBuffer && e.storeMultisampledDepthBuffer === !1 && m) {
				let t = e.stencilBuffer ? o.DEPTH_STENCIL_ATTACHMENT : o.DEPTH_ATTACHMENT;
				o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER, [t]);
			}
		}
	}
	function Oe(e) {
		return Math.min(u.maxSamples, e.samples);
	}
	function ke(e) {
		let t = l.get(e);
		return e.samples > 0 && s.has("WEBGL_multisampled_render_to_texture") === !0 && t.__useRenderToTexture !== !1;
	}
	function Ae(e) {
		let t = f.render.frame;
		_.get(e) !== t && (_.set(e, t), e.update());
	}
	function J(e, t) {
		let n = e.colorSpace, r = e.format, i = e.type;
		return e.isCompressedTexture === !0 || e.isVideoTexture === !0 || n !== "srgb-linear" && n !== "" && (q.getTransfer(n) === "srgb" ? (r !== 1023 || i !== 1009) && B("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : V("WebGLTextures: Unsupported texture color space:", n)), t;
	}
	function je(e) {
		return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement ? (h.width = e.naturalWidth || e.width, h.height = e.naturalHeight || e.height) : typeof VideoFrame < "u" && e instanceof VideoFrame ? (h.width = e.displayWidth, h.height = e.displayHeight) : (h.width = e.width, h.height = e.height), h;
	}
	this.allocateTextureUnit = ce, this.resetTextureUnits = ae, this.getTextureUnits = oe, this.setTextureUnits = se, this.setTexture2D = le, this.setTexture2DArray = ue, this.setTexture3D = U, this.setTextureCube = de, this.rebindTextures = Ce, this.setupRenderTarget = we, this.updateRenderTargetMipmap = Te, this.updateMultisampleRenderTarget = De, this.setupDepthRenderbuffer = Se, this.setupFrameBufferTexture = K, this.useMultisampledRTT = ke, this.dispose = te;
}
function us(e, t) {
	function n(n, r = "") {
		let i, a = q.getTransfer(r);
		if (n === 1009) return e.UNSIGNED_BYTE;
		if (n === 1017) return e.UNSIGNED_SHORT_4_4_4_4;
		if (n === 1018) return e.UNSIGNED_SHORT_5_5_5_1;
		if (n === 35902) return e.UNSIGNED_INT_5_9_9_9_REV;
		if (n === 35899) return e.UNSIGNED_INT_10F_11F_11F_REV;
		if (n === 1010) return e.BYTE;
		if (n === 1011) return e.SHORT;
		if (n === 1012) return e.UNSIGNED_SHORT;
		if (n === 1013) return e.INT;
		if (n === 1014) return e.UNSIGNED_INT;
		if (n === 1015) return e.FLOAT;
		if (n === 1016) return e.HALF_FLOAT;
		if (n === 1021) return e.ALPHA;
		if (n === 1022) return e.RGB;
		if (n === 1023) return e.RGBA;
		if (n === 1026) return e.DEPTH_COMPONENT;
		if (n === 1027) return e.DEPTH_STENCIL;
		if (n === 1028) return e.RED;
		if (n === 1029) return e.RED_INTEGER;
		if (n === 1030) return e.RG;
		if (n === 1031) return e.RG_INTEGER;
		if (n === 1033) return e.RGBA_INTEGER;
		if (n === 33776 || n === 33777 || n === 33778 || n === 33779) {
			if (a === "srgb") {
				if (i = t.get("WEBGL_compressed_texture_s3tc_srgb"), i !== null) {
					if (n === 33776) return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;
					if (n === 33777) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
					if (n === 33778) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
					if (n === 33779) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
				} else return null;
			} else if (i = t.get("WEBGL_compressed_texture_s3tc"), i !== null) {
				if (n === 33776) return i.COMPRESSED_RGB_S3TC_DXT1_EXT;
				if (n === 33777) return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;
				if (n === 33778) return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;
				if (n === 33779) return i.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			} else return null;
		}
		if (n === 35840 || n === 35841 || n === 35842 || n === 35843) {
			if (i = t.get("WEBGL_compressed_texture_pvrtc"), i !== null) {
				if (n === 35840) return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				if (n === 35841) return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				if (n === 35842) return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				if (n === 35843) return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
			} else return null;
		}
		if (n === 36196 || n === 37492 || n === 37496 || n === 37488 || n === 37489 || n === 37490 || n === 37491) {
			if (i = t.get("WEBGL_compressed_texture_etc"), i !== null) {
				if (n === 36196 || n === 37492) return a === "srgb" ? i.COMPRESSED_SRGB8_ETC2 : i.COMPRESSED_RGB8_ETC2;
				if (n === 37496) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : i.COMPRESSED_RGBA8_ETC2_EAC;
				if (n === 37488) return i.COMPRESSED_R11_EAC;
				if (n === 37489) return i.COMPRESSED_SIGNED_R11_EAC;
				if (n === 37490) return i.COMPRESSED_RG11_EAC;
				if (n === 37491) return i.COMPRESSED_SIGNED_RG11_EAC;
			} else return null;
		}
		if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821) {
			if (i = t.get("WEBGL_compressed_texture_astc"), i !== null) {
				if (n === 37808) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : i.COMPRESSED_RGBA_ASTC_4x4_KHR;
				if (n === 37809) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : i.COMPRESSED_RGBA_ASTC_5x4_KHR;
				if (n === 37810) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : i.COMPRESSED_RGBA_ASTC_5x5_KHR;
				if (n === 37811) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : i.COMPRESSED_RGBA_ASTC_6x5_KHR;
				if (n === 37812) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : i.COMPRESSED_RGBA_ASTC_6x6_KHR;
				if (n === 37813) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : i.COMPRESSED_RGBA_ASTC_8x5_KHR;
				if (n === 37814) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : i.COMPRESSED_RGBA_ASTC_8x6_KHR;
				if (n === 37815) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : i.COMPRESSED_RGBA_ASTC_8x8_KHR;
				if (n === 37816) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : i.COMPRESSED_RGBA_ASTC_10x5_KHR;
				if (n === 37817) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : i.COMPRESSED_RGBA_ASTC_10x6_KHR;
				if (n === 37818) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : i.COMPRESSED_RGBA_ASTC_10x8_KHR;
				if (n === 37819) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : i.COMPRESSED_RGBA_ASTC_10x10_KHR;
				if (n === 37820) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : i.COMPRESSED_RGBA_ASTC_12x10_KHR;
				if (n === 37821) return a === "srgb" ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : i.COMPRESSED_RGBA_ASTC_12x12_KHR;
			} else return null;
		}
		if (n === 36492 || n === 36494 || n === 36495) {
			if (i = t.get("EXT_texture_compression_bptc"), i !== null) {
				if (n === 36492) return a === "srgb" ? i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : i.COMPRESSED_RGBA_BPTC_UNORM_EXT;
				if (n === 36494) return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
				if (n === 36495) return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
			} else return null;
		}
		if (n === 36283 || n === 36284 || n === 36285 || n === 36286) {
			if (i = t.get("EXT_texture_compression_rgtc"), i !== null) {
				if (n === 36283) return i.COMPRESSED_RED_RGTC1_EXT;
				if (n === 36284) return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;
				if (n === 36285) return i.COMPRESSED_RED_GREEN_RGTC2_EXT;
				if (n === 36286) return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
			} else return null;
		}
		return n === 1020 ? e.UNSIGNED_INT_24_8 : e[n] === void 0 ? null : e[n];
	}
	return { convert: n };
}
var ds = "\nvoid main() {\n\n	gl_Position = vec4( position, 1.0 );\n\n}", fs = "\nuniform sampler2DArray depthColor;\nuniform float depthWidth;\nuniform float depthHeight;\n\nvoid main() {\n\n	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );\n\n	if ( coord.x >= 1.0 ) {\n\n		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;\n\n	} else {\n\n		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;\n\n	}\n\n}", ps = class {
	constructor() {
		this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
	}
	init(e, t) {
		if (this.texture === null) {
			let n = new nr(e.texture);
			(e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = n;
		}
	}
	getMesh(e) {
		if (this.texture !== null && this.mesh === null) {
			let t = e.cameras[0].viewport, n = new pr({
				vertexShader: ds,
				fragmentShader: fs,
				uniforms: {
					depthColor: { value: this.texture },
					depthWidth: { value: t.z },
					depthHeight: { value: t.w }
				}
			});
			this.mesh = new Vn(new ir(20, 20), n);
		}
		return this.mesh;
	}
	reset() {
		this.texture = null, this.mesh = null;
	}
	getDepthTexture() {
		return this.texture;
	}
}, ms = class extends se {
	constructor(e, t) {
		super();
		let n = this, r = null, i = 1, a = null, s = "local-floor", l = 1, u = null, d = null, f = null, _ = null, v = null, y = null, b = typeof XRWebGLBinding < "u", x = new ps(), S = {}, C = t.getContextAttributes(), w = null, T = null, E = [], D = [], O = new W(), k = null, A = null, j = new Wr();
		j.viewport = new Ne();
		let M = new Wr();
		M.viewport = new Ne();
		let N = [j, M], P = new Xr(), F = null, I = null;
		this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(e) {
			let t = E[e];
			return t === void 0 && (t = new dt(), E[e] = t), t.getTargetRaySpace();
		}, this.getControllerGrip = function(e) {
			let t = E[e];
			return t === void 0 && (t = new dt(), E[e] = t), t.getGripSpace();
		}, this.getHand = function(e) {
			let t = E[e];
			return t === void 0 && (t = new dt(), E[e] = t), t.getHandSpace();
		};
		function L(e) {
			let t = D.indexOf(e.inputSource);
			if (t === -1) return;
			let n = E[t];
			n !== void 0 && (n.update(e.inputSource, e.frame, u || a), n.dispatchEvent({
				type: e.type,
				data: e.inputSource
			}));
		}
		function R() {
			r.removeEventListener("select", L), r.removeEventListener("selectstart", L), r.removeEventListener("selectend", L), r.removeEventListener("squeeze", L), r.removeEventListener("squeezestart", L), r.removeEventListener("squeezeend", L), r.removeEventListener("end", R), r.removeEventListener("inputsourceschange", ee);
			for (let e = 0; e < E.length; e++) {
				let t = D[e];
				t !== null && (D[e] = null, E[e].disconnect(t));
			}
			F = null, I = null, x.reset();
			for (let e in S) delete S[e];
			if (e.setRenderTarget(w), v = null, _ = null, f = null, r = null, T = null, V.stop(), n.isPresenting = !1, e.setPixelRatio(k), e.setSize(O.width, O.height, !1), A !== null) {
				let e = A.camera;
				e.fov = A.fov, e.zoom = A.zoom, e.updateProjectionMatrix(), A = null;
			}
			n.dispatchEvent({ type: "sessionend" });
		}
		this.setFramebufferScaleFactor = function(e) {
			i = e, n.isPresenting === !0 && B("WebXRManager: Cannot change framebuffer scale while presenting.");
		}, this.setReferenceSpaceType = function(e) {
			s = e, n.isPresenting === !0 && B("WebXRManager: Cannot change reference space type while presenting.");
		}, this.getReferenceSpace = function() {
			return u || a;
		}, this.setReferenceSpace = function(e) {
			u = e;
		}, this.getBaseLayer = function() {
			return _ === null ? v : _;
		}, this.getBinding = function() {
			return f === null && b && (f = new XRWebGLBinding(r, t)), f;
		}, this.getFrame = function() {
			return y;
		}, this.getSession = function() {
			return r;
		}, this.setSession = async function(d) {
			if (r = d, r !== null) {
				if (w = e.getRenderTarget(), r.addEventListener("select", L), r.addEventListener("selectstart", L), r.addEventListener("selectend", L), r.addEventListener("squeeze", L), r.addEventListener("squeezestart", L), r.addEventListener("squeezeend", L), r.addEventListener("end", R), r.addEventListener("inputsourceschange", ee), C.xrCompatible !== !0 && await t.makeXRCompatible(), k = e.getPixelRatio(), e.getSize(O), b && "createProjectionLayer" in XRWebGLBinding.prototype) {
					let n = null, a = null, s = null;
					C.depth && (s = C.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, n = C.stencil ? g : h, a = C.stencil ? p : c);
					let l = {
						colorFormat: t.RGBA8,
						depthFormat: s,
						scaleFactor: i
					};
					f = this.getBinding(), _ = f.createProjectionLayer(l), r.updateRenderState({ layers: [_] }), e.setPixelRatio(1), e.setSize(_.textureWidth, _.textureHeight, !1), T = new Fe(_.textureWidth, _.textureHeight, {
						format: m,
						type: o,
						depthTexture: new er(_.textureWidth, _.textureHeight, a, void 0, void 0, void 0, void 0, void 0, void 0, n),
						stencilBuffer: C.stencil,
						colorSpace: e.outputColorSpace,
						samples: C.antialias ? 4 : 0,
						resolveDepthBuffer: _.ignoreDepthValues === !1,
						resolveStencilBuffer: _.ignoreDepthValues === !1,
						storeMultisampledDepthBuffer: _.ignoreDepthValues === !1,
						storeMultisampledStencilBuffer: _.ignoreDepthValues === !1
					});
				} else {
					let n = {
						antialias: C.antialias,
						alpha: !0,
						depth: C.depth,
						stencil: C.stencil,
						framebufferScaleFactor: i
					};
					v = new XRWebGLLayer(r, t, n), r.updateRenderState({ baseLayer: v }), e.setPixelRatio(1), e.setSize(v.framebufferWidth, v.framebufferHeight, !1), T = new Fe(v.framebufferWidth, v.framebufferHeight, {
						format: m,
						type: o,
						colorSpace: e.outputColorSpace,
						stencilBuffer: C.stencil,
						resolveDepthBuffer: v.ignoreDepthValues === !1,
						resolveStencilBuffer: v.ignoreDepthValues === !1,
						storeMultisampledDepthBuffer: v.ignoreDepthValues === !1,
						storeMultisampledStencilBuffer: v.ignoreDepthValues === !1
					});
				}
				T.isXRRenderTarget = !0, this.setFoveation(l), u = null, a = await r.requestReferenceSpace(s), V.setContext(r), V.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
			}
		}, this.getEnvironmentBlendMode = function() {
			if (r !== null) return r.environmentBlendMode;
		}, this.getDepthTexture = function() {
			return x.getDepthTexture();
		};
		function ee(e) {
			for (let t = 0; t < e.removed.length; t++) {
				let n = e.removed[t], r = D.indexOf(n);
				r >= 0 && (D[r] = null, E[r].disconnect(n));
			}
			for (let t = 0; t < e.added.length; t++) {
				let n = e.added[t], r = D.indexOf(n);
				if (r === -1) {
					for (let e = 0; e < E.length; e++) if (e >= D.length) {
						D.push(n), r = e;
						break;
					} else if (D[e] === null) {
						D[e] = n, r = e;
						break;
					}
					if (r === -1) break;
				}
				let i = E[r];
				i && i.connect(n);
			}
		}
		function te(e, t) {
			t === null ? e.matrixWorld.copy(e.matrix) : e.matrixWorld.multiplyMatrices(t.matrixWorld, e.matrix), e.matrixWorldInverse.copy(e.matrixWorld).invert();
		}
		this.updateCamera = function(e) {
			if (r === null) return;
			let t = e.near, n = e.far;
			x.texture !== null && (x.depthNear > 0 && (t = x.depthNear), x.depthFar > 0 && (n = x.depthFar)), P.near = M.near = j.near = t, P.far = M.far = j.far = n, (F !== P.near || I !== P.far) && (r.updateRenderState({
				depthNear: P.near,
				depthFar: P.far
			}), F = P.near, I = P.far), P.layers.mask = e.layers.mask | 6, j.layers.mask = P.layers.mask & -5, M.layers.mask = P.layers.mask & -3;
			let i = e.parent, a = P.cameras;
			te(P, i);
			for (let e = 0; e < a.length; e++) te(a[e], i);
			P.projectionMatrix.copy(j.projectionMatrix), P.projectionMatrixInverse.copy(j.projectionMatrixInverse), A === null && e.isPerspectiveCamera && (A = {
				camera: e,
				fov: e.fov,
				zoom: e.zoom
			}), z(e, P, i);
		};
		function z(e, t, n) {
			n === null ? e.matrix.copy(t.matrixWorld) : (e.matrix.copy(n.matrixWorld), e.matrix.invert(), e.matrix.multiply(t.matrixWorld)), e.matrix.decompose(e.position, e.quaternion, e.scale), e.updateMatrixWorld(!0), e.projectionMatrix.copy(t.projectionMatrix), e.projectionMatrixInverse.copy(t.projectionMatrixInverse), e.isPerspectiveCamera && (e.fov = le * 2 * Math.atan(1 / e.projectionMatrix.elements[5]), e.zoom = 1);
		}
		this.getCamera = function() {
			return P;
		}, this.getFoveation = function() {
			if (_ !== null || v !== null) return l;
		}, this.setFoveation = function(e) {
			l = e, _ !== null && (_.fixedFoveation = e), v !== null && v.fixedFoveation !== void 0 && (v.fixedFoveation = e);
		}, this.hasDepthSensing = function() {
			return x.texture !== null;
		}, this.getDepthSensingMesh = function() {
			return x.getMesh(P);
		}, this.getCameraTexture = function(e) {
			return S[e];
		};
		let ne = null;
		function re(t, i) {
			if (d = i.getViewerPose(u || a), y = i, d !== null) {
				let t = d.views;
				v !== null && (e.setRenderTargetFramebuffer(T, v.framebuffer), e.setRenderTarget(T));
				let i = !1;
				t.length !== P.cameras.length && (P.cameras.length = 0, i = !0);
				for (let n = 0; n < t.length; n++) {
					let r = t[n], a = null;
					if (v !== null) a = v.getViewport(r);
					else {
						let t = f.getViewSubImage(_, r);
						a = t.viewport, n === 0 && (e.setRenderTargetTextures(T, t.colorTexture, t.depthStencilTexture), e.setRenderTarget(T));
					}
					let o = N[n];
					o === void 0 && (o = new Wr(), o.layers.enable(n), o.viewport = new Ne(), N[n] = o), o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.quaternion, o.scale), o.projectionMatrix.fromArray(r.projectionMatrix), o.projectionMatrixInverse.copy(o.projectionMatrix).invert(), o.viewport.set(a.x, a.y, a.width, a.height), n === 0 && (P.matrix.copy(o.matrix), P.matrix.decompose(P.position, P.quaternion, P.scale)), i === !0 && P.cameras.push(o);
				}
				let a = r.enabledFeatures;
				if (a && a.includes("depth-sensing") && r.depthUsage == "gpu-optimized" && b) {
					f = n.getBinding();
					let e = f.getDepthInformation(t[0]);
					e && e.isValid && e.texture && x.init(e, r.renderState);
				}
				if (a && a.includes("camera-access") && b) {
					e.state.unbindTexture(), f = n.getBinding();
					for (let e = 0; e < t.length; e++) {
						let n = t[e].camera;
						if (n) {
							let e = S[n];
							e || (e = new nr(), S[n] = e);
							let t = f.getCameraImage(n);
							e.sourceTexture = t;
						}
					}
				}
			}
			for (let e = 0; e < E.length; e++) {
				let t = D[e], n = E[e];
				t !== null && n !== void 0 && n.update(t, i, u || a);
			}
			ne && ne(t, i), i.detectedPlanes && n.dispatchEvent({
				type: "planesdetected",
				data: i
			}), y = null;
		}
		let V = new fi();
		V.setAnimationLoop(re), this.setAnimationLoop = function(e) {
			ne = e;
		}, this.dispose = function() {};
	}
}, hs = /*@__PURE__*/ new Le(), gs = /*@__PURE__*/ new K();
gs.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
function _s(e, t) {
	function n(e, t) {
		e.matrixAutoUpdate === !0 && e.updateMatrix(), t.value.copy(e.matrix);
	}
	function r(t, n) {
		n.color.getRGB(t.fogColor.value, lr(e)), n.isFog ? (t.fogNear.value = n.near, t.fogFar.value = n.far) : n.isFogExp2 && (t.fogDensity.value = n.density);
	}
	function i(e, t, n, r, i) {
		t.isNodeMaterial ? t.uniformsNeedUpdate = !1 : t.isMeshBasicMaterial ? a(e, t) : t.isMeshLambertMaterial ? (a(e, t), t.envMap && (e.envMapIntensity.value = t.envMapIntensity)) : t.isMeshToonMaterial ? (a(e, t), d(e, t)) : t.isMeshPhongMaterial ? (a(e, t), u(e, t), t.envMap && (e.envMapIntensity.value = t.envMapIntensity)) : t.isMeshStandardMaterial ? (a(e, t), f(e, t), t.isMeshPhysicalMaterial && p(e, t, i)) : t.isMeshMatcapMaterial ? (a(e, t), m(e, t)) : t.isMeshDepthMaterial ? a(e, t) : t.isMeshDistanceMaterial ? (a(e, t), h(e, t)) : t.isMeshNormalMaterial ? a(e, t) : t.isLineBasicMaterial ? (o(e, t), t.isLineDashedMaterial && s(e, t)) : t.isPointsMaterial ? c(e, t, n, r) : t.isSpriteMaterial ? l(e, t) : t.isShadowMaterial ? (e.color.value.copy(t.color), e.opacity.value = t.opacity) : t.isShaderMaterial && (t.uniformsNeedUpdate = !1);
	}
	function a(e, r) {
		e.opacity.value = r.opacity, r.color && e.diffuse.value.copy(r.color), r.emissive && e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity), r.map && (e.map.value = r.map, n(r.map, e.mapTransform)), r.alphaMap && (e.alphaMap.value = r.alphaMap, n(r.alphaMap, e.alphaMapTransform)), r.bumpMap && (e.bumpMap.value = r.bumpMap, n(r.bumpMap, e.bumpMapTransform), e.bumpScale.value = r.bumpScale, r.side === 1 && (e.bumpScale.value *= -1)), r.normalMap && (e.normalMap.value = r.normalMap, n(r.normalMap, e.normalMapTransform), e.normalScale.value.copy(r.normalScale), r.side === 1 && e.normalScale.value.negate()), r.displacementMap && (e.displacementMap.value = r.displacementMap, n(r.displacementMap, e.displacementMapTransform), e.displacementScale.value = r.displacementScale, e.displacementBias.value = r.displacementBias), r.emissiveMap && (e.emissiveMap.value = r.emissiveMap, n(r.emissiveMap, e.emissiveMapTransform)), r.specularMap && (e.specularMap.value = r.specularMap, n(r.specularMap, e.specularMapTransform)), r.alphaTest > 0 && (e.alphaTest.value = r.alphaTest);
		let i = t.get(r), a = i.envMap, o = i.envMapRotation;
		a && (e.envMap.value = a, e.envMapRotation.value.setFromMatrix4(hs.makeRotationFromEuler(o)).transpose(), a.isCubeTexture && a.isRenderTargetTexture === !1 && e.envMapRotation.value.premultiply(gs), e.reflectivity.value = r.reflectivity, e.ior.value = r.ior, e.refractionRatio.value = r.refractionRatio), r.lightMap && (e.lightMap.value = r.lightMap, e.lightMapIntensity.value = r.lightMapIntensity, n(r.lightMap, e.lightMapTransform)), r.aoMap && (e.aoMap.value = r.aoMap, e.aoMapIntensity.value = r.aoMapIntensity, n(r.aoMap, e.aoMapTransform));
	}
	function o(e, t) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, t.map && (e.map.value = t.map, n(t.map, e.mapTransform));
	}
	function s(e, t) {
		e.dashSize.value = t.dashSize, e.totalSize.value = t.dashSize + t.gapSize, e.scale.value = t.scale;
	}
	function c(e, t, r, i) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, e.size.value = t.size * r, e.scale.value = i * .5, t.map && (e.map.value = t.map, n(t.map, e.uvTransform)), t.alphaMap && (e.alphaMap.value = t.alphaMap, n(t.alphaMap, e.alphaMapTransform)), t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest);
	}
	function l(e, t) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, e.rotation.value = t.rotation, t.map && (e.map.value = t.map, n(t.map, e.mapTransform)), t.alphaMap && (e.alphaMap.value = t.alphaMap, n(t.alphaMap, e.alphaMapTransform)), t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest);
	}
	function u(e, t) {
		e.specular.value.copy(t.specular), e.shininess.value = Math.max(t.shininess, 1e-4);
	}
	function d(e, t) {
		t.gradientMap && (e.gradientMap.value = t.gradientMap);
	}
	function f(e, t) {
		e.metalness.value = t.metalness, t.metalnessMap && (e.metalnessMap.value = t.metalnessMap, n(t.metalnessMap, e.metalnessMapTransform)), e.roughness.value = t.roughness, t.roughnessMap && (e.roughnessMap.value = t.roughnessMap, n(t.roughnessMap, e.roughnessMapTransform)), t.envMap && (e.envMapIntensity.value = t.envMapIntensity);
	}
	function p(e, t, r) {
		e.ior.value = t.ior, t.diffuseRoughness > 0 && (e.diffuseRoughness.value = t.diffuseRoughness, t.diffuseRoughnessMap && (e.diffuseRoughnessMap.value = t.diffuseRoughnessMap, n(t.diffuseRoughnessMap, e.diffuseRoughnessMapTransform))), t.sheen > 0 && (e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen), e.sheenRoughness.value = t.sheenRoughness, t.sheenColorMap && (e.sheenColorMap.value = t.sheenColorMap, n(t.sheenColorMap, e.sheenColorMapTransform)), t.sheenRoughnessMap && (e.sheenRoughnessMap.value = t.sheenRoughnessMap, n(t.sheenRoughnessMap, e.sheenRoughnessMapTransform))), t.clearcoat > 0 && (e.clearcoat.value = t.clearcoat, e.clearcoatRoughness.value = t.clearcoatRoughness, t.clearcoatMap && (e.clearcoatMap.value = t.clearcoatMap, n(t.clearcoatMap, e.clearcoatMapTransform)), t.clearcoatRoughnessMap && (e.clearcoatRoughnessMap.value = t.clearcoatRoughnessMap, n(t.clearcoatRoughnessMap, e.clearcoatRoughnessMapTransform)), t.clearcoatNormalMap && (e.clearcoatNormalMap.value = t.clearcoatNormalMap, n(t.clearcoatNormalMap, e.clearcoatNormalMapTransform), e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale), t.side === 1 && e.clearcoatNormalScale.value.negate())), t.dispersion > 0 && (e.dispersion.value = t.dispersion), t.retroreflectivity > 0 && (e.retroreflectivity.value = t.retroreflectivity), t.iridescence > 0 && (e.iridescence.value = t.iridescence, e.iridescenceIOR.value = t.iridescenceIOR, e.iridescenceThicknessMinimum.value = t.iridescenceThicknessMinimum, e.iridescenceThicknessMaximum.value = t.iridescenceThicknessMaximum, t.iridescenceMap && (e.iridescenceMap.value = t.iridescenceMap, n(t.iridescenceMap, e.iridescenceMapTransform)), t.iridescenceThicknessMap && (e.iridescenceThicknessMap.value = t.iridescenceThicknessMap, n(t.iridescenceThicknessMap, e.iridescenceThicknessMapTransform))), t.transmission > 0 && (e.transmission.value = t.transmission, e.transmissionSamplerMap.value = r.texture, e.transmissionSamplerSize.value.set(r.width, r.height), t.transmissionMap && (e.transmissionMap.value = t.transmissionMap, n(t.transmissionMap, e.transmissionMapTransform)), e.thickness.value = t.thickness, t.thicknessMap && (e.thicknessMap.value = t.thicknessMap, n(t.thicknessMap, e.thicknessMapTransform)), e.attenuationDistance.value = t.attenuationDistance, e.attenuationColor.value.copy(t.attenuationColor)), t.anisotropy > 0 && (e.anisotropyVector.value.set(t.anisotropy * Math.cos(t.anisotropyRotation), t.anisotropy * Math.sin(t.anisotropyRotation)), t.anisotropyMap && (e.anisotropyMap.value = t.anisotropyMap, n(t.anisotropyMap, e.anisotropyMapTransform))), e.specularIntensity.value = t.specularIntensity, e.specularColor.value.copy(t.specularColor), t.specularColorMap && (e.specularColorMap.value = t.specularColorMap, n(t.specularColorMap, e.specularColorMapTransform)), t.specularIntensityMap && (e.specularIntensityMap.value = t.specularIntensityMap, n(t.specularIntensityMap, e.specularIntensityMapTransform));
	}
	function m(e, t) {
		t.matcap && (e.matcap.value = t.matcap);
	}
	function h(e, n) {
		let r = t.get(n).light;
		e.referencePosition.value.setFromMatrixPosition(r.matrixWorld), e.nearDistance.value = r.shadow.camera.near, e.farDistance.value = r.shadow.camera.far;
	}
	return {
		refreshFogUniforms: r,
		refreshMaterialUniforms: i
	};
}
function vs(e, t, n, r) {
	let i = {}, a = {};
	function o(e, t) {
		let n = t.program;
		r.uniformBlockBinding(e, n, i[e.id]);
	}
	function s(e, n) {
		let o = i[e.id];
		o === void 0 && (m(e), o = c(e), i[e.id] = o, e.addEventListener("dispose", g));
		let s = n.program;
		r.updateUBOMapping(e, s);
		let u = t.render.frame;
		a[e.id] !== u && (l(e), a[e.id] = u);
	}
	function c(t) {
		let n = e.createBuffer(), r = t.__size, i = t.usage;
		return e.bindBuffer(e.UNIFORM_BUFFER, n), e.bufferData(e.UNIFORM_BUFFER, r, i), e.bindBuffer(e.UNIFORM_BUFFER, null), n;
	}
	function l(t) {
		let n = i[t.id], r = t.uniforms, a = t.__cache;
		e.bindBuffer(e.UNIFORM_BUFFER, n);
		for (let e = 0, t = r.length; e < t; e++) {
			let t = r[e];
			if (Array.isArray(t)) for (let n = 0, r = t.length; n < r; n++) u(t[n], e, n, a);
			else u(t, e, 0, a);
		}
		e.bindBuffer(e.UNIFORM_BUFFER, null);
	}
	function u(t, n, r, i) {
		if (f(t, n, r, i) === !0) {
			let n = t.__offset, r = t.value;
			if (Array.isArray(r)) {
				let e = 0;
				for (let n = 0; n < r.length; n++) {
					let i = r[n], a = h(i, !0);
					d(i, t.__data, e), e += a.storage / Float32Array.BYTES_PER_ELEMENT;
				}
			} else d(r, t.__data, 0);
			e.bufferSubData(e.UNIFORM_BUFFER, n, t.__data);
		}
	}
	function d(e, t, n) {
		typeof e == "number" || typeof e == "boolean" ? t[n] = e : e.isMatrix3 ? (t[n] = e.elements[0], t[n + 1] = e.elements[1], t[n + 2] = e.elements[2], t[n + 3] = 0, t[n + 4] = e.elements[3], t[n + 5] = e.elements[4], t[n + 6] = e.elements[5], t[n + 7] = 0, t[n + 8] = e.elements[6], t[n + 9] = e.elements[7], t[n + 10] = e.elements[8], t[n + 11] = 0) : ArrayBuffer.isView(e) ? t.set(e.subarray(0, t.length - n), n) : e.toArray(t, n);
	}
	function f(e, t, n, r) {
		let i = e.value, a = t + "_" + n;
		if (Array.isArray(i)) {
			r[a] === void 0 && (r[a] = []);
			let e = r[a], t = !1;
			for (let n = 0; n < i.length; n++) p(i[n], e, n) === !0 && (t = !0);
			return t;
		}
		return p(i, r, a);
	}
	function p(e, t, n) {
		if (t[n] === void 0) return t[n] = typeof e == "number" || typeof e == "boolean" ? e : ArrayBuffer.isView(e) ? e.slice() : e.clone(), !0;
		{
			let r = t[n];
			if (typeof e == "number" || typeof e == "boolean") {
				if (r !== e) return t[n] = e, !0;
			} else if (ArrayBuffer.isView(e)) return !0;
			else if (r.equals(e) === !1) return r.copy(e), !0;
		}
		return !1;
	}
	function m(e) {
		let t = e.uniforms, n = 0;
		for (let e = 0, r = t.length; e < r; e++) {
			let r = Array.isArray(t[e]) ? t[e] : [t[e]];
			for (let i = 0, a = r.length; i < a; i++) {
				let a = r[i], o = Array.isArray(a.value) ? a.value : [a.value], s = Array.isArray(t[e]) || Array.isArray(a.value), c = n;
				for (let e = 0, t = o.length; e < t; e++) {
					let t = o[e], r = h(t, s), i = n % 16, a = i % r.boundary, l = i + a;
					n += a, l !== 0 && 16 - l < r.storage && (n += 16 - l), e === 0 && (c = n), n += r.storage;
				}
				a.__data = new (a.type === "int" ? Int32Array : a.type === "uint" ? Uint32Array : Float32Array)((n - c) / Float32Array.BYTES_PER_ELEMENT), a.__offset = c;
			}
		}
		let r = n % 16;
		return r > 0 && (n += 16 - r), e.__size = n, e.__cache = {}, this;
	}
	function h(e, t) {
		let n = {
			boundary: 0,
			storage: 0
		};
		return typeof e == "number" || typeof e == "boolean" ? (n.boundary = 4, n.storage = 4) : e.isVector2 ? (n.boundary = 8, n.storage = 8) : e.isVector3 || e.isColor ? (n.boundary = 16, n.storage = 12) : e.isVector4 ? (n.boundary = 16, n.storage = 16) : e.isMatrix3 ? (n.boundary = 16, n.storage = 48) : e.isMatrix4 ? (n.boundary = 16, n.storage = 64) : e.isTexture ? B("WebGLRenderer: Texture samplers can not be part of an uniforms group.") : ArrayBuffer.isView(e) ? (n.boundary = 16, n.storage = e.byteLength) : B("WebGLRenderer: Unsupported uniform value type.", e), t === !0 && (n.boundary = 16, n.storage = Math.ceil(n.storage / 16) * 16), n;
	}
	function g(t) {
		let n = t.target;
		n.removeEventListener("dispose", g), e.deleteBuffer(i[n.id]), delete i[n.id], delete a[n.id];
	}
	function _() {
		for (let t in i) e.deleteBuffer(i[t]);
		i = {}, a = {};
	}
	return {
		bind: o,
		update: s,
		dispose: _
	};
}
var ys = new Uint16Array([
	12469,
	15057,
	12620,
	14925,
	13266,
	14620,
	13807,
	14376,
	14323,
	13990,
	14545,
	13625,
	14713,
	13328,
	14840,
	12882,
	14931,
	12528,
	14996,
	12233,
	15039,
	11829,
	15066,
	11525,
	15080,
	11295,
	15085,
	10976,
	15082,
	10705,
	15073,
	10495,
	13880,
	14564,
	13898,
	14542,
	13977,
	14430,
	14158,
	14124,
	14393,
	13732,
	14556,
	13410,
	14702,
	12996,
	14814,
	12596,
	14891,
	12291,
	14937,
	11834,
	14957,
	11489,
	14958,
	11194,
	14943,
	10803,
	14921,
	10506,
	14893,
	10278,
	14858,
	9960,
	14484,
	14039,
	14487,
	14025,
	14499,
	13941,
	14524,
	13740,
	14574,
	13468,
	14654,
	13106,
	14743,
	12678,
	14818,
	12344,
	14867,
	11893,
	14889,
	11509,
	14893,
	11180,
	14881,
	10751,
	14852,
	10428,
	14812,
	10128,
	14765,
	9754,
	14712,
	9466,
	14764,
	13480,
	14764,
	13475,
	14766,
	13440,
	14766,
	13347,
	14769,
	13070,
	14786,
	12713,
	14816,
	12387,
	14844,
	11957,
	14860,
	11549,
	14868,
	11215,
	14855,
	10751,
	14825,
	10403,
	14782,
	10044,
	14729,
	9651,
	14666,
	9352,
	14599,
	9029,
	14967,
	12835,
	14966,
	12831,
	14963,
	12804,
	14954,
	12723,
	14936,
	12564,
	14917,
	12347,
	14900,
	11958,
	14886,
	11569,
	14878,
	11247,
	14859,
	10765,
	14828,
	10401,
	14784,
	10011,
	14727,
	9600,
	14660,
	9289,
	14586,
	8893,
	14508,
	8533,
	15111,
	12234,
	15110,
	12234,
	15104,
	12216,
	15092,
	12156,
	15067,
	12010,
	15028,
	11776,
	14981,
	11500,
	14942,
	11205,
	14902,
	10752,
	14861,
	10393,
	14812,
	9991,
	14752,
	9570,
	14682,
	9252,
	14603,
	8808,
	14519,
	8445,
	14431,
	8145,
	15209,
	11449,
	15208,
	11451,
	15202,
	11451,
	15190,
	11438,
	15163,
	11384,
	15117,
	11274,
	15055,
	10979,
	14994,
	10648,
	14932,
	10343,
	14871,
	9936,
	14803,
	9532,
	14729,
	9218,
	14645,
	8742,
	14556,
	8381,
	14461,
	8020,
	14365,
	7603,
	15273,
	10603,
	15272,
	10607,
	15267,
	10619,
	15256,
	10631,
	15231,
	10614,
	15182,
	10535,
	15118,
	10389,
	15042,
	10167,
	14963,
	9787,
	14883,
	9447,
	14800,
	9115,
	14710,
	8665,
	14615,
	8318,
	14514,
	7911,
	14411,
	7507,
	14279,
	7198,
	15314,
	9675,
	15313,
	9683,
	15309,
	9712,
	15298,
	9759,
	15277,
	9797,
	15229,
	9773,
	15166,
	9668,
	15084,
	9487,
	14995,
	9274,
	14898,
	8910,
	14800,
	8539,
	14697,
	8234,
	14590,
	7790,
	14479,
	7409,
	14367,
	7067,
	14178,
	6621,
	15337,
	8619,
	15337,
	8631,
	15333,
	8677,
	15325,
	8769,
	15305,
	8871,
	15264,
	8940,
	15202,
	8909,
	15119,
	8775,
	15022,
	8565,
	14916,
	8328,
	14804,
	8009,
	14688,
	7614,
	14569,
	7287,
	14448,
	6888,
	14321,
	6483,
	14088,
	6171,
	15350,
	7402,
	15350,
	7419,
	15347,
	7480,
	15340,
	7613,
	15322,
	7804,
	15287,
	7973,
	15229,
	8057,
	15148,
	8012,
	15046,
	7846,
	14933,
	7611,
	14810,
	7357,
	14682,
	7069,
	14552,
	6656,
	14421,
	6316,
	14251,
	5948,
	14007,
	5528,
	15356,
	5942,
	15356,
	5977,
	15353,
	6119,
	15348,
	6294,
	15332,
	6551,
	15302,
	6824,
	15249,
	7044,
	15171,
	7122,
	15070,
	7050,
	14949,
	6861,
	14818,
	6611,
	14679,
	6349,
	14538,
	6067,
	14398,
	5651,
	14189,
	5311,
	13935,
	4958,
	15359,
	4123,
	15359,
	4153,
	15356,
	4296,
	15353,
	4646,
	15338,
	5160,
	15311,
	5508,
	15263,
	5829,
	15188,
	6042,
	15088,
	6094,
	14966,
	6001,
	14826,
	5796,
	14678,
	5543,
	14527,
	5287,
	14377,
	4985,
	14133,
	4586,
	13869,
	4257,
	15360,
	1563,
	15360,
	1642,
	15358,
	2076,
	15354,
	2636,
	15341,
	3350,
	15317,
	4019,
	15273,
	4429,
	15203,
	4732,
	15105,
	4911,
	14981,
	4932,
	14836,
	4818,
	14679,
	4621,
	14517,
	4386,
	14359,
	4156,
	14083,
	3795,
	13808,
	3437,
	15360,
	122,
	15360,
	137,
	15358,
	285,
	15355,
	636,
	15344,
	1274,
	15322,
	2177,
	15281,
	2765,
	15215,
	3223,
	15120,
	3451,
	14995,
	3569,
	14846,
	3567,
	14681,
	3466,
	14511,
	3305,
	14344,
	3121,
	14037,
	2800,
	13753,
	2467,
	15360,
	0,
	15360,
	1,
	15359,
	21,
	15355,
	89,
	15346,
	253,
	15325,
	479,
	15287,
	796,
	15225,
	1148,
	15133,
	1492,
	15008,
	1749,
	14856,
	1882,
	14685,
	1886,
	14506,
	1783,
	14324,
	1608,
	13996,
	1398,
	13702,
	1183
]), bs = null;
function xs() {
	return bs === null && (bs = new Wn(ys, 16, 16, v, u), bs.name = "DFG_LUT", bs.minFilter = i, bs.magFilter = i, bs.wrapS = t, bs.wrapT = t, bs.generateMipmaps = !1, bs.needsUpdate = !0), bs;
}
var Ss = class {
	constructor(e = {}) {
		let { canvas: t = te(), context: n = null, depth: r = !0, stencil: i = !1, alpha: l = !1, antialias: m = !1, premultipliedAlpha: h = !0, preserveDrawingBuffer: g = !1, powerPreference: v = "default", failIfMajorPerformanceCaveat: x = !1, reversedDepthBuffer: S = !1, outputBufferType: C = o } = e;
		this.isWebGLRenderer = !0;
		let w;
		if (n !== null) {
			if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
			w = n.getContextAttributes().alpha;
		} else w = l;
		let T = C, E = /* @__PURE__ */ new Set([
			b,
			y,
			_
		]), D = /* @__PURE__ */ new Set([
			o,
			c,
			s,
			p,
			d,
			f
		]), k = /* @__PURE__ */ new Uint32Array(4), A = /* @__PURE__ */ new Int32Array(4), j = {
			textures: [],
			min: [],
			max: [],
			resolution: []
		}, M = null, N = null, P = [], F = [], L = null;
		this.domElement = t, this.debug = {
			checkShaderErrors: !0,
			diagnostics: { keywords: !1 },
			onShaderError: null
		}, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = 0, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
		let R = this, ee = !1, z = null, re = null, ie = null, oe = null;
		this._outputColorSpace = O;
		let se = 0, ce = 0, H = null, le = -1, ue = null, U = new Ne(), de = new Ne(), fe = null, pe = new gt(0), me = 0, he = t.width, ge = t.height, W = 1, _e = null, ve = null, ye = new Ne(0, 0, he, ge), K = new Ne(0, 0, he, ge), be = !1, xe = new Yn(), Se = new Zn(), Ce = !1, we = !1, Te = new Le(), Ee = new G(), De = new Ne(), Oe = {
			background: null,
			fog: null,
			environment: null,
			overrideMaterial: null,
			isScene: !0
		}, ke = !1;
		function Ae() {
			return H === null ? W : 1;
		}
		let J = n;
		function je(e, n) {
			return t.getContext(e, n);
		}
		let Me, Pe, Y, Ie, X, Z, Re, ze, Be, Ve, He, Ue, We, Ge, Ke, qe, Je, Ye, Xe, Ze, Qe, $e, et;
		try {
			let e = {
				alpha: !0,
				depth: r,
				stencil: i,
				antialias: m,
				premultipliedAlpha: h,
				preserveDrawingBuffer: g,
				powerPreference: v,
				failIfMajorPerformanceCaveat: x
			};
			if ("setAttribute" in t && t.setAttribute("data-engine", "three.js r187"), t.addEventListener("webglcontextlost", rt, !1), t.addEventListener("webglcontextrestored", it, !1), t.addEventListener("webglcontextcreationerror", at, !1), J === null) {
				let t = "webgl2";
				if (J = je(t, e), J === null) throw je(t) ? Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.") : Error("THREE.WebGLRenderer: Error creating WebGL context.");
			}
			tt();
		} catch (e) {
			throw t.removeEventListener("webglcontextlost", rt, !1), t.removeEventListener("webglcontextrestored", it, !1), t.removeEventListener("webglcontextcreationerror", at, !1), V("WebGLRenderer: " + e.message), e;
		}
		function tt() {
			Me = new Vi(J), Me.init(), Qe = new us(J, Me), Pe = new xi(J, Me, e, Qe), Y = new cs(J, Me), Pe.reversedDepthBuffer && S && Y.buffers.depth.setReversed(!0), re = J.createFramebuffer(), ie = J.createFramebuffer(), oe = J.createFramebuffer(), Ie = new Wi(J), X = new Ho(), Z = new ls(J, Me, Y, X, Pe, Qe, Ie), Re = new Bi(R), ze = new pi(J), $e = new yi(J, ze), Be = new Hi(J, ze, Ie, $e), Ve = new Ki(J, Be, ze, $e, Ie), Ye = new Gi(J, Pe, Z), Ke = new Si(X), He = new Vo(R, Re, Me, Pe, $e, Ke), Ue = new _s(R, X), We = new Ko(), Ge = new $o(Me), Je = new vi(R, Re, Y, Ve, w, h), qe = new ss(R, Ve, Pe), et = new vs(J, Ie, Pe, Y), Xe = new bi(J, Me, Ie), Ze = new Ui(J, Me, Ie), Ie.programs = He.programs, R.capabilities = Pe, R.extensions = Me, R.properties = X, R.renderLists = We, R.shadowMap = qe, R.state = Y, R.info = Ie;
		}
		T !== 1009 && (L = new Ji(T, t.width, t.height, m, r, i));
		let nt = new ms(R, J);
		this.xr = nt, this.getContext = function() {
			return J;
		}, this.getContextAttributes = function() {
			return J.getContextAttributes();
		}, this.forceContextLoss = function() {
			let e = Me.get("WEBGL_lose_context");
			e && e.loseContext();
		}, this.forceContextRestore = function() {
			let e = Me.get("WEBGL_lose_context");
			e && e.restoreContext();
		}, this.getPixelRatio = function() {
			return W;
		}, this.setPixelRatio = function(e) {
			e !== void 0 && (W = e, this.setSize(he, ge, !1));
		}, this.getSize = function(e) {
			return e.set(he, ge);
		}, this.setSize = function(e, n, r = !0) {
			nt.isPresenting ? B("WebGLRenderer: Can't change size while VR device is presenting.") : (he = e, ge = n, t.width = Math.floor(e * W), t.height = Math.floor(n * W), r === !0 && (t.style.width = e + "px", t.style.height = n + "px"), L !== null && L.setSize(t.width, t.height), this.setViewport(0, 0, e, n));
		}, this.getDrawingBufferSize = function(e) {
			return e.set(he * W, ge * W).floor();
		}, this.setDrawingBufferSize = function(e, n, r) {
			he = e, ge = n, W = r, t.width = Math.floor(e * r), t.height = Math.floor(n * r), this.setViewport(0, 0, e, n);
		}, this.setEffects = function(e) {
			if (T === 1009) V("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");
			else {
				if (e) {
					for (let t = 0; t < e.length; t++) if (e[t].isOutputPass === !0) {
						B("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");
						break;
					}
				}
				L.setEffects(e || []);
			}
		}, this.getCurrentViewport = function(e) {
			return e.copy(U);
		}, this.getViewport = function(e) {
			return e.copy(ye);
		}, this.setViewport = function(e, t, n, r) {
			e.isVector4 ? ye.set(e.x, e.y, e.z, e.w) : ye.set(e, t, n, r), Y.viewport(U.copy(ye).multiplyScalar(Ae()).round());
		}, this.getScissor = function(e) {
			return e.copy(K);
		}, this.setScissor = function(e, t, n, r) {
			e.isVector4 ? K.set(e.x, e.y, e.z, e.w) : K.set(e, t, n, r), Y.scissor(de.copy(K).multiplyScalar(Ae()).round());
		}, this.getScissorTest = function() {
			return be;
		}, this.setScissorTest = function(e) {
			Y.setScissorTest(be = e);
		}, this.setOpaqueSort = function(e) {
			_e = e;
		}, this.setTransparentSort = function(e) {
			ve = e;
		}, this.getClearColor = function(e) {
			return e.copy(Je.getClearColor());
		}, this.setClearColor = function() {
			Je.setClearColor(...arguments);
		}, this.getClearAlpha = function() {
			return Je.getClearAlpha();
		}, this.setClearAlpha = function() {
			Je.setClearAlpha(...arguments);
		}, this.clear = function(e = !0, t = !0, n = !0) {
			let r = 0;
			if (e) {
				let e = !1;
				if (H !== null) {
					let t = H.texture.format;
					e = E.has(t);
				}
				if (e) {
					let e = H.texture.type, t = D.has(e), n = Je.getClearColor(), r = Je.getClearAlpha(), i = n.r, a = n.g, o = n.b;
					t ? (k[0] = i, k[1] = a, k[2] = o, k[3] = r, J.clearBufferuiv(J.COLOR, 0, k)) : (A[0] = i, A[1] = a, A[2] = o, A[3] = r, J.clearBufferiv(J.COLOR, 0, A));
				} else r |= J.COLOR_BUFFER_BIT;
			}
			t && (r |= J.DEPTH_BUFFER_BIT, this.state.buffers.depth.setMask(!0)), n && (r |= J.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), r !== 0 && J.clear(r);
		}, this.clearColor = function() {
			this.clear(!0, !1, !1);
		}, this.clearDepth = function() {
			this.clear(!1, !0, !1);
		}, this.clearStencil = function() {
			this.clear(!1, !1, !0);
		}, this.setNodesHandler = function(e) {
			e.setRenderer(this), z = e;
		}, this.dispose = function() {
			t.removeEventListener("webglcontextlost", rt, !1), t.removeEventListener("webglcontextrestored", it, !1), t.removeEventListener("webglcontextcreationerror", at, !1), Je.dispose(), We.dispose(), Ge.dispose(), Z.dispose(), X.dispose(), Re.dispose(), Ve.dispose(), Be.dispose(), $e.dispose(), et.dispose(), He.dispose(), nt.dispose(), nt.removeEventListener("sessionstart", ft), nt.removeEventListener("sessionend", pt), mt.stop();
		};
		function rt(e) {
			e.preventDefault(), ne("WebGLRenderer: Context Lost."), ee = !0;
		}
		function it() {
			ne("WebGLRenderer: Context Restored."), ee = !1;
			let e = Ie.autoReset, t = qe.enabled, n = qe.autoUpdate, r = qe.needsUpdate, i = qe.type;
			tt(), Ie.autoReset = e, qe.enabled = t, qe.autoUpdate = n, qe.needsUpdate = r, qe.type = i;
		}
		function at(e) {
			V("WebGLRenderer: A WebGL context could not be created. Reason: ", e.statusMessage);
		}
		function ot(e) {
			let t = e.target;
			t.removeEventListener("dispose", ot), st(t);
		}
		function st(e) {
			ct(e), X.remove(e);
		}
		function ct(e) {
			let t = X.get(e).programs;
			t !== void 0 && (t.forEach(function(e) {
				He.releaseProgram(e);
			}), e.isShaderMaterial && He.releaseShaderCache(e));
		}
		this.renderBufferDirect = function(e, t, n, r, i, a) {
			t === null && (t = Oe);
			let o = i.isMesh && i.matrixWorld.determinantAffine() < 0, s = Et(e, t, n, r, i);
			Y.setMaterial(r, o);
			let c = n.index, l = 1;
			if (r.wireframe === !0) {
				if (c = Be.getWireframeAttribute(n), c === void 0) return;
				l = 2;
			}
			let u = n.drawRange, d = n.attributes.position, f = u.start * l, p = (u.start + u.count) * l;
			a !== null && (f = Math.max(f, a.start * l), p = Math.min(p, (a.start + a.count) * l)), c === null ? d != null && (f = Math.max(f, 0), p = Math.min(p, d.count)) : (f = Math.max(f, 0), p = Math.min(p, c.count));
			let m = p - f;
			if (m < 0 || m === Infinity) return;
			$e.setup(i, r, s, n, c);
			let h, g = Xe;
			if (c !== null && (h = ze.get(c), g = Ze, g.setIndex(h)), i.isMesh) r.wireframe === !0 ? (Y.setLineWidth(r.wireframeLinewidth * Ae()), g.setMode(J.LINES)) : g.setMode(J.TRIANGLES);
			else if (i.isLine) {
				let e = r.linewidth;
				e === void 0 && (e = 1), Y.setLineWidth(e * Ae()), i.isLineSegments ? g.setMode(J.LINES) : i.isLineLoop ? g.setMode(J.LINE_LOOP) : g.setMode(J.LINE_STRIP);
			} else i.isPoints ? g.setMode(J.POINTS) : i.isSprite && g.setMode(J.TRIANGLES);
			if (i.isBatchedMesh) {
				if (Me.get("WEBGL_multi_draw")) g.renderMultiDraw(i._multiDrawStarts, i._multiDrawCounts, i._multiDrawCount);
				else {
					let e = i._multiDrawStarts, t = i._multiDrawCounts, n = i._multiDrawCount, a = c ? ze.get(c).bytesPerElement : 1, o = X.get(r).currentProgram.getUniforms();
					for (let r = 0; r < n; r++) o.setValue(J, "_gl_DrawID", r), g.render(e[r] / a, t[r]);
				}
			} else if (i.isInstancedMesh) g.renderInstances(f, m, i.count);
			else if (n.isInstancedBufferGeometry) {
				let e = n._maxInstanceCount === void 0 ? Infinity : n._maxInstanceCount, t = Math.min(n.instanceCount, e);
				g.renderInstances(f, m, t);
			} else g.render(f, m);
		};
		function lt(e, t, n, r) {
			z !== null && e.isNodeMaterial && z.setObject(r, e), Ce === !0 && Ke.setState(e, n, !1), e.transparent === !0 && e.side === 2 && e.forceSinglePass === !1 ? (e.side = 1, e.needsUpdate = !0, St(e, t, r), e.side = 0, e.needsUpdate = !0, St(e, t, r), e.side = 2) : St(e, t, r);
		}
		this.compile = function(e, t, n = null) {
			n === null && (n = e), z !== null && z.renderStart(e, t, n), N = Ge.get(n), N.init(t), F.push(N), n.traverseVisible(function(e) {
				e.isLight && e.layers.test(t.layers) && (N.pushLight(e), e.castShadow && N.pushShadow(e));
			}), e !== n && e.traverseVisible(function(e) {
				e.isLight && e.layers.test(t.layers) && (N.pushLight(e), e.castShadow && N.pushShadow(e));
			}), N.setupLights(), z !== null && z.updateLights(N.state.lightsArray), we = this.localClippingEnabled, Ce = Ke.init(this.clippingPlanes, we), Ce === !0 && Ke.setGlobalState(this.clippingPlanes, t), z !== null && qe.render(N.state.shadowsArray, n, t);
			let r = /* @__PURE__ */ new Set();
			return e.traverse(function(e) {
				if (!(e.isMesh || e.isPoints || e.isLine || e.isSprite)) return;
				let i = e.material;
				if (i) {
					if (Array.isArray(i)) for (let a = 0; a < i.length; a++) {
						let o = i[a];
						lt(o, n, t, e), r.add(o);
					}
					else lt(i, n, t, e), r.add(i);
				}
			}), N = F.pop(), z !== null && z.renderEnd(), r;
		}, this.compileAsync = function(e, t, n = null) {
			let r = this.compile(e, t, n);
			return new Promise((t) => {
				function n() {
					r.forEach(function(e) {
						let t = X.get(e).currentProgram;
						(t === void 0 || t.isReady()) && r.delete(e);
					}), r.size === 0 ? t(e) : setTimeout(n, 10);
				}
				Me.get("KHR_parallel_shader_compile") === null ? setTimeout(n, 10) : n();
			});
		};
		let ut = null;
		function dt(e) {
			ut && ut(e);
		}
		function ft() {
			mt.stop();
		}
		function pt() {
			mt.start();
		}
		let mt = new fi();
		mt.setAnimationLoop(dt), typeof self < "u" && mt.setContext(self), this.setAnimationLoop = function(e) {
			ut = e, nt.setAnimationLoop(e), e === null ? mt.stop() : mt.start();
		}, nt.addEventListener("sessionstart", ft), nt.addEventListener("sessionend", pt), this.render = function(e, t) {
			if (t !== void 0 && t.isCamera !== !0) {
				V("WebGLRenderer.render: camera is not an instance of THREE.Camera.");
				return;
			}
			if (ee === !0) return;
			z !== null && z.renderStart(e, t);
			let n = nt.enabled === !0 && nt.isPresenting === !0, r = L !== null && (H === null || n) && L.begin(R, H);
			if (e.matrixWorldAutoUpdate === !0 && e.updateMatrixWorld(), t.parent === null && t.matrixWorldAutoUpdate === !0 && t.updateMatrixWorld(), nt.enabled === !0 && nt.isPresenting === !0 && (L === null || L.isCompositing() === !1) && (nt.cameraAutoUpdate === !0 && nt.updateCamera(t), t = nt.getCamera()), e.isScene === !0 && e.onBeforeRender(R, e, t, H), N = Ge.get(e, F.length), N.init(t), N.state.textureUnits = Z.getTextureUnits(), F.push(N), Te.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), t.isArrayCamera ? Se.setFromArrayCamera(t) : xe.setFromProjectionMatrix(Te, I, t.reversedDepth), we = this.localClippingEnabled, Ce = Ke.init(this.clippingPlanes, we), M = We.get(e, P.length), M.init(), P.push(M), this.info.render.frame++, nt.enabled === !0 && nt.isPresenting === !0) {
				let e = R.xr.getDepthSensingMesh();
				e !== null && ht(e, t, -Infinity, R.sortObjects);
			}
			ht(e, t, 0, R.sortObjects), M.finish(), z !== null && z.updateLights(N.state.lightsArray), R.sortObjects === !0 && M.sort(_e, ve), ke = nt.enabled === !1 || nt.isPresenting === !1 || nt.hasDepthSensing() === !1, ke && Je.addToRenderList(M, e), this.info.autoReset === !0 && this.info.reset(), Ce === !0 && Ke.beginShadows();
			let i = N.state.shadowsArray;
			if (qe.render(i, e, t), Ce === !0 && Ke.endShadows(), (r && L.hasRenderPass()) === !1) {
				let n = M.opaque, r = M.transmissive;
				if (N.setupLights(), t.isArrayCamera) {
					let i = t.cameras;
					if (r.length > 0) for (let t = 0, a = i.length; t < a; t++) {
						let a = i[t];
						vt(n, r, e, a);
					}
					ke && Je.render(e);
					for (let t = 0, n = i.length; t < n; t++) {
						let n = i[t];
						_t(M, e, n, n.viewport);
					}
				} else r.length > 0 && vt(n, r, e, t), ke && Je.render(e), _t(M, e, t);
			}
			H !== null && ce === 0 && (Z.updateMultisampleRenderTarget(H), Z.updateRenderTargetMipmap(H)), r && L.end(R), e.isScene === !0 && e.onAfterRender(R, e, t), $e.resetDefaultState(), le = -1, ue = null, F.pop(), F.length > 0 ? (N = F[F.length - 1], Z.setTextureUnits(N.state.textureUnits), Ce === !0 && Ke.setGlobalState(R.clippingPlanes, N.state.camera)) : N = null, P.pop(), M = P.length > 0 ? P[P.length - 1] : null, z !== null && z.renderEnd();
		};
		function ht(e, t, n, r) {
			if (e.visible === !1) return;
			if (e.layers.test(t.layers)) {
				if (e.isGroup) n = e.renderOrder;
				else if (e.isLOD) e.autoUpdate === !0 && e.update(t);
				else if (e.isLight) N.pushLight(e), e.castShadow && N.pushShadow(e);
				else if (e.isSprite) {
					let i = t.isArrayCamera ? Se : xe;
					if (!e.frustumCulled || e.intersectsFrustum(i)) {
						r && De.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Te);
						let i = Ve.update(e), a = e.material;
						a.visible && M.push(e, i, a, n, De.z, null, t);
					}
				} else if (e.isMesh || e.isLine || e.isPoints) {
					let i = t.isArrayCamera ? Se : xe;
					if (!e.frustumCulled || e.intersectsFrustum(i)) {
						let i = Ve.update(e), a = e.material;
						if (r && (e.boundingSphere === void 0 ? (i.boundingSphere === null && i.computeBoundingSphere(), De.copy(i.boundingSphere.center)) : (e.boundingSphere === null && e.computeBoundingSphere(), De.copy(e.boundingSphere.center)), De.applyMatrix4(e.matrixWorld).applyMatrix4(Te)), Array.isArray(a)) {
							let r = i.groups;
							for (let o = 0, s = r.length; o < s; o++) {
								let s = r[o], c = a[s.materialIndex];
								c && c.visible && M.push(e, i, c, n, De.z, s, t);
							}
						} else a.visible && M.push(e, i, a, n, De.z, null, t);
					}
				}
			}
			let i = e.children;
			for (let e = 0, a = i.length; e < a; e++) ht(i[e], t, n, r);
		}
		function _t(e, t, n, r) {
			let { opaque: i, transmissive: a, transparent: o } = e;
			N.setupLightsView(n), Ce === !0 && Ke.setGlobalState(R.clippingPlanes, n), r && Y.viewport(U.copy(r)), i.length > 0 && yt(i, t, n), a.length > 0 && yt(a, t, n), o.length > 0 && yt(o, t, n), Y.buffers.depth.setTest(!0), Y.buffers.depth.setMask(!0), Y.buffers.color.setMask(!0), Y.setPolygonOffset(!1);
		}
		function vt(e, t, n, r) {
			if ((n.isScene === !0 ? n.overrideMaterial : null) !== null) return;
			if (N.state.transmissionRenderTarget[r.id] === void 0) {
				let e = Me.has("EXT_color_buffer_half_float") || Me.has("EXT_color_buffer_float");
				N.state.transmissionRenderTarget[r.id] = new Fe(1, 1, {
					generateMipmaps: !0,
					type: e ? u : o,
					minFilter: a,
					samples: Math.max(4, Pe.samples),
					stencilBuffer: i,
					resolveDepthBuffer: !1,
					resolveStencilBuffer: !1,
					storeMultisampledDepthBuffer: !1,
					storeMultisampledStencilBuffer: !1,
					colorSpace: q.workingColorSpace
				});
			}
			let s = N.state.transmissionRenderTarget[r.id], c = r.viewport || U;
			s.setSize(c.z * R.transmissionResolutionScale, c.w * R.transmissionResolutionScale);
			let l = R.getRenderTarget(), d = R.getActiveCubeFace(), f = R.getActiveMipmapLevel();
			R.setRenderTarget(s), R.getClearColor(pe), me = R.getClearAlpha(), me < 1 && R.setClearColor(16777215, .5), R.clear(), ke && Je.render(n);
			let p = R.toneMapping;
			R.toneMapping = 0;
			let m = r.viewport;
			if (r.viewport !== void 0 && (r.viewport = void 0), N.setupLightsView(r), Ce === !0 && Ke.setGlobalState(R.clippingPlanes, r), yt(e, n, r), Z.updateMultisampleRenderTarget(s), Z.updateRenderTargetMipmap(s), Me.has("WEBGL_multisampled_render_to_texture") === !1) {
				let e = !1;
				for (let i = 0, a = t.length; i < a; i++) {
					let { object: a, geometry: o, material: s, group: c } = t[i];
					if (s.side === 2 && a.layers.test(r.layers)) {
						let t = s.side;
						s.side = 1, s.needsUpdate = !0, bt(a, n, r, o, s, c), s.side = t, s.needsUpdate = !0, e = !0;
					}
				}
				e === !0 && (Z.updateMultisampleRenderTarget(s), Z.updateRenderTargetMipmap(s));
			}
			R.setRenderTarget(l, d, f), R.setClearColor(pe, me), m !== void 0 && (r.viewport = m), R.toneMapping = p;
		}
		function yt(e, t, n) {
			let r = t.isScene === !0 ? t.overrideMaterial : null;
			for (let i = 0, a = e.length; i < a; i++) {
				let a = e[i], { object: o, geometry: s, group: c } = a, l = a.material;
				l.allowOverride === !0 && r !== null && (l = r), o.layers.test(n.layers) && bt(o, t, n, s, l, c);
			}
		}
		function bt(e, t, n, r, i, a) {
			z !== null && i.isNodeMaterial && z.setObject(e, i), e.onBeforeRender(R, t, n, r, i, a), e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse, e.matrixWorld), e.normalMatrix.getNormalMatrix(e.modelViewMatrix), i.onBeforeRender(R, t, n, r, e, a), i.transparent === !0 && i.side === 2 && i.forceSinglePass === !1 ? (i.side = 1, i.needsUpdate = !0, R.renderBufferDirect(n, t, r, i, e, a), i.side = 0, i.needsUpdate = !0, R.renderBufferDirect(n, t, r, i, e, a), i.side = 2) : R.renderBufferDirect(n, t, r, i, e, a), e.onAfterRender(R, t, n, r, i, a);
		}
		function xt(e) {
			let t = 0;
			for (let n of e) n.texture !== null && t++;
			return t;
		}
		function St(e, t, n) {
			t.isScene !== !0 && (t = Oe);
			let r = X.get(e), i = N.state.lights, a = N.state.shadowsArray, o = i.state.version, s = He.getParameters(e, i.state, a, t, n, N.state.lightProbeGridArray), c = He.getProgramCacheKey(s), l = r.programs;
			r.environment = e.isMeshStandardMaterial || e.isMeshLambertMaterial || e.isMeshPhongMaterial ? t.environment : null, r.fog = t.fog;
			let u = e.isMeshStandardMaterial || e.isMeshLambertMaterial && !e.envMap || e.isMeshPhongMaterial && !e.envMap;
			r.envMap = Re.get(e.envMap || r.environment, u), r.envMapRotation = r.environment !== null && e.envMap === null ? t.environmentRotation : e.envMapRotation, l === void 0 && (e.addEventListener("dispose", ot), l = /* @__PURE__ */ new Map(), r.programs = l, r.programVariants = /* @__PURE__ */ new Map());
			let d = l.get(c);
			if (d !== void 0) {
				if (r.currentProgram === d && r.lightsStateVersion === o) return Tt(e, s), d;
			} else s.uniforms = He.getUniforms(e), z !== null && e.isNodeMaterial && z.build(e, n, s), e.onBeforeCompile(s, R), d = He.acquireProgram(s, c), l.set(c, d), r.uniforms = s.uniforms;
			let f = r.uniforms;
			return (!e.isShaderMaterial && !e.isRawShaderMaterial || e.clipping === !0) && (f.clippingPlanes = Ke.uniform), Tt(e, s), r.needsLights = Ot(e), r.lightsStateVersion = o, r.needsLights && (f.ambientLightColor.value = i.state.ambient, f.lightProbe.value = i.state.probe, f.sunLights.value = i.state.sun, f.sunLightShadows.value = i.state.sunShadow, f.directionalLights.value = i.state.directional, f.directionalLightShadows.value = i.state.directionalShadow, f.spotLights.value = i.state.spot, f.spotLightShadows.value = i.state.spotShadow, f.rectAreaLights.value = i.state.rectArea, f.ltc_1.value = i.state.rectAreaLTC1, f.ltc_2.value = i.state.rectAreaLTC2, f.pointLights.value = i.state.point, f.pointLightShadows.value = i.state.pointShadow, f.hemisphereLights.value = i.state.hemi, f.sunShadowMatrix.value = i.state.sunShadowMatrix, f.sunShadowCascade.value = i.state.sunShadowCascade, f.directionalShadowMatrix.value = i.state.directionalShadowMatrix, f.spotLightMatrix.value = i.state.spotLightMatrix, f.spotLightMap.value = i.state.spotLightMap, f.pointShadowMatrix.value = i.state.pointShadowMatrix), r.numLightProbeGrids = xt(N.state.lightProbeGridArray), r.currentProgram = d, r.uniformsList = null, d;
		}
		function Ct(e, t, n, r, i) {
			let a = X.get(e), o = a.currentProgram.id + "," + r + "," + i, s = a.programVariants.get(o);
			return s === void 0 ? (s = St(e, t, n), a.programVariants.set(o, s)) : (a.currentProgram = s, a.uniformsList = null, a.outputColorSpace = r, a.toneMapping = i), s;
		}
		function wt(e) {
			if (e.uniformsList === null) {
				let t = e.currentProgram.getUniforms();
				e.uniformsList = ro.seqWithValue(t.seq, e.uniforms);
			}
			return e.uniformsList;
		}
		function Tt(e, t) {
			let n = X.get(e);
			n.outputColorSpace = t.outputColorSpace, n.batching = t.batching, n.batchingColor = t.batchingColor, n.instancing = t.instancing, n.instancingColor = t.instancingColor, n.instancingMorph = t.instancingMorph, n.skinning = t.skinning, n.morphTargets = t.morphTargets, n.morphNormals = t.morphNormals, n.morphColors = t.morphColors, n.morphTargetsCount = t.morphTargetsCount, n.numClippingPlanes = t.numClippingPlanes, n.numIntersection = t.numClipIntersection, n.vertexAlphas = t.vertexAlphas, n.vertexTangents = t.vertexTangents, n.toneMapping = t.toneMapping;
		}
		function Et(e, t, n, r, i) {
			t.isScene !== !0 && (t = Oe), Z.resetTextureUnits();
			let a = t.fog, o = r.isMeshStandardMaterial || r.isMeshLambertMaterial || r.isMeshPhongMaterial ? t.environment : null, s = H === null ? R.outputColorSpace : H.isXRRenderTarget === !0 ? H.texture.colorSpace : q.workingColorSpace, c = r.isMeshStandardMaterial || r.isMeshLambertMaterial && !r.envMap || r.isMeshPhongMaterial && !r.envMap, l = Re.get(r.envMap || o, c), u = r.vertexColors === !0 && !!n.attributes.color && n.attributes.color.itemSize === 4, d = !!n.attributes.tangent && (!!r.normalMap || r.anisotropy > 0), f = !!n.morphAttributes.position, p = !!n.morphAttributes.normal, m = !!n.morphAttributes.color, h = 0;
			r.toneMapped && (H === null || H.isXRRenderTarget === !0) && (h = R.toneMapping);
			let g = n.morphAttributes.position || n.morphAttributes.normal || n.morphAttributes.color, _ = g === void 0 ? 0 : g.length, v = X.get(r), y = N.state.lights;
			if (Ce === !0 && (we === !0 || e !== ue)) {
				let t = e === ue && r.id === le;
				Ke.setState(r, e, t);
			}
			let b = !1, x = !1;
			r.version === v.__version ? v.needsLights && v.lightsStateVersion !== y.state.version || i.isBatchedMesh && v.batching === !1 || !i.isBatchedMesh && v.batching === !0 || i.isBatchedMesh && v.batchingColor === !0 && i._colorsTexture === null || i.isBatchedMesh && v.batchingColor === !1 && i._colorsTexture !== null || i.isInstancedMesh && v.instancing === !1 || !i.isInstancedMesh && v.instancing === !0 || i.isSkinnedMesh && v.skinning === !1 || !i.isSkinnedMesh && v.skinning === !0 || i.isInstancedMesh && v.instancingColor === !0 && i.instanceColor === null || i.isInstancedMesh && v.instancingColor === !1 && i.instanceColor !== null || i.isInstancedMesh && v.instancingMorph === !0 && i.morphTexture === null || i.isInstancedMesh && v.instancingMorph === !1 && i.morphTexture !== null ? b = !0 : v.envMap === l ? r.fog === !0 && v.fog !== a || v.numClippingPlanes !== void 0 && (v.numClippingPlanes !== Ke.numPlanes || v.numIntersection !== Ke.numIntersection) ? b = !0 : v.vertexAlphas === u && v.vertexTangents === d && v.morphTargets === f && v.morphNormals === p && v.morphColors === m && v.morphTargetsCount === _ && v.numLightProbeGrids === xt(N.state.lightProbeGridArray) ? (v.outputColorSpace !== s || v.toneMapping !== h) && (x = !0) : b = !0 : b = !0 : (b = !0, v.__version = r.version);
			let S = v.currentProgram;
			(b === !0 || x === !0) && (S = x === !0 ? Ct(r, t, i, s, h) : St(r, t, i), z && r.isNodeMaterial && z.onUpdateProgram(r, S, v));
			let C = !1, w = !1, T = !1, E = S.getUniforms(), D = v.uniforms;
			if (Y.useProgram(S.program) && (C = !0, w = !0, T = !0), r.id !== le && (le = r.id, w = !0), C || ue !== e) {
				Y.buffers.depth.getReversed() && e.reversedDepth !== !0 && (e._reversedDepth = !0, e.updateProjectionMatrix()), E.setValue(J, "projectionMatrix", e.projectionMatrix), E.setValue(J, "viewMatrix", e.matrixWorldInverse);
				let t = E.map.cameraPosition;
				t !== void 0 && t.setValue(J, Ee.setFromMatrixPosition(e.matrixWorld)), Pe.logarithmicDepthBuffer && E.setValue(J, "logDepthBufFC", 2 / (Math.log(e.far + 1) / Math.LN2)), (r.isMeshPhongMaterial || r.isMeshToonMaterial || r.isMeshLambertMaterial || r.isMeshBasicMaterial || r.isMeshStandardMaterial || r.isShaderMaterial) && E.setValue(J, "isOrthographic", e.isOrthographicCamera === !0), ue !== e && (ue = e, w = !0, T = !0);
			}
			if (v.needsLights && (y.state.sunShadowMap.length > 0 && E.setValue(J, "sunShadowMap", y.state.sunShadowMap, Z), y.state.directionalShadowMap.length > 0 && E.setValue(J, "directionalShadowMap", y.state.directionalShadowMap, Z), y.state.spotShadowMap.length > 0 && E.setValue(J, "spotShadowMap", y.state.spotShadowMap, Z), y.state.pointShadowMap.length > 0 && E.setValue(J, "pointShadowMap", y.state.pointShadowMap, Z)), i.isSkinnedMesh) {
				E.setOptional(J, i, "bindMatrix"), E.setOptional(J, i, "bindMatrixInverse");
				let e = i.skeleton;
				e && (e.boneTexture === null && e.computeBoneTexture(), E.setValue(J, "boneTexture", e.boneTexture, Z));
			}
			i.isBatchedMesh && (E.setOptional(J, i, "batchingTexture"), E.setValue(J, "batchingTexture", i._matricesTexture, Z), E.setOptional(J, i, "batchingIdTexture"), E.setValue(J, "batchingIdTexture", i._indirectTexture, Z), E.setOptional(J, i, "batchingColorTexture"), i._colorsTexture !== null && E.setValue(J, "batchingColorTexture", i._colorsTexture, Z));
			let O = n.morphAttributes;
			if ((O.position !== void 0 || O.normal !== void 0 || O.color !== void 0) && Ye.update(i, n, S), (w || v.receiveShadow !== i.receiveShadow) && (v.receiveShadow = i.receiveShadow, E.setValue(J, "receiveShadow", i.receiveShadow)), (r.isMeshStandardMaterial || r.isMeshLambertMaterial || r.isMeshPhongMaterial) && r.envMap === null && t.environment !== null && (D.envMapIntensity.value = t.environmentIntensity), D.dfgLUT !== void 0 && (D.dfgLUT.value = xs()), w) {
				if (E.setValue(J, "toneMappingExposure", R.toneMappingExposure), v.needsLights && Dt(D, T), a && r.fog === !0 && Ue.refreshFogUniforms(D, a), Ue.refreshMaterialUniforms(D, r, W, ge, N.state.transmissionRenderTarget[e.id]), v.needsLights && v.numLightProbeGrids > 0) {
					let e = j, t = 0;
					for (let n of N.state.lightProbeGridArray) n.texture !== null && (e.textures[t] = n.texture, e.min[t] = n.boundingBox.min, e.max[t] = n.boundingBox.max, e.resolution[t] = n.resolution, t++);
					for (let n in e) e[n].length = t;
					D.probesSH.value = e.textures, D.probesMin.value = e.min, D.probesMax.value = e.max, D.probesResolution.value = e.resolution;
				}
				ro.upload(J, wt(v), D, Z);
			}
			if (r.isShaderMaterial && r.uniformsNeedUpdate === !0 && (ro.upload(J, wt(v), D, Z), r.uniformsNeedUpdate = !1), r.isSpriteMaterial && E.setValue(J, "center", i.center), E.setValue(J, "modelViewMatrix", i.modelViewMatrix), E.setValue(J, "normalMatrix", i.normalMatrix), E.setValue(J, "modelMatrix", i.matrixWorld), r.uniformsGroups !== void 0) {
				let e = r.uniformsGroups;
				for (let t = 0, n = e.length; t < n; t++) {
					let n = e[t];
					et.update(n, S), et.bind(n, S);
				}
			}
			return S;
		}
		function Dt(e, t) {
			e.ambientLightColor.needsUpdate = t, e.lightProbe.needsUpdate = t, e.sunLights.needsUpdate = t, e.sunLightShadows.needsUpdate = t, e.directionalLights.needsUpdate = t, e.directionalLightShadows.needsUpdate = t, e.pointLights.needsUpdate = t, e.pointLightShadows.needsUpdate = t, e.spotLights.needsUpdate = t, e.spotLightShadows.needsUpdate = t, e.rectAreaLights.needsUpdate = t, e.hemisphereLights.needsUpdate = t;
		}
		function Ot(e) {
			return e.isMeshLambertMaterial || e.isMeshToonMaterial || e.isMeshPhongMaterial || e.isMeshStandardMaterial || e.isShadowMaterial || e.isShaderMaterial && e.lights === !0;
		}
		this.getActiveCubeFace = function() {
			return se;
		}, this.getActiveMipmapLevel = function() {
			return ce;
		}, this.getRenderTarget = function() {
			return H;
		}, this.setRenderTargetTextures = function(e, t, n) {
			let r = X.get(e);
			r.__autoAllocateDepthBuffer = e.resolveDepthBuffer === !1, r.__autoAllocateDepthBuffer === !1 && (r.__useRenderToTexture = !1), X.get(e.texture).__webglTexture = t, X.get(e.depthTexture).__webglTexture = r.__autoAllocateDepthBuffer ? void 0 : n, r.__hasExternalTextures = !0;
		}, this.setRenderTargetFramebuffer = function(e, t) {
			let n = X.get(e);
			n.__webglFramebuffer = t, n.__useDefaultFramebuffer = t === void 0;
		}, this.setRenderTarget = function(e, t = 0, n = 0) {
			H = e, se = t, ce = n;
			let r = null, i = !1, a = !1;
			if (e) {
				let o = X.get(e);
				if (o.__useDefaultFramebuffer !== void 0) {
					Y.bindFramebuffer(J.FRAMEBUFFER, o.__webglFramebuffer), U.copy(e.viewport), de.copy(e.scissor), fe = e.scissorTest, Y.viewport(U), Y.scissor(de), Y.setScissorTest(fe), le = -1;
					return;
				}
				if (o.__webglFramebuffer === void 0) Z.setupRenderTarget(e);
				else if (o.__hasExternalTextures) Z.rebindTextures(e, X.get(e.texture).__webglTexture, X.get(e.depthTexture).__webglTexture);
				else if (e.depthBuffer) {
					let t = e.depthTexture;
					if (o.__boundDepthTexture !== t) {
						if (t !== null && X.has(t) && (e.width !== t.image.width || e.height !== t.image.height)) throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");
						Z.setupDepthRenderbuffer(e);
					}
				}
				let s = e.texture;
				(s.isData3DTexture || s.isDataArrayTexture || s.isCompressedArrayTexture) && (a = !0);
				let c = X.get(e).__webglFramebuffer;
				e.isWebGLCubeRenderTarget ? (r = Array.isArray(c[t]) ? c[t][n] : c[t], i = !0) : r = e.samples > 0 && Z.useMultisampledRTT(e) === !1 ? X.get(e).__webglMultisampledFramebuffer : Array.isArray(c) ? c[n] : c, U.copy(e.viewport), de.copy(e.scissor), fe = e.scissorTest;
			} else U.copy(ye).multiplyScalar(W).floor(), de.copy(K).multiplyScalar(W).floor(), fe = be;
			if (n !== 0 && (r = re), Y.bindFramebuffer(J.FRAMEBUFFER, r) && Y.drawBuffers(e, r), Y.viewport(U), Y.scissor(de), Y.setScissorTest(fe), i) {
				let r = X.get(e.texture);
				J.framebufferTexture2D(J.FRAMEBUFFER, J.COLOR_ATTACHMENT0, J.TEXTURE_CUBE_MAP_POSITIVE_X + t, r.__webglTexture, n);
			} else if (a) {
				let r = t;
				for (let t = 0; t < e.textures.length; t++) {
					let i = X.get(e.textures[t]);
					J.framebufferTextureLayer(J.FRAMEBUFFER, J.COLOR_ATTACHMENT0 + t, i.__webglTexture, n, r);
				}
			} else if (e !== null && n !== 0) {
				let t = X.get(e.texture);
				J.framebufferTexture2D(J.FRAMEBUFFER, J.COLOR_ATTACHMENT0, J.TEXTURE_2D, t.__webglTexture, n);
			}
			le = -1;
		};
		function kt(e) {
			let t = X.get(e);
			return (t.__readFormat !== e.format || t.__readType !== e.type) && (t.__readFormat = e.format, t.__readType = e.type, t.__formatReadable = Pe.textureFormatReadable(e.format), t.__typeReadable = Pe.textureTypeReadable(e.type)), t;
		}
		this.readRenderTargetPixels = function(e, t, n, r, i, a, o, s = 0) {
			if (!(e && e.isWebGLRenderTarget)) {
				V("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
				return;
			}
			let c = X.get(e).__webglFramebuffer;
			if (e.isWebGLCubeRenderTarget && o !== void 0 && (c = c[o], Array.isArray(c) && (c = c[0])), c) {
				Y.bindFramebuffer(J.FRAMEBUFFER, c);
				try {
					let o = e.textures[s], c = o.format, l = o.type;
					e.textures.length > 1 && J.readBuffer(J.COLOR_ATTACHMENT0 + s);
					let u = kt(o);
					if (u.__formatReadable === !1) {
						V("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
						return;
					}
					if (u.__typeReadable === !1) {
						V("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
						return;
					}
					t >= 0 && t <= e.width - r && n >= 0 && n <= e.height - i && J.readPixels(t, n, r, i, Qe.convert(c), Qe.convert(l), a);
				} finally {
					let e = H === null ? null : X.get(H).__webglFramebuffer;
					Y.bindFramebuffer(J.FRAMEBUFFER, e);
				}
			}
		}, this.readRenderTargetPixelsAsync = async function(e, t, n, r, i, a, o, s = 0) {
			if (!(e && e.isWebGLRenderTarget)) throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
			let c = X.get(e).__webglFramebuffer;
			if (e.isWebGLCubeRenderTarget && o !== void 0 && (c = c[o], Array.isArray(c) && (c = c[0])), c) {
				if (t >= 0 && t <= e.width - r && n >= 0 && n <= e.height - i) {
					Y.bindFramebuffer(J.FRAMEBUFFER, c);
					let o = e.textures[s], l = o.format, u = o.type;
					e.textures.length > 1 && J.readBuffer(J.COLOR_ATTACHMENT0 + s);
					let d = kt(o);
					if (d.__formatReadable === !1) throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
					if (d.__typeReadable === !1) throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
					let f = J.createBuffer();
					J.bindBuffer(J.PIXEL_PACK_BUFFER, f), J.bufferData(J.PIXEL_PACK_BUFFER, a.byteLength, J.STREAM_READ), J.readPixels(t, n, r, i, Qe.convert(l), Qe.convert(u), 0), J.bindBuffer(J.PIXEL_PACK_BUFFER, null);
					let p = H === null ? null : X.get(H).__webglFramebuffer;
					Y.bindFramebuffer(J.FRAMEBUFFER, p);
					let m = J.fenceSync(J.SYNC_GPU_COMMANDS_COMPLETE, 0);
					return J.flush(), await ae(J, m, 4), J.bindBuffer(J.PIXEL_PACK_BUFFER, f), J.getBufferSubData(J.PIXEL_PACK_BUFFER, 0, a), J.bindBuffer(J.PIXEL_PACK_BUFFER, null), J.deleteBuffer(f), J.deleteSync(m), a;
				}
				throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
			}
		}, this.copyFramebufferToTexture = function(e, t = null, n = 0) {
			let r = 2 ** -n, i = Math.floor(e.image.width * r), a = Math.floor(e.image.height * r), o = t === null ? 0 : t.x, s = t === null ? 0 : t.y;
			Z.setTexture2D(e, 0), J.copyTexSubImage2D(J.TEXTURE_2D, n, 0, 0, o, s, i, a), Y.unbindTexture();
		}, this.copyTextureToTexture = function(e, t, n = null, r = null, i = 0, a = 0) {
			let o, s, c, l, u, d, f, p, m, h = e.isCompressedTexture ? e.mipmaps[a] : e.image;
			if (n !== null) o = n.max.x - n.min.x, s = n.max.y - n.min.y, c = n.isBox3 ? n.max.z - n.min.z : 1, l = n.min.x, u = n.min.y, d = n.isBox3 ? n.min.z : 0;
			else {
				let t = 2 ** -i;
				o = Math.floor(h.width * t), s = Math.floor(h.height * t), c = e.isDataArrayTexture ? h.depth : e.isData3DTexture ? Math.floor(h.depth * t) : 1, l = 0, u = 0, d = 0;
			}
			r === null ? (f = 0, p = 0, m = 0) : (f = r.x, p = r.y, m = r.z);
			let g = Qe.convert(t.format), _ = Qe.convert(t.type), v;
			t.isData3DTexture ? (Z.setTexture3D(t, 0), v = J.TEXTURE_3D) : t.isDataArrayTexture || t.isCompressedArrayTexture ? (Z.setTexture2DArray(t, 0), v = J.TEXTURE_2D_ARRAY) : (Z.setTexture2D(t, 0), v = J.TEXTURE_2D), Y.activeTexture(J.TEXTURE0), Y.pixelStorei(J.UNPACK_FLIP_Y_WEBGL, t.flipY), Y.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha), Y.pixelStorei(J.UNPACK_ALIGNMENT, t.unpackAlignment);
			let y = Y.getParameter(J.UNPACK_ROW_LENGTH), b = Y.getParameter(J.UNPACK_IMAGE_HEIGHT), x = Y.getParameter(J.UNPACK_SKIP_PIXELS), S = Y.getParameter(J.UNPACK_SKIP_ROWS), C = Y.getParameter(J.UNPACK_SKIP_IMAGES);
			Y.pixelStorei(J.UNPACK_ROW_LENGTH, h.width), Y.pixelStorei(J.UNPACK_IMAGE_HEIGHT, h.height), Y.pixelStorei(J.UNPACK_SKIP_PIXELS, l), Y.pixelStorei(J.UNPACK_SKIP_ROWS, u), Y.pixelStorei(J.UNPACK_SKIP_IMAGES, d);
			let w = e.isDataArrayTexture || e.isData3DTexture, T = t.isDataArrayTexture || t.isData3DTexture;
			if (e.isDepthTexture) {
				let n = X.get(e), r = X.get(t), h = X.get(n.__renderTarget), g = X.get(r.__renderTarget);
				Y.bindFramebuffer(J.READ_FRAMEBUFFER, h.__webglFramebuffer), Y.bindFramebuffer(J.DRAW_FRAMEBUFFER, g.__webglFramebuffer);
				for (let n = 0; n < c; n++) w && (J.framebufferTextureLayer(J.READ_FRAMEBUFFER, J.COLOR_ATTACHMENT0, X.get(e).__webglTexture, i, d + n), J.framebufferTextureLayer(J.DRAW_FRAMEBUFFER, J.COLOR_ATTACHMENT0, X.get(t).__webglTexture, a, m + n)), J.blitFramebuffer(l, u, l + o, u + s, f, p, f + o, p + s, J.DEPTH_BUFFER_BIT, J.NEAREST);
				Y.bindFramebuffer(J.READ_FRAMEBUFFER, null), Y.bindFramebuffer(J.DRAW_FRAMEBUFFER, null);
			} else if (i !== 0 || e.isRenderTargetTexture || X.has(e)) {
				let n = X.get(e), r = X.get(t);
				Y.bindFramebuffer(J.READ_FRAMEBUFFER, ie), Y.bindFramebuffer(J.DRAW_FRAMEBUFFER, oe);
				for (let e = 0; e < c; e++) w ? J.framebufferTextureLayer(J.READ_FRAMEBUFFER, J.COLOR_ATTACHMENT0, n.__webglTexture, i, d + e) : J.framebufferTexture2D(J.READ_FRAMEBUFFER, J.COLOR_ATTACHMENT0, J.TEXTURE_2D, n.__webglTexture, i), T ? J.framebufferTextureLayer(J.DRAW_FRAMEBUFFER, J.COLOR_ATTACHMENT0, r.__webglTexture, a, m + e) : J.framebufferTexture2D(J.DRAW_FRAMEBUFFER, J.COLOR_ATTACHMENT0, J.TEXTURE_2D, r.__webglTexture, a), i === 0 ? T ? J.copyTexSubImage3D(v, a, f, p, m + e, l, u, o, s) : J.copyTexSubImage2D(v, a, f, p, l, u, o, s) : J.blitFramebuffer(l, u, l + o, u + s, f, p, f + o, p + s, J.COLOR_BUFFER_BIT, J.NEAREST);
				Y.bindFramebuffer(J.READ_FRAMEBUFFER, null), Y.bindFramebuffer(J.DRAW_FRAMEBUFFER, null);
			} else T ? e.isDataTexture || e.isData3DTexture ? J.texSubImage3D(v, a, f, p, m, o, s, c, g, _, h.data) : t.isCompressedArrayTexture ? J.compressedTexSubImage3D(v, a, f, p, m, o, s, c, g, h.data) : J.texSubImage3D(v, a, f, p, m, o, s, c, g, _, h) : e.isDataTexture ? J.texSubImage2D(J.TEXTURE_2D, a, f, p, o, s, g, _, h.data) : e.isCompressedTexture ? J.compressedTexSubImage2D(J.TEXTURE_2D, a, f, p, h.width, h.height, g, h.data) : J.texSubImage2D(J.TEXTURE_2D, a, f, p, o, s, g, _, h);
			Y.pixelStorei(J.UNPACK_ROW_LENGTH, y), Y.pixelStorei(J.UNPACK_IMAGE_HEIGHT, b), Y.pixelStorei(J.UNPACK_SKIP_PIXELS, x), Y.pixelStorei(J.UNPACK_SKIP_ROWS, S), Y.pixelStorei(J.UNPACK_SKIP_IMAGES, C), a === 0 && t.generateMipmaps === !0 && t.mipmapsAutoUpdate === !0 && J.generateMipmap(v), Y.unbindTexture();
		}, this.initRenderTarget = function(e) {
			X.get(e).__webglFramebuffer === void 0 && Z.setupRenderTarget(e);
		}, this.initTexture = function(e) {
			e.isCubeTexture ? Z.setTextureCube(e, 0) : e.isData3DTexture ? Z.setTexture3D(e, 0) : e.isDataArrayTexture || e.isCompressedArrayTexture ? Z.setTexture2DArray(e, 0) : Z.setTexture2D(e, 0), Y.unbindTexture();
		}, this.resetState = function() {
			se = 0, ce = 0, H = null, Y.reset(), $e.reset();
		}, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	get coordinateSystem() {
		return I;
	}
	get outputColorSpace() {
		return this._outputColorSpace;
	}
	set outputColorSpace(e) {
		this._outputColorSpace = e;
		let t = this.getContext();
		t.drawingBufferColorSpace = q._getDrawingBufferColorSpace(e), t.unpackColorSpace = q._getUnpackColorSpace();
	}
}, Cs = 1024, ws = 1024, Ts = (e, t, n) => {
	let i = new Y(e, t, t, n);
	return i.format = m, i.type = o, i.minFilter = r, i.magFilter = r, i.generateMipmaps = !1, i.colorSpace = "", i.unpackAlignment = 1, i.needsUpdate = !0, i;
}, Es = class {
	pageSize;
	placed = [];
	page = 0;
	shelfX = 0;
	shelfY = 0;
	shelfH = 0;
	live = null;
	constructor(e = 2048) {
		this.pageSize = e;
	}
	add(e) {
		if (e.w > this.pageSize || e.h > this.pageSize) throw Error(`Sprite ${e.name} does not fit an atlas page`);
		return this.shelfX + e.w > this.pageSize && (this.shelfX = 0, this.shelfY += this.shelfH, this.shelfH = 0), this.shelfY + e.h > this.pageSize && (this.page++, this.shelfX = this.shelfY = this.shelfH = 0), this.placed.push({
			...e,
			page: this.page,
			x: this.shelfX,
			y: this.shelfY
		}), this.shelfX += e.w, this.shelfH = Math.max(this.shelfH, e.h), this.placed.length - 1;
	}
	info(e) {
		return this.placed[e];
	}
	textures(e = {}) {
		let t = this.pageSize, n = this.page + 1 + +!!e.live, i = new Uint8Array(t * t * n * 4), a = new Uint8Array(t * t * n * 4), o = Math.ceil((this.placed.length + (e.live ? ws : 0)) * 2 / Cs) || 1, s = new Float32Array(Cs * o * 4);
		this.placed.forEach((e, n) => {
			let r = e.page * t * t;
			for (let n = 0; n < e.h; n++) {
				let o = (r + (e.y + n) * t + e.x) * 4, s = n * e.w * 4;
				i.set(e.albedo.subarray(s, s + e.w * 4), o), a.set(e.aux.subarray(s, s + e.w * 4), o);
			}
			s.set([
				e.x,
				e.y,
				e.w,
				e.h,
				e.ax,
				e.ay,
				e.page,
				0
			], n * 2 * 4);
		});
		let c = new Wn(s, Cs, o, m, l);
		c.minFilter = r, c.magFilter = r, c.needsUpdate = !0;
		let u = {
			albedo: Ts(i, t, n),
			aux: Ts(a, t, n),
			table: c,
			spriteCount: this.placed.length,
			memoryBytes: i.length + a.length + s.byteLength
		};
		return e.live && (this.live = {
			textures: u,
			albedo: i,
			aux: a,
			table: s,
			page: n - 1,
			first: this.placed.length,
			count: 0,
			x: 0,
			y: 0,
			shelf: 0
		}), u;
	}
	addLive(e) {
		let t = this.live, n = this.pageSize;
		if (!t || t.count >= ws || e.w > n || e.h > n || (t.x + e.w > n && (t.x = 0, t.y += t.shelf, t.shelf = 0), t.y + e.h > n)) return null;
		let r = t.page * n * n;
		for (let i = 0; i < e.h; i++) {
			let a = (r + (t.y + i) * n + t.x) * 4, o = i * e.w * 4;
			t.albedo.set(e.albedo.subarray(o, o + e.w * 4), a), t.aux.set(e.aux.subarray(o, o + e.w * 4), a);
		}
		let i = t.first + t.count++;
		return t.table.set([
			t.x,
			t.y,
			e.w,
			e.h,
			e.ax,
			e.ay,
			t.page,
			0
		], i * 2 * 4), t.x += e.w, t.shelf = Math.max(t.shelf, e.h), t.textures.albedo.addLayerUpdate(t.page), t.textures.aux.addLayerUpdate(t.page), t.textures.albedo.needsUpdate = !0, t.textures.aux.needsUpdate = !0, t.textures.table.needsUpdate = !0, i;
	}
	clearLive() {
		this.live && (this.live.count = 0, this.live.x = this.live.y = this.live.shelf = 0);
	}
}, Ds = Math.cos(Math.PI / 6), Os = Math.SQRT1_2, ks = [
	Os,
	-Os,
	0
], As = [
	-.5 * Os,
	-.5 * Os,
	Ds
], js = [
	Ds * Os,
	Ds * Os,
	.5
], Ms = 4 / 3, Ns = Uint8Array, Ps = Uint16Array, Fs = Int32Array, Is = new Ns([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), Ls = new Ns([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), Rs = new Ns([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), zs = function(e, t) {
	for (var n = new Ps(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new Fs(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, Bs = zs(Is, 2), Vs = Bs.b, Hs = Bs.r;
Vs[28] = 258, Hs[258] = 28;
var Us = zs(Ls, 0), Ws = Us.b;
Us.r;
for (var Gs = new Ps(32768), Ks = 0; Ks < 32768; ++Ks) {
	var qs = (Ks & 43690) >> 1 | (Ks & 21845) << 1;
	qs = (qs & 52428) >> 2 | (qs & 13107) << 2, qs = (qs & 61680) >> 4 | (qs & 3855) << 4, Gs[Ks] = ((qs & 65280) >> 8 | (qs & 255) << 8) >> 1;
}
for (var Js = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new Ps(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new Ps(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new Ps(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[Gs[d] >> c] = l;
	} else for (s = new Ps(r), i = 0; i < r; ++i) e[i] && (s[i] = Gs[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), Ys = new Ns(288), Ks = 0; Ks < 144; ++Ks) Ys[Ks] = 8;
for (var Ks = 144; Ks < 256; ++Ks) Ys[Ks] = 9;
for (var Ks = 256; Ks < 280; ++Ks) Ys[Ks] = 7;
for (var Ks = 280; Ks < 288; ++Ks) Ys[Ks] = 8;
for (var Xs = new Ns(32), Ks = 0; Ks < 32; ++Ks) Xs[Ks] = 5;
var Zs = /*#__PURE__*/ Js(Ys, 9, 1), Qs = /*#__PURE__*/ Js(Xs, 5, 1), $s = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, ec = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, tc = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, nc = function(e) {
	return (e + 7) / 8 | 0;
}, rc = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Ns(e.subarray(t, n));
}, ic = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], ac = function(e, t, n) {
	var r = Error(t || ic[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, ac), !n) throw r;
	return r;
}, oc = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new Ns(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new Ns(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new Ns(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = ec(e, d, 1);
			var v = ec(e, d + 1, 3);
			if (d += 3, !v) {
				var y = nc(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && ac(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = Zs, m = Qs, h = 9, g = 5;
			else if (v == 2) {
				var S = ec(e, d, 31) + 257, C = ec(e, d + 10, 15) + 4, w = S + ec(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new Ns(w), E = new Ns(19), D = 0; D < C; ++D) E[Rs[D]] = ec(e, d + D * 3, 7);
				d += C * 3;
				for (var O = $s(E), k = (1 << O) - 1, A = Js(E, O, 1), D = 0; D < w;) {
					var j = A[ec(e, d, k)];
					d += j & 15;
					var y = j >> 4;
					if (y < 16) T[D++] = y;
					else {
						var M = 0, N = 0;
						for (y == 16 ? (N = 3 + ec(e, d, 3), d += 2, M = T[D - 1]) : y == 17 ? (N = 3 + ec(e, d, 7), d += 3) : y == 18 && (N = 11 + ec(e, d, 127), d += 7); N--;) T[D++] = M;
					}
				}
				var P = T.subarray(0, S), F = T.subarray(S);
				h = $s(P), g = $s(F), p = Js(P, h, 1), m = Js(F, g, 1);
			} else ac(1);
			if (d > _) {
				c && ac(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var I = (1 << h) - 1, L = (1 << g) - 1, R = d;; R = d) {
			var M = p[tc(e, d) & I], ee = M >> 4;
			if (d += M & 15, d > _) {
				c && ac(0);
				break;
			}
			if (M || ac(2), ee < 256) n[f++] = ee;
			else if (ee == 256) {
				R = d, p = null;
				break;
			} else {
				var te = ee - 254;
				if (ee > 264) {
					var D = ee - 257, z = Is[D];
					te = ec(e, d, (1 << z) - 1) + Vs[D], d += z;
				}
				var ne = m[tc(e, d) & L], re = ne >> 4;
				ne || ac(3), d += ne & 15;
				var F = Ws[re];
				if (re > 3) {
					var z = Ls[re];
					F += tc(e, d) & (1 << z) - 1, d += z;
				}
				if (d > _) {
					c && ac(0);
					break;
				}
				s && l(f + 131072);
				var B = f + te;
				if (f < F) {
					var V = a - F, ie = Math.min(F, B);
					for (V + f < 0 && ac(3); f < ie; ++f) n[f] = r[V + f];
				}
				for (; f < B; ++f) n[f] = n[f - F];
			}
		}
		t.l = p, t.p = R, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? rc(n, 0, f) : n.subarray(0, f);
}, sc = /*#__PURE__*/ new Ns(0), cc = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, lc = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, uc = function(e, t) {
	return lc(e, t) + lc(e, t + 4) * 4294967296;
};
function dc(e, t) {
	return oc(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var fc = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	fc.decode(sc, { stream: !0 });
} catch {}
var pc = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: rc(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function mc(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (fc) return fc.decode(e);
	var i = pc(e), a = i.s, n = i.r;
	return n.length && ac(8), a;
}
var hc = function(e, t) {
	return t + 30 + cc(e, t + 26) + cc(e, t + 28);
}, gc = function(e, t, n) {
	var r = cc(e, t + 28), i = cc(e, t + 30), a = mc(e.subarray(t + 46, t + 46 + r), !(cc(e, t + 8) & 2048)), o = t + 46 + r, s = _c(e, o, i, n, lc(e, t + 20), lc(e, t + 24), lc(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		cc(e, t + 10),
		c,
		l,
		a,
		o + i + cc(e, t + 32),
		u
	];
}, _c = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + cc(e, t + 2)) if (cc(e, t) == 1) return [
			s ? uc(e, t + 4 + 8 * c) : i,
			c ? uc(e, t + 4) : a,
			l ? uc(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && ac(13);
	}
	return [
		i,
		a,
		o,
		0
	];
};
function vc(e, t) {
	for (var n = {}, r = e.length - 22; lc(e, r) != 101010256; --r) (!r || e.length - r > 65558) && ac(13);
	var i = cc(e, r + 8);
	if (!i) return {};
	var a = lc(e, r + 16), o = lc(e, r - 20) == 117853008;
	if (o) {
		var s = lc(e, r - 12);
		o = lc(e, s) == 101075792, o && (i = lc(e, s + 32), a = lc(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = gc(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = hc(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = dc(e.subarray(_, _ + f), { out: new Ns(p) }) : ac(14, "unknown compression type " + d) : n[m] = rc(e, _, _ + f));
	}
	return n;
}
var yc = (e, t) => t * 65536 + e, bc = (e) => Math.floor(e / 32), xc = class {
	chunks = /* @__PURE__ */ new Map();
	get(e, t) {
		let n = this.chunks.get(yc(bc(e), bc(t)));
		return n ? n[(t & 31) * 32 + (e & 31)] : 0;
	}
	set(e, t, n) {
		let r = yc(bc(e), bc(t)), i = this.chunks.get(r);
		if (!i) {
			if (n === 0) return;
			i = /* @__PURE__ */ new Uint32Array(1024), this.chunks.set(r, i);
		}
		i[(t & 31) * 32 + (e & 31)] = n;
	}
	chunk(e, t) {
		return this.chunks.get(yc(e, t));
	}
	filled() {
		let e = [];
		for (let [t, n] of this.chunks) n.some((e) => e !== 0) && e.push([
			t % 65536,
			Math.floor(t / 65536),
			n
		]);
		return e.sort((e, t) => e[1] - t[1] || e[0] - t[0]);
	}
	put(e, t, n) {
		this.chunks.set(yc(e, t), n);
	}
}, Sc = {
	tileW: 64,
	tileH: 32,
	metersPerTile: 1,
	stepPx: 8,
	storySteps: 15
}, Cc = (e = Sc) => e.stepPx * e.storySteps, wc = (e) => e & 15, Tc = (e) => e >> 4 & 15, Ec = (e) => e >> 8 & 15 | e >> 12 & 240, Dc = (e) => e >> 12 & 15 | e >> 16 & 240, Oc = (e, t, n = Ec(e)) => e & -986896 | t | (n & 15) << 8 | n >> 4 << 16, kc = (e, t, n = Dc(e)) => e & -15790321 | t << 4 | (n & 15) << 12 | n >> 4 << 20, Ac = 65535, jc = [
	"terrain",
	"tiles",
	"walls",
	"objects",
	"roofs",
	"wires",
	"lights",
	"regions"
], Mc = (e) => {
	throw Error(`Arquivo de mapa inválido: ${e}.`);
};
function Nc(e) {
	typeof e == "object" && e || Mc("falta o map.json");
	let t = e;
	t.version !== 1 && Mc(`versão ${String(t.version)} não reconhecida`), typeof t.name != "string" && Mc("o mapa não tem nome"), t.grid && t.grid.tileW > 0 && t.grid.tileH > 0 && t.grid.stepPx > 0 && t.grid.storySteps > 0 || Mc("grade inválida"), (!t.size || !(t.size.x > 0) || !(t.size.y > 0) || t.size.x > 1e3 || t.size.y > 1e3) && Mc("tamanho inválido"), typeof t.pack != "string" && Mc("falta o pacote de arte"), Array.isArray(t.tiles) || Mc("falta a lista de tiles"), (!Array.isArray(t.floors) || !t.floors.length || t.floors.length > 16) && Mc("andares inválidos");
	let n = /* @__PURE__ */ new Set();
	for (let e of t.floors) {
		(typeof e.id != "string" || n.has(e.id)) && Mc("andar com id repetido"), n.add(e.id), (!Array.isArray(e.layers) || e.layers.length > 24) && Mc(`camadas inválidas em ${e.name}`);
		for (let t of e.layers) (typeof t.id != "string" || n.has(t.id)) && Mc("camada com id repetido"), n.add(t.id), jc.includes(t.kind) || Mc(`camada de tipo desconhecido em ${e.name}`), t.kind !== "objects" && t.kind !== "roofs" && t.kind !== "wires" && t.kind !== "lights" || Array.isArray(t.items) || Mc(`camada sem lista em ${e.name}`);
	}
	return t;
}
new Date(Date.UTC(2e3, 0, 1));
var Pc = "map.json", Fc = 4096;
function Ic(e) {
	let t;
	try {
		t = vc(e);
	} catch {
		throw Error("Este arquivo não é um mapa do fingersMap.");
	}
	let n = t[Pc];
	if (!n) throw Error("Este arquivo não é um mapa do fingersMap.");
	let r;
	try {
		r = JSON.parse(mc(n));
	} catch {
		throw Error("O map.json deste arquivo está corrompido.");
	}
	let i = Nc(r), a = /* @__PURE__ */ new Map();
	for (let e of i.floors) for (let t of e.layers) a.set(t.id, new xc());
	for (let [e, n] of Object.entries(t)) {
		let t = /^chunks\/([^/]+)\/(\d+)_(\d+)\.bin$/.exec(e);
		if (!t) continue;
		let r = a.get(t[1]);
		if (!r) continue;
		if (n.length !== Fc) throw Error(`O pedaço ${e} tem o tamanho errado.`);
		let i = /* @__PURE__ */ new Uint32Array(1024);
		new Uint8Array(i.buffer).set(n), r.put(Number(t[2]), Number(t[3]), i);
	}
	return {
		meta: i,
		grids: a
	};
}
var Lc = .5, Rc = 16 / 40, zc = 32, Bc = 6, Vc = 4, Hc = .11, Uc = 5, Wc = .07, Gc = 3, Kc = .62, qc = .1, Jc = 2, Yc = 7, Xc = 12, Zc = 2.4, Qc = 4, $c = 1.1, el = .34, tl = 1.25, nl = 14, rl = 24, il = 1.5, al = 5, ol = 8, sl = .6, cl = 2.2, ll = .35, ul = .55, dl = 1, fl = (e) => {
	let t = Math.hypot(...e) || 1;
	return [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}, pl = {
	gable: "gable",
	"sori-gable": "gable",
	arched: "gable",
	hip: "hip",
	"sori-hip": "hip",
	mansard: "hip",
	irimoya: "irimoya",
	"sori-irimoya": "irimoya",
	shed: "shed",
	pagoda: "pagoda"
}, ml = (e) => pl[e] ?? "irimoya", hl = (e) => e === "gable" || e === "hip" || e === "irimoya", gl = (e) => e.startsWith("sori-") || e === "pagoda";
function _l(e, t = !1) {
	let n = ml(e.shape), r = t || n === "gable" || n === "shed" ? e.ridge === "x" : e.wide >= e.deep, [i, a, o, s] = r ? [
		e.x,
		e.y,
		e.wide,
		e.deep
	] : [
		e.y,
		e.x,
		e.deep,
		e.wide
	], c = Lc, l = i - c, u = i + o + c, d = a - c, f = a + s + c, p = (f - d) / 2, m = p * Kc, h = u - l > m * 2 + 1;
	return {
		alongX: r,
		A0: l,
		A1: u,
		B0: d,
		B1: f,
		half: p,
		inset: m,
		form: n === "irimoya" && !h ? "hip" : n,
		shape: e.shape === "irimoya" && !h ? "hip" : e.shape,
		mid: (d + f) / 2,
		wallA0: i,
		wallA1: i + o,
		wallB0: a,
		wallB1: a + s
	};
}
function vl(e, t) {
	let n = Lc, r = t - n, i = (e) => 8 + (e - n) * 16, a = (e) => 8 - (n - e) * Qc;
	if (e === "arched") return (e) => {
		if (e <= n) return a(e);
		let t = Math.min(1, (e - n) / r);
		return 8 + r * 16 * (3 * t * t - 2 * t * t * t);
	};
	if (e === "mansard") {
		let e = n + r * ul;
		return (t) => 8 + (Math.min(t, e) - n) * 16 * cl + Math.max(0, t - e) * 16 * ll;
	}
	if (e === "shed") return (e) => 8 + (e - n) * 16 * sl;
	if (!gl(e)) return i;
	let o = r * 16 * $c;
	return (e) => {
		if (e <= n) return a(e);
		let t = Math.min(1, (e - n) / r);
		return 8 + o * (.4 * t + .6 * t * t);
	};
}
function yl(e, t, n, r) {
	if (!t.flush) return !1;
	let [i, a] = e.alongX ? [n, r] : [r, n];
	return t.flush.includes(`${a < t.y + t.deep / 2 ? "n" : "s"}${i < t.x + t.wide / 2 ? "w" : "e"}`);
}
function bl(e, t, n = Zc) {
	if (!gl(e.shape)) return () => 0;
	let r = Math.min(n, e.half * .9), i = (e) => Math.max(0, 1 - Math.abs(e) / r) ** 2, a = [
		[e.A0, e.B0],
		[e.A1, e.B0],
		[e.A0, e.B1],
		[e.A1, e.B1]
	].filter(([n, r]) => !yl(e, t, n, r));
	return (e, t) => Xc * Math.max(0, ...a.map(([n, r]) => i(e - n) * i(t - r)));
}
function xl(e) {
	let t = Math.min(e.wide, e.deep);
	if (t < al) return null;
	let n = tl;
	return {
		...e,
		x: e.x + n,
		y: e.y + n,
		wide: e.wide - 2 * n,
		deep: e.deep - 2 * n,
		shape: t >= ol ? "pagoda" : "sori-irimoya"
	};
}
function Sl() {
	let e = Lc;
	return (t) => {
		if (t <= e) return 8 - (e - t) * Qc;
		let n = Math.min(1, (t - e) / tl);
		return 8 + rl * (.35 * n + .65 * n * n);
	};
}
function Cl(e) {
	let t = e.runsOn;
	if (!t) return {
		body: e,
		keep: null
	};
	let n = e.wide + e.deep + 2, [r, i, a, o] = [
		t.north,
		t.south,
		t.west,
		t.east
	], s = {
		...e,
		runsOn: void 0
	};
	r !== void 0 && (s.y -= r + n, s.deep += r + n), i !== void 0 && (s.deep += i + n), a !== void 0 && (s.x -= a + n, s.wide += a + n), o !== void 0 && (s.wide += o + n);
	let c = 1e6;
	return {
		body: s,
		keep: {
			x0: a === void 0 ? -1e6 : e.x - a,
			y0: r === void 0 ? -1e6 : e.y - r,
			x1: o === void 0 ? c : e.x + e.wide + o,
			y1: i === void 0 ? c : e.y + e.deep + i
		}
	};
}
function wl(e, t, n, r, i, a) {
	let o = e.length, s = qc, [c, l, u, d] = [
		t.x - s,
		t.y - s,
		t.x + t.wide + s,
		t.y + t.deep + s
	], f = r + Jc, p = f + Yc, m = zc, h = (t, n, r, o, s, c, l) => {
		for (let u of [
			t,
			n,
			r,
			t,
			r,
			o
		]) e.push(u[0], u[1], u[2], ...l(u), s, i, a, ...c);
	}, g = .16, _ = [
		0,
		0,
		1
	];
	h([
		c,
		l,
		f
	], [
		u,
		l,
		f
	], [
		u,
		d,
		f
	], [
		c,
		d,
		f
	], n.surface, _, (e) => [e[0] * m, e[1] * m]);
	let v = (e, t, r, i) => h(e, t, r, i, n.ridge, _, (e) => [(e[0] + e[1]) * m, (e[0] - e[1]) * m]);
	v([
		c,
		l,
		p
	], [
		u,
		l,
		p
	], [
		u,
		l + g,
		p
	], [
		c,
		l + g,
		p
	]), v([
		c,
		d - g,
		p
	], [
		u,
		d - g,
		p
	], [
		u,
		d,
		p
	], [
		c,
		d,
		p
	]), v([
		c,
		l,
		p
	], [
		c + g,
		l,
		p
	], [
		c + g,
		d,
		p
	], [
		c,
		d,
		p
	]), v([
		u - g,
		l,
		p
	], [
		u,
		l,
		p
	], [
		u,
		d,
		p
	], [
		u - g,
		d,
		p
	]);
	let y = r - Vc;
	return h([
		c,
		d,
		p
	], [
		u,
		d,
		p
	], [
		u,
		d,
		y
	], [
		c,
		d,
		y
	], n.fascia, [
		0,
		1,
		0
	], (e) => [e[0] * m, p - e[2]]), h([
		u,
		d,
		p
	], [
		u,
		l,
		p
	], [
		u,
		l,
		y
	], [
		u,
		d,
		y
	], n.fascia, [
		1,
		0,
		0
	], (e) => [e[1] * m, p - e[2]]), h([
		c,
		l + g,
		p
	], [
		u,
		l + g,
		p
	], [
		u,
		l + g,
		f
	], [
		c,
		l + g,
		f
	], n.fascia, [
		0,
		1,
		0
	], (e) => [e[0] * m, p - e[2]]), h([
		c + g,
		d,
		p
	], [
		c + g,
		l,
		p
	], [
		c + g,
		l,
		f
	], [
		c + g,
		d,
		f
	], n.fascia, [
		1,
		0,
		0
	], (e) => [e[1] * m, p - e[2]]), (e.length - o) / 11;
}
function Tl(e, t, n) {
	if (e.shape === "flat") return t >= e.x - qc && t <= e.x + e.wide + qc && n >= e.y - qc && n <= e.y + e.deep + qc ? Jc : null;
	let { body: r, keep: i } = Cl(e);
	return i && (t < i.x0 || t > i.x1 || n < i.y0 || n > i.y1) ? null : El(r, t, n, i !== null);
}
function El(e, t, n, r) {
	let i = _l(e, r), [a, o] = i.alongX ? [t, n] : [n, t];
	if (a < i.A0 || a > i.A1 || o < i.B0 || o > i.B1) return null;
	let s = Math.min(a - i.A0, i.A1 - a), c = Math.min(o - i.B0, i.B1 - o);
	if (i.form === "shed") return vl("shed", i.half)(i.B1 - o);
	if (i.form === "pagoda") {
		let l = xl(e);
		if (!l) return El({
			...e,
			shape: "sori-irimoya"
		}, t, n, r);
		let u = Sl(), d = u(1.75), f = El(l, t, n, r);
		return f === null ? u(Math.min(s, c)) + bl(i, e, il)(a, o) : d + nl + f;
	}
	let l = i.form === "gable" ? c : i.form === "hip" || s < i.inset ? Math.min(s, c) : c;
	return vl(i.shape, i.half)(l) + bl(i, e)(a, o);
}
function Dl(e, t, n, r, i, a) {
	if (t.shape === "flat") return wl(e, t, n, r, i, a);
	let o = e.length, { body: s, keep: c } = Cl(t);
	return kl(e, s, n, c ? r + dl : r, i, a, c, c !== null), (e.length - o) / 11;
}
function Ol(e, t, n, r) {
	let i = [], a = (e) => (e[t] - n) * r >= 0;
	return e.forEach((r, o) => {
		let s = e[(o + 1) % e.length];
		if (a(r) && i.push(r), a(r) === a(s)) return;
		let c = (n - r[t]) / (s[t] - r[t]), l = (e, t) => e + (t - e) * c;
		i.push({
			a: l(r.a, s.a),
			b: l(r.b, s.b),
			z: l(r.z, s.z),
			lift: l(r.lift ?? 0, s.lift ?? 0)
		});
	}), i;
}
function kl(e, t, n, r, i, a, o, s) {
	let c = _l(t, s), { A0: l, A1: u, B0: d, B1: f, half: p, mid: m } = c, h = r + 8 - Lc * 16, g = h + p * 16, _ = (e) => c.alongX ? [e.a, e.b] : [e.b, e.a], v = (e) => c.alongX ? e : [
		e[1],
		e[0],
		e[2]
	], [y, b, x, S] = o ? c.alongX ? [
		o.x0,
		o.x1,
		o.y0,
		o.y1
	] : [
		o.y0,
		o.y1,
		o.x0,
		o.x1
	] : [
		0,
		0,
		0,
		0
	], C = (t, n, r, s) => {
		let c = v(fl(r)), l = (t) => {
			let [r, o] = _(t);
			e.push(r, o, t.z, ...s(t), n, i, a, ...c);
		}, u = t;
		o && (u = Ol(Ol(Ol(Ol(u, "a", y, 1), "a", b, -1), "b", x, 1), "b", S, -1));
		for (let e = 1; e + 1 < u.length; e++) l(u[0]), l(u[e]), l(u[e + 1]);
	}, w = zc, T = (e) => [e.a * w, (e.b - m) * w], E = (e) => [-e.a * w, (m - e.b) * w], D = (e) => [-e.b * w, e.a * w], O = (e) => [e.b * w, -e.a * w], k = [
		0,
		Rc,
		1
	], A = [
		0,
		-Rc,
		1
	], j = [
		Rc,
		0,
		1
	], M = [
		-Rc,
		0,
		1
	], N = (e, t, r, i, a, o) => C([
		{
			a: e,
			b: t,
			z: i
		},
		{
			a: e,
			b: r,
			z: i
		},
		{
			a: e,
			b: m,
			z: a
		}
	], n.gable, [
		o,
		0,
		0
	], (e) => [e.b * w, -e.z]), P = (e, t, n, r, i) => {
		let a = Math.hypot(t.a - e.a, t.b - e.b), o = (e.a + e.b) * w, s = (e) => ({
			a: e.a,
			b: e.b,
			z: e.z - i
		}), c = (n) => a ? ((n.a - e.a) * (t.a - e.a) + (n.b - e.b) * (t.b - e.b)) / (a * a) : 0;
		C([
			e,
			t,
			s(t),
			s(e)
		], r, n, (n) => {
			let r = c(n);
			return [o + r * a * w, e.z + (t.z - e.z) * r - n.z];
		});
	}, F = (e, t, r, i) => {
		let a = t.a - e.a, o = t.b - e.b, s = Math.hypot(a, o) || 1, c = -o / s * r, l = a / s * r, u = (e, t, n) => ({
			a: e.a + c * t,
			b: e.b + l * t,
			z: n
		}), d = (e) => [(e.a + e.b) * w, (e.b - e.a) * w], f = [
			u(e, 1, e.z + i),
			u(t, 1, t.z + i),
			u(t, -1, t.z + i),
			u(e, -1, e.z + i)
		];
		C(f, n.ridge, [
			0,
			0,
			1
		], d);
		for (let r of [1, -1]) C([
			u(e, r, e.z + i),
			u(t, r, t.z + i),
			u(t, r, t.z),
			u(e, r, e.z)
		], n.ridge, [
			c * r,
			l * r,
			.4
		], d);
	};
	if (!hl(t.shape)) {
		L();
		return;
	}
	if (c.shape === "gable") {
		C([
			{
				a: l,
				b: f,
				z: h
			},
			{
				a: u,
				b: f,
				z: h
			},
			{
				a: u,
				b: m,
				z: g
			},
			{
				a: l,
				b: m,
				z: g
			}
		], n.surface, k, T), C([
			{
				a: l,
				b: d,
				z: h
			},
			{
				a: u,
				b: d,
				z: h
			},
			{
				a: u,
				b: m,
				z: g
			},
			{
				a: l,
				b: m,
				z: g
			}
		], n.surface, A, E), N(c.wallA1, c.wallB0, c.wallB1, r - Vc, g, 1), N(c.wallA0, c.wallB0, c.wallB1, r - Vc, g, -1);
		for (let [e, t] of [[u, 1], [l, -1]]) {
			let r = {
				a: e,
				b: m,
				z: g
			};
			P({
				a: e,
				b: f,
				z: h
			}, r, [
				t,
				0,
				0
			], n.fascia, Bc), P(r, {
				a: e,
				b: d,
				z: h
			}, [
				t,
				0,
				0
			], n.fascia, Bc);
		}
		F({
			a: l,
			b: m,
			z: g
		}, {
			a: u,
			b: m,
			z: g
		}, Hc, Uc);
	} else if (c.shape === "hip") {
		let e = Math.min(l + p, (l + u) / 2), r = Math.max(u - p, (l + u) / 2);
		C([
			{
				a: l,
				b: f,
				z: h
			},
			{
				a: u,
				b: f,
				z: h
			},
			{
				a: r,
				b: m,
				z: g
			},
			{
				a: e,
				b: m,
				z: g
			}
		], n.surface, k, T), C([
			{
				a: l,
				b: d,
				z: h
			},
			{
				a: u,
				b: d,
				z: h
			},
			{
				a: r,
				b: m,
				z: g
			},
			{
				a: e,
				b: m,
				z: g
			}
		], n.surface, A, E), C([
			{
				a: u,
				b: d,
				z: h
			},
			{
				a: u,
				b: f,
				z: h
			},
			{
				a: r,
				b: m,
				z: g
			}
		], n.surface, j, (e) => D({
			...e,
			a: e.a - r
		})), C([
			{
				a: l,
				b: d,
				z: h
			},
			{
				a: l,
				b: f,
				z: h
			},
			{
				a: e,
				b: m,
				z: g
			}
		], n.surface, M, (t) => O({
			...t,
			a: t.a - e
		}));
		for (let [n, i] of [[l, e], [u, r]]) for (let e of [d, f]) yl(c, t, n, e) || F({
			a: n,
			b: e,
			z: h
		}, {
			a: i,
			b: m,
			z: g
		}, Wc, Gc);
		r > e && F({
			a: e,
			b: m,
			z: g
		}, {
			a: r,
			b: m,
			z: g
		}, Hc, Uc);
	} else {
		let e = c.inset, r = h + e * 16, [i, a, o, s] = [
			l + e,
			u - e,
			d + e,
			f - e
		];
		C([
			{
				a: l,
				b: f,
				z: h
			},
			{
				a: u,
				b: f,
				z: h
			},
			{
				a,
				b: s,
				z: r
			},
			{
				a: i,
				b: s,
				z: r
			}
		], n.surface, k, T), C([
			{
				a: i,
				b: s,
				z: r
			},
			{
				a,
				b: s,
				z: r
			},
			{
				a,
				b: m,
				z: g
			},
			{
				a: i,
				b: m,
				z: g
			}
		], n.surface, k, T), C([
			{
				a: l,
				b: d,
				z: h
			},
			{
				a: u,
				b: d,
				z: h
			},
			{
				a,
				b: o,
				z: r
			},
			{
				a: i,
				b: o,
				z: r
			}
		], n.surface, A, E), C([
			{
				a: i,
				b: o,
				z: r
			},
			{
				a,
				b: o,
				z: r
			},
			{
				a,
				b: m,
				z: g
			},
			{
				a: i,
				b: m,
				z: g
			}
		], n.surface, A, E), C([
			{
				a: u,
				b: d,
				z: h
			},
			{
				a: u,
				b: f,
				z: h
			},
			{
				a,
				b: s,
				z: r
			},
			{
				a,
				b: o,
				z: r
			}
		], n.surface, j, (e) => D({
			...e,
			a: e.a - a
		})), C([
			{
				a: l,
				b: d,
				z: h
			},
			{
				a: l,
				b: f,
				z: h
			},
			{
				a: i,
				b: s,
				z: r
			},
			{
				a: i,
				b: o,
				z: r
			}
		], n.surface, M, (e) => O({
			...e,
			a: e.a - i
		})), N(a, o, s, r, g, 1), N(i, o, s, r, g, -1);
		for (let [e, t] of [[a, 1], [i, -1]]) {
			let i = {
				a: e,
				b: m,
				z: g
			};
			P({
				a: e,
				b: s,
				z: r
			}, i, [
				t,
				0,
				0
			], n.fascia, 4), P(i, {
				a: e,
				b: o,
				z: r
			}, [
				t,
				0,
				0
			], n.fascia, 4);
		}
		for (let [e, n] of [[l, i], [u, a]]) yl(c, t, e, d) || F({
			a: e,
			b: d,
			z: h
		}, {
			a: n,
			b: o,
			z: r
		}, Wc, Gc), yl(c, t, e, f) || F({
			a: e,
			b: f,
			z: h
		}, {
			a: n,
			b: s,
			z: r
		}, Wc, Gc);
		F({
			a: i,
			b: m,
			z: g
		}, {
			a,
			b: m,
			z: g
		}, Hc, Uc);
	}
	let I = [
		{
			a: l,
			b: f,
			z: h
		},
		{
			a: u,
			b: f,
			z: h
		},
		{
			a: u,
			b: d,
			z: h
		},
		{
			a: l,
			b: d,
			z: h
		}
	];
	P(I[0], I[1], [
		0,
		1,
		0
	], n.fascia, Bc), P(I[3], I[2], [
		0,
		-1,
		0
	], n.fascia, Bc), c.shape !== "gable" && (P(I[2], I[1], [
		1,
		0,
		0
	], n.fascia, Bc), P(I[3], I[0], [
		-1,
		0,
		0
	], n.fascia, Bc));
	function L() {
		let h = c.form === "pagoda" ? Sl() : vl(c.shape, p), g = bl(c, t, c.form === "pagoda" ? il : Zc), _ = (e, t, n) => {
			let i = g(e, t);
			return {
				a: e,
				b: t,
				z: r + h(n) + i,
				lift: i
			};
		}, v = (e, t) => {
			let n = Math.min(Zc, (t - e) / 2), r = Array.from({ length: 6 }, (t, r) => e + n * r / 5), i = Array.from({ length: 6 }, (e, r) => t - n * (5 - r) / 5);
			return [...r, ...i].filter((e, t, n) => t === 0 || e > n[t - 1] + 1e-6);
		}, y = (e, t) => {
			if (c.shape === "mansard") {
				let n = Lc + (p - Lc) * ul;
				return n > e && n < t ? [
					e,
					n,
					t
				] : [e, t];
			}
			let n = Math.max(e, Math.min(t, Lc)), r = Array.from({ length: 7 }, (e, r) => n + (t - n) * r / 6);
			return n > e ? [e, ...r] : r;
		}, b = (e) => (t) => {
			let [n, r] = e(t);
			return [n, r + (t.lift ?? 0) / 16 * w];
		}, x = (e, t) => ({
			a: e,
			b: t
		}), S = (e, t, n) => x(e.a + (t.a - e.a) * n, e.b + (t.b - e.b) * n), k = (e) => {
			let [t, n, r] = [
				e[2].a - e[0].a,
				e[2].b - e[0].b,
				(e[2].z - e[0].z) / 40
			], [i, a, o] = [
				e[3].a - e[1].a,
				e[3].b - e[1].b,
				(e[3].z - e[1].z) / 40
			], s = [
				n * o - r * a,
				r * i - t * o,
				t * a - n * i
			];
			return s[2] < 0 ? [
				-s[0],
				-s[1],
				-s[2]
			] : s;
		}, A = (e, t, r, i, a, o) => {
			let s = i.map((n) => r.map((r) => {
				let i = S(S(e[0], t[0], n), S(e[1], t[1], n), r);
				return _(i.a, i.b, a(i));
			}));
			for (let e = 0; e + 1 < s.length; e++) for (let t = 0; t + 1 < r.length; t++) {
				let r = [
					s[e][t],
					s[e][t + 1],
					s[e + 1][t + 1],
					s[e + 1][t]
				];
				C(r, n.surface, k(r), b(o));
			}
		}, j = (e, t, n) => e.map((e) => (e - t) / (n - t)), M = (e, t, r = Bc) => {
			for (let i = 0; i + 1 < e.length; i++) P(e[i], e[i + 1], t, n.fascia, r);
		}, N = (e, t, n) => {
			for (let r = 0; r + 1 < e.length; r++) F(e[r], e[r + 1], t, n);
		}, I = (e, t) => F(e, {
			...e,
			a: e.a + t * el
		}, Hc * 1.4, 11), L = (e) => Math.min(e - d, f - e), R = v(l, u), ee = v(d, f), te = j(R, l, u), z = j(ee, d, f), ne = (e) => {
			M(R.map((e) => _(e, f, 0)), [
				0,
				1,
				0
			]), M(R.map((e) => _(e, d, 0)), [
				0,
				-1,
				0
			]), e !== "long" && (M(ee.map((e) => _(u, e, 0)), [
				1,
				0,
				0
			]), M(ee.map((e) => _(l, e, 0)), [
				-1,
				0,
				0
			]));
		}, re = (e, t, n, r, i, a, o, s) => {
			A([x(e, f - i), x(t, f - i)], [x(n, f - a), x(r, f - a)], s, o, (e) => f - e.b, T), A([x(e, d + i), x(t, d + i)], [x(n, d + a), x(r, d + a)], s, o, (e) => e.b - d, E);
		}, B = (e, t, n, r, i, a = 1) => {
			A([x(u, d), x(u, f)], [x(t, n), x(t, r)], z, i, (e) => (u - e.a) * a, (e) => D({
				...e,
				a: e.a - t
			})), A([x(l, d), x(l, f)], [x(e, n), x(e, r)], z, i, (e) => (e.a - l) * a, (t) => O({
				...t,
				a: t.a - e
			}));
		}, V = (e, n) => {
			let r = y(0, n).map((e) => e / n);
			for (let [i, a, o, s] of e.filter(([e, n]) => !yl(c, t, e, n))) N(r.map((e) => _(i + (o - i) * e, a + (s - a) * e, n * e)), Wc, Gc);
		}, ie = (e, t, r, i, a) => {
			for (let o = 0; o + 1 < r.length; o++) {
				let [s, c] = [r[o], r[o + 1]], l = [
					{
						a: e,
						b: s,
						z: i
					},
					{
						a: e,
						b: c,
						z: i
					},
					{
						a: e,
						b: c,
						z: _(e, c, L(c)).z - a
					},
					{
						a: e,
						b: s,
						z: _(e, s, L(s)).z - a
					}
				];
				C(l, n.gable, [
					t,
					0,
					0
				], (e) => [e.b * w, -e.z]);
			}
		}, ae = r + h(p), oe = (e, t) => {
			let n = c.shape === "arched";
			F({
				a: e,
				b: m,
				z: ae
			}, {
				a: t,
				b: m,
				z: ae
			}, n ? Wc : Hc, n ? Gc : Uc), gl(c.shape) && (I({
				a: e,
				b: m,
				z: ae
			}, 1), I({
				a: t,
				b: m,
				z: ae
			}, -1));
		}, se = (e, t) => v(e, m).concat(v(m, t).slice(1));
		if (c.form === "gable") {
			re(l, u, l, u, 0, p, j(y(0, p), 0, p), te);
			for (let [e, t, n] of [[
				u,
				c.wallA1,
				1
			], [
				l,
				c.wallA0,
				-1
			]]) M(se(d, f).map((t) => _(e, t, L(t))), [
				n,
				0,
				0
			]), ie(t, n, se(c.wallB0, c.wallB1), r - Vc, 1);
			ne("long"), oe(l, u);
			return;
		}
		if (c.form === "shed") {
			let e = (e) => r + h(f - e), t = r - Vc, i = [
				{
					a: l,
					b: f,
					z: e(f)
				},
				{
					a: u,
					b: f,
					z: e(f)
				},
				{
					a: u,
					b: d,
					z: e(d)
				},
				{
					a: l,
					b: d,
					z: e(d)
				}
			];
			C(i, n.surface, k(i), T);
			for (let [r, i] of [[c.wallA1, 1], [c.wallA0, -1]]) {
				let a = [
					{
						a: r,
						b: c.wallB1,
						z: t
					},
					{
						a: r,
						b: c.wallB0,
						z: t
					},
					{
						a: r,
						b: c.wallB0,
						z: e(c.wallB0) - 1
					},
					{
						a: r,
						b: c.wallB1,
						z: e(c.wallB1) - 1
					}
				];
				C(a, n.gable, [
					i,
					0,
					0
				], (e) => [e.b * w, -e.z]);
			}
			let a = [
				{
					a: c.wallA0,
					b: c.wallB0,
					z: t
				},
				{
					a: c.wallA1,
					b: c.wallB0,
					z: t
				},
				{
					a: c.wallA1,
					b: c.wallB0,
					z: e(c.wallB0) - 1
				},
				{
					a: c.wallA0,
					b: c.wallB0,
					z: e(c.wallB0) - 1
				}
			];
			C(a, n.gable, [
				0,
				-1,
				0
			], (e) => [e.a * w, -e.z]), P(i[0], i[1], [
				0,
				1,
				0
			], n.fascia, Bc), P(i[3], i[2], [
				0,
				-1,
				0
			], n.fascia, Bc), P(i[1], i[2], [
				1,
				0,
				0
			], n.fascia, Bc), P(i[0], i[3], [
				-1,
				0,
				0
			], n.fascia, Bc), F(i[3], i[2], Wc, Gc);
			return;
		}
		if (c.form === "pagoda") {
			let c = xl(t);
			if (!c) {
				kl(e, {
					...t,
					shape: "sori-irimoya"
				}, n, r, i, a, o, s);
				return;
			}
			let p = 1.75, [m, g, _, v] = [
				l + p,
				u - p,
				d + p,
				f - p
			], b = j(y(0, p), 0, p);
			re(l, u, m, g, 0, p, b, te), B(m, g, _, v, b), ne("all"), V([
				[
					l,
					d,
					m,
					_
				],
				[
					l,
					f,
					m,
					v
				],
				[
					u,
					d,
					g,
					_
				],
				[
					u,
					f,
					g,
					v
				]
			], p);
			let S = r + h(p), T = S + nl, E = S - Vc, D = (e, t, r, i) => C([
				{
					...e,
					z: E
				},
				{
					...t,
					z: E
				},
				{
					...t,
					z: T
				},
				{
					...e,
					z: T
				}
			], n.gable, r, (e) => [e[i] * w, -e.z]);
			D(x(m, v), x(g, v), [
				0,
				1,
				0
			], "a"), D(x(m, _), x(g, _), [
				0,
				-1,
				0
			], "a"), D(x(g, _), x(g, v), [
				1,
				0,
				0
			], "b"), D(x(m, _), x(m, v), [
				-1,
				0,
				0
			], "b"), kl(e, c, n, T, i, a, o, s);
			return;
		}
		if (c.form === "hip") {
			let e = Math.min(l + p, (l + u) / 2), t = Math.max(u - p, (l + u) / 2), n = j(y(0, p), 0, p);
			re(l, u, e, t, 0, p, n, te), B(e, t, m, m, n, p / (u - t)), ne("all"), V([
				[
					l,
					d,
					e,
					m
				],
				[
					l,
					f,
					e,
					m
				],
				[
					u,
					d,
					t,
					m
				],
				[
					u,
					f,
					t,
					m
				]
			], p), t > e && oe(e, t);
			return;
		}
		let ce = c.inset, [H, le, ue, U] = [
			l + ce,
			u - ce,
			d + ce,
			f - ce
		], de = j(y(0, ce), 0, ce);
		re(l, u, H, le, 0, ce, de, te), B(H, le, ue, U, de), re(H, le, H, le, ce, p, j(y(ce, p), ce, p), [0, 1]);
		let fe = se(ue, U);
		for (let [e, t] of [[le, 1], [H, -1]]) ie(e, t, fe, r + h(ce), 0), M(fe.map((t) => _(e, t, L(t))), [
			t,
			0,
			0
		], 4);
		V([
			[
				l,
				d,
				H,
				ue
			],
			[
				l,
				f,
				H,
				U
			],
			[
				u,
				d,
				le,
				ue
			],
			[
				u,
				f,
				le,
				U
			]
		], ce), ne("all"), oe(H, le);
	}
}
var Al = 32 * Math.SQRT2, jl = 32, Ml = 1.3, Nl = .62;
function Pl(e, t, n, r, i, a, o, s, c, l) {
	e.push(t, n, r, i, a, o, s, c, l[0], l[1], l[2]);
}
function Fl(e, t, n, r, i, a) {
	let o = e.length, [s, c] = [t.wide / 2, t.deep / 2], [l, u] = [t.x + s, t.y + c], d = Math.max(40, Math.min(160, Math.round((s + c) * 7) * 2));
	for (let t of n) {
		let n = (e, t) => [
			l + Math.cos(t) * (e[0] * s + e[1]),
			u + Math.sin(t) * (e[0] * c + e[1]),
			r + e[2] * 40
		], o = (t.from[0] + t.to[0]) / 2 * (s + c) / 2 + (t.from[1] + t.to[1]) / 2, f = Math.max(1, Math.round(2 * Math.PI * Math.max(.1, o) * Al / t.w)), p = t.to[1] - t.from[1] + (t.to[0] - t.from[0]) * (s + c) / 2, m = t.to[2] - t.from[2], h = Math.hypot(p, m) * 40, g = t.arc ? t.arc[1] * Math.PI / 180 : Math.PI * 2, _ = t.arc ? t.arc[0] * Math.PI / 180 - g / 2 : 0, v = t.arc ? Math.max(6, Math.ceil(d * g / (Math.PI * 2))) : d, [y, b] = [Math.max(t.from[0], t.to[0]) * s + Math.max(t.from[1], t.to[1]), Math.max(t.from[0], t.to[0]) * c + Math.max(t.from[1], t.to[1])], x = (e) => {
			let [n, r] = [e[0] - l, e[1] - u];
			return t.flat === "repeat" ? [n * jl, r * jl] : [((n / y - r / b) * Math.SQRT1_2 + 1) / 2 * t.w, ((n / y + r / b) * Math.SQRT1_2 + 1) / 2 * t.h];
		}, S = t.inside ? -1 : 1, C = i + (t.keep || t.inside ? 100 : 0);
		for (let r = 0; r < v; r++) {
			let i = _ + r / v * g, o = _ + (r + 1) / v * g, l = (i + o) / 2, [u, d] = [Math.cos(l), Math.sin(l)];
			if (t.inside && u + d > 0) continue;
			let [y, b] = [u / s, d / c], w = Math.hypot(y, b) || 1, T = Math.hypot(p, m) || 1, E = m === 0 ? 0 : m / T, D = p === 0 ? 0 : -p / T, O = [
				y / w * E * S,
				b / w * E * S,
				m === 0 ? 1 : D * S
			], k = Math.hypot(O[0], O[1], O[2]) || 1, A = [
				O[0] / k,
				O[1] / k,
				O[2] / k
			], j = t.arc ? 1 : f, [M, N] = [r / v * j * t.w, (r + 1) / v * j * t.w], [P, F, I, L] = [
				n(t.from, i),
				n(t.from, o),
				n(t.to, o),
				n(t.to, i)
			], R = (n, r, i) => {
				let [o, s] = t.flat ? x(n) : [r, t.arc ? i / h * t.h : i];
				Pl(e, n[0], n[1], n[2], o, s, t.id, C, a, A);
			};
			R(P, M, h), R(F, N, h), R(I, N, 0), R(P, M, h), R(I, N, 0), R(L, M, 0);
		}
	}
	return (e.length - o) / 11;
}
var Il = .5, Ll = .35;
function Rl(e, t, n, r) {
	let [i, a] = [e.wide / 2, e.deep / 2], o = Math.hypot((n - e.x - i) / i, (r - e.y - a) / a), s = (i + a) / 2, c = o * s, [l, u, d] = [
		0,
		Infinity,
		0
	];
	for (let e of t) {
		if (e.inside || e.keep || e.arc) continue;
		let [t, n] = [e.from[0] * s + e.from[1], e.to[0] * s + e.to[1]], [r, i] = [Math.max(t, n), Math.min(t, n)];
		if (c > r) continue;
		let [a, o] = [Math.min(e.from[2], e.to[2]), Math.max(e.from[2], e.to[2])], f = c > i && t !== n, p = f ? e.from[2] + (c - t) / (n - t) * (e.to[2] - e.from[2]) : o;
		a <= l + Il ? l = Math.max(l, p) : (u = Math.min(u, f ? p - Ll : a), d = Math.max(d, p));
	}
	return l === 0 && d === 0 ? null : {
		solid: l,
		low: d > 0 ? u : 0,
		high: d
	};
}
function zl(e) {
	let [t, n, r] = [
		e.x1 - e.x0,
		e.y1 - e.y0,
		e.z1 - e.z0
	], i = Math.hypot(t, n), a = Math.min(0, e.z0, e.z1), o = (t) => e.z0 + r * t;
	if (i > .05) {
		let t = Math.hypot(i, r) * 1.0067, n = i / (2 * Bl(Math.sqrt(t * t - r * r) / i)), a = i / 2 - n * Math.atanh(r / t), s = e.z0 - n * Math.cosh(a / n);
		o = (e) => n * Math.cosh((e * i - a) / n) + s;
	}
	return (r) => [
		e.x0 + t * r,
		e.y0 + n * r,
		Math.max(a, o(r))
	];
}
function Bl(e) {
	if (e <= 1) return 1e-6;
	let t = Math.sqrt(6 * (e - 1));
	for (let n = 0; n < 80; n++) {
		let n = (Math.sinh(t) - e * t) / (Math.cosh(t) - e);
		if (t -= n, Math.abs(n) < 1e-12 * t) break;
	}
	return t;
}
function Vl(e, t, n, r, i, a, o) {
	let s = e.length, c = Math.hypot(t.x1 - t.x0, t.y1 - t.y0, t.z1 - t.z0), l = Math.max(8, Math.ceil(c * 2)), u = zl(t), d = (e) => {
		let [t, n, r] = u(e);
		return [
			t,
			n,
			i + r * 40
		];
	}, f = a + 100, p = [
		0,
		0,
		1
	];
	for (let t = 0; t < l; t++) {
		let r = d(t / l), i = d((t + 1) / l), a = (t, r) => Pl(e, t[0], t[1], t[2] + r, .5, .5, n, f, o, p);
		a(r, 0), a(i, 0), a(i, Ml), a(r, 0), a(i, Ml), a(r, Ml);
	}
	if (t.bunting) {
		let t = Math.floor(c / Nl);
		for (let i = 0; i < t; i++) {
			let a = 1 + i % (r - 1), [s, c, l] = [
				d((i + .1) / t),
				d((i + .8) / t),
				d((i + .45) / t)
			], u = (t, r) => Pl(e, t[0], t[1], t[2] + r, a + .5, .5, n, f, o, p);
			u(s, 0), u(c, 0), u(l, -11);
		}
	}
	return (e.length - s) / 11;
}
var Hl = .05, Ul = 32, Wl = 3, Gl = 4, Kl = .15, ql = (e) => Math.min(255, Math.max(0, Math.round(e / Hl))), Jl = class {
	sizeX;
	sizeY;
	floors;
	width;
	height;
	data;
	left = 0;
	top = 0;
	constructor(e, t, n, r = 320) {
		this.sizeX = e, this.sizeY = t, this.floors = n, this.width = Math.min(e, r) * 8, this.height = Math.min(t, r) * 8, this.data = new Uint8Array(this.width * this.height * n * Gl);
	}
	get tilesX() {
		return this.width / 8;
	}
	get tilesY() {
		return this.height / 8;
	}
	look(e, t) {
		let n = (e, t, n, r) => Math.abs(e - (r + t / 2)) < t / 4 ? r : Math.max(0, Math.min(n - t, Math.round((e - t / 2) / Ul) * Ul)), [r, i] = [n(e, this.tilesX, this.sizeX, this.left), n(t, this.tilesY, this.sizeY, this.top)];
		return r === this.left && i === this.top ? !1 : (this.left = r, this.top = i, !0);
	}
	reaches(e, t, n, r) {
		return n >= this.left && r >= this.top && e <= this.left + this.tilesX && t <= this.top + this.tilesY;
	}
	box(e, t, n, r, i, a) {
		let o = ql(a), s = Math.max(0, Math.round((t - this.left) * 8)), c = Math.max(0, Math.round((n - this.top) * 8)), l = Math.min(this.width, Math.round((r - this.left) * 8)), u = Math.min(this.height, Math.round((i - this.top) * 8)), d = e * this.width * this.height;
		for (let e = c; e < u; e++) for (let t = s; t < l; t++) {
			let n = (d + e * this.width + t) * Gl;
			o > this.data[n] && (this.data[n] = o);
		}
	}
	wallAlongX(e, t, n, r) {
		let i = Wl / 2 / 8;
		this.box(e, t - i, n - i, t + 1 + i, n + i, r);
	}
	wallAlongY(e, t, n, r) {
		let i = Wl / 2 / 8;
		this.box(e, t - i, n - i, t + i, n + 1 + i, r);
	}
	slab(e, t, n) {
		let [r, i] = [t - this.left, n - this.top];
		if (r < 0 || i < 0 || r >= this.tilesX || i >= this.tilesY) return;
		let a = e * this.width * this.height;
		for (let e = 0; e < 8; e++) for (let t = 0; t < 8; t++) this.data[(a + (i * 8 + e) * this.width + r * 8 + t) * Gl + 1] = 255;
	}
	canopy(e, t, n, r, i, a = !1, o = 1) {
		let s = Math.max(1, Math.round(r.size * o)), c = s >> 1, l = Math.round((t - this.left) * 8) - c, u = Math.round((n - this.top) * 8) - c, d = i / Hl;
		for (let t = 0; t < s; t++) for (let n = 0; n < s; n++) {
			let i = Math.min(r.size - 1, Math.floor(n / o)), s = Math.min(r.size - 1, Math.floor(t / o)), c = (a ? i * r.size + s : s * r.size + i) * 2, f = r.cells[c + 1];
			if (!f) continue;
			let p = r.cells[c];
			this.hanging(e, l + n, u + t, p * o, f * o, d);
		}
	}
	hanging(e, t, n, r, i, a) {
		if (!(t < 0 || n < 0 || t >= this.width || n >= this.height)) for (let o = e; o < this.floors; o++) {
			let s = (o - e) * a, c = o === this.floors - 1, l = Math.max(0, r - s), u = c ? i - s : Math.min(a, i - s);
			if (u <= l) continue;
			let d = (o * this.width * this.height + n * this.width + t) * Gl, f = this.data[d + 3] > 0;
			this.data[d + 2] = f ? Math.min(this.data[d + 2], Math.round(l)) : Math.round(l), this.data[d + 3] = Math.min(255, Math.max(this.data[d + 3], Math.round(u)));
		}
	}
	solid(e, t, n, r, i, a, o) {
		let s = a / Hl, c = o / Hl;
		for (let a = Math.round((n - this.top) * 8); a < Math.round((i - this.top) * 8); a++) for (let n = Math.round((t - this.left) * 8); n < Math.round((r - this.left) * 8); n++) this.hanging(e, n, a, 0, s, c);
	}
	roof(e, t, n, r, i, a, o, s) {
		let c = s / Hl;
		for (let s = Math.max(0, Math.floor((n - this.top) * 8)); s < Math.min(this.height, Math.ceil((i - this.top) * 8)); s++) for (let n = Math.max(0, Math.floor((t - this.left) * 8)); n < Math.min(this.width, Math.ceil((r - this.left) * 8)); n++) {
			let t = o((n + .5) / 8 + this.left, (s + .5) / 8 + this.top);
			t !== null && this.hanging(e, n, s, a / Hl, t / Hl, c);
		}
	}
	tower(e, t, n, r, i, a, o) {
		let s = o / Hl;
		for (let o = Math.max(0, Math.floor((n - this.top) * 8)); o < Math.min(this.height, Math.ceil((i - this.top) * 8)); o++) for (let n = Math.max(0, Math.floor((t - this.left) * 8)); n < Math.min(this.width, Math.ceil((r - this.left) * 8)); n++) {
			let t = a((n + .5) / 8 + this.left, (o + .5) / 8 + this.top);
			if (t) {
				for (let r = e; r < this.floors; r++) {
					let i = t.solid / Hl - (r - e) * s;
					if (i <= 0) break;
					let a = (r * this.width * this.height + o * this.width + n) * Gl;
					this.data[a] = Math.max(this.data[a], Math.min(255, Math.round(r === this.floors - 1 ? i : Math.min(s, i))));
				}
				t.high > t.low && this.hanging(e, n, o, t.low / Hl, t.high / Hl, s);
			}
		}
	}
	levelsAt(e, t, n) {
		let r = Math.floor((e - this.left) * 8), i = Math.floor((t - this.top) * 8), a = [0];
		if (r < 0 || i < 0 || r >= this.width || i >= this.height) return a;
		let o = Math.round(n / Hl), s = (e) => (e * this.width * this.height + i * this.width + r) * Gl;
		for (let e = 0; e < this.floors; e++) {
			let t = s(e), r = e + 1 < this.floors ? s(e + 1) : -1;
			e > 0 && this.data[t + 1] && a.push(e * n);
			for (let i of [this.data[t], this.data[t + 3]]) {
				let t = i >= o && r >= 0 && (this.data[r] > 0 || this.data[r + 3] > 0 && this.data[r + 2] === 0);
				i > 0 && !t && a.push(e * n + i * Hl);
			}
		}
		return a.sort((e, t) => e - t), a.filter((e, t) => t === 0 || e - a[t - 1] > Kl).map((e) => Math.round(e * 100) / 100);
	}
	clear() {
		this.data.fill(0);
	}
	texture() {
		let e = new Y(this.data, this.width, this.height, this.floors);
		return e.format = m, e.type = o, e.internalFormat = "RGBA8", e.minFilter = r, e.magFilter = r, e.generateMipmaps = !1, e.colorSpace = "", e.unpackAlignment = 1, e.needsUpdate = !0, e;
	}
}, Yl = (e) => `vec3(${e.map((e) => e.toFixed(6)).join(", ")})`, Xl = "\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\nprecision highp sampler2DArray;\n", Zl = "\nuniform sampler2D tCut;\n/** whether anything is cut, and the size of the part of the map the picture covers, in tiles */\nuniform vec3 uCut;\n/** the far corner of that part */\nuniform vec2 uCutAt;\nconst float CUT_ROOM = 6.0;\n/** A roof starts a little below the top of its walls, with the boards of the eaves: all of it goes, so none of it stays floating around the room. */\nconst float CUT_EAVES = 8.0;\nconst float CUT_SCALE = 1024.0;\n\nfloat cutAt(float screenX, float screenY, float height) {\n	float u = screenX / 32.0;\n	float v = (screenY + height) / 16.0;\n	vec2 at = (vec2(v + u, v - u) * 0.5 - uCutAt) / uCut.yz;\n	if (at.x < 0.0 || at.y < 0.0 || at.x >= 1.0 || at.y >= 1.0) return 0.0;\n	return texture(tCut, at).r * CUT_SCALE;\n}\n", Ql = 1024, $l = `${Xl}
in vec2 position;
in vec3 aWorld;
in vec4 aMeta;
in float aScale;

uniform sampler2D uSprites;
/** left, top, width and height of the view, in art pixels */
uniform vec4 uView;
/** seconds, and how many art pixels the top of a tree travels */
uniform vec2 uWind;

out vec2 vTexel;
flat out vec3 vWind;
flat out float vWater;
flat out float vBody;
flat out int vLayer;
flat out float vBaseZ;
flat out float vBias;
flat out float vPick;
flat out float vFlip;
flat out float vKeep;
flat out float vFloor;
flat out float vFootRow;
flat out vec2 vFootAt;
flat out vec2 vFootSize;
flat out float vScale;

void main() {
	int flags = int(aMeta.y);
	int sprite = int(aMeta.x);
	int frames = (flags >> 8) & 31;
	// each one keeps its own beat: two fires side by side do not flicker together
	if (frames > 1) sprite += int(mod(floor(uWind.x * 10.0 + aWorld.x * 3.7 + aWorld.y * 5.3), float(frames)));
	int id = sprite * 2;
	vec4 rect = texelFetch(uSprites, ivec2(id & 1023, id >> 10), 0);
	vec4 info = texelFetch(uSprites, ivec2((id + 1) & 1023, (id + 1) >> 10), 0);
	bool flip = (flags & 1) == 1;
	vWater = (flags & 128) == 128 ? 1.0 : 0.0;
	vBody = (flags & 8192) == 8192 ? 1.0 : 0.0;

	vec2 corner = position * rect.zw;
	vec2 base = floor(vec2((aWorld.x - aWorld.y) * 32.0, (aWorld.x + aWorld.y) * 16.0 - aWorld.z) + 0.5);
	float ax = flip ? rect.z - info.x : info.x;
	float scale = aScale > 0.0 ? aScale : 1.0;
	vScale = scale;
	// the quad grows around the foot, and the picture stays what it is: each pixel of the screen still reads one whole texel
	vec2 p = base + (corner - vec2(ax, info.y)) * scale;
	vFootAt = base;
	vFootSize = vec2(float((flags >> 14) & 31), float((flags >> 19) & 31)) * scale;

	vTexel = rect.xy + vec2(flip ? rect.z - corner.x : corner.x, corner.y);
	vLayer = int(info.z);
	vBaseZ = aWorld.z;
	vBias = aMeta.z;
	vPick = aMeta.w;
	vFlip = flip ? -1.0 : 1.0;
	vKeep = (int(aMeta.y) & 2) == 2 ? 1.0 : 0.0;
	vFloor = float((int(aMeta.y) >> 2) & 15);
	vFootRow = rect.y + info.y;
	// row of the foot in the atlas, height of the sprite and phase: two trees side by side never move together
	vWind = (int(aMeta.y) & 64) == 64 ? vec3(rect.y + info.y, info.y, aWorld.x * 1.7 + aWorld.y * 2.3) : vec3(0.0);

	gl_Position = vec4((p.x - uView.x) / uView.z * 2.0 - 1.0, 1.0 - (p.y - uView.y) / uView.w * 2.0, 0.0, 1.0);
}
`, eu = `${Xl}
in vec3 position;
in vec2 aUv;
in vec3 aMeta;
in vec3 aNormal;

uniform sampler2D uSprites;
uniform vec4 uView;
/** the highest floor on show, and whether roofs are on show at all */
uniform vec2 uRoofs;

out vec2 vUv;
out float vHeight;
flat out vec4 vRect;
flat out int vLayer;
flat out float vFloor;
flat out float vPick;
flat out vec3 vNormal;

void main() {
	int id = int(aMeta.x) * 2;
	vRect = texelFetch(uSprites, ivec2(id & 1023, id >> 10), 0);
	vLayer = int(texelFetch(uSprites, ivec2((id + 1) & 1023, (id + 1) >> 10), 0).z);
	vUv = aUv;
	vHeight = position.z;
	// a floor number past 100 is a band that stays when roofs are hidden: a wire, or the wall and the floor of a round room
	bool keep = aMeta.y >= 100.0;
	float floorIndex = keep ? aMeta.y - 100.0 : aMeta.y;
	vFloor = floorIndex;
	vPick = aMeta.z;
	vNormal = aNormal;
	if ((uRoofs.y < 0.5 && !keep) || floorIndex > uRoofs.x) {
		gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
		return;
	}
	vec2 p = vec2((position.x - position.y) * 32.0, (position.x + position.y) * 16.0 - position.z);
	gl_Position = vec4((p.x - uView.x) / uView.z * 2.0 - 1.0, 1.0 - (p.y - uView.y) / uView.w * 2.0, 0.0, 1.0);
}
`, tu = `${Xl}
in vec2 vUv;
in float vHeight;
flat in vec4 vRect;
flat in int vLayer;
flat in float vFloor;
flat in float vPick;
flat in vec3 vNormal;

uniform sampler2DArray uAlbedo;
uniform sampler2DArray uAux;
uniform vec4 uDepth;
uniform vec4 uView;
uniform vec2 uBuffer;
${Zl}

layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gId;

void main() {
	if (vHeight > uDepth.w) discard;
	if (uCut.x > 0.5) {
		float limit = cutAt(uView.x + gl_FragCoord.x / uBuffer.x * uView.z, uView.y + (1.0 - gl_FragCoord.y / uBuffer.y) * uView.w, vHeight);
		if (limit > 0.0 && vHeight > limit - CUT_EAVES) discard;
	}
	ivec2 size = ivec2(vRect.zw);
	ivec2 at = ((ivec2(floor(vUv)) % size) + size) % size;
	ivec3 tc = ivec3(ivec2(vRect.xy) + at, vLayer);
	vec4 color = texelFetch(uAlbedo, tc, 0);
	if (color.a < 0.5) discard;
	float screenY = uView.y + (1.0 - gl_FragCoord.y / uBuffer.y) * uView.w;
	float near = screenY + uDepth.z * vHeight;
	gl_FragDepth = 1.0 - clamp((near - uDepth.x) / (uDepth.y - uDepth.x), 0.0, 1.0);
	gColor = vec4(color.rgb, texelFetch(uAux, tc, 0).a);
	gNormal = vec4(vNormal * 0.5 + 0.5, (vFloor + 0.5) / 128.0);
	float pick = vPick;
	gId = vec4(mod(pick, 256.0), mod(floor(pick / 256.0), 256.0), floor(pick / 65536.0), 255.0) / 255.0;
}
`, nu = `${Xl}
in vec2 vTexel;
flat in vec3 vWind;
flat in float vWater;
flat in float vBody;
flat in int vLayer;
flat in float vBaseZ;
flat in float vBias;
flat in float vPick;
flat in float vFlip;
flat in float vKeep;
flat in float vFloor;
flat in float vFootRow;
flat in vec2 vFootAt;
flat in vec2 vFootSize;
flat in float vScale;

uniform sampler2DArray uAlbedo;
uniform sampler2DArray uAux;
/** lowest depth, highest depth, depth factor, height above which pixels are cut away */
uniform vec4 uDepth;
uniform vec4 uView;
uniform vec2 uBuffer;
/** seconds, and how many art pixels the top of a tree travels */
uniform vec2 uWind;
${Zl}

layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gId;

const vec3 RIGHT = ${Yl(ks)};
const vec3 UP = ${Yl(As)};
const vec3 TOWARD = ${Yl(js)};

float cellHash(vec2 p) {
	p = fract(p * vec2(0.1031, 0.1137));
	p += dot(p, p.yx + 33.33);
	return fract((p.x + p.y) * p.x);
}

void main() {
	ivec3 tc = ivec3(int(floor(vTexel.x)), int(floor(vTexel.y)), vLayer);
	float foliage = 0.0;
	float water = 0.0;
	vec3 glint = vec3(0.0);
	if (vWater > 0.5 && texelFetch(uAux, tc, 0).b > 0.5) {
		water = 1.0;
		// Water moves in whole pixels too: each row slides a little, and a few short glints come and go.
		vec2 art = floor(vec2(uView.x + gl_FragCoord.x / uBuffer.x * uView.z, uView.y + (1.0 - gl_FragCoord.y / uBuffer.y) * uView.w));
		float t = uWind.x;
		float wave = sin(art.y * 0.55 + t * 1.3 + sin(art.x * 0.09 + t * 0.6) * 1.6);
		ivec3 moved = tc;
		moved.x += int(round(wave * 1.4));
		if (texelFetch(uAlbedo, moved, 0).a > 0.5) tc = moved;
		vec2 cell = floor(art / vec2(13.0, 5.0));
		vec2 inside = art - cell * vec2(13.0, 5.0);
		float beat = t * 0.9 + cellHash(cell) * 6.28;
		if (sin(beat) > 0.72 && inside.y == 2.0 && abs(inside.x - 6.0) < 1.5 + 2.0 * cellHash(cell + 3.0)) glint = vec3(0.3, 0.36, 0.36);
	}
	if (vWind.y > 0.0) {
		foliage = 1.0;
		// Whole pixels only: a sprite that slides by fractions stops being pixel art. Only the crown moves, more toward the top, and a
		// slow wave climbs it, so the rows do not all jump at the same moment.
		float rise = clamp((vWind.x - float(tc.y)) / vWind.y, 0.0, 1.0);
		float sway = sin(uWind.x * 1.1 + vWind.z + rise * 2.4) + 0.5 * sin(uWind.x * 2.7 + vWind.z * 1.7 + rise * 5.0);
		tc.x += int(round(sway * uWind.y * rise * rise));
	}
	vec4 color = texelFetch(uAlbedo, tc, 0);
	if (color.a < 0.5) discard;

	vec4 aux = texelFetch(uAux, tc, 0);
	color.rgb += glint;
	float raised = vWater > 0.5 ? 0.0 : aux.b * 255.0;
	// The channel ends at 255 pixels, a little over 6 m. Above that a tall building goes on rising row by row: held at the limit, its top would
	// fall back in depth as it went up, and whatever stands behind it would cut it off in a straight line.
	if (raised > 254.5) raised = max(raised, vFootRow - float(tc.y));
	raised *= vScale;

	// Read from the pixel rather than interpolated: two sprites that meet on a pixel must agree on it exactly, or the small bias that
	// decides who stays in front loses to rounding, and only some of the joints of a wall come out right.
	float screenY = uView.y + (1.0 - gl_FragCoord.y / uBuffer.y) * uView.w;
	if (vFootSize.x > 0.0) {
		// One plane through the middle does for what is about as wide as deep. Something long runs across the view, and a token next to one of its
		// ends would fall on the wrong side of the middle. Each column of pixels stands on the middle of what the rectangle covers along that column.
		float screenX = uView.x + gl_FragCoord.x / uBuffer.x * uView.z;
		vec2 half_ = vFootSize * 0.5;
		float across = clamp((screenX - vFootAt.x) / 32.0, -half_.x - half_.y, half_.x + half_.y);
		float along = (max(-half_.y, -half_.x - across) + min(half_.y, half_.x - across)) * 0.5;
		raised = max(0.0, vFootAt.y + (2.0 * along + across) * 16.0 - screenY);
	}
	float height = vBaseZ + raised;
	if (height > uDepth.w && vKeep < 0.5) discard;
	if (uCut.x > 0.5) {
		float limit = cutAt(uView.x + gl_FragCoord.x / uBuffer.x * uView.z, screenY, height);
		// what belongs to a story above goes whole; on the story itself, only walls come down: furniture stays
		if (limit > 0.0 && (vBaseZ >= limit || (height > limit + CUT_ROOM && vKeep < 0.5))) discard;
	}

	float near = screenY + uDepth.z * height + vBias;
	gl_FragDepth = 1.0 - clamp((near - uDepth.x) / (uDepth.y - uDepth.x), 0.0, 1.0);

	vec2 n = aux.rg * 2.0 - 1.0;
	n.x *= vFlip;
	float nz = sqrt(max(0.0, 1.0 - dot(n, n)));

	gColor = vec4(color.rgb, aux.a);
	gNormal = vec4((n.x * RIGHT + n.y * UP + nz * TOWARD) * 0.5 + 0.5, (vFloor + 16.0 * (foliage + 2.0 * vBody) + 64.0 * water + 0.5) / 128.0);
	float pick = vPick;
	gId = vec4(mod(pick, 256.0), mod(floor(pick / 256.0), 256.0), floor(pick / 65536.0), 255.0) / 255.0;
}
`, ru = {
	sky: 0,
	smoke: 2,
	ember: 3,
	petal: 4,
	leaf: 5,
	firefly: 6,
	mist: 7
}, iu = `${Xl}
in vec2 position;
in vec4 aOrigin;
in float aSeed;

uniform vec4 uView;
uniform float uTime;
/** wind along the screen, in pixels per second, and how strong it is from 0 to 1 */
uniform vec3 uWind;
/** 1 rain, 2 snow, and the share of the particles that are falling */
uniform vec2 uSky;
/** light from the sky, and how dark the hour is, from 0 to 1 */
uniform vec4 uAir;
uniform vec4 uDepth;

out vec2 vLocal;
flat out vec2 vSize;
flat out vec4 vColor;
flat out float vNear;
flat out float vSlant;
flat out int vKind;

float hash(float n) {
	return fract(sin(n) * 43758.5453);
}

void hide() {
	vKind = -1;
	gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}

void main() {
	float r1 = hash(aSeed + 1.0);
	float r2 = hash(aSeed + 2.0);
	float r3 = hash(aSeed + 3.0);
	float r4 = hash(aSeed + 4.0);
	int kind = int(aOrigin.w);
	vec2 at;
	vec2 size = vec2(1.0);
	vec4 color = vec4(1.0);
	float height = 0.0;
	vNear = 1e9;
	vSlant = 0.0;

	if (kind == 0) {
		// The sky is a tile of the size of the view that repeats, tied to the map: when the camera moves, the rain stays where it was.
		if (uSky.x < 0.5 || r4 > uSky.y) {
			hide();
			return;
		}
		vec2 span = max(uView.zw, vec2(640.0));
		bool rain = uSky.x < 1.5;
		float speed = rain ? 520.0 + 240.0 * r1 : 26.0 + 30.0 * r1;
		float fall = uTime * speed;
		float drift = uTime * uWind.x * (rain ? 1.0 : 0.6);
		float sway = rain ? 0.0 : sin(uTime * (0.8 + r2) + r3 * 6.28) * 7.0;
		vec2 p = vec2(r2 * span.x + drift + sway, r3 * span.y + fall);
		at = uView.xy + mod(p - uView.xy, span);
		if (rain) {
			size = vec2(1.0, floor(5.0 + 6.0 * r1));
			vSlant = uWind.x / speed;
			size.x = 1.0 + ceil(abs(vSlant) * size.y);
			color = vec4(mix(vec3(0.62, 0.7, 0.8), uAir.rgb * 1.6, 0.6), 0.5);
		} else {
			size = vec2(r1 > 0.72 ? 2.0 : 1.0);
			color = vec4(mix(vec3(0.95, 0.97, 1.0), uAir.rgb * 1.8, 0.35), 0.95);
		}
		kind = rain ? 10 : 11;
	} else {
		// Everything else has a life, and a place it starts from.
		float period;
		vec3 world = aOrigin.xyz;
		vec2 wind = uWind.xy;
		if (kind == 2) {
			period = 3.2 + r1 * 1.8;
		} else if (kind == 3) {
			period = 1.1 + r1 * 0.9;
		} else if (kind == 6) {
			period = 7.0 + r1 * 5.0;
		} else if (kind == 7) {
			period = 1.4 + r1 * 1.3;
		} else {
			period = 6.0 + r1 * 5.0;
		}
		float life = fract(uTime / period + r2);
		if (kind == 2) {
			world.z += life * 1.7;
			at = vec2(sin(life * 5.0 + r3 * 6.0) * (1.0 + life * 3.0) + wind.y * life * 14.0, 0.0);
			size = vec2(life < 0.3 ? 1.0 : life < 0.7 ? 2.0 : 3.0);
			color = vec4(mix(vec3(0.5, 0.5, 0.52), uAir.rgb * 1.3, 0.5), (1.0 - life) * 0.8);
		} else if (kind == 3) {
			world.z += life * (0.9 + r3 * 0.9);
			at = vec2(sin(life * 9.0 + r3 * 6.0) * 2.5 + (r4 - 0.5) * 7.0, 0.0);
			color = vec4(1.0, 0.55 - life * 0.3, 0.16, life < 0.8 ? 1.0 : 0.0);
		} else if (kind == 6) {
			float night = uAir.a;
			float blink = sin(life * 6.28 * 4.0 + r3 * 6.28);
			if (night < 0.4 || blink < 0.2) {
				hide();
				return;
			}
			world.x += sin(uTime * 0.21 + r3 * 6.28) * 1.4;
			world.y += cos(uTime * 0.17 + r4 * 6.28) * 1.4;
			world.z += 0.3 + sin(uTime * 0.3 + r1 * 6.28) * 0.2 + r4 * 0.8;
			at = vec2(0.0);
			color = vec4(0.82, 0.95, 0.4, 1.0);
		} else if (kind == 7) {
			// the spray at the foot of a waterfall: it leaves the water, spreads and thins out
			world.x += (r3 - 0.5) * 2.2 * (0.4 + life);
			world.y += (r4 - 0.5) * 1.4 * (0.4 + life);
			world.z += life * (0.6 + r1 * 1.3);
			at = vec2(0.0);
			size = vec2(life < 0.35 ? 2.0 : 3.0);
			color = vec4(mix(vec3(0.86, 0.92, 0.94), uAir.rgb * 1.5, 0.35), (1.0 - life) * 0.6);
		} else {
			// a petal starts in the crown, somewhere around the trunk, and comes down turning
			float reach = 1.9;
			world.x += (r3 - 0.5) * reach * 2.0;
			world.y += (r4 - 0.5) * reach * 2.0;
			world.z *= 1.0 - life;
			at = vec2(sin(life * 11.0 + r1 * 6.0) * 5.0 + wind.y * life * 40.0, 0.0);
			if (life > 0.97) {
				hide();
				return;
			}
			vec3 tone = kind == 4 ? (r1 > 0.5 ? vec3(0.95, 0.86, 0.8) : vec3(0.88, 0.66, 0.66)) : (r1 > 0.5 ? vec3(0.72, 0.25, 0.16) : vec3(0.85, 0.55, 0.2));
			color = vec4(tone * (uAir.rgb * 1.6 + 0.12), 1.0);
			size = vec2(r2 > 0.6 ? 2.0 : 1.0, 1.0);
		}
		height = world.z * ${40 .toFixed(1)};
		vec2 base = vec2((world.x - world.y) * 32.0, (world.x + world.y) * 16.0 - height);
		at += base;
		vNear = base.y + uDepth.z * height;
	}
	vLocal = position * size;
	vSize = size;
	vColor = color;
	vKind = kind;
	vec2 p = floor(at) + position * size;
	gl_Position = vec4((p.x - uView.x) / uView.z * 2.0 - 1.0, 1.0 - (p.y - uView.y) / uView.w * 2.0, 0.0, 1.0);
}
`, au = `${Xl}
in vec2 vLocal;
flat in vec2 vSize;
flat in vec4 vColor;
flat in float vNear;
flat in float vSlant;
flat in int vKind;

uniform sampler2D tDepth;
uniform sampler2D tLight;
uniform vec4 uDepth;
out vec4 fragColor;

const float BAYER[16] = float[16](
	0.0, 8.0, 2.0, 10.0,
	12.0, 4.0, 14.0, 6.0,
	3.0, 11.0, 1.0, 9.0,
	15.0, 7.0, 13.0, 5.0
);

void main() {
	if (vKind < 0) discard;
	ivec2 ip = ivec2(gl_FragCoord.xy);
	if (vKind >= 10) {
		// what falls from the sky falls only where the sky can be seen: not inside a house whose roof is hidden
		if (texelFetch(tLight, ip, 0).a < 0.5) discard;
		if (vKind == 10) {
			float row = floor(vLocal.y);
			float column = floor(vLocal.x);
			float line = vSlant >= 0.0 ? floor(row * vSlant) : vSize.x - 1.0 + ceil(row * vSlant);
			if (column != line) discard;
		}
	} else {
		float depth = texelFetch(tDepth, ip, 0).r;
		if (depth < 1.0 && vNear < mix(uDepth.y, uDepth.x, depth)) discard;
		// fading out, a pixel at a time, instead of going transparent
		if (vColor.a < (BAYER[(ip.x & 3) + (ip.y & 3) * 4] + 0.5) / 16.0) discard;
		fragColor = vec4(vColor.rgb, 1.0);
		return;
	}
	fragColor = vColor;
}
`, ou = (e, t) => e.feet?.[t % e.feet.length] ?? e.foot;
async function su(e, t) {
	let n = await (await fetch(`${e}.json`)).json(), r = await fetch(`${e}.pack`);
	if (!r.ok || !r.body) throw Error(`Pack ${e} not found`);
	let i = r.body.pipeThrough(new DecompressionStream("gzip")), a = new Uint8Array(await new Response(i).arrayBuffer()), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
	for (let e of n.sprites) {
		let n = e.w * e.h * 4, r = a.subarray(e.offset, e.offset + n), i = a.subarray(e.offset + n, e.offset + n * 2);
		o.set(e.name, t.add({
			name: e.name,
			w: e.w,
			h: e.h,
			ax: e.ax,
			ay: e.ay,
			albedo: r,
			aux: i
		})), s.set(e.name, e);
	}
	return {
		manifest: n,
		ids: o,
		image: (e) => {
			let t = s.get(e);
			return t ? {
				w: t.w,
				h: t.h,
				ax: t.ax,
				ay: t.ay,
				pixels: a.subarray(t.offset, t.offset + t.w * t.h * 4)
			} : null;
		},
		bytes: a
	};
}
// ../engine/src/scene.ts
var cu = (e) => e << 2, lu = 8192, uu = (e, t) => Math.min(e, 31) << 14 | Math.min(t, 31) << 19, du = (e) => e << 8, fu = .04, pu = .002, mu = 1 << 23, hu = 1400, gu = 16, _u = 64, vu = 1024, yu = (e, t, n, r) => mu | (t === "y" ? 1 << 22 : 0) | (e & 3) << 20 | r * vu + n;
function bu(e, t) {
	let n = Math.imul(e + 1, 2654435761) ^ Math.imul(t + 1, 2246822519);
	return n ^= n >>> 16, n = Math.imul(n, 2246822507), n ^= n >>> 13, n = Math.imul(n, 3266489909), n ^= n >>> 16, n >>> 0;
}
var xu = class {
	atlas;
	floor;
	cx;
	cy;
	data = /* @__PURE__ */ new Float32Array(4096);
	count = 0;
	x0 = Infinity;
	y0 = Infinity;
	x1 = -Infinity;
	y1 = -Infinity;
	constructor(e, t, n, r) {
		this.atlas = e, this.floor = t, this.cx = n, this.cy = r;
	}
	add(e, t, n, r, i, a, o = 0, s = 1) {
		if ((this.count + 1) * 8 > this.data.length) {
			let e = new Float32Array(this.data.length * 2);
			e.set(this.data), this.data = e;
		}
		let c = this.count * 8, l = this.data;
		l[c] = e, l[c + 1] = t, l[c + 2] = n, l[c + 3] = r, l[c + 4] = i, l[c + 5] = a, l[c + 6] = o, l[c + 7] = s, this.count++;
		let u = this.atlas.info(r), d = (e - t) * 32, f = (e + t) * 16 - n;
		this.x0 = Math.min(this.x0, d - u.w * s), this.x1 = Math.max(this.x1, d + u.w * s), this.y0 = Math.min(this.y0, f - u.ay * s), this.y1 = Math.max(this.y1, f + (u.h - u.ay) * s);
	}
	finish() {
		return this.count ? {
			floor: this.floor,
			cx: this.cx,
			cy: this.cy,
			data: this.data,
			count: this.count,
			x0: this.x0,
			y0: this.y0,
			x1: this.x1,
			y1: this.y1
		} : null;
	}
};
function Su(e, t, n, r, i, a, o, s, c) {
	let l = n.manifest.overlays?.[c.materials[1]], u = l ?? n.manifest.ground;
	if (!u) return;
	let d = l ? (e, t) => r.get(e, t) || 1 : (e, t) => r.get(e, t), f = n.manifest.terrains?.find((e) => e.id === c.materials[1])?.water === !0, p = l && f ? 128 : 0;
	for (let t = i.y0; t < i.y1; t++) for (let r = i.x0; r < i.x1; r++) {
		let i = d(r, t), c = d(r + 1, t), f = d(r, t + 1), m = d(r + 1, t + 1);
		if (!i || !c || !f || !m) continue;
		let h = (i === 1 ? 8 : 0) | (c === 1 ? 4 : 0) | (f === 1 ? 2 : 0) | m === 1;
		if (l && h === 15) continue;
		let g = u[h], _ = bu(r, t), v = g[_ % g.length], y = h === 0 || h === 15 ? (_ >>> 8 & 1) == 1 : v.flip, b = n.ids.get(v.sprite);
		b !== void 0 && e.add(r, t, o, b, a | p | +!!y, s);
	}
}
function Cu(e, t, n) {
	let r = /* @__PURE__ */ new Set(), i = e.meta.floors[n - 1];
	if (!i) return r;
	for (let e of i.layers) if (e.kind === "objects" && e.visible) for (let n of e.items) {
		let e = t.manifest.objects?.find((e) => e.id === n.asset);
		if (e?.kind !== "stairs") continue;
		let [i, a] = ou(e, n.facing), o = Math.round(n.x - i / 2), s = Math.round(n.y - a / 2);
		for (let e = 0; e < a; e++) for (let t = 0; t < i; t++) r.add((s + e) * 65536 + o + t);
	}
	return r;
}
function wu(e, t, n, r, i, a, o, s, c) {
	let l = n.manifest.tiles ?? [];
	for (let u = i.y0; u < i.y1; u++) for (let d = i.x0; d < i.x1; d++) {
		let i = r.get(d, u);
		if (!i || c.has(u * 65536 + d)) continue;
		let f = t.meta.tiles[(i & Ac) - 1], p = l.find((e) => e.id === f), m = p ? n.ids.get(p.sprite) : void 0;
		m !== void 0 && e.add(d, u, o, m, a | (i & 65536 ? 1 : 0), s);
	}
}
function Tu(e, t, n) {
	let r = n ? e.meta.wallStyles?.[n - 1] : void 0;
	return r && t.wallKits?.[r] || t.walls;
}
var Eu = (e, t, n) => Tu(e, t.manifest, n);
function Du(e, t, n, r, i, a, o, s, c) {
	if (!n.manifest.walls) return;
	let l = (e, t, n) => t < 0 || n < 0 ? 0 : e(r.get(t, n)), u = (e, t) => l(wc, e, t), d = (e, t) => l(Tc, e, t), f = (e, t) => l(Ec, e, t), p = (e, t) => l(Dc, e, t), m = (t, r, i, c, l = 0) => {
		let u = i === void 0 ? void 0 : n.ids.get(i);
		u !== void 0 && e.add(t, r, o, u, a | (l ? du(l) : 0), s + (t + r) * pu, c);
	};
	for (let e = i.y0; e < i.y1; e++) for (let a = i.x0; a < i.x1; a++) {
		let i = r.get(a, e);
		if (!i) continue;
		let o = wc(i), s = Tc(i), l = yu(c, "x", a, e), h = yu(c, "y", a, e), g = Eu(t, n, Ec(i)), _ = Eu(t, n, Dc(i));
		if (o === 1) {
			let t = d(a + 1, e - 1) === 1 && p(a + 1, e - 1) === Ec(i);
			m(a, e - 1, t ? g.corner : g.x, l, g.frames);
		} else o === 2 || o === 5 ? (m(a, e - 1, g.doorX[0], l), o === 2 && m(a, e - 1, g.leafX?.[0], l)) : o === 3 || o === 6 ? (m(a, e - 1, g.doorX[1], l), o === 3 && m(a, e - 1, g.leafX?.[1], l)) : o === 4 && m(a, e - 1, g.windowX ?? g.x, l);
		s === 1 ? (u(a - 1, e + 1) !== 1 || f(a - 1, e + 1) !== Dc(i)) && m(a - 1, e, _.y, h, _.frames) : s === 2 || s === 5 ? (m(a - 1, e, _.doorY[0], h), s === 2 && m(a - 1, e, _.leafY?.[0], h)) : s === 3 || s === 6 ? (m(a - 1, e, _.doorY[1], h), s === 3 && m(a - 1, e, _.leafY?.[1], h)) : s === 4 && m(a - 1, e, _.windowY ?? _.y, h), o && s && !u(a - 1, e) && !d(a, e - 1) && m(a - 1, e - 1, g.post, l), o && g.endX && !u(a + 1, e) && !d(a + 1, e - 1) && m(a, e - 1, g.endX, l), s && _.endY && !d(a, e + 1) && !u(a - 1, e + 1) && m(a - 1, e, _.endY, h);
	}
}
function Ou(e, t, n, r, i, a, o, s) {
	let c = t.manifest.objects;
	if (c) for (let l of n.items) {
		let n = Math.floor(l.x), u = Math.floor(l.y);
		if (n < r.x0 || n >= r.x1 || u < r.y0 || u >= r.y1) continue;
		let d = c.find((e) => e.id === l.asset);
		if (!d) continue;
		let f = s(l.id), p = d.kind === "tree" || d.kind === "plant" || d.sway === !0, m = d.kind === "decal", [h, g] = ou(d, l.facing), _ = l.scale ?? 1;
		for (let n of d.facings[l.facing % d.facings.length]) {
			let r = t.ids.get(n.sprite);
			if (r === void 0) continue;
			let s = d.kind === "prop" && !n.flat && !n.rise && !n.dx && !n.dy, c = i | 2 | (s && h !== g ? uu(h, g) : 0) | !!n.flip | (p && !n.flat ? 64 : 0) | (p || n.flat ? 0 : lu) | (n.frames ? du(n.frames) : 0);
			e.add(l.x + (n.dx ?? 0) * _, l.y + (n.dy ?? 0) * _, a + (n.rise ?? 0) * _, r, c, n.flat ? o - .02 : o, n.flat && !m ? 0 : f, _);
		}
	}
}
function ku(e, t, n, r, i, a, o = () => 0) {
	let s = e.meta.floors[r];
	if (!s) return null;
	let c = {
		x0: i * 32,
		y0: a * 32,
		x1: Math.min(e.meta.size.x, (i + 1) * 32),
		y1: Math.min(e.meta.size.y, (a + 1) * 32)
	}, l = s.elevation * e.meta.grid.stepPx, u = cu(r), d = new xu(n, r, i, a), f = {
		...c,
		x1: Math.min(e.meta.size.x + 1, (i + 1) * 32),
		y1: Math.min(e.meta.size.y + 1, (a + 1) * 32)
	}, p = Cu(e, t, r);
	return s.layers.forEach((n, i) => {
		if (!n.visible) return;
		let a = i * fu;
		if (n.kind === "objects") {
			Ou(d, t, n, c, u, l, a, (e) => o(n.id, e));
			return;
		}
		if (n.kind === "roofs" || n.kind === "wires" || n.kind === "lights" || n.kind === "regions") return;
		let s = e.grids.get(n.id);
		s && (n.kind === "terrain" ? Su(d, e, t, s, c, u, l, a, n) : n.kind === "walls" ? Du(d, e, t, s, f, u, l, a, r) : wu(d, e, t, s, c, u, l, a, p));
	}), d.finish();
}
var Au = (e, t, n) => `${e}:${t}:${n}`, ju = class {
	renderer;
	pack;
	atlas;
	occlusion = null;
	map = null;
	storyMeters = 2.4;
	stairs = /* @__PURE__ */ new Map();
	objectPicks = /* @__PURE__ */ new Map();
	picked = /* @__PURE__ */ new Map();
	roofIds = /* @__PURE__ */ new Set();
	wireIds = /* @__PURE__ */ new Set();
	stamps = /* @__PURE__ */ new Map();
	constructor(e, t, n, r) {
		this.renderer = e, this.pack = t, this.atlas = n, e.setAtlas(r);
	}
	show(e) {
		this.map = e;
		let { size: t, floors: n, grid: r } = e.meta, i = Cc(r), a = Math.max(...n.map((e) => e.elevation)) * r.stepPx + i;
		this.renderer.setWorld({
			sizeX: t.x,
			sizeY: t.y,
			floors: n.length,
			storyPx: i,
			depthMin: -1024,
			depthMax: (t.x + t.y) * 16 + 1024 + Ms * (a + 255)
		}), this.renderer.clearChunks();
		let o = Math.ceil((t.x + 1) / 32), s = Math.ceil((t.y + 1) / 32);
		for (let t = 0; t < n.length; t++) for (let n = 0; n < s; n++) for (let r = 0; r < o; r++) this.redraw(e, t, r, n);
		let c = this.occlusion;
		this.occlusion = new Jl(t.x, t.y, n.length), c && this.occlusion.look(c.left + c.tilesX / 2, c.top + c.tilesY / 2), this.writeOcclusion(e), this.renderer.setOcclusion(this.occlusion.texture()), this.renderer.setOcclusionWindow(this.occlusion.left, this.occlusion.top, this.occlusion.tilesX, this.occlusion.tilesY), this.renderer.setLights(this.lightsOf(e)), this.renderer.setRoofs(this.roofTriangles(e)), this.renderer.setParticles(this.particlesOf(e));
	}
	pickOf = (e, t) => {
		let n = `${e}/${t}`, r = this.objectPicks.get(n);
		return r === void 0 && (r = this.objectPicks.size + 1, this.objectPicks.set(n, r), this.picked.set(r, {
			layerId: e,
			itemId: t
		})), r;
	};
	whoIs(e) {
		if (!e) return null;
		if (e & mu) {
			let t = e & 1048575;
			return {
				kind: "wall",
				floor: e >> 20 & 3,
				axis: e & 1 << 22 ? "y" : "x",
				x: t % vu,
				y: t >> 10
			};
		}
		let t = this.picked.get(e);
		return t ? this.wireIds.has(e) ? {
			kind: "wire",
			layerId: t.layerId,
			wireId: t.itemId
		} : this.roofIds.has(e) ? {
			kind: "roof",
			layerId: t.layerId,
			roofId: t.itemId
		} : {
			kind: "object",
			layerId: t.layerId,
			objectId: t.itemId
		} : null;
	}
	objectPick(e, t) {
		return this.pickOf(e, t);
	}
	redraw(e, t, n, r) {
		let i = ku(e, this.pack, this.atlas, t, n, r, this.pickOf), a = Au(t, n, r);
		i ? this.renderer.setChunk(a, i) : this.renderer.removeChunk(a);
	}
	update(e, t) {
		for (let n of t) {
			let [t, r, i] = n.split(":").map(Number);
			this.redraw(e, t, r, i);
		}
	}
	levelsAt(e, t) {
		let n = this.occlusion;
		n && this.map && !n.reaches(e, t, e, t) && (n = new Jl(n.sizeX, n.sizeY, n.floors, _u), n.look(e, t), this.writeOcclusion(this.map, n));
		let r = n?.levelsAt(e, t, this.storyMeters) ?? [0], i = this.stairs.get(Math.floor(t) * 65536 + Math.floor(e));
		return i ? [.../* @__PURE__ */ new Set([...r, ...i])].sort((e, t) => e - t) : r;
	}
	follow(e, t, n) {
		let r = this.occlusion;
		r?.look(t, n) && (this.writeOcclusion(e), this.renderer.setOcclusionWindow(r.left, r.top, r.tilesX, r.tilesY), this.renderer.refreshOcclusion(e.meta.floors.map((e, t) => t)));
	}
	settle(e) {
		this.occlusion && (this.writeOcclusion(e), this.renderer.refreshOcclusion(e.meta.floors.map((e, t) => t)), this.renderer.setLights(this.lightsOf(e)), this.renderer.setRoofs(this.roofTriangles(e)), this.renderer.setParticles(this.particlesOf(e)));
	}
	particlesOf(e) {
		let t = [];
		for (let e = 0; e < hu; e++) t.push(0, 0, 0, ru.sky, e * 1.37);
		let { floors: n, grid: r } = e.meta, i = hu * 1.37;
		return n.forEach((e) => {
			let n = e.elevation * r.stepPx / 40;
			for (let r of e.layers) if (r.kind === "objects" && r.visible) for (let e of r.items) for (let r of this.asset(e.asset)?.emits ?? []) for (let a = 0; a < r.count; a++) t.push(e.x, e.y, n + r.z, ru[r.kind], i += 1.73);
		}), new Float32Array(t);
	}
	settleLights(e) {
		this.renderer.setLights(this.lightsOf(e));
	}
	towerRings(e) {
		let t = this.pack.manifest.towers?.find((t) => t.id === e);
		return t ? t.rings.flatMap((e) => {
			let t = this.pack.ids.get(e.sprite);
			return t === void 0 ? [] : [{
				...e,
				id: t
			}];
		}) : null;
	}
	roofSprites(e) {
		let { roofs: t, roofTrim: n } = this.pack.manifest, r = t?.find((t) => t.id === e) ?? t?.[0];
		if (!r || !n) return null;
		let i = (e) => this.pack.ids.get(e), [a, o, s, c] = [
			i(r.sprite),
			i(r.ridge),
			i(n.fascia),
			i(n.gable)
		];
		return a === void 0 || o === void 0 || s === void 0 || c === void 0 ? null : {
			surface: a,
			ridge: o,
			fascia: s,
			gable: c
		};
	}
	roofTriangles(e) {
		let { floors: t, grid: n } = e.meta, r = (this.pack.manifest.walls?.meters ?? Cc(n) / 40) * 40, i = [];
		return t.forEach((e, t) => {
			for (let a of e.layers) if (a.kind === "wires" && a.visible) {
				let r = this.pack.manifest.wires, o = r && this.pack.ids.get(r.sprite);
				if (r && o !== void 0) for (let s of a.items) {
					let c = this.pickOf(a.id, s.id);
					this.wireIds.add(c), Vl(i, s, o, r.colors, e.elevation * n.stepPx, t, c);
				}
			} else if (a.kind === "roofs" && a.visible) for (let o of a.items) {
				let s = this.pickOf(a.id, o.id);
				if (o.shape === "round") {
					let r = this.towerRings(o.material);
					if (!r) continue;
					this.roofIds.add(s), Fl(i, o, r, e.elevation * n.stepPx, t, s);
					continue;
				}
				let c = this.roofSprites(o.material);
				c && (this.roofIds.add(s), Dl(i, o, c, e.elevation * n.stepPx + r, t, s));
			}
		}), new Float32Array(i);
	}
	asset(e) {
		return this.pack.manifest.objects?.find((t) => t.id === e);
	}
	stampOf(e) {
		if (!e.canopy) return null;
		let t = this.stamps.get(e.id);
		if (!t) {
			let n = Uint8Array.from(atob(e.canopy.cells), (e) => e.charCodeAt(0));
			t = {
				size: e.canopy.size,
				cells: n
			}, this.stamps.set(e.id, t);
		}
		return t;
	}
	lightsOf(e) {
		let t = [], { floors: n, grid: r } = e.meta;
		return n.forEach((e, n) => {
			let i = e.elevation * r.stepPx / 40;
			for (let r of e.layers) if (r.visible) {
				if (r.kind === "lights") for (let e of r.items) t.push({
					x: e.x,
					y: e.y,
					z: i + e.z,
					color: e.color,
					radius: e.radius,
					intensity: e.intensity,
					flicker: e.flicker,
					floor: n,
					target: e.target && [
						e.target[0],
						e.target[1],
						i
					],
					cone: e.cone
				});
				if (r.kind === "objects") for (let e of r.items) {
					let r = this.asset(e.asset)?.light, a = e.scale ?? 1;
					r && t.push({
						...r,
						x: e.x,
						y: e.y,
						z: i + r.z * a,
						radius: r.radius * a,
						floor: n
					});
				}
			}
		}), t;
	}
	writeOcclusion(e, t = this.occlusion) {
		if (!t) return;
		t.clear();
		let { size: n, floors: r, grid: i } = e.meta, a = Cc(i) / 40;
		this.storyMeters = a, this.stairs.clear();
		let o = this.pack.manifest.walls?.meters ?? a;
		r.forEach((r, i) => {
			let s = Cu(e, this.pack, i);
			for (let c of r.layers) {
				if (!c.visible) continue;
				if (c.kind === "objects") {
					for (let e of c.items) {
						let n = gu * Math.max(1, e.scale ?? 1);
						t.reaches(e.x - n, e.y - n, e.x + n, e.y + n) && this.writeObject(t, i, e.asset, e.x, e.y, e.facing, a, e.scale ?? 1);
						let r = this.asset(e.asset);
						if (r?.kind !== "stairs") continue;
						let [o, s] = ou(r, e.facing);
						for (let t = 0; t < s; t++) for (let n = 0; n < o; n++) {
							let r = (Math.floor(e.y - s / 2) + t) * 65536 + Math.floor(e.x - o / 2) + n;
							this.stairs.set(r, [...this.stairs.get(r) ?? [], (i + 1) * a]);
						}
					}
					continue;
				}
				if (c.kind === "roofs") {
					let e = o, n = Lc, r = e - n * 16 / 40;
					for (let o of c.items) if (t.reaches(o.x - gu, o.y - gu, o.x + o.wide + gu, o.y + o.deep + gu)) {
						if (o.shape === "round") {
							let e = this.pack.manifest.towers?.find((e) => e.id === o.material);
							if (!e || e.open) continue;
							let n = Math.max(...e.rings.flatMap((e) => [e.from[1], e.to[1]]), 0);
							t.tower(i, o.x - n, o.y - n, o.x + o.wide + n, o.y + o.deep + n, (t, n) => Rl(o, e.rings, t, n), a);
						} else t.roof(i, o.x - n, o.y - n, o.x + o.wide + n, o.y + o.deep + n, r, (t, n) => {
							let r = Tl(o, t, n);
							return r === null ? null : e + r / 40;
						}, a);
					}
					continue;
				}
				if (c.kind === "lights" || c.kind === "wires" || c.kind === "regions") continue;
				let r = e.grids.get(c.id);
				if (r) for (let o = bc(t.top); o <= bc(t.top + t.tilesY); o++) for (let l = bc(t.left); l <= bc(t.left + t.tilesX); l++) {
					let u = r.chunk(l, o);
					if (u) for (let r = 0; r < 32; r++) for (let d = 0; d < 32; d++) {
						let f = u[r * 32 + d];
						if (!f) continue;
						let p = l * 32 + d, m = o * 32 + r;
						if (c.kind === "walls") {
							let n = (t, n) => {
								let r = Eu(e, this.pack, n), i = (t === 2 || t === 3) && !!r?.leafX;
								return t === 1 || i ? r?.meters ?? a : t === 4 ? r?.sillMeters ?? .9 : 0;
							}, r = n(wc(f), Ec(f)), o = n(Tc(f), Dc(f));
							r && t.wallAlongX(i, p, m, r), o && t.wallAlongY(i, p, m, o);
						} else i > 0 && p < n.x && m < n.y && !s.has(m * 65536 + p) && t.slab(i, p, m);
					}
				}
			}
		});
	}
	writeObject(e, t, n, r, i, a, o, s = 1) {
		let c = this.asset(n);
		if (!c) return;
		let l = this.stampOf(c);
		if (l) {
			let n = c.facings[a % c.facings.length][0], u = c.feet ? ou(c, a)[0] !== ou(c, 0)[0] : !1;
			e.canopy(t, r, i, l, o, n?.flip === !0 || n?.mirrored === !0 || u, s);
		}
		let u = c.trunk;
		if (u && e.solid(t, r - u.radius * s, i - u.radius * s, r + u.radius * s, i + u.radius * s, u.meters * s, o), l || u || c.light || c.kind === "stairs" || c.kind === "decal") return;
		let [d, f] = ou(c, a);
		e.solid(t, r - d * s / 2, i - f * s / 2, r + d * s / 2, i + f * s / 2, c.meters * s, o);
	}
}, Mu = `${Xl}
uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tId;
uniform sampler2D tLight;
uniform sampler2D tDepth;
uniform vec3 uBackground;
uniform float uEmissive;
/** the floor being edited, and how much the floors below it fade */
uniform float uActiveFloor;
uniform float uDimBelow;
/** how wet things are, how much snow has settled, how thick the fog is, and the time */
uniform vec4 uAir;
uniform vec3 uFogColor;
uniform vec3 uSkyColor;
/** ids to outline: what is selected and what the pointer is over */
uniform float uSelected;
uniform float uHovered;
/** How much of each place is in view, seen from above, over the map. */
uniform sampler2D tVision;
/** whether the view is limited to that, and the size of the map in tiles */
uniform vec3 uVision;
/** how strong the grid on the ground is */
uniform float uGrid;
/** 0 final, 1 color, 2 normal, 3 height, 4 light, 5 id */
uniform int uDebug;
uniform vec4 uView;
uniform vec2 uBuffer;
uniform vec4 uDepth;
out vec4 fragColor;

const float BAYER[16] = float[16](
	0.0, 8.0, 2.0, 10.0,
	12.0, 4.0, 14.0, 6.0,
	3.0, 11.0, 1.0, 9.0,
	15.0, 7.0, 13.0, 5.0
);

float bayerAt(ivec2 ip) {
	return (BAYER[(ip.x & 3) + (ip.y & 3) * 4] + 0.5) / 16.0;
}

float hash2(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

float noise2(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);
}

/** The map under a pixel, at the height of what is drawn there. */
vec3 worldAt(float depth) {
	float sx = uView.x + gl_FragCoord.x / uBuffer.x * uView.z;
	float sy = uView.y + (1.0 - gl_FragCoord.y / uBuffer.y) * uView.w;
	float height = (mix(uDepth.y, uDepth.x, depth) - sy) / uDepth.z;
	float u = sx / 32.0;
	float v = (sy + height) / 16.0;
	return vec3((v + u) * 0.5, (v - u) * 0.5, height / 40.0);
}

/** Low mist that drifts: thicker near the ground, in steps, with the dither between them. */
vec3 throughFog(vec3 lit, vec3 p, ivec2 ip) {
	float t = uAir.w;
	float drift = noise2(p.xy * 0.09 + t * vec2(0.05, 0.02)) * 0.6 + noise2(p.xy * 0.23 - t * vec2(0.04, 0.03)) * 0.4;
	float low = clamp(1.0 - p.z / 5.0, 0.0, 1.0);
	float amount = uAir.z * (0.3 + 0.7 * drift) * (0.45 + 0.55 * low);
	return mix(lit, uFogColor, floor(amount * 6.0 + bayerAt(ip)) / 6.0);
}

/** The ring a drop leaves where it lands. Cells of the map take turns, so it costs nothing where nothing is landing. */
float splash(ivec2 art) {
	vec2 size = vec2(9.0, 5.0);
	vec2 cell = floor(vec2(art) / size);
	float beat = uAir.w * 1.7 + hash2(cell) * 7.0;
	float round_ = floor(beat);
	if (hash2(cell + round_) > uAir.x * 0.32) return 0.0;
	vec2 middle = vec2(hash2(cell + round_ + 1.0), hash2(cell + round_ + 2.0)) * (size - 2.0) + 1.0;
	vec2 d = (vec2(art) - cell * size - middle) * vec2(1.0, 2.0);
	float r = fract(beat) * 4.0;
	return abs(length(d) - r) < 0.6 ? 1.0 - fract(beat) : 0.0;
}

/** Whether a pixel of the ground is on a line of the grid: one pixel wide, on the edges of the tiles, stronger every 5. */
float gridAt(vec2 place) {
	vec2 near = abs(fract(place + 0.5) - 0.5);
	vec2 line = floor(place + 0.5);
	float x = near.x < 1.0 / 64.0 ? (mod(line.x, 5.0) < 0.5 ? 1.0 : 0.45) : 0.0;
	float y = near.y < 1.0 / 64.0 ? (mod(line.y, 5.0) < 0.5 ? 1.0 : 0.45) : 0.0;
	return max(x, y);
}

/** What people cannot see goes dark, in bands with the dither between them, and what they only remember loses its color. */
vec3 throughVision(vec3 lit, vec3 place, ivec2 ip) {
	vec2 at = place.xy / uVision.yz;
	float seen = texture(tVision, at).r;
	// something standing is seen from the ground next to it, on either side
	if (place.z > 0.1) {
		vec2 side = vec2(0.5) / uVision.yz;
		seen = max(seen, max(texture(tVision, at + side).r, texture(tVision, at - side).r));
		side.y = -side.y;
		seen = max(seen, max(texture(tVision, at + side).r, texture(tVision, at - side).r));
	}
	float bands = floor(seen * 8.0 + bayerAt(ip)) / 8.0;
	vec3 grey = vec3(dot(lit, vec3(0.3, 0.6, 0.1)));
	return mix(grey, lit, smoothstep(0.25, 0.5, bands)) * bands;
}

float idAt(ivec2 p) {
	vec3 v = floor(texelFetch(tId, p, 0).rgb * 255.0 + 0.5);
	return v.r + v.g * 256.0 + v.b * 65536.0;
}

/** Whether this pixel is just outside the shape with this id: an outline in art pixels, around what is really drawn. */
bool outlines(ivec2 p, float id) {
	if (id <= 0.0 || idAt(p) == id) return false;
	return idAt(p + ivec2(1, 0)) == id || idAt(p - ivec2(1, 0)) == id || idAt(p + ivec2(0, 1)) == id || idAt(p - ivec2(0, 1)) == id;
}

void main() {
	ivec2 ip = ivec2(gl_FragCoord.xy);
	if (outlines(ip, uSelected)) {
		fragColor = vec4(0.91, 0.82, 0.49, 1.0);
		return;
	}
	if (outlines(ip, uHovered)) {
		fragColor = vec4(0.91, 0.88, 0.8, 1.0);
		return;
	}
	float depth = texelFetch(tDepth, ip, 0).r;
	if (depth >= 1.0) {
		fragColor = vec4(uVision.x > 0.0 ? vec3(0.0) : uBackground, 1.0);
		return;
	}
	vec4 color = texelFetch(tColor, ip, 0);
	vec4 lightSample = texelFetch(tLight, ip, 0);
	vec3 light = lightSample.rgb * 2.0;
	float open = lightSample.a;
	vec3 surface = texelFetch(tNormal, ip, 0).xyz * 2.0 - 1.0;
	vec3 place = worldAt(depth);
	float up = smoothstep(0.45, 0.8, surface.z);
	bool water = texelFetch(tNormal, ip, 0).a * 128.0 >= 64.0;

	if (uAir.y > 0.0) {
		// Snow settles on what faces up and has the sky above it. It has edges: a thin fall leaves patches, a heavy one covers everything,
		// and only the rim of a patch is dithered.
		float depthOf = noise2(place.xy * 0.45) * 0.6 + noise2(place.xy * 1.7) * 0.4 + uAir.y * 1.35 - 0.62;
		// what is dark in the art shows through a little, so a roof under snow is still a roof
		float ink = dot(color.rgb, vec3(0.33)) < 0.2 ? 0.55 : 1.0;
		if (open * up * ink * clamp(depthOf * 7.0, 0.0, 1.0) > bayerAt(ip)) color = vec4(0.88, 0.91, 0.96, 0.0);
	}
	float puddle = 0.0;
	if (uAir.x > 0.0 && open > 0.5) {
		color.rgb *= 1.0 - 0.3 * uAir.x;
		// Water gathers on flat bare ground: grass drinks it, and a pond is water already.
		if (surface.z > 0.94 && !water && color.g <= color.r * 1.04) {
			float pool = noise2(place.xy * 0.8) * 0.65 + noise2(place.xy * 2.6) * 0.35;
			puddle = step(0.62 - 0.06 * uAir.x, pool) * uAir.x;
		}
	}

	// whatever glows here glows from a flame, so it is warmer than its own color
	vec3 lit = color.rgb * light + color.rgb * vec3(1.0, 0.8, 0.52) * color.a * uEmissive;
	if (puddle > 0.0) lit = mix(lit, uSkyColor * (0.5 + 0.5 * light), 0.4 * puddle);
	if (uAir.x > 0.0 && open > 0.5 && up > 0.5) lit += splash(ip + ivec2(uView.xy)) * 0.35 * (light + 0.1);
	if (uAir.z > 0.0) lit = throughFog(lit, place, ip);
	if (uDimBelow > 0.0 && mod(floor(texelFetch(tNormal, ip, 0).a * 128.0), 16.0) < uActiveFloor) lit = mix(lit, uBackground, uDimBelow);

	if (uGrid > 0.0 && place.z < 0.06) lit = mix(lit, vec3(0.92, 0.88, 0.76), gridAt(place.xy) * uGrid);
	if (uVision.x > 0.0) lit = throughVision(lit, place, ip);

	if (uDebug == 1) lit = color.rgb;
	else if (uDebug == 2) lit = texelFetch(tNormal, ip, 0).rgb;
	else if (uDebug == 3) {
		float sy = uView.y + (1.0 - gl_FragCoord.y / uBuffer.y) * uView.w;
		float height = (mix(uDepth.y, uDepth.x, depth) - sy) / uDepth.z;
		lit = vec3(fract(height / 120.0), height / 360.0, 0.25);
	} else if (uDebug == 4) lit = light * 0.5;
	else if (uDebug == 5) {
		vec3 id = texelFetch(tId, ip, 0).rgb;
		lit = fract(id * vec3(37.0, 91.0, 17.0));
	}
	fragColor = vec4(lit, 1.0);
}
`, Nu = `${Xl}
uniform sampler2D tFinal;
/** canvas pixels per buffer pixel, and how many canvas rows hang below the visible area */
uniform vec2 uPresent;
/** buffer pixels per canvas pixel when the frame was drawn larger than the canvas */
uniform int uAverage;
out vec4 fragColor;

void main() {
	if (uAverage > 1) {
		ivec2 first = ivec2(gl_FragCoord.xy) * uAverage;
		vec4 sum = vec4(0.0);
		for (int y = 0; y < uAverage; y++)
			for (int x = 0; x < uAverage; x++) sum += texelFetch(tFinal, first + ivec2(x, y), 0);
		fragColor = sum / float(uAverage * uAverage);
		return;
	}
	ivec2 ip = ivec2(floor((gl_FragCoord.xy + vec2(0.0, uPresent.y)) / uPresent.x));
	fragColor = texelFetch(tFinal, ip, 0);
}
`, Pu = `
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform sampler2DArray tOcclusion;
uniform vec4 uView;
uniform vec2 uBuffer;
uniform vec4 uDepth;
/** map size x and y in tiles, number of floors */
uniform vec3 uMap;
/** the part of the map the occlusion holds: its corner and its size, in tiles */
uniform vec4 uOcc;
/** ray step in meters, maximum number of steps */
uniform vec2 uRay;
/** height of a story in meters */
uniform float uStory;

const float HEIGHT_UNIT = ${(Hl * 255).toFixed(4)};
const float TEXELS = ${8 .toFixed(1)};

vec3 worldAt(vec2 frag, float depth) {
	float sx = uView.x + frag.x / uBuffer.x * uView.z;
	float sy = uView.y + (1.0 - frag.y / uBuffer.y) * uView.w;
	float near = mix(uDepth.y, uDepth.x, depth);
	float height = (near - sy) / uDepth.z;
	float u = sx / 32.0;
	float v = (sy + height) / 16.0;
	return vec3((v + u) * 0.5, (v - u) * 0.5, height / ${40 .toFixed(1)});
}

const float BAYER[16] = float[16](
	0.0, 8.0, 2.0, 10.0,
	12.0, 4.0, 14.0, 6.0,
	3.0, 11.0, 1.0, 9.0,
	15.0, 7.0, 13.0, 5.0
);

float bayerAt(ivec2 ip) {
	return (BAYER[(ip.x & 3) + (ip.y & 3) * 4] + 0.5) / 16.0;
}

float hash2(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

/** Smooth noise, for what has no edges: clouds and fog. */
float noise2(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);
}

/**
 * Where a ray takes its first look, in steps. It changes from pixel to pixel, because rays that all step in lockstep draw lines across a
 * shadow. Never less than half a step: closer than that, a wall would shade its own face.
 */
float rayPhase = 0.5;

/** Whether what hangs in the air counts for the point being tested. */
bool canopyBlocks = true;
/** How far along a ray that starts ignoring it, in meters. */
float canopyFrom = 0.0;

/** How far from itself a pixel starts to meet what hangs in the air: leaves never, and a body past its own size. */
void readBody(ivec2 ip) {
	float kind = mod(floor(texelFetch(tNormal, ip, 0).a * 128.0 / 16.0), 4.0);
	canopyFrom = kind == 1.0 ? 1e9 : kind == 2.0 ? 1.1 : 0.0;
	canopyBlocks = kind == 0.0;
}

bool blocked(vec3 p) {
	vec2 near = p.xy - uOcc.xy;
	if (near.x < 0.0 || near.y < 0.0 || near.x >= uOcc.z || near.y >= uOcc.w || p.z < 0.0) return false;
	float story = min(floor(p.z / uStory), uMap.z - 1.0);
	ivec2 spot = ivec2(int(near.x * TEXELS), int(near.y * TEXELS));
	vec4 cell = texelFetch(tOcclusion, ivec3(spot, int(story)), 0);
	float above = p.z - story * uStory;
	if (above < cell.r * HEIGHT_UNIT) return true;
	if (canopyBlocks && above >= cell.b * HEIGHT_UNIT && above < cell.a * HEIGHT_UNIT) return true;
	// A slab hangs below the floor plane of the story above: whoever stands on it does not count as inside it.
	if (above > uStory - 0.3 && story + 1.0 < uMap.z) return texelFetch(tOcclusion, ivec3(spot, int(story) + 1), 0).g > 0.5;
	return false;
}

/** Whether a treetop hangs over this spot. */
float underCanopy(vec2 xy, float z) {
	vec2 near = xy - uOcc.xy;
	if (near.x < 0.0 || near.y < 0.0 || near.x >= uOcc.z || near.y >= uOcc.w) return 0.0;
	float story = min(floor(z / uStory), uMap.z - 1.0);
	vec4 cell = texelFetch(tOcclusion, ivec3(ivec2(near * TEXELS), int(story)), 0);
	return cell.a * HEIGHT_UNIT > z - story * uStory ? 1.0 : 0.0;
}

float rayIsClear(vec3 from, vec3 to) {
	vec3 d = to - from;
	float len = length(d);
	float n = clamp(ceil(len / uRay.x), 2.0, uRay.y);
	vec3 inc = d / n;
	vec3 p = from + inc * rayPhase;
	float stride = len / n;
	float walked = stride * rayPhase;
	for (float i = 0.0; i < n; i += 1.0) {
		canopyBlocks = walked >= canopyFrom;
		if (blocked(p)) return 0.0;
		p += inc;
		walked += stride;
	}
	return 1.0;
}
`, Fu = `${Xl}
in vec3 position;
void main() {
	gl_Position = vec4(position.xy, 0.0, 1.0);
}
`, Iu = `${Xl}
${Pu}
uniform vec3 uAmbient;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uSunShadows;
uniform float uContact;
/** how much the clouds take from the sun, and how far they have drifted */
uniform vec3 uCloud;
/** whether anything needs to know what is under the open sky */
uniform float uOpenSky;
out vec4 fragColor;

/** Whether the sky can be seen straight up from here. Rain and snow fall only where it can. */
float skyOverhead(vec3 p) {
	for (float i = 1.0; i <= 9.0; i += 1.0) if (blocked(vec3(p.xy, p.z + i * 0.55))) return 0.0;
	return 1.0;
}

void main() {
	ivec2 ip = ivec2(gl_FragCoord.xy);
	float depth = texelFetch(tDepth, ip, 0).r;
	if (depth >= 1.0) {
		fragColor = vec4(0.5, 0.5, 0.5, 0.0);
		return;
	}
	vec3 p = worldAt(gl_FragCoord.xy, depth);
	vec3 n = texelFetch(tNormal, ip, 0).xyz * 2.0 - 1.0;
	vec3 start = p + n * 0.2;
	readBody(ip);
	float contact = canopyFrom;
	rayPhase = 0.5 + bayerAt(ip);

	float ao = 1.0;
	if (uContact > 0.5) {
		float near = 0.0;
		for (int i = 0; i < 4; i++) {
			vec2 o = vec2(i == 0 ? 0.4 : (i == 1 ? -0.4 : 0.0), i == 2 ? 0.4 : (i == 3 ? -0.4 : 0.0));
			if (blocked(vec3(start.xy + o, start.z + 0.06))) near += 1.0;
		}
		ao = 1.0 - near * 0.11;
		// The ground under a tree gets less of the sky at any hour, sun or no sun: this is what sits a tree on the map on a cloudy
		// day, when it casts no shadow of its own. Five spots, so the edge of the shade is not the edge of the stamp.
		if (contact == 0.0) {
			// measured a little above the surface: on a roof, each pixel would otherwise count as being under its own slope
			float over = p.z + 0.3;
			float cover = underCanopy(p.xy, over);
			for (int i = 0; i < 4; i++) {
				vec2 o = vec2(i == 0 ? 0.6 : (i == 1 ? -0.6 : 0.0), i == 2 ? 0.6 : (i == 3 ? -0.6 : 0.0));
				cover += underCanopy(p.xy + o, over);
			}
			ao *= 1.0 - cover / 5.0 * 0.42;
		}
	}

	float sun = max(0.0, dot(n, uSunDir));
	if (sun > 0.0 && uSunShadows > 0.5) {
		float reach = min(uRay.x * uRay.y, 14.0);
		sun *= rayIsClear(start, start + uSunDir * reach);
	}
	if (uCloud.x > 0.0 && sun > 0.0) {
		float mass = noise2(p.xy * 0.055 + uCloud.yz) * 0.7 + noise2(p.xy * 0.16 + uCloud.yz * 1.6) * 0.3;
		// a cloud has an edge: three steps of shade, with the dither between them
		float shade = floor(smoothstep(0.42, 0.62, mass) * 3.0 + bayerAt(ip)) / 3.0;
		sun *= 1.0 - shade * uCloud.x * 0.8;
	}
	// a body looks up from above itself, and leaves take what falls whatever is over them
	canopyBlocks = true;
	float open = uOpenSky > 0.5 && contact < 1e8 ? skyOverhead(start + vec3(0.0, 0.0, contact > 0.0 ? 1.6 : 0.0)) : 1.0;
	fragColor = vec4((uAmbient * ao + uSunColor * sun) * 0.5, open);
}
`, Lu = `${Xl}
in vec2 position;
in vec4 aLight;
in vec4 aColor;
in vec4 aSpot;

uniform vec4 uView;

flat out vec4 vLight;
flat out vec3 vColor;
flat out vec4 vSpot;

void main() {
	vec2 s = vec2((aLight.x - aLight.y) * 32.0, (aLight.x + aLight.y) * 16.0 - aLight.z * ${40 .toFixed(1)});
	vec2 p = s + (position * 2.0 - 1.0) * aLight.w * 46.0;
	vLight = aLight;
	vColor = aColor.rgb * aColor.a;
	vSpot = aSpot;
	gl_Position = vec4((p.x - uView.x) / uView.z * 2.0 - 1.0, 1.0 - (p.y - uView.y) / uView.w * 2.0, 0.0, 1.0);
}
`, Ru = `${Xl}
${Pu}
flat in vec4 vLight;
flat in vec3 vColor;
/** where a spot points, and the cosine of its opening; below -1 it shines all around */
flat in vec4 vSpot;
uniform float uShadows;
/** number of bands of a lamp's falloff; 0 turns them off */
uniform float uBands;
uniform float uDither;
out vec4 fragColor;

void main() {
	ivec2 ip = ivec2(gl_FragCoord.xy);
	float depth = texelFetch(tDepth, ip, 0).r;
	if (depth >= 1.0) discard;
	rayPhase = 0.5 + bayerAt(ip);

	vec3 p = worldAt(gl_FragCoord.xy, depth);
	vec3 toLight = vLight.xyz - p;
	float dist = length(toLight);
	if (dist >= vLight.w) discard;

	vec3 n = texelFetch(tNormal, ip, 0).xyz * 2.0 - 1.0;
	readBody(ip);
	float facing = (dot(n, toLight / dist) + 0.2) / 1.2;
	if (facing <= 0.0) discard;

	float falloff = 1.0 - (dist * dist) / (vLight.w * vLight.w);
	falloff *= falloff;
	if (vSpot.w > -1.5) {
		float inside = dot(-toLight / dist, vSpot.xyz);
		falloff *= smoothstep(vSpot.w, vSpot.w + (1.0 - vSpot.w) * 0.35, inside);
		if (falloff <= 0.0) discard;
	}
	float seen = uShadows > 0.5 ? rayIsClear(p + n * 0.2, vLight.xyz) : 1.0;
	if (seen <= 0.0) discard;

	// Bands belong to the gradient of a lamp, which is what betrays a smooth render on pixel art. They are even to the eye, not in
	// raw light, and the dither only widens the edge between two of them, locked to the art pixels.
	float amount = facing * falloff;
	if (uBands > 0.0) {
		float threshold = bayerAt(ip);
		float stepped = floor(sqrt(amount) * uBands + 0.5 + (threshold - 0.5) * uDither) / uBands;
		amount = stepped * stepped;
		if (amount <= 0.0) discard;
	}
	// alpha stays out of the sum: the pass before left there how much of the sky this pixel sees
	fragColor = vec4(vColor * amount * 0.5, 0.0);
}
`, zu = (e, t, n) => [
	e[0] + (t[0] - e[0]) * n,
	e[1] + (t[1] - e[1]) * n,
	e[2] + (t[2] - e[2]) * n
], Bu = (e) => Math.min(1, Math.max(0, e)), Vu = [
	.56,
	.58,
	.62
], Hu = [
	.34,
	.27,
	.32
], Uu = [
	.1,
	.13,
	.22
], Wu = [
	.56,
	.54,
	.5
], Gu = [
	.72,
	.38,
	.2
], Ku = [
	.09,
	.12,
	.2
];
function qu(e) {
	let t = (e % 24 + 24) % 24, n = (t - 6) / 12, r = n > 0 && n < 1, i = r ? Math.sin(n * Math.PI) : 0, a = Bu(i / .5), o = r ? Bu(1 - i / .16) * .55 : Bu(Math.min(Math.abs(t - 18), Math.abs(t - 6)) / 1.2) * .45 + .55;
	if (!r) return {
		ambient: Uu,
		sunColor: Ku,
		sunDir: Zu([
			-.45,
			.25,
			.86
		]),
		emissive: 1,
		background: [
			.02,
			.025,
			.05
		]
	};
	let s = Math.max(.12, i) * 1.05, c = (.9 - n * 1) * Math.PI, l = Zu([
		Math.cos(c) * Math.cos(s),
		Math.sin(c) * Math.cos(s) * .6 + .25,
		Math.sin(s)
	]);
	return {
		ambient: zu(Hu, Vu, a),
		sunColor: zu(Gu, Wu, a),
		sunDir: l,
		emissive: o,
		background: zu([
			.09,
			.07,
			.09
		], [
			.16,
			.2,
			.25
		], a)
	};
}
var Ju = (e, t) => [
	e[0] * t,
	e[1] * t,
	e[2] * t
], Yu = (e) => {
	let t = (e[0] + e[1] + e[2]) / 3;
	return [
		t,
		t,
		t
	];
};
function Xu(e, t = "clear", n = 1) {
	let r = qu(e), i = Bu(n), a = {
		...r,
		cloud: 0,
		wet: 0,
		snow: 0,
		fog: 0,
		fogColor: r.background,
		falling: 0
	};
	switch (t) {
		case "cloudy":
			a.cloud = i, a.sunColor = Ju(r.sunColor, 1 - .45 * i), a.ambient = zu(r.ambient, Yu(r.ambient), .5 * i), a.background = zu(r.background, Yu(r.background), i);
			break;
		case "rain":
			a.wet = i, a.cloud = .5 * i, a.falling = 1, a.sunColor = Ju(r.sunColor, 1 - .85 * i), a.ambient = Ju(zu(r.ambient, [
				.36,
				.42,
				.52
			], .6 * i), 1 - .18 * i), a.background = zu(r.background, Ju(Yu(r.background), .8), i);
			break;
		case "snow":
			a.snow = i, a.falling = 2, a.sunColor = Ju(r.sunColor, 1 - .6 * i), a.ambient = zu(r.ambient, Ju([
				.74,
				.78,
				.88
			], Math.max(r.ambient[1], .2) * 1.3), .7 * i), a.background = zu(r.background, [
				.3,
				.33,
				.38
			], .7 * i * (1 - r.emissive * .8));
			break;
		case "underground":
			a.sunColor = [
				0,
				0,
				0
			], a.ambient = Ju([
				.17,
				.15,
				.18
			], 1 - .75 * i), a.emissive = 1, a.background = [
				.012,
				.011,
				.016
			], a.fogColor = a.background;
			break;
		case "fog": a.fog = i, a.sunColor = Ju(r.sunColor, 1 - .7 * i), a.fogColor = zu([
			.72,
			.74,
			.76
		], [
			.07,
			.09,
			.14
		], r.emissive), a.background = zu(r.background, a.fogColor, i);
	}
	return a;
}
function Zu(e) {
	let t = Math.hypot(e[0], e[1], e[2]) || 1;
	return [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}
// ../engine/src/renderer.ts
var Qu = 256, $u = .3, ed = 5, td = 7, nd = `${Xl}
uniform sampler2D tDepth;
uniform ivec2 uAt;
uniform ivec2 uSize;
out vec4 fragColor;
void main() {
	ivec2 ip = uAt + ivec2(gl_FragCoord.xy);
	if (ip.x < 0 || ip.y < 0 || ip.x >= uSize.x || ip.y >= uSize.y) {
		fragColor = vec4(0.0);
		return;
	}
	float depth = texelFetch(tDepth, ip, 0).r;
	if (depth >= 1.0) {
		fragColor = vec4(0.0);
		return;
	}
	float d = floor(depth * 16777215.0 + 0.5);
	fragColor = vec4(mod(d, 256.0), mod(floor(d / 256.0), 256.0), floor(d / 65536.0), 255.0) / 255.0;
}
`, rd = class {
	gl;
	ext;
	pending = [];
	active = null;
	lastMs = null;
	constructor(e) {
		this.gl = e, this.ext = e.getExtension("EXT_disjoint_timer_query_webgl2");
	}
	begin() {
		!this.ext || this.pending.length > 8 || (this.active = this.gl.createQuery(), this.active && this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.active));
	}
	end() {
		if (this.ext) for (this.active &&= (this.gl.endQuery(this.ext.TIME_ELAPSED_EXT), this.pending.push(this.active), null); this.pending.length;) {
			let e = this.pending[0];
			if (!this.gl.getQueryParameter(e, this.gl.QUERY_RESULT_AVAILABLE)) break;
			this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) || (this.lastMs = this.gl.getQueryParameter(e, this.gl.QUERY_RESULT) / 1e6), this.gl.deleteQuery(e), this.pending.shift();
		}
	}
}, id = new pn();
id.setAttribute("position", new Zt(new Float32Array([
	-1,
	-1,
	0,
	3,
	-1,
	0,
	-1,
	3,
	0
]), 3));
var ad = new Zt(new Float32Array([
	0,
	0,
	1,
	0,
	0,
	1,
	1,
	1
]), 2), od = new Zt(new Uint16Array([
	0,
	1,
	2,
	2,
	1,
	3
]), 1), sd = (e) => {
	let t = new vt();
	t.matrixWorldAutoUpdate = !1;
	let n = new Vn(id, e);
	return n.frustumCulled = !1, t.add(n), t;
}, cd = (e, t) => new Fe(e, t, {
	minFilter: r,
	magFilter: r,
	format: m,
	type: o,
	depthBuffer: !1,
	generateMipmaps: !1
}), ld = class {
	canvas;
	maxSupersample = 2;
	three;
	gl;
	timer;
	camera = new Br();
	gbuffer;
	light;
	final;
	bufferW = 0;
	bufferH = 0;
	sprites = new vt();
	lights = new vt();
	particles = new vt();
	particleGeometry = new Kr();
	particleUniforms;
	ambientPass;
	compositePass;
	presentPass;
	uView = { value: new Ne() };
	uDepth = { value: new Ne() };
	uBuffer = { value: new W() };
	uMap = { value: new G() };
	uOcc = { value: new Ne() };
	uRay = { value: new W(.25, 32) };
	uStory = { value: 3 };
	tNormal = { value: null };
	tDepth = { value: null };
	tOcclusion = { value: null };
	tVision = { value: new Wn(/* @__PURE__ */ new Uint8Array(4), 1, 1, m) };
	tCut = { value: new Wn(/* @__PURE__ */ new Uint8Array(4), 1, 1, m) };
	uCut = { value: new G() };
	uCutAt = { value: new W() };
	gbufferUniforms;
	ambientUniforms;
	lightUniforms;
	compositeUniforms;
	presentUniforms;
	gbufferMaterial;
	roofMaterial;
	roofMesh = null;
	uRoofs = { value: new W(0, 1) };
	lightGeometry = new Kr();
	lightPosition = new Gn(new Float32Array(Qu * 4), 4);
	lightColor = new Gn(new Float32Array(Qu * 4), 4);
	lightSpot = new Gn(new Float32Array(Qu * 4), 4);
	chunkMeshes = /* @__PURE__ */ new Map();
	dynamicMesh = null;
	dynamicBuffer = null;
	dynamicGeometry = null;
	sceneLights = [];
	storyPx = 120;
	syncPixel = /* @__PURE__ */ new Uint8Array(4);
	probeTarget = null;
	probeAt = { value: new W() };
	probeSize = { value: new W() };
	probePass;
	constructor(e, t = {}) {
		this.canvas = e, this.three = new Ss({
			canvas: e,
			antialias: !1,
			alpha: !1,
			depth: !1,
			stencil: !1,
			powerPreference: t.lowPower ? "low-power" : "high-performance"
		}), this.three.autoClear = !1, this.three.sortObjects = !1, this.three.info.autoReset = !1, this.gl = this.three.getContext(), this.timer = new rd(this.gl), this.sprites.matrixWorldAutoUpdate = !1, this.lights.matrixWorldAutoUpdate = !1;
		let n = {
			tNormal: this.tNormal,
			tDepth: this.tDepth,
			tOcclusion: this.tOcclusion,
			uView: this.uView,
			uBuffer: this.uBuffer,
			uDepth: this.uDepth,
			uMap: this.uMap,
			uOcc: this.uOcc,
			uRay: this.uRay,
			uStory: this.uStory
		};
		this.gbufferUniforms = {
			uSprites: { value: null },
			uAlbedo: { value: null },
			uAux: { value: null },
			uView: this.uView,
			uDepth: this.uDepth,
			uBuffer: this.uBuffer,
			uWind: { value: new W() },
			tCut: this.tCut,
			uCut: this.uCut,
			uCutAt: this.uCutAt
		}, this.particleUniforms = {
			tDepth: this.tDepth,
			tLight: { value: null },
			uView: this.uView,
			uDepth: this.uDepth,
			uTime: { value: 0 },
			uWind: { value: new G() },
			uSky: { value: new W() },
			uAir: { value: new Ne() }
		}, this.particleGeometry.setAttribute("position", ad), this.particleGeometry.setIndex(od);
		let r = new Vn(this.particleGeometry, new mr({
			glslVersion: F,
			vertexShader: iu,
			fragmentShader: au,
			uniforms: this.particleUniforms,
			depthTest: !1,
			depthWrite: !1,
			transparent: !0,
			side: 2
		}));
		r.frustumCulled = !1, this.particles.matrixWorldAutoUpdate = !1, this.particles.add(r), this.gbufferMaterial = new mr({
			glslVersion: F,
			vertexShader: $l,
			fragmentShader: nu,
			uniforms: this.gbufferUniforms,
			depthTest: !0,
			depthWrite: !0,
			blending: 0,
			side: 2
		}), this.roofMaterial = new mr({
			glslVersion: F,
			vertexShader: eu,
			fragmentShader: tu,
			uniforms: {
				uSprites: this.gbufferUniforms.uSprites,
				uAlbedo: this.gbufferUniforms.uAlbedo,
				uAux: this.gbufferUniforms.uAux,
				uView: this.uView,
				uDepth: this.uDepth,
				uBuffer: this.uBuffer,
				uRoofs: this.uRoofs,
				tCut: this.tCut,
				uCut: this.uCut,
				uCutAt: this.uCutAt
			},
			depthTest: !0,
			depthWrite: !0,
			blending: 0,
			side: 2
		}), this.ambientUniforms = {
			...n,
			uAmbient: { value: new G() },
			uSunColor: { value: new G() },
			uSunDir: { value: new G() },
			uSunShadows: { value: 1 },
			uContact: { value: 1 },
			uCloud: { value: new G() },
			uOpenSky: { value: 0 }
		}, this.ambientPass = sd(new mr({
			glslVersion: F,
			vertexShader: Fu,
			fragmentShader: Iu,
			uniforms: this.ambientUniforms,
			depthTest: !1,
			depthWrite: !1,
			blending: 0
		})), this.lightPosition.setUsage(P), this.lightColor.setUsage(P), this.lightSpot.setUsage(P), this.lightGeometry.setAttribute("position", ad), this.lightGeometry.setIndex(od), this.lightGeometry.setAttribute("aLight", this.lightPosition), this.lightGeometry.setAttribute("aColor", this.lightColor), this.lightGeometry.setAttribute("aSpot", this.lightSpot), this.lightUniforms = {
			...n,
			uShadows: { value: 1 },
			uBands: { value: 8 },
			uDither: { value: .5 }
		};
		let i = new Vn(this.lightGeometry, new mr({
			glslVersion: F,
			vertexShader: Lu,
			fragmentShader: Ru,
			uniforms: this.lightUniforms,
			depthTest: !1,
			depthWrite: !1,
			transparent: !0,
			side: 2,
			blending: 5,
			blendEquation: 100,
			blendSrc: 201,
			blendDst: 201
		}));
		i.frustumCulled = !1, this.lights.add(i), this.compositeUniforms = {
			tColor: { value: null },
			tNormal: this.tNormal,
			tId: { value: null },
			tLight: { value: null },
			tDepth: this.tDepth,
			uBackground: { value: new G() },
			uEmissive: { value: 1 },
			uActiveFloor: { value: 0 },
			uDimBelow: { value: 0 },
			uAir: { value: new Ne() },
			uFogColor: { value: new G() },
			uSkyColor: { value: new G() },
			uSelected: { value: 0 },
			uHovered: { value: 0 },
			tVision: this.tVision,
			uVision: { value: new G() },
			uGrid: { value: 0 },
			uDebug: { value: 0 },
			uView: this.uView,
			uBuffer: this.uBuffer,
			uDepth: this.uDepth
		}, this.compositePass = sd(new mr({
			glslVersion: F,
			vertexShader: Fu,
			fragmentShader: Mu,
			uniforms: this.compositeUniforms,
			depthTest: !1,
			depthWrite: !1,
			blending: 0
		})), this.presentUniforms = {
			tFinal: { value: null },
			uPresent: { value: new W(1, 0) },
			uAverage: { value: 1 }
		}, this.presentPass = sd(new mr({
			glslVersion: F,
			vertexShader: Fu,
			fragmentShader: Nu,
			uniforms: this.presentUniforms,
			depthTest: !1,
			depthWrite: !1,
			blending: 0
		})), this.probePass = sd(new mr({
			glslVersion: F,
			vertexShader: Fu,
			fragmentShader: nd,
			uniforms: {
				tDepth: this.tDepth,
				uAt: this.probeAt,
				uSize: this.probeSize
			},
			depthTest: !1,
			depthWrite: !1,
			blending: 0
		}));
	}
	get rendererName() {
		let e = this.gl.getExtension("WEBGL_debug_renderer_info");
		return String(e ? this.gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : this.gl.getParameter(this.gl.RENDERER));
	}
	setAtlas(e) {
		this.gbufferUniforms.uSprites.value = e.table, this.gbufferUniforms.uAlbedo.value = e.albedo, this.gbufferUniforms.uAux.value = e.aux, this.three.initTexture(e.albedo), this.three.initTexture(e.aux), this.three.initTexture(e.table);
	}
	setWorld(e) {
		this.uMap.value.set(e.sizeX, e.sizeY, e.floors), this.uOcc.value.set(0, 0, e.sizeX, e.sizeY), this.uDepth.value.x = e.depthMin, this.uDepth.value.y = e.depthMax, this.uDepth.value.z = Ms, this.uStory.value = e.storyPx / 40, this.storyPx = e.storyPx;
	}
	setOcclusion(e) {
		let t = this.tOcclusion.value;
		t && t !== e && t.dispose(), this.tOcclusion.value = e;
	}
	setOcclusionWindow(e, t, n, r) {
		this.uOcc.value.set(e, t, n, r);
	}
	cutSize = "";
	refreshOcclusion(e) {
		let t = this.tOcclusion.value;
		if (t) {
			for (let n of e) t.addLayerUpdate(n);
			t.needsUpdate = !0;
		}
	}
	setLights(e) {
		this.sceneLights = e;
	}
	setChunk(e, t) {
		let n = this.chunkMeshes.get(e), r = t.count * 8;
		if (n && t.count <= n.capacity) {
			n.buffer.array.set(t.data.subarray(0, r)), n.buffer.needsUpdate = !0, n.mesh.geometry.instanceCount = t.count, n.chunk = t;
			return;
		}
		n && this.removeChunk(e);
		let i = Math.ceil(t.count * 1.5), a = new Float32Array(i * 8);
		a.set(t.data.subarray(0, r));
		let o = new Kr();
		o.setAttribute("position", ad), o.setIndex(od);
		let s = new li(a, 8, 1);
		s.setUsage(P), o.setAttribute("aWorld", new _n(s, 3, 0)), o.setAttribute("aMeta", new _n(s, 4, 3)), o.setAttribute("aScale", new _n(s, 1, 7)), o.instanceCount = t.count;
		let c = new Vn(o, this.gbufferMaterial);
		c.frustumCulled = !1, c.matrixAutoUpdate = !1, this.sprites.add(c), this.chunkMeshes.set(e, {
			chunk: t,
			mesh: c,
			buffer: s,
			capacity: i
		});
	}
	removeChunk(e) {
		let t = this.chunkMeshes.get(e);
		t && (this.sprites.remove(t.mesh), t.mesh.geometry.dispose(), this.chunkMeshes.delete(e));
	}
	clearChunks() {
		for (let e of [...this.chunkMeshes.keys()]) this.removeChunk(e);
	}
	setScene(e, t, n, r, i = 120) {
		this.clearChunks(), this.setAtlas(t), this.setOcclusion(n), this.setWorld({
			sizeX: e.sizeX,
			sizeY: e.sizeY,
			floors: e.floors,
			storyPx: i,
			depthMin: e.depthMin - 1,
			depthMax: e.depthMax + 1
		}), this.setLights(r);
		for (let [t, n] of e.chunks) this.setChunk(String(t), n);
	}
	setParticles(e) {
		let t = e.length / ed, n = new li(e, ed, 1);
		this.particleGeometry.setAttribute("aOrigin", new _n(n, 4, 0)), this.particleGeometry.setAttribute("aSeed", new _n(n, 1, 4)), this.particleGeometry.instanceCount = t;
	}
	setRoofs(e) {
		if (this.roofMesh &&= (this.sprites.remove(this.roofMesh), this.roofMesh.geometry.dispose(), null), !e.length) return;
		let t = new pn(), n = new mn(e, 11);
		t.setAttribute("position", new _n(n, 3, 0)), t.setAttribute("aUv", new _n(n, 2, 3)), t.setAttribute("aMeta", new _n(n, 3, 5)), t.setAttribute("aNormal", new _n(n, 3, 8));
		let r = new Vn(t, this.roofMaterial);
		r.frustumCulled = !1, r.matrixAutoUpdate = !1, this.sprites.add(r), this.roofMesh = r;
	}
	setCut(e, n) {
		if (this.uCut.value.set(+!!e, n?.wide ?? this.uMap.value.x, n?.deep ?? this.uMap.value.y), this.uCutAt.value.set(n?.x ?? 0, n?.y ?? 0), !e) return;
		let i = this.tCut.value, a = `${e.width}x${e.height}`;
		if (i instanceof $n && i.image === e && this.cutSize === a) {
			i.needsUpdate = !0;
			return;
		}
		this.cutSize = a, i.dispose();
		let o = new $n(e);
		o.minFilter = o.magFilter = r, o.wrapS = o.wrapT = t, o.generateMipmaps = !1, o.colorSpace = "", o.flipY = !1, this.tCut.value = o;
	}
	setVision(e) {
		let n = this.tVision.value;
		if (n instanceof $n && n.image === e) {
			n.needsUpdate = !0;
			return;
		}
		n.dispose();
		let r = new $n(e);
		r.minFilter = r.magFilter = i, r.wrapS = r.wrapT = t, r.generateMipmaps = !1, r.colorSpace = "", r.flipY = !1, this.tVision.value = r;
	}
	setDynamic(e, t) {
		if (!this.dynamicBuffer || this.dynamicBuffer.array !== e) {
			this.dynamicMesh && (this.sprites.remove(this.dynamicMesh), this.dynamicGeometry?.dispose());
			let t = new Kr();
			t.setAttribute("position", ad), t.setIndex(od);
			let n = new li(e, 8, 1);
			n.setUsage(P), t.setAttribute("aWorld", new _n(n, 3, 0)), t.setAttribute("aMeta", new _n(n, 4, 3)), t.setAttribute("aScale", new _n(n, 1, 7));
			let r = new Vn(t, this.gbufferMaterial);
			r.frustumCulled = !1, r.matrixAutoUpdate = !1, this.sprites.add(r), this.dynamicMesh = r, this.dynamicBuffer = n, this.dynamicGeometry = t;
		}
		this.dynamicGeometry.instanceCount = t, this.dynamicBuffer.needsUpdate = !0;
	}
	sizeBuffers(e, t) {
		(e !== this.bufferW || t !== this.bufferH) && (this.bufferW = e, this.bufferH = t, this.gbuffer ? (this.gbuffer.setSize(e, t), this.light.setSize(e, t), this.final.setSize(e, t)) : (this.gbuffer = new Fe(e, t, {
			count: 3,
			minFilter: r,
			magFilter: r,
			format: m,
			type: o,
			depthBuffer: !0,
			stencilBuffer: !1,
			generateMipmaps: !1
		}), this.gbuffer.depthTexture = new er(e, t, c), this.light = cd(e, t), this.final = cd(e, t)), this.tNormal.value = this.gbuffer.textures[1], this.tDepth.value = this.gbuffer.depthTexture, this.compositeUniforms.tColor.value = this.gbuffer.textures[0], this.compositeUniforms.tId.value = this.gbuffer.textures[2], this.compositeUniforms.tLight.value = this.light.texture, this.particleUniforms.tLight.value = this.light.texture, this.presentUniforms.tFinal.value = this.final.texture);
	}
	resize(e, t) {
		this.three.setPixelRatio(1), this.three.setSize(e, t, !1);
	}
	view(e) {
		let t = this.canvas.width, n = this.canvas.height, r = e.zoom >= 1 ? 1 : Math.min(this.maxSupersample, Math.round(1 / e.zoom)), i = e.zoom >= 1 ? Math.ceil(t / e.zoom) : t * r, a = e.zoom >= 1 ? Math.ceil(n / e.zoom) : n * r, o = e.zoom >= 1 ? i : t / e.zoom, s = e.zoom >= 1 ? a : n / e.zoom;
		return {
			bufferW: i,
			bufferH: a,
			viewW: o,
			viewH: s,
			extra: r,
			left: Math.floor(e.centerX - o / 2),
			top: Math.floor(e.centerY - s / 2)
		};
	}
	uploadLights(e, t, n, r, i, a) {
		let o = this.lightPosition.array, s = this.lightColor.array, c = this.lightSpot.array, l = 0;
		for (let u = 0; u < this.sceneLights.length && l < Math.min(Qu, e.maxLights); u++) {
			let d = this.sceneLights[u];
			if (d.floor > e.activeFloor && !e.showAbove) continue;
			let f = (d.x - d.y) * 32, p = (d.x + d.y) * 16 - d.z * 40, m = d.radius * 46;
			if (f + m < t || f - m > t + r || p + m < n || p - m > n + i) continue;
			let h = 1 + d.flicker * (Math.sin(e.time * 9 + u * 1.7) * .5 + Math.sin(e.time * 23 + u * 2.3) * .5);
			if (o.set([
				d.x,
				d.y,
				d.z,
				d.radius
			], l * 4), s.set([
				d.color[0],
				d.color[1],
				d.color[2],
				d.intensity * h * a
			], l * 4), d.target) {
				let e = [
					d.target[0] - d.x,
					d.target[1] - d.y,
					d.target[2] - d.z
				], t = Math.hypot(e[0], e[1], e[2]) || 1;
				c.set([
					e[0] / t,
					e[1] / t,
					e[2] / t,
					Math.cos(d.cone ?? .6)
				], l * 4);
			} else c[l * 4 + 3] = -2;
			l++;
		}
		return this.lightPosition.needsUpdate = !0, this.lightColor.needsUpdate = !0, this.lightSpot.needsUpdate = !0, this.lightGeometry.instanceCount = l, l;
	}
	render(e) {
		let t = this.three, { bufferW: n, bufferH: r, viewW: i, viewH: a, left: o, top: s, extra: c } = this.view(e);
		this.sizeBuffers(n, r), t.info.reset(), this.uView.value.set(o, s, i, a), this.uBuffer.value.set(n, r), this.uDepth.value.w = e.cutPx === null ? 1e6 : e.activeFloor * this.storyPx + e.cutPx, this.uRay.value.set(e.rayStep, e.maxSteps), this.gbufferUniforms.uWind.value.set(e.time, e.wind ?? 0), this.uRoofs.value.set(e.showAbove ? 99 : e.activeFloor, e.roofs === !1 ? 0 : 1), this.compositeUniforms.uSelected.value = e.selected ?? 0, this.compositeUniforms.uHovered.value = e.hovered ?? 0;
		let l = 0, u = 0;
		for (let { chunk: t, mesh: n } of this.chunkMeshes.values()) {
			let r = t.floor <= e.activeFloor || e.showAbove, c = t.x1 >= o && t.x0 <= o + i && t.y1 >= s && t.y0 <= s + a;
			n.visible = r && c, n.visible && (l += t.count, u++);
		}
		let d = Xu(e.hour, e.weather, e.strength), f = e.gale ?? 0;
		this.ambientUniforms.uAmbient.value.set(...d.ambient), this.ambientUniforms.uSunColor.value.set(...d.sunColor), this.ambientUniforms.uSunDir.value.set(...d.sunDir), this.ambientUniforms.uSunShadows.value = +!!e.sunShadows, this.ambientUniforms.uContact.value = +!!e.contact, this.lightUniforms.uShadows.value = +!!e.shadows, this.ambientUniforms.uCloud.value.set(d.cloud, e.time * .02 * (1 + f * 3), e.time * .012 * (1 + f * 3)), this.ambientUniforms.uOpenSky.value = +(d.wet > 0 || d.snow > 0), this.compositeUniforms.uAir.value.set(d.wet, d.snow, d.fog, e.time), this.compositeUniforms.uFogColor.value.set(...d.fogColor), this.compositeUniforms.uSkyColor.value.set(d.ambient[0] * .9, d.ambient[1] * .95, d.ambient[2]), this.particleUniforms.uTime.value = e.time, this.particleUniforms.uWind.value.set(-40 - f * 170, f, f), this.particleUniforms.uSky.value.set(d.falling, .15 + .85 * (e.strength ?? 1)), this.particleUniforms.uAir.value.set(d.ambient[0], d.ambient[1], d.ambient[2], d.emissive), this.compositeUniforms.uBackground.value.set(...d.background), this.compositeUniforms.uEmissive.value = d.emissive, this.lightUniforms.uBands.value = e.bands, this.lightUniforms.uDither.value = e.dither, this.compositeUniforms.uDebug.value = e.debug, this.compositeUniforms.uVision.value.set(+!!e.vision, this.uMap.value.x, this.uMap.value.y), this.compositeUniforms.uGrid.value = e.grid ?? 0, this.compositeUniforms.uActiveFloor.value = e.activeFloor, this.compositeUniforms.uDimBelow.value = e.dimBelow ?? 0;
		let p = this.uploadLights(e, o, s, i, a, Math.max($u, d.emissive)), m = e.zoom >= 1 ? e.zoom : 1;
		return this.presentUniforms.uPresent.value.set(m, r * m - this.canvas.height), this.presentUniforms.uAverage.value = c, this.timer.begin(), t.setRenderTarget(this.gbuffer), t.setClearColor(0, 0), t.clear(!0, !0, !1), t.render(this.sprites, this.camera), t.setRenderTarget(this.light), t.clear(!0, !1, !1), t.render(this.ambientPass, this.camera), p && t.render(this.lights, this.camera), t.setRenderTarget(this.final), t.render(this.compositePass, this.camera), e.particles !== !1 && this.particleGeometry.instanceCount > 0 && t.render(this.particles, this.camera), t.setRenderTarget(null), t.render(this.presentPass, this.camera), this.timer.end(), {
			drawCalls: t.info.render.calls,
			visibleInstances: l,
			visibleChunks: u,
			lightsDrawn: p,
			gpuMs: this.timer.lastMs
		};
	}
	waitForGpu() {
		this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.syncPixel);
	}
	async pick(e, t, n) {
		if (!this.gbuffer) return 0;
		let r = n >= 1 ? n : 1 / Math.min(this.maxSupersample, Math.round(1 / n)), i = Math.floor(e / r), a = this.bufferH - 1 - Math.floor(t / r);
		if (i < 0 || a < 0 || i >= this.bufferW || a >= this.bufferH) return 0;
		let o = /* @__PURE__ */ new Uint8Array(4);
		return await this.three.readRenderTargetPixelsAsync(this.gbuffer, i, a, 1, 1, o, void 0, 2), o[0] + o[1] * 256 + o[2] * 65536;
	}
	async surfaceNear(e, t, n) {
		if (!this.gbuffer) return [];
		let r = n >= 1 ? n : 1 / Math.min(this.maxSupersample, Math.round(1 / n)), [i, a] = [e / r, t / r], [o, s] = [Math.floor(i), Math.floor(a)], [c, l] = [this.bufferW, this.bufferH], u = this.uView.value.clone(), d = this.uDepth.value.clone();
		this.probeTarget ??= cd(td, td), this.probeAt.value.set(o - 3, l - 1 - s - 3), this.probeSize.value.set(c, l);
		let f = this.three, p = f.getRenderTarget();
		f.setRenderTarget(this.probeTarget), f.render(this.probePass, this.camera), f.setRenderTarget(p);
		let m = /* @__PURE__ */ new Uint8Array(196);
		await f.readRenderTargetPixelsAsync(this.probeTarget, 0, 0, td, td, m);
		let h = [];
		for (let e = 0; e < td; e++) for (let t = 0; t < td; t++) {
			let n = (e * td + t) * 4;
			if (m[n + 3] < 128) continue;
			let [r, f] = [t - 3, 3 - e], p = r === 0 && f === 0, g = u.x + (p ? i : o + r + .5) / c * u.z, _ = u.y + (p ? a : s + f + .5) / l * u.w, v = (m[n] + m[n + 1] * 256 + m[n + 2] * 65536) / 16777215, y = (d.y + (d.x - d.y) * v - _) / Ms, [b, x] = [g / 32, (_ + y) / 16];
			h.push({
				x: (x + b) / 2,
				y: (x - b) / 2,
				height: y,
				off: Math.hypot(r, f)
			});
		}
		return h.sort((e, t) => e.off - t.off);
	}
	async capture(e, t, n, r, i, a = 1) {
		(this.canvas.width !== r || this.canvas.height !== i) && this.resize(r, i), this.maxSupersample = 1, this.render({
			...e,
			centerX: t + r / a / 2,
			centerY: n + i / a / 2,
			zoom: a
		});
		let o = new Uint8Array(r * i * 4), s = new Uint8Array(r * i * 4);
		return await this.three.readRenderTargetPixelsAsync(this.final, 0, 0, r, i, o), await this.three.readRenderTargetPixelsAsync(this.gbuffer, 0, 0, r, i, s, void 0, 2), {
			color: ud(o, r, i),
			ids: ud(s, r, i)
		};
	}
	dispose() {
		this.three.dispose(), this.three.forceContextLoss();
	}
};
function ud(e, t, n) {
	let r = new Uint8Array(e.length), i = t * 4;
	for (let t = 0; t < n; t++) r.set(e.subarray((n - 1 - t) * i, (n - t) * i), t * i);
	return r;
}
// ../export/src/mesa.ts
var dd = (e) => Math.round(e * 100) / 100, fd = (e) => (e?.meters ?? 2.4) < 1.2, pd = (e) => new Map((e.objects ?? []).map((e) => [e.id, e])), md = (e, t) => e.towers?.find((e) => e.id === t), hd = (e, t = 1) => e.kind === "prop" && !e.open && e.meters * t >= 2 && e.foot[0] * e.foot[1] * t * t >= 4, gd = (e, t) => {
	let [n, r] = ou(t, e.facing).map((t) => t * (e.scale ?? 1));
	return [
		e.x - n / 2,
		e.y - r / 2,
		e.x + n / 2,
		e.y + r / 2
	];
};
function _d(e, t, n) {
	let r = pd(n), i = [];
	for (let a of e.meta.floors[t].layers) if (a.visible) {
		if (a.kind === "objects") for (let e of a.items) {
			let t = r.get(e.asset);
			t && hd(t, e.scale) && i.push({ box: gd(e, t) });
		}
		if (a.kind === "roofs") for (let e of a.items) {
			let r = e.shape === "round";
			r && md(n, e.material)?.open !== void 0 || i.push({
				box: [
					e.x,
					e.y,
					e.x + e.wide,
					e.y + e.deep
				],
				...r ? { round: r } : {},
				roof: e.id,
				floor: t
			});
		}
	}
	return i;
}
function vd(e, t) {
	for (let [n, r, i] of e.filled()) {
		let e = Math.sqrt(i.length);
		for (let a = 0; a < e; a++) for (let o = 0; o < e; o++) {
			let s = i[a * e + o];
			s && t(n * e + o, r * e + a, s);
		}
	}
}
function yd(e) {
	let t = [], n = /* @__PURE__ */ new Map();
	for (let r of [...e].sort((e, t) => e[4] - t[4] || e[1] - t[1] || e[0] - t[0] || e[3] - t[3] || e[2] - t[2])) {
		let e = r[1] === r[3] ? "x" : r[0] === r[2] ? "y" : "", i = e === "x" ? `x${r[1]}:${r[4]}` : e === "y" ? `y${r[0]}:${r[4]}` : "", a = i ? n.get(i) : void 0, o = r[4] >= 1 && r[4] <= 3, s = !a || !o || a[2] - a[0] + a[3] - a[1] < xd;
		if (a && s && e === "x" && a[2] === r[0]) a[2] = r[2];
		else if (a && s && e === "y" && a[3] === r[1]) a[3] = r[3];
		else {
			let e = [
				r[0],
				r[1],
				r[2],
				r[3],
				r[4]
			];
			t.push(e), i && n.set(i, e);
		}
	}
	return t;
}
var bd = 16, xd = 2;
function Sd(e) {
	let { x: t, y: n } = e.meta.size, r = e.meta.floors[0].layers.filter((e) => e.visible), i = (t) => r.flatMap((n) => n.kind === t && e.grids.get(n.id) ? [e.grids.get(n.id)] : []), [a, o, s] = [
		r.filter((e) => e.kind === "terrain"),
		i("tiles"),
		i("walls")
	], c = (e, t) => [
		[e, t],
		[e + 1, t],
		[e, t + 1],
		[e + 1, t + 1]
	], l = (t, n) => o.some((e) => e.get(t, n)) ? !0 : a.some((r, i) => {
		let a = e.grids.get(r.id);
		return !!a && (i === 0 ? c(t, n).every(([e, t]) => a.get(e, t)) : c(t, n).some(([e, t]) => a.get(e, t)));
	}), u = a[0] && e.grids.get(a[0].id);
	if (u && a[0].kind === "terrain" && Array.from({ length: Math.ceil((n + 1) / 32) }).every((e, r) => Array.from({ length: Math.ceil((t + 1) / 32) }).every((e, i) => {
		let a = u.chunk(i, r);
		if (!a) return !1;
		for (let e = 0; e < 32; e++) for (let o = 0; o < 32; o++) if (!a[e * 32 + o] && i * 32 + o <= t && r * 32 + e <= n) return !1;
		return !0;
	}))) return [];
	let d = [];
	for (let e = 0; e < n; e++) for (let n = 0; n < t; n++) {
		let t = l(n, e);
		e > 0 && t !== l(n, e - 1) && !s.some((t) => wc(t.get(n, e))) && d.push([
			n,
			e,
			n + 1,
			e,
			0
		]), n > 0 && t !== l(n - 1, e) && !s.some((t) => Tc(t.get(n, e))) && d.push([
			n,
			e,
			n,
			e + 1,
			0
		]);
	}
	return d;
}
var Cd = 999;
function wd(e, t, n) {
	let r = pd(n), i = /* @__PURE__ */ new Map(), a = (e, t) => {
		let n = dd(e);
		i.set(n, [...i.get(n) ?? [], t]);
	}, o = n.walls?.meters ?? 2.4, s = (t, r) => {
		let i = Tu(e, n, r);
		return t === 1 ? fd(i) && !i?.rim ? 4 : 0 : t === 2 || t === 3 ? 1 : t === 5 || t === 6 ? 2 : t === 4 ? 4 : null;
	}, c = (t) => {
		let r = Tu(e, n, t);
		return r?.rim ? o : r?.meters ?? o;
	};
	if (t === 0) for (let t of Sd(e)) a(Cd, t);
	for (let i of e.meta.floors[t].layers) if (i.visible) {
		if (i.kind === "walls") {
			let t = e.grids.get(i.id);
			if (!t) continue;
			vd(t, (e, t, n) => {
				let r = wc(n), i = Tc(n), o = r === 0 ? null : s(r, Ec(n)), l = i === 0 ? null : s(i, Dc(n));
				o !== null && a(c(Ec(n)), [
					e,
					t,
					e + 1,
					t,
					o
				]), l !== null && a(c(Dc(n)), [
					e,
					t,
					e,
					t + 1,
					l
				]);
			});
		}
		if (i.kind === "objects") for (let e of i.items) {
			let t = r.get(e.asset);
			if (!t || !hd(t, e.scale)) continue;
			let [n, i, o, s] = gd(e, t).map(dd);
			for (let e of [
				[
					n,
					i,
					o,
					i,
					0
				],
				[
					o,
					i,
					o,
					s,
					0
				],
				[
					n,
					s,
					o,
					s,
					0
				],
				[
					n,
					i,
					n,
					s,
					0
				]
			]) a(t.meters, e);
		}
		if (i.kind === "roofs") for (let e of i.items) {
			if (e.shape !== "round") continue;
			let t = md(n, e.material);
			if (!t || t.open && !t.rings.some((e) => e.inside)) continue;
			let [r, i] = [e.wide / 2, e.deep / 2], o = (t) => {
				let n = t / bd * Math.PI * 2;
				return [dd(e.x + r + Math.cos(n) * r), dd(e.y + i + Math.sin(n) * i)];
			}, s = Math.max(...t.rings.flatMap((e) => [e.from[1], e.to[1]]), 0);
			for (let e = 0; e < bd; e++) a(s, [
				...o(e),
				...o(e + 1),
				0
			]);
		}
	}
	return [...i].flatMap(([e, t]) => yd(t).map((t) => ({
		wall: t,
		top: e
	})));
}
function Td(e, t) {
	let { x: n, y: r } = e.meta.size, i = e.meta.floors[t].layers.flatMap((t) => t.kind === "walls" && t.visible && e.grids.get(t.id) ? [e.grids.get(t.id)] : []), a = (n + 1) * (r + 1), o = new Uint8Array(a), s = new Uint8Array(a);
	for (let e of i) vd(e, (e, t, i) => {
		e > n || t > r || (wc(i) !== 0 && (o[t * (n + 1) + e] = 1), Tc(i) !== 0 && (s[t * (n + 1) + e] = 1));
	});
	let c = (e, t) => o[t * (n + 1) + e] === 1, l = (e, t) => s[t * (n + 1) + e] === 1, u = new Int32Array(n * r).fill(-1), d = (e, t, i) => {
		let a = [t * n + e];
		u[t * n + e] = i;
		let o = (e, t) => {
			let r = t * n + e;
			u[r] === -1 && (u[r] = i, a.push(r));
		};
		for (; a.length;) {
			let e = a.pop(), [t, i] = [e % n, Math.floor(e / n)];
			t > 0 && !l(t, i) && o(t - 1, i), t + 1 < n && !l(t + 1, i) && o(t + 1, i), i > 0 && !c(t, i) && o(t, i - 1), i + 1 < r && !c(t, i + 1) && o(t, i + 1);
		}
	};
	for (let e = 0; e < n; e++) u[e] === -1 && d(e, 0, 0), u[(r - 1) * n + e] === -1 && d(e, r - 1, 0);
	for (let e = 0; e < r; e++) u[e * n] === -1 && d(0, e, 0), u[e * n + n - 1] === -1 && d(n - 1, e, 0);
	let f = 1;
	for (let e = 0; e < u.length; e++) u[e] === -1 && d(e % n, Math.floor(e / n), f++);
	let p = Array.from({ length: f }, (e, t) => t), m = (e) => p[e] === e ? e : p[e] = m(p[e]);
	for (let e = 0; e < r; e++) for (let t = 0; t < n; t++) {
		let i = u[e * n + t];
		if (i) for (let a of [t + 1 < n ? u[e * n + t + 1] : 0, e + 1 < r ? u[(e + 1) * n + t] : 0]) a && i !== a && (p[m(i)] = m(a));
	}
	return u.map((e) => e ? m(e) : 0);
}
// src/index.ts
var Ed = 44, Dd = 2, Od = .45, kd = 30, Ad = 60, jd = 1.2, Md = 1, Nd = 180, Pd = 4, Fd = 2048, Id = 3, Ld = .25, Rd = .25, zd = 1.5, Bd = 24, Vd = 40, Hd = class e {
	canvas;
	renderer;
	atlas;
	view;
	pack;
	map;
	air;
	look = {
		roofs: !0,
		cut: !1,
		grid: 0,
		above: !1
	};
	quality;
	floor = 0;
	vision = !1;
	camera = {
		left: 0,
		top: 0,
		zoom: 1
	};
	figures = /* @__PURE__ */ new Float32Array(512);
	frame = 0;
	last = 0;
	urgent = !0;
	running = !1;
	measured = [];
	houses = [];
	allBodies = null;
	openRoofs = /* @__PURE__ */ new Set();
	cutCanvas = null;
	cutKey = "";
	doorKey = "";
	onQuality = null;
	constructor(e, t, n, r, i, a, o) {
		this.canvas = e, this.renderer = t, this.atlas = n, this.view = r, this.pack = i, this.map = a;
		let { hour: s, weather: c, strength: l, wind: u } = a.meta.environment;
		this.air = {
			hour: s,
			weather: c ?? "clear",
			strength: l ?? .7,
			wind: u ?? .3
		}, this.quality = o;
	}
	static async open(t, n, r, i = {}) {
		let a = new ld(t);
		try {
			let o = new Es(), s = await su(r, o), c = new ju(a, s, o, o.textures({ live: !0 })), l = Ic(n);
			c.show(l);
			let u = new e(t, a, o, c, s, l, i.quality ?? "high");
			return u.floor = Math.min(i.floor ?? 0, l.meta.floors.length - 1), u;
		} catch (e) {
			throw a.dispose(), e;
		}
	}
	get size() {
		return this.map.meta.size;
	}
	bodies() {
		return this.map.meta.floors.flatMap((e, t) => _d(this.map, t, this.pack.manifest));
	}
	standingBodies() {
		this.allBodies ??= this.bodies();
		let { roofs: e, cut: t, above: n } = this.look;
		return this.allBodies.filter((r) => r.roof === void 0 || e && !t && (n || r.floor <= this.floor) && !this.openRoofs.has(`${r.floor}:${r.roof}`));
	}
	levelsAt(e, t) {
		return this.view.levelsAt(e, t);
	}
	get storyMeters() {
		return Cc(this.map.meta.grid) / 40;
	}
	storyAt(e) {
		return Math.max(0, Math.floor((e + .01) / this.storyMeters));
	}
	floorAt(e) {
		return Math.min(this.map.meta.floors.length - 1, this.storyAt(e));
	}
	roofsOver(e, t) {
		let { x: n, y: r } = this.map.meta.size, i = this.houses[e], a = (e) => {
			for (let a = Math.max(0, e.y); a < Math.min(r, e.y + e.deep); a++) for (let r = Math.max(0, e.x); r < Math.min(n, e.x + e.wide); r++) if (i[a * n + r] === t) return !0;
			return !1;
		};
		return this.map.meta.floors.flatMap((t, n) => n < e ? [] : t.layers.flatMap((e) => e.kind === "roofs" && e.visible ? e.items.filter(a).map((e) => ({
			...e,
			floor: n
		})) : []));
	}
	wallsFor(e) {
		let t = e + zd;
		return this.map.meta.floors.flatMap((n, r) => {
			if (r > this.floorAt(e)) return [];
			let i = r * this.storyMeters;
			return wd(this.map, r, this.pack.manifest).flatMap((e) => i + e.top > t ? [e.wall] : []);
		});
	}
	setInside(e) {
		let { x: t, y: n } = this.map.meta.size, r = this.storyMeters, i = /* @__PURE__ */ new Map();
		for (let n of e) {
			let e = this.storyAt(n.z);
			if (e >= this.map.meta.floors.length) continue;
			let r = (this.houses[e] ??= Td(this.map, e))[Math.floor(n.y) * t + Math.floor(n.x)] ?? 0;
			if (!r) continue;
			let a = `${e}:${r}`, o = i.get(a);
			(!o || n.z < o.meters) && i.set(a, {
				floor: e,
				house: r,
				meters: n.z
			});
		}
		let a = [...i].map(([e, t]) => `${e}:${t.meters}`).join("|");
		if (a === this.cutKey) return;
		if (this.cutKey = a, this.openRoofs.clear(), !i.size) {
			this.renderer.setCut(null), this.urgent = !0;
			return;
		}
		let o = [...i.values()].sort((e, t) => t.meters - e.meters), [s, c, l, u] = [
			t,
			n,
			0,
			0
		];
		for (let { floor: e, house: r } of o) {
			let i = this.houses[e];
			for (let e = 0; e < n; e++) for (let n = 0; n < t; n++) i[e * t + n] === r && (s = Math.min(s, n), c = Math.min(c, e), l = Math.max(l, n + 1), u = Math.max(u, e + 1));
			for (let t of this.roofsOver(e, r)) s = Math.min(s, t.x), c = Math.min(c, t.y), l = Math.max(l, t.x + t.wide), u = Math.max(u, t.y + t.deep);
		}
		let d = {
			x: Math.max(0, s - Id),
			y: Math.max(0, c - Id),
			wide: 0,
			deep: 0
		};
		d.wide = Math.min(t, l + Id) - d.x, d.deep = Math.min(n, u + Id) - d.y;
		let f = Math.max(1, Math.min(Pd, Math.floor(Fd / Math.max(d.wide, d.deep)))), p = this.cutCanvas ??= document.createElement("canvas");
		p.width = d.wide * f, p.height = d.deep * f;
		let m = p.getContext("2d");
		m.setTransform(f, 0, 0, f, -d.x * f, -d.y * f), m.globalCompositeOperation = "source-over", m.fillStyle = "#000", m.fillRect(d.x, d.y, d.wide, d.deep);
		let h = (e) => `rgb(${Math.max(1, Math.round(e / Ql * 255))} 0 0)`;
		for (let e of ["around", "inside"]) for (let { floor: i, house: a, meters: s } of o) {
			let o = this.houses[i];
			m.fillStyle = h(e === "around" ? (i + 1) * r * 40 : s * 40 + Ed);
			let c = e === "around" ? Rd : 1 / f;
			if (e === "around") for (let e of this.roofsOver(i, a)) this.openRoofs.add(`${e.floor}:${e.id}`), m.fillRect(e.x - Lc - c, e.y - Lc - c, e.wide + (Lc + c) * 2, e.deep + (Lc + c) * 2);
			for (let r = 0; r < n; r++) for (let n = 0; n < t; n++) o[r * t + n] === a && (e === "around" ? m.fillRect(n - c, r - c, 1 + c * 2, 1 + c * 2) : m.fillRect(n + c, r + c, 1, 1));
		}
		this.renderer.setCut(p, d), this.urgent = !0;
	}
	setDoors(e) {
		let t = e.map((e) => `${e.x0},${e.y0},${e.x1},${e.y1},${e.open}`).join("|");
		if (t === this.doorKey) return;
		this.doorKey = t;
		let n = this.map.meta.floors[this.floor].layers.flatMap((e) => e.kind === "walls" && this.map.grids.get(e.id) ? [this.map.grids.get(e.id)] : []), r = /* @__PURE__ */ new Set();
		for (let t of e) {
			let e = t.y0 === t.y1, i = Math.abs(e ? t.x1 - t.x0 : t.y1 - t.y0), [a, o] = [Math.min(t.x0, t.x1), Math.min(t.y0, t.y1)];
			for (let s = 0; s < i; s++) {
				let [i, c] = e ? [a + s, o] : [a, o + s];
				for (let a of n) {
					let n = a.get(i, c), o = e ? wc(n) : Tc(n), s = o === 2 || o === 5 ? "a" : o === 3 || o === 6 ? "b" : null;
					if (!s) continue;
					let l = s === "a" ? t.open ? 5 : 2 : t.open ? 6 : 3;
					if (l !== o) {
						a.set(i, c, e ? Oc(n, l) : kc(n, l));
						for (let [e, t] of [[i, c], [i - 1, c - 1]]) r.add(`${this.floor}:${Math.floor(Math.max(0, e) / 32)}:${Math.floor(Math.max(0, t) / 32)}`);
					}
				}
			}
		}
		r.size && (this.view.update(this.map, r), this.view.settle(this.map), this.urgent = !0);
	}
	setAir(e) {
		this.air = {
			...this.air,
			...e
		};
	}
	setLook(e) {
		this.look = {
			...this.look,
			...e
		};
	}
	setQuality(e) {
		this.quality = e;
	}
	setCamera({ left: e, top: t, zoom: n, width: r, height: i }, a = window.devicePixelRatio || 1) {
		let o = Math.ceil(n) + 1, s = Math.ceil((r + o) * a), c = Math.ceil((i + o) * a);
		(this.canvas.width !== s || this.canvas.height !== c) && this.renderer.resize(s, c), this.canvas.style.width = `${s / a}px`, this.canvas.style.height = `${c / a}px`;
		let [l, u] = [Math.floor(e), Math.floor(t)];
		this.canvas.style.transform = `translate(${(l - e) * n}px, ${(u - t) * n}px)`, this.camera = {
			left: l,
			top: u,
			zoom: n * a
		}, this.urgent = !0;
	}
	addFigure({ w: e, h: t, ax: n, ay: r, pixels: i }, a = "figure") {
		let o = new Uint8Array(e * t * 4), s = new Uint8Array(e * t * 4);
		for (let n = 0; n < t; n++) for (let t = 0; t < e; t++) {
			let a = (n * e + t) * 4;
			i[a + 3] < 128 || (o.set(i.subarray(a, a + 3), a), o[a + 3] = 255, s.set([
				128,
				128,
				Math.max(0, Math.min(255, r - n)),
				0
			], a));
		}
		return this.atlas.addLive({
			name: a,
			w: e,
			h: t,
			ax: n,
			ay: r,
			albedo: o,
			aux: s
		});
	}
	clearFigures() {
		this.atlas.clearLive(), this.setFigures([]);
	}
	setFigures(e) {
		let t = e.length * 8;
		t > this.figures.length && (this.figures = new Float32Array(t * 2)), e.forEach((e, t) => {
			let n = t * 8;
			this.figures[n] = e.x, this.figures[n + 1] = e.y, this.figures[n + 2] = e.z ?? 0, this.figures[n + 3] = e.sprite, this.figures[n + 4] = 2 | cu(this.floor) | !!e.flip, this.figures[n + 5] = e.flat ? Md : (e.z ?? 0) > 0 ? Nd : jd, this.figures[n + 6] = 0;
		}), this.renderer.setDynamic(this.figures, e.length), this.urgent = !0;
	}
	setVision(e) {
		this.vision = e !== null, e && this.renderer.setVision(e), this.urgent = !0;
	}
	start() {
		this.running || (this.running = !0, this.frame = requestAnimationFrame(this.tick));
	}
	stop() {
		this.running = !1, cancelAnimationFrame(this.frame);
	}
	dispose() {
		this.stop(), this.renderer.dispose();
	}
	tick = (e) => {
		if (!this.running) return;
		this.frame = requestAnimationFrame(this.tick);
		let t = 1e3 / (this.urgent ? Ad : kd) - 1;
		if (e - this.last < t) return;
		this.last = e, this.urgent = !1;
		let n = this.params(e);
		this.view.follow(this.map, (n.centerY / 16 + n.centerX / 32) / 2, (n.centerY / 16 - n.centerX / 32) / 2);
		let r = this.renderer.render(n);
		this.watch(r.gpuMs);
	};
	watch(e) {
		if (e === null || this.quality === "low" || (this.measured.push(e), this.measured.length < Vd)) return;
		let t = this.measured.reduce((e, t) => e + t, 0) / this.measured.length;
		this.measured = [], t > Bd && (this.quality = "low", this.onQuality?.("low"));
	}
	params(e) {
		let { left: t, top: n, zoom: r } = this.camera, i = r < Ld, a = this.quality === "high" && !i;
		this.renderer.maxSupersample = a ? 2 : 1;
		let { viewW: o, viewH: s } = this.renderer.view({
			centerX: 0,
			centerY: 0,
			zoom: r
		});
		return {
			centerX: t + o / 2 + 1e-6,
			centerY: n + s / 2 + 1e-6,
			zoom: r,
			activeFloor: this.floor,
			showAbove: this.look.above,
			cutPx: this.look.cut ? Ed : null,
			hour: this.air.hour,
			shadows: a,
			sunShadows: !i,
			contact: a,
			bands: 8,
			dither: .5,
			rayStep: a ? .25 : .5,
			maxSteps: a ? 32 : 14,
			maxLights: a ? 64 : 16,
			debug: 0,
			time: e / 1e3,
			dimBelow: this.floor > 0 && !this.look.above ? Od : 0,
			wind: Dd * (.5 + this.air.wind * 2.5),
			weather: this.air.weather,
			strength: this.air.strength,
			gale: this.air.wind,
			roofs: this.look.roofs,
			vision: this.vision,
			grid: this.look.grid
		};
	}
};
export { Hd as MapPlayer };
