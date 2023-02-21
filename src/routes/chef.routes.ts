import { Router } from 'express';
import { body,param } from 'express-validator';
import * as chefController from '../controllers/chef.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';

const router = Router();

router.get(
    '/:id',
    param('id').isMongoId().withMessage('ChefId is not mongo Id'),
    [tokenIsValid],
    chefController.getChef
)

router.post(
    '/',
    [
        body('cashierEmail').isEmail().normalizeEmail().withMessage('The chefs email is invalid'),
        tokenIsValid,
        errorHandler,
    ],
    chefController.createChef
)

router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('ChefId is not mongo Id'),
        body('isAvailable').isBoolean().withMessage('isAvailable value is not boolean'),
        tokenIsValid,
        errorHandler
    ],
    chefController.updateChef
)

router.delete(
    '/:id',
    [
        param('id').isMongoId().withMessage('chefId is not mongo Id'),
        tokenIsValid,
        errorHandler
    ],
    chefController.deleteChef
)

router.get(
    '/',
    [tokenIsValid],
    chefController.getAllChefs
)



export default router