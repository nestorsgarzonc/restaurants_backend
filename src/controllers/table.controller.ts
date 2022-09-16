import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';
import Table from '../models/restaurant/table'

export const createTable = async (req: Request, res: Response) => {
    try {
        //Look that table's not created at the same restaurant
        const tableExists = await Table.findOne({ 'name': req.body.name, 'restaurantId': req.body.restaurantId });
        if (tableExists) return res.status(403).json({ msg: 'The table already exists' })
        const table = new Table(req.body);
        const restaurant = await Restaurant.findById(req.body.restaurantId);
        if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });
        
        await table.save();
        restaurant.tables.push(table._id);
        await restaurant.save();
        return res.status(201).json({ msg: 'Table created succesfully!!' })
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
}