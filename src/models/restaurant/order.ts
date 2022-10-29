import { Schema, model, Types } from 'mongoose';

interface Order {
    usersOrder: Types.ObjectId[];
    tableId: Types.ObjectId;
    totalPrice: Number;
    restaurantId: Types.ObjectId;
    waiterId: Types.ObjectId;
    tip: Number;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<Order>(
    {
        usersOrder: [{
            type: Schema.Types.ObjectId,
            ref: 'UserOrder',
            required: true
        }],
        tableId: {
            type: Schema.Types.ObjectId,
            ref: 'Table',
            required: true
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        waiterId: {
            type: Schema.Types.ObjectId,
            ref: 'Waiter',
            required: false
        },
        tip: {
            type: Number,
            required: true,
            default: 0
        }
    }, { timestamps: true }
);

export default model<Order>('Order', scheme);