import Point3d from "../point/Point3d";

export default class Node3d {
    protected position: Point3d;
    protected trasformedlocation: Point3d;
    protected height: number;
    protected width: number;

    public constructor(height: number, width: number, point: Point3d) {
        this.position = point;

        this.height = height;
        this.width = width

        this.trasformedlocation = new Point3d(0, 0, 0);
    }

    public copy() {
        return new Node3d(this.height, this.width, this.position)
    }

    public getDistance(node: Node3d): number {
        const z = Math.abs(((node.position.getZ() - this.trasformedlocation.getZ())))
        
        return z;
    }
}