import { TableStatus } from "../models/restaurant/table";
import { ItemDto } from "./Item";
import { UserConnectedDto } from "./userConnected";

export class ListOfOrdersDto {
    usersConnected: UserConnectedDto[];
    needsWaiter:    boolean;
    tableStatus:    string;
    totalPrice:     number;
    restaurantId:   string;

    constructor(data:any){
        this.usersConnected = [];
        data.usersConnected.forEach(user=>
            this.usersConnected.push(new UserConnectedDto(user)));
        this.needsWaiter = data.needsWaiter;
        this.tableStatus = data.tableStatus;
        this.totalPrice = data.totalPrice;
        this.restaurantId = data.restaurantId;
    }

    

}