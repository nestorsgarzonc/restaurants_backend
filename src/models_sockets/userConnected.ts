import { ItemDto } from "./Item";


export enum PaymentStatus{
    Payed = 'payed',
    NotPayed = 'not_payed'
}
export class UserConnectedDto{
    userId:        string;
    firstName:     string;
    lastName:      string;
    orderProducts: ItemDto[];
    price:         number;
    paymentStatus: string;
    payedBy:       string;
    pushToken:     string;
    constructor(data:any){
        this.userId = data.userId;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.orderProducts = [];
        data.orderProducts.forEach(item=>this.orderProducts.push(new ItemDto(item)));
        this.price = data.price;
        this.paymentStatus = data.paymentStatus;
        this.pushToken = data.pushToken;
        if(!this.paymentStatus)throw new Error('Se requiere un estado del pago.');
    }
}