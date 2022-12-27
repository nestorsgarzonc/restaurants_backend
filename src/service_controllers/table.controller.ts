import User from "../models/user/user";
import Table, { TableStatus } from "../models/restaurant/table";
import Restaurant from "../models/restaurant/restaurant";
import MenuItem from "../models/menu/menuItem";
import { redisClient } from "../core/sockets";
import { updateOrderQueueInRedis, createOrderQueueInRedis, createTableInRedis } from "../core/util/sockets.utils"
import { PaymentStatus } from "../models_sockets/userConnected";

export const joinController = async (userId, tableId) => {
    let user = await User.findById(userId)
    let [_, currentTable] = await Promise.all([
        Table.findOneAndUpdate({ _id: tableId }, { status: TableStatus.Ordering }),
        redisClient.get(`table${tableId}`)
    ])
    let currentTableParsed: any = {}
    if (!currentTable) {
        currentTableParsed = await createTableInRedis(tableId, userId, user.firstName, user.lastName,user.deviceToken);
    } else {
        currentTableParsed = JSON.parse(currentTable);
        if (!currentTableParsed.usersConnected.some(user => user.userId === userId)) {
            currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, { userId, firstName: user.firstName, lastName: user.lastName, orderProducts: [], price: 0 ,paymentStatus:PaymentStatus.NotPayed,deviceToke:user.deviceToken}];
            currentTableParsed.tableStatus = TableStatus.Ordering;
            await redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
        }
    }
    console.log(currentTableParsed);
    return { user, currentTableParsed };
}
//TODO: Si se vacía la mesa, se borra del redis y se retorna null.
//Si la mesa no existe y se cambia el estado, se añade al redis estando vacía y se retorna.
const changeStatusRedis = async (data) => {
    if (data.status == TableStatus.Empty) {
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
        await redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
        return currentTableParsed;
    }
    currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.tableStatus = data.status;
    await redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
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
        await table.save();
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
    await Promise.all([
        redisClient.set(`${restaurantId}_calling_tables`, callingTablesList.join('$')),
        redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed)),
    ])
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
    const [_, table] = await Promise.all([
        redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed)),
        Table.findById(data.tableId),
    ])
    console.log("#############")
    console.log("finded table:")
    console.log(table)
    console.log("#############")
    if (!table) {
        throw new Error("No se encontró esta mesa");
    }
    table.status = TableStatus.ConfirmOrder;
    await table.save();
    console.log("#############")
    console.log(table);
    console.log("#############")
    return currentTableParsed;
}

export const orderListQueueController = async (tableClient) => {
    const { tableId } = tableClient
    const [table, currentTable] = await Promise.all([
        Table.findById(tableId),
        redisClient.get(`table${tableId}`),
    ])
    const { restaurantId } = table
    if (!currentTable) {
        return { orders: [] };
    }
    let currentTableParsed = JSON.parse(currentTable);
    let currentOrder = await redisClient.get(`orderListRestaurant${restaurantId}`);
    let currentOrderParsed: any = {}
    if (!currentOrder) {
        console.log("entered !currentOrder");
        currentOrderParsed = await createNewOrderQueueRedisObject(currentTableParsed, currentOrder, tableId, restaurantId, table.name);
    } else {
        console.log("entered else");
        currentOrderParsed = await updateNewOrderQueueRedisObject(currentTableParsed, currentOrder, tableId, restaurantId, table.name);
    }
    console.log("currentOrderParsed:", currentOrderParsed);
    return currentOrderParsed;
}

const createNewOrderQueueRedisObject = async (currentTableParsed, currentOrder, tableId, restaurantId, tableName) => {
    let currentOrderParsed: any = {}
    let usersConnected = currentTableParsed.usersConnected;
    console.log("usersConnected:", usersConnected);
    for (var i = 0; i < usersConnected.length; i++) {
        let user = usersConnected[i];
        console.log("entered create for1");
        console.log("user.orderProducts:", user.orderProducts);
        for (var j = 0; j < user.orderProducts.length; j++) {
            let item = user.orderProducts[j];
            console.log("entered create for2");
            console.log("item:", item);
            if (!currentOrder) {
                console.log("currentOrder:", currentOrder);
                currentOrderParsed = await createOrderQueueInRedis(item._id, restaurantId, tableId, tableName, item.name);
                currentOrder = await redisClient.get(`orderListRestaurant${restaurantId}`);
                console.log("createOrderQueueInRedis");
            } else {
                currentOrderParsed = await updateOrderQueueInRedis(item._id, restaurantId, tableId, tableName, item.name);
                console.log("updateOrderQueueInRedis");
            }
        };
    };
    return currentOrderParsed;
}

const updateNewOrderQueueRedisObject = async (currentTableParsed, currentOrder, tableId, restaurantId, tableName) => {
    let currentOrderParsed = JSON.parse(currentOrder);
    let usersConnected = currentTableParsed.usersConnected;
    for (var i = 0; i < usersConnected.length; i++) {
        //usersConnected.forEach(async user => {
        let user = usersConnected[i];
        console.log("entered for1");
        console.log("user.orderProducts:", user.orderProducts);
        for (var j = 0; j < user.orderProducts.length; j++) {
            let item = user.orderProducts[j];
            currentOrderParsed.orders = [...currentOrderParsed.orders, { productId: item.id, tableId, tableName, productName: item.name, estado: "confirmado" }];
        }
    }
    await redisClient.set(`orderListRestaurant${restaurantId}`, JSON.stringify(currentOrderParsed));
    console.log("Set RedisOrderQueue", currentOrderParsed);
    return currentOrderParsed;
}