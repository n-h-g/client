export interface IWallDataParser {
    stuffData: string,
    secondsToExpiration: number
    localX: number,
    localY: number,
    y: number,
    z: number,
    direction: number,
    side?: 'l' | 'r',
    width: number,
    height: number,
    isOldFormat: boolean
}

export class FurnitureWallData
{
    private _location: string;
    private _stuffData: string;
    private _state: number;
    private _secondsToExpiration: number;
    private _usagePolicy: number;
    private _userId: number;
    private _username: string;

    private _width: number;
    private _height: number;
    private _localX: number;
    private _localY: number;
    private _y: number;
    private _z: number;
    private _direction: string;
    private _side: 'l' | 'r';
    private _isOldFormat: boolean;

    constructor(wrapper: IWallDataParser)
    {
        if(!wrapper) throw new Error('invalid_wrapper');

        this.flush();
        this.parse(wrapper);
    }

    public flush(): boolean
    {
        this._location = null;
        this._stuffData = null;
        this._state = 0;
        this._secondsToExpiration = 0;
        this._usagePolicy = -1;
        this._userId = 0;
        this._username = null;

        this._width = 0;
        this._height = 0;
        this._localX = 0;
        this._localY = 0;
        this._y = 0;
        this._z = 0;
        this._direction = null;
        this._isOldFormat = false;

        return true;
    }

    public parse(wrapper: IWallDataParser): boolean
    {
        if(!wrapper) return false;

        this._localX = wrapper.localX
        this._localY = wrapper.localY;
        this._height = wrapper.height;
        this._width = wrapper.width;
        this._y = wrapper.y;
        this._z = wrapper.z;
        this._direction = String(wrapper.direction);
        this._side = wrapper.side ?? (Number(wrapper.direction) === 4 ? 'l' : 'r');

        return true;
    }

    public get wallPosition(): string
    {
        return this._location;
    }

    public get stuffData(): string
    {
        return this._stuffData;
    }

    public get state(): number
    {
        return this._state;
    }

    public get secondsToExpiration(): number
    {
        return this._secondsToExpiration;
    }

    public get usagePolicy(): number
    {
        return this._usagePolicy;
    }

    public get userId(): number
    {
        return this._userId;
    }

    public get username(): string
    {
        return this._username;
    }

    public set username(username: string)
    {
        this._username = username;
    }

    public get width(): number
    {
        return this._width;
    }

    public get height(): number
    {
        return this._height;
    }

    public get localX(): number
    {
        return this._localX;
    }

    public get localY(): number
    {
        return this._localY;
    }

    public get direction(): string
    {
        return this._direction;
    }

    public get side(): 'l' | 'r' {
        return this._side;
    }

    public get isOldFormat(): boolean
    {
        return this._isOldFormat;
    }

    static fromLocation(location: string): FurnitureWallData {
        const match = /^:w=(\d+),(\d+) l=(\d+),(\d+) ([lr])$/.exec(location ?? '');
        if (!match) throw new Error('Invalid wall item location');
        const wallX = Number(match[1]);
        const wallY = Number(match[2]);
        // Match the room wall plane's side orientation used by the placement ghost.
        const direction = match[5] === 'l' ? 2 : 4;
        return new FurnitureWallData({
            localX: Number(match[3]),
            localY: Number(match[4]),
            width: wallX,
            height: wallY,
            y: wallY,
            z: 0,
            direction,
            side: match[5] as 'l' | 'r',
            stuffData: '',
            secondsToExpiration: 0,
            isOldFormat: false,
        });
    }
}
