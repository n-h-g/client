import { User } from '../User';

export default class UserLogic {
  private user: User;

  constructor(user: User) {
    this.user = user;
  }

  public tick(delta: number): void {
    
  }
}
