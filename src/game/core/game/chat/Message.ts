import IMessage from "../IMessage";

export abstract class Message implements IMessage {
  public id: number;
  public senderId: number;
  public destinationId: number;
  public friendshipId: number;
  public text: string;

  constructor(id: number, senderId: number, destinationId: number, friendshipId: number, text: string) {
    this.id = id;
    this.senderId = senderId;
    this.destinationId = destinationId;
    this.friendshipId = friendshipId;
    this.text = text;
  }

  abstract compose(): void;
}
