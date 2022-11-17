
import { createClient } from 'redis';
import { createServer } from "http";
import { Server } from "socket.io";
import { errorHandlerSocket } from '../middlewares/errors.middleware';
import * as TableService from '../services/table.service';
import * as OrderService from '../services/order.service';
import * as WaiterService from '../services/waiter.service';
import * as SocketService from '../services/socket.service';
import * as RestaurantService from '../services/restaurant.service';
import RedisClient, { RedisClientType } from '@redis/client/dist/lib/client';


var ioExp;
var socketExp
var redisClientExp:RedisClientType;

const onConection = (socket) => {

    console.log('a user connected');
    socket.emit('message', 'Hello World!');
    socketExp = socket
    
    socket.on('msg', SocketService.msg)
    socket.on('disconnect', SocketService.disconnect)
    socket.on('show-id',SocketService.showId)

    socket.on('table:join', errorHandlerSocket(TableService.join))
    socket.on('table:change-status', errorHandlerSocket(TableService.changeStatus))
    socket.on('table:call-waiter', errorHandlerSocket(TableService.callWaiter))
    socket.on('table:stop-calling-waiter', errorHandlerSocket(TableService.stopCallingWaiter))
    socket.on('table:order-now', errorHandlerSocket(TableService.orderNow))
    

    socket.on('order:add-item', errorHandlerSocket(OrderService.addItem))
    socket.on('order:edit-item', errorHandlerSocket(OrderService.editItem))
    socket.on('order:delete-item', errorHandlerSocket(OrderService.deleteItem))
    socket.on('order:ask-account', errorHandlerSocket(OrderService.askAccount))

    socket.on('restaurant:join', errorHandlerSocket(RestaurantService.join))
    socket.on('restaurant:tables-status',errorHandlerSocket(RestaurantService.getTableList))

    socket.on('waiter:attend-table', errorHandlerSocket(TableService.stopCallingWaiter))
    socket.on('waiter:listen-tables', errorHandlerSocket(WaiterService.listenTables))
    socket.on('waiter:watch-table', errorHandlerSocket(WaiterService.watchTable))
    socket.on('waiter:add-item-to-table', errorHandlerSocket(WaiterService.addItemToTable))
    socket.on('waiter:leave-table', errorHandlerSocket(WaiterService.leaveTable))

}

export const socketServer = async(app) => {
    const server = createServer(app);
    const io = new Server(server, { /* options  */});
    ioExp = io;

    redisClientExp= createClient(
        {url:'redis://default:cOdlLDjp5YKs7fyDPLUdEZIALL57XFAD@redis-15442.c11.us-east-1-2.ec2.cloud.redislabs.com:15442'}
    );
    await redisClientExp.connect();
    redisClientExp.on('error', (err) => console.log('Redis Client Error', err));
    redisClientExp.on('ready', function() {
        console.log('connected to redis');
    });
    
    io.on('connection', onConection);

    io.of("/").adapter.on("create-room", (room) => {
        console.log(`\x1b[35mroom ${room} was created! \x1b[0m`);
      });
      
      io.of("/").adapter.on("join-room", (room, id) => {
        console.log(`\x1b[35msocket ${id} has joined room ${room} \x1b[0m`);
      });
        
    server.listen(process.env.PORT, () => console.log('Listening at port', process.env.PORT));

}

export{ioExp as io, socketExp as socket, redisClientExp as redisClient}