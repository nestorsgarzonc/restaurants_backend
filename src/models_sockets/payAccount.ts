import { TableInfoDto } from "./tableInfo";

export class PayAccountDto extends TableInfoDto{
    paysFor: Set<string>;
    paymentWay: string[];
    paymentMethod: string[];
    constructor(data:any){
        super(data);
        this.paysFor = new Set();
        data.paysFor.forEach(userId => this.paysFor.add(userId));
        this.paymentWay = data.paymentWay;
        this.paymentMethod = data.paymentMethod;
        if(!this.paymentWay)throw new Error('Se requiere una forma de pago.');
        if(!this.paymentMethod)throw new Error('Se requiere un método de pago.');
    }
}