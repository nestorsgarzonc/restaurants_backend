import { Schema, model, Types } from 'mongoose';

interface Toppings {
    name: String;
    type: String;
    options: Types.ObjectId[];
    minOptions?: Number;
    maxOptions?: Number;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<Toppings>({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['checkBox', 'radioButton']
    },
    options: [{
        type: Schema.Types.ObjectId,
        ref: 'ToppingOption',
        default: []
    }],
    minOptions: {
        type: Number,
        required: false,
        default: 0
    },
    maxOptions: {
        type: Number,
        required: false,
        default: 1
    }
}, { timestamps: true });

export default model<Toppings>('Toppings', scheme);