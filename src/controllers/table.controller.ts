import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';
import Table from '../models/restaurant/table'
import { redisClient } from '../core/sockets';
import { SageMakerFeatureStoreRuntime } from 'aws-sdk';

export const createTable = async (req: Request, res: Response) => {
    try {
        //Look that table's not created at the same restaurant
        const restaurantId = req.header('restaurantId');
        const tableExists = await Table.findOne({ 'name': req.body.name, 'restaurantId': restaurantId });
        if (tableExists) return res.status(403).json({ msg: 'The table already exists' })
        const table = new Table({
            restaurantId: restaurantId,
            name: req.body.name
        });
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });
        await table.save();
        restaurant.tables.push(table._id);
        await restaurant.save();
        return res.status(201).json({ msg: 'Table created succesfully!!', table })
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
}

export const editTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.body.tableId);
        if (!table) return res.status(404).json({ msg: 'The table does not exist' });
        table.name = req.body.name;
        await table.save();
        return res.status(201).json({ msg: 'Table updated succesfully' });
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
}

export const deleteTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.body.tableId);
        if (!table) return res.status(404).json({ msg: 'The table does not exist' });
        if (table.restaurantId.toString() != req.header('restaurantId')) {
            return res.status(403).json({ msg: 'You are not allowed to delete this table' });
        }
        const restaurant = await Restaurant.findById(table.restaurantId);
        if (!restaurant) return res.status(404).json({ msg: 'The restaurant does not exist' });
        restaurant.tables = restaurant.tables.filter((table) => table != req.body.tableId);
        await Promise.all([restaurant.save(), table.remove()]);
        return res.status(201).json({ msg: 'Table deleted succesfully' });
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
}

export const getTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.body.tableId);
        if (!table) return res.status(404).json({ msg: 'The table does not exist' });
        return res.status(200).json({ table });
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
}

export const getUsersByTable = async (req: Request, res: Response) => {

    let currentTable = await redisClient.get(`table${req.body.tableId}`);
    if (!currentTable) res.json({ msg: "No user conected to this table" })
    let currentTableParsed = JSON.parse(currentTable);

    let usersList = []

    currentTableParsed.usersConnected.forEach(user => {
        console.log(user.userId);
        if (user.userId != req.body.tableId) {
            usersList.push({ userid: user.userId, firstName: user.firstName, lastName: user.lastName });
        }
    });

    res.json({ users: usersList })

}