import User from '../models/user/user';
import Waiter from '../models/restaurant/waiter';
import e, { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';
import waiter from '../models/restaurant/waiter';

export const getWaiter = async (req: Request, res: Response) => {
    try{
        const waiter = await Waiter.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        })
        return res.json(waiter);
    }catch(error){
        return res.status(400).json({ msg: error });
    }
}

export const getAllWaiters = async (req: Request, res: Response) => {
    console.log("Endpoint Reached")
    try {
        console.log("Entered - Data sent:", req);
        const waiters = await Waiter.find({restaurant : req.header('restaurantId')}).populate({
            path:'user',select:['firstName','lastName','email']
        });
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
    const waiterExists = await Waiter.findOne({ 'user': user._id, 'restaurant': req.header('restaurantId')});
    if (waiterExists) return res.status(403).json({ msg: 'The waiter is already registered' })
    if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
    try {
        if(!user.rols.includes('waiter'))user.rols.push('waiter');
        await user.save();
        let waiter = new Waiter({ 'user': user._id, 'restaurant': req.header('restaurantId') });
        await waiter.save();
        restaurant.waiters.push(user._id);
        await restaurant.save();
        waiter = await Waiter.findOne({'user': user._id}).populate({
            path:'user',select:['firstName','lastName','email']
        })
        return res.json({ msg: 'The waiter was registered succesfully!!' ,waiter})
    } catch (error) {
        return res.status(400).json({ msg: error })
    }
}


export const updateWaiter = async(req:Request,res:Response)=>{
    try{
        await Waiter.updateOne({_id:req.params.id},req.body);

        const waiter = await Waiter.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        })
        console.log(waiter);
        return res.json({msg:'Waiter updated succesfully',waiter});
    }catch(error){
        console.log(error);
        return res.status(400).json({msg:error});
    }
}

export const deleteWaiter = async(req:Request,res:Response)=>{
    try{
        const restaurant = await Restaurant.findById(req.header('restaurantId'));
        if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
        const waiter = await Waiter.findById(req.params.id);
        if(!waiter)return res.json({msg:'Waiter not found'});
        let waiterIndex = restaurant.waiters.indexOf(waiter.user, 0);
        if (waiterIndex > -1)restaurant.waiters.splice(waiterIndex, 1);
        const user = await User.findById(waiter.user);
        waiterIndex = user.rols.indexOf('waiter', 0);
        if (waiterIndex > -1)user.rols.splice(waiterIndex, 1);
        await restaurant.save();
        await user.save();
        await Waiter.deleteOne({_id:waiter._id});
        return res.json({msg:'Waiter deleted succesfully'});

    }catch(error){
        return res.status(400).json({msg:error});
    }
}