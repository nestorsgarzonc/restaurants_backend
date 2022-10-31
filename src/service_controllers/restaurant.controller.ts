
import Restaurant from "../models/restaurant/restaurant";


export const getTableListController = async(data) => {
    try{
        const restaurantId = data.restaurantId;
        console.log(restaurantId);
        const restaurant = await Restaurant.findById(restaurantId)
            .populate({
                path:'tables',select:['status','name']
            })
        if(!restaurant ){
            throw new Error("No se encontró el restaurante");
        }
        return restaurant.tables;
    }catch(error){
        console.log(error);
    }
    
}