import { getMenuToppings } from '../controllers/menu.controller';
import { redisClient } from '../core/sockets';
import Restaurant from '../models/restaurant/restaurant';

export const  getMenu = async(restaurantId)=>{
    
    const restaurant = await Restaurant.findById(restaurantId)
        .populate({
            path: 'menu',
            populate: {
                path: 'menuItems'
            }
        })

    return restaurant;
    
}