import User from '../models/user/user';
import Waiter from '../models/restaurant/waiter';
import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';

export const getWaiter = async (req: Request, res: Response) => {
}



export const createWaiter = async (req: Request, res: Response) => {
    const user = await User.findOne({'email': req.body.waiterEmail});
    if(!user) return res.status(404).json({msg:'waiters email is not found'});
    const restaurant = await Restaurant.findById(req.body.restaurantId);
    const waiterExists = await Waiter.findOne({'user' : user._id, 'restaurant': req.body.restaurantId});
    if(waiterExists) return res.status(403).json({msg: 'The waiter is already registered'})
    if(!restaurant) return res.status(404).json({msg:' restaurant is not found'});
    if(req.body.adminId != restaurant.owner) return res.status(404).json({msg:' you are not the owner of this restaurant'})
    try{
        user.rol = 'waiter';
        await user.save();
        const waiter = new Waiter({'user': user._id, 'restaurant': req.body.restaurantId});
        await waiter.save();
        restaurant.waiters.push(user._id);
        await restaurant.save();
        return res.json({msg:'The waiter was registered succesfully!!'})
    }catch (error){
        return res.status(400).json({msg: error})
    }
}
