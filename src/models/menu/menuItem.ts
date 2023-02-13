import { Schema, model, Types } from 'mongoose';

interface MenuItem {
    name: String;
    price: Number;
    description: String;
    img?: String;
    toppings: Types.ObjectId[];
    taxes?: Number;
    categoryId: Types.ObjectId;
    isAvailable: Boolean;
    discount?: Number;
    createdAt: Date;
    updatedAt: Date;
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
    description:{
        type: String,
        required: true
    },
    img: {
        type: String,
        required: false
    },
    toppings: [{
        type: Schema.Types.ObjectId,
        ref: 'Toppings',
        default: []
    }],
    taxes: {
        type: Number,
        default: null
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    discount: {
        type: Number,
        required: false
    }
}, { timestamps: true });

export default model<MenuItem>('MenuItem', scheme);