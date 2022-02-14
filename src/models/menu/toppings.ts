import { Schema, model, Types } from 'mongoose';

interface Toppings {
    name: String;
    type: String;
    options: Types.ObjectId[];
    minOptions?: Number;
    maxOptions?: Number;
}

const scheme = new Schema<Toppings>({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    options: [{
        type: Schema.Types.ObjectId,
        ref: 'ToppingOption',
        required: true
    }],
    minOptions: {
        type: Number,
        required: false
    },
    maxOptions: {
        type: Number,
        required: false
    }
});

export default model<Toppings>('Toppings', scheme);