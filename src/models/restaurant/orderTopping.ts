import { Schema, model, Types } from 'mongoose';

interface OrderTopping{
    toppingId: Types.ObjectId;
    toppingOptions: Types.ObjectId[];
}

const scheme = new Schema<OrderTopping>({

    toppingId: {
        type: Schema.Types.ObjectId,
        ref: 'Toppings',
        required: true
    },
    toppingOptions: [{
        type: Schema.Types.ObjectId,
        ref: 'ToppingOption',
    }],

}, { timestamps: true });

export default model<OrderTopping>('OrderTopping', scheme);

