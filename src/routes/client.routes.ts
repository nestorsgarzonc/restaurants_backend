import { Router } from 'express';
import { body,param } from 'express-validator';
import { tokenIsValid } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/errors.middleware';
import * as clientController from '../controllers/client.controller';
const router = Router();


router.post(
    '/',
    [
        body('email').isEmail().normalizeEmail().withMessage('The email is invalid'),
        errorHandler,
    ],
    clientController.addClientEmail
)



export default router