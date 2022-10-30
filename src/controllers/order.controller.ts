import { Request, Response } from 'express';
import {redisClient} from '../core/sockets';
import Order from '../models/restaurant/order';
import User from '../models/user/user';
import OrderProduct from '../models/restaurant/orderProduct';
import OrderTopping from '../models/restaurant/orderTopping';
import OrderToppingOption from '../models/restaurant/orderToppingOption';
import UserOrder from '../models/restaurant/userOrder';
import restaurant from '../models/restaurant/restaurant';
import user from '../models/user/user';

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
                select:['totalPrice','createdAt','paymentWay','paymentMethod'],
                populate: [{
                    path:'restaurantId' as 'restaurant',
                    select:['address','name','logoUrl']
                },
                {
                    path:'usersOrder', match:{userId:userId}, select:['price']
                }
            ]
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
                    /*const orderToppingOption = new OrderToppingOption({
                        toppingOptionId: option._id,
                        price: option.price
                    });
                    await orderToppingOption.save();
                    orderToppingOptionIds.push(orderToppingOption._id);*/
                    orderToppingOptionIds.push(option._id);
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
        tip: req.body.tip,
        paymentWay: req.body.paymentWay,
        paymentMethod: req.body.paymentMethod
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
        const userId = res.locals.token.userId;
        console.log(userId);
        const order = await Order.findById(req.params.id)
            .populate([{
                path:'usersOrder',
                populate:[{
                    path:'orderProducts',
                    populate:[{
                        path:'toppings',
                        populate:[{
                            path:'toppingOptions',select:['name','price']
                        },
                        {
                            path:'toppingId', select:['name']
                        }]
                    },
                    {
                        path:'productId', select:['name','price','imgUrl']
                    }]
                },
                {
                    path:'userId',select:['firstName','lastName']
                }]
            },
            {
                path:'restaurantId',select:['logoUrl','name','address']
            }
        ]);
        if (!order) {
            return res.status(404).json({ msg: 'User order not found' });
        }
        console.log(order.usersOrder);
        if(order.paymentWay=='all'){
            return res.json(order);
        }else if(order.paymentWay=='split'){
            
            return res.json({order:order.usersOrder.find(userorder=>(userorder as any).userId._id==userId),restaurantId:order.restaurantId,payment:{way:order.paymentWay,method:order.paymentMethod}});
        }
        
    }catch(error){
        return res.status(400).json({ msg: error.message });
    }
}


