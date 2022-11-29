import express from "express";
import cors from 'cors';
import waiterRoutes from "./routes/waiter.routes";
import tableRoutes from "./routes/table.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import menuRoutes from "./routes/menu.routes";
import db from './core/db';
import { configEnv } from "./core/config_env";
import { socketServer } from "./core/sockets";
import { logger } from "./core/logger/custom_logger";
import mongoSanitize from 'express-mongo-sanitize'

configEnv();
db();

logger.log({
    level: 'info',
    message: '{}'
})

const app = express();
socketServer(app);

app.disable('x-powered-by')

app.use(express.json())

app.use(cors({
    "origin": "*",
    "methods": "*",
}))

app.use(mongoSanitize());


app.get('/', (_, res) => {
    res.json({
        date: Date.now().toString()
    })
});

app.use('/api/auth', authRoutes);
app.use('/api/waiter', waiterRoutes);
app.use('/api/table', tableRoutes);
app.use('/api/user', userRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/menu', menuRoutes)