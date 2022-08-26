import * as jwt from "jsonwebtoken";

export const getToken = (userId: String) => {
    return jwt.sign(
        { userId },
        'process.env.JWT_SECRET',
        { expiresIn: process.env.TOKEN_DURATION }
    )
}