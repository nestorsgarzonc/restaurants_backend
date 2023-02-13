import { Router } from "express";
import { tokenIsValid } from "../middlewares/auth.middleware";
import * as menuController from '../controllers/menu.controller';
import { errorHandler } from "../middlewares/errors.middleware";
import { body,param } from "express-validator";
import { checkAdmin } from "../middlewares/checkAdmin.middleware";

const router = Router()

router.get(
    //TODO: Why?
    '/',
    [tokenIsValid],
    menuController.getAllMenus,
)

router.get(
    '/get-menu/',
    menuController.getRestaurantMenuWithRestaurantId
)

router.get(
    //TODO: get all menu
    '/:tableId',
    menuController.getRestaurantMenu,
)



router.post(
    //This is where I create a category
    '/category',
    [
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        body('description').trim().optional({nullable:true}),
        tokenIsValid,
        errorHandler,
    ],
    menuController.createCategory,
)

router.put(
    '/category/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        body('description').trim().optional({nullable:true}),
        tokenIsValid,
        errorHandler,
    ],
    menuController.updateCategory,
)

router.put(
    '/category/available/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid,
        errorHandler,
    ],
    menuController.availableCategory
)

router.post(
    '/category/reorder/',
    [
        body('categoryId').isMongoId().withMessage('Category Id is not a mongo Id'),
        body('newIndex').isNumeric().withMessage('Invalid array position'),
        tokenIsValid,
        errorHandler
    ],
    menuController.changeCategoryOrder
)


//TODO: Arreglar el tema de las imágenes
router.delete(
    //This is where I create a category
    '/category/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        body('description').trim().optional({nullable:true}),
        tokenIsValid,
        errorHandler,
    ],
    menuController.deleteCategory
)


router.post(
    '/item/:categoryId',
    [
        param('categoryId').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long').optional({ nullable: true }),
        body('price').isNumeric().withMessage('Price must be a number').optional({ nullable: true }),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        body('toppings').isArray().withMessage('Invalid menu').optional({ nullable: true }),
        body('isAvailable').isBoolean().withMessage('Invalid option').optional({ nullable: true }),
        body('discount').isNumeric().withMessage('Discount must be a number').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.createMenu,
)

router.put(
    '/item/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long').optional({ nullable: true }),
        body('price').isNumeric().withMessage('Price must be a number').optional({ nullable: true }),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        body('toppings').isArray().withMessage('Invalid menu').optional({ nullable: true }),
        body('isAvailable').isBoolean().withMessage('Invalid option').optional({ nullable: true }),
        body('discount').isNumeric().withMessage('Discount must be a number').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.updateMenu,
)

router.put(
    '/item/available/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid,
        errorHandler,
    ],
    menuController.availableMenu
)

router.delete(
    '/item/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid,
        errorHandler
    ],
    menuController.deleteMenu
)


router.post(
    '/item/reorder',
    [
        body('categoryId').isMongoId().withMessage('Category id is not a mongo Id'),
        body('newIndex').isNumeric().withMessage('Invalid array position'),
        body('menuItemId').isMongoId().withMessage('Item id is not a mongo Id'),
        tokenIsValid,
        errorHandler
    ],
    menuController.changeMenuOrder
)


router.get(
    '/toppings/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id')
    ],
    menuController.getMenuToppings,
)

router.get(
    '/toppingOptions/',
    [tokenIsValid],
    menuController.getAllToppings
)

router.post(
    '/toppings/:menuId',
    [
        param('menuId').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('type').trim().isLength({ min: 1 }).withMessage('Type must be at least 1 characters long'),
        body('options').isArray().withMessage('Invalid options').optional({ nullable: true }),
        body('minOptions').isNumeric().withMessage('Min toppings must be a number').optional({ nullable: true }),
        body('maxOptions').isNumeric().withMessage('Max toppings must be a number').optional({ nullable: true }),
        body('isAvailable').isBoolean().withMessage('Availability must be a boolean').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.addToppingToMenu,
)

router.put(
    '/toppings/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('type').trim().isLength({ min: 1 }).withMessage('Type must be at least 1 characters long'),
        body('options').isArray().withMessage('Invalid options').optional({ nullable: true }),
        body('menuId').isMongoId().withMessage('Invalid menu Id'),
        body('minOptions').isNumeric().withMessage('Min toppings must be a number').optional({ nullable: true }),
        body('maxOptions').isNumeric().withMessage('Max toppings must be a number').optional({ nullable: true }),
        body('isAvailable').isBoolean().withMessage('Availability must be a boolean').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.updateTopping,
)

router.put(
    '/toppings/available/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid,
        errorHandler,
    ],
    menuController.availableTopping
)

router.delete(
    //TODO: update this and the other deletes methods haha
    '/toppings/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid
    ],
    menuController.deleteToppingFromMenu,
)

router.post(
    '/option/:toppingId',
    [
        param('toppingId').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('price').isNumeric().withMessage('Price must be a number').optional({ nullable: true }),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.addToppingOptionToTopping,
)

router.put(
    '/option/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
        body('price').isNumeric().withMessage('Price must be a number').optional({ nullable: true }),
        body('img').isBase64().withMessage('Invalid image format').optional({ nullable: true }),
        tokenIsValid,
        errorHandler,
    ],
    menuController.updateOption,
)

router.put(
    '/option/available/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid,
        errorHandler,
    ],
    menuController.availableOption
)

router.delete(
    //TODO: update this and the other deletes methods haha
    '/option/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        tokenIsValid
    ],
    menuController.deleteOption,
)

router.put(
    '/setDiscount/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('discount').isNumeric().withMessage('discount must be a number').optional({ nullable: true }),
        tokenIsValid,
        // checkAdmin
    ],
    menuController.setDiscount
)

router.put(
    '/menuItemAvailability/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('isAvailable').isBoolean().withMessage('Availability must be a boolean').optional({ nullable: true }),
        tokenIsValid,
        checkAdmin
    ],
    //menuController.setMenuItemAvailability
)

router.put(
    '/toppingAvailability/:id',
    [
        param('id').isMongoId().withMessage('Path param is not a mongo Id'),
        body('isAvailable').isBoolean().withMessage('Availability must be a boolean').optional({ nullable: true }),
        tokenIsValid,
        checkAdmin
    ],
    //menuController.setToppingAvailability
)

export default router