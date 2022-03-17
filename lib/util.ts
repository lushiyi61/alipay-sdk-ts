// import * as crypto from 'crypto';
import * as moment from 'moment';
import * as iconv from 'iconv-lite';
import { omit, padEnd } from 'lodash';
import { AlipaySdkConfig } from './AlipaySdkConfig';

const crypto = require('crypto');
const snakeCaseKeys = require('snakecase-keys')
const utf8 = 'utf8'

export const ALIPAY_ALGORITHM_MAPPING = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256',
};

function parseKey(aesKey: any) {
  return {
    iv: CryptoJS.enc.Hex.parse(padEnd('', 32, '0')),
    key: CryptoJS.enc.Base64.parse(aesKey),
  };
}

// 先加密后加签
function aesEncrypt(data: any, aesKey: string) {
  const {
    iv,
    key,
  } = parseKey(aesKey);
  const cipherText = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv,
  }).toString();

  return cipherText;
}

// 解密
export function aesDecrypt(data: any, aesKey: string | undefined) {
  const {
    iv,
    key,
  } = parseKey(aesKey);
  const bytes = CryptoJS.AES.decrypt(data, key, {
    iv,
  });
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

  return decryptedData;
}

/**
 * 签名
 * @description https://opendocs.alipay.com/common/02kf5q
 * @param {string} method 调用接口方法名，比如 alipay.ebpp.bill.add
 * @param {object} bizContent 业务请求参数
 * @param {object} publicArgs 公共请求参数
 * @param {object} config sdk 配置
 */
export function sign(method: string, params: any = {}, config: AlipaySdkConfig): any {

  // 基本参数
  let signParams: any = {
    method,
    appId: config.appId,
    charset: utf8,
    version: config.version,
    signType: config.signType,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  };

  if (config.appCertSn && config.alipayRootCertSn) {
    signParams = Object.assign({
      appCertSn: config.appCertSn,
      alipayRootCertSn: config.alipayRootCertSn,
    }, signParams);
  }

  // if (config.wsServiceUrl) {
  //   signParams.wsServiceUrl = config.wsServiceUrl;
  // }

  const bizContent = params.bizContent;

  if (bizContent) {
    // AES加密
    if (config.encryptKey) {
      // signParams.encryptType = 'AES';
      // signParams.bizContent = aesEncrypt(
      //   snakeCaseKeys(bizContent),
      //   config.encryptKey,
      // );
    } else {
      signParams.bizContent = JSON.stringify(snakeCaseKeys(bizContent));
    }
  }

  // params key 驼峰转下划线
  const decamelizeParams = snakeCaseKeys(signParams);

  // 排序
  const signStr = Object.keys(decamelizeParams).sort().map((key) => {
    let data = decamelizeParams[key];
    if (Array.prototype.toString.call(data) !== '[object String]') {
      data = JSON.stringify(data);
    }
    return `${key}=${iconv.encode(data, utf8)}`;
  }).join('&');

  // 计算签名
  const sign = crypto.createSign(ALIPAY_ALGORITHM_MAPPING[config.signType!])
    // .update(signStr, utf8)
    .update(signStr)
    .sign(config.privateKey, 'base64');

  return Object.assign(decamelizeParams, { sign });
}

