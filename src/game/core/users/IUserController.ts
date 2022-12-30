import { IUserInfo } from "./IUserInfo";
import IUserVisualization from "./IUserVisualization";

export default interface IUserController {
    userInfo: IUserInfo
    visualization: IUserVisualization
    logic: IUserLogic
}