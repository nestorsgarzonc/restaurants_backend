import { Schema, model, Types } from 'mongoose';

interface UserOrder {
    user: Types.ObjectId;
    restaurant: Types.ObjectId;
    table: Types.ObjectId;
    waiter: Types.ObjectId;
    items: Types.ObjectId[];
    status: string;
    price: Number;
    tip: Number;
}

const scheme = new Schema<UserOrder>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    table: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    waiter: {
        type: Schema.Types.ObjectId,
        ref: 'Waiter',
        required: true
    },
    items: [{
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
});

export default model<UserOrder>('UserOrder', scheme);