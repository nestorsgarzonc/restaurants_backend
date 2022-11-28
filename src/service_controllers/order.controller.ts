import { redisClient } from '../core/sockets';
import UserOrder from '../models/restaurant/userOrder';
import Order from '../models/restaurant/order';

export const addItemController = async (userId, tableId, data) => {
    let currentTable = await redisClient.get(`table${tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.usersConnected.find(user => user.userId === userId).orderProducts.push(data);
    currentTableParsed.usersConnected.find(user => user.userId === userId).price += data.totalWithToppings;
    currentTableParsed.totalPrice += data.totalWithToppings;
    await redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
    console.log(currentTableParsed);
    return currentTableParsed;
}

export const editItemController = async (userId, tableId, data) => {
    let currentTable = await redisClient.get(`table${tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    let userIndexInArray = currentTableParsed.usersConnected.findIndex(user => user.userId == userId);
    let itemIndexInArray = currentTableParsed.usersConnected[userIndexInArray].orderProducts.findIndex(item => item.uuid === data.uuid);
    currentTableParsed.usersConnected[userIndexInArray].price -= currentTableParsed.usersConnected[userIndexInArray]
        .orderProducts[itemIndexInArray].totalWithToppings;
    currentTableParsed.totalPrice -= currentTableParsed.usersConnected[userIndexInArray]
        .orderProducts[itemIndexInArray].totalWithToppings;
    currentTableParsed.usersConnected[userIndexInArray].price += data.totalWithToppings;
    currentTableParsed.totalPrice += data.totalWithToppings;
    currentTableParsed.usersConnected[userIndexInArray].orderProducts[itemIndexInArray] = data;
    console.log(currentTableParsed);
    await redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
    return currentTableParsed;

}

export const deleteItemController = async (userId, data) => {
    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    let userIndexInArray = currentTableParsed.usersConnected.findIndex(user => user.userId == userId);
    let itemIndexInArray = currentTableParsed.usersConnected[userIndexInArray].orderProducts.findIndex(item => item.uuid === data.uuid);
    currentTableParsed.usersConnected[userIndexInArray].price -= currentTableParsed.usersConnected[userIndexInArray]
        .orderProducts[itemIndexInArray].totalWithToppings;
    currentTableParsed.totalPrice -= currentTableParsed.usersConnected[userIndexInArray]
        .orderProducts[itemIndexInArray].totalWithToppings;
    currentTableParsed.usersConnected[userIndexInArray].orderProducts.splice(itemIndexInArray, 1)
    await redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    return currentTableParsed;
}

export const payAccountController = async (userId, data) => {
    let userOrderIds = [];
    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    const usersOrdersProm = await Promise.all(
        currentTableParsed.usersConnected.map(user => {
            const userOrder = new UserOrder({
                userId: user.userId,
                restaurantId: currentTableParsed.restaurantId,
                tableId: data.tableId,
                orderProducts: user.orderProducts,
                price: user.price
            });
            return userOrder.save();
        })
    )
    userOrderIds = usersOrdersProm.map(userOrder => userOrder._id);
    const order = new Order({
        usersOrder: userOrderIds,
        status: 'finished',
        totalPrice: currentTableParsed.totalPrice,
        restaurantId: currentTableParsed.restaurantId,
        waiterId: userId,
        tip: 5000
    });
    await order.save();
}

export const askAccountController = async (data) => {
    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.tableStatus = data.status;
    await redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    return currentTableParsed;
}