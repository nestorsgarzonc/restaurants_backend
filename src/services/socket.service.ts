import {io, socket} from '../core/sockets';

export const msg = function (data) {
    console.log(data);
    socket.emit('msg', data);
}

export const disconnect = function (data) {
    console.log('user disconnected');
}