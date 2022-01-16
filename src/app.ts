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

io.on('connection', (client) => {
    console.log('a user connected');
    client.on('msg', (data) => {
        console.log(data);
    })
});

server.listen(3000, () => console.log('Listening at port 3000'));