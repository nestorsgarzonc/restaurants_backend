import { Router } from "express";
import { tokenIsValid } from "../middlewares/auth.middleware";
import * as menuController from '../controllers/menu.controller';
import { errorHandler } from "../middlewares/errors.middleware";
import { body } from "express-validator";

const router = Router()

router.get(
    '/',
    [tokenIsValid],
    menuController.getAllMenus,
)

router.get(
    '/:id',
    [tokenIsValid],
    menuController.getRestaurantMenu,
)

router.post(
    '/:restaurantId',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('imgUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        body('toppings').isArray().withMessage('Invalid menu'),
        body('isAvaliable').isBoolean().withMessage('Invalid option'),
        body('discount').isNumeric().withMessage('Discount must be a number').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.createMenu,
)

router.put(
    '/:id',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long').optional({ nullable: true }),
        body('price').isNumeric().withMessage('Price must be a number').optional({ nullable: true }),
        body('imgUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        body('toppings').isArray().withMessage('Invalid menu').optional({ nullable: true }),
        body('isAvaliable').isBoolean().withMessage('Invalid option').optional({ nullable: true }),
        body('discount').isNumeric().withMessage('Discount must be a number').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.updateMenu,
)

router.delete(
    '/:id',
    [tokenIsValid],
    menuController.deleteMenu,
)

router.get(
    '/toppings/:id',
    [tokenIsValid],
    menuController.getMenuToppings,
)

router.post(
    '/toppings/:menuId',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('type').trim().isLength({ min: 1 }).withMessage('Type must be at least 1 characters long'),
        body('options').isArray().withMessage('Invalid options'),
        body('minOptions').isNumeric().withMessage('Min toppings must be a number').optional({ nullable: true }),
        body('maxOptions').isNumeric().withMessage('Max toppings must be a number').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.addToppingToMenu,
)

router.delete(
    '/:menuId/toppings/:toppingId',
    [tokenIsValid],
    menuController.deleteToppingFromMenu,
)

export default router