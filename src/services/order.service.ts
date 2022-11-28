import { io, socket } from '../core/sockets';
import { checkUser } from "../core/util/sockets.utils";
import * as OrderController from '../service_controllers/order.controller';


export const addItem = async (data) => {
    const { token, tableId, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.addItemController(userId, tableId, orderData);
    io.to(data.tableId).emit('list_of_orders', { table: currentTableParsed });
}

export const editItem = async (data) => {
    console.log(data);
    const { token, tableId, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.editItemController(userId, tableId, orderData);
    io.to(tableId).emit('list_of_orders', { table: currentTableParsed });
}

export const deleteItem = async (data) => {
    const { token, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.deleteItemController(userId, orderData);
    io.to(orderData.tableId).emit('list_of_orders', { table: currentTableParsed });
}

export const askAccount = async (data) => {
    const { token, ...orderData } = data;
    const userId = await checkUser(token);
    if (!userId) return;
    const currentTableParsed = await OrderController.askAccountController(orderData);
    io.to(data.tableId).emit('list_of_orders', { table: currentTableParsed });
}
