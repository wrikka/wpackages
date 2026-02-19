import { EllipticCurve, ECPoint } from "./elliptic-curve";

const curve = new EllipticCurve(2, 3, 97);

const p1 = new ECPoint(3, 6);
const p2 = new ECPoint(10, 7);

const sum = curve.add(p1, p2);
console.log("P1 + P2:", sum);

const p3 = new ECPoint(3, 6);
const multiplied = curve.multiply(p3, 2);
console.log("2 * P1:", multiplied);
