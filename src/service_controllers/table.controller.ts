import User from "../models/user/user";

import Table from "../models/restaurant/table";
import { redisClient } from "../core/sockets";

export const joinController = async(userId, tableId) =>{
    let user = await User.findById(userId)
    let currentTable = await redisClient.get(`table${tableId}`)
    let currentTableParsed: any = {}
    if (!currentTable) {
        const table = await Table.findById(tableId);
        currentTableParsed.usersConnected = [{userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[],price:0}];
        currentTableParsed.needsWaiter = false;
        currentTableParsed.tableStatus = 'ordering';
        currentTableParsed.totalPrice = 0;
        currentTableParsed.restaurantId = table.restaurantId;
        redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
    } else {
        currentTableParsed = JSON.parse(currentTable);
        if(!currentTableParsed.usersConnected.some(user => user.userId === userId)){
            currentTableParsed.usersConnected = [...currentTableParsed.usersConnected, {userId,firstName:user.firstName,lastName:user.lastName,orderProducts:[],price:0}];
            currentTableParsed.tableStatus = 'ordering';
            redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));
        }
        
    }
    console.log(currentTableParsed);

    return {user, currentTableParsed};
}

export const changeStatusController = async(data) =>{

    let currentTable = await redisClient.get(`table${data.tableId}`)
    let currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.tableStatus = data.status;
    redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));
    
    return currentTableParsed;
}

export const callWaiterController =async (tableId, stopCalling = false) => {

    let currentTable = await redisClient.get(`table${tableId}`);
    let currentTableParsed = JSON.parse(currentTable);
    currentTableParsed.needsWaiter = !currentTableParsed.needsWaiter;

    let restaurantId = currentTableParsed.restaurantId;

    let tables = await redisClient.get(`${restaurantId}_calling_tables`);
    if(!tables) tables = "";

    let callingTables = new Set(tables.split('$'));
    callingTables.delete('');
    stopCalling ? callingTables.delete(tableId) : callingTables.add(tableId);

    let callingTablesList = [...callingTables];

    redisClient.set(`${restaurantId}_calling_tables`, callingTablesList.join('$'));

    redisClient.set(`table${tableId}`, JSON.stringify(currentTableParsed));  
    return {restaurantId, callingTablesList, currentTableParsed}
}

export const orderNowController =async (data) => {
    
    let currentTable = await redisClient.get(`table${data.tableId}`);
    let currentTableParsed = JSON.parse(currentTable);

    currentTableParsed.tableStatus = data.status;
    redisClient.set(`table${data.tableId}`, JSON.stringify(currentTableParsed));

    const table = await Table.findById(data.tableId);
    if (!table) {
        throw { reason: 'Table not found' };
    }
    //table.status = data.status;
    await table.save();
    return table;
}