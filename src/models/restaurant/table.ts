import { Schema, model, Types } from 'mongoose';

class Table {
    name: String;
    restaurantId: Types.ObjectId;
    status: String;
    createdAt: Date;
    updatedAt: Date;
}

export enum TableStatus {
    Empty = 'empty', 
    Ordering = 'ordering', 
    ConfirmOrder = 'confirm_order',
    OrderConfirmed = 'order_confirmed',
    Eating = 'eating', 
    Paying = 'paying'
}

const schema = new Schema<Table>({
    name: {
        type: String,
        required: true
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    status: {
        type: String,
        required: false,
        default: TableStatus.Empty,
        enum: [TableStatus.Empty, TableStatus.Ordering, TableStatus.ConfirmOrder, TableStatus.OrderConfirmed, TableStatus.Eating, TableStatus.Paying]
    },
    
}, { timestamps: true });

export default model<Table>('Table', schema);