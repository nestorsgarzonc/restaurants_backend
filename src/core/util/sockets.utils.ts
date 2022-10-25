import { tokenIsValidSocket } from "../../middlewares/auth.middleware";
import {io, socket} from '../sockets';

export const checkUser = async (token) => {
    let userId = await tokenIsValidSocket(token);
                
    if (!userId) {
        let timestamp = Date.now().toString();
        socket.join(timestamp);
        io.to(timestamp).emit('error', { reason: 'no userId' });
        return null;
    }

    return userId;
}