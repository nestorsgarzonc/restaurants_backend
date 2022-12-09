export class RestaurantInfoDto{
    token:   string;
    restaurantId: string;

    constructor(data: any){
        this.token = data.token;
        this.restaurantId = data.tableId;
        if(!this.token)throw new Error('Autenticación requerida');
        if(!this.restaurantId)throw new Error('Se requiere algún restaurante');
    }
}