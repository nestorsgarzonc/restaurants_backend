import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user/user';

export const tokenIsValid = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.token = verified;
        const user = await User.findById(res.locals.token.userId);
        if(!user.sessionValid) return res.status(401).json({msg: 'Access denied. You have to log in'});
        next();
    } catch (err) {
        return res.status(400).json({ msg: 'Invalid token.' });
    }
}
