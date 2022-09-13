import { Router } from "express";
import { tokenIsValid } from "../middlewares/auth.middleware";
import * as menuController from '../controllers/menu.controller';
import { errorHandler } from "../middlewares/errors.middleware";
import { body } from "express-validator";

const router = Router()

router.get(
    //TODO: Why?
    '/',
    [tokenIsValid],
    menuController.getAllMenus,
)

router.get(
    //TODO: get all menu
    '/:restaurantId',
    [tokenIsValid],
    menuController.getRestaurantMenu,
)

router.post(
    //This is where I create a category
    '/:restaurantId',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('imgUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.createCategory,
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


router.post(
    //This is where I create a category
    '/category/:categoryId',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('imgUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.createMenu,
)


router.get(
    '/toppings/:id',
    [tokenIsValid],
    menuController.getMenuToppings,
)

router.post(
    '/menuitem/:menuId',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('type').trim().isLength({ min: 1 }).withMessage('Type must be at least 1 characters long'),
        body('options').isArray().withMessage('Invalid options').optional({nullable: true}),
        body('minOptions').isNumeric().withMessage('Min toppings must be a number').optional({ nullable: true }),
        body('maxOptions').isNumeric().withMessage('Max toppings must be a number').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.addToppingToMenu,
)

router.delete(
    //TODO: update this and the other deletes methods haha
    '/:menuId/toppings/:toppingId',
    [tokenIsValid],
    menuController.deleteToppingFromMenu,
)

router.post(
    '/topping/:toppingId',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('price').isNumeric().withMessage('Price must be a number').optional({ nullable: true }),
        body('imgUrl').isURL().withMessage('Invalid image url').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.addToppingOptionToTopping,
)

export default router