import { AlipaySdkCommonResult } from "../common/IPayBase"

export interface IPayCreateReqInfo {
    out_trade_no: string    //商户订单号
    total_amount: string  //Price、单位为元,精确到小数点后两位
    subject: string     //	订单标题
    product_code: String   //产品码
    auth_token?: string // 用户付款中途退出返回商户网站的地址
    body?: string    //订单附加信息
    quit_url: string
    goods_detail?: {
        goods_id: string
        alipay_goods_id?: string //支付宝定义的统一商品编号
        goods_name: string
        quantity: number
        price: string
        goods_category?: string
        categories_tree?: string
        body?: string  //描述信息
        show_url?: string //商品的展示地址
    }[]
    time_expire?: string
    timeout_express?: string
    settle_info?: {
        settle_detail_infos: {
            trans_in_type: string    //	结算收款方的账户类型
            trans_in: string
            summary_dimension?: string
            settle_entity_id?: string
            settle_entity_type: string
            amount: string   //price 结算的金额，单位为元。在创建订单和支付接口时必须和交易金额相同
        }[]
        settle_period_time?: string
    }
    extend_params?: {    //业务扩展参数
        sys_service_provider_id?: string
        hb_fq_num?: string   //使用花呗分期要进行的分期数
        hb_fq_seller_percent?: string    //使用花呗分期需要卖家承担的手续费比例的百分值，传入100代表100%
        industry_reflux_info?: string
        card_type?: string
        specified_seller_name?: string
    }
    business_params?: string
    promo_params?: string
    passback_params?: string
    enable_pay_channels?: string
    disable_pay_channels?: string
    specified_channel?: string
    merchant_order_no?: string
    ext_user_info?: {
        name?: string
        mobile?: string
        cert_type?: string
        cert_no?: string
        min_age?: string
        need_check_info?: string
    }
}

export interface IPayCreateResInfo extends AlipaySdkCommonResult {
    out_trade_no: string
    trade_no: string
    total_amount: string
    seller_id: string
    merchant_order_no: string
}