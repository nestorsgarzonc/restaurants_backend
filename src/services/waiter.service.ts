import { io, socket } from '../core/sockets';
import { checkUser } from '../core/util/sockets.utils';
import * as WaiterController from '../service_controllers/waiter.controller';
import * as socketEvents from "../core/constants/sockets.events";

export const listenTables = async (data) => {
    let { token } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let { callingTables, restaurantId } = await WaiterController.listenTablesController(userId);
    console.log(`your waiter is conected to restaurant room: ${restaurantId}`);
    socket.join(userId);
    io.to(userId).emit(socketEvents.customerRequests, { requests: [...callingTables] });
    socket.join(`${restaurantId}`);

}

export const watchTable = async (data) => {
    //check if waiter
    let { token, tableId } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let currentTableParsed = await WaiterController.watchTableController(tableId);
    socket.join(userId);
    io.to(userId).emit(socketEvents.listOfOrders, { table: currentTableParsed })
    socket.join(tableId);
}

export const addItemToTable = async (data) => {
    let { token, tableId, clientId, ...orderData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    console.log(clientId)
    let currentTableParsed = await WaiterController.addItemToTableController(clientId, tableId, orderData);
    socket.join(tableId);
    io.to(tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });

}

export const leaveTable = async (data) => {
    let { token, tableId } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    socket.leave(tableId);
    io.to(userId).emit('msg', { msg: 'room leaved successfully' })
}