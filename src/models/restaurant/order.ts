import { Schema, model, Types } from 'mongoose';

interface Order {
    orders: Types.ObjectId[];
    status: String;
    totalPrice: Number;
}

const scheme= new Schema<Order>({
    orders: [{
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
    }
});

export default model<Order>('Order', scheme);