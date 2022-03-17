# alipay-sdk-ts


阿里支付纯typescript版，基于阿里官方版本修改 https://github.com/alipay/alipay-sdk-nodejs-all

- 为什么要重做？
    - 因为官方版本仅支持POST，以及非200的状态码会抛异常，而H5支付方式创建订单会返回一个302的状态码。
    - 增加了接口文档
- 砍掉了什么
    - 文件上传
    - 证书内容读取，仅支持传入证书路径




## 使用
```javascript
// TypeScript
import AlipaySdk from 'alipay-sdk';
// 普通公钥模式
let alipaySdk = new AlipaySdk({
  // 参考下方 SDK 配置
  appId: '2016123456789012',
  privateKey: fs.readFileSync('./private-key.pem', 'ascii'),
  //可设置AES密钥，调用AES加解密相关接口时需要（可选）
  encryptKey: '请填写您的AES密钥，例如：aa4BtZ4tspm2wnXLb1ThQA'
});

// 证书模式
alipaySdk = new AlipaySdk({
  // 参考下方 SDK 配置
  appId: '2016123456789012',
  privateKey: fs.readFileSync('./private-key.pem', 'ascii'),
  alipayRootCertPath: path.join(__dirname,'../fixtures/alipayRootCert.crt'),
  alipayPublicCertPath: path.join(__dirname,'../fixtures/alipayCertPublicKey_RSA2.crt'),
  appCertPath: path.join(__dirname,'../fixtures/appCertPublicKey.crt'),
});

// 无需加密的接口
const result = await alipaySdk.exec('alipay.system.oauth.token', {
	grantType: 'authorization_code',
	code: 'code',
	refreshToken: 'token'
});

// 需要AES加解密的接口
await alipaySdk.exec('alipay.open.auth.app.aes.set', {
  bizContent: {
    merchantAppId: '2021001170662064'
  },
  // 自动AES加解密
  needEncrypt: true
});
```

## 问题
有问题就提issue吧，或者联系wechat:lushiyi92