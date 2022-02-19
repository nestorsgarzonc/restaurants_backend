import { Schema, model, Types } from 'mongoose';

interface MenuItem {
    name: String;
    price: Number;
    imgUrl?: String;
    toppings: Types.ObjectId[];
    isAvaliable: Boolean;
    discount?: Number;
}

const scheme = new Schema<MenuItem>({
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
    },
    toppings: [{
        type: Schema.Types.ObjectId,
        ref: 'Toppings',
        required: true
    }],
    isAvaliable: {
        type: Boolean,
        default: true,
    },
    discount: {
        type: Number,
        required: false
    }
});

export default model<MenuItem>('MenuItem', scheme);