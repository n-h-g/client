import Canvas from './Canvas';

export default abstract class Geometry {
    public id: string;
    public height = 0;
    public width = 0;
    public dx = 0;
    public dy = 0;
    protected canvases: Map<string, Map<string, Canvas>>;

    public constructor(
        id: string,
        height: number,
        width: number,
        dx: number,
        dy: number
    ) {
        this.id = id;
        this.height = height;
        this.width = width;
        this.canvases = new Map();
    }

    public getCanvas(geometryId: string, canvasId: string): Canvas | null {
        const canvas = this.canvases.get(geometryId);
        if (!canvas) return null;
        return canvas.get(geometryId) || null;
    }
}
