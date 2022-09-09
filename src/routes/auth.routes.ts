import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';

const router = Router();


router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        errorHandler,
    ],
    authController.login,
);

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 5 })
            .withMessage('Password must be at least 5 characters long'),
        body('confirm-password').isLength({ min: 5 })
            .withMessage('Password must be at least 5 characters long'),
        body('firstName').isLength({ min: 1 }).withMessage('First name must be at least 1 character long'),
        body('lastName').isLength({ min: 1 }).withMessage('Last name must be at least 1 character long'),
        body('address').isLength({ min: 1 }).withMessage('Address must be at least 1 character long'),
        body('phone').isLength({min:10}).withMessage('You must add a valid phone number'),
        errorHandler,
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
        errorHandler,
    ],
    authController.resetPassword,
)

router.get(
    '/refresh-token',
    [tokenIsValid],
    authController.refreshToken,
)

export default router;