
import { createClient } from 'redis';
import { createServer } from "http";
import { Server } from "socket.io";
import { tokenIsValidSocket } from "../middlewares/auth.middleware";
import User from "../models/user/user";
import Table from '../models/restaurant/table';

//TODO: Modularizar las funciones y crear 
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
            
            let parsedData = data;//JSON.parse(data);
            let userId = await tokenIsValidSocket(parsedData.token);
            if (!userId) {
                let timestamp = Date.now().toString();
                socket.join(timestamp);
                io.to(timestamp).emit('error', { reason: 'no userId' });
                return;
            }

            let user = await User.findById(userId)
            let currentTable = await redisClient.get(`table${parsedData.table_id}`)
            let currentTableParsed: any = {}
            if (!currentTable) {
                currentTableParsed.usersConnected = [{userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[]}];
                currentTableParsed.needsWaiter = false;
                redisClient.set(`table${parsedData.table_id}`, JSON.stringify(currentTableParsed));
            } else {
                currentTableParsed = JSON.parse(currentTable);
                if(!currentTableParsed.usersConnected.some(user => user.userId === userId)){
                    currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, {userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[]}];
                    redisClient.set(`table${parsedData.table_id}`, JSON.stringify(currentTableParsed));
                }
                
            }
            console.log(currentTableParsed);
            
           
            socket.join(parsedData.table_id);
            io.to(parsedData.table_id).emit('new_user_joined', { users:currentTableParsed.usersConnected, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
        });

        socket.on('add_product_to_order',async(data)=>{
            let parsedData = data;//JSON.parse(data);
            const {token,...orderData} = data;
            let userId = await tokenIsValidSocket(token);
            if (!userId) {
                let timestamp = Date.now().toString();
                socket.join(timestamp);
                io.to(timestamp).emit('error', { reason: 'no userId' });
                return;
            }
            let currentTable = await redisClient.get(`table${parsedData.table_id}`)
            let currentTableParsed = JSON.parse(currentTable);
            currentTableParsed.usersConnected.find(user => user.userId === userId).orderProducts.push(orderData);
            redisClient.set(`table${parsedData.table_id}`, JSON.stringify(currentTableParsed));
            console.log(currentTableParsed);
            io.to(parsedData.table_id).emit('list_of_orders',{orders:currentTableParsed.usersConnected});
        });

        socket.on('paid_account',async(data)=>{

        })

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
