export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    Copy(v1) {
        this.x = v1.x;
        this.y = v1.y;
    }
    Clone() {
        return new Vector(this.x, this.y);
    }
    Add(v1) {
        this.x += v1.x;
        this.y += v1.y;
        return this;
    }
    Sub(v1) {
        this.x -= v1.x;
        this.y -= v1.y;
        return this;
    }
    Mult(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    Norm() {
        [this.x, this.y] = [this.y, -this.x];
        return this;
    }
    Unit() {
        const z = this.Mag();
        if(z === 0) {
            return this;
        }
        this.x /= z;
        this.y /= z;
        return this;
    }
    Mag() {
        return Math.hypot(this.x, this.y);
    }
    Lerp(v1, alpha) {
        this.Add(v1.Clone().Sub(this).Mult(alpha));
        return this;
    }
    Angle() {
        return Math.atan2(this.y, this.x);
    }
    static Dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static Dist(v1, v2) {
        return Math.hypot(v1.x - v2.x, v1.y - v2.y);
    }
    static AngleBetween(v1, v2) {
        const z1 = v1.Mag();
        const z2 = v2.Mag();
        if(z1 === 0 || z2 === 0) {
            return 0;
        }
        return Math.acos(Vector.Dot(v1, v2) / (z1 * z2));
    }
}