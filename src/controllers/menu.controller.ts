import { Request, Response } from 'express';
import Menu from '../models/menu/menuItem';
import Restaurant from '../models/restaurant/restaurant';
import Topping from '../models/menu/toppings';
import Category from '../models/menu/category';
import ToppingOption from '../models/menu/toppingOption';

export const getAllMenus = async (req: Request, res: Response) => {
    //TODO: where do we use this method
    try {
        const menus = Menu.find();
        return res.json(menus);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getRestaurantMenu = async (req: Request, res: Response) => {
    //TODO: this is what I need to complete ajaja
    const restaurant = await Restaurant.findById(req.params.restaurantId)
    .populate({
        path: 'menu',
        populate: {
            path: 'menuItems',
            populate: {
                path: 'toppings',
                populate: {
                    path: 'options'
                }
            }
        }
    })


    if(!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });
    try{
        return res.json(restaurant);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createCategory = async (req: Request, res: Response) => {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if(!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });
    const category = new Category (req.body);
    restaurant.menu.push(category._id);
    try{
        await restaurant.save();
        await category.save();
        return res.json({ msg: 'Category created successfully', category });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createMenu = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        const menuItem = new Menu(req.body);
        category.menuItems.push(menuItem._id);
        await category.save();
        await menuItem.save();
        return res.json({ msg: 'Menu item created successfully', menuItem });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateMenu = async (req: Request, res: Response) => {
    try {
        const menuItem = await Menu.findById(req.params.id);
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
        const menuItem = await Menu.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ msg: 'Menu item not found' });
        }
        menuItem.isAvaliable = false
        await menuItem.save();
        return res.json({ msg: 'Menu item deleted successfully' });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getMenuToppings = async (req: Request, res: Response) => {
    try {
        const menu = await Menu.findById(req.params.id)
            .populate('Toppings');
        if (!menu) {
            return res.status(404).json({ msg: 'Toppings not found' });
        }
        return res.json(menu.toppings);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const addToppingToMenu = async (req: Request, res: Response) => {
    try {
        const menu = await Menu.findById(req.params.menuId);
        if (!menu) {
            return res.status(404).json({ msg: 'Menu not found' });
        }
        const topping = new Topping(req.body);
        await topping.save();
        menu.toppings.push(topping._id);
        await menu.save();
        return res.json({ msg: 'Topping added to menu successfully', topping });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const deleteToppingFromMenu = async (req: Request, res: Response) => {
    try {
        const menu = await Menu.findById(req.params.menuId);
        if (!menu) {
            return res.status(404).json({ msg: 'Menu not found' });
        }
        const topping = await Topping.findById(req.params.toppingId);
        if (!topping) {
            return res.status(404).json({ msg: 'Topping not found' });
        }
        menu.toppings = menu.toppings.filter(toppingId => toppingId !== topping._id);
        await menu.save();
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const addToppingOptionToTopping = async (req: Request, res: Response) => {
    const topping = await Topping.findById(req.params.toppingId);
    if(!topping) return res.status(404).json({ msg: 'Topping not found' });
    const toppingOption = new ToppingOption(req.body);
    try{
        await toppingOption.save();
        topping.options.push(toppingOption._id);
        await topping.save();
        return res.json({ msg: 'Topping Option added to menu successfully', toppingOption });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}