import { Request, Response } from 'express';
import {redisClient} from '../core/sockets';
import Order from '../models/restaurant/order';
import User from '../models/user/user';
import OrderProduct from '../models/restaurant/orderProduct';
import OrderTopping from '../models/restaurant/orderTopping';
import OrderToppingOption from '../models/restaurant/orderToppingOption';
import UserOrder from '../models/restaurant/userOrder';

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

export const getOrders = async (req: Request, res:Response)=>{
    try{
        const userId = res.locals.token.userId;
        const user = await User.findById(userId)
            .populate({
                path:'ordersStory',
                select:['totalPrice','createdAt'],
                populate: {
                    path:'restaurantId' as 'restaurant',
                    select:['address','name']
                }
            })
        if(!user){
            return res.status(400).json({msg: 'Orders not found'});
        }
        return res.json(user.ordersStory);
    }catch(error){
        return res.status(400).json({msg: error.message});
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

export const payAccount = async(req: Request, res: Response) => {

    let currentTable = await redisClient.get(`table${req.body.tableId}`);
    let currentTableParsed = JSON.parse(currentTable);

    let userOrderIds = [];

    for(let user of currentTableParsed.usersConnected){
        let orderProductIds = [];

        for(let product of user.orderProducts){
            let orderToppingIds = [];

            for(let topping of product.toppings){
                let orderToppingOptionIds = [];

                for(let option of topping.options){
                    const orderToppingOption = new OrderToppingOption({
                        toppingOptionId: option._id,
                        price: option.price
                    });
                    await orderToppingOption.save();
                    orderToppingOptionIds.push(orderToppingOption._id);
                }

                const orderTopping = new OrderTopping({
                    toppingId: topping._id,
                    toppingOptions: orderToppingOptionIds,
                });
                await orderTopping.save();
                orderToppingIds.push(orderTopping._id);
            }

            const orderProduct = new OrderProduct({
                productId: product._id,
                toppings: orderToppingIds,
                price: product.totalWithToppings,
            });
            await orderProduct.save();
            orderProductIds.push(orderProduct._id);
        }


        const userOrder = new UserOrder({
            userId: user.userId,
            orderProducts: orderProductIds,
            price: user.price
        });
        await userOrder.save();
        userOrderIds.push(userOrder._id);

    }

    const order = new Order({
        usersOrder: userOrderIds,
        tableId: req.body.tableId,
        totalPrice: currentTableParsed.totalPrice,
        restaurantId: currentTableParsed.restaurantId,
        tip: req.body.tip
    });
    await order.save();
    for(let user of currentTableParsed.usersConnected){
        const mongoUser = await User.findById(user.userId);
        mongoUser.ordersStory.push(order._id);
        await mongoUser.save();
    }
    return res.json({ msg: 'User order created successfully', order });

}
export const getOrder = async(req: Request, res: Response)=>{
    try{
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'User order not found' });
        }
        return res.json(order);
    }catch(error){
        return res.status(400).json({ msg: error.message });
    }
}
