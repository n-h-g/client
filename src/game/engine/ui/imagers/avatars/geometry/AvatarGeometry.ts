import Geometry from '../../../../../core/ui/imagers/avatars/geometry/Geometry';
import Point3d from '../../../../../utils/point/Point3d';
import {
    ICanvas,
    IGeometry,
    IGeometryElement,
    IType,
} from '../gamedata/IAvatarGeometry';
import {AvatarCanvas} from '../structure/AvatarCanvas';
import GeometryAvatarSet from './GeometryAvatarSet';
import GeometryBodyPart from './GeometryBodyPart';

export default class AvatarGeometry extends Geometry {
    private avatarSet: GeometryAvatarSet;
    private cameraPoint: Point3d = new Point3d(0, 0, 0);

    private types: Map<string, Map<string, GeometryBodyPart>>;

    public constructor(geometry: IGeometry) {
        super('vertical', 100, 200, 0, 0);
        this.avatarSet = new GeometryAvatarSet(geometry.avatarSets[0]);
        this.cameraPoint = new Point3d(
            geometry.camera.x,
            geometry.camera.y,
            geometry.camera.z
        );

        this.types = new Map();

        if (geometry.camera) {
            this.cameraPoint.setX(geometry.camera.x);
            this.cameraPoint.setY(geometry.camera.y);
            this.cameraPoint.setZ(geometry.camera.z);
        }

        this.loadCanvases(geometry.canvases);
        this.loadGeometryTypes(geometry.types);
    }

    public existsType(type: string) {
        return this.types.get(type) != null;
    }

    public hasBodyPart(type: string, id: string): boolean {
        if (!this.existsType(type)) {
            return false;
        }

        const existingType = this.types.get(type);
        const part = existingType?.get(id);
        return part != null;
    }

    public getBodyPartsOfType(type: string): Map<string, GeometryBodyPart> {
        if (!this.existsType(type)) return new Map();

        return this.types.get(type) as Map<string, GeometryBodyPart>;
    }

    public isHeadPart(type: string): boolean {
        return this.getBodyPartIds(type).includes('head')
    }

    public getBodyPartIds(type: string): string[] {
        const partsMap = this.types.get(type);

        if (!partsMap) return [];

        const types: string[] = [];

        for (let part of partsMap.values()) {
            if (!part) continue;

            types.push(part.id);
        }

        return types;
    }

    private loadGeometryTypes(types: IType[]) {
        if (types && types.length > 0) {
            for (let geometryType of types) {
                geometryType as IType;

                const bodyParts = new Map<string, GeometryBodyPart>();

                    geometryType.bodyParts &&
                    geometryType.bodyParts.length > 0
                ) {
                    for (let bodyPart of geometryType.bodyParts) {
                        const geometryBodyPart = new GeometryBodyPart(bodyPart);
                        bodyParts.set(geometryBodyPart.id, geometryBodyPart);
                    }
                }

                this.types.set(geometryType.id, bodyParts);
            }
        }
    }

    private loadCanvases(canvases: ICanvas[]) {
        Object.values(canvases).forEach((canvas: ICanvas) => {

            const geometries = new Map();

            if (canvas.geometries && canvas.geometries.length > 0) {
                canvas.geometries.forEach((geometry: IGeometryElement) => {
                    if (canvas.scale == 'h') {
                        if (geometry.id == this?.id) {
                            this.width = geometry.width;
                            this.height = geometry.height;
                        }

                        const avatarCanvas = new AvatarCanvas(
                            canvas.scale,
                            geometry
                        );

                        geometries.set(avatarCanvas.id, avatarCanvas);
                    }
                    if (canvas.scale == 'head') {
                        this.width = this.height;
                    }
                });
            }

            this.canvases.set(canvas.scale, geometries);
        });
    }

