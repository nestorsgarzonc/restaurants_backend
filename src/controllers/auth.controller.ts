import { Request, Response } from 'express';
import { hashSync, compareSync } from 'bcrypt';
import { getToken } from '../core/jwt';
import User, { UserRols } from '../models/user/user';
import Waiter from '../models/restaurant/waiter';
import nodemailer = require('nodemailer')
import * as jwt from 'jsonwebtoken';
import { redisClient } from '../core/sockets';
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
console.log(process.env.EMAIL_PASSWORD)
export const login = async (req: Request, res: Response) => {
    try {
        
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'Oops, usuario incorrecto' });
        }
        if (!compareSync(req.body.password, user.password.toString())) {
            return res.status(404).json({ msg: 'Usuario o contraseña incorrecta' });
        }
        if(user.rol==UserRols.Waiter){
            const verification_code = String(Math.floor(100000 + Math.random() * 900000));
            await redisClient.set(user.email+'_'+verification_code,verification_code);
            redisClient.expire(user.email+'_'+verification_code,120);
            client.messages
            .create({body: 'Tu código de verificación en On your table es '+verification_code, from: '+12057493933', to: '+57'+user.phone})
            .then(message => console.log(message.body));
        }
        user.sessionValid = true;
        await user.save();
        const userProtected = user.toObject();
        delete userProtected.password;
        const token = getToken(user.id);
        return res.json({
            token,
            user: userProtected,
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
        return res.json({ msg: "Logout successfully." });
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
                from: '"On Yor Table" <' + process.env.EMAIL_AUTH + '>', // sender address
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

export const isWaiter = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(res.locals.token.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if(!await redisClient.get(req.body.email+'_'+req.body.verification)){
            return res.status(403).json({msg: 'Codigo de verificación incorrecto o expirado'});
        }
        await redisClient.del(user.email+'_'+req.body.verification);
        if (user.rol == 'waiter') {
            const waiter = await Waiter.findOne({ user: user._id });
            return res.json({ restaurantId: waiter.restaurant });
        } else {
            return res.status(401).json({ msg: 'User is not waiter' });
        }
    } catch (error) {
        return res.json({ msg: error.message })
    }
}
