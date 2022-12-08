import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { sessionValid } from '../core/constants/redis.constants';
import { redisClient } from '../core/sockets';

export const tokenIsValid = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });
    try {
        const verified = await baseVerification(true, token);
        res.locals.token = verified;
        if (!verified) return res.status(401).json({ msg: 'Access denied. You have to log in' });
        next();
    } catch (err) {
        return res.status(400).json({ msg: 'Invalid token.' });
    }
}

export const tokenIsValidSocket = async (token: string) => {
    try {
        const verified = await baseVerification(false, token);
        return (verified as jwt.JwtPayload).userId;
    } catch (err) {
        console.log(err);
        return null;
    }
}

const baseVerification = async (checkDbUser: boolean, token: string) => {
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (checkDbUser) {
            const user = await redisClient.get(sessionValid+(verified as jwt.JwtPayload).userId);
            if (!user) {
                return null;
            }
        }
        return verified;
    } catch (err) {
        return null;
    }
}