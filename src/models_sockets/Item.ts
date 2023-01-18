import { ItemUuidDto } from "./itemUuidDto";

export class ItemDto {
    _id:               string;
    name:              string;
    price:             number;
    description:       string;
    img:            string;
    toppings:          Topping[];
    categoryId:        string;
    note:              string;
    totalWithToppings: number;
    uuid:              string;
    isAvaliable:       boolean;
    constructor(data: any){
        this._id = data._id;
        this.name = data.name;
        this.price = data.price;
        this.description = data.description;
        this.img = data.img;
        this.toppings = [];
        data.toppings.forEach(topping=>{
            let options = [];
            topping.options.forEach(option=>options.push(new Option(option)));
            topping.options = options;
            this.toppings.push(new Topping(topping));
        });
        this.categoryId = data.categoryId;
        this.note = data.note;
        this.totalWithToppings = data.totalWithToppings;
        this.uuid = data.uuid;
        this.isAvaliable = data.isAvaliable;
        if(!this.uuid)throw new Error('No se envío el uuid correspondiente');
        if(!this.totalWithToppings)throw new Error('No llegó el costo del plato');
        if(!data.toppings)throw new Error('No se enviaron los toppings');
    }
} 


export class Topping {
    _id:       string;
    name:      string;
    type:      string;
    options:   Option[];
    maxOptions: number;
    minOptions: number;
    constructor(data:any){
        this._id = data._id;
        this.name = data.name;
        this.type = data.type;
        this.options = data.options;
        this.maxOptions = data.maxOptions;
        this.minOptions = data.minOptions
    }
}

export class Option {
    _id:       string;
    name:      string;
    price:     number;
    img:    string;
    constructor(data:any){
        this._id = data._id;
        this.name = data.name;
        this.price = data.price;
        this.img = data.img;
    }
}