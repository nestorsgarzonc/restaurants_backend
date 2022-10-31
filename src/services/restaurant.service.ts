import { checkUser } from "../core/util/sockets.utils";
import {io, socket} from '../core/sockets';
import * as RestaurantController from '../service_controllers/restaurant.controller';
export const join =  async(data) => {
    
    let userId = await checkUser(data.token);
    if(!userId) return;
    const {tables,callingTables} = await RestaurantController.getTableListController(data);
    socket.join(data.restaurantId);
    io.to(data.restaurantId).emit('restaurant:tables',{tables:tables});
    console.log(callingTables);
    io.to(data.restaurantId).emit('customer_requests',{callingTables:callingTables});
};

export const getTableList = async(data)=>{
    let{token, ...restaurantData} = data;
    let userId = await checkUser(token);
    if(!userId) return;
    const tables = await RestaurantController.getTableListController(restaurantData);
    console.log(tables);
    io.to(data.restaurantId).emit('restaurant:tables',{tables:tables});
}