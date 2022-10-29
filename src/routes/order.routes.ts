import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';

const router = Router()

router.get(
    '/user-orders',
    [tokenIsValid],
    orderController.getOrders
)

router.get(
    '/user-orders/:id',
    [tokenIsValid],
    orderController.getUserOrder
)

router.get(
    '/:id',
    [tokenIsValid],
    orderController.getOrderDetail
)




//Pass restaurant id as query param
router.get(
    '/:restaurantId/restaurant',
    [tokenIsValid],
    orderController.getRestaurantOrders
)

router.post(
    '/table-order',
    [
        body('tableId').isMongoId(),
        body('tip').isNumeric(),
        tokenIsValid,
        errorHandler,
    ],
    orderController.payAccount
)

router.put(
    '/table-order/:id',
    [
        body('usersOrder').isMongoId().optional({ nullable: true }),
        body('restaurantId').isMongoId().optional({ nullable: true }),
        body('status').isString().optional({ nullable: true }),
        body('totalPrice').isNumeric().isFloat({ min: 0 }).optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    orderController.updateTableOrder
)

router.post(
    '/user-order',
    [
        body('userId').isMongoId(),
        body('restaurantId').isMongoId(),
        body('tableId').isMongoId(),
        body('waiterId').isMongoId(),
        body('itemsIds').isArray(),
        body('status').isString(),
        body('price').isNumeric().isFloat({ min: 0 }),
        body('tip').isNumeric().isFloat({ min: 0, max: 1 }),
        tokenIsValid,
        errorHandler,
    ],
    orderController.createUserOrder
)

router.put(
    '/user-order/:id',
    [
        body('userId').isMongoId().optional({ nullable: true }),
        body('restaurantId').isMongoId().optional({ nullable: true }),
        body('tableId').isMongoId().optional({ nullable: true }),
        body('waiterId').isMongoId().optional({ nullable: true }),
        body('itemsIds').isArray().optional({ nullable: true }),
        body('status').isString().optional({ nullable: true }),
        body('price').isNumeric().isFloat({ min: 0 }).optional({ nullable: true }),
        body('tip').isNumeric().isFloat({ min: 0, max: 1 }).optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    orderController.updateUserOrder
)

export default router