export class MapData {
    static tileWidth = 68;
    static tileHeight = 34;
    static thickSpace = 8;
    static stepHeight = 4;
    static stairSteps = 4;
    static wallWidth = 42;
    static wallHeight = 149;
    static wallDepth = 8;
    static wallBlankTop = 4;
    static wallBlankBottom = 17;
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
