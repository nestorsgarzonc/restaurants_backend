import { Router } from 'express';
import { body } from 'express-validator';
import * as cashierController from '../controllers/cashier.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';

const router = Router();

router.get(
    '/:id',
    [tokenIsValid],
    cashierController.getCashier
)

router.post(
    '/',
    [
        body('cashierEmail').isEmail().normalizeEmail().withMessage('The cashiers email is invalid'),
        body('adminId').trim(),
        tokenIsValid,
        errorHandler,
    ],
    cashierController.createCashier
)

router.put(
    '/',
    [
        body('waiterId').isMongoId().withMessage('cashieerId is not mongo Id'),
        body('isAvailable').isBoolean().withMessage('isAvailable value is not boolean'),
        tokenIsValid,
        errorHandler
    ],
    cashierController.updateCashier
)

router.get(
    '/getCashiers',
    [tokenIsValid],
    cashierController.getAllCashiers
)



export default router