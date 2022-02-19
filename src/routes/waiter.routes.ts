import { Router } from 'express';
import { body } from 'express-validator';
import * as waiterController from '../controllers/waiter.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';

const router = Router();

router.get(
    '/:id',
    [tokenIsValid],
    waiterController.getWaiter
)

router.post(
    '/:id',
    [
        body('restaurantId').isMongoId(),
        tokenIsValid,
    ],
    waiterController.createWaiter
)

export default router