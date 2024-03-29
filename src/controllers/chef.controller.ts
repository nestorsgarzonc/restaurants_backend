import User from '../models/user/user';
import Chef from '../models/restaurant/chef';
import e, { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';

export const getChef = async (req: Request, res: Response) => {
    try{
        const chef = await Chef.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        })
        return res.json(chef);
    }catch(error){
        return res.status(400).json({ msg: error });
    }
}

export const getAllChefs = async (req: Request, res: Response) => {
    console.log("Endpoint Reached")
    try {
        console.log("Entered - Data sent:", req);
        const chef = await Chef.find({restaurant : req.header('restaurantId')}).populate({
            path:'user',select:['firstName','lastName','email']
        });
        console.log("waiters found:", chef);
        return res.json(chef);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createChef = async (req: Request, res: Response) => {
    const user = await User.findOne({ 'email': req.body.chefEmail });
    if (!user) return res.status(404).json({ msg: 'chefs email is not found' });
    const restaurant = await Restaurant.findById(req.header('restaurantId'));
    const chefExists = await Chef.findOne({ 'user': user._id, 'restaurant': req.header('restaurantId')});
    if (chefExists) return res.status(403).json({ msg: 'The chef is already registered' })
    if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
    try {
        if(!user.rols.includes('chef'))user.rols.push('chef');
        await user.save();
        let chef = new Chef({ 'user': user._id, 'restaurant': req.header('restaurantId') });
        await chef.save();
        restaurant.chefs.push(user._id);
        await restaurant.save();
        chef = await Chef.findOne({'user': user._id}).populate({
            path:'user',select:['firstName','lastName','email']
        });
        return res.json({ msg: 'The chef was registered succesfully!!' ,chef})
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: error })
    }
}


export const updateChef = async(req:Request,res:Response)=>{
    try{
        await Chef.updateOne({_id:req.params.id},req.body);
        const chef = await Chef.findById(req.params.id).populate({
            path:'user',select:['firstName','lastName','email']
        });
        return res.json({msg:'Chef updated succesfully',chef});
    }catch(error){
        return res.status(400).json({msg:error});
    }
    
}


export const deleteChef = async(req:Request,res:Response)=>{
    try{
        const restaurant = await Restaurant.findById(req.header('restaurantId'));
        if (!restaurant) return res.status(404).json({ msg: ' restaurant is not found' });
        const chef = await Chef.findById(req.params.id);
        if(!chef)return res.json({msg:'Chef not found'});
        let chefIndex = restaurant.chefs.indexOf(chef.user, 0);
        if (chefIndex > -1)restaurant.chefs.splice(chefIndex, 1);
        const user = await User.findById(chef.user);
        chefIndex = user.rols.indexOf('chef', 0);
        if (chefIndex > -1)user.rols.splice(chefIndex, 1);
        await restaurant.save();
        await user.save();
        await chef.deleteOne({_id:chef._id});
        return res.json({msg:'Chef deleted succesfully'});
    }catch(error){
        return res.status(400).json({msg:error});
    }
}