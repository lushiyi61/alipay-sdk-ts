import { IPayBaseRes } from './IPayBase';
export interface IRefundQueryReq {
    trade_no?: string
    out_trade_no?: string
    out_request_no: string
    query_options?: string
}

export interface IRefundQueryRes extends IPayBaseRes{
    trade_no?: string
    out_trade_no?: string
    out_request_no: string
    refund_reason?: string
    total_amount?: string
    refund_amount?: string
    refund_status?: string
    refund_royaltys?: {
        refund_amount: string
        royalty_type?: string
        result_code?: string
        trans_out?: string
        trans_out_email?: string
        trans_in?: string
        trans_in_email?: string
    }
    gmt_refund_pay?: string
    refund_detail_item_list?: {
        fund_channel: string
        amount: string
        real_amount?: string
        fund_type?: string
    }
    send_back_fee?: string
    deposit_back_info?: {
        has_deposit_back: string
        dback_status: string
        dback_amount: string
        bank_ack_time: string
        est_bank_receipt_time: string
    }
}
