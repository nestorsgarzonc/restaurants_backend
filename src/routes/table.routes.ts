import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import * as tableController from '../controllers/table.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';
import { checkAdmin } from '../middlewares/checkAdmin.middleware';

const router = Router();

router.post(
    '/',
    [
        body('name').trim().isLength({ min: 1 }).withMessage('Name must be at least 1 characters long'),
        tokenIsValid,
        checkAdmin,
        errorHandler,
    ],
    tableController.createTable
)

router.put(
    '/',
    [
        body('tableId').trim().isMongoId().withMessage('Invalid tableId'),
        tokenIsValid,
        checkAdmin,
        errorHandler,
    ],
    tableController.editTable
)

router.delete(
    '/',
    [
        body('tableId').trim().isMongoId().withMessage('Invalid tableId'),
        tokenIsValid,
        checkAdmin,
        errorHandler
    ],
    tableController.deleteTable
)

router.get(
    '/',
    [
        body('tableId').trim().isMongoId().withMessage('Invalid tableId'),
        tokenIsValid,
        checkAdmin,
        errorHandler
    ],
    tableController.getTable
)

//TODO: MAKE WITH SOCKETS
router.post(
    '/get-users-by-table',
    [
        body('tableId').isMongoId(),
        tokenIsValid,
        errorHandler],
    tableController.getUsersByTable
)

router.put(
    //We´re not using this LOL
    '/get-user-orders',
    [
        body('tableId').isMongoId(),
        tokenIsValid,
        errorHandler],
    userController.updateUser
)

export default router