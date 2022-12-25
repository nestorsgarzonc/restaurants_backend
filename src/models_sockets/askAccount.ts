import { TableInfoDto } from "./tableInfo";


export enum PaymentWays{
    Altogether = 'altogether',
    Single = 'single',
    Equal = 'equal'
}


export class AskAccountDto extends TableInfoDto{
    paymentWay : string;
    constructor(data:any){
        super(data);
        this.paymentWay = data.paymentWay;
        if(!this.paymentWay)throw new Error('Se debe especificar la forma en que se paga.');
    }
}