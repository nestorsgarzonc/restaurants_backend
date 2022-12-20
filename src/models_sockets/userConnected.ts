import { ItemDto } from "./Item";

export class UserConnectedDto{
    userId:        string;
    firstName:     string;
    lastName:      string;
    orderProducts: ItemDto[];
    price:         number;

    constructor(data:any){
        this.userId = data.userId;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.orderProducts = [];
        data.orderProducts.forEach(item=>this.orderProducts.push(new ItemDto(item)));
        this.price = data.price;
    }
}