import { checkUser } from "../core/util/sockets.utils";
import { io, socket } from '../core/sockets';
import * as TableController from '../service_controllers/table.controller';
import restaurant from "../models/restaurant/restaurant";
import * as EventNames from '../core/constants/sockets.events';

export const join = async (data) => {

    let userId = await checkUser(data.token);
    if (!userId) return;
    let { user, currentTableParsed } = await TableController.joinController(userId, data.tableId);

    socket.join(data.tableId);
    io.to(data.tableId).emit('new_user_joined', { table: currentTableParsed, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
};

export const changeStatus = async (data) => {
    
    let { token, ...tableData } = data;
    
    
    let userId = await checkUser(token);
    if (!userId) return;
    let [redisRes, { tables, restaurantId }] = await TableController.changeStatusController(tableData);
    console.log(tables);
    console.log(data.tableId);
    
    io.to(data.tableId).emit('list_of_orders', { table: redisRes })
    io.to(restaurantId.toString()).emit('restaurant:tables', { tables: tables });
}



export const callWaiter = async (data) => {
    let { token, tableId } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    let { restaurantId, callingTablesList, currentTableParsed } = await TableController.callWaiterController(tableId);
    console.log('your request was on table: ', tableId);
    console.log('your request will be attended by restaurant: ', restaurantId)
    io.to(tableId).emit('list_of_orders', { table: currentTableParsed });
    io.to(`${restaurantId}`).emit('customer_requests', { callingTables: callingTablesList });
}

export const stopCallingWaiter = async (data) => {
    let { token, tableId } = data;

    let userId = await checkUser(token);
    if (!userId) return;

    let { restaurantId, callingTablesList, currentTableParsed } = await TableController.callWaiterController(tableId, true);

    io.to(tableId).emit('list_of_orders', { table: currentTableParsed });
    io.to(`${restaurantId}`).emit('customer_requests', { callingTables: callingTablesList });

}

export const orderNow = async (data) => {
    try {
        console.log("############");
        console.log("data recived on orderNow:", data)

        let userId = await checkUser(data.token);
        if (!userId) return;

        console.log("prev");
        let currentTableParsed = await TableController.orderNowController(data);

        console.log("after:", currentTableParsed);
        io.to(data.tableId).emit('list_of_orders', { table: currentTableParsed });
        console.log("data emited for list_of_orders:", currentTableParsed);
        io.to(currentTableParsed.restaurantId).emit('costumers_requests', { table: currentTableParsed });
        console.log("data emited for costumers_required:", currentTableParsed);
        console.log("############");
    } catch (error) {
        console.log("OrderNowError:", error);
        let timestamp = Date.now().toString();
        socket.join(timestamp);
        io.to(timestamp).emit('error', error);
        return;
    }
}