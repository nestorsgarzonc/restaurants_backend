import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get(
    '/get-user',
    userController.getUser
)

router.put(
    '/update-user',
    userController.updateUser
)

export default router