import { Schema, model, Types } from 'mongoose';

interface Table {
    name: string;
    capacity: number;
    restaurant: Types.ObjectId;
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
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    }
}, { timestamps: true });

export default model<Table>('Table', schema);