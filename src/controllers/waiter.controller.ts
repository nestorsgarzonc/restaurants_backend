import User from '../models/user/user';
import Waiter from '../models/restaurant/waiter';
import e, { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';

export const getWaiter = async (req: Request, res: Response) => {
    //TODO: wtf where is the method?
}

export const getAllWaiters = async (req: Request, res: Response) => {
    console.log("Endpoint Reached")
    try {
        console.log("Entered - Data sent:", req);
        const waiters = await Waiter.find({restaurant : req.header('restaurantId')});
        console.log("waiters found:", waiters);
        return res.json(waiters);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createWaiter = async (req: Request, res: Response) => {
    const user = await User.findOne({ 'email': req.body.waiterEmail });
    if (!user) return res.status(404).json({ msg: 'waiters email is not found' });
    const restaurant = await Restaurant.findById(req.header('restaurantId'));
    const waiterExists = await Waiter.findOne({ 'user': user._id, 'restaurant': req.body.restaurantId });
    if (waiterExists) return res.status(403).json({ msg: 'The waiter is already registered' })
    if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
    if (req.body.adminId != restaurant.owner) return res.status(404).json({ msg: ' you are not the owner of this restaurant' })
    try {
        if(!user.rols.includes('waiter'))user.rols.push('waiter');
        await user.save();
        const waiter = new Waiter({ 'user': user._id, 'restaurant': req.body.restaurantId });
        await waiter.save();
        restaurant.waiters.push(user._id);
        await restaurant.save();
        return res.json({ msg: 'The waiter was registered succesfully!!' })
    } catch (error) {
        return res.status(400).json({ msg: error })
    }
}


export const updateWaiter = async(req:Request,res:Response)=>{
    try{
        const waiter = await Waiter.findById(req.body.waiterId);
        await waiter.updateOne(req.body);
        return res.json({msg:'Waiter updated succesfully',waiter});
    }catch(error){
        return res.status(400).json({msg:error});
    }
    
}