import { Router } from 'express';
import { body } from 'express-validator';
import * as restaurantController from '../controllers/restaurant.controller';

const router = Router()

router.get(
    '/:id',
    restaurantController.getRestaurant
)

router.post(
    '/',
    [
        body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('phone').isLength({ min: 3 }).withMessage('Phone must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email'),
    ],
    restaurantController.createRestaurant
)

router.put(
    '/:id',
    [
        body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('phone').isLength({ min: 3 }).withMessage('Phone must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email'),
    ],
    restaurantController.updateRestaurant
)

router.get(
    '/:id/tables',
    restaurantController.getTables
)

router.get(
    '/:id/waiters',
    restaurantController.getWaiters
)

router.get(
    '/:id/orders',
    restaurantController.getOrders
)

router.get(
    '/:id/menu',
    restaurantController.getMenu
)

export default router