
import { createClient } from 'redis';
import { createServer } from "http";
import { Server } from "socket.io";
import { tokenIsValidSocket } from "../middlewares/auth.middleware";
import User from "../models/user/user";


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
            io.to(parsedData.table_id).emit('new_user_joined', { ...parsedData, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
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


    });

    server.listen(process.env.PORT, () => console.log('Listening at port', process.env.PORT));

    
}
