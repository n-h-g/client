import { IUserInfo } from "../../core/users/IUserInfo"
import Room from "../room/Room"

export default class UserInfo implements IUserInfo
{
    public id: number
    public username: string | null
    public email: string | null
    public look: string | undefined
    public gender: string | null
    public motto: string | null
    public level: Number | null
    public exp: Number | null
    public credits: Number | null
    public rank: Number | null
    public canTrade: boolean | null
    public online: boolean = false;

    constructor(id: number, username: string, look: string, gender: string, motto: string | null = null, level: Number | null = null, exp: Number | null = null, credits: Number | null = null, rank: Number | null = null, allowTrade: boolean | null = null, email: string | null = null, online: boolean = false)
    {
        this.id = id
        this.username = username
        this.look = look
        this.gender = gender
        this.motto = motto
        this.level = level
        this.exp = exp
        this.credits = credits
        this.rank = rank
        this.canTrade = allowTrade
        this.email = email
        this.online = online;
    }
}