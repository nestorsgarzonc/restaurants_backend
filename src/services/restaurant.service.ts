import { checkUser } from "../core/util/sockets.utils";
import {io, socket} from '../core/sockets';

export const join =  async(data) => {
    
    let userId = await checkUser(data.token);
    if(!userId) return;
    
    socket.join(data.restaurantId);
};