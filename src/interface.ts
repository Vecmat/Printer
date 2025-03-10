/**
 * @ Author: Hanrea
 * @ version: 2022-03-21 13:14:21
 * @ copyright: Vecmat (c) - <hi(at)vecmat.com>
 */
import { transports } from "winston";

// LogColor
export type LogColor = "white" | "blue" | "yellow" | "red";
// 输出类型
export type LogType = "File" | "Console" | "ESLOG";

// 日志级别
export type LogLevelType = "debug" | "info" | "warn" | "error";

/**
 * Logger interface
 *
 * @export
 * @interface ILogger
 */
export interface ILogger {
    /**
     * log Debug
     *
     * @returns {*}
     * @memberof Logger
     */
    Debug(...args: any[]): void;

    /**
     * log Info
     *
     * @returns {*}
     * @memberof Logger
     */
    Info(...args: any[]): void;

    /**
     * log Warn
     *
     * @returns {*}
     * @memberof Logger
     */
    Warn(...args: any[]): void;

    /**
     * log Error
     *
     * @returns {*}
     * @memberof Logger
     */
    Error(...args: any[]): void;

    /**
     * log Custom
     *
     * Logger.Log('msg')
     *
     * Logger.Log('name', 'msg')
     *
     * Logger.Log('name', 'msg1', 'msg2'...)
     *
     * @param {...any[]} args
     * @returns {*}
     * @memberof Logger
     */
    Log(...msg: any[]): void;
    Log(name: LogLevelType | string, ...msg: any[]): void;
    Log(name: LogLevelType | string, color: LogColor, ...msg: any[]): void;
}
