import User from '../models/user/user';
import Cashier from '../models/restaurant/cashier';
import e, { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';

export const getCashier = async (req: Request, res: Response) => {
    try{
        const cashier = await Cashier.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        })
        return res.json(cashier);
    }catch(error){
        return res.status(400).json({ msg: error });
    }
}

export const getAllCashiers = async (req: Request, res: Response) => {
    console.log("Endpoint Reached")
    try {
        console.log("Entered - Data sent:", req);
        const cashier = await Cashier.find({restaurant : req.header('restaurantId')});
        console.log("waiters found:", cashier);
        return res.json(cashier);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createCashier = async (req: Request, res: Response) => {
    const user = await User.findOne({ 'email': req.body.cashierEmail });
    if (!user) return res.status(404).json({ msg: 'cashiers email is not found' });
    const restaurant = await Restaurant.findById(req.header('restaurantId'));
    const cashierExists = await Cashier.findOne({ 'user': user._id, 'restaurant': req.header('restaurantId')});
    if (cashierExists) return res.status(403).json({ msg: 'The ccashier is already registered' })
    if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
    try {
        if(!user.rols.includes('cashier'))user.rols.push('cashier');
        await user.save();
        let cashier = new Cashier({ 'user': user._id, 'restaurant': req.header('restaurantId') });
        await cashier.save();
        restaurant.cashiers.push(user._id);
        await restaurant.save();
        cashier = await Cashier.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        });
        return res.json({ msg: 'The cashier was registered succesfully!!' ,cashier})
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: error })
    }
}


export const updateCashier = async(req:Request,res:Response)=>{
    try{
        let cashier = await Cashier.findById(req.body.waiterId);
        await cashier.updateOne(req.body);
        cashier = await Cashier.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        });
        return res.json({msg:'Cashier updated succesfully',cashier});
    }catch(error){
        return res.status(400).json({msg:error});
    }
    
}