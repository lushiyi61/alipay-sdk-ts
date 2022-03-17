export interface IPayBaseReq {
    appid: string       //支付宝分配给开发者的应用ID
    method: string     //接口名称
    format?: string  // JSON
    return_url?: string
    charset: string //请求使用的编码格式，如utf-8,
    sign_type: string  //商户生成签名字符串的签名算法类型
    sign: string   //签名字符串
    timestamp: string   //"yyyy-MM-dd HH:mm:ss"
    version: string
    notify_url?: string
    app_auth_token?: string
    biz_content: string  //除公共参数外所有请求参数都必须放在这个参数中传递
}

export interface AlipaySdkCommonResult {
    code: string
    msg: string
    sub_code?: string
    sub_msg?: string
    sign: string
}