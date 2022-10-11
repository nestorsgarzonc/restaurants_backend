
import { createClient } from 'redis';
import { createServer } from "http";
import { Server } from "socket.io";
import { tokenIsValidSocket } from "../middlewares/auth.middleware";
import User from "../models/user/user";
import order from "../models/restaurant/order";
import UserOrder from "../models/restaurant/userOrder";
import Table from "../models/restaurant/table";
import restaurant from '../models/restaurant/restaurant';

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
           try{ 
                let parsedData = data;//JSON.parse(data);
                let userId = await tokenIsValidSocket(parsedData.token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }

                let user = await User.findById(userId)
                let currentTable = await redisClient.get(`table${parsedData.tableId}`)
                let currentTableParsed: any = {}
                if (!currentTable) {
                    const table = await Table.findById(data.tableId);
                    currentTableParsed.usersConnected = [{userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[],price:0}];
                    currentTableParsed.tableStatus = 'ordering';
                    currentTableParsed.totalPrice = 0;
                    currentTableParsed.restaurantId = table.restaurantId;
                    redisClient.set(`table${parsedData.tableId}`, JSON.stringify(currentTableParsed));
                } else {
                    currentTableParsed = JSON.parse(currentTable);
                    if(!currentTableParsed.usersConnected.some(user => user.userId === userId)){
                        currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, {userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[],price:0}];
                        currentTableParsed.tableStatus = 'ordering';
                        redisClient.set(`table${parsedData.tableId}`, JSON.stringify(currentTableParsed));
                    }
                    
                }
                console.log(currentTableParsed);
                
            
                socket.join(parsedData.tableId);
                io.to(parsedData.tableId).emit('new_user_joined', { table:currentTableParsed, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
            }catch(error){
                console.log("Ocurrió un error uniéndose a la mesa:", error);
            }

        });

        socket.on('add_product_to_order',async(data)=>{
            try{
                let parsedData = data;//JSON.parse(data);
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let currentTable = await redisClient.get(`table${parsedData.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                currentTableParsed.usersConnected.find(user => user.userId === userId).orderProducts.push(orderData);
                currentTableParsed.usersConnected.find(user => user.userId === userId).price += data.price;
                currentTableParsed.totalPrice += data.price;
                data.toppings.forEach(topping => {
                    topping.options.forEach(toppingOption =>{
                        currentTableParsed.totalPrice += toppingOption.price;
                        currentTableParsed.usersConnected.find(user => user.userId === userId).price += toppingOption.price;
                    })
                });
                redisClient.set(`table${parsedData.tableId}`, JSON.stringify(currentTableParsed));
                console.log(currentTableParsed);
                io.to(parsedData.tableId).emit('list_of_orders',{table:currentTableParsed});
            }catch(error){
                console.log("Ocurrió un al añadir un producto a la orden:", error);
            }
        });

        socket.on('paid_account',async(data)=>{
            try{
                let parsedData = data;//JSON.parse(data);
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let userOrderIds = [];
                let currentTable = await redisClient.get(`table${parsedData.tableId}`)
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
            }
                catch(error){
                console.log("Ocurrió un error al pagar", error);
            }
        });

        socket.on('ask_account',async (data) =>{
            try{
                let parsedData = data;//JSON.parse(data);
                const {token,...orderData} = data;
                let userId = await tokenIsValidSocket(token);
                if (!userId) {
                    let timestamp = Date.now().toString();
                    socket.join(timestamp);
                    io.to(timestamp).emit('error', { reason: 'no userId' });
                    return;
                }
                let currentTable = await redisClient.get(`table${parsedData.tableId}`)
                let currentTableParsed = JSON.parse(currentTable);
                currentTableParsed.tableStatus = 'paying';
            }catch(error){
                console.log("Ocurrió un error al pedir la cuenta", error);
            }
        });

    });

    server.listen(process.env.PORT, () => console.log('Listening at port', process.env.PORT));
    
}
