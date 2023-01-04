export class UserInfo {
    public id: number
    public username: string
    public email: string
    public look: string
    public gender: string
    public motto: string
    public level: number
    public exp: number
    public credits: number
    public rank: number
    public canTrade: boolean
    public online: boolean = false;

    constructor(id: number, username: string, look: string, gender: string, motto: string = null, credits: number = null, rank: number = null, allowTrade: boolean = null, email: string = null, online: boolean = false) {
        this.id = id
        this.username = username
        this.look = look
        this.gender = gender
        this.motto = motto
        this.credits = credits
        this.rank = rank
        this.canTrade = allowTrade
        this.email = email
        this.online = online;
    }
}