export class MapData {
    // the Habbo/Nitro furni are drawn for 64x32 tiles: with bigger tiles (68x34) furni placed side by side
    // (e.g. floors) had a gap of 4px per tile between them
    static tileWidth = 64;
    static tileHeight = 32;
    static thickSpace = 8;
    static stepHeight = 4;
    static stairSteps = 4;
    static wallWidth = 40; // half tile + wall depth
    static wallHeight = 149;
    static wallDepth = 8;
    static wallBlankTop = 4;
    static wallBlankBottom = 16; // half tile height
    static strokeDepth = 0.4;
    static maxHeight = 17;
    static drawingFurniOffsetX = 32;
    static drawingFurniOffsetY = 0;

    static parseHeight(modelInfo: string) {
        switch (modelInfo) {
            case 'A':
                return 10;
            case 'B':
                return 11;
            case 'C':
                return 12;
            case 'D':
                return 13;
            case 'E':
                return 14;
            case 'F':
                return 15;
            case 'G':
                return 16;
            case 'H':
                return 17;
            case 'I':
                return 18;
            case 'J':
                return 19;
            case 'K':
                return 20;
            case 'L':
                return 21;
            case 'X':
                return 0;
            default:
                return parseInt(modelInfo) > MapData.maxHeight
                    ? 0
                    : parseInt(modelInfo);
        }
    }
}
