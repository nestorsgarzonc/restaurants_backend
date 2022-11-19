import {io, socket} from '../core/sockets';
import { checkUser } from '../core/util/sockets.utils';
import * as WaiterController from '../service_controllers/waiter.controller';

export const listenTables = async(data) =>{

    let {token} = data;
    let userId = await checkUser(token);
    if(!userId) return;
    
    let {callingTables, restaurantId} = await WaiterController.listenTablesController(userId);

    console.log(`your waiter is conected to restaurant room: ${restaurantId}`);
    io.to(socket.id).emit('costumers_requests', {requests: [...callingTables]});
    socket.join(`${restaurantId}`);

}

export const watchTable = async(data) =>{
    //check if waiter
    let{token, tableId} = data;

    let userId = await checkUser(token);
    if(!userId) return;

    let currentTableParsed = await WaiterController.watchTableController(tableId);

    io.to(socket.id).emit('list_of_orders', {table: currentTableParsed})
    socket.join(tableId);

}

export const addItemToTable = async(data) =>{

    let {token, tableId, clientId,...orderData} = data;
    let userId = await checkUser(token);
    if(!userId) return;
    console.log(clientId)
    let currentTableParsed = await WaiterController.addItemToTableController(clientId,tableId,orderData);

    socket.join(tableId);
    io.to(tableId).emit('list_of_orders',{table:currentTableParsed});

}

export const leaveTable = async(data) =>{
    console.log(socket.id)
    console.log("---------------------",data.tableId)
    console.log(socket.rooms);
    socket.leave(data.tableId);
    console.log(socket.rooms);
    io.to(socket.id).emit('msg', {msg:'room leaved successfully'})
}