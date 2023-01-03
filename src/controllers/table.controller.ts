import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/restaurant/restaurant';
import Table from '../models/restaurant/table'
import { redisClient } from '../core/sockets';

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
        return res.status(201).json({ msg: 'Table created succesfully!!',table})
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
}

export const editTable = async(req:Request,res:Response) => {
    try{
        const table = await Table.findById(req.body.tableId);
        if(!table)return res.status(404).json({ msg: 'The table does not exist' });
        table.name = req.body.name;
        table.capacity = req.body.capacity;
        await table.save();
        return res.status(201).json({msg:'Table updated succesfully'});
    }catch(error){
        return res.status(404).json({msg: error.message});
    }
}

export const deleteTable = async(req:Request,res:Response)=>{
    try{
        const table = await Table.findById(req.body.tableId);
        if(!table)return res.status(404).json({ msg: 'The table does not exist' });
        const restaurant = await Restaurant.findById(table.restaurantId);
        if(!restaurant)return res.status(404).json({ msg: 'The restaurant does not exist' });
        const tableIndex = restaurant.tables.indexOf(req.body.tableId);
        if (tableIndex > -1) { 
            restaurant.tables.splice(tableIndex, 1); 
        } 
        await restaurant.save();
        await Table.deleteOne({_id:table._id});
        return res.status(201).json({msg:'Table deleted succesfully'});
    }catch(error){
        return res.status(404).json({msg: error.message});
    }
}

export const getTable = async(req:Request,res:Response)=>{
    try{
        const table = await Table.findById(req.body.tableId);
        if(!table)return res.status(404).json({ msg: 'The table does not exist' });
        return res.status(200).json({table});
    }catch(error){
        return res.status(404).json({msg: error.message});
    }
}

export const getUsersByTable = async(req: Request, res: Response) => {
    
    let currentTable = await redisClient.get(`table${req.body.tableId}`);
    if(!currentTable) res.json({msg: "No user conected to this table"})
    let currentTableParsed = JSON.parse(currentTable);

    let usersList = []

    currentTableParsed.usersConnected.forEach(user => {
        console.log(user.userId);
        if(user.userId != req.body.tableId){
            usersList.push({userid: user.userId, firstName: user.firstName, lastName: user.lastName});            
        }
    });

    res.json({users: usersList})

}