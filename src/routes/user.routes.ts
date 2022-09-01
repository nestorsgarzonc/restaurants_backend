import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';

const router = Router();

router.get(
    '/get-user',
    [tokenIsValid],
    userController.getUser
)

router.put(
    '/update-user',
    [tokenIsValid],
    userController.updateUser
)

export default router;