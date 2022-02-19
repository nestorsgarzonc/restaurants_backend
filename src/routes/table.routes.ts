import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { tokenIsValid } from '../middlewares/auth.middleware';

const router = Router();

//TODO: MAKE WITH SOCKETS
router.get(
    '/get-users-by-table',
    [tokenIsValid],    
    userController.getUser
)

router.put(
    '/get-user-orders',
    [tokenIsValid],
    userController.updateUser
)

export default router