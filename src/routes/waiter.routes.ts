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
        body('waiterEmail').isEmail().normalizeEmail().withMessage('The waiters email is invalid'),
        tokenIsValid,
        errorHandler,
    ],
    waiterController.createWaiter
)

router.put(
    '/',
    [
        body('waiterId').isMongoId().withMessage('WaiterId is not mongo Id'),
        body('isAvailable').isBoolean().withMessage('isAvailable value is not boolean'),
        tokenIsValid,
        errorHandler
    ],
    waiterController.updateWaiter
)

router.get(
    '/getWaiters',
    [tokenIsValid],
    waiterController.getAllWaiters
)



export default router