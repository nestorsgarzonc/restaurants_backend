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
        const cashier = await Cashier.find({restaurant : req.header('restaurantId')}).populate({
            path:'user',select:['firstName','lastName','email']
        });
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
        cashier = await Cashier.findOne({'user': user._id}).populate({
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
        await Cashier.updateOne({_id:req.params.id},req.body);
        const cashier = await Cashier.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        });
        return res.json({msg:'Cashier updated succesfully',cashier});
    }catch(error){
        return res.status(400).json({msg:error});
    }
    
}

export const deleteCashier = async(req:Request,res:Response)=>{
    try{
        const restaurant = await Restaurant.findById(req.header('restaurantId'));
        if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
        const cashier = await Cashier.findById(req.params.id);
        if(!cashier)return res.json({msg:'Cashier not found'});
        let cashierIndex = restaurant.cashiers.indexOf(cashier.user, 0);
        if (cashierIndex > -1)restaurant.cashiers.splice(cashierIndex, 1);
        const user = await User.findById(cashier.user);
        cashierIndex = user.rols.indexOf('cashier', 0);
        if (cashierIndex > -1)user.rols.splice(cashierIndex, 1);
        await restaurant.save();
        await user.save();
        await cashier.deleteOne({_id:cashier._id});
        return res.json({msg:'Cashier deleted succesfully'});

    }catch(error){
        return res.status(400).json({msg:error});
    }
}