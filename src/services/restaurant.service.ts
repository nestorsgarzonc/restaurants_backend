import { checkUser } from "../core/util/sockets.utils";
import { io, socket } from '../core/sockets';
import * as RestaurantController from '../service_controllers/restaurant.controller';
import * as socketEvents from "../core/constants/sockets.events";
import { RestaurantInfoDto } from "../models_sockets/restaurantInfo";

export const join = async (data) => {
    data = new RestaurantInfoDto(data);
    let userId = await checkUser(data.token);
    if (!userId) return;
    const { tables, callingTables, ordersParsed } = await RestaurantController.getTableListController(data);
    socket.join(data.restaurantId);
    console.log("data emited to restaurant:tables ->", tables);
    io.to(data.restaurantId).emit(socketEvents.restaurantTables, { tables: tables });
    console.log("data emited to customer_requests ->", callingTables);
    io.to(data.restaurantId).emit(socketEvents.customerRequests, { callingTables: callingTables });
    io.to(data.restaurantId).emit(socketEvents.orderQueue, { orders: ordersParsed.orders });
};

export const getTableList = async (data) => {
    data = new RestaurantInfoDto(data);
    let { token, ...restaurantData } = data;
    let userId = await checkUser(token);
    if (!userId) return;
    const tables = await RestaurantController.getTableListController(restaurantData);
    console.log(tables);
    io.to(data.restaurantId).emit(socketEvents.restaurantTables, { tables: tables });
}