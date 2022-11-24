import { tokenIsValidSocket } from "../../middlewares/auth.middleware";
import {io, socket} from '../sockets';
import Table from "../../models/restaurant/table";
import Restaurant from "../../models/restaurant/restaurant";
import { redisClient } from "../sockets";

export const checkUser = async (token) => {
    let userId = await tokenIsValidSocket(token);
                
    if (!userId) {
        let timestamp = Date.now().toString();
        socket.join(timestamp);
        io.to(timestamp).emit('error', { reason: 'no userId' });
        return null;
    }

    return userId;
}

export const createTableInRedis =async (tableId, userId, firstName, lastName) => {
    const table = await Table.findById(tableId);
    let currentTableParsed: any = {}
    currentTableParsed.usersConnected = [{ userId, firstName: firstName, lastName: lastName, orderProducts: [], price: 0 }];
    currentTableParsed.needsWaiter = false;
    currentTableParsed.tableStatus = 'ordering';
    currentTableParsed.totalPrice = 0;
    currentTableParsed.restaurantId = table.restaurantId;
    redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));

    return currentTableParsed;
}

export const createOrderQueueInRedis =async (productId, restaurantId, tableId, tableName, productName) => {
    let currentOrdersParsed: any = {}
    currentOrdersParsed.orders = [{ productId, tableId, tableName: tableName, productName: productName, estado: "Confirmado" }];
    //estados: [Confirmado, Cocinando, Listo para entrega, Entregado]
    //TODO: cear constantes para los strings de redis
    redisClient.set(`orderListRestaurant${restaurantId}`, JSON.stringify(currentOrdersParsed));
    return currentOrdersParsed;
}

export const updateOrderQueueInRedis =async (productId, restaurantId, tableId, tableName, productName) => {
    let currentOrder = await redisClient.get(`orderListRestaurant${restaurantId}`);
    let currentOrdersParsed = JSON.parse(currentOrder);
    currentOrdersParsed.orders = [...currentOrdersParsed.orders, { productId: productId, tableId: tableId, tableName: tableName, productName: productName, estado: "Confirmado" }];
    //estados: [Confirmado, Cocinando, Listo para entrega, Entregado]
    redisClient.set(`orderListRestaurant${restaurantId}`, JSON.stringify(currentOrdersParsed));
    return currentOrdersParsed;
}
