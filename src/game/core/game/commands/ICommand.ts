export interface ICommand {
    definition: string
    aliases: string[]
    handle(args: string[]): void

}