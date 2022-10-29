import { Schema, model, Types } from 'mongoose';

interface OrderToppingOption{
    toppingOptionId: Types.ObjectId;
    price: Number;
}

const scheme = new Schema<OrderToppingOption>({

    toppingOptionId: {
        type: Schema.Types.ObjectId,
        ref: 'ToppingOption',
        required: true
    },
    price: {
        type: Number,
        required: true
    },

}, { timestamps: true });

export default model<OrderToppingOption>('OrderToppingOption', scheme);