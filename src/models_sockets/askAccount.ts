import { TableInfoDto } from "./tableInfo";


export enum PaymentWays{
    All = 'all',
    Split = 'split',
    Same = 'same',
    Respective = 'respective'
}


export class AskAccountDto extends TableInfoDto{
    paymentWay : string;
    individualPaymentWay: string;
    constructor(data:any){
        super(data);
        this.paymentWay = data.paymentWay;
        if(!this.paymentWay)throw new Error('Se debe especificar la forma en que se paga.');
        if(this.paymentWay==PaymentWays.Split)this.individualPaymentWay = data.individualPaymentWay;
    }
}