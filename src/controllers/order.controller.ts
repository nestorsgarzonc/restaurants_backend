import { Request, Response, NextFunction } from 'express';

export const getOrderDetail = async (req: Request, res: Response) => {

}


export const getRestaurantOrders = async (req: Request, res: Response) => {
    const restaurantId = req.query.restaurantId;
    const orderId = req.params.id;
}

export const createOrder = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const restaurantId = req.body.restaurantId;
    const status = req.body.status;
    const totalPrice = req.body.totalPrice;
}
