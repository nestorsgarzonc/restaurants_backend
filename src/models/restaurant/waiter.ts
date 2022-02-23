import { Schema, model, Types } from 'mongoose';

interface Waiter {
    user: Types.ObjectId;
    restaurant: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<Waiter>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    }
}, { timestamps: true });

export default model<Waiter>('Waiter', schema);