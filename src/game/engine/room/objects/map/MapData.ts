export default class MapData {
    public static tileWidth = 68
    public static tileHeight = 34
    public static thickSpace = 8
    public static stepHeight = 4
    public static stairSteps = 4
    public static wallWidth = 42
    public static wallHeight = 149
    public static wallDepth = 8
    public static wallBlankTop = 4
    public static wallBlankBottom = 17
    public static strokeDepth = 0.4;
    public static maxHeight = 17
    public static drawingFurniOffsetX = 32;
    public static drawingFurniOffsetY = 0;

    public static parseHeight(modelInfo: string) {
        switch (modelInfo) {
            case "A":
                return 10
            case "B":
                return 11
            case "C":
                return 12
            case "D":
                return 13
            case "E":
                return 14
            case "F":
                return 15
            case "G":
                return 16
            case "H":
                return 17
            case "I":
                return 18
            case "J":
                return 19
            case "K":
                return 20
            case "L":
                return 21
            case "X":
                return 0
            default:
                return parseInt(modelInfo) > MapData.maxHeight ? 0 : parseInt(modelInfo)
        }
    }
}
