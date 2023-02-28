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
import order from '../models/restaurant/order';
import { parse } from 'path';

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
    //TODO: sumarle el tip a totalPrice
    try {
        const userId = res.locals.token.userId;
        const user = await User.findById(userId)
            .populate({
                path: 'ordersStory',
                select: ['totalPrice', 'tip', 'createdAt', 'paymentWay', 'paymentMethod'],
                populate: [{
                    path: 'restaurantId' as 'restaurant',
                    select: ['address', 'name', 'logo']
                },
                {
                    path: 'usersOrder', match: { userId: userId }, select: ['price']
                }
                ]
            })
        if (!user) {
            return res.status(400).json({ msg: 'Orders not found' });
        }
        user.ordersStory.forEach(order => {
            order["totalPrice"] += order["totalPrice"]*order["tip"]/100
        });
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

    const orderId = await saveOrderFromRedis(req.body.tableId,res.locals.token.userId,req.body.tip,req.body.paymentWay,req.body.individualPaymentWay,req.body.paymentMethod);
    

    io.to(req.body.tableId).emit(socketEvents.onPayedAccount, { orderId: orderId });
    console.log(`Order completed: ${orderId}`);
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
                        path: 'productId', select: ['name', 'price', 'img']
                    }]
                },
                {
                    path: 'userId', select: ['firstName', 'lastName']
                }]
            },
            {
                path: 'restaurantId', select: ['logo', 'name', 'address']
            }
            ]);
        if (!order) {
            return res.status(404).json({ msg: 'User order not found' });
        }
        console.log(order.usersOrder);
        return res.json(order);
        // return res.json({ order: order.usersOrder.find(userorder => (userorder as any).userId._id == userId), restaurantId: order.restaurantId, payment: { way: order.paymentWay, method: order.paymentMethod } });

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const ordersPerPage = 50;
        if (req.header("restaurantId") == null) {
            throw new Error("getOrderHistory - No RestaurantId provided")
        }
        var queryFilter = {
            restaurantId: req.header("restaurantId")
        }
        if (req.body.fechaInicio != null) {
            queryFilter["createdAt"] = {$gte: req.body.fechaInicio};
        }
        if (req.body.fechaFin != null) {
            queryFilter["createdAt"] = {$lte: req.body.fechaFin};
        }
        if (req.body.valorOrden != null) {
            queryFilter["totalPrice"] = req.body.valorOrden;
        }
        if (req.body.paymentMethod != null) {
            queryFilter["paymentMethod"] = req.body.paymentMethod;
        }
        console.log("QueryFilter:", queryFilter);
        const order = await Order.find(queryFilter);
        const firstLimit = ordersPerPage * (parseInt(req.params.pageNumber) - 1);
        const lastLimit = ordersPerPage * (parseInt(req.params.pageNumber));
        const nextLimit = ordersPerPage * (parseInt(req.params.pageNumber));
        var nextPage = true;
        const orderPaged = order.slice(firstLimit, lastLimit);
        if (!orderPaged[0]) {
            return res.status(404).json({ msg: 'No orders found' });
        }
        if (nextLimit > order.length) {
            nextPage = false
        }
        return res.json({ msg: 'Orders found:', orderPaged, nextPage});
    }
    catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

