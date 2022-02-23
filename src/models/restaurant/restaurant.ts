import { Schema, model, Types } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

interface Restaurant {
    address: String;
    createdAt: Date;
    description: String;
    email: String;
    imageUrl?: String;
    menu: Types.ObjectId[],
    name: String;
    owner: Types.ObjectId,
    phone: Number;
    primaryColor?: String;
    secondaryColor?: String;
    tables: Types.ObjectId[];
    updatedAt: Date;
    waiters: Types.ObjectId[];
}

const schema = new Schema<Restaurant>({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    primaryColor: {
        type: String,
    },
    secondaryColor: {
        type: String,
    },
    imageUrl: {
        type: String,
        required: false
    },
    menu: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tables: [{
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    }],
    waiters: [{
        type: Schema.Types.ObjectId,
        ref: 'Waiter',
        required: true
    }]
}, { timestamps: true })

schema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

export default model<Restaurant>('Restaurant', schema);