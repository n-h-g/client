export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static isEqual(p1: Point, p2: Point): boolean {
        return p1.x == p2.x && p1.y == p2.y;
    }

    static add(p1: Point, p2: Point): Point {
        return new Point(p1.x + p2.y, p1.x + p2.y);
    }

    static diff(p1: Point, p2: Point): Point {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }
}
