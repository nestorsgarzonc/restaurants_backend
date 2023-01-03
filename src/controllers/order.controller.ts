import { Request, Response } from 'express';
import { redisClient } from '../core/sockets';
import Order from '../models/restaurant/order';
import User from '../models/user/user';

import UserOrder from '../models/restaurant/userOrder';
import { io, socket } from '../core/sockets';
import * as socketEvents from '../core/constants/sockets.events';
import Restaurant from '../models/restaurant/restaurant';
import Table from '../models/restaurant/table';
import { TableStatus } from '../models/restaurant/table';
import { PaymentWays } from '../models_sockets/askAccount';
import { saveOrderFromRedis } from '../core/util/sockets.utils';

export const getOrderDetail = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id;
        console.log(orderId);
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        return res.json(order);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const getOrders = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.token.userId;
        const user = await User.findById(userId)
            .populate({
                path: 'ordersStory',
                select: ['totalPrice', 'createdAt', 'paymentWay', 'paymentMethod'],
                populate: [{
                    path: 'restaurantId' as 'restaurant',
                    select: ['address', 'name', 'logoUrl']
                },
                {
                    path: 'usersOrder', match: { userId: userId }, select: ['price']
                }
                ]
            })
        if (!user) {
            return res.status(400).json({ msg: 'Orders not found' });
        }
        return res.json(user.ordersStory);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const getRestaurantOrders = async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId;
    try {
        const orders = await Order.find({ restaurantId })
            .sort({ createdAt: -1 });
        return res.json(orders);
    }
    catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

// Expect a list of user orders ids
export const createTableOrder = async (req: Request, res: Response) => {
    //We are not using this jaja LOL
    try {
        const order = new Order(req.body);
        await order.save();
        return res.json({ msg: 'Order created successfully', order });
    }
    catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const updateTableOrder = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        await order.updateOne(req.body);
        return res.json({ msg: 'Order updated successfully', order });
    }
    catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const createUserOrder = async (req: Request, res: Response) => {
    try {
        const userOrder = new UserOrder(req.body);
        await userOrder.save();
        return res.json({ msg: 'User order created successfully', userOrder });
    }
    catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}


export const updateUserOrder = async (req: Request, res: Response) => {
    try {
        const userOrder = UserOrder.findById(req.params.id);
        if (!userOrder) {
            return res.status(404).json({ msg: 'User order not found' });
        }
        await userOrder.updateOne(req.body);
        return res.json({ msg: 'User order created successfully', userOrder });
    }
    catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const payAccount = async (req: Request, res: Response) => {

    const orderId = await saveOrderFromRedis(req.body.tableId,res.locals.token.userId,req.body.tip,req.body.paymentWay,req.body.paymentMethod);
    

    io.to(req.body.tableId).emit(socketEvents.onPayedAccount, { orderId: orderId });
    return res.json({ msg: 'User order created successfully', orderId:orderId });

}
export const getOrder = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.token.userId;
        console.log(userId);
        const order = await Order.findById(req.params.id)
            .populate([{
                path: 'usersOrder',
                populate: [{
                    path: 'orderProducts',
                    populate: [{
                        path: 'toppings',
                        populate: [{
                            path: 'toppingOptions', select: ['name', 'price']
                        },
                        {
                            path: 'toppingId', select: ['name']
                        }]
                    },
                    {
                        path: 'productId', select: ['name', 'price', 'imgUrl']
                    }]
                },
                {
                    path: 'userId', select: ['firstName', 'lastName']
                }]
            },
            {
                path: 'restaurantId', select: ['logoUrl', 'name', 'address']
            }
            ]);
        if (!order) {
            return res.status(404).json({ msg: 'User order not found' });
        }
        console.log(order.usersOrder);
        if (order.paymentWay == 'all') {
            return res.json(order);
        } else if (order.paymentWay == 'split') {

            return res.json({ order: order.usersOrder.find(userorder => (userorder as any).userId._id == userId), restaurantId: order.restaurantId, payment: { way: order.paymentWay, method: order.paymentMethod } });
        }

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}


