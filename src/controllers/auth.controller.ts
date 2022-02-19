import { Request, Response } from 'express';
import { hashSync, compareSync } from 'bcrypt';
import * as jwt from "jsonwebtoken";
import User from '../models/user/user';

export const login = async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ msg: 'Oops, usuario incorrecto' });
    }
    if (!compareSync(req.body.password, user.password.toString())) {
        return res.status(404).json({ msg: 'Usuario o contraseña incorrecta' });
    }
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_DURATION }
    );
    return res.json({ token });
}

export const register = async (req: Request, res: Response) => {
    try {
        req.body.password = hashSync(req.body.password, 10)
        const user = new User(req.body);
        await user.save()
        console.log(user);
        return res.status(201).json({ msg: "User created successfully." });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

export const logout = async (req: Request, res: Response) => {
    return res.json({ msg: "PENDING: Logout successfully." });
}

export const resetPassword = async (req: Request, res: Response) => {
    return res.json({ msg: "PENDING: Reset password successfully." });
}

export const refreshToken = async (req: Request, res: Response) => {
    const user = await User.findById(res.locals.token.userId);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_DURATION }
    );
    return res.json({ token });
}