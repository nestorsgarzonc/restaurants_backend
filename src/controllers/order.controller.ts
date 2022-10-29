import { Request, Response } from 'express';
import { REPLCommand } from 'repl';
import Order from '../models/restaurant/order';
import UserOrder from '../models/restaurant/userOrder';
import user from '../models/user/user';
import User from '../models/user/user';

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
                populate: {
                    path:'',
                    select:['totalPrice','createdAt'],
                    populate: {
                        path:'restaurantId',
                        select:['address','name']
                    }
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

export const getUserOrder = async(req: Request, res: Response)=>{
    try{
        const hola = req.params.id;
        const userOrder = await UserOrder.findById(req.params.id);
        if (!userOrder) {
            return res.status(404).json({ msg: 'User order not found' });
        }
        return res.json(userOrder);
    }catch(error){
        return res.status(400).json({ msg: error.message });
    }
}
