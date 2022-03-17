export interface IPayQueryReqInfo {
    out_trade_no?: string    //	订单支付时传入的商户订单号,和支付宝交易号不能同时为空。
    trade_no?: string        //支付宝交易号，和商户订单号不能同时为空
    org_pid?: string
    query_options?: String[]
}

export interface IPayQueryResInfo {
    trade_no: string
    out_trade_no: string
    buyer_logon_id: string
    trade_status: string
    total_amount: string
    trans_currency?: string
    settle_currency?: string
    settle_amount?: string
    pay_currency?: string
    pay_amount?: string
    settle_trans_rate?: string
    trans_pay_rate?: string
    buyer_pay_amount?: string
    point_amount?: string
    invoice_amount?: string      //交易中用户支付的可开具发票的金额
    send_pay_date?: Date
    receipt_amount?: string
    store_id?: string
    terminal_id?: string
    fund_bill_list: {
        fund_channel: string
        amount: string
        real_amount?: string
    }[]
    store_name?: string
    buyer_user_id: string
    industry_sepc_detail_gov?: string
    industry_sepc_detail_acc?: string
    charge_amount?: string
    charge_flags?: string
    settlement_id?: string
    trade_settle_info?: {
        trade_settle_detail_list: {
            operation_type: string
            operation_serial_no?: string
            operation_dt: string
            trans_out?: string
            trans_in?: string
            amount: string
            ori_trans_out?: string
            ori_trans_in?: string
        }[]
    }
    auth_trade_pay_mode?: string
    buyer_user_type?: string
    mdiscount_amount?: string
    discount_amount?: string
    subject?: string
    body?: string
    alipay_sub_merchant_id?: string
    ext_infos?: string
    passback_params?: string
    hb_fq_pay_info?: {
        user_install_num?: string
    }
    credit_pay_mode?: string
    credit_biz_order_id?: string
    enterprise_pay_info?: {
        invoice_amount: string
    }
}