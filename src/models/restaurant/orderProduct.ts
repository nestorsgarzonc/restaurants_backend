import { Schema, model, Types } from 'mongoose';

interface OrderProduct{
    productId: Types.ObjectId;
    toppings: Types.ObjectId[];
    price: Number;
}

const scheme = new Schema<OrderProduct>({

    productId: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    toppings: [{
        type: Schema.Types.ObjectId,
        ref: 'OrderTopping',
    }],
    price: {
        type: Number,
        required: true
    },

}, { timestamps: true });

export default model<OrderProduct>('OrderProduct', scheme);

