export class Point3d {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static isEqual(p1: Point3d, p2: Point3d): boolean {
        return (
            p1.x == p2.x &&
            p1.y == p2.y &&
            p1.z == p2.z
        );
    }

    static add(p1: Point3d, p2: Point3d): Point3d {
        return new Point3d(
            p1.x + p2.x,
            p1.y + p2.y,
            p1.z + p2.z
        );
    }

    static diff(p1: Point3d, p2: Point3d): Point3d {
        return new Point3d(
            p1.x - p2.x,
            p1.y - p2.y,
            p1.z - p2.z
        );
    }
}
