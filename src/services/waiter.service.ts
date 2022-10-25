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