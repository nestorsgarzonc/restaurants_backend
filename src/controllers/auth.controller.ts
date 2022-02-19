import { Request, Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if (!(username && password)) {
        return res.status(400).json({ msg: "Username and password are required." });
    }
    const token = jwt.sign(
        {},//{ userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}


export const register = async (req: Request, res: Response) => {

}

export const logout = async (req: Request, res: Response) => {

}

export const resetPassword = async (req: Request, res: Response) => {

}

export const refreshToken = async (req: Request, res: Response) => {

}