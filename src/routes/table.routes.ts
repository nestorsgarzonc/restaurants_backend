import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';

const router = Router();

//TODO: MAKE WITH SOCKETS
router.get(
    '/get-users-by-table',
    userController.getUser
)

router.put(
    '/get-user-orders',
    userController.updateUser
)

export default router