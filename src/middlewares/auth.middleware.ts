import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const tokenIsValid = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });
    try {
        const verified = jwt.verify(token, 'process.env.JWT_SECRET');
        res.locals.token = verified;
        next();
    } catch (err) {
        return res.status(400).json({ msg: 'Invalid token.' });
    }
}
