import { IPayBaseRes } from './IPayBase';

export interface IPayCloseReqInfo {
    trade_no: string
    out_trade_no: string
    operator_id: string
}

export interface IPayCloseResInfo extends IPayBaseRes {
    trade_no: string
    out_trade_no: string
}
