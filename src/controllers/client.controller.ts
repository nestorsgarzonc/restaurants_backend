import e, { Request, Response, NextFunction } from 'express';
import Client from '../models/user/client';

export const addClientEmail = async (req: Request, res: Response) => {
    try{
        const client = new Client(req.body);
        await client.save();
        return res.json({msg:"Correo añadido a lista de espera"});
    }catch(error){
        return res.status(400).json({ msg: error });
    }
}
