
import Restaurant from "../models/restaurant/restaurant";
import { redisClient } from "../core/sockets";

export const getTableListController = async (data) => {
    try {
        const restaurantId = data.restaurantId;
        let [tables, orders] = await Promise.all([
            redisClient.get(`${restaurantId}_calling_tables`),
            redisClient.get(`orderListRestaurant${restaurantId}`),
        ])
        if (!tables) tables = "";
        let ordersParsed: any = {};
        if (!orders) {
            ordersParsed.orders = [];
        }
        else {
            ordersParsed = JSON.parse(orders);
        }
        let callingTables = tables.split('$');
        console.log(callingTables);
        console.log(restaurantId);
        const restaurant = await Restaurant.findById(restaurantId)
            .populate({
                path: 'tables', select: ['status', 'name']
            })
        if (!restaurant) {
            throw new Error("No se encontró el restaurante");
        }
        return { tables: restaurant.tables, callingTables, ordersParsed };
    } catch (error) {
        console.log(error);
    }

}