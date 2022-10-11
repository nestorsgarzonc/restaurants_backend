import { Schema, model, Types } from 'mongoose';

interface UserOrder {
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    tableId: Types.ObjectId;
    orderProducts: Types.ObjectId[];
    status: String;
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
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    
    orderProducts: [{
        type: Object,
        required: true
    }],
    status: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    
}, { timestamps: true });

export default model<UserOrder>('UserOrder', scheme);