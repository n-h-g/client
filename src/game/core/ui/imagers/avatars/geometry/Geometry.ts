import {Canvas} from './Canvas';

export abstract class Geometry {
    id: string;
    height = 0;
    width = 0;
    dx = 0;
    dy = 0;
    protected canvases: Map<string, Map<string, Canvas>>;

    constructor(
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

    getCanvas(geometryId: string, canvasId: string): Canvas | null {
        const canvas = this.canvases.get(geometryId);
        if (!canvas) return null;
        return canvas.get(geometryId) || null;
    }
}
