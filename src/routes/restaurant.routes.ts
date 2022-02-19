import { Router } from 'express';
import { body } from 'express-validator';
import * as restaurantController from '../controllers/restaurant.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';

const router = Router()

router.get(
    '/:id',
    [tokenIsValid],
    restaurantController.getRestaurant
)

router.post(
    '/',
    [
        body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('phone').isLength({ min: 3 }).withMessage('Phone must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email'),
        tokenIsValid,
    ],
    restaurantController.createRestaurant
)

router.put(
    '/:id',
    [
        body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('phone').isLength({ min: 3 }).withMessage('Phone must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email'),
        tokenIsValid,
    ],
    restaurantController.updateRestaurant
)

router.get(
    '/:id/tables',
    [tokenIsValid],
    restaurantController.getTables
)

router.get(
    '/:id/waiters',
    [tokenIsValid],
    restaurantController.getWaiters
)

router.get(
    '/:id/orders',
    [tokenIsValid],
    restaurantController.getOrders
)

router.get(
    '/:id/menu',
    [tokenIsValid],
    restaurantController.getMenu
)

export default router