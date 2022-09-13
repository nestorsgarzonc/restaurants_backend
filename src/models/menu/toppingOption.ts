import { Schema, model, Types } from 'mongoose';

interface ToppingOption {
    name: String;
    price: Number;
    imgUrl?: String;
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
    }
}, { timestamps: true });

export default model<ToppingOption>('ToppingOption', scheme);