import IUserController from "../../core/users/IUserController"
import UserLogic from "./logic/UserLogic"
import UserInfo from "./UserInfo"
import UserVisualization from "./visualization/UserVisualization"

export default class User implements IUserController {

    public visualization: UserVisualization
    public logic: UserLogic
    public userInfo: UserInfo;

    constructor(id: number, username: string, look: string, gender: string, motto: string = "", credits: number = 0) {
        this.userInfo = new UserInfo(id, username, look, gender, motto, 0, 0, credits)
        this.visualization = new UserVisualization(this)
        this.logic = new UserLogic(this)
    }
}