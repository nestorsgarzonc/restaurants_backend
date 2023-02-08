import Restaurant from '../../models/restaurant/restaurant';

export const getRestaurantWithMenu = async(restaurantId) =>{
    const restaurant = await Restaurant.findById(restaurantId)
            .populate({
                path: 'menu',
                populate: {
                    path: 'menuItems'
                }
            });
    return restaurant;
}