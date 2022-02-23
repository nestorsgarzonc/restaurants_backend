import { Schema, model, Types } from 'mongoose';

interface UserOrder {
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    tableId: Types.ObjectId;
    waiterId: Types.ObjectId;
    itemsIds: Types.ObjectId[];
    status: String;
    price: Number;
    tip: Number;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<UserOrder>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    waiterId: {
        type: Schema.Types.ObjectId,
        ref: 'Waiter',
        required: true
    },
    itemsIds: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    }],
    status: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    tip: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

export default model<UserOrder>('UserOrder', scheme);