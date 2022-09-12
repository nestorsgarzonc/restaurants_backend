import User from '../models/user/user';
import Waiter from '../models/restaurant/waiter';
import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';

export const getWaiter = async (req: Request, res: Response) => {
}

export const createWaiter = async (req: Request, res: Response) => {
    const waiter_user = await User.findOne({'email': req.body.waiterEmail});
    const restaurant = await Restaurant.findById(req.body.restaurantId);
    if(!waiter_user) return res.status(404).json({msg:'waiters email is not found'});
    if(!restaurant) return res.status(404).json({msg:' restaurant is not found'});
    if(req.body.adminId != restaurant.owner) return res.status(404).json({msg:' you are not the owner of this restaurant'})
    try{
        const waiter = new Waiter({'user': waiter_user._id, 'restaurant': req.body.restaurantId});
        await waiter.save();
        return res.json({msg:'The waiter was registered succesfully!!'})
    }catch (error){
        return res.status(400).json({msg: error})
    }
}
