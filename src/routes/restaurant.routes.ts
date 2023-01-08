import { Router } from 'express';
import { body } from 'express-validator';
import * as restaurantController from '../controllers/restaurant.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';

const router = Router()

router.get(
    '/:id',
    [tokenIsValid],
    restaurantController.getRestaurant
)

router.get(
    '/',
    [tokenIsValid],
    restaurantController.getRestaurants
)

router.get(
    '/closer-restaurarts',
    [tokenIsValid],
    restaurantController.getCloserRestaurants
)

router.post(
    '/',
    [
        body('address').trim().isLength({ min: 3 }).withMessage('Address must be at least 3 characters long'),
        body('description').trim().isLength({ min: 3 }).withMessage('Description must be at least 3 characters long'),
        body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
        body('imageUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        body('logoUrl').isURL().withMessage('Invalid logo url').optional({ nullable: true }),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('owner').isMongoId().withMessage('Invalid owner'),
        body('phone').isNumeric().withMessage('Phone must be at least 3 characters long'),
        body('primaryColor').isHexColor().withMessage('Invalid primary color').optional({ nullable: true }),
        body('secondaryColor').isHexColor().withMessage('Invalid secondary color').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    restaurantController.createRestaurant
)

router.put(
    '/:id',
    [
        body('address').trim().isLength({ min: 3 }).withMessage('Address must be at least 3 characters long').optional({ nullable: true }),
        body('description').trim().isLength({ min: 3 }).withMessage('Description must be at least 3 characters long').optional({ nullable: true }),
        body('email').isEmail().normalizeEmail().withMessage('Invalid email').optional({ nullable: true }),
        body('imageUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        body('logoUrl').isURL().withMessage('Invalid logo url').optional({ nullable: true }),
        body('menu').isArray().withMessage('Invalid menu').optional({ nullable: true }),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long').optional({ nullable: true }),
        body('owner').isMongoId().withMessage('Invalid owner').optional({ nullable: true }),
        body('phone').isNumeric().withMessage('Phone must be at least 3 characters long').optional({ nullable: true }),
        body('primaryColor').isHexColor().withMessage('Invalid primary color').optional({ nullable: true }),
        body('secondaryColor').isHexColor().withMessage('Invalid secondary color').optional({ nullable: true }),
        body('tables').isArray().withMessage('Invalid menu').optional({ nullable: true }),
        body('waiters').isArray().withMessage('Invalid menu').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    restaurantController.updateRestaurant
)

/*router.get(
    '/:restaurantId/tables',
    [tokenIsValid],
    restaurantController.getTables
)

router.post(
    '/tables',
    [
        body('name').trim().isLength({ min: 1 }).withMessage('Name must be at least 1 characters long'),
        body('capacity').isNumeric().withMessage('Capacity must be a number'),
        body('restaurantId').isMongoId().withMessage('Invalid restaurant id'),
        body('status').isIn(['available', 'unavailable']).withMessage('Invalid status'),
        tokenIsValid,
        errorHandler,
    ],
    restaurantController.createTable
)

router.put(
    '/:tableId/tables',
    [tokenIsValid],
    restaurantController.updateTable
)

router.delete(
    '/:tableId/tables',
    [tokenIsValid],
    restaurantController.deleteTable
)

router.get(
    '/:id/waiters',
    [tokenIsValid],
    restaurantController.getWaiters
)

//router.post(
//    '/waiter/:userId',
//    [tokenIsValid],
//    restaurantController.createWaiter
//)

router.put(
    '/:id/waiter',
    [tokenIsValid],
    restaurantController.updateWaiter
)

router.delete(
    '/:id/waiter',
    [tokenIsValid],
    restaurantController.deleteWaiter
)

router.get(
    '/menu/:restaurantId',
    [tokenIsValid],
    restaurantController.getMenu
)

router.post(
    '/menu/:restaurantId',
    [tokenIsValid],
    restaurantController.createMenu
)

router.put(
    '/:id/menu',
    [tokenIsValid],
    restaurantController.updateMenu
)

router.delete(
    '/:id/menu',
    [tokenIsValid],
    restaurantController.deleteMenu
)

router.get(
    '/owner/:restaurantId/:userId',
    [tokenIsValid],
    restaurantController.getOwner
)
*/
export default router