import { Request, Response } from 'express';
import Menu from '../models/menu/menuItem';
import Restaurant from '../models/restaurant/restaurant';
import Topping from '../models/menu/toppings';
import Category from '../models/menu/category';
import ToppingOption from '../models/menu/toppingOption';
import Table from '../models/restaurant/table';
import { uploadImageS3 } from '../core/util/s3.utils';

export const getAllMenus = async (req: Request, res: Response) => {
    //TODO: where do we use this method
    try {
        const menus = await Menu.find();
        return res.json(menus);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getRestaurantMenuWithRestaurantId = async (req: Request, res: Response) => {
    //TODO: this is what I need to complete ajaja
    try {
        const restaurant = await Restaurant.findById(req.header('restaurantId'))
            .populate({
                path: 'menu',
                populate: {
                    path: 'menuItems'
                }
            })


        if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });

        return res.json({ restaurant: restaurant });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}
export const getRestaurantMenu = async (req: Request, res: Response) => {
    //TODO: this is what I need to complete ajaja
    try {
        const table = await Table.findById(req.params.tableId);
        if (!table) return res.status(404).json({ msg: 'Table not found' });
        const restaurant = await Restaurant.findById(table.restaurantId)
            .populate({
                path: 'menu',
                populate: {
                    path: 'menuItems'
                }
            })


        if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });

        return res.json({ restaurant: restaurant, table: table });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });
        const category = new Category(req.body);
        if(req.body.img)category.img = await uploadImageS3(req.body.img,category._id.toString(),process.env.AWS_S3_MENU_PRODUCTS);
        restaurant.menu.push(category._id);
        category.restaurantId = restaurant._id;
        await restaurant.save();
        await category.save();
        return res.json({ msg: 'Category created successfully', category });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = Category.findById(req.params.id);
        if(req.body.img)req.body.img = await uploadImageS3(req.body.img,req.params.id,process.env.AWS_S3_MENU_PRODUCTS);
        if(!category)throw new Error('Category not found');
        await category.updateOne(req.body);
        return res.json({ msg: 'Category updated successfully', category });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        const restaurant = await Restaurant.findById(category.restaurantId);
        const categoryIndex = restaurant.menu.indexOf(category._id);
        if (categoryIndex > -1) { 
            restaurant.menu.splice(categoryIndex, 1); 
        } 
        await restaurant.save();
        await Category.deleteOne({_id:category._id});
        return res.json({ msg: 'Category deleted successfully' });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}




export const getAllCategories = async (req: Request, res: Response) => {

    try {
        const category = await Category.find();
        return res.json(category);
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
        if(req.body.img)menuItem.img = await uploadImageS3(req.body.img,menuItem._id.toString(),process.env.AWS_S3_MENU_PRODUCTS);
        category.menuItems.push(menuItem._id);
        menuItem.categoryId = category._id;
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
        if(req.body.img)req.body.img = await uploadImageS3(req.body.img,req.params.id,process.env.AWS_S3_MENU_PRODUCTS);
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
        const category = await Category.findById(menuItem.categoryId);
        const menuItemIndex = category.menuItems.indexOf(menuItem._id);
        if (menuItemIndex > -1) { 
            category.menuItems.splice(menuItemIndex, 1); 
        } 
        await category.save();
        await Menu.deleteOne({_id:menuItem._id});
        return res.json({ msg: 'Menu item deleted successfully' });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getMenuToppings = async (req: Request, res: Response) => {
    try {
        const menu = await Menu.findById(req.params.id)
            .populate({
                path: 'toppings',
                populate: {
                    path: 'options'
                }
            })
        if (!menu) {
            return res.status(404).json({ msg: 'Toppings not found' });
        }
        return res.json(menu);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getAllToppings = async (req: Request, res: Response) => {
    //TODO: where do we use this method
    try {
        const toppings = await Topping.find();
        return res.json(toppings);
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const getAllToppingsOptions = async (req: Request, res: Response) => {
    //TODO: where do we use this method
    try {
        const toppingOptions = await ToppingOption.find();
        return res.json(toppingOptions);
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
        topping.menuId = menu._id;
        await topping.save();
        menu.toppings.push(topping._id);
        await menu.save();
        return res.json({ msg: 'Topping added to menu successfully', topping });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateTopping = async (req: Request, res: Response) => {
    try {
        const topping = await Topping.findById(req.params.id);
        if (!topping) {
            return res.status(404).json({ msg: 'Topping item not found' });
        }
        await topping.updateOne(req.body);
        return res.json({ msg: 'Menu item updated successfully', topping});
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}


export const deleteToppingFromMenu = async (req: Request, res: Response) => {
    try {
        const topping = await Topping.findById(req.params.menuId);
        if (!topping) {
            return res.status(404).json({ msg: 'Topping not found' });
        }
        const menu = await Menu.findById(topping.menuId);
        if (!menu) {
            return res.status(404).json({ msg: 'MenuItem not found' });
        }
        const toppingIndex = menu.toppings.indexOf(topping._id);
        if (toppingIndex > -1) { 
            menu.toppings.splice(toppingIndex, 1); 
        } 
        await menu.save();
        await Topping.deleteOne({_id:topping._id});
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const addToppingOptionToTopping = async (req: Request, res: Response) => {
    try {
        const topping = await Topping.findById(req.params.toppingId);
        if (!topping) return res.status(404).json({ msg: 'Topping not found' });
        const toppingOption = new ToppingOption(req.body);
        if(req.body.img)toppingOption.img = await uploadImageS3(req.body.img,toppingOption._id.toString(),process.env.AWS_S3_MENU_PRODUCTS);
        toppingOption.toppingId = topping._id;
        await toppingOption.save();
        topping.options.push(toppingOption._id);
        await topping.save();
        return res.json({ msg: 'Topping Option added to menu successfully', toppingOption });
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const updateOption = async (req: Request, res: Response) => {
    try {
        const option = await ToppingOption.findById(req.params.id);
        if (!option) {
            return res.status(404).json({ msg: 'Topping item not found' });
        }
        if(req.body.img)req.body.img = await uploadImageS3(req.body.img,req.params.id,process.env.AWS_S3_MENU_PRODUCTS);
        await option.updateOne(req.body);
        return res.json({ msg: 'Menu item updated successfully', option});
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}

export const deleteOption = async (req: Request, res: Response) => {
    try {
        const option = await ToppingOption.findById(req.params.id);
        if (!option) {
            return res.status(404).json({ msg: 'ToppingOption not found' });
        }
        const topping = await Topping.findById(option.toppingId);
        if (!topping) {
            return res.status(404).json({ msg: 'MenuItem not found' });
        }
        const optionIndex = topping.options.indexOf(option._id);
        if (optionIndex > -1) { 
            topping.options.splice(optionIndex, 1); 
        } 
        await topping.save();
        await option.deleteOne({_id:topping._id});
    } catch (error) {
        return res.status(400).json({ msg: error });
    }
}