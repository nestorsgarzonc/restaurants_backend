import { Router } from 'express';
import { body } from 'express-validator';
import * as waiterController from '../controllers/waiter.controller';

const router = Router();

router.get(
    '/:id',
    waiterController.getWaiter
)

router.post(
    '/:id',
    waiterController.createWaiter
)

export default router