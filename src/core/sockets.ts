
import { createClient } from 'redis';
import { createServer } from "http";
import { Server } from "socket.io";
import { tokenIsValidSocket } from "../middlewares/auth.middleware";
import User from "../models/user/user";
import Order from "../models/restaurant/order";
import UserOrder from "../models/restaurant/userOrder";
import Table from "../models/restaurant/table";
import restaurant from '../models/restaurant/restaurant';

//TODO: Modularizar las funciones 
export const socketServer = async(app) => {
    
    const server = createServer(app);
    const io = new Server(server, { /* options */ });
    const redisClient = createClient(
        {url:'redis://default:cOdlLDjp5YKs7fyDPLUdEZIALL57XFAD@redis-15442.c11.us-east-1-2.ec2.cloud.redislabs.com:15442'}
    );
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();


    io.on('connection', async (socket) => {
        console.log('a user connected');
        socket.emit('message', 'Hello World!');

        socket.on('msg', (data) => {
            console.log(data);
            socket.emit('msg', data);
        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
        })



        socket.on('join_to_restaurant_table', async (data) => {
           try{ 
                let userId = await tokenIsValidSocket(data.token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }

                let user = await User.findById(userId)
                let currentTable = await redisClient.get(`table${data.tableId}`)
                let currentTableParsed: any = {}
                if (!currentTable) {
                    const table = await Table.findById(data.tableId);
                    currentTableParsed.usersConnected = [{userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[],price:0}];
                    currentTableParsed.needsWaiter = false;
                    currentTableParsed.tableStatus = 'ordering';
                    currentTableParsed.totalPrice = 0;
                    currentTableParsed.restaurantId = table.restaurantId;
                    redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
                } else {
                    currentTableParsed = JSON.parse(currentTable);
                    if(!currentTableParsed.usersConnected.some(user => user.userId === userId)){
                        currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, {userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[],price:0}];
                        currentTableParsed.tableStatus = 'ordering';
                        redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
                    }
                    
                }
                console.log(currentTableParsed);
                
            
                socket.join(data.tableId);
                io.to(data.tableId).emit('new_user_joined', { table:currentTableParsed, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
            }catch(error){
                console.log("Ocurrió un error uniéndose a la mesa:", error);
            }

        });

        socket.on('add_product_to_order',async(data)=>{
            try{
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let currentTable = await redisClient.get(`table${data.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                currentTableParsed.usersConnected.find(user => user.userId === userId).orderProducts.push(orderData);
                currentTableParsed.usersConnected.find(user => user.userId === userId).price += data.totalWithToppings;
                currentTableParsed.totalPrice += data.totalWithToppings;
                
                redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
                console.log(currentTableParsed);
                io.to(data.tableId).emit('list_of_orders',{table:currentTableParsed});
            }catch(error){
                console.log("Ocurrió un al añadir un producto a la orden:", error);
            }
        });

        socket.on('paid_account',async(data)=>{
            try{
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let userOrderIds = [];
                let currentTable = await redisClient.get(`table${data.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                currentTableParsed.usersConnected.forEach(async user => {
                    const userOrder = new UserOrder({
                        userId: user.userId,
                        restaurantId: currentTableParsed.restaurantId,
                        tableId: data.tableId,
                        orderProducts: user.orderProducts,
                        price: user.price
                    });
                    await userOrder.save();
                    userOrderIds.push(userOrder._id);
                }); 
                const order = new Order({
                    usersOrder: userOrderIds,
                    status: 'finished',
                    totalPrice: currentTableParsed.totalPrice,
                    restaurantId: currentTableParsed.restaurantId,
                    waiterId: userId,
                    tip: 5000
                });
                await order.save();
            }
                catch(error){
                console.log("Ocurrió un error al pagar", error);
            }
        });

        socket.on('change_table_status',async (data) =>{
            try{
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let currentTable = await redisClient.get(`table${data.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                currentTableParsed.tableStatus = data.status;
                redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
            }catch(error){
                console.log("Ocurrió un error al pedir la cuenta", error);
            }
        });

        socket.on('ask_account',async (data) =>{
            try{
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let currentTable = await redisClient.get(`table${data.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                currentTableParsed.tableStatus = 'paying';
            }catch(error){
                console.log("Ocurrió un error al pedir la cuenta", error);
            }
        });

        socket.on('delete_item',async(data)=>{
            try{
                let userId = await tokenIsValidSocket(data.token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let currentTable = await redisClient.get(`table${data.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                let userIndexInArray = currentTableParsed.usersConnected.findIndex(user => user.userId == userId);
                let itemIndexInArray = currentTableParsed.usersConnected[userIndexInArray].orderProducts.findIndex(item=>item.uuid===data.uuid);
                currentTableParsed.usersConnected[userIndexInArray].price -= currentTableParsed.usersConnected[userIndexInArray]
                    .orderProducts[itemIndexInArray].totalWithToppings;
                currentTableParsed.totalPrice -= currentTableParsed.usersConnected[userIndexInArray]
                    .orderProducts[itemIndexInArray].totalWithToppings;
                    
                currentTableParsed.usersConnected[userIndexInArray].orderProducts.splice(itemIndexInArray,1)
                redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
                io.to(data.tableId).emit('list_of_orders',{table:currentTableParsed});
            }catch(error){
                console.log("Ocurrió un error al eliminar el elemento", error);
            }
        });


        socket.on('say_hi', async(data) => {
            console.log('hi...')
            console.log(data.hola)
        });

        socket.on('call_waiter', async(data) => {
            let userId = await tokenIsValidSocket(data.token);
            if (!userId) {
                let timestamp = Date.now().toString();
                socket.join(timestamp);
                io.to(timestamp).emit('error', { reason: 'no userId' });
                return;
            }
            let table = await Table.findById(data.table_id);

            let tables = await redisClient.get(`${table.restaurantId}_calling_tables`);
            if(!tables) tables = "";

            let callingTables = new Set(tables.split('$'));
            callingTables.delete('');
            callingTables.add(data.table_id);

            redisClient.set(`${table.restaurantId}_calling_tables`, [...callingTables].join('$'));

            let currentTable = await redisClient.get(`table${data.table_id}`);
            let currentTableParsed = JSON.parse(currentTable);
            currentTableParsed['needsWaiter'] = true;
            redisClient.set(`table${data.table_id}`, JSON.stringify(currentTableParsed));
            
            io.to(`${table.restaurantId}`).emit('costumers_requests', {requests: [...callingTables]});

        });

        socket.on('attend_table', async(data) =>{
            let table = await Table.findById(data.table_id);
            let tables = await redisClient.get(`${table.restaurantId}_calling_tables`);

            if(!tables || tables===""){
                io.to(`${table.restaurantId}`).emit('error', { reason: 'no table to be attended' });
                return;
            }

            let callingTables = new Set(tables.split('$'));

            if(!callingTables.has(data.table_id)){
                io.to(`${table.restaurantId}`).emit('error', { reason: 'this table do not need attention' });
                return;
            }

            callingTables.delete(data.table_id);

            redisClient.set(`${table.restaurantId}_calling_tables`, [...callingTables].join('$'));

            let currentTable = await redisClient.get(`table${data.table_id}`);
            let currentTableParsed = JSON.parse(currentTable);
            currentTableParsed['needsWaiter'] = false;
            redisClient.set(`table${data.table_id}`, JSON.stringify(currentTableParsed));

            io.to(`${table.restaurantId}`).emit('costumers_requests', {requests: [...callingTables]});
        });

        socket.on('listen_tables', async(data) =>{
            

            let tables = await redisClient.get(`${data.restaurant_id}_calling_tables`);
            if(!tables) tables = "";
            let callingTables = new Set(tables.split('$'));
            callingTables.delete('');

            io.to(socket.id).emit('costumers_requests', {requests: [...callingTables]});

            socket.join(data.restaurant_id);

        });


    });

    server.listen(process.env.PORT, () => console.log('Listening at port', process.env.PORT));
    
}
