export class Logger {
    static debug(message: string, ...optionalParams: Array<unknown>) {
        console.log('%c[DEBUG] ' + message, 'color: #8b008b', ...optionalParams)
    }

    static info(message: string, ...optionalParams: Array<unknown>) {
        console.info('%c[INFO] ' + message, 'color: #006400', ...optionalParams)
    }

    static error(message: string, ...optionalParams: Array<unknown>) {
        console.error('%c[ERROR] ' + message, 'color: #8b0000', ...optionalParams)
    }

    static warning(message: string, ...optionalParams: Array<unknown>) {
        console.warn('%c[WARNING] ' + message, 'color: #8B8000', ...optionalParams)
    }
}