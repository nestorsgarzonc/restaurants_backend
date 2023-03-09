import { checkUser } from "../core/util/sockets.utils";
import { io, socket } from '../core/sockets';
import * as TableController from '../service_controllers/table.controller';
import { TableInfoDto } from "../models_sockets/tableInfo";
import { ChangeTableStatusDto } from "../models_sockets/changeTableStatus";
import * as socketEvents from "../core/constants/sockets.events";
export const join = async (data) => {
    data = new TableInfoDto(data);

    console.log(data);
    let userId = await checkUser(data.token);
    if (!userId) return;
    let { user, currentTableParsed,restaurantId } = await TableController.joinController(userId, data.tableId);
    socket.join(data.tableId);
    socket.join(`bus_${restaurantId}`);
    io.to(data.tableId).emit(socketEvents.newUserJoined, { table: currentTableParsed, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
};

export const changeStatus = async (data) => {
    data = new ChangeTableStatusDto(data);
    let { token, ...tableData } = data;
    console.log(token);
    console.log(tableData);
    let userId = await checkUser(token);
    if (!userId) return;
    let [redisRes, { tables, restaurantId }] = await TableController.changeStatusController(tableData);
    console.log(tables);
    console.log(data.tableId);
    io.to(data.tableId).emit(socketEvents.listOfOrders, { table: redisRes })
    io.to(restaurantId.toString()).emit(socketEvents.restaurantTables, { tables: tables });
}



export const callWaiter = async (data) => {
    data = new TableInfoDto(data);
    let { token, tableId } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let { restaurantId, callingTablesList, currentTableParsed } = await TableController.callWaiterController(tableId);
    console.log('your request was on table: ', tableId);
    console.log('your request will be attended by restaurant: ', restaurantId)
    io.to(tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
    io.to(`${restaurantId}`).emit(socketEvents.customerRequests, { callingTables: callingTablesList });
}

export const stopCallingWaiter = async (data) => {
    data = new TableInfoDto(data);
    let { token, tableId } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let { restaurantId, callingTablesList, currentTableParsed } = await TableController.callWaiterController(tableId, true);
    io.to(tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
    io.to(`${restaurantId}`).emit(socketEvents.customerRequests, { callingTables: callingTablesList });

}

export const orderNow = async (data) => {
    try {
        data = new TableInfoDto(data);
        console.log("############");
        console.log("data recived on orderNow:", data)
        let userId = await checkUser(data.token);
        if (!userId) return;
        const [{currentTableParsed,tables}, currentOrderParsed] = await Promise.all([
            TableController.orderNowController(data),
            TableController.orderListQueueController(data),
        ])
        //TODO: cambiar logs de dataemited for... a funciones
        console.log('#################currentTableParsed');
        console.log(currentTableParsed);
        console.log('#################currentTableParsed END');
        const { restaurantId } = currentTableParsed
        console.log("after - currentTableParsed:", currentTableParsed, "\ncurrentOrderParsed:", currentOrderParsed);
        io.to(data.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
        io.to(restaurantId).emit(socketEvents.restaurantTables, { tables: tables });
        console.log("data emited for costumers_required:", currentTableParsed);
        io.to(restaurantId).emit(socketEvents.orderQueue, { orders: currentOrderParsed.orders });
        console.log("restaurantId:", restaurantId);
        console.log("data emited for order_queue:", currentOrderParsed.orders);
        console.log("############");
    } catch (error) {
        console.log("OrderNowError:", error);
        let timestamp = Date.now().toString();
        socket.join(timestamp);
        io.to(timestamp).emit('error', error);
        return;
    }
}

export const leave = async(data) => {
    data = new TableInfoDto(data);
    let userId = await checkUser(data.token);
    if (!userId) return;
    const currentTableParsed = await TableController.leaveTableController(data.tableId,userId);
    socket.leave(data.tableId);
    io.to(data.tableId).emit(socketEvents.listOfOrders, { table: currentTableParsed });
}

