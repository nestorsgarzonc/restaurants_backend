import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';

const router = Router();

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],
    authController.login,
);

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],
    authController.register,
)

router.get(
    '/logout',
    [tokenIsValid],
    authController.logout,
)

router.put(
    '/reset-password',
    [
        body('email').isEmail().withMessage('Invalid email'),
    ],
    authController.resetPassword,
)

router.get(
    '/refresh-token',
    [tokenIsValid],
    authController.refreshToken,
)

export default router;