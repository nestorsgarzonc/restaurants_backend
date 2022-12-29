import { tokenIsValidSocket } from "../../middlewares/auth.middleware";
import { io, socket } from '../sockets';
import Table, { TableStatus } from "../../models/restaurant/table";
import Restaurant from "../../models/restaurant/restaurant";
import { redisClient } from "../sockets";
import * as socketEvents from "../../core/constants/sockets.events";
import { ListOfOrdersDto } from "../../models_sockets/listOfOrders";
import { PaymentStatus } from "../../models_sockets/userConnected";
import OrderProduct from '../../models/restaurant/orderProduct';
import OrderTopping from '../../models/restaurant/orderTopping';
import OrderToppingOption from '../../models/restaurant/orderToppingOption';
import User from '../../models/user/user';
import UserOrder from '../../models/restaurant/userOrder';
import Order from '../../models/restaurant/order';
import { PaymentWays } from "../../models_sockets/askAccount";
import { sendPush } from "./push.utils";

export const checkUser = async (token) => {
    let userId = await tokenIsValidSocket(token);

    if (!userId) {
        let timestamp = Date.now().toString();
        socket.join(timestamp);
        io.to(timestamp).emit(socketEvents.error, { reason: 'no userId' });
        return null;
    }

    return userId;
}

export const createTableInRedis = async (tableId, userId, firstName, lastName,deviceToken) => {
    const table = await Table.findById(tableId);
    let currentTableParsed = new ListOfOrdersDto({
        needsWaiter: false,
         tableStatus: TableStatus.Ordering,
         totalPrice: 0,
         restaurantId:table.restaurantId,
         usersConnected: [{
            userId,
            firstName,
            lastName,
            price: 0,
            orderProducts: [],
            paymentStatus: PaymentStatus.NotPayed,
            deviceToken
         }]
    });


    await redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
    return currentTableParsed;
}

export const createOrderQueueInRedis = async (productId, restaurantId, tableId, tableName, productName) => {
    let currentOrdersParsed: any = {}
    currentOrdersParsed.orders = [{ productId, tableId, tableName: tableName, productName: productName, estado: "Confirmado" }];
    //estados: [Confirmado, Cocinando, Listo para entrega, Entregado]
    //TODO: cear constantes para los strings de redis
    await redisClient.set(`orderListRestaurant${restaurantId}`, JSON.stringify(currentOrdersParsed));
    return currentOrdersParsed;
}

export const updateOrderQueueInRedis = async (productId, restaurantId, tableId, tableName, productName) => {
    let currentOrder = await redisClient.get(`orderListRestaurant${restaurantId}`);
    let currentOrdersParsed = JSON.parse(currentOrder);
    currentOrdersParsed.orders = [...currentOrdersParsed.orders, { productId: productId, tableId: tableId, tableName: tableName, productName: productName, estado: "Confirmado" }];
    //estados: [Confirmado, Cocinando, Listo para entrega, Entregado]
    await redisClient.set(`orderListRestaurant${restaurantId}`, JSON.stringify(currentOrdersParsed));
    return currentOrdersParsed;
}

export const saveOrderFromRedis = async(tableId,userId,tip,paymentWay,paymentMethod) => {
    
    let currentTable = await redisClient.get(`table${tableId}`);
    let currentTableParsed = JSON.parse(currentTable);

    let userOrderIds = [];

    for (let user of currentTableParsed.usersConnected) {
        let orderProductIds = [];

        for (let product of user.orderProducts) {
            let orderToppingIds = [];

            for (let topping of product.toppings) {
                let orderToppingOptionIds = [];

                for (let option of topping.options) {
                    orderToppingOptionIds.push(option._id);
                }

                const orderTopping = new OrderTopping({
                    toppingId: topping._id,
                    toppingOptions: orderToppingOptionIds,
                });
                await orderTopping.save();
                orderToppingIds.push(orderTopping._id);
            }

            const orderProduct = new OrderProduct({
                productId: product._id,
                toppings: orderToppingIds,
                price: product.totalWithToppings,
            });
            await orderProduct.save();
            orderProductIds.push(orderProduct._id);

        }
        
        let payer;
        if(!user.payedBy)payer = userId;
        else payer = user.payedBy;

        const userOrder = new UserOrder({
            userId: user.userId,
            orderProducts: orderProductIds,
            price: user.price,
            payedBy: payer
        });
        await userOrder.save();
        userOrderIds.push(userOrder._id);
        //TODO: Enviar notificación push

    }

    const order = new Order({
        usersOrder: userOrderIds,
        tableId: tableId,
        totalPrice: currentTableParsed.totalPrice,
        restaurantId: currentTableParsed.restaurantId,
        tip: tip,
        paymentWay: paymentWay,
        paymentMethod: paymentMethod
    });
    await order.save();
    for (let user of currentTableParsed.usersConnected) {
        const mongoUser = await User.findById(user.userId);
        mongoUser.ordersStory.push(order._id);
        await mongoUser.save();
    }
    if(paymentWay==PaymentWays.Altogether){
        const payer = currentTableParsed.usersConnected.find(user=>user.userId==userId);
        currentTableParsed.usersConnected.forEach(user=>{
            sendPush(user.deviceToken,"Cuenta pagada",`${payer.firstName} ${payer.lastName} ha pagado toda la cuenta.`)
        })
    }
    await redisClient.del(`table${tableId}`);
    return order._id;
}