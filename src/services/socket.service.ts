import {io, socket} from '../core/sockets';

export const msg = function (data) {
    console.log(data);
    socket.emit('msg', data);
}

export const disconnect = function (data) {
    console.log('user disconnected');
}

export const showId =async (data) => {
    console.log(socket.id)
    socket.emit('msg', {id: socket.id})
}