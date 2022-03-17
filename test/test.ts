import { join } from 'path';
import AlipaySdk from '../index'
import * as fs from "fs";
const rootDir = join(__dirname, "../");


(async () => {
    console.log('========================')
    const alipaySdk = new AlipaySdk({
        // keyType: 'PKCS8',
        appId: '2021002107656059',
        privateKey: fs.readFileSync(join(rootDir, "fixtures/alipay/private-key.pem"), "ascii"),
        // alipayPublicKey: fs.readFileSync(join(rootDir, "fixtures/alipay/public-key.pem"), "ascii"),
        alipayRootCertPath: join(rootDir, "fixtures/alipay/alipayRootCert.crt"),
        alipayPublicCertPath: join(rootDir, "fixtures/alipay/alipayCertPublicKey_RSA2.crt"),
        appCertPath: join(rootDir, "fixtures/alipay/appCertPublicKey.crt"),
    });

    // const code = '1647485506158657571'
    const code = '11499915135151513251'
    // const code = '1647428490292142469'
    // const code = '11499915135151513252'
    try {
        // const result = await alipaySdk.exec('alipay.trade.wap.pay',
        //     {
        //         bizContent: {
        //             out_trade_no: code,
        //             total_amount: '0.01',  // examData.examCost.toString(),
        //             subject: '考试费用',
        //             product_code: "123",
        //             quit_url: "",
        //         },
        //     },
        //     {
        //         log: console
        //     });
        // console.log('result:', result);
    } catch (error) {
        console.log('error:', error);

    }
    const query = await alipaySdk.exec('alipay.trade.query', { out_trade_no: code }, true)
    console.log('query:', query);
})()