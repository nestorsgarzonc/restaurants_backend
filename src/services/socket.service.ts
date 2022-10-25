module.exports = (io) => {
    const msg = function (data) {
        const socket = this;
        console.log(data);
        socket.emit('msg', data);
    }

    const disconnect = function (data) {
        console.log('user disconnected');
    }

    return{
        msg,
        disconnect
    }
}