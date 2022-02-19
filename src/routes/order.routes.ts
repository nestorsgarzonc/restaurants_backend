import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller';

const router = Router()

router.get(
    '/:id',
    orderController.getOrderDetail
)


//Pass restaurant id as query param
router.get(
    '/:id/restaurant',
    orderController.getRestaurantOrders
)

router.post(
    '/',
    [
        body('userId').isMongoId(),
        body('restaurantId').isMongoId(),
        body('status').isString(),
        body('totalPrice').isNumeric()
    ],
    orderController.createOrder
)

export default router