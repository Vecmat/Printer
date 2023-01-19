/*
 * @Author: Vecmat
 * @Date: 2022-03-21 13:14:21
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-21 13:14:21
 * @License: BSD (3-Clause)
 * @Copyright (c) - <hi(at)vecmat.com>
 */

import util from "util"
import path from "node:path"
import { merge } from "lodash"
import { ShieldLog } from "./shield"
import { ILogger, LogType, LogLevelType } from "./interface"
import DailyRotateFile from "winston-daily-rotate-file"
import TransportStream, * as Transport from 'winston-transport'
import { format, Logger as winLogger, transports, createLogger } from "winston"

const { combine, timestamp, label, printf } = format
// 
const LogLevelObj: any = {
    "debug": 7,
    "info": 6,
    "warning": 4,
    "error": 3
}

// defaultOption
const defaultOption = {
    output: ["Console"],
    File: {
        json: true,
        level: "info",
        filename: "/log-%DATE%.log",
        handleExceptions: true,
        datePattern: 'YYYY-MM-DD-HH',
        // zippedArchive: true,
        maxSize: '20m',
        // maxFiles: '7d',
        colorize: false,
        timestamp: true
    },
    Console: {
        level: "debug",
        handleExceptions: true,
        json: true,
        colorize: true,
        timestamp: true
    }
}

export interface LoggerOption {
    output?: Set<LogType>
    logLevel?: LogLevelType
    logFilePath?: string
    sensFields?: Set<string>
    Console?: transports.ConsoleTransportOptions
    File?: DailyRotateFile.DailyRotateFileTransportOptions
}


export interface LoggerInstance {
    File?: DailyRotateFile,
    Console?: transports.ConsoleTransportInstance
}

/**
 * Logger
 *
 * @class Logger
 */
export class Logger implements ILogger {
    // 默认打开日志
    private enableLog = true;
    // 文件日志目录
    private logFileDir = "";

    // 日志配置
    private option: LoggerOption

    // 脱敏字段
    private sensFields: Set<string> = new Set();

    // 日志对象
    private logger: winLogger
    private emptyObj: any = {};
    // private transports: LogTrans = {};
    private fileTrans: DailyRotateFile = null;
    private termTrans: transports.ConsoleTransportInstance = null;


    /**
     * Creates an instance of Logger.
     * @param {LoggerOption} [opt]
     * @memberof Logger
     */
    constructor(opt?: LoggerOption) {
        // default < params < env < update
        this.option = merge(defaultOption, opt)
        // 日志目录
        if (process.env.LOGS_PATH) {
            this.logFileDir = process.env.LOGS_PATH
        }
        // 日志等级
        const level = (process.env.LOGS_LEVEL || "").toLowerCase()
        if (level && LogLevelObj[level]) {
            this.option.File.level = level
            this.option.Console.level = level
        }
        this.logger = this.buildLogger()
    }

    /**
     * update Logger config
     * @param {LoggerOption} opt 
     */
    public update(opt?: LoggerOption) {
        this.logger.close()
        // 更新配置
        this.option = merge(this.option, opt)
        this.logger = this.buildLogger()
    }


    /**
       * buildLogger
       * @returns 
       */
    private buildLogger(): winLogger {
        const trans: TransportStream[] = []
        // output type trans
        if (!(this.option.output instanceof Set)) {
            this.option.output = new Set(this.option.output)
        }
        if (this.option.output.has("File")) {
            this.option.File.filename = path.join(this.logFileDir || './logs/', "log-%DATE%.log")
            this.fileTrans = new DailyRotateFile(this.option.File)
            trans.push(this.fileTrans)
        }
        if (this.option.output.has("Console")) {
            this.termTrans = new transports.Console(this.option.Console)
            trans.push(this.termTrans)
        }

        return createLogger({
            levels: LogLevelObj,
            transports: trans,
            format: combine(
                timestamp({
                    format: "HH:mm:ss"
                }),
                format.json(),
                printf(({ level, message, label, timestamp }: any) => {
                    return this.format(level, label, timestamp, message)
                }),
            ),
        })
    }

    /**
     * enable
     */
    public enable(b = true) {
        this.enableLog = b
    }

    /**
     * getSensFields
     */
    public getSensFields() {
        return this.sensFields
    }

    /**
     * setSensFields
     */
    public setSensFields(fields: string[]) {
        this.sensFields = new Set([...this.sensFields, ...fields])
    }

    /**
     * log Debug
     *
     * @returns {*} 
     * @memberof Logger
     */
    public Debug(...args: any[]) {
        return this.printLog("debug", "", args)
    }

    /**
     * log Info
     *
     * @returns {*} 
     * @memberof Logger
     */
    public Info(...args: any[]) {
        return this.printLog("info", "", args)
    }

    /**
     * log Warn
     *
     * @returns {*} 
     * @memberof Logger
     */
    public Warn(...args: any[]) {
        return this.printLog("warning", "", args)
    }

    /**
     * log Error
     * 
     * @returns {*} 
     * @memberof Logger
     */
    public Error(...args: any[]) {
        return this.printLog("error", "", args)
    }

    /**
     * log Log
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
    public Log(name: LogLevelType | string, ...args: any[]) {
        // tslint:disable-next-line: one-variable-per-declaration
        let level = "info"
        if (LogLevelObj[name]) {
            level = name
            name = ""
        }
        return this.printLog(<LogLevelType>level, name, args)
    }

    /**
     * print console
     *
     * @private
     * @param {LogLevelType} level
     * @param {string} name
     * @param {any[]|string} args
     * @memberof Logger
     */
    private printLog(level: LogLevelType, name: string, args: any[]) {
        try {
            if (!this.enableLog) {
                return
            }
            name = name !== '' ? name.toUpperCase() : level.toUpperCase()
            // format
            if (LogLevelObj[name.toLowerCase()]) {
                args.unshift(`[${name}]`);
            } else {
                args.unshift(`${name}:`);
            }

            this.logger[level](args)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 格式化
     *
     * @private
     * @param {string} level
     * @param {string} label
     * @param {string} timestamp
     * @param {any[]|string} args
     * @returns {string} 
     * @memberof Logger
     */
    private format(level: string, label: string, timestamp: string, args: any[] | string): string {
        try {
            label = label ? `[${label}]` : ''
            const params = [`[${Date.now()}/${timestamp}]`, label, ...ShieldLog(args, this.sensFields)]
            if (level === "debug") {
                // 只有将logger拆分成独立的包才能正确分割错误栈
                Error.captureStackTrace(this.emptyObj)
                const matchResult = (this.emptyObj.stack.slice(this.emptyObj.stack.lastIndexOf("kirinriki"))).match(/\(.*?\)/g) || []
                params.push(matchResult.join("  "))
            }
            return util.format.apply(null, params)
        } catch (e) {
            // console.error(e.stack);
            return ""
        }
    }



}