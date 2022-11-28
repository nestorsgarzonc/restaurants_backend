
import Restaurant from "../models/restaurant/restaurant";
import { redisClient } from "../core/sockets";

export const getTableListController = async (data) => {
    try {
        const restaurantId = data.restaurantId;
        let tables = await redisClient.get(`${restaurantId}_calling_tables`);
        if (!tables) tables = "";
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
        return { tables: restaurant.tables, callingTables: callingTables };
    } catch (error) {
        console.log(error);
    }

}