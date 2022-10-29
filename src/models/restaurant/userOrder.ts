import { Schema, model, Types } from 'mongoose';

interface UserOrder {
    userId: Types.ObjectId;
    orderProducts: Types.ObjectId[];
    price: Number;
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<UserOrder>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    orderProducts: [{
        type: Object,
        ref: 'OrderProduct',
    }],
    price: {
        type: Number,
        required: true,
        default: 0
    },
    
}, { timestamps: true });

export default model<UserOrder>('UserOrder', scheme);