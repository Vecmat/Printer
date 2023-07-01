/**
 * @ Author: Hanrea
 * @ version: 2022-03-21 13:14:21
 * @ copyright: Vecmat (c) - <hi(at)vecmat.com>
 */
import lodash from "lodash";

export interface ShieldFieldRes {
    res: string;
    start: string;
    end: string;
}
/**
 * ShieldField
 *
 * @export
 * @param {string} str
 * @returns {*}  {ShieldFieldRes}
 */
export function ShieldField(str: string): ShieldFieldRes {
    const strArr = Object.assign([], str);
    const l = strArr.length;
    let start, end, res;
    if (l <= 1) {
        start = "*";
        end = "";
        res = "*";
    } else if (l == 2) {
        start = strArr.slice(1).join("");
        end = "*";
        res = `${start}${end}`;
    } else {
        let num = Math.floor(l / 3);
        const mo = Math.floor(l % 3);
        let startNum = num;
        if (mo > 0) {
            num = num + 1;
        }
        if (startNum > 4) {
            num = num + (startNum - 4);
            startNum = 4;
        }
        const endNum = l - num - startNum;
        if (endNum > 4) {
            num = num + (endNum - 4);
            // endNum = 4;
        }
        // console.log(startNum, num, endNum)
        start = strArr.slice(0, startNum).join("");
        end = strArr.slice(num + startNum).join("");
        res = `${start}${"*".repeat(num)}${end}`;
    }
    return { res, start, end };
}

/**
 * ShieldLog
 *
 * @export
 * @param {*} splat
 * @param {Set<string>} fields
 * @param {string} [keyName]
 * @returns {*}  {*}
 */
export function ShieldLog(splat: any, fields: Set<string>, keyName?: string): any {
    if (fields.size === 0) {
        return splat;
    }
    if (!splat) return splat;

    if (Array.isArray(splat)) {
        for (let index = 0; index < splat.length; index++) {
            splat[index] = ShieldLog(splat[index], fields);
        }
        return splat;
    }

    if (lodash.isError(splat)) {
        return splat.message;
    }

    if (typeof splat !== "object") {
        if (fields.has(keyName)) {
            return ShieldField(splat).res;
        }
        return `${splat}`;
    }
    const cloneSplat = new splat.constructor();
    for (const key in splat) {
        if (splat.hasOwnProperty(key)) {
            // 递归拷贝
            cloneSplat[key] = ShieldLog(splat[key], fields, key);
        }
    }

    return cloneSplat;
}
