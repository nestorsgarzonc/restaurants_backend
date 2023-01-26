import { Request, Response, NextFunction } from 'express';
import Admin from '../models/restaurant/admin';
import Restaurant from '../models/restaurant/restaurant';

export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await Restaurant.findById(req.header('restaurantId'));
        if(restaurant.owner!= res.locals.token.userId){
            return res.status(401).json({msg:'User is not restaurant admin.'});
        }
        next();
    } catch (err) {
        return res.status(400).json({ msg:err.message});
    }
}
// export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const admin = await Admin.find({user : req.header('restaurantId')});
//         if(restaurant.owner!= res.locals.token.userId){
//             return res.status(401).json({msg:'User is not restaurant admin.'});
//         }
//         next();
//     } catch (err) {
//         return res.status(400).json({ msg:err.message});
//     }
// }