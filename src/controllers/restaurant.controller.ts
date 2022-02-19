import { Request, Response } from 'express';
import Restaurant from '../models/restaurant/restaurant';
import User from '../models/user/user';

export const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        return res.json(restaurant);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find();
        return res.json(restaurants);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getCloserRestaurants = async (_: Request, res: Response) => {
    try {
        const userId = res.locals.token.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (!user.coordinates || user.coordinates.length === 0) {
            return res.status(404).json({ msg: 'User not has a valid direction' });
        }
        const restaurants = await Restaurant.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [user.coordinates[0], user.coordinates[1]],
                    },
                    $maxDistance: 10,
                },
            },
        });
        return res.json(restaurants);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createRestaurant = async (req: Request, res: Response) => {

}

export const updateRestaurant = async (req: Request, res: Response) => {

}

export const getTables = async (req: Request, res: Response) => {

}

export const getWaiters = async (req: Request, res: Response) => {

}

export const getOrders = async (req: Request, res: Response) => {

}

export const getMenu = async (req: Request, res: Response) => {

}   