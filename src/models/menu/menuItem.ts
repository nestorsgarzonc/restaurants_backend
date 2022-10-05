import { Schema, model, Types } from 'mongoose';

interface MenuItem {
    name: String;
    price: Number;
    description: String;
    imgUrl?: String;
    toppings: Types.ObjectId[];
    taxes?: Number;
    categoryId: Types.ObjectId;
    isAvaliable: Boolean;
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
    imgUrl: {
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
    isAvaliable: {
        type: Boolean,
        default: true,
    },
    discount: {
        type: Number,
        required: false
    }
}, { timestamps: true });

export default model<MenuItem>('MenuItem', scheme);