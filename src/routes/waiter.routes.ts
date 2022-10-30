import { Router } from 'express';
import { body } from 'express-validator';
import * as waiterController from '../controllers/waiter.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';

const router = Router();

router.get(
    '/:id',
    [tokenIsValid],
    waiterController.getWaiter
)

router.post(
    '/',
    [
        body('restaurantId').isMongoId(),
        body('waiterEmail').isEmail().normalizeEmail().withMessage('The waiters email is invalid'),
        body('adminId').trim(),
        tokenIsValid,
        errorHandler,
    ],
    waiterController.createWaiter
)



export default router