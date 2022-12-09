import { TableInfoDto } from "./tableInfo";

export class AddItemDto extends TableInfoDto{
    
    constructor(data: any){
        super(data);
    }
} 
/*
_id:               string;
    name:              string;
    price:             number;
    description:       string;
    imgUrl:            string;
    toppings:          Topping[];
    categoryId:        string;
    __v:               number;
    note:              string;
    totalWithToppings: number;
    token:             string;
    tableId:           string;
    uuid:              string;*/