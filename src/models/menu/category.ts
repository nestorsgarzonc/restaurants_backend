import { Schema, model, Types } from 'mongoose';

interface Category {
    name: String;
    img?: String;
    description: String;
    menuItems: Types.ObjectId[];
    restaurantId: Types.ObjectId;
    isAvailable: Boolean;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<Category>({
    name: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: false
    },
    description:{
        type: String,
        default: ""
    },
    restaurantId:{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    menuItems: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        default: []
    }],
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default model<Category>('Category', scheme);