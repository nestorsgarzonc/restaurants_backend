import { redisClient } from '../core/sockets';
import UserOrder from '../models/restaurant/userOrder';
import Order from '../models/restaurant/order';
import { ListOfOrdersDto } from '../models_sockets/listOfOrders';
import { AskAccountDto } from '../models_sockets/askAccount';
import { PaymentStatus } from '../models_sockets/userConnected';
import { saveOrderFromRedis } from '../core/util/sockets.utils';
import { TableStatus } from '../models/restaurant/table';
import { sendPush } from '../core/util/push.utils';
import User from '../models/user/user';
export const addItemController = async (userId, tableId, data) => {
    let currentTable = await redisClient.get(`table${tableId}`)
    let currentTableParsed = new ListOfOrdersDto(JSON.parse(currentTable)) ;
    console.log(currentTableParsed);
    currentTableParsed.usersConnected.find(user => user.userId === userId).orderProducts.push(data);
    currentTableParsed.usersConnected.find(user => user.userId === userId).price += data.totalWithToppings;
    currentTableParsed.totalPrice += data.totalWithToppings;
    await redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
    //console.log(currentTableParsed);
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



export const askAccountController = async (data) => {
    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.tableStatus = TableStatus.Paying;
    await redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    return currentTableParsed;
}

export const payAccountController = async(userId,data)  => {
    let currentTable = await redisClient.get(`table${data.tableId}`);
    let currentTableParsed = JSON.parse(currentTable);
    let allPayed = true;
    let alreadyPayed = false;
    let userNamePayed;
    //TODO: Pasarela de pagos dependiendo de como se pague
    const payer = currentTableParsed.usersConnected.find(user=>user.userId==userId);
    currentTableParsed.usersConnected.forEach(user => {
        if(user.userId==userId || data.paysFor.has(user.userId)){
            if(user.paymentStatus===PaymentStatus.Payed){
                alreadyPayed = true;
                userNamePayed = user.firstName+' '+user.lastName;
            }
            console.log(user);
            if(user.userId==userId)sendPush(user.deviceToken,'Pagaste', 'Estás a paz y salvo, espera a que el resto de tu mesa termine de pagar.');
            else sendPush(user.deviceToken,'Te invitaron',`${payer.firstName} ${payer.lastName} ha pagado tu cuenta.`);
            user.payedBy = userId;
            user.paymentStatus = PaymentStatus.Payed;
        }
        if(user.paymentStatus==PaymentStatus.NotPayed)allPayed = false;
    })
    if(alreadyPayed)return {error:`${userNamePayed} ya pagó su cuenta.`};
    await redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    if(allPayed){
        const orderId = await saveOrderFromRedis(data.tableId,userId,data.tip,data.paymentWay,data.individualPaymentWay,data.paymentMethod);
        return {allPayed,orderId:orderId};
    }
    return {allPayed,table:currentTableParsed};
    
}