import { AlipaySdkCommonResult } from './IPayBase';
export interface IRefundCreateReq {
    out_trade_no: string
    trade_no: string
    refund_amount?: string
    refund_reason?: string
    out_request_no?: string
    refund_royalty_parameters?: {
        royalty_type?: string
        trans_out?: string
        trans_out_type?: string
        trans_in_type?: string
        trans_in?: string
        amount?: string
        desc?: string
        royalty_scene?: string
        trans_in_name?: string
    }
    query_options?: string[]
}

export interface IRefundCreateRes extends AlipaySdkCommonResult{
    trade_no: string
    out_trade_no: string
    buyer_logon_id: string
    fund_change: string
    refund_fee: string
    refund_detail_item_list: {
        fund_channel: string
        amount: string
        real_amount?: string
        fund_type?: string
    }[]
    store_name?: string
    buyer_user_id: string
    send_back_fee: string
}