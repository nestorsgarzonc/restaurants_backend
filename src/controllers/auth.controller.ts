import { Request, Response } from 'express';
import { hashSync, compareSync } from 'bcrypt';
import { getToken } from '../core/jwt';
import User from '../models/user/user';

export const login = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'Oops, usuario incorrecto' });
        }
        if (!compareSync(req.body.password, user.password.toString())) {
            return res.status(404).json({ msg: 'Usuario o contraseña incorrecta' });
        }
        user.sessionValid = true;
        user.save();
        const userProteted = user.toObject();
        delete userProteted.password;
        const token = getToken(user.id);
        return res.json({
            token,
            user: userProteted,
        });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
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
    try {
        const user = await User.findById(res.locals.token.userId);
        user.sessionValid = false;
        user.save();
        return res.json({ msg: "PENDING: Logout successfully." });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }

}

export const resetPassword = async (req: Request, res: Response) => {
    return res.json({ msg: "PENDING: Reset password successfully." });
}

export const refreshToken = async (req: Request, res: Response) => {
    const user = await User.findById(res.locals.token.userId);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    const token = getToken(user.id);
    return res.json({ token });
}