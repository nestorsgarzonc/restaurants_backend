import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';

const router = Router()

router.get(
    '/:id',
    [tokenIsValid],
    orderController.getOrderDetail
)


//Pass restaurant id as query param
router.get(
    '/:id/restaurant',
    [tokenIsValid],
    orderController.getRestaurantOrders
)

router.post(
    '/',
    [
        body('userId').isMongoId(),
        body('restaurantId').isMongoId(),
        body('status').isString(),
        body('totalPrice').isNumeric(),
        tokenIsValid,
    ],
    orderController.createOrder
)

export default router