import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const server = createServer(app);

const io = new Server(server, { /* options */ });

app.disable('x-powered-by')

app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
    "origin": "*",
    "methods": "*",
}))

app.get('/', (req, res) => {
    res.json({
        'Amor': 'Te amo! ♥♥♥'
    })
})

io.on('connection', async (socket) => {
    console.log('a user connected');
    socket.emit('message', 'Hello World!');

    socket.on('msg', (data) => {
        console.log(data);
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    })


    socket.on('join_to_restaurant_table', (data) => {
        let parsedData = JSON.parse(data);
        socket.join(parsedData.table_id);
        console.log(parsedData.table_id);
        //TODO: SEND ORDER STATUS TO ALL USERS IN THE TABLE
        io.to(parsedData.table_id).emit('new_user_joined', { ...parsedData, 'connected': true });
    })
});

server.listen(3000, () => console.log('Listening at port 3000'));