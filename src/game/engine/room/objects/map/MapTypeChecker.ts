import {Point} from '../../../../utils/point/Point';
import {Point3d} from '../../../../utils/point/Point3d';
import {TileType} from './TileTypeEnum';

export class MapTypeChecker {
    static checkTileType(
        position: Point3d,
        doorPosition: Point,
        modelMatrix: Array<Array<number>>
    ): TileType {
        if (
            doorPosition.y == position.y &&
            doorPosition.x == position.x
        ) {
            return TileType.Door;
        } else if (modelMatrix[position.x][position.y] == 0) {
            return TileType.Hole;
        } else if (
            modelMatrix[position.x - 1] &&
            modelMatrix[position.x - 1][position.y] != 0 &&
            modelMatrix[position.x][position.y] + 1 ==
                modelMatrix[position.x - 1][position.y]
        ) {
            return TileType.StairRight;
        } else if (
            modelMatrix[position.x] &&
            modelMatrix[position.x][position.y - 1] != 0 &&
            modelMatrix[position.x][position.y] + 1 ==
                modelMatrix[position.x][position.y - 1]
        ) {
            return TileType.StairLeft;
        } else if (
            modelMatrix[position.x - 1] &&
            modelMatrix[position.x - 1][position.y - 1] &&
            modelMatrix[position.x - 1][position.y - 1] != 0 &&
            (modelMatrix[position.x - 1][position.y] == 0 ||
                modelMatrix[position.x - 1][position.y] <=
                    modelMatrix[position.x][position.y]) &&
            modelMatrix[position.x][position.y] + 1 ==
                modelMatrix[position.x - 1][position.y - 1]
        ) {
            return TileType.StairCornerFront;
        } else if (
            modelMatrix[position.x - 1] &&
            modelMatrix[position.x - 1][position.y + 1] &&
            modelMatrix[position.x - 1][position.y + 1] != 0 &&
            (modelMatrix[position.x - 1][position.y] == 0 ||
                modelMatrix[position.x - 1][position.y] <=
                    modelMatrix[position.x][position.y]) &&
            modelMatrix[position.x][position.y] + 1 ==
                modelMatrix[position.x - 1][position.y + 1]
        ) {
            return TileType.StairCornerLeft;
        } else if (
            modelMatrix[position.x + 1] &&
            modelMatrix[position.x + 1][position.y - 1] &&
            modelMatrix[position.x + 1][position.y - 1] != 0 &&
            (modelMatrix[position.x + 1][position.y] == 0 ||
                modelMatrix[position.x + 1][position.y] <=
                    modelMatrix[position.x][position.y]) &&
            modelMatrix[position.x][position.y] + 1 ==
                modelMatrix[position.x + 1][position.y - 1]
        ) {
            return TileType.StairCornerRight;
        }

        return TileType.Flat;
    }

    static checkWallCorner(
        x: number,
        y: number,
        modelMatrix: Array<Array<number>>
    ) {
        let i: number;

        let isCorner =
            (x == 0 && y == 0) ||
            (modelMatrix[x - 1] &&
                modelMatrix[x - 1][y] == 0 &&
                modelMatrix[x][y - 1] &&
                modelMatrix[x][y - 1] == 0) ||
            (modelMatrix[x - 1] &&
                modelMatrix[x - 1][y] == 0 &&
                !modelMatrix[x][y - 1]) ||
            (modelMatrix[x][y - 1] &&
                modelMatrix[x][y - 1] == 0 &&
                !modelMatrix[x - 1])
                ? true
                : false;

        for (i = x - 1; i > 0; i--)
            if (modelMatrix[i][y] && modelMatrix[i][y] != 0 && isCorner)
                isCorner = false;

        for (i = y - 1; i > 0; i--)
            if (modelMatrix[x][i] && modelMatrix[x][i] != 0 && isCorner)
                isCorner = false;

        return isCorner;
    }
}
