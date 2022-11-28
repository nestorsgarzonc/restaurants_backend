import { redisClient } from '../core/sockets';
import Waiter from '../models/restaurant/waiter';
import * as OrderController from '../service_controllers/order.controller';
import { createTableInRedis } from '../core/util/sockets.utils';

export const listenTablesController = async (waiterId) => {
    const waiter = await Waiter.findOne({ 'user': waiterId })
    let restaurantId = waiter.restaurant;
    let tables = await redisClient.get(`${restaurantId}_calling_tables`);
    if (!tables) tables = "";
    let callingTables = new Set(tables.split('$'));
    callingTables.delete('');
    return { callingTables, restaurantId };
}

export const watchTableController = async (tableId) => {
    let currentTable = await redisClient.get(`table${tableId}`);
    if (!currentTable) return {};
    let currentTableParsed = JSON.parse(currentTable);
    return currentTableParsed;
}

export const addItemToTableController = async (userId, tableId, data) => {
    //In this case the userId field makes references to the user who the order is gonna be added to
    if (!userId) {
        let currentTable = await redisClient.get(`table${tableId}`)
        let currentTableParsed = JSON.parse(currentTable);
        if (!currentTable) {
            await createTableInRedis(tableId, tableId, "Restaurant", "")
        } else {
            currentTableParsed.usersConnected.push({
                userId: tableId,
                firstName: "Restaurant",
                lastName: "",
                orderProducts: [],
                price: 0
            })
            await redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
        }
        return await OrderController.addItemController(tableId, tableId, data);
    }
    return await OrderController.addItemController(userId, tableId, data);
}