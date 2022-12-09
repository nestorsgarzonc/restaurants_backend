import { io, socket } from '../core/sockets';
import { checkUser } from "../core/util/sockets.utils";
import * as OrderController from '../service_controllers/order.controller';
import * as socketEvents from "../core/constants/sockets.events";

export const addItem = async (data) => {
    const { token, tableId, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.addItemController(userId, tableId, orderData);
    io.to(data.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

export const editItem = async (data) => {
    console.log(data);
    const { token, tableId, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.editItemController(userId, tableId, orderData);
    io.to(tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

export const deleteItem = async (data) => {
    const { token, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.deleteItemController(userId, orderData);
    io.to(orderData.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

export const askAccount = async (data) => {
    const { token, ...orderData } = data;
    const userId = await checkUser(token);
    if (!userId) return;
    const currentTableParsed = await OrderController.askAccountController(orderData);
    io.to(data.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}
