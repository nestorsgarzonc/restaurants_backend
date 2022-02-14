import { Schema, model, Types } from 'mongoose';

interface ToppingOption {
    name: String;
    price: Number;
    imgUrl?: String;
}

const scheme = new Schema<ToppingOption>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imgUrl: {
        type: String,
        required: false
    }
});

export default model<ToppingOption>('ToppingOption', scheme);