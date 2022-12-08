import { createClient } from 'redis';
import { tokenIsValidSocket } from "../middlewares/auth.middleware";
import User from "../models/user/user";
import { io, socket } from '../core/sockets';

const redisClient = createClient(
    { url: 'redis://default:cOdlLDjp5YKs7fyDPLUdEZIALL57XFAD@redis-15442.c11.us-east-1-2.ec2.cloud.redislabs.com:15442' }
);
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();


export const joinToTable = async (data: any,) => {
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
        currentTableParsed.usersConnected = [{ userId, firstName: user.firstName, lastName: user.lastName, orderProducts: [] }];
        await redisClient.set(`table${parsedData.table_id}`, JSON.stringify(currentTableParsed));
    } else {
        currentTableParsed = JSON.parse(currentTable);
        if (!currentTableParsed.usersConnected.some(user => user.userId === userId)) {
            currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, { userId, firstName: user.firstName, lastName: user.lastName, orderProducts: [] }];
            await redisClient.set(`table${parsedData.table_id}`, JSON.stringify(currentTableParsed));
        }
    }
    console.log(currentTableParsed);
    socket.join(parsedData.table_id);
    io.to(parsedData.table_id).emit('new_user_joined', { users: currentTableParsed.usersConnected, 'connected': true, userName: `${user.firstName} ${user.lastName}` });
}