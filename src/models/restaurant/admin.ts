import { Schema, model, Types } from 'mongoose';

interface Admin {
    user: Types.ObjectId;
    restaurants: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<Admin>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurants: [{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        default: []
    }]
}, { timestamps: true });

export default model<Admin>('Admin', schema);