import { io, socket } from '../core/sockets';
import { checkUser } from "../core/util/sockets.utils";
import * as OrderController from '../service_controllers/order.controller';
import * as socketEvents from "../core/constants/sockets.events";
import { ItemDto } from '../models_sockets/Item';
import { ItemUuidDto } from '../models_sockets/itemUuidDto';
import { TableInfoDto } from '../models_sockets/tableInfo';

export const addItem = async (data) => {
    const tableInfo = new TableInfoDto(data);
    data = new ItemDto(data);
    console.log(data);
    const { token, tableId } = tableInfo;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.addItemController(userId, tableId, data);
    console.log(currentTableParsed);
    io.to(tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

export const editItem = async (data) => {
    const tableInfo = new TableInfoDto(data);
    data = new ItemDto(data);
    const { token, tableId} = tableInfo;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.editItemController(userId, tableId, data);
    io.to(tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

export const deleteItem = async (data) => {
    data = new ItemUuidDto(data);
    const { token, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await OrderController.deleteItemController(userId, orderData);
    io.to(orderData.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

export const askAccount = async (data) => {
    data = new TableInfoDto(data);
    const { token, ...orderData } = data;
    const userId = await checkUser(token);
    if (!userId) return;
    const currentTableParsed = await OrderController.askAccountController(orderData);
    io.to(data.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}
