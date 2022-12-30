export interface IUserInfo {
    id: number
    username: string | null
    email: string | null
    look: string | undefined
    gender: string | null
    motto: string | null
    level: Number | null
    exp: Number | null
    credits: Number | null
    rank: Number | null
    canTrade: boolean | null,
    online: boolean
}