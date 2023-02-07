import { io, socket } from '../core/sockets';
import { checkUser } from "../core/util/sockets.utils";
import * as OrderController from '../service_controllers/order.controller';
import * as MenuController from '../service_controllers/menu.controller';
import * as socketEvents from "../core/constants/sockets.events";

export const updateMenu = async (data) => {
    let userId = await checkUser(data.token);
    const menu = await MenuController.getMenu(data.restaurantId);
    io.to(`bus_${data.restaurantId}`).emit(socketEvents.updateMenu,menu);
}