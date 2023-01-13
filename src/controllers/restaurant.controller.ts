import { Request, Response } from 'express';
import Restaurant from '../models/restaurant/restaurant';
import User from '../models/user/user';
import Table from '../models/restaurant/table';
import Waiter from '../models/restaurant/waiter';
import MenuItem from '../models/menu/menuItem';

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
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();
        return res.json({ msg: 'Restaurant created successfully', restaurant });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        await restaurant.updateOne(req.body);
        return res.json({ msg: 'Restaurant updated successfully', restaurant });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

//TODO: Table's methods into restaurant controller

/*export const getTables = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        return res.json(restaurant.tables);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createTable = async (req: Request, res: Response) => {
    try {
        const table = new Table(req.body);
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        await table.save();
        restaurant.tables.push(table._id);
        await restaurant.save();
        return res.json({ msg: 'Table created successfully', table });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ msg: 'Table not found' });
        }
        await table.updateOne(req.body);
        return res.json({ msg: 'Table updated successfully', table });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const deleteTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ msg: 'Table not found' });
        }
        await table.updateOne({ status: 'unavailable' });
        return res.json({ msg: 'Table deleted successfully', table });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}*/

//TODO: Waiter's methods into restaurant controller

/*export const getWaiters = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        return res.json(restaurant.waiters);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateWaiter = async (req: Request, res: Response) => {
    try {
        const waiter = await Waiter.findById(req.params.id);
        if (!waiter) {
            return res.status(404).json({ msg: 'Waiter not found' });
        }
        await waiter.updateOne(req.body);
        return res.json({ msg: 'Waiter updated successfully', waiter });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const deleteWaiter = async (req: Request, res: Response) => {
    try {
        const waiter = await Waiter.findById(req.params.id);
        if (!waiter) {
            return res.status(404).json({ msg: 'Waiter not found' });
        }
        await waiter.updateOne({ status: 'unavailable' });
        return res.json({ msg: 'Waiter deleted successfully', waiter });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}*/

//TODO: Menu's methods into restaurant controller

/*export const getMenu = async (req: Request, res: Response) => {
    try {
        const restaurant = await (await Restaurant.findById(req.params.restaurantId))
            .populate('MenuItem');
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        return res.json(restaurant.menu);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createMenu = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        const menuItem = new MenuItem(req.body);
        await menuItem.save();
        restaurant.menu.push(menuItem._id);
        await restaurant.save();
        return res.json({ msg: 'Menu item created successfully', menuItem });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateMenu = async (req: Request, res: Response) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ msg: 'Menu item not found' });
        }
        await menuItem.updateOne(req.body);
        return res.json({ msg: 'Menu item updated successfully', menuItem });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const deleteMenu = async (req: Request, res: Response) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ msg: 'Menu item not found' });
        }
        await menuItem.deleteOne();
        return res.json({ msg: 'Menu item deleted successfully' });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}*/

export const getOwner = async (req: Request, res: Response) => {
    //TODO: Where do we use this method??
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId)
            .populate('Owner');
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        return res.json(restaurant.owner);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createOwner = async (req: Request, res: Response) => {
    //TODO: Where do we use this method??
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ msg: 'Restaurant not found' });
        }
        restaurant.owner = user._id;
        await restaurant.save();
        user.rol = "owner";
        await user.save();
        return res.json({ msg: 'Owner created successfully', user });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}