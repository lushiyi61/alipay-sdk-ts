import camelcaseKeys = require("camelcase-keys");
import { AlipaySdkConfig } from "./lib/AlipaySdkConfig";
import { getSNFromPath, loadPublicKeyFromPath } from "./lib/antcertUtil";
import { AlipaySdkCommonResult } from "./lib/interface/common/IPayBase";
import { aesDecrypt, ALIPAY_ALGORITHM_MAPPING, sign } from "./lib/util";

const pkg = require('./package.json');
const urllib = require('urllib');
import * as crypto from 'crypto';

export default class AlipaySdk {
    private sdkVersion: string;
    public config: AlipaySdkConfig;

    constructor(config: AlipaySdkConfig) {
        if (!config.appId) { throw Error('config.appId is required'); }
        if (!config.privateKey) { throw Error('config.privateKey is required'); }
        this.sdkVersion = `alipay-sdk-ts-nodejs-${pkg.version}`;
        console.log('this.sdkVersion :', this.sdkVersion);

        const privateKeyType = config.keyType !== 'PKCS8' ? 'PRIVATE KEY' : 'RSA PRIVATE KEY';
        config.privateKey = this.formatKey(config.privateKey, privateKeyType);
        // 普通公钥模式和证书模式二选其一，传入了证书路径认为是证书模式
        if (config.appCertPath && config.alipayPublicCertPath && config.alipayRootCertPath) {
            // 证书模式
            // 应用公钥证书序列号提取
            config.appCertSn = getSNFromPath(config.appCertPath, false)
            // 支付宝公钥证书序列号提取
            config.alipayCertSn = getSNFromPath(config.alipayPublicCertPath, false)
            // 支付宝根证书序列号提取
            config.alipayRootCertSn = getSNFromPath(config.alipayRootCertPath, true)
            config.alipayPublicKey = loadPublicKeyFromPath(config.alipayPublicCertPath)
            //     config.alipayPublicKey = this.formatKey(config.alipayPublicKey, 'PUBLIC KEY');
            // } else if (config.alipayPublicKey) {
            //     // 普通公钥模式，传入了支付宝公钥
            //     config.alipayPublicKey = this.formatKey(config.alipayPublicKey, 'PUBLIC KEY');
        }
        config.alipayPublicKey = this.formatKey(config.alipayPublicKey!, 'PUBLIC KEY');

        this.config = Object.assign({
            gateway: 'https://openapi.alipay.com/gateway.do',
            timeout: 5000,
            camelcase: true,
            signType: 'RSA2',
            charset: 'utf-8',
            version: '1.0',
        }, config);

    }

    // 格式化 key
    private formatKey(key: string, type: string): string {
        const item = key.split('\n').map(val => val.trim());

        // 删除包含 `RSA PRIVATE KEY / PUBLIC KEY` 等字样的第一行
        if (item[0].includes(type)) { item.shift(); }

        // 删除包含 `RSA PRIVATE KEY / PUBLIC KEY` 等字样的最后一行
        if (item[item.length - 1].includes(type)) {
            item.pop();
        }

        return `-----BEGIN ${type}-----\n${item.join('')}\n-----END ${type}-----`;
    }

    // 格式化请求 url（按规范把某些固定的参数放入 url）
    private formatUrl(url: string, params: { [key: string]: string }): { execParams: any, url: string } {
        let requestUrl = url;
        // 需要放在 url 中的参数列表
        const urlArgs = [
            'app_id', 'method', 'format', 'charset',
            'sign_type', 'sign', 'timestamp', 'version',
            'notify_url', 'return_url', 'auth_token', 'app_auth_token',
            'app_cert_sn', 'alipay_root_cert_sn',
            'ws_service_url',
        ];

        for (const key in params) {
            if (urlArgs.indexOf(key) > -1) {
                const val = encodeURIComponent(params[key]);
                requestUrl = `${requestUrl}${requestUrl.includes('?') ? '&' : '?'}${key}=${val}`;
                // 删除 postData 中对应的数据
                delete params[key];
            }
        }

        return { execParams: params, url: requestUrl };
    }

    // 消息验签
    private notifyRSACheck(signArgs: { [key: string]: any }, signStr: string, signType: 'RSA' | 'RSA2', raw?: boolean) {
        const signContent = Object.keys(signArgs).sort().filter(val => val).map((key) => {
            let value = signArgs[key];

            if (Array.prototype.toString.call(value) !== '[object String]') {
                value = JSON.stringify(value);
            }
            // 如果 value 中包含了诸如 % 字符，decodeURIComponent 会报错
            // 而且 notify 消息大部分都是 post 请求，无需进行 decodeURIComponent 操作
            if (raw) {
                return `${key}=${value}`;
            }
            return `${key}=${decodeURIComponent(value)}`;
        }).join('&');

        const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[signType]);

