
import { createClient } from 'redis';
import { createServer } from "http";
import { Server } from "socket.io";
import { errorHandlerSocket } from '../middlewares/errors.middleware';
import * as TableService from '../services/table.service';
import * as OrderService from '../services/order.service';
import * as WaiterService from '../services/waiter.service';
import * as SocketService from '../services/socket.service';


var ioExp;
var socketExp
var redisClientExp;

const onContection = (socket) => {

    console.log('a user connected');
    socket.emit('message', 'Hello World!');
    socketExp = socket
    
    socket.on('msg', SocketService.msg)
    socket.on('disconnect', SocketService.disconnect)

    socket.on('table:join', errorHandlerSocket(TableService.join))
    socket.on('table:change-status', errorHandlerSocket(TableService.changeStatus))
    socket.on('table:call-waiter', errorHandlerSocket(TableService.callWaiter))
    socket.on('table:stop-calling-waiter', errorHandlerSocket(TableService.stopCallingWaiter))

    socket.on('order:add-item', errorHandlerSocket(OrderService.addItem))
    socket.on('order:edit-item', errorHandlerSocket(OrderService.editItem))
    socket.on('order:delete-item', errorHandlerSocket(OrderService.deleteItem))
    socket.on('order:pay-account', errorHandlerSocket(OrderService.payAccount))
    socket.on('order:ask-account', errorHandlerSocket(OrderService.askAccount))

    socket.on('waiter:attend-table', errorHandlerSocket(TableService.stopCallingWaiter))
    socket.on('waiter:listen-tables', errorHandlerSocket(WaiterService.listenTables))

}

export const socketServer = async(app) => {
    const server = createServer(app);
    const io = new Server(server, { /* options  */});
    ioExp = io;

    const redisClient = createClient(
        {url:'redis://default:cOdlLDjp5YKs7fyDPLUdEZIALL57XFAD@redis-15442.c11.us-east-1-2.ec2.cloud.redislabs.com:15442'}
    );
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
    redisClientExp = redisClient;

    io.on('connection', onContection);

    server.listen(process.env.PORT, () => console.log('Listening at port', process.env.PORT));

}

export{ioExp as io, socketExp as socket, redisClientExp as redisClient}