import { Schema, model, Types } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

interface Restaurant {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    description: string;
    imageUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    menu: Types.ObjectId,
    owner: Types.ObjectId,
    tables: Types.ObjectId[];
    waiters: Types.ObjectId[];
}

const schema = new Schema<Restaurant>({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
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
    menu: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
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
})

schema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

export default model<Restaurant>('Restaurant', schema);