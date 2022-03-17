import * as fs from 'fs';
import * as crypto from 'crypto';
import bignumber from 'bignumber.js';
const X509_1 = require('@fidm/x509');

/** 从公钥证书文件里读取支付宝公钥 */
export function loadPublicKeyFromPath(filePath: string): string {
  const fileData = fs.readFileSync(filePath);
  return loadPublicKey(fileData);
}

/** 从公钥证书内容或buffer读取支付宝公钥 */
export function loadPublicKey(content: string | Buffer): string {
  const pemContent = typeof content === 'string' ? Buffer.from(content) : content;
  const certificate = X509_1.Certificate.fromPEM(pemContent);
  return certificate.publicKeyRaw.toString('base64');
}

/** 从证书文件里读取序列号 */
export function getSNFromPath(filePath: string, isRoot: boolean = false): string {
  const fileData = fs.readFileSync(filePath);
  return getSN(fileData, isRoot);
}

/** 从上传的证书内容或Buffer读取序列号 */
export function getSN(fileData: string | Buffer, isRoot: boolean = false): string {
  const pemData = typeof fileData === 'string' ? Buffer.from(fileData) : fileData;
  if (isRoot) {
    return getRootCertSN(pemData);
  }
  const certificate = X509_1.Certificate.fromPEM(pemData);
  return getCertSN(certificate);
}

/** 读取序列号 */
function getCertSN(certificate: any): string {
  const { issuer, serialNumber } = certificate;
  const principalName = issuer.attributes
    .reduceRight((prev: any, curr: { shortName: any; value: any; }) => {
      const { shortName, value } = curr;
      const result = `${prev}${shortName}=${value},`;
      return result;
    }, '')
    .slice(0, -1);
  const decimalNumber = new bignumber(serialNumber, 16).toString(10);
  const SN = crypto
    .createHash('md5')
    .update(principalName + decimalNumber, 'utf8')
    .digest('hex');
  return SN;
}

/** 读取根证书序列号 */
function getRootCertSN(rootContent: Buffer): string {
  const certificates = X509_1.Certificate.fromPEMs(rootContent);
  let rootCertSN = '';
  certificates.forEach((item: { signatureOID: string; }) => {
    if (item.signatureOID.startsWith('1.2.840.113549.1.1')) {
      const SN = getCertSN(item);
      if (rootCertSN.length === 0) {
        rootCertSN += SN;
      } else {
        rootCertSN += `_${SN}`;
      }
    }
  });
  return rootCertSN;
}