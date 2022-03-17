import { AlipaySdkCommonResult } from './IPayBase';

export interface IPayCloseReqInfo {
    trade_no: string
    out_trade_no: string
    operator_id: string
}

export interface IPayCloseResInfo extends AlipaySdkCommonResult {
    trade_no: string
    out_trade_no: string
}
