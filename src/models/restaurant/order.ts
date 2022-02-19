import { Schema, model, Types } from 'mongoose';

interface Order {
    usersOrder: Types.ObjectId[];
    status: String;
    totalPrice: Number;
    restaurantId: String;
}

const scheme = new Schema<Order>({
    usersOrder: [{
        type: Schema.Types.ObjectId,
        ref: 'UserOrder',
        required: true
    }],
    status: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    restaurantId: {
        type: String,
        required: true
    }
});

export default model<Order>('Order', scheme);