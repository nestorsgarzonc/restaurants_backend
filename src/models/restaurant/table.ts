import { Schema, model, Types } from 'mongoose';

interface Table {
    name: String;
    capacity: Number;
    restaurantId: Types.ObjectId;
    status: String;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<Table>({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        default: 4
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    //TODO: ADD orderStatus: ['empty', ]

}, { timestamps: true });

export default model<Table>('Table', schema);