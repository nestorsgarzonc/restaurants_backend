import { Schema, model, Types } from 'mongoose';

interface ToppingOption {
    name: String;
    price: Number;
    imgUrl?: String;
    toppingId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<ToppingOption>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    imgUrl: {
        type: String,
        required: false
    },
    toppingId:{
        type: Schema.Types.ObjectId,
        reference: 'Toppings',  
        required: true
    }
}, { timestamps: true });

export default model<ToppingOption>('ToppingOption', scheme);