import {redisClient} from '../core/sockets';
import Waiter from '../models/restaurant/waiter';


export const listenTablesController = async(waiterId) =>{

    const waiter = await Waiter.findOne({'user' : waiterId})
    let restaurantId = waiter.restaurant;

    let tables = await redisClient.get(`${restaurantId}_calling_tables`);
    if(!tables) tables = "";
    let callingTables = new Set(tables.split('$'));
    callingTables.delete('');

    return {callingTables, restaurantId};

}