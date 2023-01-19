/*
 * @Description:
 * @Usage:
 * @Author: Vecmat
 * @Date: 2022-03-21 13:14:21
 * @LastEditTime: 2022-03-21 13:14:21
 */
import { ILogger } from "./interface";
import { Logger } from "./logger";
// export
export * from "./logger";
export * from "./interface";

//DefaultLogger
// todo 拆分为独立的包
// 拆分为 日志输出（文件、Console）、日志传输（暂时基于Winston）
// 异常传输到第三方错误平台
// 日志传输模块支持前后端，配置传输到ES、内部日志服务器、其他日志服务器
export const DefaultLogger: Logger = new Logger();