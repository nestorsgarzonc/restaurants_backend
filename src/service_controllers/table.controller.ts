import User from "../models/user/user";
import Table, { TableStatus } from "../models/restaurant/table";
import Restaurant from "../models/restaurant/restaurant";
import MenuItem from "../models/menu/menuItem";
import { redisClient } from "../core/sockets";
import {createOrderQueueInRedis, createTableInRedis} from "../core/util/sockets.utils"

export const joinController = async (userId, tableId) => {
    let user = await User.findById(userId)
    let currentTable = await redisClient.get(`table${tableId}`)
    let currentTableParsed: any = {}
    if (!currentTable) {
        /*const table = await Table.findById(tableId);
        currentTableParsed.usersConnected = [{ userId, firstName: user.firstName, lastName: user.lastName, orderProducts: [], price: 0 }];
        currentTableParsed.needsWaiter = false;
        currentTableParsed.tableStatus = 'ordering';
        currentTableParsed.totalPrice = 0;
        currentTableParsed.restaurantId = table.restaurantId;
        redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));*/
        currentTableParsed = await createTableInRedis(tableId, userId, user.firstName, user.lastName);
    } else {
        currentTableParsed = JSON.parse(currentTable);
        if (!currentTableParsed.usersConnected.some(user => user.userId === userId)) {
            currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, { userId, firstName: user.firstName, lastName: user.lastName, orderProducts: [], price: 0 }];
            currentTableParsed.tableStatus = 'ordering';
            redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
        }

    }
    console.log(currentTableParsed);

    return { user, currentTableParsed };
}
//TODO: Si se vacía la mesa, se borra del redis y se retorna null.
//Si la mesa no existe y se cambia el estado, se añade al redis estando vacía y se retorna.
const changeStatusRedis = async (data) => {
    if(data.status == TableStatus.Empty){
        await redisClient.del(`table${data.tableId}`);
        return null;
    }

    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed: any = {}
    if (!currentTable) {
        const table = await Table.findById(data.tableId);
        currentTableParsed.usersConnected = [];
        currentTableParsed.needsWaiter = false;
        currentTableParsed.tableStatus = data.status;
        currentTableParsed.totalPrice = 0;
        currentTableParsed.restaurantId = table.restaurantId;
        redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
        return currentTableParsed;
    }
    currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.tableStatus = data.status;
    redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    console.log('Redis');

    return currentTableParsed;
}

const changeStatusMongo = async (data) => {
    try {
        console.log('Mongo');
        const table = await Table.findById(data.tableId);
        if (!table) {
            throw new Error('No se encontró la mesa');
        }
        table.status = data.status;
        table.save();
        const restaurantId = table.restaurantId;
        const restaurant = await Restaurant.findById(restaurantId)
            .populate({
                path: 'tables', select: ['status', 'name']
            })
        if (!restaurant) {
            throw new Error("No se encontró el restaurante");
        }
        return { tables: restaurant.tables, restaurantId };
    } catch (error) {
        console.log(error);
    }
}

export const changeStatusController = async (data) => {
    const res = await Promise.all([changeStatusRedis(data), changeStatusMongo(data)])
    return res;
}

export const callWaiterController = async (tableId, stopCalling = false) => {

    let currentTable = await redisClient.get(`table${tableId}`);
    let currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.needsWaiter = !currentTableParsed.needsWaiter;

    let restaurantId = currentTableParsed.restaurantId;

    let tables = await redisClient.get(`${restaurantId}_calling_tables`);
    if (!tables) tables = "";

    let callingTables = new Set(tables.split('$'));
    callingTables.delete('');
    stopCalling ? callingTables.delete(tableId) : callingTables.add(tableId);

    let callingTablesList = [...callingTables];

    redisClient.set(`${restaurantId}_calling_tables`, callingTablesList.join('$'));

    redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
    return { restaurantId, callingTablesList, currentTableParsed }
}

export const orderNowController = async (data) => {

    console.log("entered");
    let currentTable = await redisClient.get(`table${data.tableId}`);
    if (!currentTable) {
        console.log("No se tiene un registro de la mesa")
        throw new Error("No se tiene un registro de la mesa")
    }
    let currentTableParsed = JSON.parse(currentTable);

    //console.log("test");
    currentTableParsed.tableStatus = TableStatus.ConfirmOrder;
    redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    //console.log("Redis");

    const table = await Table.findById(data.tableId);
    if (!table) {
        throw new Error("No se encontró esta mesa");
    }
    table.status = TableStatus.ConfirmOrder;
    await table.save();
    console.log(table);
    return table;
}

export const orderListQueueController = async (tableId, restaurantId) => {

    let table = await Table.findById(tableId);
    let currentTable = await redisClient.get(`table${tableId}`);
    //console.log("orderListQ restaurantId:",restaurantId);
    if (!currentTable) {
        return {orders:[]};
    }
    let currentTableParsed = JSON.parse(currentTable);
    let currentOrder = await redisClient.get(`orderListRestaurant${restaurantId}`);
    let currentOrderParsed: any = {}
    if (!currentOrder) {
        console.log("entered !currentOrder");
        let usersConnected = currentTableParsed.usersConnected;
        console.log("usersConnected:", usersConnected);
        usersConnected.forEach(async user => {
            console.log("entered forEach1");
            console.log("user.orderProducts:", usersConnected);
            user.orderProducts.forEach(async item => {
                console.log("entered forEach2");
                const product = await MenuItem.findById(item._id);
                if (!product) {
                    console.log(`Error al buscar el producto: ${item.name}`);
                    throw new Error(`Error al buscar el producto: ${item.name}`);
                }
                currentOrderParsed = await createOrderQueueInRedis(product.id, restaurantId, tableId, table.name, product.name);
                console.log("createOrderQueueInRedis");
            });
        });
    } else {
        console.log("entered else");
        currentOrderParsed = JSON.parse(currentOrder);
        let usersConnected = currentTableParsed.usersConnected;
        usersConnected.forEach(user => {
            user.orderProducts.forEach(async item => {
                const product = await MenuItem.findById(item._id);
                if (!product) {
                    console.log(`Error al buscar el producto: ${item.name}`);
                    throw new Error(`Error al buscar el producto: ${item.name}`);
                }
                currentOrderParsed.orders = [...currentOrderParsed.orders, { productId: product.id, tableId: tableId, tableName: table.name, productName: product.name, estado: "confirmado" }];
            });
        });
        redisClient.set(`orderListRestaurant${restaurantId}`, JSON.stringify(currentOrderParsed));
        console.log("Set RedisOrderQueue");

    }
    console.log("currentOrderParsed:", currentOrderParsed);

    return currentOrderParsed ;
}