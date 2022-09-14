import { Schema, model, Types } from 'mongoose';

interface Categories {
    name: String;
    imgUrl?: String;
    menuItems: Types.ObjectId[];
    isAvaliable: Boolean;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<Categories>({
    name: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: false
    },
    menuItems: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        default: []
    }],
    isAvaliable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default model<Categories>('Categories', scheme);