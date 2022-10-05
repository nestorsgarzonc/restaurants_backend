import { Request, Response } from 'express';
import { hashSync, compareSync } from 'bcrypt';
import { getToken } from '../core/jwt';
import User from '../models/user/user';
import nodemailer = require('nodemailer')
import * as jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    try{
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'Oops, usuario incorrecto' });
        }
        if (!compareSync(req.body.password, user.password.toString())) {
            return res.status(404).json({ msg: 'Usuario o contraseña incorrecta' });
        }
        user.sessionValid = true;
        user.save();
        const userProtected = user.toObject();
        delete userProtected.password;
        const token = getToken(user.id);
        return res.json({
            token,
            user:userProtected,
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
        console.log("mmondá");
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
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ msg: 'Please enter a valid user' });
        }
        const message = 'Chech your email for a link to reset your password'
        const token = getToken(user.id);
        let verifLink = process.env.RECOVER_PASSWORD_URL + token;

        // sendEmail
        let emailStatus = 'Ok';
        try {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            //let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_AUTH, // generated ethereal user
                    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
                },
            });

            transporter.verify().then(() => {
                console.log('Ready for send emails')
            })

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"On Yor Table" <'+ process.env.EMAIL_AUTH +'>', // sender address
                to: user.email, // list of receivers
                subject: "Forgot password", // Subject line
                text: "Hello world?", // plain text body
                html: `
                <b>Please click to complete the process</b>
                <a href="${verifLink}">${verifLink}</a>
                `, // html body
            });

            console.log("sent to:", user.email)
        } catch (error) {
            emailStatus = error;
            return res.status(400).json({ msg: 'Something goes wrong!' })
        }
        return res.json({ msg: "Email sent successfully.", info: emailStatus, mail: user.email });

    } catch (error) {
        return res.json({ msg: error.message })
    }
}

export const createNewPassword = async (req: Request, res: Response) => {
    const token = req.header('auth-token');
    req.body.password = hashSync(req.body.password, 10)
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.token = verified;
        const user = await User.findById(res.locals.token.userId);
        await user.updateOne(req.body);
        return res.json({ msg: "Reset password successfully." });
    } catch (error) {
        return res.json({ msg: error.message })
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const user = await User.findById(res.locals.token.userId);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    const userProtected = user.toObject();
    delete userProtected.password;
    const token = getToken(user.id);
    return res.json({
        token,
        user: userProtected,
    });
}