        return verifier.update(signContent, 'utf8').verify(this.config.alipayPublicKey!, signStr, 'base64');
    }

    /**
     *
     * @param originStr 开放平台返回的原始字符串
     * @param responseKey xx_response 方法名 key
     */
    getSignStr(originStr: string, responseKey: string): string {
        // 待签名的字符串
        let validateStr = originStr.trim();
        // 找到 xxx_response 开始的位置
        const startIndex = originStr.indexOf(`${responseKey}"`);
        // 找到最后一个 “"sign"” 字符串的位置（避免）
        const lastIndex = originStr.lastIndexOf('"sign"');

        /**
         * 删除 xxx_response 及之前的字符串
         * 假设原始字符串为
         *  {"xxx_response":{"code":"10000"},"sign":"jumSvxTKwn24G5sAIN"}
         * 删除后变为
         *  :{"code":"10000"},"sign":"jumSvxTKwn24G5sAIN"}
         */
        validateStr = validateStr.substr(startIndex + responseKey.length + 1);

        /**
         * 删除最后一个 "sign" 及之后的字符串
         * 删除后变为
         *  :{"code":"10000"},
         * {} 之间就是待验签的字符串
         */
        validateStr = validateStr.substr(0, lastIndex);

        // 删除第一个 { 之前的任何字符
        validateStr = validateStr.replace(/^[^{]*{/g, '{');

        // 删除最后一个 } 之后的任何字符
        validateStr = validateStr.replace(/\}([^}]*)$/g, '}');

        return validateStr;
    }

    /**
     * 
     * @param method  调用接口方法名，比如 alipay.ebpp.bill.add
     * @param params 请求参数 biz_content
     * @param validateSign 是否验签
     * @param log 打印日志
     * @returns 
     */
    exec(
        method: string,
        params: any = {},
        validateSign?: boolean,
        log?: boolean,
    ): Promise<AlipaySdkCommonResult | string> {
        const config = this.config;
        let signParams: any = { biz_content: params } as { [key: string]: string | Object };
        // 签名方法中使用的 key 是驼峰
        signParams = camelcaseKeys(signParams, { deep: true });
        // 计算签名
        const signData = sign(method, signParams, config);

        const { url, execParams } = this.formatUrl(config.gateway!, signData);
        log && console.log('[AlipaySdk]start exec, url: %s, method: %s, params: ', url, method, JSON.stringify(execParams));

        throw ''
        return new Promise((resolve, reject) => {
            urllib.request(url, {
                method: 'POST',
                data: execParams,
                // 按 text 返回（为了验签）
                dataType: 'text',
                timeout: config.timeout,
                // headers: { 'user-agent': this.sdkVersion },
            })
                .then((ret: any) => {
                    log && console.log('[AlipaySdk]exec response: %s', ret);
                    resolve(ret);
                })
                .catch((err: any) => {
                    log && console.log(err);
                    reject(err);
                });
        });
    }

    // 结果验签
    checkResponseSign(signStr: string, responseKey: string): boolean {
        if (!this.config.alipayPublicKey || this.config.alipayPublicKey === '') {
            console.warn('config.alipayPublicKey is empty');
            // 支付宝公钥不存在时不做验签
            return true;
        }

        // 带验签的参数不存在时返回失败
        if (!signStr) { return false; }

        // 根据服务端返回的结果截取需要验签的目标字符串
        const validateStr = this.getSignStr(signStr, responseKey);
        // 服务端返回的签名
        const serverSign = JSON.parse(signStr).sign;

        // 参数存在，并且是正常的结果（不包含 sub_code）时才验签
        const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[this.config.signType!]);
        verifier.update(validateStr, 'utf8');
        return verifier.verify(this.config.alipayPublicKey, serverSign, 'base64');
    }

    /**
     * 通知验签
     * @param postData {JSON} 服务端的消息内容
     * @param raw {Boolean} 是否使用 raw 内容而非 decode 内容验签
     */
    checkNotifySign(postData: any, raw?: boolean): boolean {
        const signStr = postData.sign;

        // 未设置“支付宝公钥”或签名字符串不存，验签不通过
        if (!this.config.alipayPublicKey || !signStr) {
            return false;
        }

        // 先从签名字符串中取 sign_type，再取配置项、都不存在时默认为 RSA2（RSA 已不再推荐使用）
        const signType = postData.sign_type || this.config.signType || 'RSA2';
        const signArgs = { ...postData };
        // 除去 sign
        delete signArgs.sign;

        /**
         * 某些用户可能自己删除了 sign_type 后再验签
         * 为了保持兼容性临时把 sign_type 加回来
         * 因为下面的逻辑会验签 2 次所以不会存在验签不同过的情况
         */
        signArgs.sign_type = signType;

        // 保留 sign_type 验证一次签名
        const verifyResult = this.notifyRSACheck(signArgs, signStr, signType, raw);

        if (!verifyResult) {
            /**
             * 删除 sign_type 验一次
             * 因为“历史原因”需要用户自己判断是否需要保留 sign_type 验证签名
             * 这里是把其他 sdk 中的 rsaCheckV1、rsaCheckV2 做了合并
             */
            delete signArgs.sign_type;
            return this.notifyRSACheck(signArgs, signStr, signType, raw);
        }

        return true;
    }
}
