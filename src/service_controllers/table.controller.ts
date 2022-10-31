import User from "../models/user/user";
import Table, { TableStatus } from "../models/restaurant/table";
import Restaurant from "../models/restaurant/restaurant";
import { redisClient } from "../core/sockets";

export const joinController = async (userId, tableId) => {
    let user = await User.findById(userId)
    let currentTable = await redisClient.get(`table${tableId}`)
    let currentTableParsed: any = {}
    if (!currentTable) {
        const table = await Table.findById(tableId);
        currentTableParsed.usersConnected = [{ userId, firstName: user.firstName, lastName: user.lastName, orderProducts: [], price: 0 }];
        currentTableParsed.needsWaiter = false;
        currentTableParsed.tableStatus = 'ordering';
        currentTableParsed.totalPrice = 0;
        currentTableParsed.restaurantId = table.restaurantId;
        redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
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

const changeStatusRedis = async (data) => {
    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
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

    console.log("test");
    currentTableParsed.tableStatus = TableStatus.ConfirmOrder;
    redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    console.log("Redis");

    const table = await Table.findById(data.tableId);
    if (!table) {
        throw new Error("No se encontró esta mesa");
    }
    table.status = TableStatus.ConfirmOrder;
    await table.save();
    console.log(table);
    return table;
}