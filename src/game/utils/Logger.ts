export default class Logger
{
    

    static log(message: string, ...optionalParams: any[]) {
        console.log(message)
    }

    static debug(message: string, ...optionalParams: any[]) {
        console.log("%c[DEBUG] %c" + message, "color: teal;", "color: #777;", ...optionalParams)
    }

    static info(message: string, ...optionalParams: any[]) {
        console.info("%c[INFO] %c" + message, "color: blue;", "color: #777;", ...optionalParams)
    }

    static error(message: string, ...optionalParams: any[]) {
        console.error("%c[ERROR] %c" + message, "color: red;", "color: #777;", ...optionalParams)
    }

    static warning(message: string, ...optionalParams: any[]) {
        console.warn("%c[WARNING] %c" + message, "color: #ff6200;", "color: #777;", ...optionalParams)
    }
}